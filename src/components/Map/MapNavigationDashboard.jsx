import React from 'react';
import { Compass, Target, Maximize2, X, Zap, ZoomIn, ZoomOut } from 'lucide-react';
import { NBButton } from '../UI/NeoBrutalUI';

export const MapNavigationDashboard = ({ isOpen, onClose, cameraControls, currentNodePosition, highlightPaths, onToggleHighlight }) => {
  const handleOverview = () => {
    if (cameraControls?.resetCamera) {
      cameraControls.resetCamera();
    }
  };

  const handleFocusPlayer = () => {
    if (cameraControls?.focusOnPosition && currentNodePosition) {
      cameraControls.focusOnPosition(currentNodePosition.x, currentNodePosition.y);
    }
  };

  const handleToggleHighlight = () => {
    if (onToggleHighlight) {
      onToggleHighlight();
    }
  };

  const handleZoomIn = () => {
    if (cameraControls?.zoomIn) {
      cameraControls.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (cameraControls?.zoomOut) {
      cameraControls.zoomOut();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`
          fixed left-0 top-0 h-full w-80 nb-bg-white nb-border-xl nb-shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="nb-bg-purple p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-black text-white">MAP NAV</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 nb-bg-white nb-border nb-shadow hover:translate-x-1 hover:translate-y-1 transition-transform flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="p-6 space-y-4">
          {/* Overview Button */}
          <NBButton
            onClick={handleOverview}
            variant="purple"
            size="lg"
            className="w-full flex items-center gap-3 justify-start"
          >
            <Maximize2 className="w-6 h-6" />
            <div className="text-left">
              <div className="font-black text-lg">OVERVIEW</div>
              <div className="text-sm opacity-80">Reset camera to show full map</div>
            </div>
          </NBButton>

          {/* Focus on Player Button */}
          <NBButton
            onClick={handleFocusPlayer}
            variant="cyan"
            size="lg"
            className="w-full flex items-center gap-3 justify-start"
            disabled={!currentNodePosition}
          >
            <Target className="w-6 h-6" />
            <div className="text-left">
              <div className="font-black text-lg">FOCUS PLAYER</div>
              <div className="text-sm opacity-80">Center on current position</div>
            </div>
          </NBButton>

          {/* Highlight Available Paths Button */}
          <NBButton
            onClick={handleToggleHighlight}
            variant={highlightPaths ? "success" : "yellow"}
            size="lg"
            className="w-full flex items-center gap-3 justify-start"
          >
            <Zap className="w-6 h-6" />
            <div className="text-left">
              <div className="font-black text-lg">{highlightPaths ? 'PATHS HIGHLIGHTED' : 'HIGHLIGHT PATHS'}</div>
              <div className="text-sm opacity-80">{highlightPaths ? 'Click to turn off' : 'Show available routes'}</div>
            </div>
          </NBButton>

          {/* Zoom Controls */}
          <div className="flex gap-2">
            <NBButton
              onClick={handleZoomIn}
              variant="white"
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ZoomIn className="w-6 h-6" />
              <span className="font-black">ZOOM IN</span>
            </NBButton>
            <NBButton
              onClick={handleZoomOut}
              variant="white"
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ZoomOut className="w-6 h-6" />
              <span className="font-black">ZOOM OUT</span>
            </NBButton>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 nb-bg-purple-light nb-border nb-shadow">
            <h3 className="font-black text-lg mb-2">CONTROLS</h3>
            <ul className="space-y-2 text-sm font-semibold">
              <li>🖱️ <strong>Click & Drag</strong> - Pan camera</li>
              <li>🎯 <strong>Click Node</strong> - Select node</li>
              <li>🗺️ <strong>Overview</strong> - Reset view</li>
              <li>📍 <strong>Focus</strong> - Center on player</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
