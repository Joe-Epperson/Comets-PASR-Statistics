# Data Analysis Feature Documentation

This document describes the data analysis and match report generation system for the Comets PASR Statistics application.

---

## Implementation Status

### Completed (as of December 2024)

**Backend (Comets-PASR-Backend/server.js):**
- [x] `GET /api/actions/count` - Action count validation endpoint
- [x] `GET /api/reports/preview` - Fresh report preview computation (includes zoneDistribution, stringStats, setPieceStats)
- [x] `POST /api/reports/match` - Save/update finalized reports
- [x] `GET /api/reports/match/:match` - Get finalized report
- [x] `GET /api/reports` - Get all reports
- [x] `GET /api/stats/season` - Season statistics aggregation
- [x] `computeSeasonAverages()` helper function (includes strings/setPieces avgPerMatch)

**Frontend:**
- [x] `src/services/api.js` - API service with all endpoint functions
- [x] `src/pages/AnalyzeData.jsx` - Selection UI (match, roster, scores)
- [x] `src/pages/AnalyzeData.css` - Compact no-scroll layout
- [x] `src/pages/reports/MatchReport.jsx` - Print-optimized Page 1
- [x] `src/pages/reports/MatchReport.css` - Print styles
- [x] Route `/report/match` added to App.jsx

**Match Report Page 1 Features:**
- [x] Header with match info, date, and final score
- [x] KC Comets logo (absolute positioned, top-left)
- [x] Match lineup (16 players sorted by jersey number, 8-column grid)
- [x] Overall performance with action breakdown (passes, dribbles, shots)
- [x] Field Tilt visualization (action distribution by thirds with heat map coloring)
- [x] Strings summary (total, avg length, longest, vs season avg)
- [x] Set Pieces summary (total, successful, on-target %, vs season avg)
- [x] Finalize button with confirmation dialog for updates
- [x] Print-optimized CSS with @media print

**Match Report Page 2 Features:**
- [x] Overall Player Success Rates (all actions combined)
- [x] Passing Success Rates (passes only, sorted by rate)
- [x] 4-column grid layout with color-coded cards
- [x] Season comparison badges for overall rates
- [x] Page header with match info

**Match Report Page 3 Features:**
- [x] Shooting Success Rates (shots only, sorted by rate)
- [x] Dribbling Success Rates (dribbles only, sorted by rate)
- [x] Action-specific accent colors (orange=pass, green=shot, purple=dribble)
- [x] Page header with match info

**Match Report Page 4 Features (Shot Zone Analysis):** ✓ COMPLETED December 12, 2024
- [x] Team Shot Totals Header with season comparisons
- [x] Goals percentage in header (e.g., "7 (15%)")
- [x] 2-column layout: Large "All Shots" field (left) + 3 smaller fields horizontal (right)
- [x] Zone heatmap fields: All Shots (blue), Successful (green), Unsuccessful (red), Goals (gold)
- [x] Goalscorers list - horizontal wrapping layout below zone fields
- [x] Chance Conversion Rate (Finishing %) - Goals / Successful Shots with season comparison
- [x] Additional Stats Row with enhanced Previous Action section
- [x] Previous Action shows: total shots, % on target, % goals for each previous action type
- [x] Accuracy and Results sections show counts with percentages
- [x] Compact 3-column layout for Previous Action (name | count | stacked percentages)
- [x] All content fits on single page with optimized spacing

**Match Report Page 5 Features (Top Shooters):** ✓ COMPLETED December 12, 2024
- [x] Top 4 Shooters (sorted by total shots, then by success rate)
- [x] Player cards with jersey number and stats
- [x] Zone preferences with mini heatmap visualization
- [x] Accuracy and Results breakdown for each shooter
- [x] Optimized spacing to utilize full page

**Backend Enhancements (Comets-PASR-Backend):** ✓ COMPLETED December 12, 2024
- [x] `shotStats.previousActionDetails` - success rates and goal rates by previous action type
- [x] `seasonAverages.team.shots.avgConversionRate` - season average finishing percentage

