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
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]          Data Collection                [Field Controls]  │
│                Match: [Selected Match Name]                         │
│  [Comets Defending: ◉ Left ○ Right]  [Foul]  [Play Ended]         │
├───────────────────────┬─────────────────────────────────────────────┤
│  Selected Players     │    Action Buttons                           │
│  (16 from roster)     │                                             │
│                       │  ┌────────────────────────────┐             │
│  ○ Player 1           │  │ [Pass +] [Shot +] [Dribble +]           │
│  ● Player 2 (active)  │  │ [Pass -] [Shot -] [Dribble -]           │
│  ○ Player 3           │  └────────────────────────────┘             │
│  ...                  │                                             │
│                       │  ────────────────────────                   │
│                       │  [Set Piece] (always enabled)               │
└───────────────────────┴─────────────────────────────────────────────┘

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
- `currentPlayer` - currently selected player for action
- `currentActionType` - Pass/Dribble/Shot/SetPiece
- `isSuccessful` - true/false for action outcome
- `lastSuccessfulZoneEnded` - stores Zone Ended from previous successful Pass/Dribble for auto-selection
- `cometsSide` - field orientation ('left' or 'right'), persists during session, defaults to 'left'

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

**JSON Structure**:
```json
{
  "Match": "string",
  "Action Type": "Pass",
  "Successful": "boolean",
  "Player": "string",
  "Previous Action": "string",
  "Zone Started": "number (1-14)",
  "Zone Ended": "number (1-14)",
  "Direction": "string",
  "Accuracy": "string",
  "Result if Bad": "string (optional)"
}
```

**Note**: Pass Type field was removed from the data structure.

**Data Collection Sections**:

1. **Previous Action** (Auto-calculated):
   - If `previousActionType` signal is empty → "Beginning of Play"
   - Else if `previousActionSuccess` is true → value from `previousActionType` signal
   - Else if `previousActionSuccess` is false → "Ball Won"

2. **Zone Selection** (Required - Single Field with Dual Selection):
   - **Single soccer field** with 14 numbered zones (298px × 418px)
   - **Field Orientation**: Controlled by "Comets Defending" toggle on Data Collection page
     - Left (default): Vertical orientation, Zone 1 at bottom
     - Right: Field rotates 90° clockwise
   - **Zone Selection Methods**:
     - **Regular Click**: Selects Zone Started (highlighted in orange)
     - **Shift+Click**: Selects Zone Ended (highlighted in blue)
     - Both zones can be selected simultaneously with different colors
     - If same zone selected for both: Shows diagonal gradient (orange → blue)
   - **Visual Indicators**:
     - Zone labels display: "Zone Started: X | Zone Ended: Y"
     - Color-coded squares next to labels (orange for Started, blue for Ended)
     - Instruction text: "Click to select Zone Started, Shift+Click for Zone Ended"
     - Blue arrow drawn from Zone Started center to Zone Ended center
   - **Auto-Selection**: Zone Started automatically pre-filled with Zone Ended from previous successful Pass/Dribble action
   - **Arrow Visualization**:
     - Only appears when both zones are selected
     - Hides if same zone selected for both
     - Updates in real-time as zones change
     - Rotates with field orientation
   - Values: Zone Started (1-14), Zone Ended (1-14)

3. **Direction** (Required - Single Select):
   - Forward
   - Sideways
   - Backward

4. **Accuracy** (Required - Conditional):
   - **Successful Pass**: Auto-filled as "Complete" (displayed as read-only, no selection needed)
   - **Unsuccessful Pass**: Select from:
     - Incomplete
     - Clearance
     - Out of Bounds

5. **Result if Bad** (Conditional - Single Select):
   - Only shown if Accuracy is "Clearance" or "Out of Bounds"
   - Top of the Box
   - 3 Lines Restart
   - Side Kick In
   - Ball Won
   - Ball Lost

