/**
 * Utility functions for persisting design state across OAuth redirects
 * This prevents loss of template design changes when users are redirected for authentication
 */

const DESIGN_STATE_KEY = 'pendingDesignState';
const DESIGN_STATE_TIMESTAMP_KEY = 'pendingDesignStateTimestamp';
const MAX_STATE_AGE_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Save the current design state to localStorage before OAuth redirect
 * @param {Object} designState - The design state to save
 * @param {Object} designState.eventData - Redux event data
 * @param {string} designState.pixieState - Pixie editor state (JSON string)
 * @param {string} designState.templateId - Template ID
 * @param {number} designState.activeStep - Current step in the flow
 * @param {string} designState.thumbnailData - Base64 thumbnail data (optional)
 */
export function saveDesignState(designState) {
  try {
    const stateToSave = {
      ...designState,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(DESIGN_STATE_KEY, JSON.stringify(stateToSave));
    localStorage.setItem(DESIGN_STATE_TIMESTAMP_KEY, Date.now().toString());
    
    
    return true;
  } catch (error) {
    console.error('Failed to save design state:', error);
    return false;
  }
}

/**
 * Restore the design state from localStorage after OAuth redirect
 * @returns {Object|null} The restored design state or null if not found/expired
 */
export function restoreDesignState() {
  try {
    const stateStr = localStorage.getItem(DESIGN_STATE_KEY);
    const timestampStr = localStorage.getItem(DESIGN_STATE_TIMESTAMP_KEY);
    
    if (!stateStr || !timestampStr) {
      return null;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    
    // Check if state is too old (expired)
    if (age > MAX_STATE_AGE_MS) {
      console.log('Design state expired, clearing...');
      clearDesignState();
      return null;
    }
    
    const state = JSON.parse(stateStr);
    
    
    
    return state;
  } catch (error) {
    console.error('Failed to restore design state:', error);
    clearDesignState();
    return null;
  }
}

/**
 * Clear the saved design state from localStorage
 */
export function clearDesignState() {
  try {
    localStorage.removeItem(DESIGN_STATE_KEY);
    localStorage.removeItem(DESIGN_STATE_TIMESTAMP_KEY);
    console.log('Design state cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear design state:', error);
  }
}

/**
 * Check if there is a saved design state
 * @returns {boolean} True if there is a saved state
 */
export function hasDesignState() {
  try {
    const stateStr = localStorage.getItem(DESIGN_STATE_KEY);
    const timestampStr = localStorage.getItem(DESIGN_STATE_TIMESTAMP_KEY);
    
    if (!stateStr || !timestampStr) {
      return false;
    }
    
    const timestamp = parseInt(timestampStr, 10);
    const age = Date.now() - timestamp;
    
    // Check if state is not expired
    return age <= MAX_STATE_AGE_MS;
  } catch {    
    return false;
  }
}

/**
 * Save current Pixie editor state before redirect
 * @param {Object} pixieEditorRef - Ref to Pixie editor
 * @returns {Promise<string|null>} Pixie state as JSON string or null
 */
export async function savePixieEditorState(pixieEditorRef) {
  try {
    if (!pixieEditorRef?.current?.save) {
      console.warn('Pixie editor not ready for saving state');
      return null;
    }
    
    const pixieState = await pixieEditorRef.current.save();
    console.log('Pixie editor state captured');
    return pixieState;
  } catch (error) {
    console.error('Failed to save Pixie editor state:', error.message || error);
    return null;
  }
}

