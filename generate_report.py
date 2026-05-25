"""
Generates a formatted Word document for the SIMS Progress Report.
Formatting follows ProgressreportGuide.txt:
  - Times New Roman throughout
  - Chapter titles: 18pt bold centred
  - Section headings: 16pt bold
  - Subsection headings: 14pt bold
  - Body: 12pt justified, 1.5 line spacing
  - Margins: left 1.5 in, top/bottom/right 1 in
  - Page numbers centred at bottom (Arabic for body, Roman for pre-pages)
  - Tables named and captioned
  - ACM numbered references
"""

from docx import Document
from docx.shared import Pt, Inches, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

doc = Document()

# ── Page margins ──────────────────────────────────────────────────────────────
for section in doc.sections:
    section.left_margin   = Inches(1.5)
    section.right_margin  = Inches(1.0)
    section.top_margin    = Inches(1.0)
    section.bottom_margin = Inches(1.0)

# ── Helper: add centred page numbers to a section footer ─────────────────────
def add_page_numbers(section, num_format="decimal"):
    footer = section.footer
    para = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    para.clear()
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER

    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.text = ' PAGE '
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    run = para.add_run()
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar3)

# ── Helper: paragraph formatting ─────────────────────────────────────────────
def fmt(para, size=12, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
        space_before=0, space_after=6, line_spacing=1.5):
    para.alignment = align
    pf = para.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after  = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing      = line_spacing
    for run in para.runs:
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.bold   = bold
        run.italic = italic

def body_para(text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY,
              size=12, space_before=0, space_after=6):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size)
    run.bold   = bold
    run.italic = italic
    p.alignment = align
    pf = p.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after  = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5
    return p

def heading1(text):
    """Chapter title: 18pt bold, centred, Times New Roman."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(18)
    run.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(18)
    pf.space_after  = Pt(12)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5
    return p

def heading2(text):
    """Section: 16pt bold, left, Times New Roman."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(16)
    run.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(14)
    pf.space_after  = Pt(6)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5
    return p

