import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  selectedMatch,
  currentPlayer,
  currentActionType,
  isSuccessful,
  previousActionType,
  previousActionSuccess,
  previousActionPlayer,
  currentString,
  submitString,
  lastSuccessfulZoneEnded,
  cometsSide
} from '../../data/signals';
import './PassAction.css';

function PassAction() {
  const navigate = useNavigate();

  // Local state for form fields
  const [selectedZones, setSelectedZones] = useState({
    started: lastSuccessfulZoneEnded.value,
    ended: null
  });
  const [direction, setDirection] = useState('');
  const [accuracy, setAccuracy] = useState(isSuccessful.value ? 'Complete' : '');
  const [resultIfBad, setResultIfBad] = useState('');

  // Calculate previous action display
  const getPreviousActionDisplay = () => {
    if (!previousActionType.value) {
      return 'Beginning of Play';
    }
    if (previousActionSuccess.value) {
      return previousActionType.value;
    }
    return 'Ball Won';
  };

  // Handle zone click with shift-click detection
  const handleZoneClick = (zoneNumber, event) => {
    if (event.shiftKey) {
      // Shift+Click = Zone Ended
      setSelectedZones(prev => ({ ...prev, ended: zoneNumber }));
    } else {
      // Regular Click = Zone Started
      setSelectedZones(prev => ({ ...prev, started: zoneNumber }));
    }
  };

  // Get className for zone button based on selection state
  const getZoneClassName = (zoneNumber) => {
    const classes = [];
    if (selectedZones.started === zoneNumber) classes.push('zone-started');
    if (selectedZones.ended === zoneNumber) classes.push('zone-ended');
    if (selectedZones.started === zoneNumber && selectedZones.ended === zoneNumber) {
      classes.push('zone-both');
    }
    return classes.join(' ');
  };

  // Check if Result if Bad should be shown
  const showResultIfBad = accuracy === 'Clearance' || accuracy === 'Out of Bounds';

  // Check if form is valid
  const isFormValid = () => {
    const baseValid = selectedZones.started !== null && selectedZones.ended !== null && direction && accuracy;
    if (showResultIfBad) {
      return baseValid && resultIfBad;
    }
    return baseValid;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    const actionData = {
      "Match": selectedMatch.value,
      "Action Type": "Pass",
      "Successful": isSuccessful.value,
      "Player": currentPlayer.value,
      "Previous Action": getPreviousActionDisplay(),
      "Zone Started": selectedZones.started,
      "Zone Ended": selectedZones.ended,
      "Direction": direction,
      "Accuracy": accuracy,
    };

    // Only add Result if Bad if applicable
    if (showResultIfBad) {
      actionData["Result if Bad"] = resultIfBad;
    }

    console.log('Submitting Pass Action:', actionData);

    // POST to MongoDB via backend
    try {
      const response = await fetch('http://localhost:3001/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Pass action saved to MongoDB:', result.insertedId);

        // STRING TRACKING LOGIC
        if (isSuccessful.value) {
          // Successful pass - add to current string
          currentString.value = [...currentString.value, "Pass"];
          console.log('📊 String updated (added Pass):', currentString.value);
          // Save Zone Ended for next action's auto-select
          lastSuccessfulZoneEnded.value = selectedZones.ended;
        } else {
          // Unsuccessful pass - submit current string and reset
          await submitString(selectedMatch.value, "Pass");
          console.log('📊 String submitted and reset (unsuccessful Pass)');
          // Clear zone signal on unsuccessful action
          lastSuccessfulZoneEnded.value = null;
        }
      } else {
        console.error('❌ Error saving pass action:', result.error);
        alert('Failed to save pass action. Please try again.');
        return;
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Could not connect to server. Make sure the backend is running on port 3001.');
      return;
    }

    // Update previous action signals
    previousActionType.value = 'Pass';
    previousActionSuccess.value = isSuccessful.value;
    previousActionPlayer.value = currentPlayer.value;

    // Clear current action signals
    currentPlayer.value = '';
    currentActionType.value = '';
    isSuccessful.value = false;

    // Navigate back to data collection
    navigate('/data-collection');
  };

  const handleCancel = () => {
    navigate('/data-collection');
  };

  // Calculate zone center position for arrow drawing (horizontal field: 418×298)
  const getZoneCenterPosition = (zoneNumber) => {
    const fieldWidth = 418;
    const fieldHeight = 298;
    const padding = 4;
    const gap = 2;

    const usableWidth = fieldWidth - (padding * 2);
    const usableHeight = fieldHeight - (padding * 2);

    const cellWidth = (usableWidth - (gap * 5)) / 6;
    const cellHeight = (usableHeight - (gap * 2)) / 3;

    // Zone grid positions for horizontal field (col, row, colSpan, rowSpan)
    const zonePositions = {
      1:  { col: 1, row: 2, colSpan: 1, rowSpan: 1 },
      2:  { col: 1, row: 3, colSpan: 2, rowSpan: 1 },
      3:  { col: 1, row: 1, colSpan: 2, rowSpan: 1 },
      4:  { col: 2, row: 2, colSpan: 1, rowSpan: 1 },
      5:  { col: 3, row: 3, colSpan: 1, rowSpan: 1 },
      6:  { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
      7:  { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
      8:  { col: 4, row: 3, colSpan: 1, rowSpan: 1 },
      9:  { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
      10: { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
      11: { col: 5, row: 3, colSpan: 2, rowSpan: 1 },
      12: { col: 5, row: 1, colSpan: 2, rowSpan: 1 },
      13: { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
      14: { col: 6, row: 2, colSpan: 1, rowSpan: 1 },
    };

    const pos = zonePositions[zoneNumber];

    const colStart = padding + ((pos.col - 1) * (cellWidth + gap));
    const centerX = colStart + (cellWidth * pos.colSpan) / 2;

    const rowStart = padding + ((pos.row - 1) * (cellHeight + gap));
    const centerY = rowStart + (cellHeight * pos.rowSpan) / 2;

    return { x: centerX, y: centerY };
  };

  // Arrow component for zone visualization
  const ZoneArrow = ({ startZone, endZone }) => {
    if (!startZone || !endZone || startZone === endZone) {
      return null;
    }

    const start = getZoneCenterPosition(startZone);
    const end = getZoneCenterPosition(endZone);

    return (
      <svg
        className="zone-arrow-overlay"
        viewBox="0 0 418 298"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <defs>
          <marker
            id="arrowhead-pass"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 5, 0 10"
              fill="var(--comets-red)"
            />
          </marker>
        </defs>

        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="var(--comets-red)"
          strokeWidth="3"
          markerEnd="url(#arrowhead-pass)"
        />
      </svg>
    );
  };

  return (
    <div className="pass-action-container">
      <div className="pass-action-content">
        <h1 className="action-title">Pass Action</h1>
        <div className="action-header-info">
          <span className="player-name">Player: {currentPlayer.value}</span>
          <span className={`success-badge ${isSuccessful.value ? 'success' : 'fail'}`}>
            {isSuccessful.value ? 'Successful' : 'Unsuccessful'}
          </span>
        </div>

        {/* Previous Action Display */}
        <div className="previous-action-row">
          <h3>Previous Action:</h3>
          <div className="previous-action-display">{getPreviousActionDisplay()}</div>
        </div>

        <div className="form-main">
          {/* Left Column: Single Zone Field */}
          <div className="zone-section">
            <h3>Zone Selection</h3>
            <div className="zone-labels">
              <span className="zone-label zone-started-label">
                Zone Started: {selectedZones.started || '—'}
              </span>
              <span className="zone-label-separator">|</span>
              <span className="zone-label zone-ended-label">
                Zone Ended: {selectedZones.ended || '—'}
              </span>
            </div>
            <p className="zone-instruction">Click to select Zone Started, Shift+Click for Zone Ended</p>
            <div className={`field-container ${cometsSide.value === 'right' ? 'field-rotated' : ''}`}>
              {[...Array(14)].map((_, index) => (
                <button
                  key={index}
                  className={`zone-button zone-${index + 1} ${getZoneClassName(index + 1)}`}
                  onClick={(e) => handleZoneClick(index + 1, e)}
                >
                  {index + 1}
                </button>
              ))}

              <ZoneArrow
                startZone={selectedZones.started}
                endZone={selectedZones.ended}
              />
            </div>
          </div>

          {/* Right Column: All Options */}
          <div className="options-column">
            {/* Direction */}
            <div className="form-section">
              <h3>Direction</h3>
              <div className="button-group">
                {['Forward', 'Sideways', 'Backward'].map((dir) => (
                  <button
                    key={dir}
                    className={`option-button ${direction === dir ? 'active' : ''}`}
                    onClick={() => setDirection(dir)}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* Accuracy */}
            {isSuccessful.value ? (
              // Successful pass - show Complete as auto-filled (read-only display)
              <div className="form-section">
                <h3>Accuracy</h3>
                <div className="accuracy-display">Complete</div>
              </div>
            ) : (
              // Unsuccessful pass - show options without Complete
              <div className="form-section">
                <h3>Accuracy</h3>
                <div className="button-group">
                  {['Incomplete', 'Clearance', 'Out of Bounds'].map((acc) => (
                    <button
                      key={acc}
                      className={`option-button ${accuracy === acc ? 'active' : ''}`}
                      onClick={() => {
                        setAccuracy(acc);
                        // Clear Result if Bad if accuracy changes to non-applicable value
                        if (acc !== 'Clearance' && acc !== 'Out of Bounds') {
                          setResultIfBad('');
                        }
                      }}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Result if Bad (Conditional) */}
            {showResultIfBad && (
              <div className="form-section">
                <h3>Result if Bad</h3>
                <div className="button-group-vertical">
                  {['Top of the Box', '3 Lines Restart', 'Side Kick In', 'Ball Won', 'Ball Lost'].map((result) => (
                    <button
                      key={result}
                      className={`option-button ${resultIfBad === result ? 'active' : ''}`}
                      onClick={() => setResultIfBad(result)}
                    >
                      {result}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="action-buttons">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Submit Action
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default PassAction;
