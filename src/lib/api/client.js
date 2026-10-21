const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Extract CSRF token from browser cookies if available
 */
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export class ApiError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

let inMemoryToken = null;

export function setClientToken(token) {
  inMemoryToken = token;
}

export function getClientToken() {
  return inMemoryToken;
}

/**
 * Centralized fetch client for all API interactions
 */
export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (inMemoryToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  // Attach CSRF token on mutating requests if present in cookies
  const csrfToken = getCookie('csrf_token');
  if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method?.toUpperCase())) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Transmit HttpOnly authentication and CSRF cookies
  };

  try {
    const response = await fetch(url, config);

    // If downloading binary PDF stream, return raw response or blob
    if (options.responseType === 'blob') {
      if (!response.ok) {
        throw new ApiError('Failed to download file', response.status, 'DOWNLOAD_FAILED');
      }
      return response.blob();
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        json.message || `Request failed with status ${response.status}`,
        response.status,
        json.errorCode || 'UNKNOWN_ERROR',
        json.details || null
      );
    }

    return json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network connection failed', 500, 'NETWORK_ERROR');
  }
}
