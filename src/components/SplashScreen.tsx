'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/popi-warning-app/Design/WIKE - Colors (Logo & App).jpg"
          alt="Popi Warning App Logo"
          width={120}
          height={120}
          className="rounded-lg shadow-lg"
          priority
        />
      </div>
      
      {/* App Name */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Popi Is Warning
      </h1>
      <h2 className="text-xl text-gray-600 mb-4 text-center">
        The Community
      </h2>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Community-driven warning and POI management
      </p>
      
      {/* Loading indicator */}
      <div className="mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}
