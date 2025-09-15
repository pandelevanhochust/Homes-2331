import { mongoose } from '../db/mongo.js';
import { Staff } from './Staff.js';

const { Schema, Types } = mongoose;


export function getISOWeekStart(date = new Date()) {
  const d = new Date(Date.UTC(
    date.getFullYear(), date.getMonth(), date.getDate()
  ));
  const day = d.getDay(); // Sun=0..Sat=6
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  console.log(d);
  return d;
}

const WeeklyRevenueSchema = new Schema(
  {
    weekFrame: { type: String, required: true },     
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ServiceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    serviceId: { type: String, required: true, trim: true }, // previously "Service_ID"
    name: { type: String, required: true, trim: true },      // previously "Service"
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true, select: false },
    weeklyRevenue: {
      type: [WeeklyRevenueSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Helper to upsert a weekly revenue record on a Service document
ServiceSchema.methods.setWeeklyRevenue = function setWeeklyRevenue(weekFrame, amount) {
    this.weeklyRevenue.push({ weekFrame, amount });
};

// Static: sum a user's weekly revenue across all services for a given week
AuditSc.statics.recalculateUserWeekIncome = async function recalc(userId, weekStartInput) {
  const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
  const weekStart = getISOWeekStart(weekStartInput);

  const result = await this.aggregate([
    { $match: { userId: userObjectId } },
    { $unwind: '$weeklyRevenue' },
    { $match: { 'weeklyRevenue.weekStart': weekStart } },
    { $group: { _id: '$userId', total: { $sum: '$weeklyRevenue.amount' } } }
  ]);

  const total = result[0]?.total || 0;

  await Staff.findByIdAndUpdate(userObjectId, { week_income: total }, { new: false }).lean();
  return total;
};

export const Service = mongoose.model('services', ServiceSchema);
export const Audit = mongoose.model('audit',WeeklyRevenueSchema );
