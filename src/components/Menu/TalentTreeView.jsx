import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import {
  talents,
  talentPaths,
  canUnlockTalent,
  getTalentById
} from '../../data/talentData';
import { Crown, Lock, Check, Sparkles } from 'lucide-react';
import { NBButton, NBHeading, NBBadge, NBProgressBar } from '../UI/NeoBrutalUI';

export const TalentTreeView = () => {
  const { gameState, dispatch } = useGame();
  const [selectedPath, setSelectedPath] = useState('all');
  const [hoveredTalent, setHoveredTalent] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(null);

  const profile = gameState.profile;

  if (!profile) {
    return (
      <div className="text-center py-8 nb-bg-white nb-border-xl nb-shadow-lg p-6">
        <p className="text-black font-black uppercase">No profile loaded</p>
      </div>
    );
  }

  const unlockedTalents = profile.unlockedTalents || [];
  const talentPoints = profile.talentPoints || 0;

  const handleUnlockTalent = (talentId) => {
    const talent = getTalentById(talentId);
    
    if (!talent) return;

    // Check if we need confirmation
    if (confirmUnlock === talentId) {
      // Actually unlock
      if (talentPoints >= talent.cost) {
        dispatch({ type: 'UNLOCK_TALENT', talentId });
        dispatch({ type: 'ADD_BATTLE_LOG', message: `✨ Unlocked: ${talent.name}!` });
        setConfirmUnlock(null);
      }
    } else {
      // First click - ask for confirmation
      setConfirmUnlock(talentId);
    }
  };

  const getTalentState = (talent) => {
    if (unlockedTalents.includes(talent.id)) {
      return 'unlocked';
    }
    
    if (canUnlockTalent(talent.id, unlockedTalents)) {
      return 'available';
    }
    
    return 'locked';
  };

  const getTalentColor = (talent, state) => {
    if (state === 'unlocked') {
      return 'nb-bg-green nb-border-xl nb-shadow-lg';
    }

    if (state === 'available') {
      if (talentPoints >= talent.cost) {
        return 'nb-bg-yellow nb-border-xl nb-shadow-lg animate-pulse cursor-pointer nb-hover';
      } else {
        return 'nb-bg-white nb-border-xl nb-shadow cursor-not-allowed';
      }
    }

    return 'nb-bg-white nb-border-xl nb-shadow opacity-50 cursor-not-allowed';
  };

  // Filter talents by selected path
  const filteredTalents = selectedPath === 'all' 
    ? talents 
    : talents.filter(t => t.path === selectedPath);

  // Group talents by row for layout
  const talentsByRow = {};
  filteredTalents.forEach(talent => {
    if (!talentsByRow[talent.row]) {
      talentsByRow[talent.row] = [];
    }
    talentsByRow[talent.row].push(talent);
  });

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="nb-bg-purple nb-border-xl nb-shadow-lg p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <NBHeading level={2} className="text-black mb-2">TALENT TREE</NBHeading>
            <div className="nb-bg-white nb-border-lg nb-shadow px-4 py-2 inline-block">
              <p className="text-black font-bold text-sm uppercase">Permanent upgrades for your character</p>
            </div>
          </div>

          {/* Talent Points Display */}
          <div className="nb-bg-yellow nb-border-xl nb-shadow-lg px-6 py-3">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-black" />
              <div>
                <div className="text-xs font-black uppercase text-black">Talent Points</div>
                <div className="text-3xl font-black text-black">{talentPoints}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-black font-bold mb-2 uppercase">
            <span>Level {profile.level}</span>
            <span>{profile.experience}/{profile.experienceToNextLevel} XP</span>
          </div>
          <NBProgressBar
            value={profile.experience}
            max={profile.experienceToNextLevel}
            color="yellow"
            label=""
            showValue={false}
          />
        </div>
      </div>

      {/* Path Filter */}
      <div className="nb-bg-cyan nb-border-xl nb-shadow-lg p-6 flex gap-3 flex-wrap">
        <NBButton
          onClick={() => setSelectedPath('all')}
          variant={selectedPath === 'all' ? 'purple' : 'white'}
          size="md"
        >
          ALL PATHS
        </NBButton>

        {Object.entries(talentPaths).map(([key, path]) => (
          <NBButton
            key={key}
            onClick={() => setSelectedPath(key)}
            variant={selectedPath === key ? 'purple' : 'white'}
            size="md"
          >
            {path.icon} {path.name}
          </NBButton>
        ))}
      </div>

      {/* Talent Tree Grid */}
      <div className="p-6 bg-black">
        <div className="max-w-6xl mx-auto">
          {Object.keys(talentsByRow).sort((a, b) => a - b).map(row => (
            <div key={row} className="mb-8">
              {/* Row Label */}
              <div className="text-center mb-6">
                <NBBadge color="purple" className="px-6 py-2 text-sm">
                  TIER {row}
                </NBBadge>
              </div>

              {/* Talents in this row */}
              <div className="flex justify-center gap-8 flex-wrap">
                {talentsByRow[row]
                  .sort((a, b) => a.column - b.column)
                  .map(talent => {
                    const state = getTalentState(talent);
                    const isHovered = hoveredTalent === talent.id;
                    const isConfirming = confirmUnlock === talent.id;

                    return (
                      <div
                        key={talent.id}
                        className="relative"
                        onMouseEnter={() => setHoveredTalent(talent.id)}
                        onMouseLeave={() => {
                          setHoveredTalent(null);
                          setConfirmUnlock(null);
                        }}
                      >
                        {/* Talent Node */}
                        <button
                          onClick={() => state === 'available' && handleUnlockTalent(talent.id)}
                          disabled={state === 'locked' || state === 'unlocked' || (state === 'available' && talentPoints < talent.cost)}
                          className={`
                            ${getTalentColor(talent, state)}
                            ${talent.type === 'major' ? 'w-24 h-24' : 'w-20 h-20'}
                            flex flex-col items-center justify-center
                            transition-all duration-300
                            relative
                          `}
                        >
                          {/* Icon */}
                          <div className={`${talent.type === 'major' ? 'text-4xl' : 'text-3xl'} mb-1 text-black`}>
                            {talent.icon}
                          </div>

                          {/* State Indicator */}
                          {state === 'unlocked' && (
                            <div className="absolute -top-2 -right-2 nb-bg-green nb-border nb-shadow p-1">
                              <Check className="w-4 h-4 text-black" />
                            </div>
                          )}

                          {state === 'locked' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                          )}

                          {state === 'available' && talentPoints >= talent.cost && (
                            <div className="absolute -top-2 -right-2 nb-bg-yellow nb-border nb-shadow p-1 animate-bounce">
                              <Sparkles className="w-4 h-4 text-black" />
                            </div>
                          )}

                          {/* Cost Badge */}
                          {state !== 'unlocked' && (
                            <div className="absolute -bottom-2 nb-bg-purple nb-border nb-shadow px-2 py-0.5 text-xs font-black uppercase text-black">
                              {talent.cost} {talent.cost === 1 ? 'pt' : 'pts'}
                            </div>
                          )}
                        </button>

                        {/* Hover Tooltip */}
                        {(isHovered || isConfirming) && (
                          <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
                            <div className={`
                              nb-bg-white nb-border-xl nb-shadow-xl p-4
                              min-w-[250px] max-w-[300px]
                            `}>
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{talent.icon}</span>
                                  <div>
                                    <div className="font-black text-lg uppercase text-black">{talent.name}</div>
                                    <div className="text-xs text-black font-bold">
                                      {talentPaths[talent.path].name} • {talent.type === 'major' ? 'Major' : 'Minor'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-black font-bold mb-3">
                                {talent.description}
                              </p>

                              {/* Cost */}
                              {state !== 'unlocked' && (
                                <div className="text-xs nb-bg-purple nb-border nb-shadow px-2 py-1 font-black uppercase text-black">
                                  Cost: {talent.cost} talent {talent.cost === 1 ? 'point' : 'points'}
                                </div>
                              )}

                              {/* State Message */}
                              {state === 'unlocked' && (
                                <div className="text-xs nb-bg-green nb-border nb-shadow px-2 py-1 mt-2 font-black uppercase text-black">
                                  ✓ Unlocked
                                </div>
                              )}

                              {state === 'available' && talentPoints >= talent.cost && !isConfirming && (
                                <div className="text-xs nb-bg-yellow nb-border nb-shadow px-2 py-1 mt-2 font-black uppercase text-black">
                                  Click to unlock!
                                </div>
                              )}

                              {state === 'available' && talentPoints >= talent.cost && isConfirming && (
                                <div className="text-xs nb-bg-red nb-border nb-shadow px-2 py-1 mt-2 animate-pulse font-black uppercase text-black">
                                  Click again to confirm!
                                </div>
                              )}

                              {state === 'available' && talentPoints < talent.cost && (
                                <div className="text-xs nb-bg-red nb-border nb-shadow px-2 py-1 mt-2 font-black uppercase text-black">
                                  Not enough talent points
                                </div>
                              )}

                              {state === 'locked' && (
                                <div className="text-xs nb-bg-white nb-border nb-shadow px-2 py-1 mt-2 font-black uppercase text-black">
                                  🔒 Unlock prerequisites first
                                </div>
                              )}

                              {/* Prerequisites */}
                              {talent.requires.length > 0 && state !== 'unlocked' && (
                                <div className="text-xs text-black font-bold mt-2">
                                  Requires: {talent.requires.map(reqId => {
                                    const reqTalent = getTalentById(reqId);
                                    return reqTalent?.name || reqId;
                                  }).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        {talentPoints === 0 && (
          <div className="mt-8 nb-bg-cyan nb-border-xl nb-shadow-lg p-6 max-w-2xl mx-auto">
            <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center">
              <p className="text-black font-bold text-sm uppercase">
                💡 Level up to earn talent points! Defeat enemies to gain XP.
                Each level grants 1 talent point to unlock powerful permanent upgrades.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};