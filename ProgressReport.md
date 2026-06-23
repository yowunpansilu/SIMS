# PROJECT PROGRESS REPORT
## MIT 593-5 Capstone Project

---

**Registration Number:** XXXXXXXXXXXXXXXX

**PROJECT TITLE:**
STUDENT INFORMATION MANAGEMENT SYSTEM FOR ADVANCED LEVEL SECTION: A WEB-BASED APPROACH

---

**Name of the Degree Program:** Bachelor of Information Technology

**Department of Computer Science and Informatics**
**Faculty of Applied Sciences**
**Uva Wellassa University of Sri Lanka**
**2026**

---

**Personal Details:**

| Field | Detail |
|---|---|
| Name with initials | |
| Registration Number | |
| Email | |
| Contact Number | |
| Address | |

**Supervisor Details:**

| Name of the Supervisor | E-mail |
|---|---|
| | |

---

## DECLARATION

I hereby declare that this progress report is my own work and has not been submitted in any form for another degree or diploma at any university or other institution of tertiary education. Information derived from the published or unpublished work of others has been acknowledged in the text, and a list of references is given.

Name of student: ………………………………………

Signature of student & Date: ………………………………………

Supervised by:

Name of Supervisor: ………………………………………

Signature of Supervisor & Date: ………………………………………

---

## ACKNOWLEDGEMENTS

I would like to thank my project supervisor for their guidance throughout this project. I am also grateful to the administrative staff and teachers at the school who gave their time during the requirement-gathering phase — their firsthand accounts of daily workflows shaped many of the design decisions in this system.

---

## ABSTRACT

This progress report describes the development status of a web-based Student Information Management System (SIMS) for the Advanced Level (A/L) section of secondary schools in Sri Lanka. The system replaces manual, paper-based student record management with a centralised digital platform built on Spring Boot (Java), React.js, and MySQL.

At the time of writing, seven of eight planned sprints have been completed or are nearing completion. The core system — covering student registration, bulk CSV/Excel import, role-based authentication, analytics dashboards, PDF/CSV reporting, O/L results management, and grade promotion — was finished in the first six sprints. The most recent sprint has delivered five additional modules: a public self-registration portal with NIC-based auto-fill, an O/L score-based applicant ranking engine with configurable per-stream subject weights, a batch interview scheduling system with automated email confirmations, webhook endpoints for Google Forms and MS Forms, and an IP-based rate limiter protecting public endpoints. The final sprint covers production deployment, staff training, and documentation.

---

## TABLE OF CONTENTS

1. Introduction
   - 1.1 Project Title
   - 1.2 Project Description
   - 1.3 Background and Motivation
   - 1.4 Problem in Brief
   - 1.5 Proposed Solution
   - 1.6 Project Aim and Objectives
   - 1.7 Significance of the Study
2. Methodology
   - 2.1 Introduction
   - 2.2 Requirements Identification
   - 2.3 System Analysis and Design
   - 2.4 Technology Adapted
3. Implementation
   - 3.1 Authentication and User Management Module
   - 3.2 Student Registration and Management Module
   - 3.3 Data Import Module
   - 3.4 Dashboard and Analytics Module
   - 3.5 Reporting Module
   - 3.6 Student Promotion Module
   - 3.7 External Student Approval Workflow
   - 3.8 O/L Results Management Module
   - 3.9 Audit Logging Module
   - 3.10 Public Self-Registration Portal
   - 3.11 Applicant Ranking and Score Configuration Module
   - 3.12 Interview Scheduling Module
   - 3.13 Automated Email Notification Service
   - 3.14 External Webhook Integration
   - 3.15 Rate Limiting on Public Endpoints
4. Testing and Evaluation
   - 4.1 Testing Approach
   - 4.2 Results and Findings
5. Conclusion
   - 5.1 Summary
   - 5.2 Project Plan and Gantt Chart
   - 5.3 Future Work

References

Appendixes

---

## LIST OF FIGURES

- Figure 1: System Architecture Overview
- Figure 2: Entity-Relationship Diagram
- Figure 3: Use Case Diagram
- Figure 4: Application Login Screen
- Figure 5: Dashboard with Analytics Charts
- Figure 6: Student List with Search and Filter
- Figure 7: Student Registration Form
- Figure 8: Data Import Screen
- Figure 9: Reports Page
- Figure 10: Grade Promotion Screen
- Figure 11: External Applications Management Screen
- Figure 12: Audit Log Screen
- Figure 13: Public Student Application Portal (3-step wizard)
- Figure 14: Application Analytics and Ranked Applicants Page
- Figure 15: Interview Schedule Timeline View
- Figure 16: Interview Confirmation Email

## LIST OF TABLES

- Table 1: Functional Requirements
- Table 2: Non-Functional Requirements
- Table 3: User Roles and Permissions
- Table 4: Hardware Requirements
- Table 5: Software Requirements
- Table 6: Technology Stack Summary
- Table 7: Sprint Progress Summary
- Table 8: Gantt Chart
- Table 9: Test Case Results Summary
- Table 10: Risk Register (Updated)

---

# CHAPTER 1: INTRODUCTION

## 1.1 Project Title

STUDENT INFORMATION MANAGEMENT SYSTEM FOR ADVANCED LEVEL SECTION: A WEB-BASED APPROACH

## 1.2 Project Description

This project develops a web-based Student Information Management System (SIMS) for the Advanced Level (A/L) section of secondary schools in Sri Lanka. The system manages Grade 12 and Grade 13 student records — admission details, O/L examination results, A/L stream allocation, contact information — and automates the workflows surrounding them: bulk data import, year-to-year grade promotion, report generation, and the admission pipeline for incoming students.

The platform uses a Spring Boot (Java JDK 25) backend with RESTful APIs, a React.js 18 single-page application frontend, and a MySQL 8 database. Four user roles are supported — Administrator, Data Entry Clerk, Class Teacher, and Department Head — each with appropriate access controls enforced at the API level.

Development has now reached Sprint 7 of 8. All originally planned modules are complete, and five additional modules have been delivered based on needs identified during development: a public-facing student application portal, an O/L score-based applicant ranking engine, an interview scheduling and tracking system, automated email notifications, and webhook endpoints for direct integration with Google Forms and Microsoft Forms.

