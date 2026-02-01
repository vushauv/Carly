// API Configuration - centralized hostname management
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    USERS: '/users',
    CARS: '/cars',
    BOOKINGS: '/bookings',
    REFERENCE: '/reference/data',
    PARKLY: '/parkly/car-bookings',
    FLATLY: '/flatly/bookings',
  }
} as const;


// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, ...paths: (string | number)[]): string => {
  const cleanPaths = paths.filter(p => p !== undefined && p !== null).map(String);
  return `${API_CONFIG.BASE_URL}${endpoint}${cleanPaths.length > 0 ? '/' + cleanPaths.join('/') : ''}`;
};

// Common fetch wrapper with error handling
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  // console.log(`[API] Making request to: ${url}`);
  // console.log(`[API] Request options:`, options);

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // console.log(`[API] Final config:`, config);

  try {
    // console.log(`[API] Calling fetch...`);
    const response = await fetch(url, config);
    // console.log(`[API] Response received:`, response);
    // console.log(`[API] Response status:`, response.status, response.statusText);
    // console.log(`[API] Response headers:`, response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Error response text:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    // console.log(`[API] Content-Type:`, contentType);
    
    if (contentType && contentType.includes('application/json')) {
      // console.log(`[API] Parsing JSON response...`);
      const jsonData = await response.json();
      // console.log(`[API] Parsed JSON data:`, jsonData);
      return jsonData;
    }
    
    // console.log(`[API] No JSON content, returning empty object`);
    return {} as T;
  } catch (error) {
    // console.error(`[API] Request failed for ${url}:`, error);
    throw error;
  }
};