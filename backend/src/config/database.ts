import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // MongoDB Atlas connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain a minimum of 5 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    const conn = await mongoose.connect(
      process.env.DATABASE_URL ||
        'mongodb://localhost:27017/motorcycle-workshop',
      options
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Database connection error:', errorMessage);
    console.log('⚠️ Server will continue without database connection');
    console.log(
      '🔧 To fix: Check MongoDB Atlas IP whitelist and connection string'
    );

    // Don't exit the process, let the server continue
    // This allows frontend-backend integration testing even without DB
  }
};

export default connectDB;