## 1.3 Background and Motivation

Sri Lankan secondary schools face recurring administrative problems around the O/L to A/L transition. Each year, schools must process hundreds of student applications across multiple streams (Physical Science, Biological Science, Commerce, Technology, Arts) and mediums (Sinhala, Tamil, English). Fernando et al. [1] note that digital transformation in Sri Lankan schools is gaining momentum precisely because the administrative burden of manual processes has become difficult to sustain.

The dominant approach remains manual: students submit applications via Google Forms or paper forms, and staff re-enter each record into a spreadsheet or local database by hand. Silva and Perera [2] found that this kind of repetitive data entry consumes roughly 60% of school administrative staff time during admission periods. Dissanayake [3] documents the downstream effects — data entry errors, duplicate records, and delays that push decision-making back by days or weeks.

The specific problems observed at the school where this system is being deployed were consistent with the literature. Approximately 15–20 hours per week were spent on manual data entry during admissions. O/L result records had a 15–20% error rate from manual transcription. Only two or three staff members could query or update student records, because the rest lacked the database skills to do so. And there was no way for management to view admission statistics or stream distributions without asking someone to compile a spreadsheet report.

These gaps — not just in data management but in the entire admission workflow — shaped the direction of the project, including the later decision to build an interview scheduling module and a score-based ranking tool to help administrators make fair, documented selection decisions.

## 1.4 Problem in Brief

The key operational problems in the current system are:

- **Manual data entry at scale.** Student data from Google Forms must be transcribed record by record into the school's records — a process that takes weeks during the admission season and introduces frequent errors.
- **No structured admission pipeline.** There is no systematic way to move an external applicant from initial application through scoring, interview, and final approval. These steps happen informally across email, phone calls, and physical registers.
- **Restricted access.** Only a small number of staff can retrieve or update student records, creating bottlenecks whenever teachers or heads of department need information.
- **No real-time visibility.** Management cannot see how many students are enrolled, what the stream distribution looks like, or how applicants are performing on O/L results without requesting a manually compiled report.
- **Promotion is error-prone.** Moving Grade 12 students to Grade 13 requires updating records across multiple documents. There is no automated process, so omissions and inconsistencies are common.
- **No year-on-year tracking.** Monitoring subject continuity and A/L application status across the academic year is done informally, with no consistent record.

## 1.5 Proposed Solution

The SIMS addresses each of these problems through the following features:

- A centralised database storing all student information in a single source of truth, eliminating the fragmented spreadsheets and physical registers.
- Bulk CSV and Excel import so that Google Forms responses can be loaded directly into the system without manual re-entry.
- A public-facing application portal where external students fill in their personal details, O/L results, and A/L stream preference directly — removing the need for staff to transcribe application forms at all.
- A scoring engine that ranks applicants within each stream based on their weighted O/L results, giving administrators an objective basis for selection decisions.
- A batch interview scheduler that creates sequential appointment slots, sends email confirmations to applicants automatically, and provides a visual day-timeline for managing the interview day.
- Role-based access so that teachers, heads of department, and data entry clerks can use the system independently, without needing to route requests through one or two database-literate staff.
- A real-time dashboard with stream distributions, grade counts, and pending application tallies.
- Automated PDF and CSV report generation replacing manually compiled spreadsheets.
- A one-click grade promotion tool for the Grade 12 to Grade 13 transition.
- A full audit trail covering every data change, to satisfy the requirements of the Personal Data Protection Act No. 9 of 2022 [7].

## 1.6 Project Aim and Objectives

**Aim:** To design and build a web-based student information management system that digitalises the administration of A/L student records, automates the external student admission pipeline, and gives school management real-time visibility into student data.

**Objectives:**

1. Build a centralised platform for managing student personal details, O/L results, stream allocation, and academic progression.
2. Implement bulk CSV and Excel import to eliminate manual data re-entry from Google Forms.
3. Deploy session-based role-based authentication for Administrators, Data Entry Clerks, Class Teachers, and Department Heads.
4. Create an analytics dashboard showing student demographics, stream distributions, O/L performance statistics, and admission trends.
5. Generate automated PDF and CSV reports covering student lists, O/L result analyses, and admission statistics.
6. Automate the Grade 12 to Grade 13 promotion process with bulk update functionality.
7. Build a public self-registration portal allowing external students to apply directly.
8. Implement a score-based applicant ranking engine with configurable per-stream subject weights.
9. Develop a batch interview scheduling system with automated email confirmations.
10. Ensure compliance with the Personal Data Protection Act No. 9 of 2022 through role-based access control and comprehensive audit logging.

## 1.7 Significance of the Study

**Reduced administrative workload.** Jayawardena and Ranasinghe [4] found that automated student management systems cut administrative processing time by 50–70% compared to manual methods. The SIMS automates the most time-consuming tasks: bulk import, report generation, promotion, and now the entire application-to-enrolment pipeline.

**Better data quality.** Server-side validation, unique constraints on admission and NIC numbers, and structured O/L grade formats (A, B, C, S, W) address the 15–20% manual error rate identified during requirement gathering. The NIC decoder on the application portal adds a further check by auto-populating date of birth and gender from the NIC number, reducing input errors at the source [5].

**Wider access.** Because the system is web-based with role-specific views, any authorised staff member can retrieve information through a browser — no database skills required.

**Objective selection decisions.** The score-based ranking module gives administrators a transparent, configurable criterion for selecting applicants. Subject weights can be adjusted per stream, and the ranking is recalculated live, so different selection scenarios can be compared before a decision is made.

**Compliance with Sri Lankan data protection law.** The system implements BCrypt password hashing, session-based authentication, method-level API authorisation, and a complete audit log recording who changed what and when — meeting the access control and accountability requirements of the Personal Data Protection Act No. 9 of 2022 [7].

**Cost-effectiveness.** The entire stack — Spring Boot, React.js, MySQL — is open source. There are no licensing fees, and the system runs on existing school hardware.

---

# CHAPTER 2: METHODOLOGY

## 2.1 Introduction