**Match Report Page 6 Features (Pass Zone Analysis):** ✓ COMPLETED
- [x] Team Pass Totals Header with season comparisons
- [x] 2-column layout: 2 Large fields (left) + 6 medium fields 3x2 grid (right)
- [x] Zone heatmap fields: All Passes Start/End (blue), Successful Start/End (green), Incomplete Start/End (red), Clearance/OOB Start/End (red)
- [x] Additional Stats Row: Previous Action, Accuracy breakdown, Result if Bad breakdown
- [x] All content fits on single page

**Match Report Page 7 Features (Passing Statistics):** ✓ COMPLETED
- [x] Pass Direction Zone Analysis (3 small zone fields: Forward, Sideways, Backward)
- [x] Assists and Chance Creators sections with player breakdowns
- [x] All content fits on single page

**Match Report Page 8 Features (Top Passers):** ✓ COMPLETED
- [x] Top 3 Passers (sorted by total passes, then by success rate)
- [x] Player cards with stats breakdown
- [x] Zone preferences with mini heatmap visualization (Zone Started and Zone Ended)
- [x] Direction, Accuracy, and Result if Bad breakdown for each passer
- [x] Optimized spacing to utilize full page

**Match Report Page 9 Features (Dribble Zone Analysis):** ✓ COMPLETED December 13, 2024
- [x] Team Dribble Totals Header with season comparisons
- [x] 2-column layout: 2 Large fields (left) + 6 medium fields 3x2 grid (right)
- [x] Zone heatmap fields: All Dribbles Start/End (blue), Successful Start/End (green), Unsuccessful Start/End (red), Beat Player Start/End (purple)
- [x] Additional Stats Row: Previous Action (with success and beat player rates), Beat Player breakdown, Direction breakdown
- [x] All content fits on single page

**Match Report Page 10 Features (Top Dribblers):** ✓ COMPLETED December 13, 2024
- [x] Top 3 Dribblers (sorted by total dribbles, then by success rate)
- [x] Player cards with stats breakdown
- [x] Zone preferences with mini heatmap visualization (Zone Started and Zone Ended)
- [x] Direction and Beat Player breakdown for each dribbler
- [x] Optimized spacing to utilize full page

**Backend Enhancements (Comets-PASR-Backend):** ✓ COMPLETED December 13, 2024
- [x] `dribbleStats` aggregation - complete zone analysis, direction, beat player statistics
- [x] `dribbleStats.playerDribbles` - individual player breakdowns
- [x] `seasonAverages.team.dribbles` - avgPerMatch, avgSuccessRate, avgBeatPlayerRate

**Match Report Page 11 Features (Strings Analysis):** ✓ COMPLETED December 14, 2024
- [x] Summary Stats Header with 5 main metrics (total, avg action/passing lengths, longest action/passing)
- [x] All 11 metrics include season comparisons (5 main + 6 shot-related)
- [x] Shot-Related Statistics section (3 boxes: to shot, to successful shot, to goal)
- [x] String Length Distribution histogram (shows EVERY length from 1 to max, no grouping)
- [x] String Tallies with dual percentages (successful shots in green, goals in gold)
- [x] Goal-Scoring Strings list showing sequences that resulted in goals
- [x] Last Action Breakdown showing how strings ended (sorted by count)
- [x] All content fits on single page with print optimization

**Backend Enhancements (Comets-PASR-Backend):** ✓ COMPLETED December 14, 2024
- [x] `stringStats` comprehensive aggregation with 11 metrics
- [x] `stringStats.actionStringTallies` and `passingStringTallies` with dual percentages
- [x] `stringStats.lengthDistribution` showing every length (no grouping)
- [x] `stringStats.goalStrings` array with goal-scoring sequences
- [x] `stringStats.lastActions` breakdown with counts and percentages
- [x] `seasonAverages.strings` with all 11 metrics (main + shot-related)

### Pending / Future Work

**Match Report Additional Pages:**
- [ ] Page 12: Set Pieces breakdown (types, conversion rates)

**Additional Report Types:**
- [ ] Player Report: Individual player stats across all matches
- [ ] Season Report: Full season summary and trends

**UI Improvements:**
- [ ] Report type selector functionality (currently only Match Report works)
- [ ] View previously finalized reports from AnalyzeData page

---

## Design Decisions (December 2024)

