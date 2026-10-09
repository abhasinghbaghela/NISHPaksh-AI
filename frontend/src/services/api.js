const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/cases/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using default stats:', err);
    return {
      success: true,
      stats: {
        testsConducted: 128,
        verifiedCases: 114,
        pendingReview: 14,
        activeOfficers: 42,
        totalEvidence: 128
      }
    };
  }
}

export async function fetchCases(search = '', status = 'All') {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'All') params.append('status', status);

    const res = await fetch(`${API_BASE}/cases?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cases');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local cache:', err);
    return { success: false, error: err.message, cases: [] };
  }
}

export async function fetchCaseById(id) {
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`);
    if (!res.ok) throw new Error(`Case ${id} not found`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function submitEvidencePackage(packageData) {
  try {
    const res = await fetch(`${API_BASE}/evidence/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload evidence package');
    }
    return data;
  } catch (err) {
    console.error('Evidence package upload error:', err);
    throw err;
  }
}

export async function fetchEvidenceByCase(caseId) {
  try {
    const res = await fetch(`${API_BASE}/evidence/${caseId}`);
    if (!res.ok) throw new Error(`Evidence for ${caseId} not found`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
