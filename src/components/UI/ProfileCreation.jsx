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

  // Avatar customization options - Hair, Lips, Shirt colors
  const hairColors = ['0d0d0d', '4a312c', 'f59e0b', 'ef4444', 'a855f7', '06b6d4', 'ec4899'];
  const mouthColors = ['f87171', 'fca5a5', 'fb923c', 'fb7185', 'f472b6', 'c084fc'];
  const shirtColors = ['ef4444', 'f97316', 'eab308', '22c55e', '06b6d4', '3b82f6', '8b5cf6', 'ec4899'];

  const [hairColorIndex, setHairColorIndex] = useState(0);
  const [mouthColorIndex, setMouthColorIndex] = useState(0);
  const [shirtColorIndex, setShirtColorIndex] = useState(4);

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

  const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}&hairColor=${hairColors[hairColorIndex]}&mouthColor=${mouthColors[mouthColorIndex]}&shirtColor=${shirtColors[shirtColorIndex]}`;

  return (
    <PageTransition>
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="max-w-6xl w-full h-[95vh]">
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
          <div className="nb-bg-purple nb-border-xl nb-shadow-xl p-8 h-full flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <NBBadge color="yellow" className="px-6 py-2 mb-3 text-sm">
                SAVE SLOT {targetSlot}
              </NBBadge>
              <NBHeading level={1} className="text-black mb-3">
                CREATE YOUR HERO
              </NBHeading>
              <div className="nb-bg-cyan nb-border-lg nb-shadow px-6 py-2 inline-block">
                <p className="text-black font-bold text-sm uppercase">
                  Begin your journey through the card realm
                </p>
              </div>
            </div>

            {/* Avatar Selection - Grid Layout */}
            <div className="grid grid-cols-2 gap-8 mb-6 flex-1">
              {/* Left: Avatar Display */}
              <div className="flex flex-col items-center justify-center nb-bg-white nb-border-lg nb-shadow p-8">
                <div className="w-80 h-80 nb-border-xl nb-shadow bg-white overflow-hidden mb-6">
                  <img
                    src={avatarUrl}
                    alt="Your avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <NBButton
                  onClick={handleRandomizeAvatar}
                  variant="success"
                  size="xl"
                  className="flex items-center gap-3 w-full justify-center"
                >
                  <RefreshCw className="w-6 h-6" />
                  <span>RANDOMIZE AVATAR</span>
                </NBButton>
              </div>

              {/* Right: Customization Controls */}
              <div className="nb-bg-white nb-border-lg nb-shadow p-6 flex flex-col">
                <NBHeading level={3} className="text-black mb-6 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  CUSTOMIZE YOUR LOOK
                </NBHeading>

                {/* Hair Color Selector */}
                <div className="mb-6">
                  <label className="text-black font-black text-sm uppercase mb-3 block">
                    💇 HAIR COLOR
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {hairColors.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => setHairColorIndex(index)}
                        className={`w-12 h-12 nb-border-lg nb-shadow nb-hover ${hairColorIndex === index ? 'nb-shadow-colored-yellow ring-4 ring-yellow-400' : ''}`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Lips/Mouth Color Selector */}
                <div className="mb-6">
                  <label className="text-black font-black text-sm uppercase mb-3 block">
                    💋 LIPS COLOR
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {mouthColors.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => setMouthColorIndex(index)}
                        className={`w-12 h-12 nb-border-lg nb-shadow nb-hover ${mouthColorIndex === index ? 'nb-shadow-colored-yellow ring-4 ring-yellow-400' : ''}`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Shirt Color Selector */}
                <div className="mb-6">
                  <label className="text-black font-black text-sm uppercase mb-3 block">
                    👕 SHIRT COLOR
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {shirtColors.map((color, index) => (
                      <button
                        key={color}
                        onClick={() => setShirtColorIndex(index)}
                        className={`w-12 h-12 nb-border-lg nb-shadow nb-hover ${shirtColorIndex === index ? 'nb-shadow-colored-yellow ring-4 ring-yellow-400' : ''}`}
                        style={{ backgroundColor: `#${color}` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="nb-bg-cyan nb-border nb-shadow p-3 mt-auto">
                  <p className="text-black font-bold text-xs uppercase text-center">
                    🎨 Click colors to customize your character!
                  </p>
                </div>
              </div>
            </div>

            {/* Name Input - Compact */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Name Input */}
              <div>
                <NBHeading level={3} className="text-black mb-3">
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

              {/* Preview + Create Button Column */}
              <div className="flex flex-col gap-4">
                {/* Preview Card */}
                {profileName.length >= 2 && (
                  <div className="nb-bg-yellow nb-border-lg nb-shadow p-4">
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
                  className="flex items-center justify-center gap-2"
                >
                  <span>START ADVENTURE</span>
                  <ArrowRight className="w-6 h-6" />
                </NBButton>
              </div>
            </div>

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