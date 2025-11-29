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
