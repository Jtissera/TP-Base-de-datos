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