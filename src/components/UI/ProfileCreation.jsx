import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useRouter } from '../../hooks/useRouter';
import { createNewProfile, loadSave } from '../../utils/SaveManager';
import { PageTransition } from './PageTransition';
import { User, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Back Button */}
          <button
            onClick={() => navigate('/save-select')}
            className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-purple-800 to-indigo-800 p-8 rounded-2xl shadow-2xl border-4 border-purple-400">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                Save Slot {targetSlot}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Create Your Hero
              </h1>
              <p className="text-purple-200">
                Begin your journey through the card realm
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Choose Your Avatar
              </h2>
              
              <div className="flex items-center gap-6 bg-purple-900 bg-opacity-50 p-6 rounded-xl">
                {/* Avatar Display */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                    <img
                      src={avatarUrl}
                      alt="Your avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Randomize Button */}
                <div className="flex-1 text-center">
                  <button
                    onClick={handleRandomizeAvatar}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Randomize Avatar
                  </button>
                  <p className="text-purple-200 text-sm mt-2">
                    Click to generate a new look
                  </p>
                </div>
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                What's Your Name?
              </h2>
              
              <input
                type="text"
                value={profileName}
                onChange={handleNameChange}
                placeholder="Enter your hero name..."
                maxLength={20}
                className={`
                  w-full px-4 py-3 rounded-lg text-lg
                  bg-purple-900 bg-opacity-50 text-white
                  border-2 ${nameError ? 'border-red-500' : 'border-purple-400'}
                  focus:outline-none focus:border-yellow-400
                  placeholder-purple-300
                `}
              />
              
              {/* Character Counter */}
              <div className="flex justify-between mt-2 text-sm">
                <div>
                  {nameError ? (
                    <span className="text-red-400">{nameError}</span>
                  ) : (
                    <span className="text-purple-300">
                      {profileName.length > 0 ? 'Looking good!' : 'Choose a memorable name'}
                    </span>
                  )}
                </div>
                <span className="text-purple-300">
                  {profileName.length}/20
                </span>
              </div>
            </div>

            {/* Preview Card */}
            {profileName.length >= 2 && (
              <div className="mb-8 bg-purple-900 bg-opacity-50 p-4 rounded-xl border-2 border-purple-400">
                <p className="text-purple-200 text-sm mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full border-2 border-white"
                  />
                  <div>
                    <div className="text-white font-bold text-lg">{profileName}</div>
                    <div className="text-purple-300 text-sm">Level 1 • 0 XP</div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={handleCreateProfile}
              disabled={profileName.trim().length < 2 || nameError !== ''}
              className={`
                w-full py-4 rounded-lg font-bold text-xl
                flex items-center justify-center gap-2
                transition-all transform
                ${profileName.trim().length >= 2 && !nameError
                  ? 'bg-green-600 hover:bg-green-700 hover:scale-105 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Start Adventure
              <ArrowRight className="w-6 h-6" />
            </button>

            {/* Info Text */}
            <div className="mt-6 text-center text-purple-300 text-sm">
              <p>🎮 Your progress will be saved automatically</p>
              <p className="mt-1">⭐ Level up to unlock powerful talents</p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};