# CareTrack Lite

A **simplified care-tracking app** for students learning web development.

It takes the main idea of CareTrack (patients, statuses, appointments) and rebuilds it
in the same simple style as the **library management system**:

| Library management system | CareTrack Lite |
| --- | --- |
| `books` table | `patients` and `bookings` tables |
| Add a book | Add a patient / booking |
| Issue a book | Set a patient to **Under treatment** |
| Return a book | Mark a booking **Completed** / discharge a patient |
| Delete a book | Delete a patient or booking |
| One `app.js` with all routes | One `app.js` with all routes |
| EJS views | EJS views |

It uses **Node.js, Express, EJS, Knex, and PostgreSQL** — no React, no build step,
and no authentication. Those would be good next exercises.

---

## Project structure

```
newproject/
├── app.js                         All Express routes (read, create, update, delete)
├── knexfile.js                    PostgreSQL connection + migration/seed folders
├── package.json
├── migrations/
│   ├── 001_create_patients.js     Creates the patients table
│   └── 002_create_bookings.js     Creates the bookings table (linked to patients)
├── seeds/
│   └── 001_demo_data.js           Demo patients and bookings
├── views/
│   └── home.ejs                   The dashboard page
└── public/
    └── styles.css                 Page styling
```

---

## 1. Requirements

- Node.js 18 or newer
- PostgreSQL installed and running
- The PostgreSQL password used in class (`student` by default)

The database settings live in **`knexfile.js`**. If your password or database name is
different, change it there:

```js
password: process.env.DB_PASSWORD || "student",
database: process.env.DB_NAME || "care_track_simple",
```

---

## 2. Create the database

Open **pgAdmin** and create a database named `care_track_simple`, or use `psql`:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE care_track_simple;"
```

It will ask for the password (`student`).

> `psql` is usually not on the PATH on Windows, which is why the full path is used above.

---

## 3. Install dependencies

```powershell
cd "C:\Users\Chinese UI\Desktop\project\newproject"
npm install
```

---

## 4. Create the tables and demo data

```powershell
npm run db:migrate
npm run db:seed
```

- `db:migrate` runs the files in `migrations/` to create the tables.
- `db:seed` inserts the demo patients and bookings.

You can run the seed again at any time to reset the demo data.

---

## 5. Start the app

```powershell
npm start
```

Open **http://localhost:3001**

> Port **3001** is used because the main CareTrack app runs on port 3000. To use a
> different port: `$env:PORT=3002; npm start`

For automatic restarts while editing:

```powershell
npm run dev
```

---

## What you can do

### Patients
- **Add** a patient (name is required; new patients start as *Waiting*)
- **View** all patients and their current status
- **Update** a patient's status: *Waiting → Under treatment → Discharged*
- **Delete** a patient (this also deletes their bookings — see the foreign key)

### Bookings
- **Add** a booking for an existing patient
- **View** all bookings with patient names
- **Update** a booking's status: *Pending → Completed / Cancelled*
- **Delete** a booking

The four statistics at the top are calculated in JavaScript inside the `GET /` route.

---

## Routes

| Method | URL | Purpose |
| --- | --- | --- |
| `GET` | `/` | Dashboard: list patients and bookings |
| `POST` | `/patients/add` | Create a patient |
| `POST` | `/patients/:id/status` | Update a patient's observed status |
| `POST` | `/patients/:id/delete` | Delete a patient (and their bookings) |
| `POST` | `/bookings/add` | Create a booking |
| `POST` | `/bookings/:id/status` | Update a booking's status |
| `POST` | `/bookings/:id/delete` | Delete a booking |

All forms use normal HTML `POST` requests and then redirect back to `/`. This is the
same pattern as the library system’s `/add`, `/issue`, `/return`, and `/delete` routes.

---

## Database tables

**patients**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key, auto-increment |
| `name` | text | Required |
| `age` | integer | Optional |
| `phone` | text | Optional |
| `illness` | text | Optional |
| `status` | text | `waiting`, `under_treatment`, `discharged` |
| `created_at` / `updated_at` | timestamp | Managed by Knex |

**bookings**

| Column | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key, auto-increment |
| `patient_id` | integer | Foreign key → `patients.id`, deletes with the patient |
| `doctor_name` | text | Optional |
| `scheduled_at` | timestamp | Required |
| `reason` | text | Optional |
| `status` | text | `pending`, `completed`, `cancelled` |
| `created_at` / `updated_at` | timestamp | Managed by Knex |

---

## How the code is organised (study notes)

1. **`knexfile.js`** — one connection object used by both the app and the Knex CLI.
2. **`migrations/`** — the only place that changes table structure. Never create tables
   by hand in pgAdmin; migrations keep the whole class in sync.
3. **`seeds/`** — inserts demo rows. The seed deletes existing rows first so it can be
   run repeatedly.
4. **`app.js`** — each route is short:
   - read form values from `req.body`
   - validate them
   - run one Knex query (`select`, `insert`, `update`, `delete`)
   - `res.redirect("/")`
5. **`views/home.ejs`** — EJS lets us embed JavaScript with `<% %>` and safely print
   values with `<%= %>`. Escaped output helps prevent HTML injection.
6. **`public/styles.css`** — served by `express.static`, linked from the page.

---

## Try these next (practice ideas)

1. Add a **search box** that filters patients by name (`where("name", "ilike", ...)`).
2. Add **server-side validation messages** instead of plain-text error pages.
3. Split `app.js` into `routes/patients.js` and `routes/bookings.js` (like a bigger project).
4. Add **login** with roles (patient, nurse, doctor) — see the main CareTrack project.
5. Add **doctor** and **disease** tables, then show them on the dashboard.
6. Add **pagination** if the tables get long.

---

## Troubleshooting

**`EADDRINUSE` on port 3001** — another copy is already running:

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**`password authentication failed`** — check the password in `knexfile.js`.

**`database "care_track_simple" does not exist`** — create it (step 2) before migrating.

**Tables are empty** — run `npm run db:seed`.
