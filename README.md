# SIMS - Student Information Management System

A modern Student Information Management System for Sri Lankan Advanced Level sections.
Built as a **Client-Server Windows Application**.

## Technology Stack
- **Architecture**: Client-Server
- **Backend (Server)**: Java 25, Spring Boot 3.4, MySQL
- **Frontend (Client)**: Java 21+, JavaFX, AtlantaFX (Modern UI)
- **Build Tool**: Gradle (Multi-module)

## Project Structure
- `server`: Spring Boot REST API
- `client`: JavaFX Desktop Application

## Prerequisites
- Java 25 (or compatible JDK 21+)
- MySQL Server 8.0+

## How to Run

### 1. Database
Ensure MySQL is running. Create a database (default configuration expects `sims_db` typically, configure in `server/src/main/resources/application.properties`).

### 2. Server
Run the Spring Boot backend:
```bash
./gradlew :server:bootRun
```

### 3. Client
Run the Windows Desktop App:
```bash
./gradlew :client:run
```