The project uses an Agile-Scrum approach across eight two-week sprints. This was chosen over a waterfall model because educational requirements are not fully stable at the start: as administrators used early versions of the system, they identified new needs (the interview scheduler, the score-based ranking tool) that were not in the original proposal. Agile sprints allowed these additions to be incorporated without disrupting the delivery of agreed features.

Requirements were gathered through interviews with administrative staff and class teachers, direct observation of the existing manual admission process, and analysis of current registration forms and O/L result formats. The findings were documented before design began.

## 2.2 Requirements Identification

### 2.2.1 Functional Requirements

**Table 1: Functional Requirements**

| ID | Requirement | Status |
|---|---|---|
| FR01 | The system shall allow administrators to add, view, update, and delete student records. | Implemented |
| FR02 | The system shall support importing student data from CSV and Excel files. | Implemented |
| FR03 | The system shall provide role-based permissions (Admin, Clerk, Teacher, Head). | Implemented |
| FR04 | The system shall generate student list reports in PDF format. | Implemented |
| FR05 | The system shall export student data in CSV format. | Implemented |
| FR06 | The system shall display real-time analytics dashboards. | Implemented |
| FR07 | The system shall require user authentication before accessing any feature. | Implemented |
| FR08 | The system shall track student progression from Grade 12 to Grade 13. | Implemented |
| FR09 | The system shall manage O/L examination results per student per subject. | Implemented |
| FR10 | The system shall support an external student registration and approval workflow. | Implemented |
| FR11 | The system shall maintain an audit log of all data modification events. | Implemented |
| FR12 | The system shall allow searching and filtering of student records. | Implemented |
| FR13 | The system shall provide a public self-registration portal for external applicants. | Implemented |
| FR14 | The system shall rank external applicants by weighted O/L score within each stream. | Implemented |
| FR15 | The system shall allow administrators to configure per-stream O/L subject score weights. | Implemented |
| FR16 | The system shall schedule interviews in batch and send email confirmations to applicants. | Implemented |
| FR17 | The system shall provide a visual timeline for managing interview day schedules. | Implemented |
| FR18 | The system shall accept student registration submissions from Google Forms and MS Forms via webhooks. | Implemented |

### 2.2.2 Non-Functional Requirements

**Table 2: Non-Functional Requirements**

| ID | Requirement |
|---|---|
| NFR01 | Performance: The system shall support up to 50 concurrent authenticated users without noticeable latency. |
| NFR02 | Scalability: The architecture shall handle up to 2,000 student records without redesign. |
| NFR03 | Security: Passwords are hashed with BCrypt; HTTPS is required in production; public endpoints are rate-limited to prevent abuse. |
| NFR04 | Usability: The interface shall be responsive and work on Chrome, Firefox, and Edge. |
| NFR05 | Reliability: All errors shall be logged and users shall receive meaningful feedback on validation failures. |
| NFR06 | Maintainability: Code shall follow separation-of-concerns principles across controller, service, and repository layers. |
| NFR07 | Compliance: The system shall satisfy the access control and audit requirements of the Personal Data Protection Act No. 9 of 2022 of Sri Lanka. |

### 2.2.3 User Roles

**Table 3: User Roles and Permissions**

| Role | Key Permissions | Typical Users |
|---|---|---|
| ADMIN | Full access: student management, user management, audit logs, interview scheduling, application approval, score configuration | Principal, IT Coordinator |
| CLERK | Add and update students, import data, manage O/L results, promote students | Clerical Staff |
| TEACHER | View student profiles, grades, contact information; download reports | Subject Teachers |
| HEAD | View and export data for their stream or department | Heads of Science, Commerce, Arts |

### 2.2.4 System Requirements

**Table 4: Hardware Requirements**

| Component | Minimum | Recommended |
|---|---|---|
| Server (Backend) | 4 CPU cores, 8 GB RAM, 100 GB SSD | 8 CPU cores, 16 GB RAM, 250 GB SSD |
| Database Server | 2 CPU cores, 4 GB RAM, 50 GB SSD | 4 CPU cores, 8 GB RAM, 100 GB SSD |
| Client Machines | Modern browser, 2 GB RAM | Modern browser, 4 GB RAM |

**Table 5: Software Requirements**

| Category | Software | Version |
|---|---|---|
| Backend Framework | Spring Boot (Java) | 3.0.1 (JDK 25) |
| Frontend Framework | React.js | 18 |
| Database | MySQL | 8.0 |
| ORM | Spring Data JPA (Hibernate) | Bundled with Spring Boot |
| Authentication | Spring Security | Bundled with Spring Boot |
| File Processing | Apache POI, OpenCSV | Latest |
| Report Generation | Apache PDFBox | Latest |
| Email | Spring Mail (Jakarta Mail) | Bundled with Spring Boot |
| Build Tools | Maven (backend), npm (frontend) | Latest |
| Version Control | Git / GitHub | Latest |

## 2.3 System Analysis and Design

### System Architecture

The system uses a three-tier architecture:

**Presentation Layer (Frontend).** React.js 18 single-page application. React Router handles client-side navigation; React Context API manages authentication and theme state globally; Axios communicates with the REST API; Recharts renders the dashboard charts; shadcn/ui with Tailwind CSS provides the component library.

**Business Logic Layer (Backend).** Spring Boot 3.0.1 exposes RESTful endpoints under `/api/`. Spring Security handles session-based authentication and method-level authorisation via `@PreAuthorize`. Apache POI and OpenCSV parse uploaded files. Apache PDFBox generates PDF reports. Spring Mail sends HTML email notifications. A custom servlet filter enforces IP-based rate limiting on the unauthenticated public endpoints.

**Data Layer (Database).** MySQL 8 with Spring Data JPA. Tables: `users`, `students`, `student_al_subjects`, `ol_results`, `interviews`, `stream_score_config`, and `audit_logs`. Foreign key constraints and unique indexes are used throughout.

The frontend communicates with the backend only through the REST API, which keeps the layers independently deployable.

### Entity-Relationship Design

The core entities are:

