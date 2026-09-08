# AI-Driven Diabetes Monitoring and Healthcare Management System - Backend

## Project Description

This backend is a Spring Boot REST API for the **AI-Driven Diabetes Monitoring and Healthcare Management System**. It supports patient registration, glucose monitoring, medication management, appointments, educational diabetes content, Rwanda local food guidance, risk prediction alerts, reports, and analytics.

The system is designed to help patients, doctors, nurses, caregivers, and administrators manage diabetes-related healthcare information in a structured and secure way. It is an educational and monitoring support system only, not a replacement for professional medical care.

## Technologies Used

- Java 23, configured in `pom.xml`
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- JWT authentication
- Hibernate ORM
- PostgreSQL
- Jakarta Bean Validation
- Maven
- JUnit and Spring Boot Test
- Postman for API testing

## Folder Structure

```text
Backend/
+-- docs/
|   +-- postman-testing-guide.md
+-- src/
|   +-- main/
|   |   +-- java/auca/ac/rw/diabetesmonitoring/
|   |   |   +-- config/
|   |   |   +-- controller/
|   |   |   +-- dto/
|   |   |   +-- exception/
|   |   |   +-- model/
|   |   |   +-- repository/
|   |   |   +-- security/
|   |   |   +-- service/
|   |   |   +-- DiabetesMonitoringBackendApplication.java
|   |   +-- resources/
|   |       +-- application.properties
|   +-- test/
|       +-- java/auca/ac/rw/diabetesmonitoring/
+-- pom.xml
+-- README.md
```

## Database Name

```text
diabetes_monitoring_db
```

The default datasource URL is:

```text
jdbc:postgresql://localhost:5432/diabetes_monitoring_db
```

## Main Features

- User registration and login
- JWT-based authentication and role-based access control
- Patient profile management
- Doctor, nurse, caregiver, and user management
- Glucose reading tracking
- Medication information and adherence tracking
- Appointment scheduling
- Medical records and lab results
- Lifestyle activity tracking
- Risk prediction alerts
- Reports and analytics
- Diabetes knowledge base
- Rwanda local food guide
- Medical safety disclaimers for educational content
- Centralized validation and error handling
- SQL injection protection through Spring Data JPA and parameterized repository methods

## CRUD Explanation

The backend exposes RESTful CRUD APIs for core resources.

CRUD means:

- **Create**: Add a new record using `POST`
- **Read**: View one or more records using `GET`
- **Update**: Modify an existing record using `PUT`
- **Delete**: Remove a record using `DELETE`

Examples:

- Patients can be created, viewed, updated, and deleted.
- Glucose readings can be added, viewed, updated, and deleted.
- Medications can be added, viewed, updated, and deleted.
- Appointments can be created, viewed, updated, and deleted.
- Reports can be generated or retrieved from stored database records.

## Security Features

- JWT authentication for protected endpoints
- Password hashing with BCrypt
- Role-based authorization using Spring Security
- Input validation with Jakarta Bean Validation
- DTOs used for sensitive user request and response handling
- Passwords are write-only in JSON serialization
- Spring Data JPA repository methods used instead of raw SQL string concatenation
- Hibernate/JPA prepared statement handling
- Sanitized string filter inputs
- Centralized error handling for invalid requests
- Database errors are hidden behind safe API messages
- SQL logging disabled by default
- Database credentials configured through environment variables
- Least-privilege database user recommended instead of using the PostgreSQL superuser

## Data Access Scoping (Row-Level Authorization)

Authentication (`hasRole`/`hasAnyRole`) only decides whether a role can call an endpoint at all.
On top of that, `PatientAccessService` decides *which patients' data* a given account may see or
write, so a nurse can never read another nurse's patients even though both hold the `NURSE` role.

Rules, enforced consistently across patients, glucose readings, appointments, medications,
medical records, alerts, lab results, lifestyle activities, messages, risk predictions, and
reports:

| Role | Can access |
|---|---|
| **ADMIN** | Every patient and every record. |
| **DOCTOR** | Patients assigned to them as primary doctor, plus any patient whose medical record they have personally created (creating a record — "pulling the chart" — is itself the access-granting action, e.g. for a covering or consulting doctor). |
| **NURSE** | Only patients assigned to them. |
| **CAREGIVER** | Only patients assigned to them. |
| **PATIENT** | Only their own record. |

