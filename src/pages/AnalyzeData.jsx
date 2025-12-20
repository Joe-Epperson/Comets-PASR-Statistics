import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { selectedMatch, selectedPlayers } from '../data/signals';
import { matches } from '../data/matches';
import { players } from '../data/players';
import { getActionCount, parseOpponent } from '../services/api';
import './AnalyzeData.css';

function AnalyzeData() {
  const navigate = useNavigate();

  // Local state for report configuration
  const [reportMatch, setReportMatch] = useState(selectedMatch.value || '');
  const [reportPlayers, setReportPlayers] = useState(
    selectedPlayers.value.length === 16 ? [...selectedPlayers.value] : []
  );
  const [cometsScore, setCometsScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [actionCount, setActionCount] = useState(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);

  // Fetch action count when match changes
  useEffect(() => {
    if (reportMatch) {
      setIsLoadingCount(true);
      getActionCount(reportMatch)
        .then(data => {
          setActionCount(data);
          setIsLoadingCount(false);
        })
        .catch(err => {
          console.error('Error fetching action count:', err);
          setActionCount(null);
          setIsLoadingCount(false);
        });
    } else {
      setActionCount(null);
    }
  }, [reportMatch]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleMatchChange = (e) => {
    setReportMatch(e.target.value);
  };

  const handlePlayerToggle = (player) => {
    const isSelected = reportPlayers.includes(player);

    if (isSelected) {
      setReportPlayers(reportPlayers.filter(p => p !== player));
    } else if (reportPlayers.length < 16) {
      setReportPlayers([...reportPlayers, player]);
    }
  };

  const handleClearAll = () => {
    setReportPlayers([]);
  };

  const handleClearForm = () => {
    setReportMatch('');
    setReportPlayers([]);
    setCometsScore('');
    setOpponentScore('');
    setActionCount(null);
  };

  const isFormValid = () => {
    return (
      reportMatch &&
      reportPlayers.length === 16 &&
      cometsScore !== '' &&
      opponentScore !== '' &&
      !isNaN(parseInt(cometsScore)) &&
      !isNaN(parseInt(opponentScore))
    );
  };

  const handleGeneratePreview = () => {
    if (!isFormValid()) return;

    // Build URL params for report page
    const params = new URLSearchParams();
    params.append('match', reportMatch);
    params.append('cometsScore', cometsScore);
    params.append('opponentScore', opponentScore);
    reportPlayers.forEach(player => params.append('players', player));

    // Navigate to report page with params
    navigate(`/report/match?${params.toString()}`);
  };

  const opponent = reportMatch ? parseOpponent(reportMatch) : 'Opponent';

  return (
    <div className="analyze-container">
      <div className="analyze-content">
        <header className="analyze-header">
          <button className="back-btn" onClick={handleBackToHome}>
            Back
          </button>
          <h1 className="analyze-title">Data Analysis</h1>
          <div className="header-spacer"></div>
        </header>

        <div className="report-type-selector">
          <label className="report-type-option selected">
            <input type="radio" name="reportType" value="match" defaultChecked />
            <span>Match Report</span>
          </label>
          <label className="report-type-option disabled">
            <input type="radio" name="reportType" value="player" disabled />
            <span>Player Report</span>
          </label>
          <label className="report-type-option disabled">
            <input type="radio" name="reportType" value="season" disabled />
            <span>Season Report</span>
          </label>
        </div>

        <div className="analyze-grid">
          {/* Left Column: Player Selection */}
          <div className="player-section">
            <div className="section-header">
              <h3 className="section-title">Match Roster</h3>
              <button
                className="clear-btn"
                onClick={handleClearAll}
                disabled={reportPlayers.length === 0}
              >
                Clear All
              </button>
            </div>

            <div className="player-counter">
              <span className={reportPlayers.length === 16 ? 'complete' : ''}>
                Selected: {reportPlayers.length}/16
              </span>
            </div>

            <div className="player-grid">
              {players.map((player, index) => (
                <label
                  key={index}
                  className={`player-label ${
                    reportPlayers.length >= 16 && !reportPlayers.includes(player) ? 'disabled' : ''
                  } ${reportPlayers.includes(player) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={reportPlayers.includes(player)}
                    onChange={() => handlePlayerToggle(player)}
                    disabled={reportPlayers.length >= 16 && !reportPlayers.includes(player)}
                    className="player-check"
                  />
                  <span className="player-name">{player}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column: Match & Score Selection */}
          <div className="config-section">
            <div className="match-box">
              <h3 className="section-title">Match Selection</h3>
              <select
                className="match-dropdown"
                value={reportMatch}
                onChange={handleMatchChange}
              >
                <option value="">-- Select a Match --</option>
                {matches.map((match, index) => (
                  <option key={index} value={match}>
                    {match}
                  </option>
                ))}
              </select>
            </div>

            <div className="score-box">
              <h3 className="section-title">Final Score</h3>
              <div className="score-inputs">
                <div className="score-team">
                  <label>KC Comets</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={cometsScore}
                    onChange={(e) => setCometsScore(e.target.value)}
                    className="score-input"
                    placeholder="0"
                  />
                </div>
                <span className="score-separator">-</span>
                <div className="score-team">
                  <label>{opponent}</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={opponentScore}
                    onChange={(e) => setOpponentScore(e.target.value)}
                    className="score-input"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="data-check-box">
              <h3 className="section-title">Data Check</h3>
              {isLoadingCount ? (
                <p className="data-status loading">Loading action count...</p>
              ) : actionCount ? (
                <div className="data-status success">
                  <span className="check-icon">&#10003;</span>
                  <span>{actionCount.count} actions recorded</span>
                  <div className="breakdown">
                    ({actionCount.breakdown.passes} passes,{' '}
                    {actionCount.breakdown.shots} shots,{' '}
                    {actionCount.breakdown.dribbles} dribbles)
                  </div>
                </div>
              ) : reportMatch ? (
                <p className="data-status warning">No actions recorded for this match</p>
              ) : (
                <p className="data-status">Select a match to check data</p>
              )}
            </div>

            <div className="button-group">
              <button
                className="primary-btn"
                onClick={handleGeneratePreview}
                disabled={!isFormValid()}
              >
                Generate Report Preview
              </button>
              <button
                className="secondary-btn"
                onClick={handleClearForm}
              >
                Clear Form
              </button>
            </div>

            {!isFormValid() && (
              <div className="validation-box">
                {!reportMatch && <p>Select a match</p>}
                {reportPlayers.length !== 16 && (
                  <p>Select 16 players ({reportPlayers.length}/16)</p>
                )}
                {(cometsScore === '' || opponentScore === '') && (
                  <p>Enter final score</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyzeData;
