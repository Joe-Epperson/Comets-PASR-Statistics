# Comets PASR Statistics - Project Documentation

## Project Overview

A web application for tracking and storing soccer player action data. PASR stands for **Pass, Action (Dribble), Shot, String, and Set Piece** - the five types of player actions that can be recorded.

### Tech Stack
- **Frontend**: Vite + React (JavaScript) + CSS
- **Backend**: Node.js/Express (to be implemented)
- **Database**: MongoDB Community Edition (hosted locally)

---

## Current Project Status

### Phase: Initial Setup
- Fresh Vite React project initialized
- Git repository created with initial commit
- Working branch: `feature/initializing-with-claude`
- **No backend implemented yet**
- **No database connection established yet**
- Default Vite template files present

---

## Application Structure (Planned)

### Main Screens

#### 1. Home Screen
**Purpose**: Match selection and navigation hub

**Components**:
- Match dropdown selector (disabled by default)
- "Start Match" button (disabled until match selected)
- "Analyze Data" button (placeholder for future feature)

**Functionality**:
- Match selection stored in Preact signal
- "Start Match" button enabled only when match is selected
- "Start Match" navigates to Data Collection Screen
- "Analyze Data" navigates to placeholder page

**Match Data** (24 matches for 2025-2026 season):
```javascript
const matches = [
  "Match 1: KC Comets at St. Louis Ambush (Friday, November 28th 2025)",
  "Match 2: KC Comets vs St. Louis Ambush (Saturday, November 29th 2025)",
  "Match 3: KC Comets at Baltimore Blast (Saturday, December 6th 2025)",
  "Match 4: KC Comets at Utica City FC (Sunday, December 7th 2025)",
  "Match 5: KC Comets vs Milwaukee Wave (Friday, December 12th 2025)",
  "Match 6: KC Comets at Utica City FC (Sunday, December 14th 2025)",
  "Match 7: KC Comets at St. Louis Ambush (Sunday, December 21st 2025)",
  "Match 8: KC Comets vs St. Louis Ambush (Saturday, December 27th 2025)",
  "Match 9: KC Comets at St. Louis Ambush (Wednesday, December 31st 2025)",
  "Match 10: KC Comets vs St. Louis Ambush (Sunday, January 4th 2026)",
  "Match 11: KC Comets vs Milwaukee Wave (Sunday, January 11th 2026)",
  "Match 12: KC Comets vs Tacoma Stars (Friday, January 16th 2026)",
  "Match 13: KC Comets at Milwaukee Wave (Sunday, January 18th 2026)",
  "Match 14: KC Comets at Empire Strykers (Sunday, January 25th 2026)",
  "Match 15: KC Comets vs Empire Strykers (Friday, January 30th 2026)",
  "Match 16: KC Comets at Milwaukee Wave (Tuesday, February 10th 2026)",
  "Match 17: KC Comets vs San Diego Sockers (Saturday, February 14th 2026)",
  "Match 18: KC Comets vs Utica City FC (Sunday, February 22nd 2026)",
  "Match 19: KC Comets at Tacoma Stars (Friday, March 6th 2026)",
  "Match 20: KC Comets vs San Diego Sockers (Saturday, March 14th 2026)",
  "Match 21: KC Comets at San Diego Sockers (Sunday, March 15th 2026)",
  "Match 22: KC Comets vs Baltimore Blast (Saturday, March 21st 2026)",
  "Match 23: KC Comets vs San Diego Sockers (Friday, March 27th 2026)",
  "Match 24: KC Comets at San Diego Sockers (Sunday, March 29th 2026)"
];
```

#### 2. Data Collection Screen
**Purpose**: Record player actions during match

**Visual Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Collection                          │
│         Match: [Selected Match Name]                        │
├───────────────────────┬─────────────────────────────────────┤
│  Selected Players     │    Action Buttons                   │
│  (16 from roster)     │                                     │
│                       │  ┌────────────────────────────┐     │
│  ○ Player 1           │  │ [Pass +] [Shot +] [Dribble +]   │
│  ● Player 2 (active)  │  │ [Pass -] [Shot -] [Dribble -]   │
│  ○ Player 3           │  └────────────────────────────┘     │
│  ...                  │                                     │
│                       │  ────────────────────────            │
│                       │  [Set Piece] (always enabled)       │
└───────────────────────┴─────────────────────────────────────┘

