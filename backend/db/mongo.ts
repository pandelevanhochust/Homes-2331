import mongoose, { Mongoose } from 'mongoose';

let isConnected = false;

export async function connectMongo(): Promise<Mongoose> {
  if (isConnected) return mongoose;

  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error('MONGO_URL is missing in .env');

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, { dbName: 'staffdb' });
  isConnected = true;

  mongoose.connection.on('connected', () => {
    console.log('[mongo] connected:', uri);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[mongo] error:', (err as any)?.message || err);
  });

  return mongoose;
}

export { mongoose };
