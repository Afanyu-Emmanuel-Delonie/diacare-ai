# Postman Testing Guide

Base URL variable:

```text
{{baseUrl}} = http://localhost:8080
```

JWT token variable:

```text
{{token}} = paste the token returned by login
```

For protected endpoints, add this header:

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Most protected examples below assume an `ADMIN`, `DOCTOR`, `NURSE`, or authorized `PATIENT` token. Public endpoints are marked as not requiring a JWT.

## 1. Register User

JWT required: No

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/auth/register
```

Request body:

```json
{
  "username": "adminuser",
  "password": "StrongPass123",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

Expected response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "adminuser",
    "email": "admin@example.com",
    "role": "ADMIN",
    "createdAt": "2026-07-04T12:00:00",
    "updatedAt": "2026-07-04T12:00:00"
  }
}
```

## 2. Login User

JWT required: No

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/auth/login
```

Request body:

```json
{
  "usernameOrEmail": "adminuser",
  "password": "StrongPass123"
}
```

Expected response:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

Postman tip: copy the `token` value into the `{{token}}` collection variable.

## 3. Create Patient

JWT required: Yes

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/patients
```

Request body:

```json
{
  "fullName": "Jean Uwimana",
  "email": "jean.uwimana@example.com",
  "phone": "+250788123456",
  "dateOfBirth": "1985-03-14"
}
```

Expected response:

```json
{
  "id": 1,
  "fullName": "Jean Uwimana",
  "email": "jean.uwimana@example.com",
  "phone": "+250788123456",
  "dateOfBirth": "1985-03-14",
  "createdAt": "2026-07-04T12:05:00",
  "updatedAt": "2026-07-04T12:05:00"
}
```

## 4. Get All Patients

JWT required: Yes

Method:

```text
GET
```

URL:

```text
{{baseUrl}}/api/patients
```

Request body: none

Expected response:

```json
[
  {
    "id": 1,
    "fullName": "Jean Uwimana",
    "email": "jean.uwimana@example.com",
    "phone": "+250788123456",
    "dateOfBirth": "1985-03-14"
  }
]
```

## 5. Get Patient By ID

JWT required: Yes

Method:

```text
GET
```

URL:

```text
{{baseUrl}}/api/patients/{{patientId}}
```

Example:

```text
{{baseUrl}}/api/patients/1
```

Request body: none

Expected response:

```json
{
  "id": 1,
  "fullName": "Jean Uwimana",
  "email": "jean.uwimana@example.com",
  "phone": "+250788123456",
  "dateOfBirth": "1985-03-14"
}
```

## 6. Update Patient

JWT required: Yes

Method:

```text
PUT
```

URL:

```text
{{baseUrl}}/api/patients/{{patientId}}
```

Request body:

```json
{
  "fullName": "Jean Uwimana",
  "email": "jean.uwimana@example.com",
  "phone": "+250788654321",
  "dateOfBirth": "1985-03-14"
}
```

Expected response:

```json
{
  "id": 1,
  "fullName": "Jean Uwimana",
  "email": "jean.uwimana@example.com",
  "phone": "+250788654321",
  "dateOfBirth": "1985-03-14"
}
```

## 7. Delete Patient

JWT required: Yes

Method:

```text
DELETE
```

URL:

```text
{{baseUrl}}/api/patients/{{patientId}}
```

Request body: none

Expected response:

```text
204 No Content
```

## 8. Add Glucose Reading

JWT required: Yes

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/glucose-readings
```

Request body:

```json
{
  "reading": 142,
  "measuredAt": "2026-07-04T08:30:00",
  "patient": {
    "id": 1
  }
}
```

Expected response:

```json
{
  "id": 1,
  "reading": 142,
  "measuredAt": "2026-07-04T08:30:00",
  "patient": {
    "id": 1
  },
  "createdAt": "2026-07-04T08:31:00"
}
```

## 9. Get Glucose Readings By Patient

JWT required: Yes

Method:

```text
GET
```

URL:

```text
{{baseUrl}}/api/glucose-readings/patient/{{patientId}}
```

Request body: none

Expected response:

```json
[
  {
    "id": 1,
    "reading": 142,
    "measuredAt": "2026-07-04T08:30:00",
    "patient": {
      "id": 1
    },
    "createdAt": "2026-07-04T08:31:00"
  }
]
```