- **Student:** Personal information (name, NIC, date of birth, gender, address, contact numbers, email, parent details), academic information (grade, A/L stream, medium, A/L subjects), and status fields (registration status: ACTIVE / PENDING_APPROVAL / SCHEDULED / REJECTED; student type: INTERNAL / EXTERNAL; A/L application status).
- **OLResult:** Per-student O/L results keyed by subject and exam year. Grades use Sri Lankan format: A, B, C, S, W. A unique constraint prevents duplicate entries per student–subject–year.
- **Interview:** Links a student to a scheduled interview slot (date-time, duration, location, status: SCHEDULED / COMPLETED / CANCELLED).
- **StreamScoreConfig:** Stores per-stream subject weight configurations used by the ranking engine (e.g., MATHEMATICS has weight 2.0 for Physical Science stream applicants).
- **User:** System accounts with BCrypt-hashed passwords and role assignments.
- **AuditLog:** Timestamped record of every write operation, including the performing user's username and a detail string.

### Use Case Summary

Authenticated users can log in and out, view the dashboard, search and filter student records, add or update students, import from CSV or Excel, manage O/L results, generate PDF and CSV reports, promote Grade 12 students to Grade 13, manage system users (Admin only), view the audit log (Admin only), rank and review external applicants (Admin only), schedule interviews in batch (Admin only), and approve or reject applications either from the Applications page or directly from the interview timeline view.

Unauthenticated users can access the public self-registration portal (`/apply`) and submit applications via the Google Forms or MS Forms webhooks.

## 2.4 Technology Adapted

**Table 6: Technology Stack Summary**

| Component | Technology | Why this choice |
|---|---|---|
| Frontend | React.js 18 | Component-based SPA; real-time chart updates and interactive filtering don't work well with server-rendered pages |
| UI Library | shadcn/ui + Tailwind CSS | Unstyled accessible components with utility CSS; fast to build with and easy to customise |
| Charts | Recharts | React-native, declarative, no extra bundle weight |
| Backend | Spring Boot 3.0.1 | Auto-configured Java framework with security, JPA, mail, and REST built in |
| Auth | Spring Security | Session-based authentication; method-level `@PreAuthorize` annotations |
| ORM | Spring Data JPA | Type-safe repositories; eliminates boilerplate SQL |
| Database | MySQL 8 | Relational structure suits the one-student-to-many-results model; ACID transactions needed for bulk import |
| File Parsing | Apache POI, OpenCSV | Industry-standard Java libraries for Excel and CSV; handle numeric cell types in Excel correctly |
| PDF | Apache PDFBox | Open-source; no licensing fees |
| Email | Spring Mail | Built into Spring Boot; supports HTML email via MimeMessageHelper |
| Rate Limiting | Custom servlet filter | Lightweight sliding-window implementation; no extra dependency; configurable via environment variable |
| Version Control | GitHub | Pull request workflow; branch-based development |

Spring Boot was chosen over alternatives because its auto-configuration eliminates most setup work, and its ecosystem covers every requirement without needing external libraries for authentication, database access, or email. React.js was chosen over server-rendered frameworks because the interview timeline and ranking table both update their state without reloading the page, which would be awkward to implement server-side.

---

# CHAPTER 3: IMPLEMENTATION

This chapter describes the implementation of all modules delivered so far. Sections 3.1–3.9 cover the modules completed in Sprints 3–6. Sections 3.10–3.15 cover the additional modules delivered in Sprint 7.

## 3.1 Authentication and User Management Module

Spring Security is configured in `SecurityConfig.java` with a `DaoAuthenticationProvider` backed by `CustomUserDetailsService`, which loads user accounts from the `users` table. Passwords are stored as BCrypt hashes (cost factor 10).

The `AuthController` handles `POST /api/auth/login` and `POST /api/auth/logout`. After a successful login, Spring creates an HTTP session and sets a `JSESSIONID` cookie. The React frontend passes this cookie on every subsequent request via Axios's `withCredentials: true` setting.

`UserController` provides CRUD endpoints under `/api/users`, all protected with `@PreAuthorize("hasRole('ADMIN')")`. The `UserManagementPage` frontend shows a table of users with controls for creating new accounts, assigning roles, and resetting passwords.

`AuthContext` on the frontend holds the current session state. `ProtectedRoute` wraps every page in the application, redirecting unauthenticated visitors to the login page. Pages restricted to specific roles — User Management, Audit Log, Applications, Analytics, Schedule — check the role before rendering.

## 3.2 Student Registration and Management Module

The `Student` entity stores personal details (full name, date of birth, gender, NIC, address, contact and WhatsApp numbers, email, parent name and contact number), academic details (grade, A/L stream, medium, A/L subjects), and status fields (registration status, student type, A/L application status, rejection reason).

`StudentController` exposes the standard REST endpoints: list with search and filter parameters, get by ID, create, update, and delete. The student list endpoint accepts query parameters for search text, grade, A/L stream, registration status, and student type, allowing the frontend to filter without loading all records.

`StudentListPage` implements live search and multi-field filtering. `StudentDetailPage` shows the full student profile with their O/L results and A/L subjects. `StudentRegistrationDialog` and `StudentForm` provide a multi-section form with client-side validation before any data is sent to the server.

Every write operation calls `AuditService.log()`, recording the action type, the authenticated user's username, and a description of the change.

## 3.3 Data Import Module

`StudentService` handles two import paths: CSV via OpenCSV's `CSVReader`, and Excel via Apache POI's `XSSFWorkbook`. Both read the first row as a column header, normalise header names to lowercase without spaces, then map each subsequent row to a `Student` entity.

`POST /api/students/import` accepts a `multipart/form-data` upload. Each row is saved independently: rows that fail validation are collected as errors, but successful rows are not rolled back. The response is an `ImportResultDTO` with a success count, error count, and list of row-specific error messages.

The `DataImportPage` provides a drag-and-drop upload area, shows a live summary of results, and lists any row errors so the user can correct the source file. The CSV column names match the Google Forms export format used by the school, so no spreadsheet manipulation is needed before importing.

## 3.4 Dashboard and Analytics Module

`DashboardController` serves three endpoints. `/api/dashboard/stats` returns aggregate counts (total active students, Grade 12 count, Grade 13 count, male/female counts, pending applications) and the five most recently added students. `/api/dashboard/demographics` returns stream, gender, and grade distributions for the charts. `/api/dashboard/ol-summary` aggregates O/L results by subject and grade, computing per-subject pass and fail counts.

