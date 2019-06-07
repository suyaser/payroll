const env = process.env.NODE_ENV || "development";

const development = {
    app: {
        port: parseInt(process.env.PORT) || 3001,
        host: process.env.HOST || 'localhost'
    },
    jenkins: {
        port: parseInt(process.env.JENKINS_PORT) || 8080,
        host: process.env.JENKINS_HOST || 'localhost'
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 27017,
        name: process.env.DB_NAME || 'CastleDashboard'
    }
};
const production = {
    app: {
        port: parseInt(process.env.PORT) || 3001,
        host: process.env.HOST || 'cai1-sv00075'
    },
    jenkins: {
        port: parseInt(process.env.JENKINS_PORT) || 8080,
        host: process.env.JENKINS_HOST || 'cai1-sv00075'
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 27017,
        name: process.env.DB_NAME || 'CastleDashboard'
    }
};

const config = {
    development,
    production
};

module.exports = config[env];