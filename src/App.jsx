import { useReducer, useEffect } from 'react';
import { appReducer, initialState, ACTION } from './store/appStore.js';
import { loadFromStorage, saveToStorage, importFromJSON, serializeData } from './utils/storage.js';
import { C, T } from './styles/theme.js';
import SetupWizard from './components/SetupWizard.jsx';
import TrackerScreen from './components/TrackerScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';

/**
 * App — root component that owns global state and screen routing.
 *
 * Uses a single useReducer for all app state so every transition is
 * explicit and traceable. Persistence is handled here via two effects:
 * one that loads from localStorage on mount, and one that saves
 * whenever goals or history change.
 *
 * Screen routing is driven by state.screen ('setup' | 'tracker' | 'settings').
 * Navigation dispatches ACTION.NAVIGATE rather than maintaining a separate
 * router, keeping the dependency footprint minimal for a local HTML app.
 */
export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on first mount
  useEffect(() => {
    const { goals, history } = loadFromStorage();
    dispatch({ type: ACTION.LOAD_DATA, payload: { goals, history } });
  }, []);

  // Persist whenever goals or history change
  useEffect(() => {
    if (state.goals.length > 0 || Object.keys(state.history).length > 0) {
      saveToStorage(state.goals, state.history);
    }
  }, [state.goals, state.history]);

  /**
   * Triggers a JSON file download containing all goals and history.
   * Creates a temporary anchor element, clicks it, then revokes the
   * object URL to avoid memory leaks.
   */
  function handleExport() {
    const json = serializeData(state.goals, state.history);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `habit-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Reads a user-selected JSON file and imports it as the app's data.
   * Validates the file via importFromJSON before dispatching, so a
   * corrupt or wrong file shows an alert rather than crashing the app.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const { goals, history } = importFromJSON(ev.target.result);
        dispatch({ type: ACTION.IMPORT_DATA, payload: { goals, history } });
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported if needed
    e.target.value = '';
  }

  // Render the active screen
  const { screen, goals, history } = state;

  if (screen === 'setup') {
    return (
      <SetupWizard
        onComplete={(goal) => dispatch({ type: ACTION.ADD_GOAL, payload: goal })}
        existingGoals={goals}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsScreen
        goals={goals}
        dispatch={dispatch}
        onBack={() => dispatch({ type: ACTION.NAVIGATE, payload: 'tracker' })}
      />
    );
  }

  return (
    <TrackerScreen
      goals={goals}
      history={history}
      dispatch={dispatch}
      onSettings={() => dispatch({ type: ACTION.NAVIGATE, payload: 'settings' })}
      onExport={handleExport}
      onImport={handleImport}
    />
  );
}
