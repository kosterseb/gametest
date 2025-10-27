import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { 
  talents, 
  talentPaths, 
  canUnlockTalent, 
  getTalentById 
} from '../../data/talentData';
import { Crown, Lock, Check, Sparkles } from 'lucide-react';

export const TalentTreeView = () => {
  const { gameState, dispatch } = useGame();
  const [selectedPath, setSelectedPath] = useState('all');
  const [hoveredTalent, setHoveredTalent] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(null);

  const profile = gameState.profile;

  if (!profile) {
    return (
      <div className="text-center text-gray-500 py-8">
        No profile loaded
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
      return 'bg-green-600 border-green-400';
    }
    
    if (state === 'available') {
      if (talentPoints >= talent.cost) {
        return 'bg-yellow-500 border-yellow-300 animate-pulse cursor-pointer hover:scale-110';
      } else {
        return 'bg-gray-600 border-gray-500 cursor-not-allowed';
      }
    }
    
    return 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed';
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
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-6 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Talent Tree</h2>
            <p className="text-purple-200">Permanent upgrades for your character</p>
          </div>
          
          {/* Talent Points Display */}
          <div className="bg-yellow-500 text-black px-6 py-3 rounded-lg border-4 border-yellow-300 shadow-lg">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6" />
              <div>
                <div className="text-sm font-semibold">Talent Points</div>
                <div className="text-3xl font-bold">{talentPoints}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-4 bg-purple-900 bg-opacity-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm text-purple-200 mb-1">
            <span>Level {profile.level}</span>
            <span>{profile.experience}/{profile.experienceToNextLevel} XP</span>
          </div>
          <div className="w-full bg-purple-950 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(profile.experience / profile.experienceToNextLevel) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Path Filter */}
      <div className="bg-gray-800 p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPath('all')}
          className={`
            px-4 py-2 rounded-lg font-bold transition-all
            ${selectedPath === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
          `}
        >
          All Paths
        </button>
        
        {Object.entries(talentPaths).map(([key, path]) => (
          <button
            key={key}
            onClick={() => setSelectedPath(key)}
            className={`
              px-4 py-2 rounded-lg font-bold transition-all
              ${selectedPath === key 
                ? `bg-gradient-to-r ${path.color} text-white` 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
            `}
          >
            {path.icon} {path.name}
          </button>
        ))}
      </div>

      {/* Talent Tree Grid */}
      <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          {Object.keys(talentsByRow).sort((a, b) => a - b).map(row => (
            <div key={row} className="mb-8">
              {/* Row Label */}
              <div className="text-center mb-4">
                <span className="bg-purple-900 text-purple-200 px-4 py-1 rounded-full text-sm font-bold">
                  Tier {row}
                </span>
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
                            rounded-full border-4
                            flex flex-col items-center justify-center
                            transition-all duration-300 transform
                            ${talent.type === 'major' ? 'shadow-xl' : 'shadow-lg'}
                            relative
                          `}
                        >
                          {/* Icon */}
                          <div className={`${talent.type === 'major' ? 'text-4xl' : 'text-3xl'} mb-1`}>
                            {talent.icon}
                          </div>

                          {/* State Indicator */}
                          {state === 'unlocked' && (
                            <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {state === 'locked' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                              <Lock className="w-6 h-6 text-gray-400" />
                            </div>
                          )}

                          {state === 'available' && talentPoints >= talent.cost && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 animate-bounce">
                              <Sparkles className="w-4 h-4 text-yellow-900" />
                            </div>
                          )}

                          {/* Cost Badge */}
                          {state !== 'unlocked' && (
                            <div className="absolute -bottom-2 bg-purple-700 text-white rounded-full px-2 py-0.5 text-xs font-bold border-2 border-white">
                              {talent.cost} {talent.cost === 1 ? 'pt' : 'pts'}
                            </div>
                          )}
                        </button>

                        {/* Hover Tooltip */}
                        {(isHovered || isConfirming) && (
                          <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 z-50 pointer-events-none">
                            <div className={`
                              bg-gray-900 text-white p-4 rounded-lg shadow-2xl border-4 
                              ${state === 'unlocked' ? 'border-green-400' : state === 'available' ? 'border-yellow-400' : 'border-gray-600'}
                              min-w-[250px] max-w-[300px]
                            `}>
                              {/* Header */}
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{talent.icon}</span>
                                  <div>
                                    <div className="font-bold text-lg">{talent.name}</div>
                                    <div className="text-xs text-gray-400">
                                      {talentPaths[talent.path].name} • {talent.type === 'major' ? 'Major' : 'Minor'}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <p className="text-sm text-gray-300 mb-3">
                                {talent.description}
                              </p>

                              {/* Cost */}
                              {state !== 'unlocked' && (
                                <div className="text-xs bg-purple-800 px-2 py-1 rounded">
                                  Cost: {talent.cost} talent {talent.cost === 1 ? 'point' : 'points'}
                                </div>
                              )}

                              {/* State Message */}
                              {state === 'unlocked' && (
                                <div className="text-xs bg-green-800 px-2 py-1 rounded mt-2">
                                  ✓ Unlocked
                                </div>
                              )}

                              {state === 'available' && talentPoints >= talent.cost && !isConfirming && (
                                <div className="text-xs bg-yellow-800 px-2 py-1 rounded mt-2">
                                  Click to unlock!
                                </div>
                              )}

                              {state === 'available' && talentPoints >= talent.cost && isConfirming && (
                                <div className="text-xs bg-red-800 px-2 py-1 rounded mt-2 animate-pulse">
                                  Click again to confirm!
                                </div>
                              )}

                              {state === 'available' && talentPoints < talent.cost && (
                                <div className="text-xs bg-red-800 px-2 py-1 rounded mt-2">
                                  Not enough talent points
                                </div>
                              )}

                              {state === 'locked' && (
                                <div className="text-xs bg-gray-700 px-2 py-1 rounded mt-2">
                                  🔒 Unlock prerequisites first
                                </div>
                              )}

                              {/* Prerequisites */}
                              {talent.requires.length > 0 && state !== 'unlocked' && (
                                <div className="text-xs text-gray-400 mt-2">
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
          <div className="mt-8 bg-blue-900 bg-opacity-50 p-4 rounded-lg border-2 border-blue-400 max-w-2xl mx-auto">
            <p className="text-blue-200 text-sm text-center">
              💡 <strong>Level up to earn talent points!</strong> Defeat enemies to gain XP. 
              Each level grants 1 talent point to unlock powerful permanent upgrades.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};