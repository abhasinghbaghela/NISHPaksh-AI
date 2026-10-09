import { getAllCases, getCaseById, addCase, updateCase } from '../data/casesStore.js';

export function getCases(req, res) {
  try {
    const { status, search } = req.query;
    let list = getAllCases();

    if (status && status !== 'All' && status !== 'All Status') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.evidenceId.toLowerCase().includes(q) ||
        (c.substance && c.substance.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.officer && c.officer.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: list.length,
      cases: list
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function getCase(req, res) {
  try {
    const { id } = req.params;
    const found = getCaseById(id);
    if (!found) {
      return res.status(404).json({ success: false, error: `Case '${id}' not found` });
    }
    return res.json({ success: true, case: found });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function createCase(req, res) {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `NDPS-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    }
    if (!data.evidenceId) {
      data.evidenceId = `EVD-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
    }
    const created = addCase(data);
    return res.status(201).json({ success: true, case: created });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function updateCaseStatus(req, res) {
  try {
    const { id } = req.params;
    const updated = updateCase(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Case '${id}' not found` });
    }
    return res.json({ success: true, case: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export function getDashboardStats(req, res) {
  try {
    const all = getAllCases();
    const verified = all.filter(c => c.status === 'Verified').length;
    const pendingFsl = all.filter(c => c.status === 'Pending FSL' || c.status === 'Under Review').length;
    const totalEvidence = all.reduce((acc, c) => acc + (c.sampleImages ? c.sampleImages.length : 0), 128);

    return res.json({
      success: true,
      stats: {
        testsConducted: all.length + 125,
        verifiedCases: verified + 110,
        pendingReview: pendingFsl + 8,
        activeOfficers: 42,
        totalEvidence
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
