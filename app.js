// app.js
// ---------------------------------------------------------------------------
// CareTrack Lite
//
// A simplified care-tracking app built for learning.
// It follows the same simple structure as the library management system:
//
//   app.js         -> all routes in one file
//   knexfile.js    -> database connection settings
//   migrations/    -> database table definitions
//   seeds/         -> demo data
//   views/         -> EJS pages
//
// Run it with:
//   npm install
//   npm run db:migrate
//   npm run db:seed
//   npm start
// ---------------------------------------------------------------------------

const path = require("path");
const express = require("express");
const knex = require("knex");
const config = require("./knexfile");

const db = knex(config.development);
const app = express();

const PORT = process.env.PORT || 3001;

// These lists keep the status values consistent everywhere.
const PATIENT_STATUSES = ["waiting", "under_treatment", "discharged"];
const BOOKING_STATUSES = ["pending", "completed", "cancelled"];

// ---------------------------------------------------------------------------
// Express setup
// ---------------------------------------------------------------------------

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Reads data sent by HTML forms (application/x-www-form-urlencoded).
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Small helpers the EJS pages can use.
app.locals.statusLabel = function (value) {
  if (!value) return "";
  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

app.locals.formatDateTime = function (value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// A sensible default value for the <input type="datetime-local"> field.
app.locals.defaultScheduleValue = function () {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// ---------------------------------------------------------------------------
// READ: show the dashboard
// ---------------------------------------------------------------------------

app.get("/", async function (req, res) {
  try {
    // Two simple queries: all patients, and all bookings with patient names.
    const patients = await db("patients").select().orderBy("id", "desc");

    const bookings = await db("bookings as b")
      .leftJoin("patients as p", "b.patient_id", "p.id")
      .select("b.*", "p.name as patient_name")
      .orderBy("b.scheduled_at", "asc");

    // The statistics are easy to calculate in JavaScript for this small app.
    const stats = {
      patients: patients.length,
      underTreatment: patients.filter((p) => p.status === "under_treatment")
        .length,
      discharged: patients.filter((p) => p.status === "discharged").length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
    };

    res.render("home", {
      patients,
      bookings,
      stats,
      patientStatuses: PATIENT_STATUSES,
      bookingStatuses: BOOKING_STATUSES,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not load the dashboard. Is PostgreSQL running?");
  }
});

// ---------------------------------------------------------------------------
// CREATE: add a patient
// ---------------------------------------------------------------------------

app.post("/patients/add", async function (req, res) {
  try {
    const name = (req.body.name || "").trim();
    const age = req.body.age ? Number(req.body.age) : null;
    const phone = (req.body.phone || "").trim() || null;
    const illness = (req.body.illness || "").trim() || null;

    // Very small validation: a patient must have a name.
    if (!name) {
      return res.status(400).send("Patient name is required. Go back and try again.");
    }
    if (age !== null && (Number.isNaN(age) || age < 0 || age > 130)) {
      return res.status(400).send("Please enter a valid age.");
    }

    // New patients always start as "waiting".
    await db("patients").insert({
      name,
      age,
      phone,
      illness,
      status: "waiting",
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not add the patient.");
  }
});

// ---------------------------------------------------------------------------
// UPDATE: change a patient's observed status
// ---------------------------------------------------------------------------

app.post("/patients/:id/status", async function (req, res) {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!PATIENT_STATUSES.includes(status)) {
      return res.status(400).send("Invalid patient status.");
    }

    await db("patients")
      .where({ id })
      .update({ status, updated_at: db.fn.now() });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not update the patient.");
  }
});

// ---------------------------------------------------------------------------
// DELETE: remove a patient (their bookings are removed too)
// ---------------------------------------------------------------------------

app.post("/patients/:id/delete", async function (req, res) {
  try {
    const id = Number(req.params.id);
    await db("patients").where({ id }).delete();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not delete the patient.");
  }
});

// ---------------------------------------------------------------------------
// CREATE: add a booking
// ---------------------------------------------------------------------------

app.post("/bookings/add", async function (req, res) {
  try {
    const patientId = Number(req.body.patient_id);
    const doctorName = (req.body.doctor_name || "").trim() || null;
    const scheduledAt = req.body.scheduled_at;
    const reason = (req.body.reason || "").trim() || null;

    if (!patientId) {
      return res.status(400).send("Please choose a patient. Go back and try again.");
    }
    if (!scheduledAt) {
      return res.status(400).send("Please choose a date and time.");
    }

    await db("bookings").insert({
      patient_id: patientId,
      doctor_name: doctorName,
      scheduled_at: scheduledAt,
      reason,
      status: "pending",
    });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not add the booking.");
  }
});

// ---------------------------------------------------------------------------
// UPDATE: change a booking's status
// ---------------------------------------------------------------------------

app.post("/bookings/:id/status", async function (req, res) {
  try {
    const id = Number(req.params.id);
    const status = req.body.status;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).send("Invalid booking status.");
    }

    await db("bookings")
      .where({ id })
      .update({ status, updated_at: db.fn.now() });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not update the booking.");
  }
});

// ---------------------------------------------------------------------------
// DELETE: remove a booking
// ---------------------------------------------------------------------------

app.post("/bookings/:id/delete", async function (req, res) {
  try {
    const id = Number(req.params.id);
    await db("bookings").where({ id }).delete();
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Could not delete the booking.");
  }
});

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------

app.use(function (req, res) {
  res.status(404).send("Page not found. Go back to the dashboard: /");
});

// ---------------------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------------------

app.listen(PORT, function () {
  // Port 3001 is used because the main CareTrack app uses 3000.
  console.log(`CareTrack Lite is running on http://localhost:${PORT}`);
});
