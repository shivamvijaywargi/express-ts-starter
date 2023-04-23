import app from './app';
import connectToDB from './configs/dbConn';
import Logger from './utils/logger';

// Handling uncaucght exceptions
process.on('uncaughtException', (err) => {
  Logger.error(`Error: ${err.message}`);
  Logger.info('Shutting down the server due to uncaught exceptions');

  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  await connectToDB();
  Logger.info(
    `App is listening at http://localhost:${PORT} in ${process.env.NODE_ENV} mode`,
  );
});

// log unhandled rejections
process.on('unhandledRejection', (err) => {
  Logger.error(err);
  Logger.info('Shutting down the server due to unhandled promise rejections');

  server.close(() => {
    process.exit(1);
  });
});
