import { mongoose } from '../db/mongo';

const WeeklyRevenueSchema = new mongoose.Schema(
  {
    weekStart: { type: Date, required: true }, // week start date (e.g., Monday)
    amount:    { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ServiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    name:   { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
    weeklyRevenues: { type: [WeeklyRevenueSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Helpful indexes
ServiceSchema.index({ userId: 1 });
ServiceSchema.index({ 'weeklyRevenues.weekStart': 1 });

export type WeeklyRevenue = mongoose.InferSchemaType<typeof WeeklyRevenueSchema>;
export type ServiceDoc = mongoose.InferSchemaType<typeof ServiceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Service = mongoose.model<ServiceDoc>('services', ServiceSchema);