Button Layout Detail:
Row 1 (Top):    [Pass +]     [Shot +]     [Dribble +]
Row 2 (Bottom): [Pass -]     [Shot -]     [Dribble -]
```

**Layout**: Two-column layout (player list left, action buttons right)

**Player List (Left Column)**:
- Display all 16 selected players from Home screen
- Single-select radio button or click-to-select interface
- Visual indication of currently selected player
- Player must be selected before action buttons are enabled

**Action Buttons (Right Column)**:
- **Three Main Player Actions** (6 buttons in 2x3 grid):
  - **Grid Layout**:
    - Top Row: Pass +, Shot +, Dribble +
    - Bottom Row: Pass -, Shot -, Dribble -
  - **Button Order**: Pass | Shot | Dribble (left to right)

- **Color Scheme**:
  - **Pass Buttons**: Two shades of orange
    - Pass (+): Lighter/brighter orange
    - Pass (-): Darker/muted orange
  - **Shot Buttons**: Two shades of green
    - Shot (+): Lighter/brighter green
    - Shot (-): Darker/muted green
  - **Dribble Buttons**: Two shades of purple
    - Dribble (+): Lighter/brighter purple
    - Dribble (-): Darker/muted purple

- **Set Piece Button** (1 button):
  - Always enabled (doesn't require player pre-selection)
  - Players selected within Set Piece flow
  - Positioned below the 2x3 action grid

- **Button States**:
  - Disabled (grayed out) until player selected
  - Hover effects for enabled buttons
  - Clear visual distinction between +/- within each action type

**Action Flow**:
1. User selects a player from the list (left side)
2. Action buttons become enabled (right side)
3. User clicks an action button (e.g., "Pass +")
4. System stores: `selectedPlayer`, `actionType` (Pass/Dribble/Shot), `isSuccessful` (true/false)
5. Navigate to action-specific detail page
6. On detail page, complete data collection for that action
7. POST JSON to backend with all collected data

**State Management**:
- `selectedMatch` - from Home screen (already stored)
- `selectedPlayers` - array of 16 players from Home screen (already stored)
- `currentPlayer` - currently selected player for action (new signal)
- `currentActionType` - Pass/Dribble/Shot/SetPiece (new signal)
- `isSuccessful` - true/false for action outcome (new signal)

**String Tracking** (Background):
- Tracks consecutive successful actions automatically
- No button on main screen
- Details to be implemented later

#### 3. Analyze Data Screen (Placeholder)
**Purpose**: Future data analysis and visualization
- Currently just a placeholder page
- Will display collected data with analytics

### Data Collection Flow
- User selects one of 5 action types: Pass, Dribble, Shot, String, or Set Piece
- Each action type presents a unique data collection screen with sequential button clicks
- Data is captured in JSON format
- At completion, POST request sends data to backend for MongoDB storage

---

## Player Action Types

### 1. Pass
**Context Available on Detail Page**:
- Match (from Home screen)
- Player (from Data Collection screen)
- Action Type: "Pass"
- Successful: true/false (from Data Collection screen)

**Additional Data to Collect**:
*To be specified in detail page design*

### 2. Dribble
**Context Available on Detail Page**:
- Match (from Home screen)
- Player (from Data Collection screen)
- Action Type: "Dribble"
- Successful: true/false (from Data Collection screen)

**Additional Data to Collect**:
*To be specified in detail page design*

### 3. Shot
**Context Available on Detail Page**:
- Match (from Home screen)
- Player (from Data Collection screen)
- Action Type: "Shot"
- Successful: true/false (from Data Collection screen)

**Additional Data to Collect**:
*To be specified in detail page design*

### 4. String
**Background Tracking**:
- Automatically tracks consecutive successful actions
- Increments on each successful Pass/Dribble/Shot
- Resets on unsuccessful action
- Implementation details to be specified

### 5. Set Piece
**Context Available on Detail Page**:
- Match (from Home screen)
- Action Type: "Set Piece"
- Players selected within Set Piece flow (not pre-selected)

**Additional Data to Collect**:
*To be specified in detail page design*

---

## File Structure

```
Comets-PASR-Statistics/
├── public/                     # Static assets
│   └── vite.svg
├── src/                        # Source code
│   ├── assets/                 # Images, icons
│   │   └── react.svg
│   ├── components/             # React components (to be created)
│   ├── pages/                  # Page components (to be created)
│   ├── services/               # API services (to be created)
│   ├── utils/                  # Utility functions (to be created)
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── server/                     # Backend server (to be created)
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── controllers/            # Route controllers
│   └── server.js               # Express server entry
├── .git/
├── .gitignore
├── eslint.config.js
├── vite.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── claude.md                   # This file
```

---

## Dependencies

### Current Frontend Dependencies
- `react` ^19.2.0
- `react-dom` ^19.2.0

### Installed Frontend Dependencies ✓
- `@preact/signals-react` - State management with Preact signals
- `react-router-dom` - Client-side routing for navigation

### Current Dev Dependencies
- `vite` ^7.2.2
- `@vitejs/plugin-react` ^5.1.0
- `@preact/signals-react-transform` - Babel transform for signal reactivity
- `eslint` ^9.39.1
- ESLint plugins (react-hooks, react-refresh)

### Required Backend Dependencies (to be installed)
- `express` - Web server framework
- `mongoose` - MongoDB ODM
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `nodemon` - Development server auto-restart

---

## Data Model (Planned)

### Player Action Schema (Draft)
```javascript
{
  actionType: String,    // "Pass" | "Dribble" | "Shot" | "String" | "Set Piece"
  timestamp: Date,       // When action was recorded
  playerData: Object,    // Player information
  actionData: Object,    // Action-specific data (varies by type)
  // Additional fields to be defined
}
```

*Specific schemas for each action type to be defined*

---

## API Endpoints (Planned)

### POST /api/actions
- **Description**: Create a new player action record
- **Request Body**: JSON object with action data
- **Response**: Created action with MongoDB _id

*Additional endpoints to be defined as needed*

---

## Development Scripts

```bash
# Frontend Development
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend Development (to be configured)
npm run server       # Start Express server
npm run server:dev   # Start with nodemon
```

---

## MongoDB Setup

### Connection Details
- **Host**: localhost
- **Port**: 27017 (default)
- **Database Name**: TBD
- **Collections**: TBD

### Setup Requirements
1. MongoDB Community Edition installed locally
2. MongoDB service running
3. Database and collections created
4. Connection string configured in environment variables

---

## Environment Variables (to be configured)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/comets-pasr-statistics
DB_NAME=comets-pasr-statistics

# Server
PORT=5000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

---

## Git Workflow

### Branches
- `main` - Production-ready code
- `dev` - Development integration branch
- `feature/initializing-with-claude` - Current feature branch

### Commit Strategy
- Descriptive commit messages
- One feature/fix per commit when possible
- Regular commits to track progress

---

## Data Flow Architecture

### Signal Management

**Existing Signals** (from Home screen):
- `selectedMatch` (string) - The selected match from dropdown
- `selectedPlayers` (array) - 16 players selected for the match

**New Signals Needed** (for Data Collection):
- `currentPlayer` (string) - Currently selected player for action
- `currentActionType` (string) - "Pass" | "Dribble" | "Shot" | "SetPiece"
- `isSuccessful` (boolean) - true for (+), false for (-)

### Navigation Flow
```
Home Screen
  ↓ (select match + 16 players)
  ↓ Click "Start Match"
  ↓
