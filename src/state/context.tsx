/**
 * State Context and Provider
 *
 * Provides global state management using React Context and useReducer.
 * Exposes state and dispatch function to all child components.
 * Implements action queuing to prevent race conditions.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { AppState, Action } from '../types/State';
import { appReducer } from './reducer';
import { defaultTheme } from '../theme/themes';

/**
 * Initial application state
 */
const initialState: AppState = {
  tasks: [],
  ui: {
    selectedView: 'all',
    multiSelectMode: false,
    selectedTaskIds: new Set(),
    reorderMode: false,
    editingTaskId: null,
    selectedTag: null,
  },
  theme: defaultTheme,
};

/**
 * State context type definition
 */
interface StateContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

/**
 * State context
 */
const StateContext = createContext<StateContextType | undefined>(undefined);

/**
 * StateProvider props
 */
interface StateProviderProps {
  children: ReactNode;
  initialStateOverride?: Partial<AppState>;
}

/**
 * StateProvider component
 * Wraps the application and provides state management with race condition prevention
 */
export const StateProvider: React.FC<StateProviderProps> = ({ children, initialStateOverride }) => {
  const [state, baseDispatch] = useReducer(
    appReducer,
    initialStateOverride ? { ...initialState, ...initialStateOverride } : initialState
  );

  // Action queue for preventing race conditions
  const actionQueueRef = useRef<Action[]>([]);
  const isProcessingRef = useRef(false);

  /**
   * Process queued actions sequentially
   */
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || actionQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    // In test environment, process synchronously
    // In production, use requestAnimationFrame for better performance
    const processBatch = () => {
      const batchSize = 5; // Process up to 5 actions per frame
      let processed = 0;

      while (actionQueueRef.current.length > 0 && processed < batchSize) {
        const action = actionQueueRef.current.shift();
        if (action) {
          baseDispatch(action);
          processed++;
        }
      }

      if (actionQueueRef.current.length > 0) {
        // More actions to process
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(processBatch);
        } else {
          // Fallback for test environment
          setTimeout(processBatch, 0);
        }
      } else {
        // Queue is empty
        isProcessingRef.current = false;
      }
    };

    // Start processing
    if (typeof requestAnimationFrame !== 'undefined' && !__DEV__) {
      requestAnimationFrame(processBatch);
    } else {
      // In development or test, process synchronously
      while (actionQueueRef.current.length > 0) {
        const action = actionQueueRef.current.shift();
        if (action) {
          baseDispatch(action);
        }
      }
      isProcessingRef.current = false;
    }
  }, [baseDispatch]);

  /**
   * Safe dispatch wrapper that queues actions to prevent race conditions
   */
  const dispatch = useCallback(
    (action: Action) => {
      // Add action to queue
      actionQueueRef.current.push(action);

      // Start processing if not already processing
      processQueue();
    },
    [processQueue]
  );

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};

/**
 * Custom hook to access state and dispatch
 * Throws error if used outside StateProvider
 */
export const useAppState = (): StateContextType => {
  const context = useContext(StateContext);

  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }

  return context;
};

/**
 * Custom hook to access only state (for read-only components)
 */
export const useAppStateValue = (): AppState => {
  const { state } = useAppState();
  return state;
};

/**
 * Custom hook to access only dispatch (for action-only components)
 */
export const useAppDispatch = (): React.Dispatch<Action> => {
  const { dispatch } = useAppState();
  return dispatch;
};
