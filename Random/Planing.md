# SIMS Implementation Plan

## Project: Student Information Management System — A/L Section

**Stack**: Spring Boot 3 (Java) + React 18 (TypeScript, Vite, shadcn/ui, Tailwind) + MySQL  
**UI Target**: Dark sidebar + clean white content area (Uber-style professional data application)  
**No hard-coding. No emojis.**

---

## Phase 1 — Critical Bug Fixes & Security Hardening

### Backend

**B1.1** — Remove `DataInitializer.java` entirely. Use `/api/auth/setup` endpoint on first run only.

**B1.2** — Externalize DB credentials:
- Create `server/src/main/resources/application-local.properties` (gitignored) with real credentials
- Replace hard-coded values in `application.properties` with placeholders:
  ```
  spring.datasource.username=${DB_USERNAME:root}
  spring.datasource.password=${DB_PASSWORD:}
  ```
- Add `application-local.properties` to `.gitignore`

**B1.3** — Create `UserDTO` (id, username, fullName, email, role — no password field).
- Use `UserDTO` in all user API responses (`UserController.getAllUsers`, `createUser`, `updateUser`)
- Stops leaking BCrypt hashes to the frontend

**B1.4** — Remove `@CrossOrigin(origins = "*")` from `StudentController.java` and `UserController.java`.
- CORS is already handled globally in `WebConfig.java` — individual annotations are redundant and inconsistent

**B1.5** — Fix `StudentService.importStudents()` response:
- Return a proper `ImportResultDTO { int successCount, int errorCount, List<String> errors }` object
- Track per-row failures with the row number and reason
- `StudentController.importStudents()` returns this as JSON (not a plain string)

**B1.6** — Fix `DashboardController.getStats()`:
- Add `recentStudents` (last 5 students by ID, as a list of `{id, admissionNumber, fullName, grade, stream}`)
- This removes the frontend need to fetch all students just for the dashboard

**B1.7** — Add `@PreAuthorize("hasRole('ADMIN')")` to all `UserController` endpoints.
- Enable method security with `@EnableMethodSecurity` in `SecurityConfig.java`

**B1.8** — Fix `StudentService.importCsv()` and `importExcel()`:
- Map all expected columns: `admissionNumber`, `fullName`, `dateOfBirth`, `gender`, `grade`, `stream`, `contactNumber`, `address`
- Not just positions 0-3 as currently coded

### Frontend

**F1.1** — Fix `ReportsPage.tsx` grade comparison (line ~78):
- Change `s.grade === Number(filterGrade)` to `s.grade === filterGrade`
- `grade` is a `String` on the backend, not a number

**F1.2** — Fix `useDashboard.ts`:
- Call `/api/dashboard/stats` for stats (which will now include `recentStudents`)
- Call `/api/dashboard/demographics` for chart data
- Remove the workaround that fetches all students client-side

**F1.3** — Update `frontendTasks.md` to mark all completed items (T4.1, T4.2, T4.3 and others that are done but unmarked)

---

## Phase 2 — Missing Data Models & Core Features

### Backend — Student Model Expansion

**B2.1** — Add fields to `Student` entity:
- `medium` — String enum: `SINHALA`, `TAMIL`, `ENGLISH`
- `parentName` — String
- `parentContactNumber` — String
- `alApplicationStatus` — String enum: `NOT_APPLIED`, `APPLIED`, `PENDING`

**B2.2** — Create `OLResult` entity:
```
Table: ol_results
  id           BIGINT PK
  student_id   BIGINT FK → students.id (CASCADE DELETE)
  subject      VARCHAR (enum: MATHEMATICS, PHYSICS, CHEMISTRY, BIOLOGY,
                              COMBINED_MATHS, COMMERCE, ACCOUNTING, ECONOMICS,
                              HISTORY, GEOGRAPHY, SINHALA, TAMIL, ENGLISH, ICT,
                              BUDDHISM, DRAMA, ART, MUSIC, AGRICULTURE, OTHER)
  grade        VARCHAR (enum: A, B, C, S, W)
  exam_year    INT
```

