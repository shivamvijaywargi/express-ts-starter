import mongoose from 'mongoose';
import Logger from '@/utils/logger';

mongoose.set('strictQuery', false); // To prepare for future mongoose change
mongoose.set('runValidators', true); // To run mongoose Schema validations upon update

const connectToDB = async () => {
  try {
    const MONGO_URI =
      process.env.MONGO_URI || 'mongodb://localhost:27017/express-ts-starter';

    const conn = await mongoose.connect(MONGO_URI);

    if (conn) {
      Logger.info(`Connected to DB: ${conn.connection.host}`);
    }
  } catch (error) {
    Logger.error(error);
    process.exit(1);
  }
};

export default connectToDB;
