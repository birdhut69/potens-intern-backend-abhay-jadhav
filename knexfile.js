require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL
      ? process.env.DATABASE_URL
      : {
          host: process.env.DB_HOST || '127.0.0.1',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'potens',
          password: process.env.DB_PASSWORD || 'potens_password',
          database: process.env.DB_NAME || 'potens_logs',
        },
    migrations: {
      directory: './migrations',
    },
  },
};
