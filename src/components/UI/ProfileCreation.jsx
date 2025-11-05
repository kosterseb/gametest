import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { createNewProfile, loadSave } from '../../utils/SaveManager';
import { PageTransition } from './PageTransition';
import { User, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { NBButton, NBHeading, NBBadge } from './NeoBrutalUI';

export const ProfileCreation = ({ slotNumber }) => {
  const { dispatch } = useGame();
  const { navigate, routeParams } = useRouter();
  
  // Get slot number from route params if passed
  const targetSlot = slotNumber || routeParams?.slotNumber || 1;
  
  const [profileName, setProfileName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
  const [nameError, setNameError] = useState('');

  function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 15);
  }

  const handleRandomizeAvatar = () => {
    setAvatarSeed(generateRandomSeed());
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setProfileName(name);
    
    // Validate name
    if (name.length === 0) {
      setNameError('');
    } else if (name.length < 2) {
      setNameError('Name must be at least 2 characters');
    } else if (name.length > 20) {
      setNameError('Name must be 20 characters or less');
    } else {
      setNameError('');
    }
  };

  const handleCreateProfile = () => {
    // Validate
    if (profileName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    
    if (profileName.trim().length > 20) {
      setNameError('Name must be 20 characters or less');
      return;
    }

    // Create profile
    const success = createNewProfile(targetSlot, profileName.trim(), avatarSeed);
    
    if (!success) {
      setNameError('Failed to create profile. Please try again.');
      return;
    }

    // Load the newly created profile
    const newProfile = loadSave(targetSlot);
    
    if (!newProfile) {
      setNameError('Failed to load profile. Please try again.');
      return;
    }

    // Load profile into game state
    dispatch({ type: 'LOAD_PROFILE', profile: newProfile, slotNumber: targetSlot });
    
    // Start a new run
    dispatch({ type: 'START_NEW_RUN' });
    
    console.log('✅ Profile created:', profileName);
    
    // Navigate to map
    navigate('/map');
  };

  const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Back Button */}
          <NBButton
            onClick={() => navigate('/save-select')}
            variant="white"
            size="md"
            className="absolute top-8 left-8 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>BACK TO SLOTS</span>
          </NBButton>

          {/* Main Card */}
          <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <NBBadge color="yellow" className="px-6 py-2 mb-4 text-sm">
                SAVE SLOT {targetSlot}
              </NBBadge>
              <NBHeading level={1} className="text-black mb-4">
                CREATE YOUR HERO
              </NBHeading>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-2 inline-block">
                <p className="text-black font-bold text-sm uppercase">
                  Begin your journey through the card realm
                </p>
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="mb-8">
              <NBHeading level={3} className="text-black mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                CHOOSE YOUR AVATAR
              </NBHeading>

              <div className="flex items-center gap-6 nb-bg-white nb-border-lg nb-shadow p-6">
                {/* Avatar Display */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 nb-border-xl nb-shadow bg-white overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Randomize Button */}
                <div className="flex-1 text-center">
                  <NBButton
                    onClick={handleRandomizeAvatar}
                    variant="success"
                    size="lg"
                    className="flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>RANDOMIZE</span>
                  </NBButton>
                  <p className="text-black font-bold text-sm mt-3 uppercase">
                    Click to generate a new look
                  </p>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-8">
              <NBHeading level={3} className="text-black mb-4">
                WHAT'S YOUR NAME?
              </NBHeading>

              <input
                type="text"
                value={profileName}
                onChange={handleNameChange}
                placeholder="ENTER YOUR HERO NAME..."
                maxLength={20}
                className={`
                  w-full px-4 py-3 text-lg font-bold uppercase
                  nb-bg-white text-black
                  ${nameError ? 'nb-border-red' : 'nb-border-lg'}
                  ${nameError ? 'nb-shadow-colored-red' : 'nb-shadow'}
                  focus:outline-none focus:nb-shadow-colored-yellow
                  placeholder-gray-400
                `}
              />

              {/* Character Counter */}
              <div className="flex justify-between mt-3 text-sm">
                <div>
                  {nameError ? (
                    <div className="nb-bg-red nb-border nb-shadow px-3 py-1 inline-block">
                      <span className="text-black font-black uppercase">{nameError}</span>
                    </div>
                  ) : (
                    <div className="nb-bg-green nb-border nb-shadow px-3 py-1 inline-block">
                      <span className="text-black font-black uppercase">
                        {profileName.length > 0 ? 'Looking good!' : 'Choose a memorable name'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="nb-bg-white nb-border nb-shadow px-3 py-1">
                  <span className="text-black font-black uppercase">
                    {profileName.length}/20
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {profileName.length >= 2 && (
              <div className="mb-8 nb-bg-yellow nb-border-lg nb-shadow p-4">
                <div className="nb-bg-white nb-border nb-shadow px-3 py-1 inline-block mb-3">
                  <p className="text-black font-black text-xs uppercase">Preview:</p>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-12 h-12 nb-border-xl"
                  />
                  <div>
                    <div className="text-black font-black text-lg uppercase">{profileName}</div>
                    <div className="text-black font-bold text-sm">LEVEL 1 • 0 XP</div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <NBButton
              onClick={handleCreateProfile}
              disabled={profileName.trim().length < 2 || nameError !== ''}
              variant={profileName.trim().length >= 2 && !nameError ? 'success' : 'white'}
              size="xl"
              className="w-full flex items-center justify-center gap-2"
            >
              <span>START ADVENTURE</span>
              <ArrowRight className="w-6 h-6" />
            </NBButton>

            {/* Info Text */}
            <div className="mt-6 nb-bg-cyan nb-border-lg nb-shadow p-4">
              <div className="nb-bg-white nb-border nb-shadow p-3 text-center">
                <p className="text-black font-bold text-sm uppercase">
                  🎮 Your progress will be saved automatically
                </p>
                <p className="text-black font-bold text-sm uppercase mt-1">
                  ⭐ Level up to unlock powerful talents
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};