**B2.3** — Create `OLResultRepository` with `findByStudentId(Long studentId)`

**B2.4** — Create `OLResultController`:
- `GET /api/students/{id}/ol-results` — get all results for a student
- `POST /api/students/{id}/ol-results` — add a result
- `PUT /api/students/{id}/ol-results/{resultId}` — update a result
- `DELETE /api/students/{id}/ol-results/{resultId}` — delete a result

**B2.5** — Update `StudentController.getStudentById` to optionally include O/L results in the response (via a `?includeOL=true` query param or a separate endpoint)

**B2.6** — Create promotion endpoint:
- `POST /api/students/promote` — body: `{ studentIds: [1,2,3,...] }`
- Updates `grade` from `"12"` to `"13"` for all specified student IDs
- Returns `{ promoted: int, notFound: int, alreadyGrade13: int }`
- Restricted to ADMIN and CLERK roles

### Frontend — Student Form & Detail

**F2.1** — Add new fields to `StudentForm.tsx`:
- `medium` dropdown (Sinhala / Tamil / English)
- `parentName` text input
- `parentContactNumber` text input
- `alApplicationStatus` dropdown

**F2.2** — Update `StudentDetailPage.tsx`:
- Two-column layout: left card = personal info, right card = academic info
- Add section below: "O/L Results" — table with subject, grade, exam year columns
- Inline add/edit/delete for O/L result rows (no full-page form, modal or inline row editing)
- Hook: `useOLResults(studentId)` — fetches, creates, updates, deletes O/L results

**F2.3** — Update `StudentListPage.tsx` filter bar:
- Add medium filter dropdown
- Add A/L application status filter dropdown

**F2.4** — Add `useOLResults.ts` hook in `/src/hooks/`

**F2.5** — Build **Promotion Wizard** at `/promote` (`PromotionPage.tsx`):
- Step 1: Shows all Grade 12 students in a selectable DataTable. Select all or individually.
- Step 2: Review — shows count of selected students and names in a summary list
- Step 3: Confirm — calls `POST /api/students/promote`, shows result summary
- Route protected: Admin + Clerk only

**F2.6** — Add "Download CSV Template" button to `DataImportPage.tsx`:
- Generates and downloads a blank CSV with correct headers:
  `admissionNumber, fullName, dateOfBirth, gender, grade, stream, medium, contactNumber, address`

**F2.7** — Update `Sidebar.tsx` navigation to add Promotion Wizard entry (Admin + Clerk only)

---

## Phase 3 — UI Redesign (Dark Sidebar / Uber-Style)

### Design Token Changes

**F3.1** — Update `globals.css` CSS custom properties (`:root` and `.dark`):
- Sidebar uses `--sidebar-bg: #09090b` (zinc-950), `--sidebar-text: #fafafa`, `--sidebar-active: #27272a`
- Content area stays white/near-white
- Primary color: `#18181b` (zinc-900) for buttons
- Sharper border radius: cards `rounded-lg`, buttons `rounded-md`

### Component Redesigns

**F3.2** — `Sidebar.tsx`:
- Background: `bg-[#09090b]`
- Logo/wordmark at top: `SIMS` in bold white, small subtitle `A/L Management`
- Nav items: white text, `hover:bg-zinc-800`, active: `bg-zinc-800 text-white`
- User info at bottom: avatar with initials (dark background), role badge
- Collapse button: minimal icon only in collapsed state

**F3.3** — `LoginPage.tsx`:
- Two-panel layout: left panel dark (`bg-zinc-950`) with SIMS name, system description; right panel white with login form
- No card border on the form side — full-height layout
- Strong heading: `text-2xl font-bold` for "Sign in to SIMS"
- No shadow on inputs — clean flat style

**F3.4** — `Header.tsx`:
- White background, `border-b border-zinc-200`
- Slim height (`h-14`)
- Left: page breadcrumb
- Right: user name + role badge + logout icon button