Data Collection Screen (main)
  ↓ (select player)
  ↓ (click action button, e.g., "Pass +")
  ↓ (stores: currentPlayer, actionType="Pass", isSuccessful=true)
  ↓
Pass Detail Screen
  ↓ (collect additional Pass-specific data)
  ↓ (build complete JSON object)
  ↓ POST to backend
  ↓
Return to Data Collection Screen (main)
  ↓ (repeat for next action)
```

### Routing Structure (Planned)
- `/` - Home (match + player selection)
- `/data-collection` - Main data collection screen
- `/action/pass` - Pass action detail screen
- `/action/dribble` - Dribble action detail screen
- `/action/shot` - Shot action detail screen
- `/action/setpiece` - Set Piece action detail screen
- `/analyze-data` - Data analysis (placeholder)

---

## Next Steps

1. ✓ Implement Data Collection main screen layout
2. Define detailed requirements for each action type's detail screen
3. Define JSON structure for each action type
4. Implement action detail screens (Pass, Dribble, Shot, Set Piece)
5. Set up Express backend server
6. Configure MongoDB connection
7. Create database schemas
8. Connect frontend to backend API
9. Implement String tracking logic
10. Testing and refinement

---

## Notes

- Application uses button-based sequential data entry (no forms with text inputs initially)
- Each action type has unique data requirements
- Data is sent to backend only upon completion of data collection sequence
- Focus on clean, maintainable code structure
- Responsive design considerations TBD

---

---

## Implementation Status

### Completed Features

#### Home Page ✓
**Layout**: Two-column grid layout (player selection left, match selection right)

**Player Selection (Left Column)**:
- Checkbox list of all 25 KC Comets players
- Select exactly 16 players to participate in match
- Real-time counter: "Selected: X/16" (turns red when complete)
- "Clear All" button to deselect all players
- Checkboxes auto-disable when 16 players selected
- Selected players highlighted with blue border/background
- Scrollable list with custom blue-themed scrollbar
- Preact signal stores selected players array

**Match Selection (Right Column)**:
- Dropdown selector with 24 matches from 2025-2026 season
- Validation messages show missing requirements
- "Start Match" button (enabled only when match selected AND 16 players selected)
- "Analyze Data" button (navigates to placeholder)

**State Management**:
- `selectedMatch` signal - stores selected match string
- `selectedPlayers` signal - stores array of 16 player names
- Preact signals with React transform plugin for reactivity
- Signals persist during session, accessible across pages

**Design**:
- Full KC Comets branding (red, blue, white color scheme)
- Player section: blue border, Match section: red border
- Responsive design - stacks vertically on mobile (<992px)
- Smooth transitions and hover effects
- React Router navigation configured

#### Navigation ✓
- Three-page routing structure implemented
- Home page (/)
- Data Collection page (/data-collection) - placeholder
- Analyze Data page (/analyze-data) - placeholder

#### Styling ✓
- Global CSS with KC Comets brand colors
- **Brand Color Variables**:
  - --comets-red (#E31937), --comets-blue (#003DA5), --comets-white
- **Action-Specific Colors** (for Data Collection):
  - Pass: Orange shades (light/dark)
  - Shot: Green shades (light/dark)
  - Dribble: Purple shades (light/dark)
- Consistent button and form element styling
- Responsive breakpoints for mobile-first design
- Smooth transitions and hover effects

#### Project Structure ✓
```
src/
├── pages/
│   ├── Home.jsx (player & match selection)
│   ├── Home.css (two-column layout, checkboxes)
│   ├── DataCollection.jsx (placeholder)
│   ├── DataCollection.css
│   ├── AnalyzeData.jsx (placeholder)
│   └── AnalyzeData.css
├── data/
│   ├── matches.js (24 matches for 2025-2026 season)
│   ├── players.js (25 KC Comets players)
│   └── signals.js (selectedMatch, selectedPlayers)
├── App.jsx (routing configuration)
├── App.css
├── main.jsx
└── index.css (global styles with Comets colors)
```

### Development Server
**Running at**: http://localhost:5175/
**Status**: Active

### Technical Configuration
- **Vite Config**: Configured with `@preact/signals-react-transform` Babel plugin
- **Signal Reactivity**: Auto-tracking enabled for React re-renders
- **Dependencies**:
  - `@preact/signals-react` - State management
  - `@preact/signals-react-transform` - Babel transform for reactivity
  - `react-router-dom` - Navigation

---

---

## Troubleshooting & Solutions

### Preact Signals Reactivity Issue (RESOLVED)
**Problem**: Signals were updating but React components weren't re-rendering
**Solution**:
1. Installed `@preact/signals-react-transform` package
2. Configured Vite with Babel transform plugin in `vite.config.js`:
```js
react({
  babel: {
    plugins: [['module:@preact/signals-react-transform']],
  },
})
```
3. Restarted dev server for changes to take effect

**How it works**: The transform plugin automatically wraps React components to track signal access and trigger re-renders when signals change.

---

**Last Updated**: 2025-11-16
**Current Phase**: Home Page Complete - Ready for Data Collection Screen Development