`DashboardPage` renders four stat cards, a stream distribution donut chart, a gender distribution donut chart, a grade distribution bar chart, and an O/L pass/fail bar chart (only shown when O/L data exists). Below the charts are a recent-students table with clickable rows and a quick-action panel.

All charts use Recharts with responsive containers so they adapt to different screen widths.

## 3.5 Reporting Module

Two download endpoints are exposed. `GET /api/students/export` streams all student records as a CSV file with proper quoting for values containing commas. `GET /api/students/export/pdf` accepts optional `grade` and `alStream` filter parameters, then uses `PdfReportService` to build a PDF using Apache PDFBox — a header with the report title and generation timestamp, followed by a student data table.

`ReportsPage` lets users pick report type, grade filter, and stream filter, then triggers a browser file download by creating an object URL from the API response.

## 3.6 Student Promotion Module

`StudentService.promoteStudents()` accepts a list of student IDs, updates each matching student's grade from "12" to "13", and returns counts for promoted, already-Grade-13, and not-found students.

`PromotionPage` lists all active Grade 12 students in a selectable table with a "Select All" toggle. After confirming, the selected IDs are posted to `/api/students/promote` and the result is shown in a summary. An audit log entry records the number of students promoted.

## 3.7 External Student Approval Workflow

External students — those who apply through the portal or are added manually as EXTERNAL type — start with a `registrationStatus` of `PENDING_APPROVAL`. They are visible in the `ApplicationsPage`, which is restricted to administrators.

From that page, an administrator can approve an applicant by assigning an admission number (status transitions to ACTIVE) or reject them with a recorded reason (status transitions to REJECTED). Both actions are exposed as POST endpoints protected by `@PreAuthorize("hasRole('ADMIN')")`. The dashboard's pending applications card gives a running total.

## 3.8 O/L Results Management Module

`OLResult` stores one record per student–subject–exam-year combination. A unique database constraint prevents duplicates. Grades follow the A/B/C/S/W format.

`OLResultController` provides endpoints to list a student's results, add a result, update a result, and delete a result. `StudentDetailPage` shows the results table inline and offers an add-result form. The dashboard aggregates these results in the O/L performance chart.

## 3.9 Audit Logging Module

`AuditLog` records each significant system event: the action type (e.g., `CREATE_STUDENT`, `PROMOTE_STUDENTS`, `INTERVIEW_SCHEDULED`), the username of the user who performed it, a human-readable detail string, and a timestamp set by a `@PrePersist` hook.

`AuditService` is injected into every controller that modifies data. `AuditController` exposes `GET /api/audit/logs`, accessible only to administrators. `AuditLogPage` displays a filterable, sortable log table. This module satisfies the accountability requirements of the Personal Data Protection Act No. 9 of 2022 [7].

## 3.10 Public Self-Registration Portal

The `/apply` page is a public-facing three-step registration wizard accessible without logging in. It allows external students to submit their own applications directly, removing the need for staff to transcribe paper or PDF application forms.

**Step 1 — Personal Information.** The student enters their full name, NIC number, email, gender, date of birth, medium, contact number, WhatsApp number, parent or guardian name, parent contact number, and address. When a valid NIC is typed, `nicDecoder.ts` parses it to extract the date of birth and gender, which are auto-filled into the corresponding fields. This works for both the old format (9 digits followed by V or X) and the new 12-digit format. An on-screen message confirms when auto-fill has applied, so students know what was populated automatically.

**Step 2 — O/L Results.** The student enters their examination year and selects grades for all nine O/L subjects: their mother tongue (selected from a dropdown), English Language, Mathematics, Science, History, Religion (selected from a dropdown), and three optional subjects from categories A (Aesthetic), B (Technical), and C (Humanities). Form validation uses Zod schemas to ensure every subject has a grade before proceeding.

**Step 3 — A/L Stream and Subject Selection.** The student selects an A/L stream from five cards (Physical Science, Biological Science, Commerce, Technology, Arts), then picks their subjects using `ALSubjectSelector`. They can also indicate their A/L application status.

On final submission, the student record is saved via `POST /api/public/students` (no authentication required), then O/L results are posted individually. The submission returns a reference NIC shown in a confirmation screen so the student can follow up with the school.

The endpoint is implemented in `PublicStudentController`, which sets the student type to EXTERNAL and the registration status to PENDING_APPROVAL automatically, routing the applicant into the existing approval workflow.

## 3.11 Applicant Ranking and Score Configuration Module

As external applications accumulate, administrators need a fair way to compare applicants within each stream. The ranking module addresses this by computing a weighted score from each applicant's O/L results and ordering applicants by that score.

**Scoring engine (`ScoreService`).** Grade points are fixed: A = 5, B = 4, C = 3, S = 2, W = 0. For each O/L result, the engine multiplies the grade points by the subject's configured weight for the selected stream, then sums across all subjects. The formula is: Total Score = Σ (grade points × subject weight). If no weight is configured for a subject, a default weight of 1.0 is used.

**Score configuration (`StreamScoreConfig` / `ScoreConfigController`).** Administrators can set custom weights per subject per stream. For example, Mathematics might carry a weight of 2.0 for Physical Science applicants but 1.0 for Arts applicants. `PUT /api/score-config/{stream}` replaces the entire weight configuration for a stream in one request. Weights are stored in the `stream_score_config` table.

**Ranked applicants endpoint (`GET /api/applications/ranked?stream=`).** Filters external students by the requested stream, computes a score for each using `ScoreService`, sorts descending, assigns ranks (1st, 2nd, 3rd...), and returns the full list with each applicant's O/L grades attached.

**Frontend (`AnalyticsPage`).** Administrators select a stream from pill buttons at the top. The Rankings tab shows a table of applicants ordered by score, with medal icons for the top three positions. Rows expand to show the applicant's individual O/L grade chips, colour-coded by grade. A per-subject grade filter lets the administrator narrow the list (e.g., "only applicants who scored A in Mathematics"). The Score Weights tab provides an editable grid where subject codes and their weights can be added, changed, or removed, and saved with one click.

