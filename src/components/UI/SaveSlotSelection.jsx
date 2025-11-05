import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { getAllSaveSlots, loadSave, deleteSave, getTimeSinceLastPlayed } from '../../utils/SaveManager';
import { PageTransition } from './PageTransition';
import { Save, Trash2, Plus, Crown, ArrowLeft } from 'lucide-react';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

export const SaveSlotSelection = () => {
  const { dispatch } = useGame();
  const { navigate } = useRouter();
  const [saveSlots, setSaveSlots] = useState(getAllSaveSlots());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleNewGame = (slotNumber) => {
    // Navigate to profile creation
    navigate('/profile-creation', { slotNumber });
  };

  const handleContinue = (slotNumber) => {
    const profile = loadSave(slotNumber);
    
    if (!profile) {
      console.error('Failed to load profile');
      return;
    }

    // Load profile into game state
    dispatch({ type: 'LOAD_PROFILE', profile, slotNumber });

    // Check if there's an active run
    if (profile.currentRun.active) {
      console.log('Continuing existing run...');
      navigate('/map');
    } else {
      console.log('No active run, starting new...');
      dispatch({ type: 'START_NEW_RUN' });
      navigate('/map');
    }
  };

  const handleDelete = (slotNumber) => {
    if (confirmDelete === slotNumber) {
      // Confirmed - actually delete
      const success = deleteSave(slotNumber);
      if (success) {
        setSaveSlots(getAllSaveSlots());
        setConfirmDelete(null);
      }
    } else {
      // First click - ask for confirmation
      setConfirmDelete(slotNumber);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <NBButton
              onClick={() => navigate('/')}
              variant="white"
              size="md"
              className="absolute top-8 left-8 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>BACK TO MENU</span>
            </NBButton>

            <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-8 mb-6 inline-block">
              <NBHeading level={1} className="text-black mb-4">
                SELECT SAVE SLOT
              </NBHeading>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-2 inline-block">
                <p className="text-black font-bold text-sm uppercase">
                  Choose a slot to start your adventure
                </p>
              </div>
            </div>
          </div>

          {/* Save Slots */}
          <div className="space-y-6">
            {saveSlots.map((slot) => (
              <div
                key={slot.slotNumber}
                className={`
                  bg-gradient-to-r from-purple-800 to-indigo-800 
                  p-6 rounded-xl shadow-2xl border-4 
                  ${slot.isEmpty ? 'border-gray-600' : 'border-purple-400'}
                  transition-all duration-300 hover:scale-102
                `}
              >
                <div className="flex items-center justify-between">
                  {/* Slot Info */}
                  <div className="flex items-center gap-6 flex-1">
                    {/* Slot Number Badge */}
                    <div className="bg-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white">
                      {slot.slotNumber}
                    </div>

                    {/* Profile Info or Empty Slot */}
                    {slot.isEmpty ? (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                          Empty Slot
                        </h3>
                        <p className="text-purple-300 text-sm">
                          Start a new adventure
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1">
                        {/* Profile Name with Avatar */}
                        <div className="flex items-center gap-3 mb-2">
                          {/* DiceBear Avatar */}
                          <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${slot.profile.avatarSeed}`}
                            alt={slot.profile.profileName}
                            className="w-12 h-12 rounded-full border-2 border-white"
                          />
                          <h3 className="text-2xl font-bold text-white">
                            {slot.profile.profileName}
                          </h3>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-6 text-sm text-purple-200">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-400" />
                            <span>Level {slot.profile.level}</span>
                          </div>
                          <div>
                            <span>XP: {slot.profile.experience}/{slot.profile.experienceToNextLevel}</span>
                          </div>
                          <div>
                            <span>Talent Points: {slot.profile.talentPoints}</span>
                          </div>
                        </div>

                        {/* Lifetime Stats */}
                        <div className="flex gap-6 text-xs text-purple-300 mt-2">
                          <span>Runs: {slot.profile.lifetimeStats.totalRuns}</span>
                          <span>Wins: {slot.profile.lifetimeStats.totalWins}</span>
                          <span>Best Floor: {slot.profile.lifetimeStats.bestFloor}</span>
                        </div>

                        {/* Active Run Indicator */}
                        {slot.profile.currentRun.active && (
                          <div className="mt-2 inline-block bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            🎮 Active Run: Floor {slot.profile.currentRun.floor}
                          </div>
                        )}

                        {/* Last Played */}
                        <div className="text-xs text-gray-400 mt-2">
                          Last played: {getTimeSinceLastPlayed(slot.profile)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {slot.isEmpty ? (
                      // New Game Button
                      <button
                        onClick={() => handleNewGame(slot.slotNumber)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                        New Game
                      </button>
                    ) : (
                      <>
                        {/* Continue Button */}
                        <button
                          onClick={() => handleContinue(slot.slotNumber)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                        >
                          <Save className="w-5 h-5" />
                          Continue
                        </button>

                        {/* Delete Button */}
                        {confirmDelete === slot.slotNumber ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(slot.slotNumber)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold text-sm transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(slot.slotNumber)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold flex items-center gap-2 transition-all transform hover:scale-105"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-900 bg-opacity-50 p-4 rounded-lg border-2 border-blue-400">
            <p className="text-blue-200 text-sm text-center">
              💡 <strong>Meta-Progression:</strong> Your character level, talents, and lifetime stats persist across runs. 
              Only your current run progress resets on death or victory!
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};