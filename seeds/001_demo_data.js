// seeds/001_demo_data.js
// Demo data so the dashboard is not empty when you first open it.
// Run with: npm run db:seed

exports.seed = async function (knex) {
  // Clear old rows first so this seed can be run more than once.
  await knex("bookings").del();
  await knex("patients").del();

  const now = new Date();
  const daysFromNow = (days, hour) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const insertedPatients = await knex("patients")
    .insert([
      {
        name: "Alice Tan",
        age: 34,
        phone: "555-0101",
        illness: "Asthma",
        status: "under_treatment",
      },
      {
        name: "Ben Lim",
        age: 52,
        phone: "555-0102",
        illness: "High blood pressure",
        status: "waiting",
      },
      {
        name: "Chloe Wong",
        age: 27,
        phone: "555-0103",
        illness: "Migraine",
        status: "under_treatment",
      },
      {
        name: "Daniel Lee",
        age: 71,
        phone: "555-0104",
        illness: "Arthritis",
        status: "discharged",
      },
      {
        name: "Emma Chen",
        age: 45,
        phone: "555-0105",
        illness: "Diabetes",
        status: "waiting",
      },
    ])
    .returning("id");

  // .returning("id") gives us the new ids, so we can link bookings to patients.
  const ids = insertedPatients.map((row) => row.id);
  const [aliceId, benId, chloeId, danielId, emmaId] = ids;

  await knex("bookings").insert([
    {
      patient_id: aliceId,
      doctor_name: "Dr. Patel",
      scheduled_at: daysFromNow(1, 9),
      reason: "Asthma follow-up",
      status: "pending",
    },
    {
      patient_id: benId,
      doctor_name: "Dr. Patel",
      scheduled_at: daysFromNow(1, 11),
      reason: "Blood pressure review",
      status: "pending",
    },
    {
      patient_id: chloeId,
      doctor_name: "Dr. Rivera",
      scheduled_at: daysFromNow(2, 14),
      reason: "Migraine consultation",
      status: "pending",
    },
    {
      patient_id: danielId,
      doctor_name: "Dr. Rivera",
      scheduled_at: daysFromNow(3, 10),
      reason: "Arthritis check-up",
      status: "pending",
    },
    {
      patient_id: emmaId,
      doctor_name: "Dr. Patel",
      scheduled_at: daysFromNow(-2, 15),
      reason: "Diabetes review",
      status: "completed",
    },
  ]);
};
