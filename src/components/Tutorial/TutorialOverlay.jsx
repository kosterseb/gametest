import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { NBButton } from '../UI/NeoBrutalUI';

/**
 * TutorialOverlay Component
 *
 * Stijn's popup frame that appears during tutorial
 * Shows tips, instructions, and guidance
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
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  };

  return (
    <>
      {/* Highlight overlay for specific UI elements */}
      {highlightArea && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          {/* The highlighted area will be carved out via CSS */}
        </div>
      )}

      {/* Stijn's Tutorial Popup */}
      <div
        className={`fixed ${positionClasses[position]} z-50 max-w-md animate-slideInLeft`}
        style={{
          animation: 'slideInLeft 0.3s ease-out'
        }}
      >
        <div className="nb-bg-cyan nb-border-xl nb-shadow-xl overflow-hidden">
          <div className="flex items-start gap-4 p-4">
            {/* Stijn's Portrait */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg nb-border-md nb-shadow overflow-hidden nb-bg-white">
                <img
                  src="https://api.dicebear.com/9.x/notionists/svg?seed=stijn-friend"
                  alt="Stijn"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-black" />
                  <span className="font-black text-black uppercase text-sm">
                    Stijn's Tip
                  </span>
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

              {/* Message */}
              <p className="text-black font-bold text-base leading-relaxed mb-4">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                {showNext && (
                  <NBButton
                    onClick={onNext}
                    variant="green"
                    size="sm"
                    className="flex-1"
                  >
                    Got it!
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
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animation for slide in */}
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
      `}</style>
    </>
  );
};
