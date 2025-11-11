import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { getAllSaveSlots, loadSave, deleteSave, getTimeSinceLastPlayed } from '../../utils/SaveManager';
import { PageTransition } from './PageTransition';
import { Save, Trash2, Plus, Crown, ArrowLeft } from 'lucide-react';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';
import { FlyingCardsBackground } from './FlyingCardsBackground';

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
      <FlyingCardsBackground />
      <div className="min-h-screen p-8 relative">
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
                  ${slot.isEmpty ? 'nb-bg-white' : 'nb-bg-yellow'}
                  nb-border-xl nb-shadow-xl p-6
                  transition-all duration-300
                `}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Slot Info */}
                  <div className="flex items-center gap-6 flex-1">
                    {/* Slot Number Badge */}
                    <div className="nb-bg-purple nb-border-xl nb-shadow w-16 h-16 flex items-center justify-center text-2xl font-black text-black">
                      {slot.slotNumber}
                    </div>

                    {/* Profile Info or Empty Slot */}
                    {slot.isEmpty ? (
                      <div>
                        <NBHeading level={3} className="text-black mb-2">
                          EMPTY SLOT
                        </NBHeading>
                        <p className="text-black font-bold text-sm">
                          Start a new adventure
                        </p>
                      </div>
                    ) : (
                      <div className="flex-1">
                        {/* Profile Name with Avatar */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* DiceBear Avatar */}
                          <img
                            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${slot.profile.avatarSeed}`}
                            alt={slot.profile.profileName}
                            className="w-12 h-12 nb-border-xl"
                          />
                          <NBHeading level={3} className="text-black">
                            {slot.profile.profileName}
                          </NBHeading>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 text-sm text-black font-bold mb-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-black" />
                            <span>LEVEL {slot.profile.level}</span>
                          </div>
                          <div>
                            <span>XP: {slot.profile.experience}/{slot.profile.experienceToNextLevel}</span>
                          </div>
                          <div>
                            <span>TALENT POINTS: {slot.profile.talentPoints}</span>
                          </div>
                        </div>

                        {/* Lifetime Stats */}
                        <div className="flex gap-4 text-xs text-black font-bold mb-2 flex-wrap">
                          <span>RUNS: {slot.profile.lifetimeStats.totalRuns}</span>
                          <span>WINS: {slot.profile.lifetimeStats.totalWins}</span>
                          <span>BEST FLOOR: {slot.profile.lifetimeStats.bestFloor}</span>
                        </div>

                        {/* Active Run Indicator */}
                        {slot.profile.currentRun.active && (
                          <NBBadge color="green" className="mt-2 px-3 py-1 text-xs">
                            🎮 ACTIVE RUN: FLOOR {slot.profile.currentRun.floor}
                          </NBBadge>
                        )}

                        {/* Last Played */}
                        <div className="text-xs text-black font-bold mt-2">
                          LAST PLAYED: {getTimeSinceLastPlayed(slot.profile)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {slot.isEmpty ? (
                      // New Game Button
                      <NBButton
                        onClick={() => handleNewGame(slot.slotNumber)}
                        variant="success"
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>NEW GAME</span>
                      </NBButton>
                    ) : (
                      <>
                        {/* Continue Button */}
                        <NBButton
                          onClick={() => handleContinue(slot.slotNumber)}
                          variant="blue"
                          size="lg"
                          className="flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          <span>CONTINUE</span>
                        </NBButton>

                        {/* Delete Button */}
                        {confirmDelete === slot.slotNumber ? (
                          <div className="flex gap-2">
                            <NBButton
                              onClick={() => handleDelete(slot.slotNumber)}
                              variant="danger"
                              size="md"
                            >
                              CONFIRM
                            </NBButton>
                            <NBButton
                              onClick={cancelDelete}
                              variant="white"
                              size="md"
                            >
                              CANCEL
                            </NBButton>
                          </div>
                        ) : (
                          <NBButton
                            onClick={() => handleDelete(slot.slotNumber)}
                            variant="danger"
                            size="lg"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </NBButton>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 nb-bg-cyan nb-border-xl nb-shadow-lg p-6">
            <div className="nb-bg-white nb-border-lg nb-shadow p-4 text-center">
              <p className="text-black font-bold text-sm uppercase">
                💡 Meta-Progression: Your character level, talents, and lifetime stats persist across runs.
                Only your current run progress resets on death or victory!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};