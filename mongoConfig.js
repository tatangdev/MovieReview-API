const environment = process.env.ENVIRONMENT;

const conf = {
    DEVELOPMENT: process.env.DB_DEVELOPMENT,
    TESTING: process.env.DB_TESTING,
    PRODUCTION: process.env.DB_PRODUCTION,
    STAGING: process.env.DB_STAGING
};

module.exports = {
    MONGODB_URI: conf[environment]
};