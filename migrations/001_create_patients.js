// migrations/001_create_patients.js
// A migration describes one change to the database structure.
// Running `npm run db:migrate` creates the table below.

exports.up = async function (knex) {
  await knex.schema.createTable("patients", (table) => {
    table.increments("id").primary();
    table.string("name", 100).notNullable();
    table.integer("age");
    table.string("phone", 30);
    table.string("illness", 150);
    // waiting | under_treatment | discharged
    table.string("status", 20).notNullable().defaultTo("waiting");
    table.timestamps(true, true); // created_at and updated_at
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("patients");
};
