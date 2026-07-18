import mongoose from 'mongoose';

export async function connectMongo(mongoUri: string): Promise<typeof mongoose> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  return mongoose;
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export function getMongoReadyState(): 'up' | 'down' {
  return mongoose.connection.readyState === 1 ? 'up' : 'down';
}
