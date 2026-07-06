const knex = require('knex');
const config = require('../knexfile');

// Use NODE_ENV or default to development
const env = process.env.NODE_ENV || 'development';

module.exports = knex(config[env]);
