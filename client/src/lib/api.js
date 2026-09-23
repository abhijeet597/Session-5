/**
 * Generic fetch wrapper for the habit tracker API.
 *
 * @param {string} path - The API path (e.g. '/api/habits')
 * @param {object} options - Fetch options plus an optional `token` field
 * @param {string} [options.token] - If provided, adds Authorization: Bearer <token> header
 * @returns {Promise<any>} Parsed JSON response, or undefined for 204 No Content
 */
export async function apiFetch(path, options = {}) {
  const { token, ...fetchOptions } = options;

  const headers = { ...(fetchOptions.headers || {}) };

  // Add Authorization header when a token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for non-GET requests that have a body
  const method = (fetchOptions.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path, {
    ...fetchOptions,
    headers,
  });

  // 204 No Content — nothing to parse
  if (response.status === 204) {
    return undefined;
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body && body.error) {
        errorMessage = body.error;
      }
    } catch {
      // Body was not valid JSON — keep the fallback message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