**Page Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Pass Action - Player: [Name] - Successful: [Yes/No]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Previous Action: [Auto-calculated display]             │
│                                                          │
│  Zone Selection                                         │
│  ┌──────────────────────────────────┐                   │
│  │ Zone Started: 7 | Zone Ended: 10 │ (colored labels) │
│  └──────────────────────────────────┘                   │
│  Click to select Zone Started, Shift+Click for Ended   │
│  ┌─────────── Soccer Field ──────────┐                  │
│  │ [14 zones with dual highlighting] │                  │
│  │ [Blue arrow: Started → Ended]     │                  │
│  │ (Rotates based on Comets toggle)  │                  │
│  └───────────────────────────────────┘                  │
│                                                          │
│  Direction:                                             │
│  [Forward] [Sideways] [Backward]                        │
│                                                          │
│  Accuracy:                                              │
│  [Complete] [Incomplete] [Clearance] [Out of Bounds]   │
│                                                          │
│  Result if Bad: (conditional)                           │
│  [Top of the Box] [3 Lines Restart] [Side Kick In]      │
│  [Ball Won] [Ball Lost]                                 │
│                                                          │
│         [Submit Action] [Cancel]                        │
└──────────────────────────────────────────────────────────┘
```

**Submit Behavior**:
- "Submit Action" button enabled when all required fields selected
- On submit:
  - Build complete JSON object
  - POST to MongoDB collection
  - Update previous action signals (type, success, player)
  - Clear current player and action type signals
  - Navigate back to Data Collection screen
  - Match and selected players persist for next action

### 2. Dribble
**Context Available on Detail Page**:
- Match (from Home screen)
- Player (from Data Collection screen)
- Action Type: "Dribble"
- Successful: true/false (from Data Collection screen)

**JSON Structure**:
```json
{
  "Match": "string",
  "Action Type": "Dribble",
  "Successful": "boolean",
  "Player": "string",
  "Previous Action": "string",
  "Zone Started": "number (1-14)",
  "Zone Ended": "number (1-14)",
  "Direction": "string",
  "Beat Player": "string"
}
```

**Data Collection Sections**:

1. **Previous Action** (Auto-calculated):
   - If `previousActionType` signal is empty → "Beginning of Play"
   - Else if `previousActionSuccess` is true → value from `previousActionType` signal
   - Else if `previousActionSuccess` is false → "Ball Won"

2. **Zone Selection** (Required - Single Field with Dual Selection):
   - **Single soccer field** with 14 numbered zones (298px × 418px)
   - **Field Orientation**: Controlled by "Comets Defending" toggle on Data Collection page
     - Left (default): Vertical orientation, Zone 1 at bottom
     - Right: Field rotates 90° clockwise
   - **Zone Selection Methods**:
     - **Regular Click**: Selects Zone Started (highlighted in purple)
     - **Shift+Click**: Selects Zone Ended (highlighted in blue)
     - Both zones can be selected simultaneously with different colors
     - If same zone selected for both: Shows diagonal gradient (purple → blue)
   - **Visual Indicators**:
     - Zone labels display: "Zone Started: X | Zone Ended: Y"
     - Color-coded squares next to labels (purple for Started, blue for Ended)
     - Instruction text: "Click to select Zone Started, Shift+Click for Zone Ended"
     - Blue arrow drawn from Zone Started center to Zone Ended center
   - **Auto-Selection**: Zone Started automatically pre-filled with Zone Ended from previous successful Pass/Dribble action
   - **Arrow Visualization**:
     - Only appears when both zones are selected
     - Hides if same zone selected for both
     - Updates in real-time as zones change
     - Rotates with field orientation
   - Values: Zone Started (1-14), Zone Ended (1-14)

3. **Direction** (Required - Single Select):
   - Forward
   - Sideways
   - Backward

4. **Beat Player** (Required - Single Select):
   - Yes
   - No

**Page Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Dribble Action - Player: [Name] - Successful: [Yes/No] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Previous Action: [Auto-calculated display]             │
│                                                          │
│  Zone Selection                                         │
│  ┌──────────────────────────────────┐                   │
│  │ Zone Started: 7 | Zone Ended: 10 │ (colored labels) │
│  └──────────────────────────────────┘                   │
│  Click to select Zone Started, Shift+Click for Ended   │
│  ┌─────────── Soccer Field ──────────┐                  │
│  │ [14 zones with dual highlighting] │                  │
│  │ [Blue arrow: Started → Ended]     │                  │
│  │ (Rotates based on Comets toggle)  │                  │
│  └───────────────────────────────────┘                  │
│                                                          │
│  Direction:                                             │
│  [Forward] [Sideways] [Backward]                        │
│                                                          │
│  Beat Player:                                           │
│  [Yes] [No]                                             │
│                                                          │
│         [Submit Action] [Cancel]                        │
└──────────────────────────────────────────────────────────┘
```

