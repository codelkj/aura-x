"""
Plugin Management Routes
Upload, manage, enable/disable, and delete plugins
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/plugins", tags=["plugins"])

# Plugin storage directory
PLUGIN_DIR = "/home/ubuntu/amapiano-ai-platform/public/plugins"
PLUGIN_METADATA_FILE = os.path.join(PLUGIN_DIR, "plugin-metadata.json")

# Ensure plugin directory exists
os.makedirs(PLUGIN_DIR, exist_ok=True)

# ============================================================================
# Pydantic Models
# ============================================================================

class PluginMetadata(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    category: str = "effect"
    enabled: bool = True
    size: int
    uploadedAt: str
    filename: str

class PluginListResponse(BaseModel):
    plugins: List[PluginMetadata]

class PluginUploadResponse(BaseModel):
    success: bool
    id: str
    name: str
    message: str

# ============================================================================
# Helper Functions
# ============================================================================

def load_metadata():
    """Load plugin metadata from JSON file"""
    if os.path.exists(PLUGIN_METADATA_FILE):
        try:
            with open(PLUGIN_METADATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_metadata(metadata):
    """Save plugin metadata to JSON file"""
    with open(PLUGIN_METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=2)

def extract_plugin_info(content: str):
    """Extract plugin name and category from JavaScript content"""
    name = "Unknown Plugin"
    category = "effect"
    description = None
    
    # Try to find class name
    for line in content.split('\n'):
        # Look for class definition
        if 'class ' in line and 'Plugin' in line:
            parts = line.split('class ')[1].split(' ')[0].split('{')[0].strip()
            if parts:
                # Convert CamelCase to readable name
                name = ''.join([' ' + c if c.isupper() else c for c in parts]).strip()
                name = name.replace('Plugin', '').strip()
        
        # Look for category comment
        if '// Category:' in line or '// TYPE:' in line:
            category = line.split(':')[1].strip().lower()
        
        # Look for description comment
        if '// Description:' in line:
            description = line.split(':')[1].strip()
    
    return name, category, description

def generate_plugin_id(filename: str):
    """Generate plugin ID from filename"""
    # Remove .js extension and convert to kebab-case
    plugin_id = filename.replace('.js', '').lower()
    plugin_id = plugin_id.replace('_', '-').replace(' ', '-')
    return plugin_id

# ============================================================================
# Routes
# ============================================================================

@router.get("/list", response_model=PluginListResponse)
async def list_plugins():
    """Get list of all installed plugins"""
    metadata = load_metadata()
    plugins = []
    
    # Get all .js files in plugin directory
    for filename in os.listdir(PLUGIN_DIR):
        if filename.endswith('.js') and filename not in ['plugin-manager.js']:
            plugin_id = generate_plugin_id(filename)
            
            # Get metadata if exists, otherwise create default
            if plugin_id in metadata:
                plugin_data = metadata[plugin_id]
            else:
                # Create default metadata
                file_path = os.path.join(PLUGIN_DIR, filename)
                file_size = os.path.getsize(file_path)
                
                plugin_data = {
                    'id': plugin_id,
                    'name': plugin_id.replace('-', ' ').title(),
                    'description': 'No description',
                    'category': 'effect',
                    'enabled': True,
                    'size': file_size,
                    'uploadedAt': datetime.fromtimestamp(os.path.getmtime(file_path)).isoformat(),
                    'filename': filename
                }
                
                # Save to metadata
                metadata[plugin_id] = plugin_data
            
            plugins.append(PluginMetadata(**plugin_data))
    
    # Save updated metadata
    save_metadata(metadata)
    
    return PluginListResponse(plugins=plugins)

@router.post("/upload", response_model=PluginUploadResponse)
async def upload_plugin(plugin: UploadFile = File(...)):
    """Upload a new plugin"""
    
    # Validate file extension
    if not plugin.filename.endswith('.js'):
        raise HTTPException(status_code=400, detail="Only .js files are allowed")
    
    try:
        # Read file content
        content = await plugin.read()
        content_str = content.decode('utf-8')
        
        # Validate JavaScript syntax (basic check)
        if 'class' not in content_str or 'Plugin' not in content_str:
            raise HTTPException(
                status_code=400,
                detail="Invalid plugin file: Must contain a Plugin class"
            )
        
        # Generate plugin ID
        plugin_id = generate_plugin_id(plugin.filename)
        
        # Extract plugin info
        name, category, description = extract_plugin_info(content_str)
        
        # Save plugin file
        file_path = os.path.join(PLUGIN_DIR, plugin.filename)
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Create metadata
        metadata = load_metadata()
        metadata[plugin_id] = {
            'id': plugin_id,
            'name': name,
            'description': description or f"Custom {category} plugin",
            'category': category,
            'enabled': True,
            'size': len(content),
            'uploadedAt': datetime.utcnow().isoformat(),
            'filename': plugin.filename
        }
        save_metadata(metadata)
        
        # Update plugin-manager.js to register the plugin
        await register_plugin_in_manager(plugin_id, plugin.filename)
        
        return PluginUploadResponse(
            success=True,
            id=plugin_id,
            name=name,
            message=f"Plugin '{name}' uploaded successfully"
        )
    
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file encoding")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/{plugin_id}/enable")
async def enable_plugin(plugin_id: str):
    """Enable a plugin"""
    metadata = load_metadata()
    
    if plugin_id not in metadata:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    metadata[plugin_id]['enabled'] = True
    save_metadata(metadata)
    
    return JSONResponse(content={"success": True, "message": f"Plugin '{plugin_id}' enabled"})

@router.post("/{plugin_id}/disable")
async def disable_plugin(plugin_id: str):
    """Disable a plugin"""
    metadata = load_metadata()
    
    if plugin_id not in metadata:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    metadata[plugin_id]['enabled'] = False
    save_metadata(metadata)
    
    return JSONResponse(content={"success": True, "message": f"Plugin '{plugin_id}' disabled"})

@router.delete("/{plugin_id}")
async def delete_plugin(plugin_id: str):
    """Delete a plugin"""
    metadata = load_metadata()
    
    if plugin_id not in metadata:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    # Get filename
    filename = metadata[plugin_id]['filename']
    file_path = os.path.join(PLUGIN_DIR, filename)
    
    # Delete file
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Remove from metadata
    del metadata[plugin_id]
    save_metadata(metadata)
    
    # Remove from plugin-manager.js
    await unregister_plugin_from_manager(plugin_id, filename)
    
    return JSONResponse(content={"success": True, "message": f"Plugin '{plugin_id}' deleted"})

@router.get("/{plugin_id}/download")
async def download_plugin(plugin_id: str):
    """Download a plugin"""
    metadata = load_metadata()
    
    if plugin_id not in metadata:
        raise HTTPException(status_code=404, detail="Plugin not found")
    
    filename = metadata[plugin_id]['filename']
    file_path = os.path.join(PLUGIN_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Plugin file not found")
    
    return FileResponse(
        file_path,
        media_type="application/javascript",
        filename=filename
    )

# ============================================================================
# Plugin Manager Integration
# ============================================================================

async def register_plugin_in_manager(plugin_id: str, filename: str):
    """Register plugin in plugin-manager.js"""
    manager_path = os.path.join(PLUGIN_DIR, "plugin-manager.js")
    
    if not os.path.exists(manager_path):
        return
    
    try:
        with open(manager_path, 'r') as f:
            content = f.read()
        
        # Find the class name from filename
        class_name = ''.join([part.capitalize() for part in filename.replace('.js', '').split('-')]) + 'Plugin'
        
        # Check if already registered
        if f"'{plugin_id}'" in content and class_name in content:
            return
        
        # Find the initialization section
        init_marker = "// Initialize and register all plugins"
        if init_marker in content:
            # Add registration code
            registration_code = f"""
    // Auto-registered: {plugin_id}
    if (typeof {class_name} !== 'undefined') {{
      this.registerPluginClass('{plugin_id}', {class_name});
    }}
"""
            content = content.replace(init_marker, init_marker + registration_code)
            
            with open(manager_path, 'w') as f:
                f.write(content)
    
    except Exception as e:
        print(f"Failed to register plugin in manager: {e}")

async def unregister_plugin_from_manager(plugin_id: str, filename: str):
    """Unregister plugin from plugin-manager.js"""
    manager_path = os.path.join(PLUGIN_DIR, "plugin-manager.js")
    
    if not os.path.exists(manager_path):
        return
    
    try:
        with open(manager_path, 'r') as f:
            lines = f.readlines()
        
        # Remove registration lines
        new_lines = []
        skip_next = 0
        
        for line in lines:
            if skip_next > 0:
                skip_next -= 1
                continue
            
            if f"// Auto-registered: {plugin_id}" in line:
                skip_next = 3  # Skip the next 3 lines (if block)
                continue
            
            new_lines.append(line)
        
        with open(manager_path, 'w') as f:
            f.writelines(new_lines)
    
    except Exception as e:
        print(f"Failed to unregister plugin from manager: {e}")