**F3.5** — `StatCard.tsx`:
- Remove icon visual clutter — number-first layout
- Large bold number `text-3xl font-bold`
- Label below in `text-sm text-zinc-500`
- Left accent border by category (blue = total, green = grade 12, purple = grade 13, amber = new)
- No shadow — flat with `border border-zinc-200`

**F3.6** — `DataTable.tsx`:
- Row height `h-10` (tighter than default)
- Header: `text-xs font-semibold uppercase tracking-widest text-zinc-500`
- No alternating row backgrounds — single divider lines
- Actions column: text buttons instead of icon-only dropdown where space allows

**F3.7** — `StudentDetailPage.tsx` layout:
- Full-width header bar with name, admission number, stream badge, grade badge
- Two columns below: personal details left, academic details right
- O/L results as a clean inline table below both columns

**F3.8** — `DashboardPage.tsx`:
- Recharts tooltips: match card background and border
- Remove chart `<Legend>` component — replace with inline color-coded labels in card header
- Stat cards row uses `grid-cols-4` always (not responsive stack) for data density

**F3.9** — All stream/grade/status badges:
- Consistent sizing `px-2.5 py-0.5 text-xs font-medium rounded-full`
- Stream: Science=blue, Commerce=green, Arts=purple, Technology=orange
- Grade: 12=slate, 13=indigo
- A/L Status: Applied=green, Pending=amber, Not Applied=zinc

---

## Phase 5 — Internal / External Student Registration & AL Subject Selection

> **Context**: The school needs to distinguish between internal students (O/L done here, direct entry) and external students (O/L done elsewhere, require admin approval before they become full students). Registration now captures the full Sri Lankan O/L curriculum (6 compulsory + 3 optional) and strictly enforces A/L stream + subject combinations. The student form changes from a slide-in Sheet to a centered modal Dialog.

### Backend

**B5.1** — Expand `Student` entity with new fields:
- `studentType` — INTERNAL | EXTERNAL
- `registrationStatus` — ACTIVE | PENDING_APPROVAL | REJECTED
- `rejectionReason` — String (nullable)
- `nicNumber` — 12-digit Sri Lankan NIC (required)
- `whatsappNumber` — String (separate from contactNumber)
- Rename `stream` → `alStream` with new values: PHYSICAL_SCIENCE | BIOLOGICAL_SCIENCE | COMMERCE | TECHNOLOGY | ARTS
- `alSubjects` — `@ElementCollection` in `student_al_subjects` table (exactly 3 subjects per student)

**B5.2** — Update `StudentService`:
- `createStudent()` accepts inline `olResults[]` — saves student + OL results in one transaction
- INTERNAL → `registrationStatus = ACTIVE` automatically; EXTERNAL → `PENDING_APPROVAL`
- Add `approveStudent(id, admissionNumber)` — sets ACTIVE, assigns admission number, logs audit
- Add `rejectStudent(id, reason)` — sets REJECTED, stores reason, logs audit

**B5.3** — New endpoints in `StudentController`:
- `POST /api/students/{id}/approve` — body `{ admissionNumber }` — ADMIN only
- `POST /api/students/{id}/reject` — body `{ reason }` — ADMIN only
- `GET /api/students` gains `?status=` and `?studentType=` filter params

**B5.4** — `DashboardController.getStats()`: add `pendingApplications` count to response.

### Frontend

**F5.1** — New TypeScript types: `StudentType`, `RegistrationStatus`, `ALStream` (replaces `Stream`), `alSubjects: string[]`, `nicNumber`, `whatsappNumber` added to `Student` and `StudentFormData`.

**F5.2** — New constants file `lib/alSubjects.ts`:
- `OL_COMPULSORY_SUBJECTS` — 6 compulsory with variants (Mother Tongue, Religion)
- `OL_CATEGORY_A/B/C` — optional subject lists per category
- `AL_MANDATORY` — mandatory subjects per AL stream
- `AL_THIRD_OPTIONS` — selectable 3rd subjects per stream (strictly enforced)

