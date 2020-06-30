import winston from 'winston'

const { combine, timestamp, prettyPrint, colorize, errors } = winston.format

const options: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
  format: combine(
    errors({ stack: true }), // <-- use errors format
    colorize(),
    timestamp(),
    prettyPrint()
  ),
}

const logger = winston.createLogger(options)

if (process.env.NODE_ENV !== 'production') {
  logger.debug('Logging initialized at debug level')
}

export default logger
