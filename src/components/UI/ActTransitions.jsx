import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { Trophy } from 'lucide-react';
import { NBButton, NBHeading } from './NeoBrutalUI';

export const ActTransition = ({ actNumber }) => {
  const { navigate } = useRouter();

  const handleContinue = () => {
    navigate('/map');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="text-center">
          <div className="nb-bg-yellow nb-border-xl nb-shadow-xl p-8 mb-8 inline-block animate-pulse">
            <Trophy className="w-24 h-24 text-black mx-auto" />
          </div>
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 mb-8 inline-block">
            <NBHeading level={1} className="text-black mb-4">
              ACT {actNumber} COMPLETE
            </NBHeading>
            <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-3">
              <p className="text-xl text-black font-bold uppercase">
                The journey continues...
              </p>
            </div>
          </div>
          <NBButton
            onClick={handleContinue}
            variant="success"
            size="xl"
          >
            CONTINUE
          </NBButton>
        </div>
      </div>
    </PageTransition>
  );
};