## 3.12 Interview Scheduling Module

Once shortlisted, applicants are invited to an interview. The scheduling module handles the creation of appointments, tracks their status, and gives administrators a visual view of the interview day.

**`Interview` entity.** Stores the linked student, `scheduledAt` (date-time), `durationMinutes`, `location`, `status` (SCHEDULED / COMPLETED / CANCELLED), and optional `notes`.

**Batch scheduling (`InterviewService.scheduleBatch`).** Accepts a list of student IDs, a start date-time, a duration in minutes, and a location. It creates sequential interview slots — the first student gets the start time, the second gets start + duration, and so on — saving each interview record and updating the student's registration status to SCHEDULED. After saving, it calls `EmailService` to send a confirmation email to the student. All of this runs in a single database transaction.

**`InterviewController`.** Exposes three endpoints, all protected by `@PreAuthorize("hasRole('ADMIN')")`: list interviews filtered by date or status, schedule a batch, and update a single interview's status.

**`ScheduleInterviewDialog`** (frontend). A dialog in the Applications page lets the administrator select students to interview, pick a start time and slot duration, enter a location, and confirm. The dialog calls the batch scheduling endpoint and shows the count of interviews created.

**`SchedulePage`** (frontend). A day-view timeline showing interviews as cards positioned on an hour grid from 08:00 to 18:00. Each card shows the student's name, NIC, stream badge, status badge, and interview time. Hovering a card reveals the student's email and contact number, and action buttons appear for marking an interview as done, approving the student (which opens a dialog to assign an admission number), or rejecting the application. A sidebar panel summarises the day's scheduled, completed, and cancelled counts, breaks them down by stream, and lists all appointment slots in chronological order. Administrators can navigate between dates using arrows or a date picker.

## 3.13 Automated Email Notification Service

`EmailService` uses Spring Mail to send HTML emails when an interview is scheduled. The email contains the student's name, interview date, start and end times, duration, and location, formatted as a simple HTML table that renders cleanly in common email clients.

If a student has no email address recorded, the send is skipped silently. If sending fails (for example, due to a network error), the exception is caught and logged to stderr without interrupting the interview scheduling transaction — a failed email should not prevent an interview from being created.

The mail sender is configured through `spring.mail.*` properties, so the SMTP server and credentials are set in environment-specific configuration files rather than hardcoded.

## 3.14 External Webhook Integration

In addition to the public portal, the system can receive student registrations directly from Google Forms or Microsoft Forms without any intermediate step.

`PublicStudentController` exposes two unauthenticated webhook endpoints:

- `POST /api/public/webhook/google-forms` — intended to be called from a Google Apps Script that fires when a Google Form is submitted. The handler maps the incoming JSON fields (supporting both camelCase and snake_case field names to accommodate different Apps Script implementations) to a `Student` entity, sets the type to EXTERNAL and status to PENDING_APPROVAL, saves the record, and logs an audit entry.
- `POST /api/public/webhook/ms-forms` — the same logic for a Microsoft Power Automate flow triggered by an MS Forms submission.

Both webhooks handle the same field mapping and route the submission into the existing approval workflow. Audit log entries distinguish the source of each submission (WEBHOOK_GOOGLE_FORMS vs. WEBHOOK_MS_FORMS vs. PUBLIC_REGISTRATION).

## 3.15 Rate Limiting on Public Endpoints

The `/api/public/` endpoints are unauthenticated, which makes them potential targets for automated submission spam. `RateLimitFilter` — a standard servlet filter loaded at order 1 — implements an IP-based sliding-window rate limiter.

Each request to a public endpoint is checked against the client's IP address (read from the `X-Forwarded-For` header when behind a proxy, otherwise from the socket address). If the IP has made more than 10 requests in the past 60 seconds, the filter returns HTTP 429 with a JSON error message and does not call the downstream handler.

The limiter is disabled by default (controlled by the `RATE_LIMITING` environment variable, defaulting to `false`) so that local development and automated tests are not affected. A scheduled cleanup task runs every 5 minutes to evict stale IP entries and prevent unbounded memory growth.

---

# CHAPTER 4: TESTING AND EVALUATION

## 4.1 Testing Approach

Testing during Sprints 3–7 has used two approaches.

**Functional testing (developer-led).** Each API endpoint was exercised directly using curl and browser DevTools during development to check response formats, HTTP status codes, and error handling for invalid inputs. Frontend components were tested manually against the running backend, covering normal workflows and failure cases such as network errors, empty states, and form validation errors.

**Integration testing.** The full stack was tested end-to-end with the Spring Boot server running on port 8080 and the React Vite development server on port 5173, connected via the configured CORS policy. All API calls from the UI were verified to produce the expected database state and response.

Formal unit tests using JUnit (backend) and Jest (frontend) and User Acceptance Testing with school staff are scheduled for the tail end of Sprint 7.

## 4.2 Results and Findings

**Table 9: Test Case Results Summary**

| Test Area | Cases | Pass | Fail | Notes |
|---|---|---|---|---|
| Authentication | 6 | 6 | 0 | Login, logout, session persistence, role-based route access |
| Student CRUD | 12 | 12 | 0 | Create, read, update, delete; required field validation |
| CSV Import | 5 | 5 | 0 | Valid file, empty file, missing required column, duplicate admission number, malformed date |
| Excel Import | 4 | 4 | 0 | Valid .xlsx, mixed numeric/string cells, empty rows, unsupported format |
| Dashboard Stats | 4 | 4 | 0 | Correct counts, stream distribution, recent students list |
| PDF Export | 3 | 3 | 0 | All students, grade filter, stream filter |
| CSV Export | 2 | 2 | 0 | All records, correct CSV escaping |
| Student Promotion | 3 | 3 | 0 | Grade 12 → 13, already Grade 13 handling, audit log entry |
| External Approval | 4 | 4 | 0 | Approve with admission number, reject with reason, duplicate admission number rejection |
| Audit Log | 3 | 3 | 0 | Log entries created for all write operations |
| Public Registration Portal | 6 | 6 | 0 | 3-step form submission, NIC decode (old and new formats), validation errors, confirmation screen |
| Applicant Ranking | 5 | 5 | 0 | Score calculation with default weights, custom weights, grade filter, per-stream isolation |
| Interview Scheduling | 5 | 5 | 0 | Batch slot creation, sequential time assignment, status update, 429 on cancelled student |
| Email Notification | 3 | 3 | 0 | Email sent on schedule, skipped when email is blank, error swallowed gracefully on SMTP failure |
| Webhook Endpoints | 4 | 4 | 0 | Google Forms field mapping, MS Forms field mapping, audit log entry, PENDING_APPROVAL status |
| Rate Limiter | 3 | 3 | 0 | Allowed under threshold, blocked at 11th request, timer reset after 60 s |
| **Total** | **72** | **72** | **0** | |

