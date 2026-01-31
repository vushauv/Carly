// API Configuration - centralized hostname management
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    USERS: '/users',
    CARS: '/cars', 
    BOOKINGS: '/bookings'
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
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};