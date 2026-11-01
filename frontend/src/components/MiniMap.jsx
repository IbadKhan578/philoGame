import React, { useState, useEffect } from 'react';
import { Compass, Minimize2, Maximize2 } from 'lucide-react';
import { EventBus } from '../game/EventBus';
import './MiniMap.css';

export default function MiniMap({ philosophers }) {
  const [playerPos, setPlayerPos] = useState({ x: 920, y: 830 });
  const [worldDim, setWorldDim] = useState({ width: 2000, height: 1600 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const cleanMove = EventBus.on('player-moved', (data) => {
      setPlayerPos({ x: data.x, y: data.y });
      if (data.worldWidth && data.worldHeight) {
        setWorldDim({ width: data.worldWidth, height: data.worldHeight });
      }
    });

    return () => cleanMove();
  }, []);

  const mapWidth = 190;
  const mapHeight = Math.round((mapWidth * worldDim.height) / worldDim.width);

  const scaleX = mapWidth / worldDim.width;
  const scaleY = mapHeight / worldDim.height;

  const playerMapX = Math.max(4, Math.min(mapWidth - 4, playerPos.x * scaleX));
  const playerMapY = Math.max(4, Math.min(mapHeight - 4, playerPos.y * scaleY));

  const handlePhilosopherClick = (p) => {
    EventBus.emit('teleport-to-philosopher', { x: p.position_x, y: p.position_y });
  };

  return (
    <div className={`minimap-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="minimap-header">
        <div className="header-title">
          <Compass size={14} className="compass-icon" />
          <span>Garden Map</span>
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Map' : 'Collapse Map'}
        >
          {isCollapsed ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </button>
      </div>

      {!isCollapsed && (
        <div
          className="minimap-canvas"
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        >
          {/* Garden Zones / Pathways Layout */}
          <div className="minimap-zone zone-center" title="Agora Plaza" />
          <div className="minimap-zone zone-temple" title="Temple Sanctuary" />
          <div className="minimap-zone zone-lyceum" title="Lyceum Gardens" />
          <div className="minimap-zone zone-stoic" title="Stoic Courtyard" />

          {/* Philosopher Markers */}
          {philosophers.map((p) => {
            const px = p.position_x * scaleX;
            const py = p.position_y * scaleY;
            const initials = p.name.charAt(0);

            return (
              <div
                key={p.id}
                className="minimap-marker philosopher-marker"
                style={{ left: `${px}px`, top: `${py}px` }}
                title={`${p.name} (${p.school}) - Click to walk near`}
                onClick={() => handlePhilosopherClick(p)}
              >
                <span className="marker-label">{initials}</span>
              </div>
            );
          })}

          {/* Player Marker */}
          <div
            className="minimap-marker player-marker"
            style={{ left: `${playerMapX}px`, top: `${playerMapY}px` }}
            title="You (Player)"
          >
            <div className="player-inner-dot" />
            <div className="player-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