A staff account with no linked domain profile, or with zero assignments, sees an **empty**
list — it never falls back to "all patients". Every list endpoint filters by this scope, every
single-resource endpoint (`GET/PUT/DELETE /{id}`) re-checks it against the record's owning
patient, and every create endpoint validates the target `patientId` against it before saving,
so a request naming a `patientId` outside the caller's scope is rejected with `403 Forbidden`
rather than silently returning or writing data.

## How To Run The Project

### 1. Install Requirements

Install:

- Java 23
- Maven
- PostgreSQL

Check versions:

```bash
java -version
mvn -v
psql --version
```

### 2. Configure The Database

Create the PostgreSQL database and application user.

### 3. Configure Environment Variables

Recommended environment variables:

```bash
DB_URL=jdbc:postgresql://localhost:5432/diabetes_monitoring_db
DB_USERNAME=diabetes_app_user
DB_PASSWORD=your_secure_password
JWT_SECRET=replace_with_a_long_secure_secret
JWT_EXPIRATION_MS=86400000
```

The backend reads these values from `src/main/resources/application.properties`.

### 4. Run The Backend

From the `Backend` folder:

```bash
mvn spring-boot:run
```

The API runs by default at:

```text
http://localhost:8080
```

Health check:

```text
GET http://localhost:8080/api/health
```

## How To Configure PostgreSQL

Open PostgreSQL and run:

```sql
CREATE DATABASE diabetes_monitoring_db;
```

Create a least-privilege application user:

```sql
CREATE USER diabetes_app_user WITH PASSWORD 'your_secure_password';
GRANT CONNECT ON DATABASE diabetes_monitoring_db TO diabetes_app_user;
```

Connect to the database:

```sql
\c diabetes_monitoring_db
```

Grant schema permissions:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO diabetes_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO diabetes_app_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO diabetes_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO diabetes_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO diabetes_app_user;
```

Do not use the `postgres` superuser as the application account in production.

## How To Test Using Postman

A full Postman guide is available at:

```text
Backend/docs/postman-testing-guide.md
```

Basic testing flow:

1. Register a user with `POST /api/auth/register`.
2. Login with `POST /api/auth/login`.
3. Copy the returned JWT token.
4. In Postman, add this header to protected requests:

```text
Authorization: Bearer <your-token>
```

5. Test patient, glucose, medication, appointment, alert, and report endpoints.

## API Endpoint Summary

> Every endpoint below that returns or accepts a `patientId` is scoped per the
> [Data Access Scoping](#data-access-scoping-row-level-authorization) rules — "Yes" under JWT
> Required means authenticated, not unrestricted; the caller's role and patient assignments
> still determine which rows are visible or writable.

### Authentication

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a user | No |
| POST | `/api/auth/login` | Login and receive JWT | No |

### Health

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/health` | Backend health check | No |

### Patients

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/patients` | Get all accessible patients | Yes |
| GET | `/api/patients/{id}` | Get patient by ID | Yes |
| POST | `/api/patients` | Create patient | Yes |
| PUT | `/api/patients/{id}` | Update patient | Yes |
| DELETE | `/api/patients/{id}` | Delete patient | Yes |

### Glucose Readings

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/glucose-readings` | Get all glucose readings | Yes |
| GET | `/api/glucose-readings/{id}` | Get glucose reading by ID | Yes |
| GET | `/api/glucose-readings/patient/{patientId}` | Get readings for a patient | Yes |
| POST | `/api/glucose-readings` | Add glucose reading | Yes |
| PUT | `/api/glucose-readings/{id}` | Update glucose reading | Yes |
| DELETE | `/api/glucose-readings/{id}` | Delete glucose reading | Yes |

### Medications

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/medications` | Get all medications | Yes |
| GET | `/api/medications/{id}` | Get medication by ID | Yes |
| POST | `/api/medications` | Add medication | Yes |
| PUT | `/api/medications/{id}` | Update medication | Yes |
| DELETE | `/api/medications/{id}` | Delete medication | Yes |

### Appointments

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/appointments` | Get all appointments | Yes |
| GET | `/api/appointments/{id}` | Get appointment by ID | Yes |
| POST | `/api/appointments` | Create appointment | Yes |
| PUT | `/api/appointments/{id}` | Update appointment | Yes |
| DELETE | `/api/appointments/{id}` | Delete appointment | Yes |

