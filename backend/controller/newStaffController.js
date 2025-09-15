import jwt from 'jsonwebtoken';
import { Staff } from '../models/Staff.js';

const normalizeType = (v) => (typeof v === 'string' ? v.toUpperCase() : v);
const isValidType = (v) => v === 'ONLINE' || v === 'OFFLINE';

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ sub: userId }, secret, { expiresIn: '7d' });
};

// POST /api/users
export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      type = 'OFFLINE',
      image,
      equipment = [],
      equipmentDebt = 0,
      week_income = 0,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await Staff.create({
      name,
      email,
      password,
      type: normalizeType(type),
      image,
      equipment: Array.isArray(equipment) ? equipment : [],
      equipmentDebt,
      week_income,
    });

    const token = signToken(user._id.toString());

    res.status(201).json({
      token,
      user, // password removed by schema transform
    });
  } catch (err) {
    // Handle duplicate key (race condition)
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    next(err);
  }
};

// POST /api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password: raw } = req.body;
    if (!email || !raw) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // Explicitly select password
    const user = await Staff.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = raw === user.password;
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id.toString());

    // strip password before sending
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    next(err);
  }
};

// GET /api/users
// query: ?q=keyword&type=ONLINE|OFFLINE&limit=20&page=1
export const listUsers = async (req, res, next) => {
  try {
    const { q, type, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (type) {
      const t = normalizeType(type);
      if (!isValidType(t)) return res.status(400).json({ message: 'Invalid type' });
      filter.type = t;
    }

    const lim = Math.min(Number(limit) || 20, 100);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * lim;

    const [items, total] = await Promise.all([
      Staff.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim),
      Staff.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page) || 1,
      limit: lim,
      pages: Math.ceil(total / lim),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
export const getMe = async (req, res, next) => {
  try {
    const userId = req.userId; // set by protect middleware
    const user = await Staff.findById(userId);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await Staff.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'image', 'type', 'equipment', 'equipmentDebt', 'week_income', 'email'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    if (update.type) {
      update.type = normalizeType(update.type);
      if (!isValidType(update.type)) {
        return res.status(400).json({ message: 'Invalid type (use ONLINE or OFFLINE)' });
      }
    }

    if (update.equipment && !Array.isArray(update.equipment)) {
      return res.status(400).json({ message: 'equipment must be an array of strings' });
    }

    const user = await Staff.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    // Handle email duplicate on update
    if (err?.code === 11000 && err?.keyPattern?.email) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    next(err);
  }
};

// PATCH /api/users/:id/status  { type: 'ONLINE' | 'OFFLINE' }
export const updateStatus = async (req, res, next) => {
  try {
    const t = normalizeType(req.body.type);
    if (!isValidType(t)) return res.status(400).json({ message: 'Invalid type (ONLINE/OFFLINE)' });

    const user = await Staff.findByIdAndUpdate(
      req.params.id,
      { type: t },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/equipment { add?: string[], remove?: string[] }
export const patchEquipment = async (req, res, next) => {
  try {
    const { add = [], remove = [] } = req.body;

    if (!Array.isArray(add) || !Array.isArray(remove)) {
      return res.status(400).json({ message: '`add` and `remove` must be arrays' });
    }

    const user = await Staff.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });

    const current = new Set((user.equipment || []).map((s) => String(s).trim()));
    for (const s of add) current.add(String(s).trim());
    for (const s of remove) current.delete(String(s).trim());

    user.equipment = Array.from(current);
    await user.save();

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const r = await Staff.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
