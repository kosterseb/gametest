import React, { useState, useEffect, useRef } from 'react';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { NBButton } from '../UI/NeoBrutalUI';

/**
 * TutorialOverlay Component
 *
 * Stijn's popup frame that appears during tutorial
 * Shows tips with typewriter effect like cutscenes
 */
export const TutorialOverlay = ({
  message,
  onNext,
  onSkip,
  showNext = true,
  showSkip = true,
  highlightArea = null, // CSS selector for element to highlight
  position = 'bottom-left' // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [spotlightStyle, setSpotlightStyle] = useState(null);

  // Typewriter effect
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < message.length) {
        setDisplayedText(message.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30); // 30ms per character

    return () => clearInterval(typeInterval);
  }, [message]);

  // Calculate spotlight position for highlighted elements
  useEffect(() => {
    if (!highlightArea) {
      setSpotlightStyle(null);
      return;
    }

    const element = document.querySelector(highlightArea);
    if (!element) {
      console.warn(`Tutorial: Could not find element with selector "${highlightArea}"`);
      setSpotlightStyle(null);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 12; // Padding around the highlighted element

    setSpotlightStyle({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + (padding * 2),
      height: rect.height + (padding * 2)
    });
  }, [highlightArea, message]); // Recalculate when message changes (step changes)

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  // Skip typewriter on click
  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(message);
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Spotlight overlay - dims everything except highlighted area */}
      {highlightArea && spotlightStyle && (
        <>
          {/* Dark overlay with cutout */}
          <div
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.75)'
            }}
          />
          {/* Spotlight box */}
          <div
            className="fixed z-41 pointer-events-none rounded-lg"
            style={{
              top: `${spotlightStyle.top}px`,
              left: `${spotlightStyle.left}px`,
              width: `${spotlightStyle.width}px`,
              height: `${spotlightStyle.height}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
              border: '3px solid #22d3ee',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </>
      )}
      {highlightArea && !spotlightStyle && (
        <div
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.75)'
          }}
        />
      )}

      {/* Stijn's Tutorial Frame */}
      <div
        className={`fixed ${positionClasses[position]} z-50 w-[600px] animate-slideInLeft`}
        style={{
          animation: 'slideInLeft 0.3s ease-out'
        }}
      >
        <div className="nb-bg-cyan nb-border-xl nb-shadow-xl overflow-hidden">
          {/* Header with Stijn's info */}
          <div className="nb-bg-white nb-border-b-lg px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-black" />
              <div>
                <div className="font-black text-black uppercase text-sm">Stijn</div>
                <div className="text-xs text-gray-600">Your Best Friend</div>
              </div>
            </div>
            {showSkip && (
              <button
                onClick={onSkip}
                className="text-black hover:text-red-600 transition-colors"
                aria-label="Skip tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main content area */}
          <div className="flex gap-4 p-4">
            {/* Stijn's Portrait */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-lg nb-border-md nb-shadow overflow-hidden nb-bg-white">
                <img
                  src="https://api.dicebear.com/9.x/notionists/svg?seed=stijn-friend"
                  alt="Stijn"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Dialogue Text */}
            <div className="flex-1 flex flex-col">
              <div
                className="flex-1 text-black font-bold text-lg leading-relaxed mb-4 cursor-pointer min-h-[120px]"
                onClick={handleSkipTyping}
              >
                {displayedText}
                {isTyping && <span className="animate-pulse">▋</span>}
              </div>

              {/* Action Buttons */}
              {!isTyping && (
                <div className="flex gap-2 justify-end animate-fadeIn">
                  {showNext && onNext && (
                    <NBButton
                      onClick={onNext}
                      variant="green"
                      size="md"
                      className="flex items-center gap-2"
                    >
                      Got it! <ChevronRight className="w-4 h-4" />
                    </NBButton>
                  )}
                  {showSkip && (
                    <NBButton
                      onClick={onSkip}
                      variant="white"
                      size="sm"
                    >
                      Skip Tutorial
                    </NBButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            border-color: #22d3ee;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 20px #22d3ee;
          }
          50% {
            border-color: #06b6d4;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 40px #22d3ee;
          }
        }
      `}</style>
    </>
  );
};
