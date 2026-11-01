import React from 'react';
import './SpeechBubble.css';

export default function SpeechBubble({ activeData, onOpenModal }) {
  if (!activeData || !activeData.philosopher) return null;

  const { philosopher, wisdom, screenX, screenY, isLoading } = activeData;

  const rawX = (screenX !== undefined && !isNaN(screenX)) ? screenX : (window.innerWidth / 2);
  const rawY = (screenY !== undefined && !isNaN(screenY)) ? screenY : (window.innerHeight / 2);

  // Position thought cloud comfortably above philosopher head, keeping within window bounds
  const clampedX = Math.max(170, Math.min(window.innerWidth - 170, rawX));
  const clampedY = Math.max(135, Math.min(window.innerHeight - 70, rawY - 75));

  const cloudStyle = {
    left: `${clampedX}px`,
    top: `${clampedY}px`,
  };

  return (
    <div className="thought-cloud-wrapper" style={cloudStyle}>
      <div className="thought-cloud-container" onClick={onOpenModal}>
        {/* Puffy Cloud Border Lobes */}
        <div className="cloud-lobe lobe-top-1" />
        <div className="cloud-lobe lobe-top-2" />
        <div className="cloud-lobe lobe-top-3" />
        <div className="cloud-lobe lobe-right" />
        <div className="cloud-lobe lobe-bottom-1" />
        <div className="cloud-lobe lobe-bottom-2" />
        <div className="cloud-lobe lobe-left" />

        {/* Thought Cloud Content */}
        <div className="thought-cloud-inner">
          <div className="thought-cloud-header">
            {philosopher.face_image ? (
              <span className="thought-author">
                <img src={philosopher.face_image} alt="" className="thought-author-avatar" />
                <span>{philosopher.name}</span>
              </span>
            ) : (
              <span className="thought-author">💭 {philosopher.name}</span>
            )}
          </div>

          <div className="thought-cloud-body">
            {isLoading ? (
              <div className="thought-contemplating">
                <span className="thought-sparkle">✨</span>
                <span>Contemplating deep thoughts...</span>
              </div>
            ) : wisdom ? (
              <>
                <p className="thought-quote">“{wisdom.quote}”</p>
                {wisdom.source && (
                  <div className="thought-source">— {wisdom.source}</div>
                )}
              </>
            ) : (
              <p className="thought-quote">Gathering wisdom from the cosmos...</p>
            )}
          </div>

          {!isLoading && wisdom && (
            <div className="thought-cloud-footer">
              <span className="thought-action-prompt">
                Press <kbd>E</kbd> or click cloud to reflect
              </span>
            </div>
          )}
        </div>

        {/* Comic Trailing Thought Cloud Bubbles */}
        <div className="trailing-bubble bubble-large" />
        <div className="trailing-bubble bubble-medium" />
        <div className="trailing-bubble bubble-small" />
      </div>
    </div>
  );
}
