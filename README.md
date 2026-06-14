# TP - Base de Datos


## Profesor

Merlino Hernan Daniel

## Integrantes

- José Tissera - 112788
- Bruno - 112176
- Cristian Ariel Pared - 95194
- Jose Ignacio Adelardi - 111701
- Tomás Nahuel Bursztyn - 110965

## Sistema de Gestión de Reservas de Aulas Universitarias

### Descripción del Proyecto

Este trabajo práctico consiste en el desarrollo de un sistema para la gestión de reservas de aulas dentro de una institución universitaria.

El objetivo principal del proyecto es aplicar los conceptos estudiados en la materia **Base de Datos**, haciendo especial énfasis en:

- Diseño y modelado de bases de datos relacionales.
- Integridad de los datos.
- Restricciones y validaciones.
- Seguridad y control de acceso.
- Normalización.
- Gestión de transacciones.
- Buenas prácticas de diseño e implementación.
- Persistencia y consulta eficiente de la información.

La aplicación permite administrar reservas de aulas, garantizando la consistencia de los datos y evitando conflictos en la asignación de recursos.


## Cómo Ejecutar el Proyecto

### 1. Levantar los servicios con Docker

Desde la raíz del proyecto ejecutar:

```bash
docker compose up -d
```

---

### 2. Iniciar el Backend

```bash
cd backend
node server.js
```

---

### 3. Iniciar el Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

Tokens expire after 2 hours.

---

## Authentication Endpoints

### 1. Register (Create Teacher Account)
- **Endpoint:** `POST /auth/register`
- **Description:** Create a new teacher account
- **Authentication:** Not required
- **Body Request:**
  ```json
  {
    "name": "string",
    "email": "string (unique)",
    "password": "string"
  }
  ```
- **Body Response (201):**
  ```json
  {
    "success": true,
    "message": "Teacher account created successfully.",
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "teacher"
    }
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "Email is already registered."
  }
  ```

### 2. Login
- **Endpoint:** `POST /auth/login`
- **Description:** Login and get JWT token
- **Authentication:** Not required
- **Body Request:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Body Response (200):**
  ```json
  {
    "success": true,
    "token": "jwt_token_string",
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string",
      "role": "teacher|administrator"
    }
  }
  ```
- **Error Response (401):**
  ```json
  {
    "success": false,
    "error": "Invalid credentials."
  }
  ```

