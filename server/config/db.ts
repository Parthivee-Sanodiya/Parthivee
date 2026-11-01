import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const envUri = process.env.MONGODB_URI;

  if (envUri) {
    try {
      console.log('Connecting to configured MongoDB URI...');
      await mongoose.connect(envUri);
      console.log('Connected to MongoDB via MONGODB_URI.');
      return envUri;
    } catch (err) {
      console.warn('Failed connecting to MONGODB_URI, falling back to MongoMemoryServer...', err);
    }
  }

  // Fallback to high-performance local MongoMemoryServer
  if (!mongoMemoryServer) {
    console.log('Initializing MongoMemoryServer instance for MERN stack...');
    mongoMemoryServer = await MongoMemoryServer.create();
  }

  const memoryUri = mongoMemoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log(`Connected to MongoDB Memory Server at: ${memoryUri}`);
  return memoryUri;
}

export async function closeDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
