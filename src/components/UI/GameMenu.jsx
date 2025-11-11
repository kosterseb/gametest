import React from 'react';
import { useGame } from '../../context/GameContext';
import { X, BarChart3, BookOpen, Package, Star } from 'lucide-react';
import { DeckView } from '/src/components/Menu/DeckView';
import { StatsView } from '/src/components/Menu/StatsView';
import { InventoryView } from '/src/components/Menu/InventoryView';
import { TalentTreeView } from '/src/components/Menu/TalentTreeView';
import { NBTabButton, NBHeading } from './NeoBrutalUI';

export const GameMenu = ({ onClose }) => {
  const { gameState, dispatch } = useGame();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      dispatch({ type: 'CLOSE_MENU' });
    }
  };

  const handleTabChange = (tab) => {
    dispatch({ type: 'SET_MENU_TAB', tab });
  };

  const tabs = [
    { id: 'stats', label: 'Stats', icon: '📊', colorClass: 'nb-bg-pink' },
    { id: 'deck', label: 'Deck', icon: '🃏', colorClass: 'nb-bg-purple' },
    { id: 'inventory', label: 'Inventory', icon: '🎒', colorClass: 'nb-bg-green' },
    { id: 'talents', label: 'Talents', icon: '⭐', colorClass: 'nb-bg-yellow' }
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
      default:
        return <StatsView />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 animate-fadeIn">
      <div className="nb-border-xl nb-shadow-xl nb-bg-white max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="nb-bg-cyan nb-border-b-xl p-6 flex justify-between items-center">
          <NBHeading level={2} className="flex items-center gap-3">
            👤 CHARACTER
          </NBHeading>
          <button
            onClick={handleClose}
            className="nb-btn nb-bg-red px-4 py-2 text-2xl font-black hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex nb-border-b-xl bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 py-4 px-3
                nb-border-lg font-bold uppercase tracking-wide transition-all text-sm sm:text-base
                ${gameState.menuTab === tab.id
                  ? `${tab.colorClass} nb-shadow transform translate-y-1`
                  : 'bg-white hover:bg-gray-100'
                }
              `}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] bg-gray-50">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