**Submit Behavior**:
- "Submit Action" button enabled when all required fields selected
- On submit:
  - Build complete JSON object
  - POST to MongoDB collection (endpoint: `/api/dribbles`)
  - Update previous action signals (type, success, player)
  - Clear current player and action type signals
  - Navigate back to Data Collection screen
  - Match and selected players persist for next action

### 3. Shot
**Context Available on Detail Page**:
- Match (from Home screen)
- Player (from Data Collection screen)
- Action Type: "Shot"
- Successful: true/false (from Data Collection screen)

**JSON Structure**:
```json
{
  "Match": "string",
  "Action Type": "Shot",
  "Successful": "boolean",
  "Player": "string",
  "Previous Action": "string",
  "Previous Action Player": "string (optional)",
  "Zone Taken": "number (1-14)",
  "Accuracy": "string",
  "Result": "string"
}
```

**Data Collection Sections**:

1. **Previous Action** (Auto-calculated):
   - If `previousActionType` signal is empty → "Beginning of Play"
   - Else if `previousActionSuccess` is true → value from `previousActionType` signal
   - Else if `previousActionSuccess` is false → "Ball Won"

2. **Previous Action Player** (Auto-displayed - Conditional):
   - Only shown if previous action was successful (not "Ball Won" or "Beginning of Play")
   - Value pulled from `previousActionPlayer` signal
   - Only included in JSON submission if previous action was successful

3. **Zone Taken** (Required - Single Select):
   - 14 buttons arranged in soccer field layout (same as other actions)
   - Buttons numbered 1-14 matching field zones
   - Single selection, stays selected when clicked
   - Value: number (1-14)
   - **Only ONE zone field** (unlike Pass/Dribble which have Zone Started and Zone Ended)

4. **Accuracy** (Required - Single Select):
   - On
   - Off
   - Block

5. **Result** (Required - Single Select):
   - Goal
   - Save
   - Boards Ball Kept
   - Boards Ball Lost
   - Out of Bounds
   - Block Ball Kept
   - Block Ball Lost

