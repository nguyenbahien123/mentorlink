/**
 * Debug utility to identify where [object Object] is coming from
 * Add this to any component that navigates to mentor detail pages
 */

export const debugNavigate = (path, navigate) => {
    console.log(`[DEBUG] Navigating to: ${path}`);
    if (path.includes('[object')) {
        console.error('[ERROR] Invalid path contains [object]. Path:', path);
        console.trace('Stack trace:');
        return;
    }
    navigate(path);
};

/**
 * Ensure mentor ID is always a primitive (string/number), never an object
 */
export const getMentorId = (mentor) => {
    if (!mentor) return undefined;
    
    // If mentor is already a primitive, return it
    if (typeof mentor === 'string' || typeof mentor === 'number') {
        return mentor;
    }
    
    // If mentor is an object, extract the id property
    if (typeof mentor === 'object') {
        return mentor.id;
    }
    
    console.warn('[WARN] Unexpected mentor type:', typeof mentor, mentor);
    return undefined;
};
