import React, { useState, useEffect } from 'react';

export const PageTransition = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Only run transition on component mount, not on every children change
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array - only run once on mount

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
    </div>
  );
};