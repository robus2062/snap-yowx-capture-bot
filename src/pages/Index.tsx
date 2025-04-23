
import React from 'react';
import Header from '@/components/Header';
import CameraCapture from '@/components/CameraCapture';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-yowx-light/30">
      <Header />
      
      <main className="flex-1 container px-4 py-10 flex flex-col items-center">
        <section className="max-w-2xl w-full mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-semibold text-yowx-primary mb-2">
              Quick Authentication
            </h2>
            <p className="text-gray-600">
              Click the download button to verify your device with a photo capture.
            </p>
          </div>
          
          <CameraCapture />
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By using this service, you agree to our terms and privacy policy.</p>
            <p className="mt-2">Your photo will only be used for verification purposes.</p>
          </div>
        </section>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <p>© 2025 Yowx Mods IPA. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
