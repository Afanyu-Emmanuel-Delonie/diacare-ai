# Demo Accounts

Seeded automatically on startup by `DemoDataSeeder` (only if they don't already exist). Controlled by `app.demo-data.enabled` (default `true`; set `DEMO_DATA_ENABLED=false` in `.env` to disable for a real deployment).

All accounts use the password: `Demo@1234`

| Role | Username | Email |
|---|---|---|
| Admin | `admin.demo` | admin@diabetesmonitoring.rw |
| Doctor | `doctor.demo` | doctor@diabetesmonitoring.rw |
| Nurse | `nurse.demo` | nurse@diabetesmonitoring.rw |
| Patient | `patient.demo` | patient@diabetesmonitoring.rw |
| Caregiver | `caregiver.demo` | caregiver@diabetesmonitoring.rw |

The `doctor.demo` and `patient.demo` accounts are also backed by matching `Doctor`/`Patient` profile records (linked by email), with the demo patient assigned to the demo doctor.

Note: this app's allowed roles are `ADMIN`, `DOCTOR`, `NURSE`, `PATIENT`, `CAREGIVER` (see `UserService`) — there is no distinct "caretaker" role, so `CAREGIVER` is used for that purpose.

## Login

```
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "doctor.demo",
  "password": "Demo@1234"
}
```

Response:

```json
{ "message": "Login successful", "token": "<JWT>" }
```