## 10. Add Medication

JWT required: Yes

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/medications
```

Request body:

```json
{
  "medicationName": "Metformin",
  "medicationClass": "Biguanide",
  "purpose": "Helps lower blood glucose",
  "suitableDiabetesType": "Type 2 Diabetes",
  "typicalTiming": "With meals",
  "howToUseGeneralInfo": "Take as prescribed by a qualified healthcare professional.",
  "commonSideEffects": "Nausea or stomach upset may occur.",
  "storageInstructions": "Store at room temperature.",
  "missedDoseGuidance": "Follow healthcare provider guidance for missed doses.",
  "warnings": "Do not change dose without medical advice.",
  "doctorPrescribedDose": "500 mg twice daily",
  "reminderSchedule": "08:00, 20:00",
  "adherenceStatus": "TAKEN",
  "startDate": "2026-07-01",
  "endDate": null,
  "patient": {
    "id": 1
  }
}
```

Expected response:

```json
{
  "id": 1,
  "medicationName": "Metformin",
  "doctorPrescribedDose": "500 mg twice daily",
  "adherenceStatus": "TAKEN",
  "startDate": "2026-07-01",
  "endDate": null,
  "patient": {
    "id": 1
  }
}
```

## 11. Create Appointment

JWT required: Yes

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/appointments
```

Request body:

```json
{
  "scheduledAt": "2026-07-10T09:00:00",
  "status": "SCHEDULED",
  "patient": {
    "id": 1
  }
}
```

Expected response:

```json
{
  "id": 1,
  "scheduledAt": "2026-07-10T09:00:00",
  "status": "SCHEDULED",
  "patient": {
    "id": 1
  },
  "createdAt": "2026-07-04T12:10:00"
}
```

## 12. Generate Alert

JWT required: Yes

Use this endpoint to generate a risk prediction alert response from submitted glucose and health values.

Method:

```text
POST
```

URL:

```text
{{baseUrl}}/api/alerts/risk-prediction
```

Request body:

```json
{
  "currentReading": 255,
  "measuredAt": "2026-07-04T23:15:00",
  "recentReadings": [190, 205, 255],
  "medicationAdherenceMissed": true,
  "hba1cResult": 8.2
}
```

Expected response:

```json
{
  "riskCategory": "MODERATE_RISK",
  "signals": [
    "Possible hyperglycemia",
    "Repeated abnormal readings",
    "Missed medication risk",
    "Elevated HbA1c result"
  ],
  "alertMessage": "Your reading is outside the normal range. Please follow your healthcare provider's advice or contact a medical professional."
}
```

## 13. View Report

JWT required: Yes

Patient health summary:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/health-summary
```

Glucose trend report:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/glucose-trend?startDate=2026-07-01&endDate=2026-07-31
```

Medication adherence report:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/medication-adherence
```

Appointment history:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/appointment-history
```

Risk alert history:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/risk-alert-history
```

Monthly progress report:

```text
GET {{baseUrl}}/api/reports/patient/{{patientId}}/monthly-progress?month=2026-07
```

Expected response example:

```json
{
  "reportName": "Patient Health Summary",
  "generatedAt": "2026-07-04T12:20:00",
  "patient": {
    "id": 1,
    "fullName": "Jean Uwimana",
    "email": "jean.uwimana@example.com",
    "phone": "+250788654321",
    "dateOfBirth": "1985-03-14"
  },
  "dataSource": "Database records only",
  "age": 41,
  "glucoseSummary": {
    "readingCount": 1,
    "averageMgDl": 142.0,
    "minimumMgDl": 142.0,
    "maximumMgDl": 142.0,
    "trend": "INSUFFICIENT_DATA"
  },
  "activeMedicationCount": 1,
  "riskAlertCount": 0
}
```

## Common Error Responses

Missing or invalid JWT:

```json
{
  "message": "Unauthorized"
}
```

Validation error:

```json
{
  "email": "Email should be valid"
}
```

Invalid credentials:

```json
{
  "message": "Invalid credentials"
}
```

Not found:

```json
{
  "message": "Patient not found with id: 999"
}
```
