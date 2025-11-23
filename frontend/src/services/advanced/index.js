/**
 * Advanced Services - Professional-Grade Python Backend Integration
 * 
 * Zero Compromises - 95%+ Quality
 */

export { AdvancedTimeStretchService } from './AdvancedTimeStretchService';
export { MIDIHumanizationService } from './MIDIHumanizationService';
export { ArrangementAnalysisService } from './ArrangementAnalysisService';

// Singleton instances
let timeStretchService = null;
let humanizationService = null;
let arrangementService = null;

/**
 * Get AdvancedTimeStretchService instance
 */
export function getTimeStretchService() {
  if (!timeStretchService) {
    const { AdvancedTimeStretchService } = require('./AdvancedTimeStretchService');
    timeStretchService = new AdvancedTimeStretchService();
  }
  return timeStretchService;
}

/**
 * Get MIDIHumanizationService instance
 */
export function getHumanizationService() {
  if (!humanizationService) {
    const { MIDIHumanizationService } = require('./MIDIHumanizationService');
    humanizationService = new MIDIHumanizationService();
  }
  return humanizationService;
}

/**
 * Get ArrangementAnalysisService instance
 */
export function getArrangementService() {
  if (!arrangementService) {
    const { ArrangementAnalysisService } = require('./ArrangementAnalysisService');
    arrangementService = new ArrangementAnalysisService();
  }
  return arrangementService;
}

/**
 * Check if Python backend is available
 */
export async function checkPythonBackend() {
  try {
    const service = getTimeStretchService();
    const health = await service.checkHealth();
    return health.available;
  } catch (error) {
    console.error('Python backend check failed:', error);
    return false;
  }
}

export default {
  getTimeStretchService,
  getHumanizationService,
  getArrangementService,
  checkPythonBackend
};

