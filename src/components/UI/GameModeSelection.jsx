import React, { useState } from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useGame } from '../../context/GameContext';
import { PageTransition } from './PageTransition';
import { FlyingCardsBackground } from './FlyingCardsBackground';
import { NBButton, NBHeading, NBCard } from './NeoBrutalUI';
import { Swords, Infinity, Users, Lock, ArrowLeft } from 'lucide-react';

export const GameModeSelection = () => {
  const { navigate } = useRouter();
  const { dispatch } = useGame();
  const [selectedMode, setSelectedMode] = useState(null);

  const gameModes = [
    {
      id: 'story',
      name: 'Story Mode',
      icon: <Swords className="w-16 h-16" />,
      description: 'Experience the full campaign with branching paths and boss battles',
      color: 'green',
      available: true,
    },
    {
      id: 'endless',
      name: 'Endless Mode',
      icon: <Infinity className="w-16 h-16" />,
      description: 'Survive as long as you can against increasingly difficult enemies',
      color: 'orange',
      available: false,
    },
    {
      id: 'rumble',
      name: 'Rumble (PvP)',
      icon: <Users className="w-16 h-16" />,
      description: 'Battle against other players in card combat arenas',
      color: 'red',
      available: false,
    },
  ];

  const handleModeSelect = (mode) => {
    if (!mode.available) return;
    setSelectedMode(mode.id);
  };

  const handleConfirm = () => {
    if (!selectedMode) return;

    // Set game mode in context
    dispatch({ type: 'SET_GAME_MODE', mode: selectedMode });

    // Start new run
    dispatch({ type: 'START_NEW_RUN' });

    // If story mode, show story intro dialogue first
    if (selectedMode === 'story') {
      navigate('/dialogue', {
        dialogueId: 'story_intro',
        nextRoute: '/map'
      });
    } else {
      // Other modes go straight to map
      navigate('/map');
    }
  };

  return (
    <PageTransition>
      <FlyingCardsBackground />
      <div className="min-h-screen p-8 relative flex items-center justify-center">
        <div className="max-w-5xl w-full">
          {/* Back Button */}
          <NBButton
            onClick={() => navigate('/save-select')}
            variant="white"
            size="md"
            className="absolute top-8 left-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>BACK</span>
          </NBButton>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-8 mb-6 inline-block">
              <NBHeading level={1} className="text-black">
                SELECT GAME MODE
              </NBHeading>
            </div>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                className={`relative ${mode.available ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <NBCard
                  color={selectedMode === mode.id ? 'yellow' : mode.color}
                  shadow="xl"
                  className={`
                    h-full transition-all
                    ${mode.available ? 'hover:scale-105' : 'opacity-60'}
                    ${selectedMode === mode.id ? 'ring-4 ring-black' : ''}
                  `}
                >
                  {/* Locked Overlay */}
                  {!mode.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 nb-border-xl">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-white mx-auto mb-2" />
                        <p className="text-white font-black text-xl uppercase">
                          Under Construction
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex flex-col items-center text-center">
                    <div className="text-black mb-4">
                      {mode.icon}
                    </div>

                    <NBHeading level={3} className="text-black mb-3">
                      {mode.name}
                    </NBHeading>

                    <p className="text-black font-bold text-sm leading-relaxed">
                      {mode.description}
                    </p>
                  </div>
                </NBCard>
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          {selectedMode && (
            <div className="text-center animate-bounceIn">
              <NBButton
                onClick={handleConfirm}
                variant="success"
                size="xl"
                className="px-12"
              >
                START ADVENTURE
              </NBButton>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
