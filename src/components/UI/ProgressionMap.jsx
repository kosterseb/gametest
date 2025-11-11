import React from 'react';
import { Map, Sword, Coffee, Briefcase, Crown, Lock, CheckCircle, Star } from 'lucide-react';
import { useRouter } from '../../hooks/useRouter';
import { PageTransition } from './PageTransition';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

export const ProgressionMap = () => {
  const { navigate } = useRouter();

  // Define battle types with neo-brutal colors
  const battleNodes = [
    { id: 1, type: 'normal', icon: Coffee, color: 'nb-bg-cyan', label: 'Coffee Break' },
    { id: 2, type: 'normal', icon: Sword, color: 'nb-bg-green', label: 'Quick Duel' },
    { id: 3, type: 'elite', icon: Star, color: 'nb-bg-orange', label: 'Elite Challenge' },
    { id: 4, type: 'normal', icon: Coffee, color: 'nb-bg-cyan', label: 'Coffee Break' },
    { id: 5, type: 'boss', icon: Crown, color: 'nb-bg-red', label: 'BOSS BATTLE' },
    { id: 6, type: 'normal', icon: Briefcase, color: 'nb-bg-purple', label: 'Business Meeting' },
    { id: 7, type: 'elite', icon: Star, color: 'nb-bg-orange', label: 'Elite Challenge' },
    { id: 8, type: 'normal', icon: Sword, color: 'nb-bg-green', label: 'Quick Duel' },
    { id: 9, type: 'elite', icon: Star, color: 'nb-bg-orange', label: 'Elite Challenge' },
    { id: 10, type: 'boss', icon: Crown, color: 'nb-bg-red', label: 'FINAL BOSS' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen nb-bg-blue p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="nb-bg-white nb-border-xl nb-shadow-xl p-8 text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="nb-bg-cyan nb-border-lg nb-shadow p-3">
                <Map className="w-12 h-12 text-black" />
              </div>
              <NBHeading level={1}>PROGRESSION MAP</NBHeading>
            </div>
            <p className="text-gray-700 font-bold text-sm uppercase tracking-wide">
              Track your journey through the Mythic Cafe
            </p>
          </div>

          {/* Battle Path */}
          <div className="space-y-6 mb-8">
            {battleNodes.map((node, index) => {
              const Icon = node.icon;
              const isLocked = true; // All locked for now (placeholder)
              const isCompleted = false; // None completed (placeholder)
              const isCurrent = false; // None current (placeholder)

              return (
                <div key={node.id} className="relative">
                  {/* Connecting Line */}
                  {index < battleNodes.length - 1 && (
                    <div className="absolute left-1/2 top-full w-1 h-6 bg-black -ml-0.5 z-0" />
                  )}

                  {/* Battle Node */}
                  <div className="relative z-10 flex items-center gap-4">
                    {/* Node Number */}
                    <div className="nb-bg-yellow nb-border-lg nb-shadow px-4 py-2">
                      <span className="text-2xl font-black text-black">{node.id}</span>
                    </div>

                    {/* Node Card */}
                    <button
                      onClick={() => !isLocked && navigate('/battle')}
                      disabled={isLocked}
                      className={`
                        flex-1 ${node.color} nb-border-xl nb-shadow-lg
                        p-6 flex items-center gap-4
                        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'nb-hover cursor-pointer'}
                        transition-all relative
                      `}
                    >
                      {/* Icon */}
                      <div className={`nb-border-lg nb-shadow p-3 ${node.type === 'boss' ? 'nb-bg-yellow' : 'bg-black'}`}>
                        <Icon className={`w-10 h-10 ${node.type === 'boss' ? 'text-black' : 'text-white'}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-left">
                        <div className="text-black font-black text-xl uppercase">{node.label}</div>
                        <div className="text-gray-800 text-sm font-bold">
                          {node.type === 'boss' ? 'Defeat to progress' : node.type === 'elite' ? 'Tough enemy' : 'Standard battle'}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isCompleted ? (
                          <NBBadge color="green" className="px-4 py-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            COMPLETE
                          </NBBadge>
                        ) : isLocked ? (
                          <NBBadge color="white" className="px-4 py-2 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            LOCKED
                          </NBBadge>
                        ) : (
                          <NBBadge color="yellow" className="px-4 py-2 animate-pulse">
                            FIGHT!
                          </NBBadge>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <NBButton
              onClick={() => navigate('/menu')}
              variant="cyan"
              size="lg"
              className="px-12 py-4 text-xl"
            >
              BACK TO MENU
            </NBButton>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};