**F5.3** — Replace `Sheet` → `Dialog` for student add/edit in `StudentListPage.tsx` and `StudentDetailPage.tsx`.

**F5.4** — New `StudentRegistrationDialog.tsx` — 3-step modal:
- Step 1: Student Type toggle (Internal | External) + identity + personal info
- Step 2: O/L Results — 6 compulsory subjects (fixed, grade required) + 3 optional (one from each category A/B/C, subject + grade)
- Step 3: A/L Stream card selector → mandatory subjects auto-filled → 3rd subject dropdown from strict allowed list

**F5.5** — Update Zod validators: NIC 12-digit regex, alSubjects cross-field validation against allowed combinations per stream.

**F5.6** — New `ApplicationsPage.tsx` at `/applications` (ADMIN only):
- Tabs: All | Pending | Rejected
- Table: Name, NIC, Medium, AL Stream, O/L Exam Year, Status
- "Approve" action → small dialog asking for Admission Number
- "Reject" action → small dialog asking for Reason
- Approved students disappear from list; rejected stay with reason visible

**F5.7** — `StudentListPage.tsx`: default filter `?status=ACTIVE` only; add Internal/External type badge per row.

**F5.8** — `Sidebar.tsx`: add "Applications" nav item (ADMIN only) with pending count badge.

**F5.9** — Update all stream badge maps and color constants across `StudentListPage`, `StudentDetailPage`, `DashboardPage`, `PromotionPage`, `ReportsPage` for new stream names.

**F5.10** — Dashboard: add "Pending Applications" stat card (amber) using `pendingApplications` from stats API.

---

## Phase 4 — Advanced Features, Reporting & Polish

### PDF Export

**B4.1** — Add `itext7` dependency to `build.gradle.kts`

**B4.2** — Create `PdfReportService.java`:
- `generateStudentListPdf(List<Student> students)` — returns `byte[]`
- Formatted table: school name header, generation date, columns (Adm. No, Name, Grade, Stream, Medium)
- One method per report type: all students, by grade, by stream

**B4.3** — Add PDF endpoint to `StudentController`:
- `GET /api/students/export/pdf?grade=&stream=` — returns `application/pdf` with `Content-Disposition: attachment`

**F4.1** — Add "Export as PDF" button to `ReportsPage.tsx` alongside the existing CSV button

### Audit Log

**B4.4** — Create `AuditLog` entity:
```
Table: audit_logs
  id           BIGINT PK
  user_id      BIGINT (who)
  username     VARCHAR (denormalized for history)
  action       VARCHAR (CREATED, UPDATED, DELETED, LOGIN, LOGOUT)
  entity_type  VARCHAR (STUDENT, USER)
  entity_id    BIGINT
  detail       VARCHAR (brief description)
  created_at   TIMESTAMP
```

**B4.5** — Create `AuditService.java` with `log(action, entityType, entityId, detail)` method
- Called from `StudentController` on create/update/delete
- Called from `AuthController` on login/logout

**B4.6** — Create `AuditController`:
- `GET /api/audit?page=0&size=20` — paginated, admin only
- Returns list of audit log entries newest-first

**F4.2** — Build `AuditLogPage.tsx` at `/audit`:
- Admin-only route, sidebar entry
- DataTable with columns: timestamp, user, action, entity type, detail
- Date range filter

### O/L Analytics

**F4.3** — Add "O/L Performance" section to `DashboardPage.tsx`:
- Bar chart: X = subject, Y = count of students, grouped bars by grade (A/B/C/S/W)
- Data from a new endpoint `GET /api/dashboard/ol-summary`

**B4.7** — Create `GET /api/dashboard/ol-summary` in `DashboardController`:
- Returns subject-wise grade distribution from `ol_results` table

### Import Improvements

**F4.4** — Add column validation on `DataImportPage.tsx` before preview step:
- Check that uploaded CSV has at minimum `admissionNumber` and `fullName` columns
- Show a clear error if required columns are missing (not a generic toast)

