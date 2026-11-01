import axios from 'axios';

// Primary and fallback URLs
const DIRECT_BACKEND_URL = 'http://127.0.0.1:8000';

async function sendRequest(method, endpoint, data = null, params = {}) {
  const config = {
    method,
    url: endpoint,
    params,
    data,
    timeout: 4000,
    headers: { 'Content-Type': 'application/json' },
  };

  try {
    const res = await axios(config);
    return res.data;
  } catch (proxyError) {
    try {
      config.url = `${DIRECT_BACKEND_URL}${endpoint}`;
      const res = await axios(config);
      return res.data;
    } catch (directError) {
      console.warn(`API ${method} to ${endpoint} failed:`, directError?.response?.data || directError.message);
      throw directError;
    }
  }
}

async function requestWithFallback(endpoint, params = {}) {
  return sendRequest('GET', endpoint, null, params);
}

export const api = {
  // Check backend server and DB health
  async checkHealth() {
    try {
      const data = await requestWithFallback('/api/health');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get list of all philosophers with world coordinates and metadata
  async getPhilosophers() {
    return requestWithFallback('/api/philosophers');
  },

  // Get philosopher details by ID
  async getPhilosopher(id) {
    return requestWithFallback(`/api/philosophers/${id}`);
  },

  // Get random wisdom from SQLite database for philosopher
  async getRandomWisdom(philosopherId, excludeId = null) {
    const params = {};
    if (excludeId !== null && excludeId !== undefined) {
      params.exclude_id = excludeId;
    }
    return requestWithFallback(`/api/philosophers/${philosopherId}/wisdom`, params);
  },

  // Get all wisdom entries for philosopher
  async getAllWisdomForPhilosopher(philosopherId) {
    return requestWithFallback(`/api/philosophers/${philosopherId}/wisdom/all`);
  },

  // Get all wisdom across all philosophers
  async getAllWisdom() {
    return requestWithFallback('/api/wisdom/all');
  },

  // --- Admin Portal API Methods ---
  async adminLogin(email, password) {
    return sendRequest('POST', '/api/admin/login', { email, password });
  },

  async createPhilosopher(data) {
    return sendRequest('POST', '/api/admin/philosophers', data);
  },

  async updatePhilosopher(id, data) {
    return sendRequest('PUT', `/api/admin/philosophers/${id}`, data);
  },

  async deletePhilosopher(id) {
    return sendRequest('DELETE', `/api/admin/philosophers/${id}`);
  },

  async addWisdom(philosopherId, data) {
    return sendRequest('POST', `/api/admin/philosophers/${philosopherId}/wisdom`, data);
  },

  async updateWisdom(id, data) {
    return sendRequest('PUT', `/api/admin/wisdom/${id}`, data);
  },

  async deleteWisdom(id) {
    return sendRequest('DELETE', `/api/admin/wisdom/${id}`);
  },

  async uploadPhilosopherFace(philosopherId, imageData) {
    return sendRequest('POST', `/api/admin/philosophers/${philosopherId}/face`, { image_data: imageData });
  },

  async resetPhilosopherFace(philosopherId) {
    return sendRequest('DELETE', `/api/admin/philosophers/${philosopherId}/face`);
  },
};

export default api;