### Field Tilt Visualization
- **Shape**: Narrow rectangle with rounded ends (indoor soccer field style)
- **Layout**: Centered horizontally, max-width 110px, border-radius 35px
- **Data Source**: Zone Started for passes/dribbles, Zone Taken for shots
- **Thirds**: Attacking (zones 11-14), Middle (zones 5-10), Defensive (zones 1-4)
- **Heat Map**: Darker blue = more actions (HSL-based, 20-55% lightness range)
- **Display**: Count + percentage for each third

### Strings/Set Pieces Statistics
- **Strings**: Total count, average length, longest string, comparison to season avg
- **Set Pieces**: Total count, successful count, on-target percentage, comparison to season avg
- **Set Piece Success Definition**: Shot Taken = "Yes" AND Accuracy = "On" (shots on target)
- **Comparison Logic**: Shows 0.0% when no finalized matches exist (avoids misleading values)

### Player Success Rate Cards
- **Layout**: 4-column grid, sorted by success rate (highest first)
- **Color Tiers**: Green (90%+) to Red (<50%) with distinct background colors
- **Comparison**: vs season average, neutral grey when first match

### Action-Specific Success Rate Pages
- **Page 2**: Overall (all actions) + Passing success rates
- **Page 3**: Shooting + Dribbling success rates
- **Sorting**: Each section sorted by that action's success rate (highest first)
- **Accent Colors**: Pass (orange), Shot (green), Dribble (purple) - matches data collection buttons
- **No Comparison**: Action-specific cards don't show season comparison (only overall does)

### Shot Zone Analysis Pages (Pages 4-5) - IMPLEMENTATION PLAN

#### Page 4: Shot Zone Analysis

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]              KC Comets vs/at [Opponent]                     │
│                      Shot Zone Analysis                             │
├─────────────────────────────────────────────────────────────────────┤
│  TEAM SHOT TOTALS                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Total: 24 shots | Successful: 18 (75%) | Goals: 5           │   │
│  │ Season Avg: 22.3 shots/match | 71.2% success | 4.1 goals    │   │
│  │ vs Season: +1.7 shots | +3.8% success | +0.9 goals          │   │
│  └─────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  ALL SHOTS   │  │  SUCCESSFUL  │  │ UNSUCCESSFUL │  │  GOALS  │ │
│  │   (Blue)     │  │   (Green)    │  │    (Red)     │  │ (Gold)  │ │
│  │              │  │              │  │              │  │         │ │
│  │  [14-zone    │  │  [14-zone    │  │  [14-zone    │  │[14-zone │ │
│  │   field]     │  │   field]     │  │   field]     │  │ field]  │ │
│  │              │  │              │  │              │  │         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘ │
│                                                                     │
│  Zone Stats (All Shots only):                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Zone | Count | % of Total | Success Rate                     │  │
│  │  11  |   8   |   33.3%    |    75.0%                         │  │
│  │  12  |   6   |   25.0%    |    83.3%                         │  │
│  │ ...  |  ...  |    ...     |     ...                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│  Additional Stats (horizontal row):                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐    │
│  │ PREVIOUS ACTION│  │   ACCURACY     │  │      RESULT        │    │
│  │ Pass: 15       │  │ On Target: 18  │  │ Goal: 5            │    │
│  │ Dribble: 6     │  │ Off Target: 4  │  │ Save: 8            │    │
│  │ Ball Won: 3    │  │ Blocked: 2     │  │ Boards Kept: 3     │    │
│  │                │  │                │  │ Boards Lost: 2     │    │
│  │                │  │                │  │ Out of Bounds: 4   │    │
│  │                │  │                │  │ Block Kept: 1      │    │
│  │                │  │                │  │ Block Lost: 1      │    │
│  └────────────────┘  └────────────────┘  └────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**

1. **Team Shot Totals Header**
   - Total shots, successful shots (%), goals scored
   - Season averages for comparison (shots/match, success rate, goals/match)
   - Comparison badges (+/- from season average)

2. **Four Zone Heatmap Fields (2x2 grid)**
   - **All Shots**: Blue heatmap (darker = more shots)
   - **Successful Shots**: Green heatmap (shots with Successful=true)
   - **Unsuccessful Shots**: Red heatmap (shots with Successful=false)
   - **Goals**: Gold/yellow heatmap (shots with Result="Goal")
   - Heatmap intensity based on shot COUNT (not success rate)
   - Each zone shows the count number inside

3. **Zone Statistics Table (All Shots only)**
   - Shows only zones with shots taken
   - Columns: Zone Number, Shot Count, % of Total, Success Rate
   - Sorted by shot count (highest first)

