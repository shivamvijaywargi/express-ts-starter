import winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms A' }),
  winston.format.prettyPrint(),
  // winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/all-%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  maxFiles: '14d',
});

const transports = [
  fileRotateTransport,
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({
        all: true,
      }),
    ),
  }),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  format,
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
    }),
  ],
});

export default Logger;

// exceptionHandlers: [
//     new winston.transports.File({
//       filename: 'logs/exceptions.log',
//     }),
//   ],
//   rejectionHandlers: [
//     new winston.transports.File({
//       filename: 'logs/rejections.log',
//     }),
//   ],

// import morgan from 'morgan';
// import { createLogger, format, transports } from 'winston';
// import 'winston-daily-rotate-file';

// const { combine, timestamp, prettyPrint } = format;

// const fileRotateTransport = new transports.DailyRotateFile({
//   filename: 'logs/combined-%DATE%.log',
//   datePattern: 'DD-MM-YYYY',
//   maxFiles: '14d',
// });

// const Logger = createLogger({
//   level: 'http',
//   format: combine(
//     timestamp({
//       format: 'DD-MM-YYYY hh:mm:ss.SSS A',
//     }),
//     prettyPrint()
//   ),
//   transports: [
//     new transports.Console(),
//     fileRotateTransport,
//     new transports.File({
//       level: 'error',
//       filename: 'logs/error.log',
//     }),
//   ],

// });

// export const morganMiddleware = morgan(
//   function (tokens, req, res) {
//     return JSON.stringify({
//       method: tokens.method(req, res),
//       url: tokens.url(req, res),
//       status: tokens.status(req, res),
//       content_length: tokens.res(req, res, 'content-length'),
//       response_time: tokens['response-time'](req, res),
//     });
//   },
//   {
//     stream: {
//       write: (message) => {
//         const data = JSON.parse(message);
//         Logger.info(data);
//         Logger.http(`incoming request ${data}`);
//       },
//     },
//   }
// );

// export default Logger;