**Page Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Shot Action - Player: [Name] - Successful: [Yes/No]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Previous Action: [Auto-calculated display]             │
│  Previous Action Player: [Player name] (conditional)    │
│                                                          │
│  ┌─────────── Zone Taken ──────────┐                    │
│  │ [Soccer field with 14 zone      │                    │
│  │  buttons - 298px × 418px]       │                    │
│  └─────────────────────────────────┘                     │
│                                                          │
│  Accuracy:                                              │
│  [On] [Off] [Block]                                     │
│                                                          │
│  Result:                                                │
│  [Goal] [Save]                                          │
│  [Boards Ball Kept] [Boards Ball Lost]                  │
│  [Out of Bounds]                                        │
│  [Block Ball Kept] [Block Ball Lost]                    │
│                                                          │
│         [Submit Action] [Cancel]                        │
└──────────────────────────────────────────────────────────┘
```

**Submit Behavior**:
- "Submit Action" button enabled when all required fields selected
- On submit:
  - Build complete JSON object
  - Conditionally add "Previous Action Player" only if previous action was successful
  - POST to MongoDB collection (endpoint: `/api/shots`)
  - Update previous action signals (type='Shot', success, player)
  - Clear current player and action type signals
  - Navigate back to Data Collection screen
  - Match and selected players persist for next action

### 4. String
**Background Tracking System**:
- Automatically tracks consecutive successful Pass/Dribble actions and ALL Shot actions
- Does NOT include Set Piece actions
- Submits to backend when:
  1. An unsuccessful Pass or Dribble action occurs
  2. ANY Shot action occurs (successful or unsuccessful - all shots end the string)
  3. User clicks "Play Ended" button on Data Collection page
- Resets after each submission
- No user-facing action page (background process only)

**JSON Structure**:
```json
{
  "Match": "string",
  "String": ["Pass", "Dribble", "Shot", "Pass"],  // Array of action types
  "Action Count": 4,      // Total actions in string
  "Pass Count": 2,        // Count of Pass actions only
  "Last Action": "Shot"   // Action that ended the string (Pass/Dribble/Shot/Play Ended)
}
```

**Last Action Values**:
- "Pass" - Unsuccessful Pass that ended the string
- "Dribble" - Unsuccessful Dribble that ended the string
- "Shot" - Shot with any result other than Goal or Save
- "Goal" - Shot that resulted in a goal
- "Shot Saved" - Shot that resulted in a save
- "Foul" - String manually submitted via "Foul" button
- "Play Ended" - String manually submitted via "Play Ended" button

**Implementation**:
- `currentString` signal in [signals.js](src/data/signals.js) stores array of action types
- `submitString` helper function handles POST to backend
- [PassAction.jsx](src/pages/actions/PassAction.jsx) and [DribbleAction.jsx](src/pages/actions/DribbleAction.jsx) add to string on successful submission
- Pass/Dribble actions submit and reset string on unsuccessful submission
- [ShotAction.jsx](src/pages/actions/ShotAction.jsx) ALWAYS adds Shot to string and submits immediately with appropriate Last Action based on result
- "Foul" button in [DataCollection.jsx](src/pages/DataCollection.jsx) submits string with "Foul" as Last Action
- "Play Ended" button in [DataCollection.jsx](src/pages/DataCollection.jsx) submits string with "Play Ended" as Last Action

**State Management**:
- `currentString` signal (array) - tracks current string of actions
- Signal persists during session but is reset after submission
- No persistence on app close (partial strings are discarded)

**Backend Endpoint**:
- POST to `/api/strings` collection in MongoDB

### 5. Set Piece
**Context Available on Detail Page**:
- Match (from Home screen)
- Action Type: "Set Piece"
- **Successful: Calculated automatically** (Shot Taken = "Yes" AND Accuracy = "On" → true, otherwise false)
- **Players selected within Set Piece flow** (not pre-selected from Data Collection)

**JSON Structure**:
```json
{
  "Match": "string",
  "Action Type": "Set Piece",
  "Successful": "boolean",
  "Set Piece Type": "string",
  "Player on Ball": "string",
  "Other Players": "array of strings (3-5 players)",
  "Shot Taken": "string (Yes/No)",
  "Zone Taken": "number (1-14) - optional",
  "Accuracy": "string - optional",
  "Result": "string - optional",
  "Passes to Result": "number (0-6)"
}
```

**Data Collection Sections**:

1. **Set Piece Type** (Required - Single Select):
   - TOTB (Top of the Box)
   - 3 Lines Restart
   - Corner Right
   - Corner Left
   - Shootout
   - Penalty

2. **Player on Ball** (Required - Single Select):
   - Dropdown selector
   - Select 1 from all 16 selected players
   - Not pre-selected from Data Collection screen

3. **Other Players** (Required - Multi-Select):
   - Checkbox grid interface
   - Select 3-5 players from remaining 15 players (excluding Player on Ball)
   - Shows count: "Selected: X/5 (minimum 3)"
   - Checkboxes disable when 5 players selected
   - Visual indication for selected/disabled state

4. **Shot Taken** (Required - Single Select):
   - Yes
   - No
   - Determines if Zone Taken, Accuracy, Result fields appear

5. **Zone Taken** (Conditional - Single Select):
   - Only visible if Shot Taken = "Yes"
   - 14 buttons arranged in soccer field layout (same as Shot action)
   - Value: number (1-14)

6. **Accuracy** (Conditional - Single Select):
   - Only visible if Shot Taken = "Yes"
   - On
   - Off
   - Block

7. **Result** (Conditional - Single Select):
   - Only visible if Shot Taken = "Yes"
   - Goal
   - Save
   - Boards Ball Kept
   - Boards Ball Lost
   - Out of Bounds
   - Block Ball Kept
   - Block Ball Lost

8. **Passes to Result** (Required - Single Select):
   - 0, 1, 2, 3, 4, 5, 6
   - Number of passes leading to the result

**Page Layout**:
```
┌──────────────────────────────────────────────────────────┐
│  Set Piece Action - Successful: [Yes/No]                │
├──────────────────────────────────────────────────────────┤
│ ╔════════════════════════════════════════════════════╗  │
│ ║ [Scrollable Content Area]                          ║  │
│ ║                                                    ║  │
│ ║ Set Piece Type:                                   ║  │
│ ║ [TOTB] [3 Lines Restart] [Corner Right]           ║  │
│ ║ [Corner Left] [Shootout] [Penalty]                ║  │
│ ║                                                    ║  │
│ ║ Player on Ball:                                   ║  │
│ ║ [Dropdown: Select player...]                      ║  │
│ ║                                                    ║  │
│ ║ Other Players (Select 3-5): [X/5 selected]       ║  │
│ ║ ☐ Player 1  ☐ Player 2  ☐ Player 3  ☐ Player 4   ║  │
│ ║ ☐ Player 5  ☐ Player 6  ... (grid of 16)         ║  │
│ ║                                                    ║  │
│ ║ Shot Taken:                                       ║  │
│ ║ [Yes] [No]                                        ║  │
│ ║                                                    ║  │
│ ║ --- IF Shot Taken = Yes ---                      ║  │
│ ║ Zone Taken: [Soccer field 14 zones]              ║  │
│ ║ Accuracy: [On] [Off] [Block]                      ║  │
│ ║ Result: [Goal] [Save] [Boards...] ...            ║  │
│ ║ --- END IF ---                                    ║  │
│ ║                                                    ║  │
│ ║ Passes to Result:                                 ║  │
│ ║ [0] [1] [2] [3] [4] [5] [6]                       ║  │
│ ╚════════════════════════════════════════════════════╝  │
│                                                          │
│         [Submit Action] [Cancel]                        │
└──────────────────────────────────────────────────────────┘
```

**Submit Behavior**:
- "Submit Action" button enabled when all required fields selected
- Validates:
  - Set Piece Type selected
  - Player on Ball selected
  - Other Players: 3-5 selected (not Player on Ball)
  - Shot Taken selected
  - If Shot Taken = "Yes": Zone Taken, Accuracy, Result all selected
  - Passes to Result selected
- On submit:
  - **Calculate "Successful" field**: Shot Taken = "Yes" AND Accuracy = "On" → true, otherwise false
  - Build complete JSON object
  - "Other Players" sent as array
  - "Passes to Result" converted to number
  - Conditionally add Zone Taken, Accuracy, Result only if Shot Taken = "Yes"
  - POST to MongoDB collection (endpoint: `/api/setpieces`)
  - Clear current action signals (NO previous action tracking for Set Pieces)
  - Navigate back to Data Collection screen
  - Match and selected players persist for next action

**Success Calculation Logic**:
- **Successful = true**: Shot Taken = "Yes" AND Accuracy = "On"
- **Successful = false**: All other cases (Shot Taken = "No", OR Shot Taken = "Yes" with Accuracy = "Off" or "Block")
- Success badge updates dynamically as user selects Shot Taken and Accuracy

**Key Differences from Other Actions**:
- **No currentPlayer signal usage** - Players selected within Set Piece flow
- **Auto-calculated success** - Based on Shot Taken and Accuracy, not pre-selected
- **Multi-player selection** - 1 player on ball + 3-5 other players
- **Conditional fields** - Zone Taken, Accuracy, Result only if Shot Taken = "Yes"
- **No Previous Action tracking** - Set Pieces are standalone events
- **Scrollable layout** - More fields than other actions, uses vertical scrolling
- **Red color scheme** - Matches Comets branding for special plays
- **Array field** - "Other Players" is an array in JSON
- **Numeric field** - "Passes to Result" is a number (0-6)

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

**Signals for Tracking Previous Actions**:
- `previousActionType` (string) - Type of last submitted action
- `previousActionSuccess` (boolean) - Success status of last action
- `previousActionPlayer` (string) - Player who performed last action

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

## Design Principles

### Universal Layout Philosophy
**CRITICAL: NO SCROLLING - All Pages Must Fit on One Screen**

This principle applies to **ALL pages** in the application (Home, Data Collection, Pass Action, and all future action pages). The goal is to enable the fastest possible data entry and navigation during live match play.

### Core Design Requirements:
- **95vh Container Height**: Every page uses `height: 95vh` with `overflow: hidden`
- **No Scrollbars**: All content must be visible without scrolling
- **Horizontal Layout Preferred**: Use left-to-right flow instead of vertical stacking when possible
- **Multi-Column Grids**: Use CSS Grid to display lists in multiple columns instead of scrolling lists
- **Optimal Screen Usage**: Content should take up significant screen space while keeping all options visible
- **Click-Only Interaction**: Users should complete all tasks using only mouse clicks, no scrolling
- **Compact Sizing**: Reduce font sizes, padding, and margins as needed to fit content
- **Text Truncation**: Use `white-space: nowrap` and `text-overflow: ellipsis` to prevent text wrapping

### Page-Specific Implementations:

#### Home Page (APPROVED DESIGN):
- **Container**: 95vh height, max-width 1400px, no scrolling
- **Header**: Title (2.5em), Subtitle (1.1em), minimal margins
- **Two-Column Layout**: 1.4fr (Players) / 0.6fr (Match Selection)
- **Player Selection**:
  - 4-column grid for 25 players (no scrolling)
  - Compact checkboxes (14px), small font (0.75em)
  - Text truncation with ellipsis for long names
  - Reduced padding (0.4rem vertical, 0.5rem horizontal)
- **Match Selection**: Compact dropdown and buttons

#### Data Collection Page (APPROVED DESIGN):
- **Container**: 95vh height, max-width 1400px, no scrolling
- **Header**: Back button (top-left), centered title and match info
- **Two-Column Layout**: 1fr / 1fr (Players left, Actions right)
- **Player List**: 2-column grid for 16 players (no scrolling)
- **Action Buttons**: 2×3 grid (Pass/Shot/Dribble ±) + Set Piece button
- All buttons sized to fit without scrolling

#### Pass Action Page (APPROVED DESIGN):
- **Container**: 95vh height, max-width 1600px, no scrolling
- **Header Section**:
  - Title (1.5em)
  - Player name and success badge (centered, horizontal layout)
  - Previous action display (horizontal row with label and value)
- **Two-Column Main Layout**:
  - **Left Column**: Two soccer fields side-by-side (Zone Started, Zone Ended)
    - Field dimensions: 298px × 418px each
    - 3×6 grid with 14 numbered zones
    - Side-by-side using flexbox (gap: 0.75rem)
  - **Right Column**: Options in 2-column grid
    - Grid layout: 2 columns, 0.75rem gap
    - Sections: Direction, Accuracy, Result if Bad (conditional)
    - Button sizing: 0.85em font, 0.5rem padding, flexible width
- **Submit/Cancel Buttons**: Bottom center, horizontal layout

### Implementation Checklist for Future Pages:
- [ ] Set container to `height: 95vh` with `overflow: hidden`
- [ ] Use CSS Grid for multi-column layouts instead of single-column scrolling lists
- [ ] Reduce font sizes, padding, and margins to fit all content
- [ ] Test that all interactive elements are visible and clickable without scrolling
- [ ] Use `white-space: nowrap` and `text-overflow: ellipsis` for long text
- [ ] Prioritize horizontal space usage over vertical when possible
- [ ] Ensure primary interactive elements are as large as possible while maintaining no-scroll requirement

This design philosophy enables rapid-fire data collection where users can complete multiple actions per minute during live match tracking without ever needing to scroll.

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

#### Zone Selection Enhancements ✓
**Advanced zone selection system for Pass and Dribble actions**

**Features Implemented**:
1. **Auto-Select Previous Zone**:
   - Zone Ended from previous successful action auto-fills Zone Started in next action
   - Uses `lastSuccessfulZoneEnded` signal for persistence
   - Cleared on unsuccessful actions
   - Works across Pass and Dribble actions

2. **Single Field with Dual Selection**:
   - Merged two separate zone fields into one
   - Regular click selects Zone Started (action color: orange/purple)
   - Shift+Click selects Zone Ended (blue)
   - Dual highlighting with different colors
   - Visual labels show both selections simultaneously
   - Diagonal gradient when same zone selected for both

3. **Field Orientation Toggle**:
   - "Comets Defending: Left | Right" toggle on Data Collection page
   - Controlled by `cometsSide` signal (defaults to 'left')
   - Field rotates 90° clockwise when set to 'Right'
   - CSS transform animation for smooth rotation
   - Persists during session, resets on page refresh

4. **Visual Arrow Between Zones**:
   - SVG arrow drawn from Zone Started center to Zone Ended center
   - Only appears when both zones selected
   - Hides if same zone selected for both
   - Updates in real-time as zones change
   - Blue color (var(--comets-blue-light))
   - Rotates with field orientation
   - Arrowhead marker for direction indication

**Implementation Details**:
- Zone center positions calculated using grid-based algorithm
- Separate marker IDs for Pass and Dribble arrows to avoid conflicts
- CSS classes: `.zone-started`, `.zone-ended`, `.zone-both`
- Shift-key detection in onClick handlers
- Applied to both PassAction and DribbleAction components

#### Project Structure ✓
```
src/
├── pages/
│   ├── Home.jsx (player & match selection)
│   ├── Home.css (two-column layout, checkboxes)
│   ├── DataCollection.jsx (main data collection screen)
│   ├── DataCollection.css
│   ├── AnalyzeData.jsx (placeholder)
│   ├── AnalyzeData.css
│   └── actions/
│       ├── PassAction.jsx (Pass action detail page)
│       ├── PassAction.css
│       ├── DribbleAction.jsx (Dribble action detail page)
│       ├── DribbleAction.css
│       ├── ShotAction.jsx (Shot action detail page)
│       ├── ShotAction.css
│       ├── SetPieceAction.jsx (Set Piece action detail page)
│       └── SetPieceAction.css
├── data/
│   ├── matches.js (24 matches for 2025-2026 season)
│   ├── players.js (25 KC Comets players)
│   └── signals.js (state management signals)
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

**Last Updated**: 2025-12-02
**Current Phase**: Zone Selection Enhancements Complete - Advanced dual-selection system with auto-fill, field rotation, and arrow visualization