### 3. Get Current User Info
- **Endpoint:** `GET /auth/me`
- **Description:** Get authenticated user information
- **Authentication:** Required (teacher, administrator)
- **Query Params:** None
- **Path Params:** None
- **Body Response (200):**
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "email": "string",
      "role": "teacher|administrator"
    }
  }
  ```

---

## Reservation Endpoints

### 4. Create Reservation
- **Endpoint:** `POST /reservations`
- **Description:** Create a new classroom reservation
- **Authentication:** Required (teacher, administrator)
- **Body Request:**
  ```json
  {
    "classroomId": "integer",
    "subjectId": "integer",
    "userId": "integer",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM:SS",
    "endTime": "HH:MM:SS",
    "userEmail": "string",
    "classroomName": "string"
  }
  ```
- **Body Response (201):**
  ```json
  {
    "success": true,
    "message": "Reservation created successfully and consistently.",
    "reservationId": "integer"
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "Error message from validation or transaction"
  }
  ```

### 5. Update Reservation
- **Endpoint:** `PUT /reservations/:id`
- **Description:** Update an existing reservation
- **Authentication:** Required (teacher, administrator)
- **Path Params:** 
  - `id` (integer): Reservation ID
- **Body Request:**
  ```json
  {
    "classroomId": "integer",
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM:SS",
    "endTime": "HH:MM:SS",
    "userEmail": "string",
    "classroomName": "string"
  }
  ```
- **Body Response (200):**
  ```json
  {
    "success": true,
    "message": "Reservation updated successfully."
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "Error updating the reservation."
  }
  ```

### 6. Cancel Reservation
- **Endpoint:** `PATCH /reservations/:id/cancel`
- **Description:** Cancel an active reservation
- **Authentication:** Required (teacher, administrator)
- **Path Params:** 
  - `id` (integer): Reservation ID
- **Body Response (200):**
  ```json
  {
    "success": true,
    "message": "Reservation cancelled successfully."
  }
  ```
- **Error Response (403):**
  ```json
  {
    "success": false,
    "error": "Reservation not found, already cancelled, or you lack permissions to alter it."
  }
  ```

### 7. Get My Reservations
- **Endpoint:** `GET /reservations/my-reservations`
- **Description:** Get all reservations for the authenticated teacher
- **Authentication:** Required (teacher)
- **Query Params:** None
- **Body Response (200):**
  ```json
  [
    {
      "id": "integer",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM:SS",
      "end_time": "HH:MM:SS",
      "status": "active|cancelled",
      "classroom_name": "string",
      "classroom_location": "string",
      "subject_name": "string"
    }
  ]
  ```

### 8. Get All Reservations (Admin)
- **Endpoint:** `GET /reservations`
- **Description:** Get all reservations with optional filters (administrator only)
- **Authentication:** Required (administrator)
- **Query Params:** 
  - `date` (optional): Filter by date (YYYY-MM-DD)
  - `classroomId` (optional): Filter by classroom ID
- **Body Response (200):**
  ```json
  [
    {
      "id": "integer",
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM:SS",
      "end_time": "HH:MM:SS",
      "status": "active|cancelled",
      "classroom_name": "string",
      "subject_name": "string",
      "teacher_name": "string",
      "teacher_email": "string"
    }
  ]
  ```

---

## Classroom Endpoints

### 9. Get Available Classrooms
- **Endpoint:** `GET /classrooms/availability`
- **Description:** Get available classrooms for a specific time slot
- **Authentication:** Required (teacher, administrator)
- **Query Params:** 
  - `date` (required): Date (YYYY-MM-DD)
  - `startTime` (required): Start time (HH:MM:SS)
  - `endTime` (required): End time (HH:MM:SS)
- **Body Response (200):**
  ```json
  {
    "success": true,
    "availableClassrooms": [
      {
        "id": "integer",
        "name": "string",
        "capacity": "integer",
        "location": "string"
      }
    ]
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "Missing required query parameters (date, startTime, endTime)."
  }
  ```

### 10. Create Classroom
- **Endpoint:** `POST /classrooms`
- **Description:** Create a new classroom (administrator only)
- **Authentication:** Required (administrator)
- **Body Request:**
  ```json
  {
    "name": "string",
    "capacity": "integer",
    "location": "string"
  }
  ```
- **Body Response (201):**
  ```json
  {
    "success": true,
    "message": "Classroom created successfully by the administrator.",
    "classroom": {
      "id": "integer",
      "name": "string",
      "capacity": "integer",
      "location": "string"
    }
  }
  ```

### 11. Update Classroom
- **Endpoint:** `PUT /classrooms/:id`
- **Description:** Update classroom information (administrator only)
- **Authentication:** Required (administrator)
- **Path Params:** 
  - `id` (integer): Classroom ID
- **Body Request:**
  ```json
  {
    "name": "string",
    "capacity": "integer",
    "location": "string"
  }
  ```
- **Body Response (200):**
  ```json
  {
    "success": true,
    "message": "Classroom updated successfully by the administrator.",
    "classroom": {
      "id": "integer",
      "name": "string",
      "capacity": "integer",
      "location": "string"
    }
  }
  ```

### 12. Get All Classrooms
- **Endpoint:** `GET /classrooms`
- **Description:** Get list of all classrooms
- **Authentication:** Required (teacher, administrator)
- **Query Params:** None
- **Body Response (200):**
  ```json
  [
    {
      "id": "integer",
      "name": "string",
      "capacity": "integer",
      "location": "string"
    }
  ]
  ```

### 13. Delete Classroom
- **Endpoint:** `DELETE /classrooms/:id`
- **Description:** Delete a classroom (administrator only)
- **Authentication:** Required (administrator)
- **Path Params:** 
  - `id` (integer): Classroom ID
- **Body Response (200):**
  ```json
  {
    "success": true,
    "message": "Classroom \"name\" was deleted successfully by the administrator."
  }
  ```
- **Error Response (404):**
  ```json
  {
    "success": false,
    "error": "Classroom not found."
  }
  ```

---

## Subject Endpoints

### 14. Create Subject
- **Endpoint:** `POST /subjects`
- **Description:** Create a new subject (administrator only)
- **Authentication:** Required (administrator)
- **Body Request:**
  ```json
  {
    "name": "string (unique)"
  }
  ```
- **Body Response (201):**
  ```json
  {
    "success": true,
    "message": "Subject added to the master catalog.",
    "subject": {
      "id": "integer",
      "name": "string"
    }
  }
  ```
- **Error Response (400):**
  ```json
  {
    "success": false,
    "error": "A subject with this name already exists."
  }
  ```

### 15. Get All Subjects
- **Endpoint:** `GET /subjects`
- **Description:** Get list of all subjects
- **Authentication:** Required (teacher, administrator)
- **Query Params:** None
- **Body Response (200):**
  ```json
  [
    {
      "id": "integer",
      "name": "string"
    }
  ]
  ```

### 16. Get My Subjects (Teacher)
- **Endpoint:** `GET /subjects/my-subjects`
- **Description:** Get subjects assigned to the authenticated teacher
- **Authentication:** Required (teacher)
- **Query Params:** None
- **Body Response (200):**
  ```json
  [
    {
      "id": "integer",
      "name": "string"
    }
  ]
  ```

### 17. Update My Subjects (Teacher)
- **Endpoint:** `POST /subjects/my-subjects`
- **Description:** Update subject assignments for the authenticated teacher
- **Authentication:** Required (teacher)
- **Body Request:**
  ```json
  {
    "subjectIds": ["integer", "integer", ...]
  }
  ```
- **Body Response (200):**
  ```json
  {
    "success": true,
    "message": "Your subjects have been successfully synchronized."
  }
  ```
- **Error Response (500):**
  ```json
  {
    "success": false,
    "error": "Error synchronizing subjects. Transaction rolled back."
  }
  ```

---

## Admin Endpoints

### 18. Get Audit Logs
- **Endpoint:** `GET /admin/logs`
- **Description:** Get system audit logs with optional filters (administrator only)
- **Authentication:** Required (administrator)
- **Query Params:** 
  - `actionType` (optional): Filter by action type (CREATE, UPDATE, CANCEL)
  - `userEmail` (optional): Filter by user email (supports partial match)
  - `classroomName` (optional): Filter by classroom name (supports partial match)
  - `startDate` (optional): Filter by start date (YYYY-MM-DD or ISO format)
  - `endDate` (optional): Filter by end date (YYYY-MM-DD or ISO format)
- **Body Response (200):**
  ```json
  {
    "success": true,
    "resultsCount": "integer",
    "filtersApplied": ["string"],
    "logs": [
      {
        "actionType": "CREATE|UPDATE|CANCEL",
        "user": {
          "id": "integer",
          "email": "string"
        },
        "classroom": {
          "id": "integer",
          "name": "string"
        },
        "reservationDetails": {
          "reservationId": "integer",
          "reservationDate": "YYYY-MM-DD",
          "startTime": "HH:MM:SS",
          "endTime": "HH:MM:SS"
        },
        "operationDate": "ISO 8601 timestamp"
      }
    ]
  }
  ```

---

## System Endpoint

### 19. Health Check
- **Endpoint:** `GET /health`
- **Description:** Check system health and database connections
- **Authentication:** Not required
- **Body Response (200):**
  ```json
  {
    "postgres": "ok|error: message",
    "mongodb": "ok|disconnected|error: message"
  }
  ```

---

## Error Handling

All endpoints include a global error handler that manages different error types:

- **400 Bad Request:** Validation errors, duplicate entries, invalid parameters
- **401 Unauthorized:** Missing or invalid authentication token
- **403 Forbidden:** Insufficient permissions for the requested action
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server-side errors, database connection failures
- **503 Service Unavailable:** Database connection refused

### Error Response Format:
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (only in development mode)"
}
```