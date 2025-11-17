import React, { useState, useEffect } from 'react';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { NBButton } from '../UI/NeoBrutalUI';

/**
 * TutorialOverlay Component
 *
 * Stijn's popup frame that appears during tutorial
 * Shows tips with typewriter effect like cutscenes
 * Highlights specific areas when highlightArea is provided
 */
export const TutorialOverlay = ({
  message,
  onNext,
  onSkip,
  showNext = true,
  showSkip = true,
  position = 'bottom-left', // 'bottom-left', 'bottom-right', 'top-left', 'top-right'
  highlightArea = null // CSS selector for element to highlight
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [spotlightRect, setSpotlightRect] = useState(null);

  // Find and track highlighted element
  useEffect(() => {
    if (!highlightArea) {
      setSpotlightRect(null);
      return;
    }

    const updateSpotlight = () => {
      const element = document.querySelector(highlightArea);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        });
      }
    };

    // Initial position
    updateSpotlight();

    // Update on window resize
    window.addEventListener('resize', updateSpotlight);
    // Update periodically in case element moves
    const interval = setInterval(updateSpotlight, 100);

    return () => {
      window.removeEventListener('resize', updateSpotlight);
      clearInterval(interval);
    };
  }, [highlightArea]);

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
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 pointer-events-none"
        style={{ zIndex: 40 }}
      />

      {/* Circular spotlight on highlighted element */}
      {spotlightRect && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: spotlightRect.top - 20,
            left: spotlightRect.left - 20,
            width: spotlightRect.width + 40,
            height: spotlightRect.height + 40,
            border: '4px solid #22d3ee',
            borderRadius: '12px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px #22d3ee, inset 0 0 20px rgba(34, 211, 238, 0.2)',
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 41
          }}
        />
      )}

      {/* Stijn's Tutorial Frame */}
      <div
        className={`fixed ${positionClasses[position]} w-[600px] animate-slideInLeft`}
        style={{
          animation: 'slideInLeft 0.3s ease-out',
          zIndex: 50
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
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px #22d3ee, inset 0 0 20px rgba(34, 211, 238, 0.2);
          }
          50% {
            border-color: #06b6d4;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 50px #22d3ee, inset 0 0 30px rgba(34, 211, 238, 0.3);
          }
        }
      `}</style>
    </>
  );
};
