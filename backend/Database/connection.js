const mongoose = require('mongoose');

const getMongoConnectionHelp = (mongoUri = '', errorMessage = '') => {
  const normalizedMessage = String(errorMessage || '').toLowerCase();
  const isAtlasUri = mongoUri.includes('mongodb+srv://') || mongoUri.includes('.mongodb.net');
  const isServerSelectionError = normalizedMessage.includes('server selection')
    || normalizedMessage.includes('could not connect')
    || normalizedMessage.includes('timed out');

  if (isAtlasUri && isServerSelectionError) {
    return 'MongoDB Atlas connection failed. Verify the deployment server IP is added to Atlas Network Access (IP Access List), and confirm the URI credentials are correct.';
  }

  if (isAtlasUri) {
    return 'MongoDB Atlas connection failed. Check the URI credentials and Atlas Network Access allowlist settings.';
  }

  return 'MongoDB connection failed. Check MONGO_URI and ensure the database server is reachable.';
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/AWT';

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log('MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error(getMongoConnectionHelp(mongoUri, error.message));
    process.exit(1);
  }
};

module.exports = connectDB;