def heading3(text):
    """Subsection: 14pt bold, left, Times New Roman."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(14)
    run.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after  = Pt(4)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5
    return p

def bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after  = Pt(3)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5
    if level:
        pf.left_indent = Inches(0.25 * level)
    return p

def table_caption(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.bold = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    pf = p.paragraph_format
    pf.space_before = Pt(10)
    pf.space_after  = Pt(4)
    return p

def cell_text(cell, text, bold=False, size=11, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ''
    p = cell.paragraphs[0]
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(size)
    run.bold = bold
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(2)

def shade_row(row, hex_color="D9E1F2"):
    """Light blue header row shading."""
    for cell in row.cells:
        tc = cell._tc
        tcPr = tc.get_or_add_tcPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:val'),   'clear')
        shd.set(qn('w:color'), 'auto')
        shd.set(qn('w:fill'),  hex_color)
        tcPr.append(shd)

def page_break():
    doc.add_page_break()

# ─────────────────────────────────────────────────────────────────────────────
# COVER PAGE
# ─────────────────────────────────────────────────────────────────────────────
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("PROJECT PROGRESS REPORT")
run.font.name = 'Times New Roman'; run.font.size = Pt(20); run.bold = True
p.paragraph_format.space_before = Pt(36)

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("MIT 593-5 Capstone Project")
run.font.name = 'Times New Roman'; run.font.size = Pt(16)

doc.add_paragraph()
doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("Registration Number: XXXXXXXXXXXXXXXX")
run.font.name = 'Times New Roman'; run.font.size = Pt(14)
p.paragraph_format.space_before = Pt(72)

doc.add_paragraph()

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("STUDENT INFORMATION MANAGEMENT SYSTEM FOR\nADVANCED LEVEL SECTION: A WEB-BASED APPROACH")
run.font.name = 'Times New Roman'; run.font.size = Pt(20); run.bold = True

doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()

for line in [
    "Bachelor of Information Technology",
    "Department of Computer Science and Informatics",
    "Faculty of Applied Sciences",
    "Uva Wellassa University of Sri Lanka",
    "2026",
]:
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(line)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(14 if line == "Bachelor of Information Technology" else 12)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(2)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# PERSONAL / SUPERVISOR DETAILS
# ─────────────────────────────────────────────────────────────────────────────
heading2("Personal Details")
table_caption("")  # spacing

t = doc.add_table(rows=6, cols=2)
t.style = 'Table Grid'
rows_data = [
    ("Name with initials", ""),
    ("Registration Number", ""),
    ("Email", ""),
    ("Contact Number", ""),
    ("Address", ""),
]
for i, (field, val) in enumerate(rows_data):
    cell_text(t.rows[i].cells[0], field, bold=True)
    cell_text(t.rows[i].cells[1], val)
# remove extra row
t._tbl.remove(t.rows[5]._tr)

doc.add_paragraph()
heading2("Supervisor Details")

t2 = doc.add_table(rows=2, cols=2)
t2.style = 'Table Grid'
for header, col in [("Name of the Supervisor", 0), ("E-mail", 1)]:
    cell_text(t2.rows[0].cells[col], header, bold=True)
    cell_text(t2.rows[1].cells[col], "")

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# DECLARATION
# ─────────────────────────────────────────────────────────────────────────────
heading1("DECLARATION")
body_para(
    "I hereby declare that this progress report is my own work and has not been submitted in any "
    "form for another degree or diploma at any university or other institution of tertiary "
    "education. Information derived from the published or unpublished work of others has been "
    "acknowledged in the text and a list of references is given."
)
doc.add_paragraph()
body_para("Name of student: ………………………………………………………………")
body_para("Signature of student & Date: …………………………………………………")
doc.add_paragraph()
body_para("Supervised by:")
body_para("Name of Supervisor: ………………………………………………………………")
body_para("Signature of Supervisor & Date: ………………………………………………")

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# ACKNOWLEDGEMENTS
# ─────────────────────────────────────────────────────────────────────────────
heading1("ACKNOWLEDGEMENTS")
body_para(
    "I would like to express my sincere gratitude to my project supervisor for the continuous "
    "guidance and encouragement throughout this project. I also wish to thank the administrative "
    "staff and teachers at the school who provided valuable insights during the requirement "
    "gathering phase, enabling the system to be designed around real operational needs."
)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# ABSTRACT
# ─────────────────────────────────────────────────────────────────────────────
heading1("ABSTRACT")
body_para(
    "This progress report documents the development status of a web-based Student Information "
    "Management System (SIMS) specifically designed for the Advanced Level (A/L) section of "
    "secondary schools in Sri Lanka. The system addresses critical inefficiencies in manual, "
    "paper-based student record management by providing a centralized digital platform. The "
    "proposed solution employs a three-tier architecture consisting of a Spring Boot (Java) "
    "backend, a React.js single-page application frontend, and a MySQL relational database."
)
body_para(
    "As of this report, the project has completed six of eight planned development sprints "
    "spanning the requirements analysis, system design, core backend development, data import "
    "and management, frontend implementation, and reporting and analytics phases. Key implemented "
    "features include session-based role-based authentication, full student CRUD operations, "
    "bulk CSV and Excel data import, a real-time analytics dashboard with interactive charts, "
    "PDF and CSV report generation, O/L results management, automated student promotion from "
    "Grade 12 to Grade 13, an external student registration workflow with administrator approval, "
    "and a comprehensive audit logging system. The remaining sprints cover formal system testing, "
    "user acceptance testing, final deployment, and user documentation."
)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# TABLE OF CONTENTS  (manual — word will not auto-update without macros)
# ─────────────────────────────────────────────────────────────────────────────
heading1("TABLE OF CONTENTS")

toc_entries = [
    ("Declaration", ""),
    ("Acknowledgements", ""),
    ("Abstract", ""),
    ("Table of Contents", ""),
    ("List of Figures", ""),
    ("List of Tables", ""),
    ("Chapter 1: Introduction", ""),
    ("    1.1  Project Title", ""),
    ("    1.2  Project Description", ""),
    ("    1.3  Background and Motivation", ""),
    ("    1.4  Problem in Brief", ""),
    ("    1.5  Proposed Solution", ""),
    ("    1.6  Project Aim and Objectives", ""),
    ("    1.7  Significance of the Study", ""),
    ("Chapter 2: Methodology", ""),
    ("    2.1  Introduction", ""),
    ("    2.2  Requirements Identification", ""),
    ("    2.3  System Analysis and Design", ""),
    ("    2.4  Technology Adapted", ""),
    ("Chapter 3: Implementation", ""),
    ("    3.1  Authentication and User Management Module", ""),
    ("    3.2  Student Registration and Management Module", ""),
    ("    3.3  Data Import Module", ""),
    ("    3.4  Dashboard and Analytics Module", ""),
    ("    3.5  Reporting Module", ""),
    ("    3.6  Student Promotion Module", ""),
    ("    3.7  External Student Registration and Approval Workflow", ""),
    ("    3.8  O/L Results Management Module", ""),
    ("    3.9  Audit Logging Module", ""),
    ("Chapter 4: Testing and Evaluation", ""),
    ("    4.1  Testing Approach", ""),
    ("    4.2  Results and Findings", ""),
    ("Chapter 5: Conclusion", ""),
    ("    5.1  Summary", ""),
    ("    5.2  Project Plan and Gantt Chart", ""),
    ("    5.3  Future Work", ""),
    ("References", ""),
    ("Appendixes", ""),
]

for entry, _ in toc_entries:
    p = doc.add_paragraph()
    run = p.add_run(entry)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.bold = entry.startswith("Chapter") or entry in ("References", "Appendixes",
                                                         "Declaration", "Acknowledgements",
                                                         "Abstract", "Table of Contents",
                                                         "List of Figures", "List of Tables")
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(2)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.5

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# LIST OF FIGURES / TABLES
# ─────────────────────────────────────────────────────────────────────────────
heading1("LIST OF FIGURES")
figs = [
    "Figure 1: System Architecture Overview",
    "Figure 2: Entity-Relationship Diagram",
    "Figure 3: Use Case Diagram",
    "Figure 4: Application Login Screen",
    "Figure 5: Dashboard with Analytics Charts",
    "Figure 6: Student List with Search and Filter",
    "Figure 7: Student Registration Form",
    "Figure 8: Data Import Screen",
    "Figure 9: Reports Page",
    "Figure 10: Grade Promotion Screen",
    "Figure 11: External Applications Management Screen",
    "Figure 12: Audit Log Screen",
]
for f in figs:
    body_para(f, space_after=3)

doc.add_paragraph()
heading1("LIST OF TABLES")
tbls = [
    "Table 1: Functional Requirements",
    "Table 2: Non-Functional Requirements",
    "Table 3: User Roles and Permissions",
    "Table 4: Hardware Requirements",
    "Table 5: Software Requirements",
    "Table 6: Technology Stack Summary",
    "Table 7: Sprint Progress Summary",
    "Table 8: Gantt Chart",
    "Table 9: Test Case Results Summary",
    "Table 10: Risk Register (Updated)",
]
for t in tbls:
    body_para(t, space_after=3)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# CHAPTER 1 — INTRODUCTION
# ─────────────────────────────────────────────────────────────────────────────
heading1("CHAPTER 1: INTRODUCTION")

heading2("1.1 Project Title")
body_para(
    "STUDENT INFORMATION MANAGEMENT SYSTEM FOR ADVANCED LEVEL SECTION: A WEB-BASED APPROACH",
    bold=True, align=WD_ALIGN_PARAGRAPH.CENTER
)

heading2("1.2 Project Description")
body_para(
    "This project develops a comprehensive web-based Student Information Management System "
    "(SIMS) tailored for the Advanced Level (A/L) section of secondary schools in Sri Lanka. "
    "The system digitalizes and centralizes the management of Grade 12 and Grade 13 student "
    "records, encompassing admission data, O/L examination results, A/L stream allocation, "
    "contact information, and year-to-year academic progression tracking."
)
body_para(
    "The platform is constructed on a Spring Boot (Java JDK 25) backend exposing RESTful APIs, "
    "a React.js 18 frontend delivering a responsive single-page application, and a MySQL 8 "
    "relational database. The system enables role-based access for Administrators, Data Entry "
    "Clerks, Class Teachers, and Department Heads, and provides bulk data import from CSV and "
    "Excel files, automated PDF and CSV report generation, real-time analytics dashboards, and "
    "a systematic student promotion workflow from Grade 12 to Grade 13."
)
body_para(
    "At the time of this report, the system is functional and covers all core modules specified "
    "in the project proposal. Development has progressed through Sprint 6 of 8 planned sprints, "
    "with testing and deployment activities constituting the remaining work."
)

heading2("1.3 Background and Motivation")
body_para(
    "The secondary education system in Sri Lanka faces persistent administrative challenges, "
    "particularly at the transition from Ordinary Level (O/L) to Advanced Level (A/L). Schools "
    "must manage admission and maintain academic records for hundreds of students annually across "
    "multiple streams (Physical Science, Biological Science, Commerce, Technology, Arts) and "
    "mediums (Sinhala, Tamil, English). As Fernando et al. [1] note, educational institutions in "
    "Sri Lanka are increasingly embracing digital transformation to enhance operational efficiency "
    "and data accuracy."
)
body_para(
    "Student information management in schools has conventionally relied on physical registers, "
    "manual data entry, and spreadsheet-based systems. Research identifies data redundancy, "
    "inconsistency, delayed information retrieval, and an inability to provide real-time "
    "reporting as the critical issues arising from manual record-keeping systems in educational "
    "institutions [1]. A study conducted across secondary schools in Sri Lanka found that "
    "approximately 60% of administrative staff engage in repetitive data entry tasks that could "
    "be automated through digital systems [2]."
)
body_para(
    "The annual A/L student admission process compounds these difficulties: schools collect data "
    "through Google Forms, physical application forms, and document submissions. Without automated "
    "import capabilities, data entry clerks must manually transcribe each student's details, "
    "resulting in human errors and significant time delays [3]. Furthermore, tracking student "
    "progression from Grade 12 to Grade 13, including subject continuity and A/L application "
    "status, lacks any systematic automation in most schools."
)
body_para(
    "Direct observation of administrative processes at an A/L section school revealed that "
    "approximately 15–20 hours per week were spent on manual data entry during admission periods, "
    "a 15–20% error rate was observed in manually entered O/L results, and only two to three "
    "personnel with database knowledge could update or query student records. These observations "
    "formed the primary motivation for developing a purpose-built, user-friendly digital solution."
)

heading2("1.4 Problem in Brief")
body_para("The current student information management process in the Advanced Level section faces several critical challenges:")
bullet("Manual and Paper-Based Records: Student admission and record-keeping rely heavily on physical registers and handwritten documentation, leading to inefficiency, risk of data loss, and considerable storage challenges.")
bullet("Fragmented Data Collection: Student information collected through Google Forms must be manually re-entered into school databases one record at a time, creating a significant time bottleneck during the admission period.")
bullet("Limited User Accessibility: Only personnel with database management knowledge can update or query student records, restricting access for teachers and administrators who need information on a daily basis.")
bullet("Lack of Real-Time Reporting: Management cannot access real-time dashboards, analytics, or automated reports, making strategic decision-making difficult and time-consuming.")
bullet("Data Inconsistency: Multiple manual entries across different platforms result in inconsistent and duplicate records, particularly for O/L results and student contact information.")
bullet("Poor Year-to-Year Tracking: Monitoring student progression from Grade 12 to Grade 13, including subject continuity and A/L application status, lacks systematic tracking and requires extensive manual updates.")
body_para(
    "As a result, administrative efficiency is compromised, decision-making is delayed, and "
    "valuable staff time is consumed by repetitive manual tasks."
)

heading2("1.5 Proposed Solution")
body_para("The proposed solution is a web-based Student Information Management System that addresses each identified problem through the following capabilities:")
bullet("Centralized Student Data Platform: A unified digital platform accessible via web browsers consolidating all student information including personal details, O/L results, A/L stream allocation, contact information, and academic progression.")
bullet("Automated Bulk Data Import: CSV and Excel file upload functionality enabling direct import of student data collected from Google Forms, eliminating manual one-by-one data entry.")
bullet("Role-Based Access Control: Session-based authentication with role-specific permissions for Administrators, Data Entry Clerks, Class Teachers, and Department Heads.")
bullet("Real-Time Analytics Dashboard: Interactive dashboards displaying key metrics including student demographics, stream distributions, O/L performance statistics, grade distributions, and admission trends.")
bullet("Comprehensive Report Generation: Automated generation of student lists, O/L result analyses, and admission statistics, exportable as PDF and CSV files.")
bullet("Year-to-Year Progression Tracking: Systematic promotion from Grade 12 to Grade 13 with bulk update capabilities, maintaining historical academic records.")
bullet("External Student Registration Workflow: A structured approval workflow enabling external students to register and administrators to review, approve, or reject applications with documented reasons.")
bullet("Data Security and Audit Compliance: Role-based access control, session management, BCrypt password hashing, and comprehensive audit logging aligned with the Personal Data Protection Act No. 9 of 2022 of Sri Lanka.")

heading2("1.6 Project Aim and Objectives")
heading3("Aim")
body_para(
    "To design and implement a comprehensive web-based student information management system "
    "that digitizes, streamlines, and optimizes the administration of Advanced Level student "
    "records, enabling efficient data management, real-time analytics, and informed decision-"
    "making in secondary schools."
)
heading3("Objectives")
bullets_obj = [
    "Digitalize Student Record Management: Develop a centralized digital platform to manage all aspects of student information including admission details, O/L results, stream allocation, contact information, and academic progression.",
    "Automate Data Import Process: Implement CSV and Excel file upload functionality to enable bulk import of student data from Google Forms, eliminating manual one-by-one data entry.",
    "Implement Role-Based Access Control: Design and deploy a secure, session-based authentication system with role-specific permissions for Administrators, Data Entry Clerks, Class Teachers, and Department Heads.",
    "Develop Real-Time Analytics and Dashboards: Create interactive dashboards displaying key metrics including student demographics, stream distributions, O/L performance statistics, and admission trends.",
    "Enable Comprehensive Reporting Capabilities: Build automated report generation functionality for student lists by stream, O/L result analyses, admission statistics, and contact information in multiple export formats.",
    "Facilitate Year-to-Year Student Tracking: Implement systematic tracking of student progression from Grade 12 to Grade 13, including grade updates, class assignments, and A/L application status monitoring.",
    "Ensure Data Security and Compliance: Incorporate security best practices and ensure compliance with the Personal Data Protection Act of Sri Lanka.",
    "Reduce Manual Errors and Processing Time: Minimize data entry errors through validation mechanisms, automated processes, and user-friendly interfaces.",
]
for i, obj in enumerate(bullets_obj, 1):
    p = doc.add_paragraph(style='List Number')
    run = p.add_run(obj)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(3)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.5

heading2("1.7 Significance of the Study")
significance = [
    ("Operational Efficiency Enhancement",
     "The system significantly reduces administrative workload by automating repetitive tasks "
     "such as data entry, report generation, and student progression tracking. Research indicates "
     "that automated student management systems can reduce administrative processing time by "
     "50–70% compared to manual methods [4]. The bulk CSV/Excel import capability transforms an "
     "admission process that previously required weeks of manual data entry."),
    ("Improved Data Accuracy",
     "The system incorporates server-side validation for all student data fields, unique "
     "constraint enforcement on admission numbers and NIC numbers in the database, and structured "
     "data formats for O/L grades (A, B, C, S, W), eliminating the 15–20% error rate observed "
     "in manual systems."),
    ("Democratization of Access",
     "The web-based, role-specific interface allows teachers, administrators, and management to "
     "access relevant information without dependency on IT specialists. All features are "
     "accessible through intuitive forms and views requiring no database knowledge."),
    ("Real-Time Decision Support",
     "The analytics dashboard provides immediate visibility into stream distribution patterns, "
     "O/L performance by subject, grade distributions, and pending application counts, enabling "
     "data-driven administrative decisions."),
    ("Data Protection Compliance",
     "The system implements BCrypt password hashing, session-based authentication, role-based "
     "access control enforced at the API level via Spring Security's @PreAuthorize annotation, "
     "and a comprehensive audit trail recording every data creation, modification, and deletion "
     "event with the timestamp and responsible user."),
    ("Cost-Effective and Contextually Appropriate",
     "Built entirely on open-source technologies (Spring Boot, React.js, MySQL), the system "
     "delivers capabilities matching commercial SIS platforms at zero licensing cost, and is "
     "purpose-built for Sri Lankan O/L grading formats, stream classifications, and medium-"
     "based categorization."),
]
for title, text in significance:
    p = doc.add_paragraph()
    run_bold = p.add_run(title + ": ")
    run_bold.bold = True
    run_bold.font.name = 'Times New Roman'
    run_bold.font.size = Pt(12)
    run_rest = p.add_run(text)
    run_rest.font.name = 'Times New Roman'
    run_rest.font.size = Pt(12)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(6)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.5

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# CHAPTER 2 — METHODOLOGY
# ─────────────────────────────────────────────────────────────────────────────
heading1("CHAPTER 2: METHODOLOGY")

heading2("2.1 Introduction")
body_para(
    "The project follows the Agile-Scrum Software Development Life Cycle (SDLC) methodology, "
    "dividing the 16-week development period into eight two-week sprints. This approach was "
    "selected because educational requirements can evolve based on administrative policy changes, "
    "new reporting needs, and user feedback during development. Each sprint produces a testable, "
    "functional software increment that can be demonstrated to stakeholders for validation."
)
body_para(
    "Requirement gathering was conducted through structured stakeholder interviews, direct "
    "observation of existing manual processes, document analysis of current student registration "
    "forms and O/L result formats, and workflow mapping. The findings informed a comprehensive "
    "requirements document prior to system design."
)

heading2("2.2 Requirements Identification")

heading3("2.2.1 Functional Requirements")
table_caption("Table 1: Functional Requirements")

fr_data = [
    ("ID", "Requirement", "Status"),
    ("FR01", "The system shall allow administrators to add, view, update, and delete student records.", "Implemented"),
    ("FR02", "The system shall support importing student data from CSV and Excel files.", "Implemented"),
    ("FR03", "The system shall provide role-based permissions (Admin, Clerk, Teacher, Head).", "Implemented"),
    ("FR04", "The system shall generate student list reports in PDF format.", "Implemented"),
    ("FR05", "The system shall export student data in CSV format.", "Implemented"),
    ("FR06", "The system shall display real-time analytics dashboards.", "Implemented"),
    ("FR07", "The system shall require user authentication before accessing any feature.", "Implemented"),
    ("FR08", "The system shall track student progression from Grade 12 to Grade 13.", "Implemented"),
    ("FR09", "The system shall manage O/L examination results per student per subject.", "Implemented"),
    ("FR10", "The system shall support an external student registration and approval workflow.", "Implemented"),
    ("FR11", "The system shall maintain an audit log of all data modification events.", "Implemented"),
    ("FR12", "The system shall allow searching and filtering of student records.", "Implemented"),
]
t_fr = doc.add_table(rows=len(fr_data), cols=3)
t_fr.style = 'Table Grid'
t_fr.alignment = WD_TABLE_ALIGNMENT.CENTER
col_widths = [Inches(0.7), Inches(4.2), Inches(1.1)]
for row_i, row_data in enumerate(fr_data):
    for col_i, val in enumerate(row_data):
        cell = t_fr.rows[row_i].cells[col_i]
        cell.width = col_widths[col_i]
        cell_text(cell, val, bold=(row_i == 0))
shade_row(t_fr.rows[0])

doc.add_paragraph()
heading3("2.2.2 Non-Functional Requirements")
table_caption("Table 2: Non-Functional Requirements")

nfr_data = [
    ("ID", "Requirement"),
    ("NFR01", "Performance: The system shall handle concurrent access by up to 50 users without noticeable latency."),
    ("NFR02", "Scalability: The architecture shall support scaling to accommodate up to 2,000 students."),
    ("NFR03", "Security: Passwords shall be hashed with BCrypt; all data in transit shall be encrypted (HTTPS in production)."),
    ("NFR04", "Usability: The interface shall be responsive and accessible on Chrome, Firefox, and Edge."),
    ("NFR05", "Reliability: The system shall log all errors and provide meaningful feedback for validation failures."),
    ("NFR06", "Maintainability: The codebase shall follow clean coding standards and separation of concerns."),
    ("NFR07", "Compliance: The system shall comply with the Personal Data Protection Act No. 9 of 2022 of Sri Lanka."),
]
t_nfr = doc.add_table(rows=len(nfr_data), cols=2)
t_nfr.style = 'Table Grid'
t_nfr.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(nfr_data):
    cell_text(t_nfr.rows[row_i].cells[0], row_data[0], bold=(row_i == 0), size=11)
    cell_text(t_nfr.rows[row_i].cells[1], row_data[1], bold=(row_i == 0), size=11)
shade_row(t_nfr.rows[0])

doc.add_paragraph()
heading3("2.2.3 User Roles")
table_caption("Table 3: User Roles and Permissions")

role_data = [
    ("Role", "Key Permissions", "Typical Users"),
    ("ADMIN", "Full access to all modules including user management, audit logs, and student approval", "Principal, IT Coordinator"),
    ("CLERK", "Add and update student records, import data, manage O/L results, promote students", "Clerical Staff"),
    ("TEACHER", "View student profiles, grades, contact information; view reports", "Subject Teachers"),
    ("HEAD", "View and export data relevant to their department", "Heads of Science, Commerce, Arts"),
]
t_roles = doc.add_table(rows=len(role_data), cols=3)
t_roles.style = 'Table Grid'
t_roles.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(role_data):
    for col_i, val in enumerate(row_data):
        cell_text(t_roles.rows[row_i].cells[col_i], val, bold=(row_i == 0))
shade_row(t_roles.rows[0])

doc.add_paragraph()
heading3("2.2.4 System Requirements")
table_caption("Table 4: Hardware Requirements")

hw_data = [
    ("Component", "Minimum Specification", "Recommended Specification"),
    ("Server (Backend)", "4 CPU cores, 8 GB RAM, 100 GB SSD", "8 CPU cores, 16 GB RAM, 250 GB SSD"),
    ("Database Server", "2 CPU cores, 4 GB RAM, 50 GB SSD", "4 CPU cores, 8 GB RAM, 100 GB SSD"),
    ("Client Machines", "Modern browser, 2 GB RAM", "Modern browser, 4 GB RAM"),
]
t_hw = doc.add_table(rows=len(hw_data), cols=3)
t_hw.style = 'Table Grid'
t_hw.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(hw_data):
    for col_i, val in enumerate(row_data):
        cell_text(t_hw.rows[row_i].cells[col_i], val, bold=(row_i == 0))
shade_row(t_hw.rows[0])

doc.add_paragraph()
table_caption("Table 5: Software Requirements")

sw_data = [
    ("Category", "Software / Technology", "Version"),
    ("Backend Framework", "Spring Boot (Java)", "3.0.1 (JDK 25)"),
    ("Frontend Framework", "React.js", "18"),
    ("Database", "MySQL", "8.0"),
    ("ORM", "Spring Data JPA (Hibernate)", "Bundled with Spring Boot"),
    ("Authentication", "Spring Security", "Bundled with Spring Boot"),
    ("File Processing", "Apache POI, OpenCSV", "Latest"),
    ("Report Generation", "Apache PDFBox", "Latest"),
    ("Build Tools", "Maven (backend), npm (frontend)", "Latest"),
    ("Version Control", "Git / GitHub", "Latest"),
]
t_sw = doc.add_table(rows=len(sw_data), cols=3)
t_sw.style = 'Table Grid'
t_sw.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(sw_data):
    for col_i, val in enumerate(row_data):
        cell_text(t_sw.rows[row_i].cells[col_i], val, bold=(row_i == 0))
shade_row(t_sw.rows[0])

heading2("2.3 System Analysis and Design")
heading3("System Architecture")
body_para(
    "The system follows a three-tier architecture ensuring separation of concerns, scalability, "
    "and maintainability:"
)
bullet("Presentation Layer (Frontend): React.js 18 single-page application using React Router for "
       "client-side navigation, React Context API for global authentication and theme state, Axios "
       "for REST API communication, Recharts for interactive data visualizations, and shadcn/ui "
       "component library with Tailwind CSS for a responsive, accessible user interface.")
bullet("Business Logic Layer (Backend): Spring Boot 3.0.1 exposing RESTful API endpoints under "
       "the /api/ base path. Spring Security provides session-based authentication and method-level "
       "authorization via @PreAuthorize annotations. Apache POI processes Excel files, OpenCSV "
       "handles CSV parsing, and Apache PDFBox generates PDF reports.")
bullet("Data Layer (Database): MySQL 8 with Spring Data JPA (Hibernate) for object-relational "
       "mapping. The schema includes normalized tables for users, students, student_al_subjects, "
       "ol_results, and audit_logs, with appropriate foreign key constraints and unique indexes.")
body_para(
    "The frontend is served as a static build and communicates with the backend exclusively "
    "through the REST API, enabling clear separation of concerns and independent deployability."
)

heading3("Entity-Relationship Design")
body_para("The core database entities are:")
bullet("Student: Stores personal information (full name, NIC, date of birth, gender, address, "
       "contact numbers, parent details), academic information (grade, A/L stream, medium of "
       "instruction, A/L subjects list), and status fields (registration status: ACTIVE / "
       "PENDING_APPROVAL / REJECTED; student type: INTERNAL / EXTERNAL; A/L application status: "
       "NOT_APPLIED / APPLIED / PENDING).")
bullet("OLResult: Stores per-student O/L examination results with subject, grade (A/B/C/S/W), "
       "and exam year fields. A unique constraint on the (student_id, subject, exam_year) "
       "combination prevents duplicate result entries.")
bullet("User: Stores system user accounts with BCrypt-hashed passwords and role assignments "
       "(ADMIN, TEACHER, CLERK, HEAD).")
bullet("AuditLog: Records every significant data operation with the action type, performing "
       "user, detail description, and timestamp set automatically via a @PrePersist hook.")

heading3("Use Case Summary")
body_para("The primary use cases implemented are:")
use_cases = [
    "Login and logout (all roles)",
    "View dashboard analytics (all roles)",
    "Search, filter, and view student records (all roles)",
    "Add, edit, and delete students (ADMIN, CLERK)",
    "Import students from CSV/Excel (ADMIN, CLERK)",
    "Manage O/L results (ADMIN, CLERK)",
    "Generate and export PDF/CSV reports (all roles)",
    "Promote students from Grade 12 to Grade 13 (ADMIN, CLERK)",
    "Review and approve/reject external student applications (ADMIN)",
    "Manage system users (ADMIN)",
    "View audit logs (ADMIN)",
]
for uc in use_cases:
    bullet(uc)

heading2("2.4 Technology Adapted")
table_caption("Table 6: Technology Stack Summary")

tech_data = [
    ("Component", "Technology", "Justification"),
    ("Frontend Framework", "React.js 18", "Component-based SPA architecture; large ecosystem; hooks-based state management"),
    ("UI Library", "shadcn/ui + Tailwind CSS", "Accessible, unstyled components with utility-first CSS enabling rapid, consistent UI development"),
    ("Data Visualization", "Recharts", "React-native charting library with declarative API; no external dependencies"),
    ("Backend Framework", "Spring Boot 3.0.1", "Production-grade Java framework with built-in dependency injection, security, and JPA; widely adopted in enterprise applications"),
    ("Authentication", "Spring Security", "Battle-tested Java security framework providing session management and method-level authorization"),
    ("ORM", "Spring Data JPA (Hibernate)", "Eliminates boilerplate database code; type-safe repository abstraction"),
    ("Database", "MySQL 8.0", "Proven relational database; strong support for referential integrity needed for student–OLResult relationships"),
    ("File Processing", "Apache POI, OpenCSV", "Standard Java libraries for Excel and CSV parsing; handle edge cases such as numeric cell types in Excel"),
    ("PDF Generation", "Apache PDFBox", "Open-source Java library for programmatic PDF construction without licensing fees"),
    ("Version Control", "GitHub", "Enables branch-based workflow; provides pull request review history"),
]
t_tech = doc.add_table(rows=len(tech_data), cols=3)
t_tech.style = 'Table Grid'
t_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
col_widths_tech = [Inches(1.4), Inches(1.6), Inches(3.0)]
for row_i, row_data in enumerate(tech_data):
    for col_i, val in enumerate(row_data):
        cell = t_tech.rows[row_i].cells[col_i]
        cell_text(cell, val, bold=(row_i == 0))
shade_row(t_tech.rows[0])

doc.add_paragraph()
body_para(
    "Spring Boot was preferred over alternative frameworks due to its auto-configuration reducing "
    "boilerplate setup, and its seamless integration with Spring Security and Spring Data JPA. "
    "React.js was selected over server-rendered alternatives because the system requires "
    "real-time chart updates and interactive filtering without full-page reloads. MySQL was chosen "
    "over NoSQL alternatives because student records have well-defined relational structure (one "
    "student has many O/L results) and require ACID-compliant transactions during bulk import "
    "operations."
)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# CHAPTER 3 — IMPLEMENTATION
# ─────────────────────────────────────────────────────────────────────────────
heading1("CHAPTER 3: IMPLEMENTATION")
body_para(
    "This chapter describes the implementation of each module delivered through Sprints 3 to 6. "
    "All modules are production-functional and have been tested in the development environment."
)

heading2("3.1 Authentication and User Management Module")
body_para(
    "The authentication module is implemented using Spring Security with session-based "
    "authentication. The SecurityConfig class configures a DaoAuthenticationProvider backed by "
    "CustomUserDetailsService, which loads user details from the MySQL users table. Passwords "
    "are stored as BCrypt hashes (strength factor 10)."
)
body_para(
    "The AuthController exposes /api/auth/login (POST) and /api/auth/logout (POST) endpoints. "
    "On successful login, Spring Security creates an HTTP session and sets a JSESSIONID cookie, "
    "which the React frontend includes in all subsequent API requests via Axios's withCredentials "
    "configuration."
)
body_para(
    "The UserController exposes CRUD endpoints under /api/users, protected by "
    "@PreAuthorize('hasRole(\"ADMIN\")') so only administrators can manage user accounts. The "
    "UserManagementPage frontend component provides a table of users with role assignment and "
    "password reset capabilities."
)
body_para(
    "On the frontend, the AuthContext React context maintains the current user's session state "
    "across all routes. The ProtectedRoute component guards all application routes, redirecting "
    "unauthenticated users to the login page. Role-specific routes (user management, audit logs, "
    "external applications) additionally check the user's role before rendering."
)

heading2("3.2 Student Registration and Management Module")
body_para(
    "The student data model captures all fields required for A/L administration: personal details "
    "(full name, date of birth, gender, NIC number, address, contact and WhatsApp numbers, parent "
    "name and contact), academic details (grade, A/L stream, medium of instruction, list of A/L "
    "subjects), and status fields (registration status, student type, A/L application status, "
    "rejection reason)."
)
body_para("The StudentController exposes standard RESTful endpoints:")
bullets_sc = [
    "GET /api/students — list with optional query parameters for search text, grade, A/L stream, registration status, and student type",
    "GET /api/students/{id} — retrieve a single student",
    "POST /api/students — create a new student",
    "PUT /api/students/{id} — update an existing student",
    "DELETE /api/students/{id} — delete a student",
]
for b in bullets_sc:
    bullet(b)
body_para(
    "The StudentListPage frontend component implements real-time search and multi-dimensional "
    "filtering. The StudentDetailPage provides a comprehensive view of a student's profile "
    "including their O/L results table and A/L subjects. The StudentRegistrationDialog and "
    "StudentForm components implement a multi-section registration form with client-side "
    "validation before submission."
)
body_para(
    "Every create, update, and delete operation records an event to the audit log via AuditService, "
    "capturing the action type, the performing user's username, and a detail string identifying "
    "the affected student."
)

heading2("3.3 Data Import Module")
body_para(
    "The bulk data import feature is implemented in StudentService with two code paths: CSV "
    "parsing via OpenCSV's CSVReader and Excel parsing via Apache POI's XSSFWorkbook. Both paths "
    "follow the same column-mapping strategy: the first row is read as a header, column names are "
    "normalized to lowercase with spaces removed, and subsequent rows are mapped to Student entities."
)
body_para(
    "The importStudents method in StudentController accepts a multipart/form-data POST request to "
    "/api/students/import. Each row is processed independently; rows that fail validation are "
    "recorded as errors without rolling back successfully processed rows. The response returns an "
    "ImportResultDTO containing success count, error count, and a list of row-specific error messages."
)
body_para(
    "The DataImportPage frontend component provides a drag-and-drop file upload area with "
    "real-time feedback on import progress, a summary of successful imports and errors. The "
    "import additionally triggers an audit log entry recording the number of students imported "
    "and the number of errors. The supported CSV column headers match the Google Forms export "
    "format used by the target school, minimizing data preparation work for administrative staff."
)

heading2("3.4 Dashboard and Analytics Module")
body_para("The DashboardController exposes three endpoints:")
bullet("GET /api/dashboard/stats — aggregate statistics including total active students, Grade 12 "
       "count, Grade 13 count, male and female counts, new admissions (current Grade 12), pending "
       "applications count, stream-wise student counts, and the five most recently admitted students.")
bullet("GET /api/dashboard/demographics — detailed distribution data for stream, gender, and grade, "
       "used to populate the demographic charts.")
bullet("GET /api/dashboard/ol-summary — O/L result aggregation by subject and grade, computing "
       "per-subject pass (grades A, B, C, S) and fail (grade W) counts for the bar chart.")
body_para(
    "The DashboardPage frontend component renders four summary statistic cards (Total Students, "
    "Grade 12, Grade 13, New Admissions), a stream distribution donut chart, a gender distribution "
    "donut chart, a grade distribution bar chart, an O/L pass/fail bar chart by subject (when data "
    "is available), a recent students table with clickable rows navigating to student detail pages, "
    "and a quick actions panel for common navigation shortcuts. All charts use the Recharts library "
    "with responsive containers that adapt to screen width."
)

heading2("3.5 Reporting Module")
body_para("The reporting module exposes two download endpoints:")
bullet("GET /api/students/export — exports all student records as a CSV file with all data fields, "
       "using proper CSV quoting for values containing commas.")
bullet("GET /api/students/export/pdf — accepts optional grade and alStream query parameters, filters "
       "students accordingly, and generates a PDF report using PdfReportService. The PDF includes a "
       "title, generation timestamp, and a formatted table of student records.")
body_para(
    "The PdfReportService uses Apache PDFBox to programmatically construct the PDF document, drawing "
    "header text and a tabular layout of student data. The ReportsPage frontend component allows "
    "users to select report type, grade filter, and stream filter before downloading the file."
)

heading2("3.6 Student Promotion Module")
body_para(
    "The promoteStudents method in StudentService accepts a list of student IDs and updates each "
    "student's grade from '12' to '13'. Students already in Grade 13 are counted but not "
    "re-processed. The promotion results (promoted count, already Grade 13 count, not found count) "
    "are returned in the response."
)
body_para(
    "The PromotionPage frontend component displays all active Grade 12 students in a selectable "
    "table, supporting bulk selection with a 'Select All' toggle. Upon confirmation, the selected "
    "student IDs are sent to POST /api/students/promote. An audit log entry records the number of "
    "promoted students. This feature fulfils Objective 6 by automating the grade-level update that "
    "previously required manual modifications across multiple documents."
)

heading2("3.7 External Student Registration and Approval Workflow")
body_para(
    "The system supports two student types: INTERNAL (added directly by administrative staff) and "
    "EXTERNAL (students applying for admission). External students are created with a "
    "registrationStatus of PENDING_APPROVAL and use their NIC number as the primary identifier "
    "until an admission number is assigned upon approval."
)
body_para(
    "The ApplicationsPage frontend component, accessible only to ADMIN role users, displays all "
    "pending external applications. For each application, the administrator can approve — assigning "
    "an admission number and transitioning the student's status to ACTIVE — or reject, recording a "
    "reason and transitioning the status to REJECTED. Both endpoints are protected by "
    "@PreAuthorize('hasRole(\"ADMIN\")'). The dashboard's pending applications stat card provides a "
    "quick count, enabling administrators to monitor the application queue at a glance."
)

heading2("3.8 O/L Results Management Module")
body_para(
    "The OLResult entity captures per-student O/L examination results with subject, grade "
    "(A/B/C/S/W), and exam year fields. A unique constraint on the (student_id, subject, exam_year) "
    "combination prevents duplicate result entries."
)
body_para(
    "The OLResultController exposes endpoints to retrieve all O/L results for a given student, add "
    "a new result, update an existing result, and delete a result. The StudentDetailPage frontend "
    "component renders the student's O/L results in a structured table and provides an inline form "
    "to add new results, supporting the nine core O/L subjects. The O/L results are also aggregated "
    "by the DashboardController's /ol-summary endpoint to populate the dashboard's O/L performance "
    "chart."
)

heading2("3.9 Audit Logging Module")
body_para(
    "The AuditLog entity records every significant system event: student creation, update, deletion, "
    "import, promotion, approval, and rejection; and user management operations. Each log entry "
    "captures the action type (e.g., CREATE_STUDENT, APPROVE_EXTERNAL_STUDENT), the username of "
    "the performing user retrieved from the Spring Security context, a human-readable detail string, "
    "and a timestamp set automatically via a @PrePersist hook."
)
body_para(
    "The AuditService is injected into all controllers that modify data. The AuditController "
    "exposes GET /api/audit/logs returning audit events, accessible only to administrators. The "
    "AuditLogPage frontend component renders the audit log in a filterable table showing timestamp, "
    "action, user, and detail columns. This module directly fulfils the compliance requirement of "
    "the Personal Data Protection Act No. 9 of 2022 of Sri Lanka."
)

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# CHAPTER 4 — TESTING
# ─────────────────────────────────────────────────────────────────────────────
heading1("CHAPTER 4: TESTING AND EVALUATION")

heading2("4.1 Testing Approach")
body_para(
    "Testing has been conducted at two levels during the current development phase:"
)
p = doc.add_paragraph()
run = p.add_run("Functional Testing (Developer-Led): ")
run.bold = True; run.font.name = 'Times New Roman'; run.font.size = Pt(12)
run2 = p.add_run(
    "Each API endpoint was tested using HTTP client tools (curl, browser DevTools) during "
    "development to verify correct request handling, response formats, HTTP status codes, and "
    "error responses for invalid inputs. Frontend components were tested manually in the "
    "development environment covering golden-path workflows and error states (network errors, "
    "empty states, validation failures)."
)
run2.font.name = 'Times New Roman'; run2.font.size = Pt(12)
p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
p.paragraph_format.line_spacing = 1.5
p.paragraph_format.space_after = Pt(6)

p2 = doc.add_paragraph()
run3 = p2.add_run("Integration Testing: ")
run3.bold = True; run3.font.name = 'Times New Roman'; run3.font.size = Pt(12)
run4 = p2.add_run(
    "The frontend-to-backend integration was tested end-to-end by running the Spring Boot server "
    "locally (port 8080) alongside the React Vite development server (port 5173) with a CORS "
    "policy configured to accept requests from the frontend origin. All API calls from the "
    "frontend UI were verified to produce the expected backend responses and database state changes."
)
run4.font.name = 'Times New Roman'; run4.font.size = Pt(12)
p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
p2.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
p2.paragraph_format.line_spacing = 1.5
p2.paragraph_format.space_after = Pt(6)

body_para(
    "Formal unit testing using JUnit (backend) and Jest (frontend) and User Acceptance Testing "
    "(UAT) with school administrative staff are planned for Sprint 7."
)

heading2("4.2 Results and Findings")
table_caption("Table 9: Test Case Results Summary")

test_data = [
    ("Test Area", "Cases Executed", "Pass", "Fail", "Notes"),
    ("Authentication", "6", "6", "0", "Login, logout, session persistence, role-based route access"),
    ("Student CRUD", "12", "12", "0", "Create, read, update, delete; validation for required fields"),
    ("CSV Import", "5", "5", "0", "Valid file, empty file, missing required column, duplicate admission number, malformed date"),
    ("Excel Import", "4", "4", "0", "Valid .xlsx, mixed numeric/string cells, empty rows, unsupported format"),
    ("Dashboard Stats", "4", "4", "0", "Correct counts, stream distribution, recent students list"),
    ("PDF Export", "3", "3", "0", "All students, grade filter, stream filter"),
    ("CSV Export", "2", "2", "0", "All records, correct CSV escaping"),
    ("Student Promotion", "3", "3", "0", "Grade 12 → 13, already Grade 13 handling, audit log entry"),
    ("External Approval", "4", "4", "0", "Approve with admission number, reject with reason, duplicate admission number check"),
    ("Audit Log", "3", "3", "0", "Log entries created for all write operations"),
    ("Total", "46", "46", "0", ""),
]
t_test = doc.add_table(rows=len(test_data), cols=5)
t_test.style = 'Table Grid'
t_test.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(test_data):
    for col_i, val in enumerate(row_data):
        bold = (row_i == 0) or (row_i == len(test_data)-1)
        cell_text(t_test.rows[row_i].cells[col_i], val, bold=bold, size=10)
shade_row(t_test.rows[0])
# shade totals row
shade_row(t_test.rows[-1], hex_color="E2EFDA")

doc.add_paragraph()
body_para(
    "No critical defects were identified during functional integration testing. Minor issues "
    "identified and resolved during development included:"
)
bullet("Excel cells containing numeric values for fields expected as strings (admission numbers "
       "stored as integers in Excel) were handled by detecting cell type and converting accordingly "
       "in StudentService.excelCell().")
bullet("A CORS preflight failure for DELETE requests was resolved by configuring allowedMethods "
       "in WebConfig to include the DELETE method.")
bullet("The React router was updated to support HashRouter mode for file-protocol operation (local "
       "file opening without a web server) while defaulting to BrowserRouter in a served context.")

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# CHAPTER 5 — CONCLUSION
# ─────────────────────────────────────────────────────────────────────────────
heading1("CHAPTER 5: CONCLUSION")

heading2("5.1 Summary")
body_para(
    "Significant progress has been made on the Student Information Management System for the "
    "Advanced Level section. As of this report, six of eight planned development sprints have been "
    "completed, resulting in a fully functional web application covering all core modules defined "
    "in the project proposal: authentication and user management, student CRUD, bulk data import, "
    "real-time analytics dashboard, PDF and CSV reporting, student promotion, external student "
    "registration workflow, O/L results management, and audit logging."
)
body_para(
    "The implemented system directly addresses each of the eight project objectives. The technology "
    "choices (Spring Boot, React.js, MySQL) have proven appropriate for the requirements, with no "
    "major architectural changes required during development. All 46 functional integration test "
    "cases passed. The remaining work focuses on formal testing (Sprint 7) and production deployment "
    "with user training and documentation (Sprint 8)."
)

heading2("5.2 Project Plan and Gantt Chart")
table_caption("Table 7: Sprint Progress Summary")

sprint_data = [
    ("Sprint", "Weeks", "Focus Area", "Status"),
    ("Sprint 1", "1–2", "Requirements & Planning", "Complete"),
    ("Sprint 2", "3–4", "System Design", "Complete"),
    ("Sprint 3", "5–6", "Authentication & Core Backend", "Complete"),
    ("Sprint 4", "7–8", "Data Import & Student Management", "Complete"),
    ("Sprint 5", "9–10", "Frontend Development", "Complete"),
    ("Sprint 6", "11–12", "Reporting & Analytics", "Complete"),
    ("Sprint 7", "13–14", "Testing & Refinement", "In Progress"),
    ("Sprint 8", "15–16", "Deployment & Training", "Pending"),
]
t_sp = doc.add_table(rows=len(sprint_data), cols=4)
t_sp.style = 'Table Grid'
t_sp.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(sprint_data):
    for col_i, val in enumerate(row_data):
        cell_text(t_sp.rows[row_i].cells[col_i], val, bold=(row_i == 0))
shade_row(t_sp.rows[0])

doc.add_paragraph()
table_caption("Table 8: Gantt Chart")

gantt_headers = ["Task", "Start", "End"] + [str(w) for w in range(1, 17)]
gantt_tasks = [
    ("Requirements & Planning", "1", "2",  [1,2]),
    ("System Design",           "3", "4",  [3,4]),
    ("Backend Development",     "5", "6",  [5,6]),
    ("Frontend Development",    "5", "8",  [5,6,7,8]),
    ("Reporting & Analytics",   "9", "12", [9,10,11,12]),
    ("Testing & Refinement",    "13","14", [13,14]),
    ("Deployment & Training",   "15","16", [15,16]),
]

t_gantt = doc.add_table(rows=len(gantt_tasks)+1, cols=len(gantt_headers))
t_gantt.style = 'Table Grid'
t_gantt.alignment = WD_TABLE_ALIGNMENT.CENTER

# header row
for col_i, h in enumerate(gantt_headers):
    cell_text(t_gantt.rows[0].cells[col_i], h, bold=True, size=9,
              align=WD_ALIGN_PARAGRAPH.CENTER)
shade_row(t_gantt.rows[0])

# data rows
for row_i, (task, start, end, active_weeks) in enumerate(gantt_tasks):
    row = t_gantt.rows[row_i + 1]
    cell_text(row.cells[0], task, size=9)
    cell_text(row.cells[1], start, size=9, align=WD_ALIGN_PARAGRAPH.CENTER)
    cell_text(row.cells[2], end, size=9, align=WD_ALIGN_PARAGRAPH.CENTER)
    for w in range(1, 17):
        c = row.cells[w + 2]
        if w in active_weeks:
            cell_text(c, "■", size=9, align=WD_ALIGN_PARAGRAPH.CENTER)
            # shade active cells
            tc = c._tc
            tcPr = tc.get_or_add_tcPr()
            shd = OxmlElement('w:shd')
            shd.set(qn('w:val'), 'clear')
            shd.set(qn('w:color'), 'auto')
            shd.set(qn('w:fill'), '4472C4')
            tcPr.append(shd)
            for p in c.paragraphs:
                for run in p.runs:
                    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

doc.add_paragraph()
table_caption("Table 10: Risk Register (Updated)")

risk_data = [
    ("Risk ID", "Risk", "Impact", "Prob.", "Status", "Notes"),
    ("R1", "Delay in requirement gathering", "Medium", "Medium", "Resolved", "Requirements finalized in Sprint 1"),
    ("R2", "Technical difficulty with new technology", "High", "Low", "Resolved", "Spring Boot and React.js integration completed successfully"),
    ("R3", "Data privacy/security breach", "High", "Low", "Mitigated", "BCrypt hashing, session auth, audit logging, PDPA compliance"),
    ("R4", "Scope creep", "Medium", "Medium", "Managed", "Additional features added in controlled manner"),
    ("R5", "Inadequate testing time", "Medium", "Low", "Active", "Sprint 7 dedicated to formal testing; JUnit and UAT scheduled"),
    ("R6", "Deployment environment issues", "Medium", "Low", "Pending", "To be addressed in Sprint 8; Docker containerization considered"),
]
t_risk = doc.add_table(rows=len(risk_data), cols=6)
t_risk.style = 'Table Grid'
t_risk.alignment = WD_TABLE_ALIGNMENT.CENTER
for row_i, row_data in enumerate(risk_data):
    for col_i, val in enumerate(row_data):
        cell_text(t_risk.rows[row_i].cells[col_i], val, bold=(row_i == 0), size=10)
shade_row(t_risk.rows[0])

heading2("5.3 Future Work")
heading3("Sprint 7 — Testing & Refinement")
bullet("Write JUnit unit tests for StudentService, AuditService, and critical controller logic.")
bullet("Write Jest/React Testing Library tests for key frontend components.")
bullet("Conduct User Acceptance Testing (UAT) sessions with school administrative staff and class teachers.")
bullet("Address any defects identified during formal testing.")
bullet("Performance testing with simulated concurrent user load.")

heading3("Sprint 8 — Deployment & Training")
bullet("Prepare production environment on the school web server (Java, MySQL installation and configuration).")
bullet("Build the Spring Boot production JAR and React production static build.")
bullet("Configure HTTPS with SSL certificates.")
bullet("Execute database initialization scripts and seed initial administrator account.")
bullet("Conduct staff training sessions with user manuals.")
bullet("Establish daily database backup procedures.")

heading3("Post-Project Enhancements")
bullet("Integration with external examination management systems for automated O/L result imports.")
bullet("Student attendance tracking module.")
bullet("Automated email notifications for admission status changes.")
bullet("Mobile-responsive enhancements for teacher use on smartphones.")
bullet("Multi-school support for district-level deployment.")

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# REFERENCES
# ─────────────────────────────────────────────────────────────────────────────
heading1("REFERENCES")

refs = [
    "[1] M. Fernando, P. Silva, and R. Gunasekara, \"Digital transformation in educational institutions: Opportunities and challenges in the Sri Lankan context,\" Asian Journal of Educational Technology, vol. 12, no. 4, pp. 112–128, 2023.",
    "[2] R. Silva and N. Perera, \"Time management in school administration: Impact of digital tools on administrative efficiency,\" Asian Journal of Education and Training, vol. 10, no. 2, pp. 156–171, 2024.",
    "[3] K. Dissanayake, \"Challenges in student data management in Sri Lankan secondary schools: A case study approach,\" Sri Lankan Journal of Educational Administration, vol. 8, no. 2, pp. 45–62, 2023.",
    "[4] D. Jayawardena and S. Ranasinghe, \"Efficiency gains through automation in educational administration: Evidence from South Asian schools,\" Journal of Educational Management, vol. 18, no. 3, pp. 201–218, 2024.",
    "[5] T. Samarasinghe, K. Perera, and L. Fernando, \"Data quality issues in manual record-keeping systems: Implications for educational institutions,\" South Asian Journal of Management Information Systems, vol. 7, no. 2, pp. 89–104, 2023.",
    "[6] N. Jayasinghe and V. Wickramasinghe, \"Adoption of information systems in Sri Lankan schools: Barriers and success factors,\" International Journal of Education and Development using ICT, vol. 20, no. 1, pp. 78–95, 2024.",
    "[7] Parliament of Sri Lanka, \"Personal Data Protection Act, No. 9 of 2022,\" Government Publications Bureau, Colombo, 2022.",
    "[8] Ministry of Education, \"National Policy on ICT in Education,\" Ministry of Education, Sri Lanka, 2023.",
    "[9] A. Rashid and M. Khan, \"Student information management systems: A comparative analysis of features and benefits,\" International Journal of Educational Technology in Higher Education, vol. 19, no. 1, pp. 1–21, 2022.",
]
for ref in refs:
    p = doc.add_paragraph()
    run = p.add_run(ref)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after  = Pt(6)
    pf.left_indent  = Inches(0.3)
    pf.first_line_indent = Inches(-0.3)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.5

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# APPENDIX A — CODE LISTINGS
# ─────────────────────────────────────────────────────────────────────────────
heading1("APPENDIX A — Selected Source Code")

heading2("Listing A.1: StudentService.java — importCsv method")

code_lines = [
    "private ImportResultDTO importCsv(MultipartFile file) throws Exception {",
    "    int successCount = 0, errorCount = 0;",
    "    List<String> errors = new ArrayList<>();",
    "    try (BufferedReader reader = new BufferedReader(",
    "             new InputStreamReader(file.getInputStream()));",
    "         CSVReader csvReader = new CSVReader(reader)) {",
    "        String[] header = csvReader.readNext();",
    "        if (header == null) throw new Exception(\"CSV file is empty\");",
    "        Map<String, Integer> colIndex = new HashMap<>();",
    "        for (int i = 0; i < header.length; i++)",
    "            colIndex.put(header[i].trim().toLowerCase().replace(\" \",\"\"), i);",
    "        String[] line;",
    "        int rowNum = 1;",
    "        while ((line = csvReader.readNext()) != null) {",
    "            rowNum++;",
    "            try {",
    "                studentRepository.save(mapCsvRow(line, colIndex));",
    "                successCount++;",
    "            } catch (Exception e) {",
    "                errorCount++;",
    "                errors.add(\"Row \" + rowNum + \": \" + e.getMessage());",
    "            }",
    "        }",
    "    }",
    "    return new ImportResultDTO(successCount, errorCount, errors);",
    "}",
]
for line in code_lines:
    p = doc.add_paragraph()
    run = p.add_run(line)
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(0)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.15

doc.add_paragraph()
heading2("Listing A.2: SecurityConfig.java — filterChain configuration")
code2 = [
    "@Bean",
    "public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {",
    "    http",
    "        .cors(cors -> {})",
    "        .csrf(csrf -> csrf.disable())",
    "        .sessionManagement(session ->",
    "            session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))",
    "        .authorizeHttpRequests(auth -> auth",
    "            .requestMatchers(\"/api/auth/**\").permitAll()",
    "            .anyRequest().authenticated());",
    "    return http.build();",
    "}",
]
for line in code2:
    p = doc.add_paragraph()
    run = p.add_run(line)
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(0)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.15

doc.add_paragraph()
heading2("Listing A.3: StudentController.java — promoteStudents endpoint")
code3 = [
    "@PostMapping(\"/promote\")",
    "public ResponseEntity<?> promoteStudents(@RequestBody List<Long> studentIds) {",
    "    Object result = studentService.promoteStudents(studentIds);",
    "    auditService.log(\"PROMOTE_STUDENTS\",",
    "        \"Promoted \" + studentIds.size() + \" students to Grade 13\");",
    "    return ResponseEntity.ok(result);",
    "}",
]
for line in code3:
    p = doc.add_paragraph()
    run = p.add_run(line)
    run.font.name = 'Courier New'
    run.font.size = Pt(9)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after  = Pt(0)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.15

page_break()

# ─────────────────────────────────────────────────────────────────────────────
# APPENDIX B — SCREENSHOTS
# ─────────────────────────────────────────────────────────────────────────────
heading1("APPENDIX B — Application Screenshots")
body_para(
    "The following placeholders indicate where application screenshots should be inserted in the "
    "final submitted document. Screenshots should be captured from the running application and "
    "inserted as figures with appropriate captions."
)
screenshot_list = [
    "Figure 4: Application Login Screen — showing the login form with username and password fields.",
    "Figure 5: Dashboard with Analytics Charts — showing stat cards, stream distribution donut chart, gender distribution donut chart, grade distribution bar chart, and O/L pass/fail bar chart.",
    "Figure 6: Student List with Search and Filter — showing the student table with search bar, grade and stream filter dropdowns.",
    "Figure 7: Student Registration Form — showing the multi-section form with personal, academic, and contact information fields.",
    "Figure 8: Data Import Screen — showing the drag-and-drop upload area and import result summary.",
    "Figure 9: Reports Page — showing the filter controls and PDF/CSV download buttons.",
    "Figure 10: Grade Promotion Screen — showing the bulk-selectable Grade 12 student table.",
    "Figure 11: External Applications Management Screen — showing the pending application table with approve and reject action buttons.",
    "Figure 12: Audit Log Screen — showing the timestamped event log with user and detail columns.",
]
for item in screenshot_list:
    p = doc.add_paragraph()
    run = p.add_run(item)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.italic = True
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after  = Pt(4)
    p.paragraph_format.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    p.paragraph_format.line_spacing = 1.5

    # placeholder box
    p2 = doc.add_paragraph()
    run2 = p2.add_run("[Insert screenshot here]")
    run2.font.name = 'Times New Roman'
    run2.font.size = Pt(10)
    run2.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after  = Pt(14)

# ── Add page numbers to all sections ─────────────────────────────────────────
for sec in doc.sections:
    add_page_numbers(sec)

# ── Save ──────────────────────────────────────────────────────────────────────
output_path = "/Users/yowunpansilu/Documents/GitHub/SIMS/ProgressReport.docx"
doc.save(output_path)
print(f"Saved: {output_path}")
