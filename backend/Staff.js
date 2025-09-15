// src/models/userModel.js
import { mongoose } from '../db/mongo.js';

const { Schema } = mongoose;

const StaffSchema = new Schema(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },

    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    type: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'OFFLINE',
      set: (v) => String(v).toUpperCase(),
    },

    equipment: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr) ? arr.map((s) => String(s).trim()) : [],
    },

    equipmentDebt: { type: Number, default: 0, min: 0 },
    week_income: { type: Number, default: 0, min: 0 },


    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: { type: String, required: true, trim: true, select: false },
  }
);

// // Ensure email uniqueness at DB level
// UserSchema.index({ email: 1 }, { unique: true });

// Use your original collection name ('users')
export const Staff = mongoose.model('staff', StaffSchema);
