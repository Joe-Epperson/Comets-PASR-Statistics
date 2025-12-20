import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getReportPreview,
  saveMatchReport,
  getMatchReport,
  parseOpponent,
  parseLocation,
  parseDate,
  getSuccessRateColorClass,
  getComparisonColorClass,
  formatComparison
} from '../../services/api';
import cometsLogo from '../../assets/Comets Logo White Background.png';
import './MatchReport.css';

function MatchReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract params from URL
  const match = searchParams.get('match') || '';
  const cometsScore = parseInt(searchParams.get('cometsScore') || '0', 10);
  const opponentScore = parseInt(searchParams.get('opponentScore') || '0', 10);
  const players = searchParams.getAll('players');

  // State
  const [reportData, setReportData] = useState(null);
  const [seasonAverages, setSeasonAverages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Parsed match info
  const opponent = parseOpponent(match);
  const location = parseLocation(match);
  const matchDate = parseDate(match);

  // Fetch report data on mount
  useEffect(() => {
    if (!match || players.length !== 16) {
      setError('Invalid report parameters. Please go back and try again.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Check if report already exists
        const existingReport = await getMatchReport(match);
        if (existingReport) {
          setIsFinalized(true);
        }

        // Get fresh preview data
        const preview = await getReportPreview(match, players);
        setReportData(preview);
        setSeasonAverages(preview.seasonAverages);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Failed to load report data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [match, players]);

  // Calculate comparison to season average (overall)
  const calculateComparison = (playerRate, player) => {
    if (!seasonAverages || !seasonAverages.players || !seasonAverages.players[player]) {
      return 0; // First match, show 0.0%
    }
    const seasonRate = seasonAverages.players[player].successRate;
    return Math.round((playerRate - seasonRate) * 10) / 10;
  };

  // Calculate action-specific comparisons
  // Note: Returns 0 if no season data exists for this action type
  const calculatePassComparison = (playerRate, player) => {
    if (!seasonAverages || !seasonAverages.players || !seasonAverages.players[player]) {
      return 0;
    }
    const playerSeasonData = seasonAverages.players[player];
    if (!playerSeasonData.passes || playerSeasonData.passes.total === 0) {
      return 0;
    }
    const seasonRate = Math.round((playerSeasonData.passes.successful / playerSeasonData.passes.total) * 100);
    return Math.round((playerRate - seasonRate) * 10) / 10;
  };

  const calculateShotComparison = (playerRate, player) => {
    if (!seasonAverages || !seasonAverages.players || !seasonAverages.players[player]) {
      return 0;
    }
    const playerSeasonData = seasonAverages.players[player];
    if (!playerSeasonData.shots || playerSeasonData.shots.total === 0) {
      return 0;
    }
    const seasonRate = Math.round((playerSeasonData.shots.successful / playerSeasonData.shots.total) * 100);
    return Math.round((playerRate - seasonRate) * 10) / 10;
  };

  const calculateDribbleComparison = (playerRate, player) => {
    if (!seasonAverages || !seasonAverages.players || !seasonAverages.players[player]) {
      return 0;
    }
    const playerSeasonData = seasonAverages.players[player];
    if (!playerSeasonData.dribbles || playerSeasonData.dribbles.total === 0) {
      return 0;
    }
    const seasonRate = Math.round((playerSeasonData.dribbles.successful / playerSeasonData.dribbles.total) * 100);
    return Math.round((playerRate - seasonRate) * 10) / 10;
  };

  const calculateTeamComparison = () => {
    if (!seasonAverages || !seasonAverages.team || seasonAverages.matchCount === 0) {
      return 0;
    }
    return Math.round((reportData.totals.successRate - seasonAverages.team.successRate) * 10) / 10;
  };

  // Calculate comparison for strings - returns 0 if no previous finalized matches
  const calculateStringsComparison = () => {
    const currentTotal = reportData.stringStats?.total || 0;
    const avgPerMatch = seasonAverages?.strings?.avgPerMatch || 0;

    // If no finalized matches exist, avgPerMatch will be 0, so comparison is meaningless
    // Show 0 comparison in this case
    if (!seasonAverages || seasonAverages.matchCount === 0 || avgPerMatch === 0) {
      return 0;
    }

    return Math.round((currentTotal - avgPerMatch) * 10) / 10;
  };

  // Calculate comparison for set pieces - returns 0 if no previous finalized matches
  const calculateSetPiecesComparison = () => {
    const currentTotal = reportData.setPieceStats?.total || 0;
    const avgPerMatch = seasonAverages?.setPieces?.avgPerMatch || 0;

    // If no finalized matches exist, avgPerMatch will be 0, so comparison is meaningless
    // Show 0 comparison in this case
    if (!seasonAverages || seasonAverages.matchCount === 0 || avgPerMatch === 0) {
      return 0;
    }

    return Math.round((currentTotal - avgPerMatch) * 10) / 10;
  };

  // Sort players by success rate (highest first)
  const getSortedPlayers = () => {
    if (!reportData || !reportData.playerStats) return [];
    return [...reportData.playerStats].sort((a, b) => {
      // Players with 0 actions go to the bottom
      if (a.actions === 0 && b.actions > 0) return 1;
      if (b.actions === 0 && a.actions > 0) return -1;
      return b.successRate - a.successRate;
    });
  };

  // Get players sorted by passing success rate
  const getSortedPlayersByPassing = () => {
    if (!reportData || !reportData.playerStats) return [];
    return [...reportData.playerStats].map(player => {
      const total = player.passes?.total || 0;
      const successful = player.passes?.successful || 0;
      const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
      return { ...player, passRate: rate, passTotal: total, passSuccessful: successful };
    }).sort((a, b) => {
      if (a.passTotal === 0 && b.passTotal > 0) return 1;
      if (b.passTotal === 0 && a.passTotal > 0) return -1;
      return b.passRate - a.passRate;
    });
  };

  // Get players sorted by shooting success rate
  const getSortedPlayersByShooting = () => {
    if (!reportData || !reportData.playerStats) return [];
    return [...reportData.playerStats].map(player => {
      const total = player.shots?.total || 0;
      const successful = player.shots?.successful || 0;
      const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
      return { ...player, shotRate: rate, shotTotal: total, shotSuccessful: successful };
    }).sort((a, b) => {
      if (a.shotTotal === 0 && b.shotTotal > 0) return 1;
      if (b.shotTotal === 0 && a.shotTotal > 0) return -1;
      return b.shotRate - a.shotRate;
    });
  };

  // Get players sorted by dribbling success rate
  const getSortedPlayersByDribbling = () => {
    if (!reportData || !reportData.playerStats) return [];
    return [...reportData.playerStats].map(player => {
      const total = player.dribbles?.total || 0;
      const successful = player.dribbles?.successful || 0;
      const rate = total > 0 ? Math.round((successful / total) * 100) : 0;
      return { ...player, dribbleRate: rate, dribbleTotal: total, dribbleSuccessful: successful };
    }).sort((a, b) => {
      if (a.dribbleTotal === 0 && b.dribbleTotal > 0) return 1;
      if (b.dribbleTotal === 0 && a.dribbleTotal > 0) return -1;
      return b.dribbleRate - a.dribbleRate;
    });
  };

  // Sort lineup by jersey number
  const getSortedLineup = () => {
    return [...players].sort((a, b) => {
      const numA = parseInt(a.split(' - ')[0], 10);
      const numB = parseInt(b.split(' - ')[0], 10);
      return numA - numB;
    });
  };

  // Calculate action type totals
  const getActionBreakdown = () => {
    if (!reportData || !reportData.playerStats) {
      return { passes: { total: 0, successful: 0 }, shots: { total: 0, successful: 0 }, dribbles: { total: 0, successful: 0 } };
    }

    const breakdown = {
      passes: { total: 0, successful: 0 },
      shots: { total: 0, successful: 0 },
      dribbles: { total: 0, successful: 0 }
    };

    reportData.playerStats.forEach(player => {
      breakdown.passes.total += player.passes?.total || 0;
      breakdown.passes.successful += player.passes?.successful || 0;
      breakdown.shots.total += player.shots?.total || 0;
      breakdown.shots.successful += player.shots?.successful || 0;
      breakdown.dribbles.total += player.dribbles?.total || 0;
      breakdown.dribbles.successful += player.dribbles?.successful || 0;
    });

    return breakdown;
  };

  // Get top set piece players (by participation count, then success rate)
  const getTopSetPiecePlayers = () => {
    if (!reportData || !reportData.setPieceStats || !reportData.setPieceStats.playerSetPieces) {
      return [];
    }

    const playerSetPieces = reportData.setPieceStats.playerSetPieces;

    return Object.entries(playerSetPieces)
      .map(([playerName, stats]) => ({
        player: playerName,
        ...stats
      }))
      .filter(p => p.totalParticipation > 0)
      .sort((a, b) => {
        // Sort by total participation first
        if (b.totalParticipation !== a.totalParticipation) {
          return b.totalParticipation - a.totalParticipation;
        }
        // Then by overall success rate
        const aRate = a.byRole?.onBall?.successRate || 0;
        const bRate = b.byRole?.onBall?.successRate || 0;
        return bRate - aRate;
      })
      .slice(0, 3); // Top 3 players
  };

  // Calculate set piece zone heatmap data
  const getSetPieceZoneData = (filterType) => {
    if (!reportData || !reportData.setPieceStats || !reportData.setPieceStats.zones) {
      return {};
    }

    const zones = reportData.setPieceStats.zones;
    const zoneData = {};

    Object.entries(zones).forEach(([zoneNum, data]) => {
      if (filterType === 'all') {
        zoneData[zoneNum] = data.count || 0;
      } else if (filterType === 'successful') {
        zoneData[zoneNum] = data.successful || 0;
      } else if (filterType === 'goals') {
        zoneData[zoneNum] = data.goals || 0;
      }
    });

    return zoneData;
  };

  // Handle finalize
  const handleFinalize = async () => {
    if (isFinalized) {
      setShowConfirmDialog(true);
      return;
    }
    await saveReport();
  };

  const saveReport = async () => {
    setIsSaving(true);
    try {
      const reportToSave = {
        match,
        opponent,
        location,
        score: {
          comets: cometsScore,
          opponent: opponentScore
        },
        roster: players,
        totals: reportData.totals,
        playerStats: reportData.playerStats,
        zoneDistribution: reportData.zoneDistribution,
        stringStats: reportData.stringStats,
        setPieceStats: reportData.setPieceStats,
        shotStats: reportData.shotStats,
        passStats: reportData.passStats,
        dribbleStats: reportData.dribbleStats
      };

      await saveMatchReport(reportToSave);
      setIsFinalized(true);
      setShowConfirmDialog(false);
    } catch (err) {
      console.error('Error saving report:', err);
      alert('Failed to save report. Please try again.');
    }
    setIsSaving(false);
  };

  const handleBack = () => {
    navigate('/analyze-data');
  };

  if (isLoading) {
    return (
      <div className="report-container">
        <div className="loading-message">Loading report data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleBack}>Back to Analysis</button>
        </div>
      </div>
    );
  }

  const sortedPlayers = getSortedPlayers();
  const sortedLineup = getSortedLineup();
  const teamComparison = calculateTeamComparison();
  const actionBreakdown = getActionBreakdown();

  return (
    <div className="report-container">
      {/* Controls - Hidden in print */}
      <div className="report-controls no-print">
        <button className="back-btn" onClick={handleBack}>
          Back to Analysis
        </button>
        <button
          className={`finalize-btn ${isFinalized ? 'finalized' : ''}`}
          onClick={handleFinalize}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : isFinalized ? 'Update Report' : 'Finalize Report'}
        </button>
        <button className="print-btn" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="dialog-overlay no-print">
          <div className="dialog-box">
            <h3>Update Existing Report?</h3>
            <p>A report for this match already exists. Do you want to update it with the current data?</p>
            <div className="dialog-buttons">
              <button onClick={saveReport} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Yes, Update'}
              </button>
              <button onClick={() => setShowConfirmDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Page 1: Overview */}
      <div className="report-page page-1">
        {/* Logo - Absolute positioned */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Header */}
        <header className="report-header">
          <h1 className="team-matchup">
            KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}
          </h1>
          <p className="match-date">{matchDate}</p>
          <h2 className="report-title">MATCH REPORT</h2>
          <div className="final-score">
            <span className="score-value">{cometsScore}</span>
            <span className="score-dash">-</span>
            <span className="score-value">{opponentScore}</span>
          </div>
        </header>

        {/* Lineup Section */}
        <section className="lineup-section">
          <h3 className="section-heading">MATCH LINEUP</h3>
          <div className="lineup-grid">
            {sortedLineup.map((player, index) => (
              <div key={index} className="lineup-player">
                {player}
              </div>
            ))}
          </div>
        </section>

        {/* Overall Performance */}
        <section className="performance-section">
          <h3 className="section-heading">OVERALL MATCH PERFORMANCE</h3>
          <div className="performance-grid">
            <div className="performance-main">
              <div className="stat-box highlight">
                <span className="stat-big">{reportData.totals.successRate}%</span>
                <span className="stat-label">Success Rate</span>
                <span className={`comparison ${getComparisonColorClass(teamComparison)}`}>
                  {formatComparison(teamComparison)} vs season
                </span>
              </div>
              <div className="stat-row">
                <div className="stat-mini">
                  <span className="stat-num">{reportData.totals.actions}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-mini success">
                  <span className="stat-num">{reportData.totals.successful}</span>
                  <span className="stat-label">Successful</span>
                </div>
                <div className="stat-mini fail">
                  <span className="stat-num">{reportData.totals.unsuccessful}</span>
                  <span className="stat-label">Unsuccessful</span>
                </div>
              </div>
            </div>
            <div className="performance-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Passes</span>
                <span className="breakdown-value">{actionBreakdown.passes.successful}/{actionBreakdown.passes.total}</span>
                <span className="breakdown-pct">
                  {actionBreakdown.passes.total > 0
                    ? Math.round((actionBreakdown.passes.successful / actionBreakdown.passes.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Dribbles</span>
                <span className="breakdown-value">{actionBreakdown.dribbles.successful}/{actionBreakdown.dribbles.total}</span>
                <span className="breakdown-pct">
                  {actionBreakdown.dribbles.total > 0
                    ? Math.round((actionBreakdown.dribbles.successful / actionBreakdown.dribbles.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Shots</span>
                <span className="breakdown-value">{actionBreakdown.shots.successful}/{actionBreakdown.shots.total}</span>
                <span className="breakdown-pct">
                  {actionBreakdown.shots.total > 0
                    ? Math.round((actionBreakdown.shots.successful / actionBreakdown.shots.total) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Field Tilt & Match Stats */}
        <section className="zone-stats-section">
          <div className="zone-stats-grid">
            {/* Field Tilt */}
            <div className="zone-activity">
              <div className="section-header-with-desc">
                <h3 className="section-heading">FIELD TILT</h3>
                <p className="section-desc">Share of actions by thirds</p>
              </div>
              <div className="zone-field">
                {(() => {
                  const zones = reportData.zoneDistribution || { defensive: 0, middle: 0, attacking: 0 };
                  const total = zones.defensive + zones.middle + zones.attacking;
                  const maxCount = Math.max(zones.defensive, zones.middle, zones.attacking, 1);

                  const getHeatColor = (count) => {
                    if (total === 0) return '#1a4d7c';
                    const intensity = count / maxCount;
                    // Use darker blue range for better text contrast
                    const baseColor = 20 + Math.round(intensity * 35); // 20-55 range for dark blues
                    return `hsl(210, 80%, ${baseColor}%)`;
                  };

                  const getPercentage = (count) => {
                    if (total === 0) return '0.0';
                    return (count / total * 100).toFixed(1);
                  };

                  return (
                    <>
                      <div className="zone-third attacking-third" style={{ backgroundColor: getHeatColor(zones.attacking) }}>
                        <span className="zone-count">{zones.attacking}</span>
                        <span className="zone-pct">{getPercentage(zones.attacking)}%</span>
                        <span className="zone-label">Attacking</span>
                      </div>
                      <div className="zone-third middle-third" style={{ backgroundColor: getHeatColor(zones.middle) }}>
                        <span className="zone-count">{zones.middle}</span>
                        <span className="zone-pct">{getPercentage(zones.middle)}%</span>
                        <span className="zone-label">Middle</span>
                      </div>
                      <div className="zone-third defensive-third" style={{ backgroundColor: getHeatColor(zones.defensive) }}>
                        <span className="zone-count">{zones.defensive}</span>
                        <span className="zone-pct">{getPercentage(zones.defensive)}%</span>
                        <span className="zone-label">Defensive</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Strings & Set Pieces */}
            <div className="match-extras">
              {/* Strings Summary */}
              <div className="extras-box">
                <h3 className="section-heading">STRINGS</h3>
                <div className="extras-content">
                  <div className="extras-main">
                    <span className="extras-big">{reportData.stringStats?.total || 0}</span>
                    <span className="extras-label">Total Strings</span>
                  </div>
                  <div className="extras-details">
                    <div className="extras-stat">
                      <span className="extras-value">{reportData.stringStats?.avgActionLength || 0}</span>
                      <span className="extras-desc">Avg Length</span>
                    </div>
                    <div className="extras-stat">
                      <span className="extras-value">{reportData.stringStats?.longestAction || 0}</span>
                      <span className="extras-desc">Longest</span>
                    </div>
                    <div className="extras-stat">
                      <span className={`extras-value ${getComparisonColorClass(calculateStringsComparison())}`}>
                        {formatComparison(calculateStringsComparison())}
                      </span>
                      <span className="extras-desc">vs Avg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Set Pieces Summary */}
              <div className="extras-box">
                <h3 className="section-heading">SET PIECES</h3>
                <div className="extras-content">
                  <div className="extras-main">
                    <span className="extras-big">{reportData.setPieceStats?.total || 0}</span>
                    <span className="extras-label">Total Set Pieces</span>
                  </div>
                  <div className="extras-details">
                    <div className="extras-stat">
                      <span className="extras-value">{reportData.setPieceStats?.successful || 0}</span>
                      <span className="extras-desc">Successful</span>
                    </div>
                    <div className="extras-stat">
                      <span className="extras-value">{reportData.setPieceStats?.conversionRate || 0}%</span>
                      <span className="extras-desc">On Target</span>
                    </div>
                    <div className="extras-stat">
                      <span className={`extras-value ${getComparisonColorClass(calculateSetPiecesComparison())}`}>
                        {formatComparison(calculateSetPiecesComparison())}
                      </span>
                      <span className="extras-desc">vs Avg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Status Badge */}
        {isFinalized && (
          <div className="finalized-badge no-print">
            Report Finalized
          </div>
        )}

      </div>

      {/* Page 2: Overall Success Rates + Passing Success Rates */}
      <div className="report-page page-2">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Player Performance Breakdown</p>
        </header>

        {/* Overall Player Success Rates */}
        <section className="player-rates-section">
          <div className="section-header-with-desc">
            <h3 className="section-heading">OVERALL SUCCESS RATES</h3>
            <p className="section-desc">All actions combined (passes, dribbles, shots)</p>
          </div>
          <div className="player-rates-grid">
            {sortedPlayers.map((player, index) => {
              const comparison = calculateComparison(player.successRate, player.player);
              const hasActions = player.actions > 0;
              const colorClass = hasActions ? getSuccessRateColorClass(player.successRate) : 'rate-no-actions';

              return (
                <div key={index} className={`player-rate-card ${colorClass}`}>
                  <div className="player-rate-top">
                    <span className="player-rate-pct">
                      {hasActions ? `${player.successRate}%` : '-'}
                    </span>
                    <span className={`player-rate-comp ${hasActions ? getComparisonColorClass(comparison) : 'compare-neutral'}`}>
                      {formatComparison(comparison)}
                    </span>
                  </div>
                  <div className="player-rate-name">{player.player}</div>
                  <div className="player-rate-count">
                    {player.successful}/{player.actions} actions
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Passing Success Rates */}
        <section className="player-rates-section">
          <div className="section-header-with-desc">
            <h3 className="section-heading">PASSING SUCCESS RATES</h3>
            <p className="section-desc">Successful passes vs total passes attempted</p>
          </div>
          <div className="player-rates-grid">
            {getSortedPlayersByPassing().map((player, index) => {
              const hasActions = player.passTotal > 0;
              const comparison = calculatePassComparison(player.passRate, player.player);
              const colorClass = hasActions ? getSuccessRateColorClass(player.passRate) : 'rate-no-actions';

              return (
                <div key={index} className={`player-rate-card ${colorClass}`}>
                  <div className="player-rate-top">
                    <span className="player-rate-pct">
                      {hasActions ? `${player.passRate}%` : '-'}
                    </span>
                    <span className={`player-rate-comp ${hasActions ? getComparisonColorClass(comparison) : 'compare-neutral'}`}>
                      {formatComparison(comparison)}
                    </span>
                  </div>
                  <div className="player-rate-name">{player.player}</div>
                  <div className="player-rate-count">
                    {player.passSuccessful}/{player.passTotal} passes
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Page 3: Shooting Success Rates + Dribbling Success Rates */}
      <div className="report-page page-3">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Player Performance Breakdown</p>
        </header>

        {/* Shooting Success Rates */}
        <section className="player-rates-section">
          <div className="section-header-with-desc">
            <h3 className="section-heading">SHOOTING SUCCESS RATES</h3>
            <p className="section-desc">Shots on target vs total shots taken</p>
          </div>
          <div className="player-rates-grid">
            {getSortedPlayersByShooting().map((player, index) => {
              const hasActions = player.shotTotal > 0;
              const comparison = calculateShotComparison(player.shotRate, player.player);
              const colorClass = hasActions ? getSuccessRateColorClass(player.shotRate) : 'rate-no-actions';

              return (
                <div key={index} className={`player-rate-card ${colorClass}`}>
                  <div className="player-rate-top">
                    <span className="player-rate-pct">
                      {hasActions ? `${player.shotRate}%` : '-'}
                    </span>
                    <span className={`player-rate-comp ${hasActions ? getComparisonColorClass(comparison) : 'compare-neutral'}`}>
                      {formatComparison(comparison)}
                    </span>
                  </div>
                  <div className="player-rate-name">{player.player}</div>
                  <div className="player-rate-count">
                    {player.shotSuccessful}/{player.shotTotal} shots
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Dribbling Success Rates */}
        <section className="player-rates-section">
          <div className="section-header-with-desc">
            <h3 className="section-heading">DRIBBLING SUCCESS RATES</h3>
            <p className="section-desc">Successful dribbles vs total dribble attempts</p>
          </div>
          <div className="player-rates-grid">
            {getSortedPlayersByDribbling().map((player, index) => {
              const hasActions = player.dribbleTotal > 0;
              const comparison = calculateDribbleComparison(player.dribbleRate, player.player);
              const colorClass = hasActions ? getSuccessRateColorClass(player.dribbleRate) : 'rate-no-actions';

              return (
                <div key={index} className={`player-rate-card ${colorClass}`}>
                  <div className="player-rate-top">
                    <span className="player-rate-pct">
                      {hasActions ? `${player.dribbleRate}%` : '-'}
                    </span>
                    <span className={`player-rate-comp ${hasActions ? getComparisonColorClass(comparison) : 'compare-neutral'}`}>
                      {formatComparison(comparison)}
                    </span>
                  </div>
                  <div className="player-rate-name">{player.player}</div>
                  <div className="player-rate-count">
                    {player.dribbleSuccessful}/{player.dribbleTotal} dribbles
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* Page 4: Shot Zone Analysis */}
      <div className="report-page page-4">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Shot Zone Analysis</p>
        </header>

        {/* Team Shot Totals Header */}
        <section className="shot-totals-header">
          {(() => {
            const shotStats = reportData.shotStats || { total: 0, successful: 0, goals: 0 };
            const seasonShots = seasonAverages?.team?.shots || { avgPerMatch: 0, avgSuccessRate: 0, avgGoalsPerMatch: 0 };
            const successRate = shotStats.total > 0 ? Math.round((shotStats.successful / shotStats.total) * 1000) / 10 : 0;

            const shotsComparison = seasonAverages?.matchCount > 0 ? Math.round((shotStats.total - seasonShots.avgPerMatch) * 10) / 10 : 0;
            const successComparison = seasonAverages?.matchCount > 0 ? Math.round((successRate - seasonShots.avgSuccessRate) * 10) / 10 : 0;
            const goalsComparison = seasonAverages?.matchCount > 0 ? Math.round((shotStats.goals - seasonShots.avgGoalsPerMatch) * 10) / 10 : 0;

            return (
              <div className="shot-totals-grid">
                <div className="shot-total-item">
                  <span className="shot-total-value">{shotStats.total}</span>
                  <span className="shot-total-label">Total Shots</span>
                  <span className={`shot-total-comp ${getComparisonColorClass(shotsComparison)}`}>
                    {shotsComparison >= 0 ? '+' : ''}{shotsComparison} vs avg
                  </span>
                </div>
                <div className="shot-total-item">
                  <span className="shot-total-value">{shotStats.successful} ({successRate}%)</span>
                  <span className="shot-total-label">Successful</span>
                  <span className={`shot-total-comp ${getComparisonColorClass(successComparison)}`}>
                    {successComparison >= 0 ? '+' : ''}{successComparison}% vs avg
                  </span>
                </div>
                <div className="shot-total-item">
                  <span className="shot-total-value">
                    {shotStats.goals} ({shotStats.total > 0 ? Math.round((shotStats.goals / shotStats.total) * 100) : 0}%)
                  </span>
                  <span className="shot-total-label">Goals</span>
                  <span className={`shot-total-comp ${getComparisonColorClass(goalsComparison)}`}>
                    {goalsComparison >= 0 ? '+' : ''}{goalsComparison} vs avg
                  </span>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Zone Heatmap Fields - 3 Column Layout */}
        <section className="shot-zones-section">
          <div className="shot-zones-three-col">
            {/* Left: Large All Shots Field with Success Rates */}
            <div className="all-shots-column">
              <h4 className="zone-field-title">ALL SHOTS</h4>
              <div className="zone-field-container-large blue-heatmap">
                {(() => {
                  const zones = reportData.shotStats?.zones || {};
                  const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                    const intensity = zoneData.count / maxCount;
                    const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                    const bgColor = `hsl(210, 70%, ${lightness}%)`;
                    const successRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-large zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {zoneData.count > 0 && (
                          <div className="zone-cell-content">
                            <span className="zone-cell-count-large">{zoneData.count}</span>
                            <span className={`zone-cell-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}%</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Right: Top row with 3 fields, Goalscorers below */}
            <div className="middle-fields-column">
              {/* Top row: 3 fields horizontal */}
              <div className="middle-fields-top-row">
                {/* Successful Shots Field */}
                <div className="shot-zone-field-med">
                  <h4 className="zone-field-title-med">SUCCESSFUL</h4>
                  <div className="zone-field-container-med green-heatmap">
                    {(() => {
                      const zones = reportData.shotStats?.zones || {};
                      const maxCount = Math.max(...Object.values(zones).map(z => z.successful || 0), 1);
                      return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                        const zoneData = zones[zoneNum] || { successful: 0 };
                        const intensity = zoneData.successful / maxCount;
                        const lightness = zoneData.successful > 0 ? 85 - (intensity * 50) : 95;
                        const bgColor = `hsl(120, 50%, ${lightness}%)`;

                        return (
                          <div
                            key={zoneNum}
                            className={`zone-cell-med zone-${zoneNum}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            <span className="zone-cell-count-med">{zoneData.successful || ''}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Unsuccessful Shots Field */}
                <div className="shot-zone-field-med">
                  <h4 className="zone-field-title-med">UNSUCCESSFUL</h4>
                  <div className="zone-field-container-med red-heatmap">
                    {(() => {
                      const zones = reportData.shotStats?.zones || {};
                      const maxCount = Math.max(...Object.values(zones).map(z => (z.count || 0) - (z.successful || 0)), 1);
                      return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                        const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                        const unsuccessful = (zoneData.count || 0) - (zoneData.successful || 0);
                        const intensity = unsuccessful / maxCount;
                        const lightness = unsuccessful > 0 ? 85 - (intensity * 45) : 95;
                        const bgColor = `hsl(0, 60%, ${lightness}%)`;

                        return (
                          <div
                            key={zoneNum}
                            className={`zone-cell-med zone-${zoneNum}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            <span className="zone-cell-count-med">{unsuccessful || ''}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Goals Field */}
                <div className="shot-zone-field-med">
                  <h4 className="zone-field-title-med">GOALS</h4>
                  <div className="zone-field-container-med gold-heatmap">
                    {(() => {
                      const zones = reportData.shotStats?.zones || {};
                      const maxCount = Math.max(...Object.values(zones).map(z => z.goals || 0), 1);
                      return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                        const zoneData = zones[zoneNum] || { goals: 0 };
                        const intensity = zoneData.goals / maxCount;
                        const lightness = zoneData.goals > 0 ? 85 - (intensity * 40) : 95;
                        const bgColor = `hsl(45, 80%, ${lightness}%)`;

                        return (
                          <div
                            key={zoneNum}
                            className={`zone-cell-med zone-${zoneNum}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            <span className="zone-cell-count-med">{zoneData.goals || ''}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Goalscorers List - Horizontal below the fields */}
              <div className="goalscorers-list">
                <h4 className="goalscorers-title">GOALSCORERS</h4>
                {(() => {
                  const playerShots = reportData.shotStats?.playerShots || {};
                  const goalscorers = Object.entries(playerShots)
                    .filter(([_, stats]) => stats.goals > 0)
                    .map(([player, stats]) => ({ player, goals: stats.goals }))
                    .sort((a, b) => b.goals - a.goals);

                  if (goalscorers.length === 0) {
                    return <span className="no-goals">No goals</span>;
                  }

                  return (
                    <div className="goalscorers-items">
                      {goalscorers.map(({ player, goals }) => (
                        <div key={player} className="goalscorer-item">
                          <span className="goalscorer-name">{player}</span>
                          <span className="goalscorer-count">{goals}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Chance Conversion Rate */}
              {(() => {
                const shotStats = reportData.shotStats || { successful: 0, goals: 0 };
                const conversionRate = shotStats.successful > 0 ? Math.round((shotStats.goals / shotStats.successful) * 1000) / 10 : 0;
                const seasonShots = seasonAverages?.team?.shots || { avgConversionRate: 0 };
                const conversionComparison = seasonAverages?.matchCount > 0 ? Math.round((conversionRate - (seasonShots.avgConversionRate || 0)) * 10) / 10 : 0;

                return (
                  <div className="conversion-rate-box">
                    <span className="conversion-rate-label">Chance Conversion Rate (Finishing %)</span>
                    <div className="conversion-rate-content">
                      <span className="conversion-rate-value">{conversionRate}%</span>
                      <span className={`conversion-rate-comp ${getComparisonColorClass(conversionComparison)}`}>
                        {conversionComparison >= 0 ? '+' : ''}{conversionComparison}% vs avg
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Additional Stats Row */}
        <section className="shot-additional-stats">
          <div className="additional-stats-grid">
            {/* Previous Action with Success Rates */}
            <div className="additional-stat-box">
              <h4 className="additional-stat-title">PREVIOUS ACTION</h4>
              <div className="additional-stat-list-enhanced">
                {(() => {
                  // We'll need to calculate success rates from the shots data
                  // For now, display count and will need backend update for full stats
                  const prevActions = reportData.shotStats?.previousAction || {};
                  const prevActionDetails = reportData.shotStats?.previousActionDetails || {};

                  return Object.entries(prevActions)
                    .sort((a, b) => b[1] - a[1])
                    .map(([action, count]) => {
                      const details = prevActionDetails[action] || { successful: 0, goals: 0 };
                      const successRate = count > 0 ? Math.round((details.successful / count) * 100) : 0;
                      const goalRate = count > 0 ? Math.round((details.goals / count) * 100) : 0;

                      return (
                        <div key={action} className="additional-stat-item-enhanced">
                          <span className="stat-name">{action}</span>
                          <span className="stat-count">{count} shots</span>
                          <div className="stat-details">
                            <span className="stat-success">{successRate}% on target</span>
                            <span className="stat-goals">{goalRate}% goals</span>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* Accuracy with Percentages */}
            <div className="additional-stat-box">
              <h4 className="additional-stat-title">ACCURACY</h4>
              <div className="additional-stat-list">
                {(() => {
                  const accuracy = reportData.shotStats?.accuracy || {};
                  const total = Object.values(accuracy).reduce((sum, val) => sum + val, 0);

                  return Object.entries(accuracy)
                    .sort((a, b) => b[1] - a[1])
                    .map(([accuracyType, count]) => {
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                      return (
                        <div key={accuracyType} className="additional-stat-item">
                          <span className="stat-name">{accuracyType}</span>
                          <div className="stat-count-pct">
                            <span className="stat-count">{count}</span>
                            <span className="stat-percentage">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* Results with Percentages */}
            <div className="additional-stat-box">
              <h4 className="additional-stat-title">RESULTS</h4>
              <div className="additional-stat-list">
                {(() => {
                  const results = reportData.shotStats?.results || {};
                  const total = Object.values(results).reduce((sum, val) => sum + val, 0);

                  return Object.entries(results)
                    .sort((a, b) => b[1] - a[1])
                    .map(([result, count]) => {
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                      return (
                        <div key={result} className="additional-stat-item">
                          <span className="stat-name">{result}</span>
                          <div className="stat-count-pct">
                            <span className="stat-count">{count}</span>
                            <span className="stat-percentage">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Page 5: Top Shooters */}
      <div className="report-page page-5">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Top Shooters</p>
        </header>

        {/* Top 4 Shooters */}
        <section className="top-shooters-section">
          {(() => {
            const playerShots = reportData.shotStats?.playerShots || {};
            const topShooters = Object.entries(playerShots)
              .map(([player, stats]) => ({ player, ...stats }))
              .sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                const aRate = a.total > 0 ? a.successful / a.total : 0;
                const bRate = b.total > 0 ? b.successful / b.total : 0;
                return bRate - aRate;
              })
              .slice(0, 4);

            return topShooters.map((shooter, index) => {
              const successRate = shooter.total > 0 ? Math.round((shooter.successful / shooter.total) * 100) : 0;

              // Get top 3 zones for this player
              const topZones = Object.entries(shooter.zones || {})
                .map(([zone, data]) => ({
                  zone,
                  count: data.count || 0,
                  successful: data.successful || 0,
                  goals: data.goals || 0
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

              const maxZoneCount = Math.max(...Object.values(shooter.zones || {}).map(z => z.count || 0), 1);

              return (
                <div key={shooter.player} className="top-shooter-card">
                  <div className="shooter-header">
                    <span className="shooter-rank">#{index + 1}</span>
                    <span className="shooter-name">{shooter.player}</span>
                  </div>
                  <div className="shooter-stats-row">
                    <span className="shooter-stat">{shooter.total} shots</span>
                    <span className="shooter-stat">{shooter.successful} successful ({successRate}%)</span>
                    <span className="shooter-stat">{shooter.goals} goals</span>
                  </div>

                  <div className="shooter-content">
                    {/* Zone Preferences */}
                    <div className="shooter-zones">
                      <h5 className="shooter-section-title">Zone Preferences</h5>
                      {topZones.map(z => {
                        const zonePct = shooter.total > 0 ? Math.round((z.count / shooter.total) * 100) : 0;
                        const zoneSuccessRate = z.count > 0 ? Math.round((z.successful / z.count) * 100) : 0;
                        return (
                          <div key={z.zone} className="zone-preference">
                            <span className="zone-pref-zone">Zone {z.zone}</span>
                            <span className="zone-pref-count">{z.count} shots ({zonePct}%)</span>
                            <span className={`zone-pref-rate ${getSuccessRateColorClass(zoneSuccessRate)}`}>{zoneSuccessRate}% success</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mini Zone Field */}
                    <div className="shooter-mini-field">
                      <div className="mini-field-container">
                        {/* Zone order for vertical 3x6 grid */}
                        {[12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                          const zoneData = shooter.zones?.[zoneNum] || { count: 0 };
                          const intensity = zoneData.count / maxZoneCount;
                          const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                          const bgColor = `hsl(120, 50%, ${lightness}%)`;

                          return (
                            <div
                              key={zoneNum}
                              className={`mini-zone-cell zone-${zoneNum}`}
                              style={{ backgroundColor: bgColor }}
                            >
                              {zoneData.count > 0 && <span>{zoneData.count}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Accuracy & Results */}
                    <div className="shooter-breakdown">
                      <div className="shooter-accuracy">
                        <h5 className="shooter-section-title">Accuracy</h5>
                        {Object.entries(shooter.accuracy || {}).map(([acc, count]) => (
                          <span key={acc} className="shooter-stat-item">{acc}: {count}</span>
                        ))}
                      </div>
                      <div className="shooter-results">
                        <h5 className="shooter-section-title">Results</h5>
                        {Object.entries(shooter.results || {}).map(([res, count]) => (
                          <span key={res} className="shooter-stat-item">{res}: {count}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </section>
      </div>

      {/* Page 6: Pass Zone Analysis */}
      <div className="report-page page-6">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Pass Zone Analysis</p>
        </header>

        {/* Two-Column Layout: Large Fields Left, Medium Fields Right */}
        <div className="pass-zones-two-col">
          {/* LEFT COLUMN: Two Large Fields */}
          <section className="pass-zones-large-column">
            {/* All Passes - Zone Started */}
            <div className="pass-zone-large-wrapper">
              <h4 className="zone-field-title">ALL PASSES - ZONE STARTED</h4>
              <div className="zone-field-container-large orange-heatmap">
              {(() => {
                const zones = reportData.passStats?.zonesStarted || {};
                const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                  const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                  const intensity = zoneData.count / maxCount;
                  const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                  const bgColor = `hsl(210, 60%, ${lightness}%)`;
                  const successRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                  return (
                    <div
                      key={zoneNum}
                      className={`zone-cell-large zone-${zoneNum}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {zoneData.count > 0 && (
                        <div className="zone-cell-content">
                          <span className="zone-cell-count-large">{zoneData.count}</span>
                          <span className={`zone-cell-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}%</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* All Passes - Zone Ended */}
          <div className="pass-zone-large-wrapper">
            <h4 className="zone-field-title">ALL PASSES - ZONE ENDED</h4>
            <div className="zone-field-container-large orange-heatmap">
              {(() => {
                const zones = reportData.passStats?.zonesEnded || {};
                const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                  const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                  const intensity = zoneData.count / maxCount;
                  const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                  const bgColor = `hsl(210, 60%, ${lightness}%)`;
                  const successRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                  return (
                    <div
                      key={zoneNum}
                      className={`zone-cell-large zone-${zoneNum}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {zoneData.count > 0 && (
                        <div className="zone-cell-content">
                          <span className="zone-cell-count-large">{zoneData.count}</span>
                          <span className={`zone-cell-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}%</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Six Medium Fields - 3x2 Grid */}
        <section className="pass-medium-fields">
          <div className="pass-fields-three-col">
            {/* Column 1: Successful Passes */}
            <div className="pass-field-pair">
              <h4 className="zone-field-title-med">SUCCESSFUL START</h4>
              <div className="zone-field-container-med green-heatmap">
                {(() => {
                  const zones = reportData.passStats?.successfulZonesStarted || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                    const bgColor = `hsl(120, 50%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
              <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>SUCCESSFUL END</h4>
              <div className="zone-field-container-med green-heatmap">
                {(() => {
                  const zones = reportData.passStats?.successfulZonesEnded || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                    const bgColor = `hsl(120, 50%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Column 2: Unsuccessful (Incomplete) */}
            <div className="pass-field-pair">
              <h4 className="zone-field-title-med">INCOMPLETE START</h4>
              <div className="zone-field-container-med red-heatmap">
                {(() => {
                  const zones = reportData.passStats?.incompleteZonesStarted || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                    const bgColor = `hsl(0, 60%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
              <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>INCOMPLETE END</h4>
              <div className="zone-field-container-med red-heatmap">
                {(() => {
                  const zones = reportData.passStats?.incompleteZonesEnded || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                    const bgColor = `hsl(0, 60%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Column 3: Unsuccessful (Clearance & OOB) */}
            <div className="pass-field-pair">
              <h4 className="zone-field-title-med">CLEARANCE/OOB START</h4>
              <div className="zone-field-container-med red-heatmap">
                {(() => {
                  const zones = reportData.passStats?.clearanceOOBZonesStarted || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                    const bgColor = `hsl(0, 60%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
              <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>CLEARANCE/OOB END</h4>
              <div className="zone-field-container-med red-heatmap">
                {(() => {
                  const zones = reportData.passStats?.clearanceOOBZonesEnded || {};
                  const maxCount = Math.max(...Object.values(zones), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const count = zones[zoneNum] || 0;
                    const intensity = count / maxCount;
                    const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                    const bgColor = `hsl(0, 60%, ${lightness}%)`;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-med zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        <span className="zone-cell-count-med">{count || ''}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Assists and Chance Creators - Below the 6 medium fields */}
          <section className="assists-section">
          <h4 className="assists-title">ASSISTS</h4>
          {(() => {
            const assists = reportData.passStats?.assists || {};
            const assistsList = Object.entries(assists)
              .map(([player, count]) => ({ player, count }))
              .sort((a, b) => b.count - a.count);

            if (assistsList.length === 0) {
              return <span className="no-assists">No assists</span>;
            }

            return (
              <div className="assists-items">
                {assistsList.map(({ player, count }) => (
                  <div key={player} className="assist-item">
                    <span className="assist-name">{player}</span>
                    <span className="assist-count">{count}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* Chance Creators List */}
        <section className="chance-creators-section">
          <h4 className="chance-creators-title">CHANCE CREATORS</h4>
          {(() => {
            const chanceCreators = reportData.passStats?.chanceCreators || {};
            const creatorsList = Object.entries(chanceCreators)
              .map(([player, stats]) => ({
                player,
                total: stats.total,
                successful: stats.successful,
                successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0
              }))
              .sort((a, b) => b.total - a.total);

            if (creatorsList.length === 0) {
              return <span className="no-creators">No chance creators</span>;
            }

            return (
              <div className="chance-creators-items">
                {creatorsList.map(({ player, total, successRate }) => (
                  <div key={player} className="creator-item">
                    <span className="creator-name">{player}</span>
                    <span className="creator-stats">{total} ({successRate}%)</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
        </section>
      </div>
      </div>

      {/* Page 7: Passing Statistics */}
      <div className="report-page page-7">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Passing Statistics</p>
        </header>

        {/* Team Pass Totals Header */}
        <section className="pass-totals-header">
          {(() => {
            const passStats = reportData.passStats || { total: 0, successful: 0, unsuccessful: 0 };
            const seasonPasses = seasonAverages?.team?.passes || { avgPerMatch: 0, avgSuccessRate: 0 };
            const successRate = passStats.total > 0 ? Math.round((passStats.successful / passStats.total) * 1000) / 10 : 0;

            const passesComparison = seasonAverages?.matchCount > 0 ? Math.round((passStats.total - seasonPasses.avgPerMatch) * 10) / 10 : 0;
            const successComparison = seasonAverages?.matchCount > 0 ? Math.round((successRate - seasonPasses.avgSuccessRate) * 10) / 10 : 0;
            const unsuccessfulRate = passStats.total > 0 ? Math.round((passStats.unsuccessful / passStats.total) * 1000) / 10 : 0;
            const avgUnsuccessfulRate = seasonAverages?.matchCount > 0 ? (100 - seasonPasses.avgSuccessRate) : 0;
            const unsuccessfulComparison = seasonAverages?.matchCount > 0 ? Math.round((unsuccessfulRate - avgUnsuccessfulRate) * 10) / 10 : 0;

            return (
              <div className="pass-totals-grid">
                <div className="pass-total-item">
                  <span className="pass-total-value">{passStats.total}</span>
                  <span className="pass-total-label">Total Passes</span>
                  <span className={`pass-total-comp ${getComparisonColorClass(passesComparison)}`}>
                    {passesComparison >= 0 ? '+' : ''}{passesComparison} vs avg
                  </span>
                </div>
                <div className="pass-total-item">
                  <span className="pass-total-value">{passStats.successful} ({successRate}%)</span>
                  <span className="pass-total-label">Successful</span>
                  <span className={`pass-total-comp ${getComparisonColorClass(successComparison)}`}>
                    {successComparison >= 0 ? '+' : ''}{successComparison}% vs avg
                  </span>
                </div>
                <div className="pass-total-item">
                  <span className="pass-total-value">{passStats.unsuccessful} ({unsuccessfulRate}%)</span>
                  <span className="pass-total-label">Unsuccessful</span>
                  <span className={`pass-total-comp ${getComparisonColorClass(unsuccessfulComparison)}`}>
                    {unsuccessfulComparison >= 0 ? '+' : ''}{unsuccessfulComparison}% vs avg
                  </span>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Direction Fields - 3 Columns */}
        <section className="pass-direction-section">
          <div className="pass-direction-three-col">
            {['Forward', 'Sideways', 'Backward'].map(direction => {
              const dirData = reportData.passStats?.direction?.[direction] || { total: 0, successful: 0, zonesStarted: {}, zonesEnded: {} };
              const completionRate = dirData.total > 0 ? Math.round((dirData.successful / dirData.total) * 100) : 0;

              // Set color based on direction: Forward=blue, Sideways=green, Backward=red
              const getDirectionColor = (dir) => {
                if (dir === 'Forward') return { hue: 210, sat: 60 }; // Blue
                if (dir === 'Sideways') return { hue: 120, sat: 50 }; // Green
                if (dir === 'Backward') return { hue: 0, sat: 60 }; // Red
                return { hue: 210, sat: 60 }; // Default blue
              };
              const dirColor = getDirectionColor(direction);

              return (
                <div key={direction} className="direction-field-pair">
                  <h4 className="direction-title">{direction.toUpperCase()}</h4>

                  {/* Zone Started */}
                  <h5 className="zone-field-subtitle">Zone Started</h5>
                  <div className="zone-field-container-small">
                    {(() => {
                      const zones = dirData.zonesStarted || {};
                      const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                      return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                        const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                        const intensity = zoneData.count / maxCount;
                        const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                        const bgColor = `hsl(${dirColor.hue}, ${dirColor.sat}%, ${lightness}%)`;
                        const zoneRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                        return (
                          <div
                            key={zoneNum}
                            className={`zone-cell-small zone-${zoneNum}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            {zoneData.count > 0 && (
                              <div className="zone-cell-content-small">
                                <span className="zone-count-tiny">{zoneData.count}</span>
                                <span className="zone-rate-tiny">{zoneRate}%</span>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Zone Ended */}
                  <h5 className="zone-field-subtitle">Zone Ended</h5>
                  <div className="zone-field-container-small">
                    {(() => {
                      const zones = dirData.zonesEnded || {};
                      const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                      return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                        const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                        const intensity = zoneData.count / maxCount;
                        const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                        const bgColor = `hsl(${dirColor.hue}, ${dirColor.sat}%, ${lightness}%)`;
                        const zoneRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                        return (
                          <div
                            key={zoneNum}
                            className={`zone-cell-small zone-${zoneNum}`}
                            style={{ backgroundColor: bgColor }}
                          >
                            {zoneData.count > 0 && (
                              <div className="zone-cell-content-small">
                                <span className="zone-count-tiny">{zoneData.count}</span>
                                <span className="zone-rate-tiny">{zoneRate}%</span>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Direction Summary */}
                  <div className="direction-summary">
                    {direction}: {dirData.successful}/{dirData.total} ({completionRate}%)
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Accuracy & Result if Bad - Side by Side */}
        <section className="pass-stats-bottom">
          <div className="pass-stats-two-col">
            {/* Accuracy Box */}
            <div className="pass-stat-box">
              <h4 className="pass-stat-title">ACCURACY</h4>
              <div className="pass-stat-list">
                {(() => {
                  const accuracy = reportData.passStats?.accuracy || {};
                  const total = Object.values(accuracy).reduce((sum, count) => sum + count, 0);
                  return Object.entries(accuracy).map(([type, count]) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={type} className="pass-stat-item">
                        <span className="stat-name">{type}</span>
                        <span className="stat-count-pct">
                          <span className="stat-count">{count}</span>
                          <span className="stat-percentage">({percentage}%)</span>
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Result if Bad Box */}
            <div className="pass-stat-box">
              <h4 className="pass-stat-title">RESULT IF BAD</h4>
              <div className="pass-stat-list">
                {(() => {
                  const resultIfBad = reportData.passStats?.resultIfBad || {};
                  const total = Object.values(resultIfBad).reduce((sum, count) => sum + count, 0);

                  if (total === 0) {
                    return <span className="no-data">No clearances or out of bounds</span>;
                  }

                  return Object.entries(resultIfBad).map(([type, count]) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={type} className="pass-stat-item">
                        <span className="stat-name">{type}</span>
                        <span className="stat-count-pct">
                          <span className="stat-count">{count}</span>
                          <span className="stat-percentage">({percentage}%)</span>
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Page 8: Top Passers */}
      <div className="report-page page-8">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Top 3 Passers</p>
        </header>

        {/* Top 3 Passers Cards */}
        <section className="top-passers-section">
          {(() => {
            const playerPasses = reportData.passStats?.playerPasses || {};

            // Sort players by total passes, then by success rate
            const topPassers = Object.entries(playerPasses)
              .map(([player, stats]) => ({
                player,
                ...stats,
                successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0
              }))
              .sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                return b.successRate - a.successRate;
              })
              .slice(0, 3);

            return topPassers.map((passer, index) => {
              // Calculate zone preferences (top 3 zones for Zone Started)
              const zonePreferences = Object.entries(passer.zonesStarted || {})
                .map(([zone, data]) => ({
                  zone: parseInt(zone),
                  count: data.count || 0,
                  percentage: passer.total > 0 ? Math.round((data.count / passer.total) * 100) : 0,
                  successRate: data.count > 0 ? Math.round((data.successful / data.count) * 100) : 0
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

              return (
                <div key={passer.player} className="top-shooter-card">
                  <div className="shooter-header">
                    <span className="shooter-rank">#{index + 1}</span>
                    <span className="shooter-name">{passer.player}</span>
                  </div>
                  <div className="shooter-stats-row">
                    <span className="shooter-stat">{passer.total} passes</span>
                    <span className="shooter-stat">{passer.successful} successful ({passer.successRate}%)</span>
                    <span className="shooter-stat">{passer.successRate}% completion</span>
                  </div>

                  <div className="shooter-content">
                    {/* Zone Preferences */}
                    <div className="shooter-zones">
                      <h5 className="shooter-section-title">Zone Preferences</h5>
                      {zonePreferences.map(({ zone, count, percentage, successRate }) => (
                        <div key={zone} className="zone-preference">
                          <span className="zone-pref-zone">Zone {zone}</span>
                          <span className="zone-pref-count">{count} passes ({percentage}%)</span>
                          <span className={`zone-pref-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}% success</span>
                        </div>
                      ))}
                    </div>

                    {/* Mini Zone Fields - Horizontal Layout */}
                    <div className="shooter-mini-zones-wrapper">
                      {/* Zone Started */}
                      <div className="shooter-mini-field">
                        <h5 className="mini-field-label">Zone Started</h5>
                        <div className="mini-field-container">
                          {(() => {
                            const zones = passer.zonesStarted || {};
                            const maxZoneCount = Math.max(...Object.values(zones).map(z => (typeof z === 'object' ? z.count : z) || 0), 1);
                            return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                              const zoneData = zones[zoneNum] || {};
                              const count = typeof zoneData === 'object' ? (zoneData.count || 0) : (zoneData || 0);
                              const intensity = count / maxZoneCount;
                              const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                              const bgColor = `hsl(120, 50%, ${lightness}%)`;

                              return (
                                <div
                                  key={zoneNum}
                                  className={`mini-zone-cell zone-${zoneNum}`}
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {count > 0 && <span>{count}</span>}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Zone Ended */}
                      <div className="shooter-mini-field">
                        <h5 className="mini-field-label">Zone Ended</h5>
                        <div className="mini-field-container">
                          {(() => {
                            const zones = passer.zonesEnded || {};
                            const maxZoneCount = Math.max(...Object.values(zones).map(z => (typeof z === 'object' ? z.count : z) || 0), 1);
                            return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                              const zoneData = zones[zoneNum] || {};
                              const count = typeof zoneData === 'object' ? (zoneData.count || 0) : (zoneData || 0);
                              const intensity = count / maxZoneCount;
                              const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                              const bgColor = `hsl(120, 50%, ${lightness}%)`;

                              return (
                                <div
                                  key={zoneNum}
                                  className={`mini-zone-cell zone-${zoneNum}`}
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {count > 0 && <span>{count}</span>}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Stats Breakdown */}
                    <div className="shooter-breakdown">
                      {/* Direction */}
                      <div className="shooter-accuracy">
                        <h5 className="shooter-section-title">Direction</h5>
                        {Object.entries(passer.direction || {}).map(([dir, stats]) => {
                          const rate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
                          return (
                            <span key={dir} className="shooter-stat-item">{dir}: {stats.successful}/{stats.total} ({rate}%)</span>
                          );
                        })}
                      </div>

                      {/* Accuracy */}
                      <div className="shooter-results">
                        <h5 className="shooter-section-title">Accuracy</h5>
                        {Object.entries(passer.accuracy || {}).map(([acc, count]) => {
                          const percentage = passer.total > 0 ? Math.round((count / passer.total) * 100) : 0;
                          return (
                            <span key={acc} className="shooter-stat-item">{acc}: {count} ({percentage}%)</span>
                          );
                        })}
                      </div>

                      {/* Result if Bad */}
                      {Object.keys(passer.resultIfBad || {}).length > 0 && (
                        <div className="shooter-results">
                          <h5 className="shooter-section-title">Result if Bad</h5>
                          {Object.entries(passer.resultIfBad || {}).map(([res, count]) => (
                            <span key={res} className="shooter-stat-item">{res}: {count}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </section>
      </div>

      {/* Page 9: Dribble Zone Analysis */}
      <div className="report-page page-9">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Dribble Zone Analysis</p>
        </header>

        {/* Team Dribble Totals Header */}
        <section className="dribble-totals-header">
          {(() => {
            const dribbleStats = reportData.dribbleStats || { total: 0, successful: 0, beatPlayer: 0 };
            const seasonDribbles = seasonAverages?.team?.dribbles || { avgPerMatch: 0, avgSuccessRate: 0, avgBeatPlayerRate: 0 };
            const successRate = dribbleStats.total > 0 ? Math.round((dribbleStats.successful / dribbleStats.total) * 1000) / 10 : 0;
            const beatPlayerRate = dribbleStats.total > 0 ? Math.round((dribbleStats.beatPlayer / dribbleStats.total) * 1000) / 10 : 0;

            const dribblesComparison = seasonAverages?.matchCount > 0 ? Math.round((dribbleStats.total - seasonDribbles.avgPerMatch) * 10) / 10 : 0;
            const successComparison = seasonAverages?.matchCount > 0 ? Math.round((successRate - seasonDribbles.avgSuccessRate) * 10) / 10 : 0;
            const beatPlayerComparison = seasonAverages?.matchCount > 0 ? Math.round((beatPlayerRate - seasonDribbles.avgBeatPlayerRate) * 10) / 10 : 0;

            return (
              <div className="dribble-totals-grid">
                <div className="dribble-total-item">
                  <span className="dribble-total-value">{dribbleStats.total}</span>
                  <span className="dribble-total-label">Total Dribbles</span>
                  <span className={`dribble-total-comp ${getComparisonColorClass(dribblesComparison)}`}>
                    {dribblesComparison >= 0 ? '+' : ''}{dribblesComparison} vs avg
                  </span>
                </div>
                <div className="dribble-total-item">
                  <span className="dribble-total-value">{dribbleStats.successful} ({successRate}%)</span>
                  <span className="dribble-total-label">Successful</span>
                  <span className={`dribble-total-comp ${getComparisonColorClass(successComparison)}`}>
                    {successComparison >= 0 ? '+' : ''}{successComparison}% vs avg
                  </span>
                </div>
                <div className="dribble-total-item">
                  <span className="dribble-total-value">{dribbleStats.beatPlayer} ({beatPlayerRate}%)</span>
                  <span className="dribble-total-label">Beat Player</span>
                  <span className={`dribble-total-comp ${getComparisonColorClass(beatPlayerComparison)}`}>
                    {beatPlayerComparison >= 0 ? '+' : ''}{beatPlayerComparison}% vs avg
                  </span>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Two-Column Layout: Large Fields Left, Medium Fields Right */}
        <div className="dribble-zones-two-col">
          {/* LEFT COLUMN: Two Large Fields */}
          <section className="dribble-zones-large-column">
            {/* All Dribbles - Zone Started */}
            <div className="dribble-zone-large-wrapper">
              <h4 className="zone-field-title">ALL DRIBBLES - ZONE STARTED</h4>
              <div className="zone-field-container-large blue-heatmap">
                {(() => {
                  const zones = reportData.dribbleStats?.zonesStarted || {};
                  const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                    const intensity = zoneData.count / maxCount;
                    const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                    const bgColor = `hsl(210, 60%, ${lightness}%)`;
                    const successRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-large zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {zoneData.count > 0 && (
                          <div className="zone-cell-content">
                            <span className="zone-cell-count-large">{zoneData.count}</span>
                            <span className={`zone-cell-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}%</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* All Dribbles - Zone Ended */}
            <div className="dribble-zone-large-wrapper">
              <h4 className="zone-field-title">ALL DRIBBLES - ZONE ENDED</h4>
              <div className="zone-field-container-large blue-heatmap">
                {(() => {
                  const zones = reportData.dribbleStats?.zonesEnded || {};
                  const maxCount = Math.max(...Object.values(zones).map(z => z.count || 0), 1);
                  return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                    const zoneData = zones[zoneNum] || { count: 0, successful: 0 };
                    const intensity = zoneData.count / maxCount;
                    const lightness = zoneData.count > 0 ? 85 - (intensity * 50) : 95;
                    const bgColor = `hsl(210, 60%, ${lightness}%)`;
                    const successRate = zoneData.count > 0 ? Math.round((zoneData.successful / zoneData.count) * 100) : 0;

                    return (
                      <div
                        key={zoneNum}
                        className={`zone-cell-large zone-${zoneNum}`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {zoneData.count > 0 && (
                          <div className="zone-cell-content">
                            <span className="zone-cell-count-large">{zoneData.count}</span>
                            <span className={`zone-cell-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}%</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Six Medium Fields - 3x2 Grid */}
          <section className="dribble-medium-fields">
            <div className="dribble-fields-three-col">
              {/* Column 1: Successful Dribbles */}
              <div className="dribble-field-pair">
                <h4 className="zone-field-title-med">SUCCESSFUL START</h4>
                <div className="zone-field-container-med green-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.successfulZonesStarted || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                      const bgColor = `hsl(120, 50%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>SUCCESSFUL END</h4>
                <div className="zone-field-container-med green-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.successfulZonesEnded || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                      const bgColor = `hsl(120, 50%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Column 2: Unsuccessful Dribbles */}
              <div className="dribble-field-pair">
                <h4 className="zone-field-title-med">UNSUCCESSFUL START</h4>
                <div className="zone-field-container-med red-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.unsuccessfulZonesStarted || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                      const bgColor = `hsl(0, 60%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>UNSUCCESSFUL END</h4>
                <div className="zone-field-container-med red-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.unsuccessfulZonesEnded || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 45) : 95;
                      const bgColor = `hsl(0, 60%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Column 3: Beat Player Dribbles */}
              <div className="dribble-field-pair">
                <h4 className="zone-field-title-med">BEAT PLAYER START</h4>
                <div className="zone-field-container-med purple-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.beatPlayerZonesStarted || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                      const bgColor = `hsl(280, 60%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
                <h4 className="zone-field-title-med" style={{ marginTop: '0.5rem' }}>BEAT PLAYER END</h4>
                <div className="zone-field-container-med purple-heatmap">
                  {(() => {
                    const zones = reportData.dribbleStats?.beatPlayerZonesEnded || {};
                    const maxCount = Math.max(...Object.values(zones), 1);
                    return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                      const count = zones[zoneNum] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                      const bgColor = `hsl(280, 60%, ${lightness}%)`;

                      return (
                        <div
                          key={zoneNum}
                          className={`zone-cell-med zone-${zoneNum}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count || ''}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <section className="dribble-stats-bottom">
              {/* Previous Action */}
              <div className="dribble-stat-box">
                <h4 className="dribble-stat-title">Previous Action</h4>
                <div className="dribble-stat-list">
                  {(() => {
                    const prevActions = reportData.dribbleStats?.previousAction || {};
                    const prevActionDetails = reportData.dribbleStats?.previousActionDetails || {};
                    return Object.entries(prevActions).map(([action, count]) => {
                      const details = prevActionDetails[action] || { successful: 0, beatPlayer: 0 };
                      const successRate = count > 0 ? Math.round((details.successful / count) * 100) : 0;
                      const beatPlayerRate = count > 0 ? Math.round((details.beatPlayer / count) * 100) : 0;
                      return (
                        <div key={action} className="dribble-stat-item">
                          <span className="stat-name">{action}</span>
                          <span className="stat-value">{count} | {successRate}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Beat Player */}
              <div className="dribble-stat-box">
                <h4 className="dribble-stat-title">Beat Player</h4>
                <div className="dribble-stat-list">
                  {(() => {
                    const beatPlayerBreakdown = reportData.dribbleStats?.beatPlayerBreakdown || { Yes: 0, No: 0 };
                    const total = beatPlayerBreakdown.Yes + beatPlayerBreakdown.No;
                    return Object.entries(beatPlayerBreakdown).map(([option, count]) => {
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={option} className="dribble-stat-item">
                          <span className="stat-name">{option}</span>
                          <span className="stat-value">{count} ({percentage}%)</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Direction */}
              <div className="dribble-stat-box">
                <h4 className="dribble-stat-title">Direction</h4>
                <div className="dribble-stat-list">
                  {(() => {
                    const directions = reportData.dribbleStats?.direction || {};
                    const totalDribbles = reportData.dribbleStats?.total || 0;
                    return Object.entries(directions).map(([dir, stats]) => {
                      const percentage = totalDribbles > 0 ? Math.round((stats.total / totalDribbles) * 100) : 0;
                      const successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
                      return (
                        <div key={dir} className="dribble-stat-item">
                          <span className="stat-name">{dir}</span>
                          <span className={`stat-value ${getSuccessRateColorClass(successRate)}`}>{stats.total} ({percentage}%) | {successRate}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>

      {/* Page 10: Top Dribblers */}
      <div className="report-page page-10">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Top 3 Dribblers</p>
        </header>

        {/* Top 4 Dribblers Cards */}
        <section className="top-dribblers-section">
          {(() => {
            const playerDribbles = reportData.dribbleStats?.playerDribbles || {};

            // Sort players by total dribbles, then by success rate
            const topDribblers = Object.entries(playerDribbles)
              .map(([player, stats]) => ({
                player,
                ...stats,
                successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0,
                beatPlayerRate: stats.total > 0 ? Math.round((stats.beatPlayerBreakdown?.Yes || 0) / stats.total * 100) : 0
              }))
              .sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                return b.successRate - a.successRate;
              })
              .slice(0, 3);

            return topDribblers.map((dribbler, index) => {
              // Calculate zone preferences (top 3 zones for Zone Started)
              const zonePreferences = Object.entries(dribbler.zonesStarted || {})
                .map(([zone, data]) => ({
                  zone: parseInt(zone),
                  count: data.count || 0,
                  percentage: dribbler.total > 0 ? Math.round((data.count / dribbler.total) * 100) : 0,
                  successRate: data.count > 0 ? Math.round((data.successful / data.count) * 100) : 0
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);

              return (
                <div key={dribbler.player} className="top-shooter-card">
                  <div className="shooter-header">
                    <span className="shooter-rank">#{index + 1}</span>
                    <span className="shooter-name">{dribbler.player}</span>
                  </div>
                  <div className="shooter-stats-row">
                    <span className="shooter-stat">{dribbler.total} dribbles</span>
                    <span className="shooter-stat">{dribbler.successful} successful ({dribbler.successRate}%)</span>
                    <span className="shooter-stat">{dribbler.beatPlayerRate}% beat player</span>
                  </div>

                  <div className="shooter-content">
                    {/* Zone Preferences */}
                    <div className="shooter-zones">
                      <h5 className="shooter-section-title">Zone Preferences</h5>
                      {zonePreferences.map(({ zone, count, percentage, successRate }) => (
                        <div key={zone} className="zone-preference">
                          <span className="zone-pref-zone">Zone {zone}</span>
                          <span className="zone-pref-count">{count} dribbles ({percentage}%)</span>
                          <span className={`zone-pref-rate ${getSuccessRateColorClass(successRate)}`}>{successRate}% success</span>
                        </div>
                      ))}
                    </div>

                    {/* Mini Zone Fields - Horizontal Layout */}
                    <div className="shooter-mini-zones-wrapper">
                      {/* Zone Started */}
                      <div className="shooter-mini-field">
                        <h5 className="mini-field-label">Zone Started</h5>
                        <div className="mini-field-container">
                          {(() => {
                            const zones = dribbler.zonesStarted || {};
                            const maxZoneCount = Math.max(...Object.values(zones).map(z => (typeof z === 'object' ? z.count : z) || 0), 1);
                            return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                              const zoneData = zones[zoneNum] || {};
                              const count = typeof zoneData === 'object' ? (zoneData.count || 0) : (zoneData || 0);
                              const intensity = count / maxZoneCount;
                              const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                              const bgColor = `hsl(120, 50%, ${lightness}%)`;

                              return (
                                <div
                                  key={zoneNum}
                                  className={`mini-zone-cell zone-${zoneNum}`}
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {count > 0 && <span>{count}</span>}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>

                      {/* Zone Ended */}
                      <div className="shooter-mini-field">
                        <h5 className="mini-field-label">Zone Ended</h5>
                        <div className="mini-field-container">
                          {(() => {
                            const zones = dribbler.zonesEnded || {};
                            const maxZoneCount = Math.max(...Object.values(zones).map(z => (typeof z === 'object' ? z.count : z) || 0), 1);
                            return [12, 13, 11, 14, 9, 10, 8, 6, 7, 5, 3, 4, 2, 1].map(zoneNum => {
                              const zoneData = zones[zoneNum] || {};
                              const count = typeof zoneData === 'object' ? (zoneData.count || 0) : (zoneData || 0);
                              const intensity = count / maxZoneCount;
                              const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                              const bgColor = `hsl(120, 50%, ${lightness}%)`;

                              return (
                                <div
                                  key={zoneNum}
                                  className={`mini-zone-cell zone-${zoneNum}`}
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {count > 0 && <span>{count}</span>}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Stats Breakdown */}
                    <div className="shooter-breakdown">
                      {/* Direction */}
                      <div className="shooter-accuracy">
                        <h5 className="shooter-section-title">Direction</h5>
                        {Object.entries(dribbler.direction || {}).map(([dir, stats]) => {
                          const rate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;
                          return (
                            <span key={dir} className="shooter-stat-item">{dir}: {stats.successful}/{stats.total} ({rate}%)</span>
                          );
                        })}
                      </div>

                      {/* Beat Player */}
                      <div className="shooter-results">
                        <h5 className="shooter-section-title">Beat Player</h5>
                        {Object.entries(dribbler.beatPlayerBreakdown || {}).map(([option, count]) => {
                          const percentage = dribbler.total > 0 ? Math.round((count / dribbler.total) * 100) : 0;
                          return (
                            <span key={option} className="shooter-stat-item">{option}: {count} ({percentage}%)</span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </section>
      </div>

      {/* Page 11: Strings Analysis - Part 1 */}
      <div className="report-page page-11">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">String Analysis - Overview</p>
        </header>

        {/* Summary Stats Header (5 metrics with comparisons) */}
        <section className="string-totals-header">
          <div className="string-totals-grid">
            {(() => {
              const strings = reportData.stringStats || {};
              const seasonAvg = seasonAverages.strings || {};

              // Helper function to calculate comparison
              const getComparison = (current, avg) => {
                if (avg === 0) return { diff: 0, text: '0.0 vs avg', className: 'neutral' };
                const diff = current - avg;
                const sign = diff > 0 ? '+' : '';
                const className = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : 'neutral');
                return { diff, text: `${sign}${diff.toFixed(1)} vs avg`, className };
              };

              const metrics = [
                {
                  value: strings.total || 0,
                  label: 'Total Strings',
                  comparison: getComparison(strings.total || 0, seasonAvg.avgPerMatch || 0)
                },
                {
                  value: strings.avgActionLength || 0,
                  label: 'Avg Action Length',
                  comparison: getComparison(strings.avgActionLength || 0, seasonAvg.avgActionLength || 0)
                },
                {
                  value: strings.avgPassingLength || 0,
                  label: 'Avg Passing Length',
                  comparison: getComparison(strings.avgPassingLength || 0, seasonAvg.avgPassingLength || 0)
                },
                {
                  value: strings.longestAction || 0,
                  label: 'Highest Action',
                  comparison: getComparison(strings.longestAction || 0, seasonAvg.avgLongestAction || 0)
                },
                {
                  value: strings.longestPassing || 0,
                  label: 'Highest Passing',
                  comparison: getComparison(strings.longestPassing || 0, seasonAvg.avgLongestPassing || 0)
                }
              ];

              return metrics.map((metric, idx) => (
                <div key={idx} className="string-total-item">
                  <span className="string-total-value">{metric.value}</span>
                  <span className="string-total-label">{metric.label}</span>
                  <span className={`string-total-comp comparison-${metric.comparison.className}`}>
                    {metric.comparison.text}
                  </span>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* Shot-Related Statistics (3 boxes with action + passing comparisons) */}
        <section className="string-shot-stats">
          <div className="string-shot-stats-grid">
            {(() => {
              const strings = reportData.stringStats || {};
              const seasonAvg = seasonAverages.strings || {};

              // Helper function to calculate comparison
              const getComparison = (current, avg) => {
                if (avg === 0) return { diff: 0, text: '0.0 vs avg', className: 'neutral' };
                const diff = current - avg;
                const sign = diff > 0 ? '+' : '';
                const className = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : 'neutral');
                return { diff, text: `${sign}${diff.toFixed(1)} vs avg`, className };
              };

              const boxes = [
                {
                  title: 'Avg Length to Shot',
                  actionValue: strings.avgActionLengthToShot || 0,
                  passingValue: strings.avgPassingLengthToShot || 0,
                  actionComp: getComparison(strings.avgActionLengthToShot || 0, seasonAvg.avgActionLengthToShot || 0),
                  passingComp: getComparison(strings.avgPassingLengthToShot || 0, seasonAvg.avgPassingLengthToShot || 0)
                },
                {
                  title: 'Avg Length to Successful Shot',
                  actionValue: strings.avgActionLengthToSuccessfulShot || 0,
                  passingValue: strings.avgPassingLengthToSuccessfulShot || 0,
                  actionComp: getComparison(strings.avgActionLengthToSuccessfulShot || 0, seasonAvg.avgActionLengthToSuccessfulShot || 0),
                  passingComp: getComparison(strings.avgPassingLengthToSuccessfulShot || 0, seasonAvg.avgPassingLengthToSuccessfulShot || 0)
                },
                {
                  title: 'Avg Length to Goal',
                  actionValue: strings.avgActionLengthToGoal || 0,
                  passingValue: strings.avgPassingLengthToGoal || 0,
                  actionComp: getComparison(strings.avgActionLengthToGoal || 0, seasonAvg.avgActionLengthToGoal || 0),
                  passingComp: getComparison(strings.avgPassingLengthToGoal || 0, seasonAvg.avgPassingLengthToGoal || 0)
                }
              ];

              return boxes.map((box, idx) => (
                <div key={idx} className="string-shot-box">
                  <h4 className="string-shot-title">{box.title}</h4>
                  <div className="string-shot-metric">
                    <span className="string-shot-label">Action:</span>
                    <span className="string-shot-value">{box.actionValue}</span>
                    <span className={`string-shot-comp comparison-${box.actionComp.className}`}>
                      {box.actionComp.text}
                    </span>
                  </div>
                  <div className="string-shot-metric">
                    <span className="string-shot-label">Passing:</span>
                    <span className="string-shot-value">{box.passingValue}</span>
                    <span className={`string-shot-comp comparison-${box.passingComp.className}`}>
                      {box.passingComp.text}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* String Length Distribution - Two Column Layout */}
        <section className="string-distribution-section">
          <div className="string-distribution-grid">
            {/* Left Column: Enhanced Histogram */}
            <div className="distribution-column">
              <h4 className="string-section-title">Actions per String Distribution</h4>
              <div className="distribution-list">
                {(() => {
                  const lengthDist = reportData.stringStats?.lengthDistribution || {};
                  const total = reportData.stringStats?.total || 0;
                  const maxCount = Math.max(...Object.values(lengthDist));

                  return Object.entries(lengthDist)
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([length, count]) => {
                      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                      const barWidth = percentage;
                      // Calculate color intensity based on frequency
                      const intensity = maxCount > 0 ? count / maxCount : 0;

                      return (
                        <div key={length} className="distribution-item">
                          <span className="dist-length">{length} {length === '1' ? 'action' : 'actions'}</span>
                          <div
                            className="dist-bar"
                            style={{
                              width: `${barWidth}%`,
                              opacity: 0.5 + (intensity * 0.5)
                            }}
                          ></div>
                          <span className="dist-count">{count} ({percentage}%)</span>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            {/* Right Column: Quick Stats */}
            <div className="quick-stats-column">
              {/* Quick Stats Box */}
              <div className="quick-stats-box">
                <h4 className="quick-stats-title">String Metrics</h4>
                {(() => {
                  const strings = reportData.stringStats || {};
                  const lengthDist = strings.lengthDistribution || {};
                  const actionTallies = strings.actionStringTallies || {};
                  const lastActions = strings.lastActions || {};

                  // Calculate success rate (strings ending in Goal or Shot Saved)
                  const successfulCount = (lastActions['Goal']?.count || 0) + (lastActions['Shot Saved']?.count || 0);
                  const successRate = strings.total > 0 ? Math.round((successfulCount / strings.total) * 100) : 0;

                  // Find most common length
                  const mostCommonEntry = Object.entries(lengthDist)
                    .sort((a, b) => b[1] - a[1])[0];
                  const mostCommonLength = mostCommonEntry ? mostCommonEntry[0] : '-';
                  const mostCommonCount = mostCommonEntry ? mostCommonEntry[1] : 0;
                  const mostCommonPct = strings.total > 0 ? Math.round((mostCommonCount / strings.total) * 100) : 0;

                  // Find longest successful string (ended in Goal or Shot Saved)
                  const longestSuccessful = Object.entries(actionTallies)
                    .filter(([_, data]) => data.successfulShotPct > 0)
                    .map(([length]) => parseInt(length))
                    .sort((a, b) => b - a)[0] || '-';

                  return (
                    <div className="quick-stats-list">
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">String Success Rate:</span>
                        <span className="quick-stat-value">{successRate}%</span>
                      </div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Avg Actions per Goal:</span>
                        <span className="quick-stat-value">{strings.avgActionLengthToGoal || 0}</span>
                      </div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Most Common Length:</span>
                        <span className="quick-stat-value">{mostCommonLength} ({mostCommonPct}%)</span>
                      </div>
                      <div className="quick-stat-item">
                        <span className="quick-stat-label">Longest Successful:</span>
                        <span className="quick-stat-value">{longestSuccessful} actions</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* String Efficiency Chart */}
              <div className="string-efficiency-box">
                <h4 className="efficiency-title">Success Rate by Length</h4>
                <div className="efficiency-chart">
                  {(() => {
                    const actionTallies = reportData.stringStats?.actionStringTallies || {};
                    const maxLength = Math.max(...Object.keys(actionTallies).map(k => parseInt(k)), 5);

                    return Array.from({ length: Math.min(maxLength, 10) }, (_, i) => i + 1).map(length => {
                      const data = actionTallies[length];
                      const successPct = data?.successfulShotPct || 0;
                      const count = data?.count || 0;

                      return (
                        <div key={length} className="efficiency-bar-item">
                          <span className="efficiency-length">{length}</span>
                          <div className="efficiency-bar-container">
                            <div
                              className="efficiency-bar"
                              style={{ width: `${successPct}%` }}
                              title={`${count} strings, ${successPct}% successful`}
                            ></div>
                          </div>
                          <span className="efficiency-pct">{successPct}%</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Page 12: Strings Analysis - Details */}
      <div className="report-page page-12">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">String Analysis - Breakdown</p>
        </header>

        {/* String Tallies (2-column: Action & Passing) */}
        <section className="string-tallies">
          <div className="string-tallies-grid">
            {/* Action String Lengths */}
            <div className="tally-box">
              <h4 className="tally-title">Action String Lengths</h4>
              <div className="tally-list">
                {(() => {
                  const actionTallies = reportData.stringStats?.actionStringTallies || {};
                  return Object.entries(actionTallies)
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([length, data]) => (
                      <div key={length} className="tally-item">
                        <span className="tally-length">{length}:</span>
                        <span className="tally-count">{data.count}</span>
                        <span className="tally-success">({data.successfulShotPct}% successful</span>
                        <span className="tally-goal">, {data.goalPct}% goals)</span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Passing String Lengths */}
            <div className="tally-box">
              <h4 className="tally-title">Passing String Lengths</h4>
              <div className="tally-list">
                {(() => {
                  const passingTallies = reportData.stringStats?.passingStringTallies || {};
                  return Object.entries(passingTallies)
                    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
                    .map(([length, data]) => (
                      <div key={length} className="tally-item">
                        <span className="tally-length">{length}:</span>
                        <span className="tally-count">{data.count}</span>
                        <span className="tally-success">({data.successfulShotPct}% successful</span>
                        <span className="tally-goal">, {data.goalPct}% goals)</span>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* Goal-Scoring Strings List */}
        <section className="goal-strings">
          <h4 className="string-section-title">Goal-Scoring Strings</h4>
          <div className="goal-strings-list">
            {(() => {
              const goalStrings = reportData.stringStats?.goalStrings || [];
              if (goalStrings.length === 0) {
                return <div className="goal-string-item">No goal-scoring strings in this match</div>;
              }
              return goalStrings.map((stringItem) => (
                <div key={stringItem.number} className="goal-string-item">
                  <span className="goal-number">{stringItem.number}.</span>
                  <span className="goal-sequence">{stringItem.sequence.join(', ')}</span>
                  <span className="goal-length">({stringItem.sequence.length + 1} actions)</span>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* Last Action Breakdown */}
        <section className="last-actions">
          <h4 className="string-section-title">String Endings (% of total strings)</h4>
          <div className="last-actions-list">
            {(() => {
              const lastActions = reportData.stringStats?.lastActions || {};
              return Object.entries(lastActions)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([action, data]) => (
                  <div key={action} className="last-action-item">
                    <span className="action-name">{action}</span>
                    <span className="action-count">{data.count}</span>
                    <span className="action-pct">({data.percentage}%)</span>
                  </div>
                ));
            })()}
          </div>
        </section>
      </div>

      {/* PAGE 13: SET PIECE ANALYSIS OVERVIEW */}
      <div className="report-page page-13">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Set Piece Analysis</p>
        </header>

        {/* Team Set Piece Totals Header */}
        <section className="setpiece-totals-header">
          <div className="setpiece-totals-row">
            <span className="setpiece-stat-item">
              <strong>Total:</strong> {reportData.setPieceStats?.total || 0}
            </span>
            <span className="setpiece-stat-item">
              <strong>Shots Generated:</strong> {reportData.setPieceStats?.shotsGenerated || 0} ({reportData.setPieceStats?.total > 0 ? Math.round((reportData.setPieceStats?.shotsGenerated / reportData.setPieceStats?.total) * 100) : 0}%)
            </span>
            <span className="setpiece-stat-item">
              <strong>On Target:</strong> {reportData.setPieceStats?.successful || 0} ({reportData.setPieceStats?.conversionRate || 0}%)
            </span>
            <span className="setpiece-stat-item">
              <strong>Goals:</strong> {reportData.setPieceStats?.goalsScored || 0}
            </span>
          </div>
          <div className="setpiece-comparison-row">
            <span className="comparison-badge">
              vs Season: {formatComparison(calculateSetPiecesComparison())} SP/match
            </span>
            {seasonAverages.setPieces && (
              <>
                <span className="comparison-badge">
                  {reportData.setPieceStats?.conversionRate && seasonAverages.setPieces.avgSuccessRate
                    ? formatComparison(reportData.setPieceStats.conversionRate - seasonAverages.setPieces.avgSuccessRate)
                    : '0.0%'} conversion
                </span>
                <span className="comparison-badge">
                  {reportData.setPieceStats?.goalsScored && seasonAverages.setPieces.avgGoalsPerMatch && reportData.setPieceStats.total > 0
                    ? formatComparison(reportData.setPieceStats.goalsScored - seasonAverages.setPieces.avgGoalsPerMatch)
                    : '0.0%'} goals
                </span>
              </>
            )}
          </div>
        </section>

        {/* Set Piece Type Breakdown */}
        <section className="setpiece-types-section">
          <h3 className="section-heading">SET PIECE TYPE BREAKDOWN</h3>
          <div className="setpiece-type-grid">
            {['TOTB', '3 Lines Restart', 'Corner Right', 'Corner Left', 'Shootout', 'Penalty'].map(type => {
              const typeData = reportData.setPieceStats?.byType?.[type] || {
                count: 0,
                shots: 0,
                shotRate: 0,
                successful: 0,
                successRate: 0,
                goals: 0
              };
              return (
                <div key={type} className="setpiece-type-box">
                  <h4 className="type-name">{type}</h4>
                  <div className="type-stats">
                    <div className="type-stat-line">
                      <span className="stat-label">Count:</span>
                      <span className="stat-value">{typeData.count}</span>
                    </div>
                    <div className="type-stat-line">
                      <span className="stat-label">Shots:</span>
                      <span className="stat-value">{typeData.shots} ({typeData.shotRate || 0}%)</span>
                    </div>
                    <div className="type-stat-line">
                      <span className="stat-label">On Target:</span>
                      <span className="stat-value">{typeData.successful} ({typeData.successRate || 0}%)</span>
                    </div>
                    <div className="type-stat-line">
                      <span className="stat-label">Goals:</span>
                      <span className="stat-value">{typeData.goals}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Section: Zone Field (Left) + Additional Stats (Right 2-column) */}
        <div className="setpiece-bottom-grid">
          {/* LEFT: Shot Zone Distribution */}
          <div className="setpiece-zone-section">
            <h3 className="section-heading">SHOT ZONE DISTRIBUTION</h3>
            {(() => {
              const allShotsData = getSetPieceZoneData('all');
              const maxCount = Math.max(...Object.values(allShotsData), 1);
              const totalShots = reportData.setPieceStats?.shotsGenerated || 0;
              const totalSuccessful = reportData.setPieceStats?.successful || 0;
              const totalGoals = reportData.setPieceStats?.goalsScored || 0;

              return (
                <>
                  <div className="zone-field-container-med green-heatmap">
                    {[12, 13, 11, 14, 9, 10, 8, 6, 7].map(zone => {
                      const count = allShotsData[zone] || 0;
                      const intensity = count / maxCount;
                      const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                      const bgColor = `hsl(120, 50%, ${lightness}%)`;
                      return (
                        <div
                          key={zone}
                          className={`zone-cell-med zone-${zone}`}
                          style={{ backgroundColor: bgColor }}
                        >
                          <span className="zone-cell-count-med">{count > 0 ? count : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="zone-percentages">
                    <div className="zone-pct-item">
                      <strong>Total Shots:</strong> {totalShots}
                    </div>
                    <div className="zone-pct-item">
                      <strong>On Target:</strong> {totalSuccessful} ({totalShots > 0 ? Math.round((totalSuccessful / totalShots) * 100) : 0}%)
                    </div>
                    <div className="zone-pct-item">
                      <strong>Goals:</strong> {totalGoals} ({totalShots > 0 ? Math.round((totalGoals / totalShots) * 100) : 0}%)
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* RIGHT: Additional Statistics (2-column grid) */}
          <div className="setpiece-additional-stats">
            {/* Shot Accuracy */}
            <div className="setpiece-stat-column">
              <h4 className="stat-column-title">Shot Accuracy</h4>
              <div className="stat-breakdown-list">
                {(() => {
                  const accuracy = reportData.setPieceStats?.accuracy || {};
                  const total = reportData.setPieceStats?.shotsGenerated || 0;
                  return Object.entries(accuracy).map(([type, count]) => (
                    <div key={type} className="stat-breakdown-item">
                      <span className="breakdown-label">{type}:</span>
                      <span className="breakdown-value">
                        {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                      </span>
                    </div>
                  ));
                })()}
              </div>

              <h4 className="stat-column-title" style={{ marginTop: '0.5rem' }}>Passes to Result</h4>
              <div className="stat-breakdown-list">
                {(() => {
                  const passesToResult = reportData.setPieceStats?.passesToResult || {};
                  const total = Object.values(passesToResult).reduce((sum, count) => sum + count, 0);

                  const grouped = {};
                  let threePlus = 0;
                  Object.entries(passesToResult).forEach(([passes, count]) => {
                    const numPasses = parseInt(passes);
                    if (numPasses >= 3) {
                      threePlus += count;
                    } else {
                      grouped[passes] = count;
                    }
                  });
                  if (threePlus > 0) {
                    grouped['3+'] = threePlus;
                  }

                  return Object.entries(grouped)
                    .sort((a, b) => {
                      const aNum = a[0] === '3+' ? 3 : parseInt(a[0]);
                      const bNum = b[0] === '3+' ? 3 : parseInt(b[0]);
                      return aNum - bNum;
                    })
                    .map(([passes, count]) => (
                      <div key={passes} className="stat-breakdown-item">
                        <span className="breakdown-label">{passes} {passes === '1' ? 'pass' : 'passes'}:</span>
                        <span className="breakdown-value">
                          {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                        </span>
                      </div>
                    ));
                })()}
              </div>
            </div>

            {/* Shot Results */}
            <div className="setpiece-stat-column">
              <h4 className="stat-column-title">Shot Results</h4>
              <div className="stat-breakdown-list">
                {(() => {
                  const results = reportData.setPieceStats?.results || {};
                  const total = reportData.setPieceStats?.shotsGenerated || 0;
                  return Object.entries(results)
                    .filter(([_, count]) => count > 0)
                    .map(([type, count]) => (
                      <div key={type} className="stat-breakdown-item">
                        <span className="breakdown-label">{type}:</span>
                        <span className="breakdown-value">
                          {count} ({total > 0 ? Math.round((count / total) * 100) : 0}%)
                        </span>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 14: TOP SET PIECE PLAYERS */}
      <div className="report-page page-14">
        {/* Logo */}
        <img src={cometsLogo} alt="KC Comets" className="report-logo" />

        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">KC Comets {location === 'home' ? 'vs' : 'at'} {opponent}</h1>
          <p className="page-subtitle">Top Set Piece Players</p>
        </header>

        {/* Top Set Piece Player Cards */}
        {(() => {
          const topPlayers = getTopSetPiecePlayers();

          if (topPlayers.length === 0) {
            return (
              <div className="no-data-message">
                No set piece player data available for this match.
              </div>
            );
          }

          return topPlayers.map((playerData, index) => {
            const rank = index + 1;
            const onBallStats = playerData.byRole?.onBall || { total: 0, shots: 0, successful: 0, successRate: 0, goals: 0 };
            const otherPlayerStats = playerData.byRole?.otherPlayer || { total: 0, shots: 0, successful: 0, successRate: 0, goals: 0 };
            const zones = playerData.zones || {};
            const types = playerData.types || {};

            // Get top 3 zones
            const topZones = Object.entries(zones)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            // Calculate heatmap colors for mini zone field
            const maxZoneCount = Math.max(...Object.values(zones), 1);

            return (
              <div key={playerData.player} className="top-setpiece-player-card">
                {/* Header */}
                <div className="setpiece-player-header">
                  <span className="setpiece-rank">#{rank}</span>
                  <span className="setpiece-player-name">{playerData.player}</span>
                  <span className="setpiece-participation-count">
                    {playerData.totalParticipation} total ({playerData.onBallCount} on ball, {playerData.otherPlayerCount} as other player)
                  </span>
                </div>

                {/* Participation by Type */}
                <div className="setpiece-types-row">
                  <span className="types-label">Participation by Type:</span>
                  {Object.entries(types)
                    .filter(([_, count]) => count > 0)
                    .map(([type, count]) => (
                      <span key={type} className="type-badge">
                        {type}: {count}
                      </span>
                    ))}
                </div>

                {/* Performance Section */}
                <div className="setpiece-performance">
                  <div className="setpiece-role-stats">
                    <h5 className="role-title">On Ball</h5>
                    <div className="role-stats-content">
                      <div className="role-stat">{onBallStats.total} SP</div>
                      <div className="role-stat">
                        {onBallStats.shots} shots ({onBallStats.total > 0 ? Math.round((onBallStats.shots / onBallStats.total) * 100) : 0}%)
                      </div>
                      <div className="role-stat">
                        {onBallStats.successful} on target ({onBallStats.successRate || 0}%)
                      </div>
                      <div className="role-stat">{onBallStats.goals} goals</div>
                    </div>
                  </div>

                  <div className="setpiece-role-stats">
                    <h5 className="role-title">Other Player</h5>
                    <div className="role-stats-content">
                      <div className="role-stat">{otherPlayerStats.total} SP</div>
                      <div className="role-stat">
                        {otherPlayerStats.shots} shots ({otherPlayerStats.total > 0 ? Math.round((otherPlayerStats.shots / otherPlayerStats.total) * 100) : 0}%)
                      </div>
                      <div className="role-stat">
                        {otherPlayerStats.successful} on target ({otherPlayerStats.successRate || 0}%)
                      </div>
                      <div className="role-stat">{otherPlayerStats.goals} goals</div>
                    </div>
                  </div>
                </div>

                {/* Zone Preferences */}
                {Object.keys(zones).length > 0 && (
                  <div className="setpiece-zone-preferences">
                    {/* Mini Zone Heatmap */}
                    <div className="zone-field-wrapper">
                      <div className="mini-field-container">
                        {[12, 13, 11, 14, 9, 10, 8].map(zone => {
                          const count = zones[zone] || 0;
                          const intensity = count / maxZoneCount;
                          const lightness = count > 0 ? 85 - (intensity * 50) : 95;
                          const bgColor = `hsl(120, 50%, ${lightness}%)`;
                          return (
                            <div
                              key={zone}
                              className={`mini-zone-cell zone-${zone}`}
                              style={{ backgroundColor: bgColor }}
                            >
                              {count > 0 && <span>{count}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Zone List */}
                    <div className="zone-preferences-list">
                      <h5 className="preferences-title">Shot Zones (On Ball):</h5>
                      {topZones.length > 0 ? (
                        topZones.map(([zone, count]) => (
                          <div key={zone} className="zone-preference-item">
                            Zone {zone}: {count} {count === 1 ? 'shot' : 'shots'}
                          </div>
                        ))
                      ) : (
                        <div className="zone-preference-item">No shots taken</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

export default MatchReport;
