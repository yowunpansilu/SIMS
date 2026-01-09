# Student Information Management System (SIMS) for Advanced Level Section

A web-based student information management system specifically designed for the Advanced Level (A/L) section of secondary schools in Sri Lanka. The system streamlines student admission, data management, academic record keeping, and reporting for Grade 12 and Grade 13 students.

## 🚀 Key Features

*   **Centralized Student Data**: Unified platform for personal details, O/L results, stream allocation, and contact info.
*   **Automated Data Import**: Bulk import student data from CSV/Excel files (e.g., from Google Forms).
*   **Role-Based Access Control**: Secure access for Administrators, Data Entry Clerks, Class Teachers, and Department Heads.
*   **Real-Time Analytics**: Interactive dashboards for demographics, stream distributions, and performance analysis.
*   **Comprehensive Reporting**: Generate PDF/Excel reports for student lists, admission statistics, and O/L results.
*   **Year-to-Year Tracking**: Systematic tracking of student progression from Grade 12 to Grade 13.
*   **Data Security**: Compliance with local data protection regulations.

## 🛠 Technology Stack

*   **Frontend**: React.js 18.1.1
*   **Backend**: Spring Boot 3.0.1 (Java JDK 25)
*   **Database**: MySQL 8.0.1
*   **Build Tools**: Maven (Backend), npm (Frontend)
*   **Reporting**: JasperReports / Apache PDFBox

## 📋 Prerequisites

To run this project, you will need:
*   **Java**: OpenJDK 25
*   **Node.js**: v18.2.1
*   **MySQL**: v8.0.1

## 👥 User Roles

1.  **Administrator**: Full access to all modules, users, and system settings.
2.  **Data Entry Clerk**: Responsible for data entry, bulk imports, and maintaining records.
3.  **Class Teacher**: View student information and generate reports for assigned classes.
4.  **Department Head**: Oversee stream/medium performance and access department-specific analytics.

## 📥 Installation & Setup

### 1. Database Configuration
Ensure MySQL is running and create the required database schema. Update the backend `application.properties` file with your database credentials.

### 2. Backend (Spring Boot)
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```