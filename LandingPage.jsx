import React from 'react';
import { Music, History, Users, Zap, Award, Mic, BarChart } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">AURA-X: The Soul of Amapiano, Reimagined by AI.</h1>
        <p className="text-xl mb-8">Where Heritage Meets the Horizon. Create Authentic Amapiano in Seconds.</p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300">Start Creating for Free</button>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">You've Never Heard AI Like This.</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Cultural Time Machine */}
          <div className="bg-gray-800 p-8 rounded-lg">
            <History className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Cultural Time Machine</h3>
            <p>Travel through the history of Amapiano. Select a period and generate historically and culturally authentic tracks.</p>
          </div>
          {/* Aura Vocal Forge */}
          <div className="bg-gray-800 p-8 rounded-lg">
            <Mic className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Aura Vocal Forge (AVF)</h3>
            <p>Your voice is your instrument. Hum a melody and our engine will turn it into a perfectly pitched instrument.</p>
          </div>
          {/* VAST Architecture */}
          <div className="bg-gray-800 p-8 rounded-lg">
            <BarChart className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">VAST Architecture</h3>
            <p>Our Volumetric Audio Synthesis Technology processes audio in a way no other platform can, for faster, more creative results.</p>
          </div>
        </div>
      </section>

      {/* More Features Section */}
      <section className="py-20 px-4 bg-gray-800">
        <h2 className="text-4xl font-bold text-center mb-12">More Than a Tool. A Partner in Creation.</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <Award className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ethical AI</h3>
            <p>Our C2PA digital provenance system ensures every piece of AI-generated content is transparently sourced and tracked.</p>
          </div>
          <div className="text-center">
            <Music className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">DAW Integration</h3>
            <p>AURA-X fits seamlessly into your workflow. Use it as a standalone tool or integrate it with your favorite DAW.</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Community</h3>
            <p>Join a thriving community of Amapiano producers. Share your work, get feedback, and collaborate on new projects.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Pricing</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Starter</h3>
            <p className="text-4xl font-bold mb-4">Free</p>
            <ul className="text-left">
              <li>100 AI credits/month</li>
              <li>Basic audio processing</li>
              <li>Cultural Time Machine access</li>
            </ul>
          </div>
          {/* Professional */}
          <div className="bg-purple-600 p-8 rounded-lg text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Professional</h3>
            <p className="text-4xl font-bold mb-4">$29/mo</p>
            <ul className="text-left">
              <li>1,000 AI credits/month</li>
              <li>Advanced audio processing</li>
              <li>Aura Vocal Forge access</li>
              <li>DAW integration</li>
            </ul>
          </div>
          {/* Enterprise */}
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
            <p className="text-4xl font-bold mb-4">$99/mo</p>
            <ul className="text-left">
              <li>5,000 AI credits/month</li>
              <li>Unlimited processing</li>
              <li>Custom AI models</li>
              <li>API access</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="text-center py-20 px-4 bg-gray-800">
        <h2 className="text-4xl font-bold mb-4">The Future of Music is Here. Are You Ready?</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition duration-300">Sign Up and Start Creating</button>
      </section>
    </div>
  );
};

};


export default LandingPage;

