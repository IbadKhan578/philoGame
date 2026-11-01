import React from 'react';
import { Volume2, VolumeX, BookOpen, HelpCircle, Home, Sparkles, Shield } from 'lucide-react';
import soundManager from '../services/audio';
import './HUD.css';

export default function HUD({
  onOpenJournal,
  onOpenHelp,
  onOpenAdmin,
  onReturnToMenu,
  discoveredCount,
  visitedPhilosophersCount,
  totalPhilosophers,
  isMuted,
  onToggleMute,
}) {
  return (
    <div className="hud-overlay">
      {/* Top Bar */}
      <header className="hud-top-bar">
        <div className="hud-brand">
          <div className="hud-logo-icon">🏛️</div>
          <div className="hud-brand-text">
            <span className="hud-title">Philosophy World</span>
            <span className="hud-version">v1.0 • 2D Exploration</span>
          </div>
        </div>

        <div className="hud-center-status">
          <div className="discovery-pill" onClick={onOpenJournal} title="Click to view Wisdom Journal">
            <Sparkles size={14} className="sparkle-gold" />
            <span>Wisdom Gathered: <strong>{discoveredCount}</strong></span>
            <span className="pill-divider">•</span>
            <span>Philosophers: <strong>{visitedPhilosophersCount}/{totalPhilosophers}</strong></span>
          </div>
        </div>

        <div className="hud-controls-group">
          {/* Wisdom Journal button */}
          <button
            className="hud-action-btn journal-btn"
            onClick={onOpenJournal}
            title="Open Wisdom Journal"
          >
            <BookOpen size={16} />
            <span className="btn-label">Journal</span>
            {discoveredCount > 0 && <span className="counter-badge">{discoveredCount}</span>}
          </button>

          {/* Audio toggle button */}
          <button
            className="hud-action-btn"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Help & Guide button */}
          <button
            className="hud-action-btn"
            onClick={onOpenHelp}
            title="How to Play"
          >
            <HelpCircle size={16} />
          </button>

          {/* Admin Council Portal button */}
          <button
            className="hud-action-btn admin-hud-btn"
            onClick={() => {
              soundManager.playPop();
              if (onOpenAdmin) onOpenAdmin();
            }}
            title="Admin Council Portal"
          >
            <Shield size={16} />
          </button>

          {/* Return to Menu button */}
          <button
            className="hud-action-btn"
            onClick={onReturnToMenu}
            title="Return to Main Menu"
          >
            <Home size={16} />
          </button>
        </div>
      </header>

      {/* Bottom Controls Reminder Pill */}
      <footer className="hud-bottom-bar">
        <div className="controls-hint-card">
          <div className="hint-keys">
            <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>▲</kbd><kbd>◄</kbd><kbd>▼</kbd><kbd>►</kbd> to Walk
          </div>
          <span className="hint-divider">|</span>
          <div className="hint-action">
            Approach Philosophers for Wisdom
          </div>
          <span className="hint-divider">|</span>
          <div className="hint-interact">
            Press <kbd>E</kbd> for Deep Dialogue
          </div>
        </div>
      </footer>
    </div>
  );
}
