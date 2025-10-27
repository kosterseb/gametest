import React from 'react';
import { useGame } from '../../context/GameContext';
import { X, BarChart3, BookOpen, Package, Star, Settings } from 'lucide-react';
import { DeckView } from '/src/components/Menu/DeckView';
import { StatsView } from '/src/components/Menu/StatsView';
import { InventoryView } from '/src/components/Menu/InventoryView';
import { TalentTreeView } from '/src/components/Menu/TalentTreeView';
import { SettingsView } from '/src/components/Menu/SettingsView';

export const GameMenu = () => {
  const { gameState, dispatch } = useGame();

  const handleClose = () => {
    dispatch({ type: 'CLOSE_MENU' });
  };

  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_MENU_TAB', tab });
  };

  const tabs = [
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'deck', label: 'Deck', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'talents', label: 'Talents', icon: <Star className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const renderContent = () => {
    switch (gameState.menuTab) {
      case 'stats':
        return <StatsView />;
      case 'deck':
        return <DeckView />;
      case 'inventory':
        return <InventoryView />;
      case 'talents':
        return <TalentTreeView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <StatsView />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border-4 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Game Menu</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-red-400 transition-colors p-2 hover:bg-red-900 hover:bg-opacity-50 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 flex border-b-4 border-purple-500">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-4 px-4 font-bold
                transition-all duration-200
                ${gameState.menuTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};