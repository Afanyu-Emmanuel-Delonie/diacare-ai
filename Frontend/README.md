# AI-Driven Diabetes Monitoring and Healthcare Management System - Frontend

## Frontend Stack

- React.js
- Axios
- React Router DOM
- Tailwind CSS preferred, or plain CSS if necessary

## Backend Integration

- Backend API: Spring Boot 4.0.2
- Authentication: JWT
- Authorization: role-based access control
- Database: `Final_year_project_diabetes_monitoring_db`
- PostgreSQL username: `postgres`
- PostgreSQL password: `1234`

## Frontend Development Rules

1. Use clean, readable, and maintainable React code.
2. Keep the UI simple, professional, and suitable for an AUCA Software Engineering Final Year Project.
3. Use meaningful component, page, service, hook, and variable names.
4. Organize frontend code into scalable folders such as:
   - `components`
   - `pages`
   - `services`
   - `routes`
   - `context`
   - `hooks`
   - `utils`
   - `assets`
5. Use Axios services for backend API communication.
6. Store and attach JWT tokens securely for protected API requests.
7. Use React Router DOM for navigation and protected routes.
8. Implement role-based UI access for Admin, Doctor, Nurse, Patient, and Caregiver views.
9. Validate user inputs before submitting API requests.
10. Display secure, user-friendly error messages without exposing backend internals.
11. Avoid unnecessary comments, repeated logic, unused imports, and overly complex components.
12. Keep business workflows clear and easy to test with the Spring Boot backend.

## Backend Preparation Requirements

The frontend must integrate with a backend that follows:

- Java 23
- Spring Boot 4.0.2
- Maven
- PostgreSQL
- Spring Data JPA
- Hibernate ORM
- Spring Security
- JWT Authentication
- Lombok
- Postman API testing
- Package: `auca.ac.rw.diabetesmonitoring`

Required PostgreSQL configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/Final_year_project_diabetes_monitoring_db
spring.datasource.username=postgres
spring.datasource.password=1234
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## Implementation Note

No frontend source code has been generated yet. These rules must be followed before creating the React application.