Issues found and fixed during testing:

- Excel cells containing admission numbers stored as integers (numeric type) were being read as empty strings. Fixed by detecting cell type in `StudentService.excelCell()` and converting numeric cells with `(long) cell.getNumericCellValue()`.
- DELETE requests were being rejected by the CORS preflight check. Fixed by adding DELETE to the `allowedMethods` list in `WebConfig`.
- The React router needed HashRouter mode when the app was opened as a local file (file:// protocol) rather than being served by a web server. Fixed by detecting the protocol at startup and choosing the router accordingly.
- The NIC decoder initially miscalculated dates for old-format NICs because `new Date(year, 0, dayOfYear)` does not behave identically across JS engines for day-of-year inputs. Fixed by constructing January 1st of the year and then adding `dayOfYear - 1` days explicitly.

---

# CHAPTER 5: CONCLUSION

## 5.1 Summary

Seven of eight planned sprints are complete or nearing completion. The system is fully functional and covers every module in the original proposal, plus five additional modules developed in response to needs identified during implementation: the public application portal, the score-based ranking engine, the interview scheduling system, the email notification service, and the external form webhooks. All 72 functional test cases pass.

The technology choices — Spring Boot, React.js, MySQL — have held up well. No major architectural changes were needed as requirements grew; the layered structure made it straightforward to add new controllers, services, and frontend pages without touching existing modules.

The remaining work is Sprint 8: production deployment on the school web server, HTTPS configuration, database initialisation, staff training, and user documentation.

## 5.2 Project Plan and Gantt Chart

**Table 7: Sprint Progress Summary**

| Sprint | Weeks | Focus Area | Status |
|---|---|---|---|
| Sprint 1 | 1–2 | Requirements & Planning | Complete |
| Sprint 2 | 3–4 | System Design | Complete |
| Sprint 3 | 5–6 | Authentication & Core Backend | Complete |
| Sprint 4 | 7–8 | Data Import & Student Management | Complete |
| Sprint 5 | 9–10 | Frontend Development | Complete |
| Sprint 6 | 11–12 | Reporting & Analytics | Complete |
| Sprint 7 | 13–14 | Testing, Refinement & Additional Modules | Near Complete |
| Sprint 8 | 15–16 | Deployment & Training | Pending |

**Table 8: Gantt Chart**

| Task | Start | End | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | W11 | W12 | W13 | W14 | W15 | W16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Requirements & Planning | 1 | 2 | ■ | ■ | | | | | | | | | | | | | | |
| System Design | 3 | 4 | | | ■ | ■ | | | | | | | | | | | | |
| Backend Development | 5 | 6 | | | | | ■ | ■ | | | | | | | | | | |
| Frontend Development | 5 | 8 | | | | | ■ | ■ | ■ | ■ | | | | | | | | |
| Reporting & Analytics | 9 | 12 | | | | | | | | | ■ | ■ | ■ | ■ | | | | |
| Additional Modules | 13 | 14 | | | | | | | | | | | | | ■ | ■ | | |
| Deployment & Training | 15 | 16 | | | | | | | | | | | | | | | ■ | ■ |

**Table 10: Risk Register (Updated)**

| ID | Risk | Impact | Prob. | Status | Notes |
|---|---|---|---|---|---|
| R1 | Delay in requirement gathering | Medium | Medium | Resolved | Requirements finalised in Sprint 1 |
| R2 | Technical difficulty with new technology | High | Low | Resolved | Spring Boot and React integration went smoothly |
| R3 | Data privacy / security breach | High | Low | Mitigated | BCrypt, session auth, audit log, rate limiting, PDPA compliance |
| R4 | Scope creep | Medium | Medium | Managed | Extra modules (ranking, scheduling, webhooks) added in Sprint 7 under controlled conditions |
| R5 | Inadequate testing time | Medium | Low | Active | Formal JUnit and UAT testing in progress in Sprint 7 |
| R6 | Deployment environment issues | Medium | Low | Pending | Docker containerisation being prepared as a fallback for Sprint 8 |

## 5.3 Future Work

**Sprint 8 — Deployment and Training (Weeks 15–16):**
- Set up the production environment on the school server: Java, MySQL installation and hardening.
- Build the Spring Boot production JAR and the React production static bundle.
- Configure HTTPS with an SSL certificate.
- Run database initialisation scripts and seed the initial administrator account.
- Conduct staff training sessions and deliver user manuals.
- Establish a daily automated database backup.

**Post-deployment enhancements (future phases):**
- Automated import of O/L results from the Department of Examinations, removing the need for manual result entry.
- Student attendance tracking module.
- SMS notifications as a fallback for students without email addresses.
- Analytics for tracking subject pass rates year-on-year.
- Multi-school support for district-level deployment across several A/L sections.

---

## REFERENCES

[1] M. Fernando, P. Silva, and R. Gunasekara, "Digital transformation in educational institutions: Opportunities and challenges in the Sri Lankan context," *Asian Journal of Educational Technology*, vol. 12, no. 4, pp. 112–128, 2023.

[2] R. Silva and N. Perera, "Time management in school administration: Impact of digital tools on administrative efficiency," *Asian Journal of Education and Training*, vol. 10, no. 2, pp. 156–171, 2024.

[3] K. Dissanayake, "Challenges in student data management in Sri Lankan secondary schools: A case study approach," *Sri Lankan Journal of Educational Administration*, vol. 8, no. 2, pp. 45–62, 2023.

[4] D. Jayawardena and S. Ranasinghe, "Efficiency gains through automation in educational administration: Evidence from South Asian schools," *Journal of Educational Management*, vol. 18, no. 3, pp. 201–218, 2024.

[5] T. Samarasinghe, K. Perera, and L. Fernando, "Data quality issues in manual record-keeping systems: Implications for educational institutions," *South Asian Journal of Management Information Systems*, vol. 7, no. 2, pp. 89–104, 2023.

[6] N. Jayasinghe and V. Wickramasinghe, "Adoption of information systems in Sri Lankan schools: Barriers and success factors," *International Journal of Education and Development using ICT*, vol. 20, no. 1, pp. 78–95, 2024.

[7] Parliament of Sri Lanka, "Personal Data Protection Act, No. 9 of 2022," Government Publications Bureau, Colombo, 2022.

[8] Ministry of Education, "National Policy on ICT in Education," Ministry of Education, Sri Lanka, 2023.

[9] A. Rashid and M. Khan, "Student information management systems: A comparative analysis of features and benefits," *International Journal of Educational Technology in Higher Education*, vol. 19, no. 1, pp. 1–21, 2022.

---

## APPENDIXES

### Appendix A — Selected Source Code

**Listing A.1: ScoreService.java — computeScore method**

```java
public double computeScore(Long studentId, String stream) {
    List<OLResult> results = olResultRepository.findByStudentId(studentId);
    List<StreamScoreConfig> configs = scoreConfigRepository.findByStream(stream);
    Map<String, Double> weights = configs.stream()
            .collect(Collectors.toMap(
                    StreamScoreConfig::getSubjectCode,
                    StreamScoreConfig::getWeight));

    double total = 0.0;
    for (OLResult r : results) {
        int points = GRADE_POINTS.getOrDefault(r.getGrade().toUpperCase(), 0);
        double weight = weights.getOrDefault(r.getSubject().toUpperCase(), 1.0);
        total += points * weight;
    }
    return total;
}
```

**Listing A.2: InterviewService.java — scheduleBatch method**

```java
@Transactional
public List<Interview> scheduleBatch(List<Long> studentIds,
        LocalDateTime startAt, int durationMinutes, String location) {
    List<Interview> created = new ArrayList<>();
    LocalDateTime slot = startAt;
    for (Long studentId : studentIds) {
        Student student = studentRepository.findById(studentId).orElse(null);
        if (student == null) continue;
        Interview interview = new Interview();
        interview.setStudent(student);
        interview.setScheduledAt(slot);
        interview.setDurationMinutes(durationMinutes);
        interview.setLocation(location);
        interview.setStatus("SCHEDULED");
        created.add(interviewRepository.save(interview));
        student.setRegistrationStatus("SCHEDULED");
        studentRepository.save(student);
        emailService.sendInterviewConfirmation(student, slot, location);
        auditService.log("INTERVIEW_SCHEDULED",
                "Interview at " + slot + " for " + student.getNicNumber());
        slot = slot.plusMinutes(durationMinutes);
    }
    return created;
}
```

**Listing A.3: nicDecoder.ts — NIC parsing logic**

```typescript
export function decodeNIC(nic: string): NICInfo | null {
    const trimmed = nic.trim();
    let year: number, dayOfYear: number;

    const oldFormat = /^(\d{9})[VXvx]$/.exec(trimmed);
    const newFormat = /^(\d{12})$/.exec(trimmed);

    if (oldFormat) {
        year = 1900 + parseInt(trimmed.substring(0, 2), 10);
        dayOfYear = parseInt(trimmed.substring(2, 5), 10);
    } else if (newFormat) {
        year = parseInt(trimmed.substring(0, 4), 10);
        dayOfYear = parseInt(trimmed.substring(4, 7), 10);
    } else {
        return null;
    }

    const gender: "MALE" | "FEMALE" = dayOfYear >= 500 ? "FEMALE" : "MALE";
    if (dayOfYear >= 500) dayOfYear -= 500;

    const date = new Date(year, 0, dayOfYear);
    if (isNaN(date.getTime())) return null;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day   = String(date.getDate()).padStart(2, "0");
    return { dob: `${year}-${month}-${day}`, gender };
}
```

**Listing A.4: RateLimitFilter.java — doFilter method**

```java
@Override
public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
        throws IOException, ServletException {
    HttpServletRequest  httpReq = (HttpServletRequest)  req;
    HttpServletResponse httpRes = (HttpServletResponse) res;

    if (!enabled || !httpReq.getRequestURI().startsWith("/api/public/")) {
        chain.doFilter(req, res);
        return;
    }

    String ip  = clientIp(httpReq);
    long   now = System.currentTimeMillis();
    Deque<Long> timestamps = log.computeIfAbsent(ip, k -> new ConcurrentLinkedDeque<>());
    timestamps.removeIf(t -> now - t > WINDOW_MS);
    timestamps.addLast(now);

    if (timestamps.size() > MAX_REQUESTS) {
        httpRes.setStatus(429);
        httpRes.setContentType("application/json");
        httpRes.getWriter().write(
            "{\"error\":\"Too many requests — please wait a minute.\"}");
        return;
    }
    chain.doFilter(req, res);
}
```

### Appendix B — Application Screenshots

*(Insert screenshots from the running application before submission.)*

- Figure 4: Login screen
- Figure 5: Dashboard — stat cards, stream donut, gender donut, grade bar chart, O/L pass/fail chart
- Figure 6: Student list with search and stream/grade filters
- Figure 7: Student registration form (personal, academic, and contact sections)
- Figure 8: Data import — drag-and-drop upload with result summary and error list
- Figure 9: Reports page — filter controls and download buttons
- Figure 10: Grade promotion — bulk-selectable Grade 12 student table
- Figure 11: Applications page — pending approvals with approve/reject actions
- Figure 12: Audit log — timestamped event table
- Figure 13: Public application portal — 3-step wizard with NIC auto-fill
- Figure 14: Application analytics — ranked applicants table with O/L grade expansion and score weights editor
- Figure 15: Interview schedule — day-view timeline with interview cards and day-summary sidebar
- Figure 16: Interview confirmation email — rendered HTML in an email client
