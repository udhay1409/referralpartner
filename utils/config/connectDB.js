import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) {
      return true;
    }

    const { connection } = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected: ${connection.host}`);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

export default connectDB;