4. **Additional Stats Row**
   - **Previous Action**: Count by type (Pass, Dribble, Ball Won, Beginning of Play)
   - **Accuracy**: Count by accuracy (On Target, Off Target, Blocked)
   - **Result**: Count by result (Goal, Save, Boards Kept/Lost, Out of Bounds, Block Kept/Lost)

#### Page 5: Top Shooters

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]              KC Comets vs/at [Opponent]                     │
│                      Top Shooters                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ #1 - 10 Leo Gibson                                          │   │
│  │ 8 shots | 6 successful (75%) | 2 goals                      │   │
│  │ Zone Preferences:                                           │   │
│  │   Zone 11: 4 shots (50%) - 75% success                      │   │
│  │   Zone 12: 2 shots (25%) - 100% success                     │   │
│  │   Zone 7: 2 shots (25%) - 50% success                       │   │
│  │ ┌──────────────┐                                            │   │
│  │ │ [Player      │  Accuracy: On 6, Off 1, Block 1            │   │
│  │ │  zone field] │  Results: Goal 2, Save 3, Boards 2, OOB 1  │   │
│  │ └──────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ #2 - 7 John Doe                                             │   │
│  │ [Similar layout...]                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ #3 - 23 Jane Smith                                          │   │
│  │ [Similar layout...]                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**Components:**

1. **Top 3 Shooters Cards** (sorted by total shots, then by success rate)
   - Player name with jersey number
   - Total shots, successful shots (%), goals
   - Zone preferences: Top 3 zones with shot count, % of player's shots, success rate in that zone
   - Mini zone field showing player's shot distribution
   - Accuracy breakdown (On/Off/Block counts)
   - Result breakdown (counts by result type)

#### Heatmap Color Schemes

| Field Type | Base Color | Lightest (0 shots) | Darkest (max shots) |
|------------|------------|-------------------|---------------------|
| All Shots | Blue | #e3f2fd (very light) | #1565c0 (dark blue) |
| Successful | Green | #e8f5e9 (very light) | #2e7d32 (dark green) |
| Unsuccessful | Red | #ffebee (very light) | #c62828 (dark red) |
| Goals | Gold | #fffde7 (very light) | #f9a825 (dark gold) |

**Heatmap Calculation:**
```javascript
// Intensity based on shot count relative to max in that category
const maxCount = Math.max(...Object.values(zoneCounts));
const intensity = count / maxCount; // 0 to 1
// Apply to HSL lightness: 90% (light) to 35% (dark)
const lightness = 90 - (intensity * 55);
```

#### Data Requirements

**Frontend needs from reportData.shotStats:**
```javascript
{
  "total": 24,
  "successful": 18,
  "unsuccessful": 6,
  "goals": 5,
  "zones": {
    "11": { "count": 8, "successful": 6, "goals": 2 },
    "12": { "count": 6, "successful": 5, "goals": 2 },
    "7": { "count": 4, "successful": 3, "goals": 1 },
    // ... other zones
  },
  "previousAction": {
    "Pass": 15,
    "Dribble": 6,
    "Ball Won": 3,
    "Beginning of Play": 0
  },
  "accuracy": {
    "On": 18,
    "Off": 4,
    "Block": 2
  },
  "results": {
    "Goal": 5,
    "Save": 8,
    "Boards Ball Kept": 3,
    "Boards Ball Lost": 2,
    "Out of Bounds": 4,
    "Block Ball Kept": 1,
    "Block Ball Lost": 1
  },
  "playerShots": {
    "10 - Leo Gibson": {
      "total": 8,
      "successful": 6,
      "goals": 2,
      "zones": { "11": 4, "12": 2, "7": 2 },
      "accuracy": { "On": 6, "Off": 1, "Block": 1 },
      "results": { "Goal": 2, "Save": 3, "Boards Ball Kept": 2, "Out of Bounds": 1 }
    },
    // ... other players
  }
}
```

**Season Averages needed:**
```javascript
seasonAverages.team.shots = {
  avgPerMatch: 22.3,
  avgSuccessRate: 71.2,
  avgGoalsPerMatch: 4.1
}
```

### Strings Analysis Page (Page 11) - Implementation Details

