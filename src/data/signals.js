import { signal } from '@preact/signals-react';

// Signals for Home screen
export const selectedMatch = signal('');
export const selectedPlayers = signal([]);

// Signals for Data Collection screen
export const currentPlayer = signal('');
export const currentActionType = signal('');
export const isSuccessful = signal(false);

// Signals for tracking previous actions
export const previousActionType = signal('');
export const previousActionSuccess = signal(false);
export const previousActionPlayer = signal('');

// String tracking (background system for consecutive successful actions)
export const currentString = signal([]);

// Zone tracking (auto-select previous successful zone)
export const lastSuccessfulZoneEnded = signal(null);

// Field orientation tracking (Comets defending left or right)
export const cometsSide = signal('left');

// Helper function to submit a string to backend
export const submitString = async (matchName, lastAction = "Play Ended") => {
  if (currentString.value.length === 0) {
    console.log('No string to submit (empty)');
    return;
  }

  const stringData = {
    "Match": matchName,
    "String": currentString.value,
    "Action Count": currentString.value.length,
    "Pass Count": currentString.value.filter(action => action === "Pass").length,
    "Last Action": lastAction
  };

  console.log('Submitting String:', stringData);

  try {
    const response = await fetch('http://localhost:3001/api/strings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stringData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ String saved to MongoDB:', result.insertedId);
      // Reset string after successful submission
      currentString.value = [];
    } else {
      console.error('❌ Error saving string:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error submitting string:', error);
  }
};
