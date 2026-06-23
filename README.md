# SIMS - Student Information Management System

A modern, comprehensive Student Information Management System for Sri Lankan Advanced Level sections. The application is built using a modern full-stack web architecture and fully containerized with Docker.

## Technology Stack
- **Backend (Server)**: Java 17, Spring Boot, Hibernate/JPA, MySQL
- **Frontend (Client)**: React, Vite, Tailwind CSS, Recharts, TanStack Table
- **Infrastructure**: Docker, Docker Compose

## Project Structure
- `server`: Spring Boot REST API
- `frontend`: React SPA (single page application)
- `seed_data.py`: Automated Python seeder script that populates the database with realistic student demographics, O/L results, stream scores, and interview schedules.

---

## How to Run

The entire stack is containerized and orchestrates automatically using Docker Compose.

### Quick Start (Docker Compose)

1. **Start the application**:
   ```bash
   docker-compose up --build -d
   ```

2. **Access the application**:
   - Frontend Portal: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:8080](http://localhost:8080)

Docker compose spin-up includes an automatic seeding step that populates the database using `seed_data.py`.

---

## Local Development (Without Docker)

If you prefer to run the components independently for development:

### 1. Prerequisites
- **Java 17+** (JDK)
- **Node.js 20+**
- **MySQL Server 8.0+**
- **Python 3** (with `requests` library)

### 2. Backend Server
1. Configure database credentials in `server/src/main/resources/application.properties`.
2. Start the Spring Boot backend:
   ```bash
   ./gradlew :server:bootRun
   ```

### 3. Frontend Web App
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
3. Access at [http://localhost:5173](http://localhost:5173).

### 4. Seeding Data (Optional)
If running locally, you can populate the database with realistic mock data by running:
```bash
python seed_data.py
```
*(Make sure the backend server is running first!)*

---

## Core Features & Sub-modules
- **Dashboard**: High-level visual statistics on student registrations, stream allocations, gender distributions, and performance graphs.
- **Student Directory**: Complete student lists with advanced search, grade filtration, and status changes.
- **Register Student**: A 3-step wizard (Personal Info $\rightarrow$ O/L Results $\rightarrow$ A/L Stream selection) for registering new applicants.
- **Applications Hub**: Reviewing external admissions with approval and rejection workflows.
- **Interview Scheduler**: Interactive timeline with 10-minute slot increments and automated status updates.
- **Reports**: Generate, customize, and export PDF transcripts of students and streams.
- **Security & System Auditing**: Comprehensive API logging and built-in sliding-window rate limiter for public endpoints.