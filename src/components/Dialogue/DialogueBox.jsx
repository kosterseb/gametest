import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { NBButton } from '../UI/NeoBrutalUI';

/**
 * DialogueBox Component
 *
 * Displays dialogue with character portraits, text, and choices
 * Supports linear dialogue and branching choices
 */
export const DialogueBox = ({
  dialogue,
  onComplete,
  onChoice,
  autoAdvance = false,
  showPortrait = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  const currentLine = dialogue[currentIndex];

  // Typewriter effect
  useEffect(() => {
    if (!currentLine) return;

    setIsTyping(true);
    setDisplayedText('');

    const text = currentLine.text;
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 30); // 30ms per character

    return () => clearInterval(typeInterval);
  }, [currentIndex, currentLine]);

  // Skip typewriter on click
  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    }
  };

  // Continue to next line
  const handleContinue = () => {
    if (isTyping) {
      handleSkipTyping();
      return;
    }

    if (currentIndex < dialogue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete?.();
    }
  };

  // Handle choice selection
  const handleChoice = (choiceIndex) => {
    const choice = currentLine.choices[choiceIndex];
    onChoice?.(choice);
  };

  if (!currentLine) return null;

  const hasChoices = currentLine.choices && currentLine.choices.length > 0;
  const isLastLine = currentIndex === dialogue.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Dialogue Container */}
        <div className="nb-bg-white nb-border-xl nb-shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Character Portrait */}
            {showPortrait && currentLine.character && (
              <div className="md:w-1/3 nb-bg-cyan border-b-8 md:border-b-0 md:border-r-8 border-black flex flex-col items-center justify-center p-6">
                <div className="w-48 h-48 mb-4 overflow-hidden rounded-lg nb-border-md nb-shadow">
                  <img
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${currentLine.character.seed || currentLine.character.name}`}
                    alt={currentLine.character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="nb-bg-white nb-border-md px-4 py-2">
                  <p className="text-xl font-black uppercase text-center">
                    {currentLine.character.name}
                  </p>
                  {currentLine.character.title && (
                    <p className="text-xs font-bold text-center text-gray-600 mt-1">
                      {currentLine.character.title}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dialogue Content */}
            <div className="flex-1 p-8 flex flex-col justify-between min-h-[400px]">
              {/* Message Icon Header */}
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-black" />
                <div className="h-2 flex-1 nb-bg-black"></div>
              </div>

              {/* Dialogue Text */}
              <div
                className="flex-1 mb-6 cursor-pointer"
                onClick={handleSkipTyping}
              >
                <p className="text-2xl font-bold text-black leading-relaxed">
                  {displayedText}
                  {isTyping && <span className="animate-pulse">▌</span>}
                </p>
              </div>

              {/* Choices or Continue Button */}
              {!isTyping && (
                <div>
                  {hasChoices ? (
                    <div className="space-y-3">
                      {currentLine.choices.map((choice, index) => (
                        <NBButton
                          key={index}
                          onClick={() => handleChoice(index)}
                          variant={choice.variant || 'white'}
                          size="lg"
                          className="w-full text-left justify-between"
                        >
                          <span>{choice.text}</span>
                          <ArrowRight className="w-5 h-5" />
                        </NBButton>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <NBButton
                        onClick={handleContinue}
                        variant="green"
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        {isLastLine ? 'Complete' : 'Continue'}
                        <ArrowRight className="w-5 h-5" />
                      </NBButton>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mt-4">
                {dialogue.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 ${
                      index === currentIndex
                        ? 'nb-bg-green'
                        : index < currentIndex
                        ? 'nb-bg-black'
                        : 'nb-bg-gray'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
