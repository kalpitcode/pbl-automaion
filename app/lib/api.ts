const API_BASE_URL = 'http://localhost:5000/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }

  return response.json();
}

export async function loginAPI(data: Record<string, unknown>) {
  return fetchWithAuth(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function studentSignupAPI(data: Record<string, unknown>) {
  return fetchWithAuth(`${API_BASE_URL}/auth/signup/student`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function teacherSignupAPI(data: Record<string, unknown>) {
  return fetchWithAuth(`${API_BASE_URL}/auth/signup/teacher`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeAPI() {
  return fetchWithAuth(`${API_BASE_URL}/auth/me`, { method: 'GET' });
}

// --- Group & Week APIs (Student) ---
export async function getMyGroupAPI() {
  return fetchWithAuth(`${API_BASE_URL}/groups/me`, { method: 'GET' });
}

export async function createGroupAPI(name: string) {
  return fetchWithAuth(`${API_BASE_URL}/groups`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function joinGroupAPI(name: string) {
  return fetchWithAuth(`${API_BASE_URL}/groups/join`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getSupervisorsAPI() {
  return fetchWithAuth(`${API_BASE_URL}/groups/supervisors`, { method: 'GET' });
}

export async function requestSupervisorAPI(supervisorId: string) {
  return fetchWithAuth(`${API_BASE_URL}/groups/request-supervisor`, {
    method: 'POST',
    body: JSON.stringify({ supervisorId }),
  });
}

export async function getMyGroupWeeksAPI() {
  return fetchWithAuth(`${API_BASE_URL}/groups/my-group/weeks`, { method: 'GET' });
}

// --- Submission API (Student) ---
export async function submitWeekAPI(weekId: string, data: { comments: string; isDraft: boolean }) {
  return fetchWithAuth(`${API_BASE_URL}/submissions/${weekId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Supervisor APIs ---
export async function getSupervisorGroupsAPI() {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/groups`, { method: 'GET' });
}

export async function getSupervisorGroupDetailAPI(groupId: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/groups/${groupId}`, { method: 'GET' });
}

export async function getSupervisorWeekDetailAPI(groupId: string, weekId: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/groups/${groupId}/weeks/${weekId}`, { method: 'GET' });
}

export async function approveWeekAPI(groupId: string, weekId: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/groups/${groupId}/weeks/${weekId}/approve`, {
    method: 'PUT',
  });
}

export async function rejectWeekAPI(groupId: string, weekId: string, feedback: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/groups/${groupId}/weeks/${weekId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ feedback }),
  });
}

export async function getSupervisorRequestsAPI() {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/requests`, { method: 'GET' });
}

export async function approveSupervisorRequestAPI(requestId: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/requests/${requestId}/approve`, {
    method: 'PUT',
  });
}

export async function rejectSupervisorRequestAPI(requestId: string) {
  return fetchWithAuth(`${API_BASE_URL}/supervisor/requests/${requestId}/reject`, {
    method: 'PUT',
  });
}