### Final Polish

**F4.5** — `NotFoundPage.tsx`: replace hard-coded `/` link with `useNavigate(-1)` back button

**F4.6** — Full responsive pass: test all pages at 768px, fix any overflow or broken layout

**F4.7** — Update `frontendTasks.md` and `Planing.md` to reflect final completed state

---

## Files to Be Modified / Created

### Backend (server/)
| Action | File |
|--------|------|
| DELETE | `src/main/java/com/sims/server/config/DataInitializer.java` |
| MODIFY | `src/main/resources/application.properties` |
| CREATE | `src/main/resources/application-local.properties` (gitignored) |
| MODIFY | `src/main/java/com/sims/server/config/SecurityConfig.java` |
| MODIFY | `src/main/java/com/sims/server/model/Student.java` |
| CREATE | `src/main/java/com/sims/server/model/OLResult.java` |
| CREATE | `src/main/java/com/sims/server/model/AuditLog.java` |
| CREATE | `src/main/java/com/sims/server/dto/UserDTO.java` |
| CREATE | `src/main/java/com/sims/server/dto/ImportResultDTO.java` |
| MODIFY | `src/main/java/com/sims/server/controller/UserController.java` |
| MODIFY | `src/main/java/com/sims/server/controller/StudentController.java` |
| MODIFY | `src/main/java/com/sims/server/controller/DashboardController.java` |
| CREATE | `src/main/java/com/sims/server/controller/OLResultController.java` |
| CREATE | `src/main/java/com/sims/server/controller/AuditController.java` |
| MODIFY | `src/main/java/com/sims/server/service/StudentService.java` |
| CREATE | `src/main/java/com/sims/server/service/AuditService.java` |
| CREATE | `src/main/java/com/sims/server/service/PdfReportService.java` |
| CREATE | `src/main/java/com/sims/server/repository/OLResultRepository.java` |
| CREATE | `src/main/java/com/sims/server/repository/AuditLogRepository.java` |
| MODIFY | `build.gradle.kts` |

### Frontend (frontend/src/)
| Action | File |
|--------|------|
| MODIFY | `globals.css` |
| MODIFY | `components/layout/Sidebar.tsx` |
| MODIFY | `components/layout/Header.tsx` |
| MODIFY | `components/shared/StatCard.tsx` |
| MODIFY | `components/shared/DataTable.tsx` |
| MODIFY | `components/forms/StudentForm.tsx` |
| MODIFY | `pages/LoginPage.tsx` |
| MODIFY | `pages/DashboardPage.tsx` |
| MODIFY | `pages/StudentListPage.tsx` |
| MODIFY | `pages/students/StudentDetailPage.tsx` |
| MODIFY | `pages/DataImportPage.tsx` |
| MODIFY | `pages/ReportsPage.tsx` |
| MODIFY | `pages/NotFoundPage.tsx` |
| CREATE | `pages/PromotionPage.tsx` |
| CREATE | `pages/AuditLogPage.tsx` |
| MODIFY | `hooks/useDashboard.ts` |
| CREATE | `hooks/useOLResults.ts` |
| MODIFY | `App.tsx` (add new routes) |
| MODIFY | `types/student.ts` (add new fields) |

---

## Verification

After each phase, the following checks apply:

**Phase 1**: Start backend, login, verify admin password change persists across restart; verify `/api/students/export` does not leak user passwords; verify dashboard loads without fetching all students

**Phase 2**: Add a student with medium + parent info, verify saved; add O/L results on detail page; run promotion wizard for 2-3 Grade 12 students, verify they become Grade 13

**Phase 3**: Visual inspection at 1280px and 768px; confirm dark sidebar renders correctly in both light and dark OS modes; confirm no emojis in UI

**Phase 4**: Generate PDF report, verify it downloads and is readable; create/update/delete a student, verify audit log entry appears; upload a CSV missing required columns, verify correct error message