### Alerts

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/alerts` | Get all alerts | Yes |
| GET | `/api/alerts/{id}` | Get alert by ID | Yes |
| POST | `/api/alerts` | Create alert | Yes |
| POST | `/api/alerts/risk-prediction` | Generate risk prediction result | Yes |
| PUT | `/api/alerts/{id}` | Update alert | Yes |
| DELETE | `/api/alerts/{id}` | Delete alert | Yes |

### Reports And Analytics

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/reports` | Get stored reports | Yes |
| GET | `/api/reports/{id}` | Get stored report by ID | Yes |
| POST | `/api/reports` | Create stored report | Yes |
| PUT | `/api/reports/{id}` | Update stored report | Yes |
| DELETE | `/api/reports/{id}` | Delete stored report | Yes |
| GET | `/api/reports/patient/{patientId}/health-summary` | Patient health summary | Yes |
| GET | `/api/reports/patient/{patientId}/glucose-trend` | Glucose trend report | Yes |
| GET | `/api/reports/patient/{patientId}/medication-adherence` | Medication adherence report | Yes |
| GET | `/api/reports/patient/{patientId}/appointment-history` | Appointment history | Yes |
| GET | `/api/reports/patient/{patientId}/risk-alert-history` | Risk alert history | Yes |
| GET | `/api/reports/patient/{patientId}/monthly-progress` | Monthly progress report | Yes |

### Diabetes Knowledge Base

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/diabetes-knowledge` | Get all knowledge entries | No |
| GET | `/api/diabetes-knowledge/{id}` | Get entry by ID | No |
| GET | `/api/diabetes-knowledge/category/{category}` | Get entries by category | No |
| GET | `/api/diabetes-knowledge/topic/{topicKey}` | Get entry by topic key | No |
| GET | `/api/diabetes-knowledge/disclaimer` | Get educational disclaimer | No |
| POST | `/api/diabetes-knowledge` | Create entry | Yes |
| PUT | `/api/diabetes-knowledge/{id}` | Update entry | Yes |
| DELETE | `/api/diabetes-knowledge/{id}` | Delete entry | Yes |

### Rwanda Local Food Guide

| Method | Endpoint | Description | JWT Required |
|---|---|---|---|
| GET | `/api/local-food-guides` | Get all local food guides | No |
| GET | `/api/local-food-guides/{id}` | Get food guide by ID | No |
| GET | `/api/local-food-guides/category/{category}` | Get foods by category | No |
| GET | `/api/local-food-guides/recommendation-level/{recommendationLevel}` | Get foods by recommendation level | No |
| GET | `/api/local-food-guides/guidance-note` | Get guidance note | No |
| POST | `/api/local-food-guides` | Create food guide | Yes |
| PUT | `/api/local-food-guides/{id}` | Update food guide | Yes |
| DELETE | `/api/local-food-guides/{id}` | Delete food guide | Yes |

### Other Resource APIs

The backend also includes CRUD endpoints for (all patient-scoped per the table above):

- Doctors: `/api/doctors`
- Lab results: `/api/lab-results`
- Lifestyle activities: `/api/lifestyle-activities`
- Medical records: `/api/medical-records`
- Messages: `/api/messages`
- Risk predictions: `/api/risk-predictions`
- Users: `/api/users`

## Medical Safety Disclaimer

This system provides educational and monitoring support only. It does not diagnose, treat, cure, or prevent diabetes or any other medical condition.

Diabetes knowledge base entries use this disclaimer:

```text
This information is for education only and does not replace advice from a qualified healthcare professional.
```

Patients should always consult a qualified healthcare professional for diagnosis, treatment, medication changes, emergency symptoms, and personalized medical advice.

## Author Information

**Author:** Shema Placide  
**Student ID:** 26497  
**Project:** AI-Driven Diabetes Monitoring and Healthcare Management System  
**Institution:** AUCA