#### Key Design Decisions (December 14, 2024)

**String Length Definitions:**
- **Action String Length**: Includes ALL actions in the string (passes, dribbles, AND the final shot/action). Uses the "Action Count" field from the String JSON structure.
- **Passing String Length**: Counts ONLY Pass actions. Uses the "Pass Count" field from the String JSON structure.

**Successful Shot Definition:**
- **Successful**: Last Action = "Shot Saved" OR "Goal"
- **Unsuccessful**: Last Action = "Shot"
- Referenced in [CLAUDE.md](CLAUDE.md) lines 507-514

**Season Comparisons:**
- ALL 11 metrics include season comparisons (not just the 5 main metrics)
- 5 main metrics: total count, avg action length, avg passing length, highest action, highest passing
- 6 shot-related metrics: avg to shot, avg to successful shot, avg to goal (both action and passing)
- Comparison format: "+2.3 vs avg" with color coding (green/red/gray)

**Histogram Design:**
- Shows EVERY string length from 1 to maximum (no "6+" grouping)
- Visual bars with percentages
- Bars are blue gradient matching Comets color scheme
- Bar width proportional to percentage of total strings

**Dual Percentages in Tallies:**
- **Successful shots** (Shot Saved + Goal): Green color (#4CAF50)
- **Goals only**: Gold color (#f9a825)
- Format: `3: 23 (35% successful, 15% goals)`

**Goal String Sequences:**
- Display strings where Last Action = "Goal"
- The sequence array does NOT include "Goal" (it's already in Last Action field)
- Shows action sequence leading up to the goal

**String Stats Data Structure:**
```javascript
stringStats = {
  // Basic stats (5 main metrics)
  total: 0,
  avgActionLength: 0,       // Average of "Action Count"
  avgPassingLength: 0,      // Average of "Pass Count"
  longestAction: 0,         // Max "Action Count"
  longestPassing: 0,        // Max "Pass Count"

  // Shot-related stats (6 metrics)
  avgActionLengthToShot: 0,
  avgPassingLengthToShot: 0,
  avgActionLengthToSuccessfulShot: 0,
  avgPassingLengthToSuccessfulShot: 0,
  avgActionLengthToGoal: 0,
  avgPassingLengthToGoal: 0,

  // Tallies with dual percentages
  actionStringTallies: {
    "1": { count: 4, successfulShotPct: 12, goalPct: 5 }
  },
  passingStringTallies: {
    "1": { count: 3, successfulShotPct: 10, goalPct: 3 }
  },

  // Distribution (every length)
  lengthDistribution: {
    "1": 12, "2": 20, "3": 8, ... // Up to max length
  },

  // Goal strings
  goalStrings: [
    { sequence: ["Pass", "Dribble", "Pass"], number: 1 }
  ],

  // Last actions
  lastActions: {
    "Pass": { count: 15, percentage: 30 }
  }
}
```

#### Implementation Steps

1. **Backend Updates (server.js)**
   - Modify `/api/reports/preview` to compute detailed `shotStats` from Shots collection
   - Add team shot averages to `computeSeasonAverages()`
   - Aggregate shots by zone, accuracy, result, previous action, and player

2. **Frontend - Page 4 (MatchReport.jsx)**
   - Add `report-page page-4` div with page break
   - Create Team Shot Totals Header component
   - Create ZoneHeatmapField component (reusable for 4 fields)
   - Create Zone Statistics table
   - Create Additional Stats row (3 columns)

3. **Frontend - Page 5 (MatchReport.jsx)**
   - Add `report-page page-5` div with page break
   - Create TopShooterCard component
   - Calculate top 3 shooters by shot count
   - Display zone preferences with mini heatmap

4. **CSS Updates (MatchReport.css)**
   - Heatmap zone styling with dynamic backgrounds
   - Zone field grid layout (14 zones)
   - Top shooter card styling
   - Print optimization for pages 4-5

---

## Overview

The data analysis feature allows generating match reports, player reports, and season reports from collected PASR action data. Reports can be previewed in the browser and printed to PDF.

---

## Architecture

### Report Flow

```
AnalyzeData Page          →    MatchReport Page       →    PDF
(Selection UI)                 (Preview/Finalize)          (Browser Print)

1. Select match                1. View computed stats      1. Ctrl+P
2. Select 16 players           2. Review data              2. Save as PDF
3. Enter scores                3. Click "Finalize"
4. Click "Generate Preview"    4. Report saved to DB
```

### MongoDB Collections

**Existing Collections** (raw action data):
- `Passes` - Individual pass actions
- `Shots` - Individual shot actions
- `Dribbles` - Individual dribble actions
- `Set Pieces` - Individual set piece actions
- `Strings` - Consecutive action sequences

**New Collection** (aggregated reports):
- `MatchReports` - Finalized match report data with computed statistics

---

## MatchReports Schema

```javascript
{
  "_id": ObjectId,
  "match": "Match 1: KC Comets at St. Louis Ambush (Friday, November 28th 2025)",
  "opponent": "St. Louis Ambush",
  "location": "away",  // "home" or "away" (parsed from "at" vs "vs")
  "finalizedAt": ISODate,

  "score": {
    "comets": 5,
    "opponent": 3
  },

  "roster": [
    "1 - Nicolau Neto",
    "4 - Chad Vandegriffe",
    // ... 16 players total
  ],

  "totals": {
    "actions": 245,
    "successful": 198,
    "unsuccessful": 47,
    "successRate": 80.82
  },

  "playerStats": [
    {
      "player": "10 - Leo Gibson",
      "actions": 32,
      "successful": 28,
      "unsuccessful": 4,
      "successRate": 87.5,
      "passes": { "total": 20, "successful": 18 },
      "dribbles": { "total": 8, "successful": 7 },
      "shots": { "total": 4, "successful": 3 }
    }
    // ... for each of 16 roster players
  ],

  // Reserved for future detail pages
  "passStats": {},
  "dribbleStats": {},
  "shotStats": {},
  "stringStats": {},
  "setPieceStats": {}
}
```

---

## API Endpoints

### Action Count (Validation)
```
GET /api/actions/count?match=<encoded-match-string>

Response: {
  "match": "Match 1: ...",
  "count": 245,
  "breakdown": {
    "passes": 150,
    "shots": 35,
    "dribbles": 60
  }
}
```

### Report Preview (Fresh Computation)
```
GET /api/reports/preview?match=<encoded>&players[]=<player1>&players[]=<player2>...

Response: {
  "match": "Match 1: ...",
  "totals": { ... },
  "playerStats": [ ... ],
  "seasonAverages": {
    "team": { "successRate": 78.5 },
    "players": {
      "10 - Leo Gibson": { "successRate": 82.3, "actions": 156 },
      ...
    }
  }
}
```

### Finalize Report (Save)
```
POST /api/reports/match
Body: {
  "match": "Match 1: ...",
  "score": { "comets": 5, "opponent": 3 },
  "roster": [...],
  "totals": { ... },
  "playerStats": [ ... ]
}

Response: {
  "success": true,
  "insertedId": "...",
  "updated": false  // true if existing report was updated
}
```

### Get Finalized Report
```
GET /api/reports/match/:match

Response: Full MatchReport document or 404
```

### Season Statistics
```
GET /api/stats/season

Response: {
  "matchCount": 5,
  "teamStats": {
    "totalActions": 1200,
    "successRate": 78.5
  },
  "playerStats": {
    "10 - Leo Gibson": {
      "matchesPlayed": 5,
      "totalActions": 156,
      "successful": 128,
      "successRate": 82.1
    },
    ...
  }
}
```

---

## Success Rate Calculations

### What's Included
- **Pass** actions (Successful = true/false)
- **Dribble** actions (Successful = true/false)
- **Shot** actions (Successful = true/false)

### What's Excluded
- **Set Pieces** - Tracked separately, not included in player success rates

### Formulas

**Player Match Success Rate:**
```
rate = (successful_passes + successful_dribbles + successful_shots)
     / (total_passes + total_dribbles + total_shots) * 100
```

**Team Match Success Rate:**
```
rate = sum(all_successful_actions) / sum(all_actions) * 100
```

**Season Average (per player):**
```
rate = sum(successful_actions_across_all_finalized_matches)
     / sum(total_actions_across_all_finalized_matches) * 100
```

**Comparison to Season:**
```
comparison = match_rate - season_average
Display: "+5.2%" (green) or "-3.1%" (red) or "0.0%" (grey)
```

---

## Color Coding

### Success Rate Bars
| Rate Range | Color | Hex Code |
|------------|-------|----------|
| 90-100% | Dark Green | #1B5E20 |
| 80-89% | Medium Green | #388E3C |
| 70-79% | Light Green | #66BB6A |
| 60-69% | Yellow | #FDD835 |
| 50-59% | Orange | #FB8C00 |
| Below 50% | Red | #D32F2F |

### Comparison Badges
| Comparison | Color | Hex Code |
|------------|-------|----------|
| Positive (+) | Green | #4CAF50 |
| Negative (-) | Red | #F44336 |
| Neutral (0) | Grey | #9E9E9E |

---

## Edge Cases

### First Match of Season
- Season average equals match average (only 1 data point)
- Comparison shows "0.0%" with grey background
- Current match IS included in its own season average

### Player with 0 Actions
- Display "-" or "0/0" instead of percentage
- Use grey styling
- Exclude from success rate bar visualization
- Still include in roster list

### Player in Roster but No Action Data
- Include with 0 counts for all action types
- Show as 0 actions, no success rate

### Re-finalizing a Match
- Check if report already exists
- Show confirmation dialog: "Report already exists. Update?"
- On confirm: Update existing document (upsert)

---

## Frontend Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/analyze-data` | AnalyzeData.jsx | Selection UI for reports |
| `/report/match/:matchId` | MatchReport.jsx | Print-optimized report view |

---

## Print Optimization

The MatchReport component uses CSS `@media print` for PDF generation:

```css
@media print {
  /* Hide screen-only elements */
  .no-print { display: none; }

  /* Ensure colors print */
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Page settings */
  @page {
    size: letter;
    margin: 0.5in;
  }

  /* Page breaks between sections */
  .page {
    page-break-after: always;
  }
}
```

### PDF Generation Steps
1. Click "Generate Report Preview" on AnalyzeData page
2. Report opens in new tab
3. Review data, click "Finalize Report" to save
4. Press Ctrl+P (or Cmd+P on Mac)
5. Select "Save as PDF"
6. PDF downloads with all styling preserved

---

## File Structure

```
src/
├── services/
│   └── api.js                    # API service functions
├── pages/
│   ├── AnalyzeData.jsx           # Report selection UI
│   ├── AnalyzeData.css
│   └── reports/
│       ├── MatchReport.jsx       # Print-optimized report
│       └── MatchReport.css       # Print styles
```

---

## State Management

### AnalyzeData Page State
- `selectedMatch` - Match string from dropdown
- `selectedPlayers` - Array of 16 player strings
- `cometsScore` - Number input
- `opponentScore` - Number input
- `actionCount` - Fetched from API for validation
- `isLoading` - Loading state for API calls

### MatchReport Page State
- Report data passed via URL params or fetched from API
- `isFinalized` - Whether report has been saved
- `seasonAverages` - Fetched for comparison display

---

## Implementation Notes

### Opponent Extraction
Parse from match string:
```javascript
// "Match 1: KC Comets at St. Louis Ambush (...)" → "St. Louis Ambush"
// "Match 2: KC Comets vs Milwaukee Wave (...)" → "Milwaukee Wave"
const parseOpponent = (match) => {
  const atMatch = match.match(/KC Comets at (.+?) \(/);
  const vsMatch = match.match(/KC Comets vs (.+?) \(/);
  return atMatch?.[1] || vsMatch?.[1] || 'Unknown';
};

const parseLocation = (match) => {
  return match.includes(' at ') ? 'away' : 'home';
};
```

### Player Sorting
On the report, players are sorted by success rate (highest first):
```javascript
playerStats.sort((a, b) => b.successRate - a.successRate);
```

Players with 0 actions appear at the bottom with grey styling.

---

## Future Enhancements

### Additional Report Pages (Planned)
- Page 2: Passes breakdown (zones, directions, accuracy)
- Page 3: Shots breakdown (zones, accuracy, results)
- Page 4: Dribbles breakdown (zones, beat player stats)
- Page 5: Strings breakdown (length distribution, endings)
- Page 6: Set Pieces breakdown (types, conversion rates)

### Additional Report Types (Planned)
- Player Report: Individual player stats across all matches
- Season Report: Full season summary and trends

---

## Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Main project documentation
- Backend: `Comets-PASR-Backend/server.js` - API endpoints
