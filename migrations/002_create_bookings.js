// migrations/002_create_bookings.js
// A booking belongs to one patient. The foreign key links the two tables.

exports.up = async function (knex) {
  await knex.schema.createTable("bookings", (table) => {
    table.increments("id").primary();
    table
      .integer("patient_id")
      .notNullable()
      .references("id")
      .inTable("patients")
      .onDelete("CASCADE"); // deleting a patient also deletes their bookings
    table.string("doctor_name", 100);
    table.timestamp("scheduled_at").notNullable();
    table.string("reason", 200);
    // pending | completed | cancelled
    table.string("status", 20).notNullable().defaultTo("pending");
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("bookings");
};
