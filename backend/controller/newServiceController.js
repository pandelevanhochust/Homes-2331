import { Audit, Service, getISOWeekStart } from '../models/Service.js';
import { Staff } from './../models/Staff.js';
import { getCurrentWeekTimeframe } from '../db/dateConfig.js';

// Create a service for a user
// POST /api/services
export const createService = async (req, res, next) => {
  try {
    const { userId, serviceId, name, username, password } = req.body;

    if (!userId || !serviceId || !name || !username || !password) {
      return res.status(400).json({ message: 'userId, serviceId, name, username, password are required' });
    }

    // Optional: ensure user exists
    const exists = await Staff.exists({ _id: userId });
    if (!exists) return res.status(404).json({ message: 'Staff not found' });

    const svc = await Service.create({
      userId, serviceId, name, username, password
    });

    // Do not return password even if select:false — just in case
    const obj = svc.toObject();
    delete obj.password;

    res.status(201).json(obj);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'Service already exists for this user (userId + serviceId must be unique)' });
    }
    next(err);
  }
};

// List services (optionally by user)
// GET /api/services?userId=...&q=...&limit=20&page=1
export const listServices = async (req, res, next) => {
  try {
    const { userId, q, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ name: rx }, { serviceId: rx }, { username: rx }];
    }

    const lim = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * lim;

    // Always exclude password by projection
    const [items, total] = await Promise.all([
      Service.find(filter, { password: 0 }).sort({ createdAt: -1 }).skip(skip).limit(lim),
      Service.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page) || 1, limit: lim, pages: Math.ceil(total / lim) });
  } catch (err) {
    next(err);
  }
};
7
// Get single service
// GET /api/services/:id
export const getService = async (req, res, next) => {
  try {
    const svc = await Service.findById(req.params.id, { password: 0 });
    if (!svc) return res.status(404).json({ message: 'Not found' });
    res.json(svc);
  } catch (err) {
    next(err);
  }
};

// Update service credentials / name
// PUT /api/services/:id
export const updateService = async (req, res, next) => {
  try {
    const allowed = ['name', 'username', 'password'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    const svc = await Service.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
      projection: { password: 0 },
    });

    if (!svc) return res.status(404).json({ message: 'Not found' });
    res.json(svc);
  } catch (err) {
    next(err);
  }
};

// Delete a service and resync user's current week (optional: also allow specifying a week)
// DELETE /api/services/:id
export const deleteService = async (req, res, next) => {
  try {
    const svc = await Service.findByIdAndDelete(req.params.id);
    if (!svc) return res.status(404).json({ message: 'Not found' });

    // Optionally recompute for the current week
    const now = new Date();
    await Service.recalculateUserWeekIncome(svc.userId, now);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// Upsert a weekly revenue entry for this service, and sync user.week_income
// POST /api/service/:id/weekly
// Body: { "weekStart": "2025-09-08", "amount": 1200000 }
export const upsertWeeklyRevenue = async (req, res, next) => {
  try {
    const { weekStart, amount } = req.body;

    // Validate amount
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 0) {
      return res.status(400).json({ message: '`amount` must be a non-negative number' });
    }

    const weekframe = getCurrentWeekTimeframe();

    const svc = await Service.findById(req.params.id);
    if (!svc) return res.status(404).json({ message: 'Service not found' });

    // Upsert weekly revenue for that week
    svc.setWeeklyRevenue(weekframe, amt);
    await svc.save();

    // Recalculate the user's total for that same week
    const total = await Audit.recalculateUserWeekIncome(svc.userId, normalizedWeekStart);

    const obj = svc.toObject();
    delete obj.password;

    // Add weekframe (UTC Monday–Sunday) to make responses friendlier

    res.status(200).json({
      service: obj,
      userWeekIncome: {
        userId: svc.userId,
        weekFrame: weekframe,                      
      }
    });
  } catch (err) {
    next(err);
  }
};

// Utility endpoint to recalc a user's week income explicitly
// POST /api/service/recalculate
// Body: { "userId": "...", "weekStart": "2025-09-08" }
export const recalcUserWeekIncome = async (req, res, next) => {
  try {
    const { userId, weekStart } = req.body;
    if (!userId || !weekStart) {
      return res.status(400).json({ message: 'userId and weekStart are required' });
    }

    const weekframe = getCurrentWeekTimeframe();
    const total = await Service.recalculateUserWeekIncome(userId, normalized);

    res.json({
      userId,
      weekStart: normalized,
      weekFrame: weekframe,
      total
    });
  } catch (err) {
    next(err);
  }
};