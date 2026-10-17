export const CONFIG = {
    api: import.meta.env.VITE_API_BASE_URL || '',
    baseUrl: import.meta.env.VITE_BASE_URL || '/',
    AUTO_ADVANCE_MS: import.meta.env.VITE_AUTO_ADVANCE_MS || 3500, // Auto-advance to next question after this many ms
    WINDOW: import.meta.env.VITE_WINDOW || 8,                  // Rolling window: analyze last 8 answers for each table
    FAST_THRESH: import.meta.env.VITE_FAST_THRESH || 3000,           // "Fast" speed threshold for mastery (ms)
    MEDIUM_THRESH: import.meta.env.VITE_MEDIUM_THRESH || 6000,         // "Comfortable" speed threshold (ms)
    ADVANCE_COUNT: import.meta.env.VITE_ADVANCE_COUNT || 5

}