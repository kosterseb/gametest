import React from 'react';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import { NBButton, NBHeading } from './NeoBrutalUI';

export const ActCompletionPopup = ({ actNumber, onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="nb-bg-white nb-border-xl nb-shadow-xl max-w-xl w-full p-8 animate-fadeIn">
        {/* Trophy Icon */}
        <div className="text-center mb-6">
          <div className="nb-bg-yellow nb-border-xl nb-shadow-xl p-6 inline-block animate-bounce">
            <Trophy className="w-24 h-24 text-black" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <NBHeading level={1} className="mb-4">
            ACT {actNumber} COMPLETE!
          </NBHeading>
          <div className="nb-bg-purple nb-border-lg nb-shadow px-6 py-3 inline-block">
            <p className="text-white font-black text-lg uppercase">
              Boss Defeated!
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-black font-bold text-lg mb-4">
            You've conquered Act {actNumber}!
          </p>
          <p className="text-gray-700 font-semibold">
            Ready to proceed to Act {actNumber + 1}?
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <NBButton
            onClick={onContinue}
            variant="success"
            size="xl"
            className="flex items-center gap-3 mx-auto"
          >
            <Crown className="w-6 h-6" />
            <span>CONTINUE TO ACT {actNumber + 1}</span>
            <ArrowRight className="w-6 h-6" />
          </NBButton>
        </div>
      </div>
    </div>
  );
};
