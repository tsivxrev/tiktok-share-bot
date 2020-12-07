//const winston = require('winston')
const { createLogger, format, transports, stream } = require('winston');
const { printf } = format;


const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const transport = [
    new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: format.json()
    }),
    new transports.File({
        filename: 'logs/application-info.log',
        level: 'info',
        format: format.json()
    }),
    new transports.Console({
        level: 'info',
        format: format.combine( format.colorize(), myFormat),
        handleExceptions: true,
    })
]

const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.json()
    ),
    transports: transport
});


const streamLogs = (offset=1) => {
    const options = {
        from: new Date() - (24 * 60 * 60 * 1000) * offset,
        until: new Date(),
        //limit: 10,
        start: 0,
        order: 'desc',
        //fields: ['message']
    };
    return new Promise((resolve, reject) => {
        logger.query(options, function (err, results) {
            if (err) { reject(err); }
            resolve(JSON.stringify(results, null, '\t'));
        });
    })
}


module.exports = {
  logger, streamLogs
}