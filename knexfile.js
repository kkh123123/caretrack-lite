// knexfile.js
// This file tells Knex how to connect to PostgreSQL.
// The values can be overridden with environment variables if needed.

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "student", // same password used in class
      database: process.env.DB_NAME || "care_track_simple",
    },
    migrations: {
      directory: "./migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};
