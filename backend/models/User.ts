import { mongoose } from '../db/mongo';

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role:  { type: String, enum: ['ADMIN', 'STAFF'], default: 'STAFF' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Inferred TS type for the document (runtime schema → static type)
export type UserDoc = mongoose.InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User = mongoose.model<UserDoc>('users', UserSchema);
