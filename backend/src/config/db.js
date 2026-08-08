const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/laptop_pricing_db';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('MongoDB connected');
  } catch (err) {
    try {
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('Memory DB connected');
    } catch (memErr) {
      console.error(memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
