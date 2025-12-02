const API_BASE_URL = 'https://tankas-app-api.onrender.com';

export function showToast(message, type = 'success') {
  // This will be replaced with a proper toast component
  alert(`${type.toUpperCase()}: ${message}`);
}

export function getToken() {
  return localStorage.getItem('tankas_token');
}

export function setToken(token) {
  localStorage.setItem('tankas_token', token);
}

export function removeToken() {
  localStorage.removeItem('tankas_token');
}

export async function fetchAPI(endpoint, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const detailMessage =
        typeof data?.detail === 'string'
          ? data.detail
          : data?.detail
          ? JSON.stringify(data.detail)
          : `Something went wrong (${response.status} ${response.statusText})`;
      throw new Error(detailMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function signup(username, email, password, displayName) {
  return fetchAPI('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, display_name: displayName }),
    skipAuth: true,
  });
}

export async function login(username, password) {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
}

export async function loadRecentIssues(limit = 3) {
  return fetchAPI(`/api/events?limit=${limit}&status=open,in_progress&sort_by=points_assigned`, { skipAuth: true });
}

export async function loadAllIssues() {
  return fetchAPI('/api/events', { skipAuth: true });
}