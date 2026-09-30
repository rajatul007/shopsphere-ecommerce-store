import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to provided MONGODB_URI...');
      await mongoose.connect(mongoUri);
      console.log('MongoDB Connected successfully to external database.');
      return;
    }

    console.log('No MONGODB_URI provided in environment. Initializing local MongoDB instance via MongoMemoryServer...');
    memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    await mongoose.connect(mongoUri, { dbName: 'shopsphere' });
    console.log(`MongoDB Connected successfully (In-Memory Engine) at ${mongoUri}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If external URI failed, attempt memory server fallback
    if (!memoryServer) {
      try {
        console.log('Falling back to MongoMemoryServer...');
        memoryServer = await MongoMemoryServer.create();
        const fallbackUri = memoryServer.getUri();
        await mongoose.connect(fallbackUri, { dbName: 'shopsphere' });
        console.log(`Connected to fallback MongoMemoryServer at ${fallbackUri}`);
      } catch (memErr: any) {
        console.error(`Fallback failed: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
