import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';

export const ActTransition = ({ actNumber }) => {
  const { navigate } = useRouter();

  const handleContinue = () => {
    navigate('/map');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            Act {actNumber} Complete
          </h1>
          <p className="text-2xl text-gray-400 mb-8">
            The journey continues...
          </p>
          <button
            onClick={handleContinue}
            className="bg-white text-black px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-200 transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </PageTransition>
  );
};