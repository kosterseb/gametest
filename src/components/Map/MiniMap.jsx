import React from 'react';
import { Map } from 'lucide-react';

export const MiniMap = ({ selectedBiomeData, currentActData, availableNodeIds, completedNodeIds }) => {
  if (!selectedBiomeData || !currentActData) return null;

  // Collect all nodes including boss
  const allNodes = [
    ...selectedBiomeData.floors.flatMap(f => f.nodes),
    currentActData.bossFloor.node
  ];

  // Find bounds for scaling
  const positions = allNodes.map(n => n.position);
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));

  // Map dimensions
  const mapWidth = 200;
  const mapHeight = 280;
  const padding = 20;
  const nodeRadius = 5;

  // Scale function to map world coordinates to mini-map coordinates
  const scaleX = (x) => {
    const range = maxX - minX || 1;
    return padding + ((x - minX) / range) * (mapWidth - padding * 2);
  };

  const scaleY = (y) => {
    const range = maxY - minY || 1;
    return padding + ((y - minY) / range) * (mapHeight - padding * 2);
  };

  // Get node status
  const getNodeStatus = (node) => {
    if (completedNodeIds.includes(node.id)) return 'completed';
    if (availableNodeIds.includes(node.id)) return 'available';
    return 'unavailable';
  };

  // Get color for node based on status
  const getNodeColor = (status, nodeType) => {
    if (status === 'completed') return '#FFD700'; // Gold
    if (status === 'available') {
      if (nodeType === 'boss') return '#9333EA'; // Purple
      if (nodeType === 'elite') return '#F97316'; // Orange
      return '#06B6D4'; // Cyan
    }
    return '#94A3B8'; // Gray
  };

  // Get all connections
  const connections = [];
  selectedBiomeData.floors.forEach(floor => {
    floor.nodes.forEach(node => {
      if (node.childrenIds && node.childrenIds.length > 0) {
        node.childrenIds.forEach(childId => {
          const childNode = allNodes.find(n => n.id === childId);
          if (childNode) {
            connections.push({
              from: node,
              to: childNode,
              active: completedNodeIds.includes(node.id) || availableNodeIds.includes(childId)
            });
          }
        });
      }
    });
  });

  // Add connections from last floor to boss
  if (selectedBiomeData.floors.length > 0) {
    const lastFloor = selectedBiomeData.floors[selectedBiomeData.floors.length - 1];
    lastFloor.nodes.forEach(node => {
      connections.push({
        from: node,
        to: currentActData.bossFloor.node,
        active: completedNodeIds.includes(node.id) || availableNodeIds.includes(currentActData.bossFloor.node.id)
      });
    });
  }

  // Find current player position (last completed node)
  const currentNodeId = completedNodeIds.length > 0
    ? completedNodeIds[completedNodeIds.length - 1]
    : null;
  const currentNode = currentNodeId ? allNodes.find(n => n.id === currentNodeId) : null;

  return (
    <div className="fixed bottom-4 right-4 z-40 nb-bg-white nb-border-lg nb-shadow-xl p-3 opacity-90 hover:opacity-100 transition-opacity">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Map className="w-4 h-4 text-black" />
        <div className="font-black text-xs text-black uppercase">Mini-Map</div>
      </div>

      {/* Map SVG */}
      <svg width={mapWidth} height={mapHeight} className="nb-border nb-shadow-sm" style={{ backgroundColor: '#F3F4F6' }}>
        {/* Draw connections first (behind nodes) */}
        {connections.map((conn, idx) => (
          <line
            key={idx}
            x1={scaleX(conn.from.position.x)}
            y1={scaleY(conn.from.position.y)}
            x2={scaleX(conn.to.position.x)}
            y2={scaleY(conn.to.position.y)}
            stroke={conn.active ? '#000000' : '#CBD5E1'}
            strokeWidth={conn.active ? 2 : 1}
            opacity={conn.active ? 0.6 : 0.3}
          />
        ))}

        {/* Draw nodes */}
        {allNodes.map((node) => {
          const status = getNodeStatus(node);
          const color = getNodeColor(status, node.type);
          const x = scaleX(node.position.x);
          const y = scaleY(node.position.y);

          return (
            <g key={node.id}>
              {/* Node circle */}
              <circle
                cx={x}
                cy={y}
                r={node.type === 'boss' ? nodeRadius * 1.5 : nodeRadius}
                fill={color}
                stroke="#000000"
                strokeWidth={1.5}
                opacity={status === 'unavailable' ? 0.4 : 1}
              />

              {/* Current player position indicator */}
              {currentNode?.id === node.id && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius * 2}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={2}
                    opacity={0.8}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={nodeRadius * 2.5}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={1.5}
                    opacity={0.5}
                  >
                    <animate
                      attributeName="r"
                      from={nodeRadius * 2}
                      to={nodeRadius * 3}
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.6"
                      to="0"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs font-bold">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#FFD700] nb-border"></div>
          <span className="text-black">Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4] nb-border"></div>
          <span className="text-black">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#94A3B8] nb-border"></div>
          <span className="text-black">Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full border-2 border-[#EF4444]"></div>
          <span className="text-black">You</span>
        </div>
      </div>
    </div>
  );
};
