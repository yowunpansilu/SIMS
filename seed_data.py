#!/usr/bin/env python3
"""
One-time seed script: inserts ~100 internal ACTIVE students and ~100 external
applicants (PENDING_APPROVAL / REJECTED / SCHEDULED) with OL results.

Usage:
    python3 seed_data.py              # default: localhost root no-password
    python3 seed_data.py --host 127.0.0.1 --user root --password secret
"""

import argparse
import random
import datetime
import sys

try:
    import mysql.connector
except ImportError:
    print("mysql-connector-python not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "mysql-connector-python"])
    import mysql.connector

# ── Data pools ────────────────────────────────────────────────────────────────

MALE_FIRST = [
    "Kasun", "Nuwan", "Chathura", "Isuru", "Lahiru", "Sachith", "Tharindu",
    "Dimuth", "Anjula", "Buddhika", "Malith", "Hasitha", "Dulan", "Akila",
    "Shehan", "Thilina", "Chanuka", "Ravindu", "Prabath", "Randil",
    "Pradeep", "Suresh", "Rajesh", "Dinesh", "Harish", "Arun", "Sathish",
    "Vimukthi", "Ashen", "Yasiru",
]

FEMALE_FIRST = [
    "Sanduni", "Dilini", "Chamari", "Thilini", "Nadeeka", "Prasadi",
    "Sachini", "Udari", "Manori", "Hasini", "Nimasha", "Kavindi",
    "Dinusha", "Yasoda", "Piyumi", "Nethmi", "Keshani", "Vimandi",
    "Chathurika", "Dulani", "Priya", "Kavitha", "Anitha", "Nithya",
    "Lakshmi", "Divya", "Meena", "Roshani", "Shenali", "Amaya",
]

LAST_NAMES = [
    "Perera", "Silva", "Fernando", "Jayasinghe", "Wickramasinghe",
    "Bandara", "Rajapaksa", "Kumara", "Dissanayake", "Gunasekara",
    "Herath", "Abeysekara", "Liyanage", "Samarasinghe", "Pathirana",
    "Wijesinghe", "Ranasinghe", "Balasooriya", "Karunarathna", "Mendis",
    "Seneviratne", "Weerasinghe", "Nanayakkara", "Amarasinghe", "Cooray",
    "Ratnayake", "Wijesekara", "Jayawardena", "Senanayake", "Munasinghe",
]

STREAMS = [
    "PHYSICAL_SCIENCE", "BIOLOGICAL_SCIENCE", "COMMERCE", "TECHNOLOGY", "ARTS"
]
STREAM_WEIGHT = [0.22, 0.25, 0.22, 0.13, 0.18]

MEDIUMS = ["SINHALA", "TAMIL", "ENGLISH"]
MEDIUM_WEIGHT = [0.70, 0.20, 0.10]

OL_GRADES = ["A", "B", "C", "S", "W"]
OL_GRADE_WEIGHT = [0.25, 0.35, 0.25, 0.10, 0.05]

OL_SUBJECTS = [
    "MATHEMATICS", "SCIENCE", "ENGLISH", "SINHALA_LANGUAGE",
    "HISTORY", "GEOGRAPHY", "ICT", "COMMERCE", "HEALTH_PHYSICAL_EDUCATION",
    "ART_PAINTING", "RELIGION",
]


def random_gender():
    return random.choice(["MALE", "FEMALE"])


def random_name(gender):
    first = random.choice(MALE_FIRST if gender == "MALE" else FEMALE_FIRST)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"


def random_dob(min_age=15, max_age=19):
    today = datetime.date.today()
    age_days = random.randint(min_age * 365, max_age * 365)
    dob = today - datetime.timedelta(days=age_days)
    return dob


def dob_to_nic_new(dob: datetime.date, gender: str) -> str:
    year = dob.year
    day_of_year = dob.timetuple().tm_yday
    if gender == "FEMALE":
        day_of_year += 500
    return f"{year}{day_of_year:03d}{random.randint(1000, 9999)}"


def random_phone():
    prefixes = ["071", "072", "076", "077", "078"]
    return random.choice(prefixes) + str(random.randint(1000000, 9999999))


def random_email(name: str) -> str:
    safe = name.lower().replace(" ", ".").replace("'", "")
    return f"{safe}{random.randint(10, 99)}@gmail.com"


def random_address():
    streets = ["Galle Road", "Kandy Road", "Colombo Road", "Temple Road", "Main Street",
               "New Road", "Station Road", "Lake Road", "School Lane", "Market Place"]
    cities = ["Colombo", "Kandy", "Galle", "Matara", "Negombo", "Kurunegala",
              "Ratnapura", "Anuradhapura", "Badulla", "Trincomalee", "Batticaloa",
              "Jaffna", "Vavuniya", "Hambantota", "Ampara"]
    return f"{random.randint(10, 999)} {random.choice(streets)}, {random.choice(cities)}"


def random_ol_results(student_id: int, n: int = 7) -> list:
    subjects = random.sample(OL_SUBJECTS, min(n, len(OL_SUBJECTS)))
    rows = []
    for subj in subjects:
        grade = random.choices(OL_GRADES, weights=OL_GRADE_WEIGHT)[0]
        rows.append((student_id, subj, grade, 2024))
    return rows


def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


# ── Build INSERT rows ─────────────────────────────────────────────────────────

def make_student(i: int, student_type: str, reg_status: str, grade: str) -> dict:
    gender = random_gender()
    name = random_name(gender)
    dob = random_dob()
    nic = dob_to_nic_new(dob, gender)
    stream = random.choices(STREAMS, weights=STREAM_WEIGHT)[0]
    medium = random.choices(MEDIUMS, weights=MEDIUM_WEIGHT)[0]
    phone = random_phone()
    parent_names = [f"Mr. {random.choice(LAST_NAMES)}", f"Mrs. {random.choice(LAST_NAMES)}"]

    adm = None
    if reg_status == "ACTIVE":
        adm = f"ADM{2024000 + i:05d}"

    rejection_reason = None
    if reg_status == "REJECTED":
        reasons = [
            "Insufficient OL results for selected stream",
            "Age does not meet entry requirements",
            "Incomplete application documentation",
            "Stream quota full for this intake",
            "Failed to attend scheduled interview",
        ]
        rejection_reason = random.choice(reasons)

    return {
        "admissionNumber": adm,
        "fullName": name,
        "email": random_email(name),
        "dateOfBirth": dob.isoformat(),
        "gender": gender,
        "address": random_address(),
        "contactNumber": phone,
        "whatsappNumber": phone,
        "nicNumber": nic,
        "grade": grade,
        "alStream": stream,
        "stream": stream,
        "medium": medium,
        "parentName": random.choice(parent_names),
        "parentContactNumber": random_phone(),
        "alApplicationStatus": "APPLIED" if student_type == "EXTERNAL" else "NOT_APPLIED",
        "studentType": student_type,
        "registrationStatus": reg_status,
        "rejectionReason": rejection_reason,
    }


def student_to_sql(s: dict) -> str:
    cols = [
        "admission_number", "full_name", "email", "date_of_birth", "gender",
        "address", "contact_number", "whatsapp_number", "nic_number", "grade",
        "al_stream", "stream", "medium", "parent_name", "parent_contact_number",
        "al_application_status", "student_type", "registration_status", "rejection_reason",
    ]
    vals = [
        esc(s["admissionNumber"]), esc(s["fullName"]), esc(s["email"]),
        esc(s["dateOfBirth"]), esc(s["gender"]), esc(s["address"]),
        esc(s["contactNumber"]), esc(s["whatsappNumber"]), esc(s["nicNumber"]),
        esc(s["grade"]), esc(s["alStream"]), esc(s["stream"]), esc(s["medium"]),
        esc(s["parentName"]), esc(s["parentContactNumber"]),
        esc(s["alApplicationStatus"]), esc(s["studentType"]),
        esc(s["registrationStatus"]), esc(s["rejectionReason"]),
    ]
    return f"INSERT INTO students ({', '.join(cols)}) VALUES ({', '.join(vals)});"


def ol_to_sql(student_id: int, subject: str, grade: str, year: int) -> str:
    return (
        f"INSERT IGNORE INTO ol_results (student_id, subject, grade, exam_year) "
        f"VALUES ({student_id}, {esc(subject)}, {esc(grade)}, {year});"
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--database", default="SIMS")
    args = parser.parse_args()

    conn = mysql.connector.connect(
        host=args.host, port=args.port,
        user=args.user, password=args.password,
        database=args.database,
    )
    cur = conn.cursor()

    print("Checking existing data...")
    cur.execute("SELECT COUNT(*) FROM students")
    existing = cur.fetchone()[0]
    if existing > 20:
        print(f"Already {existing} students in DB. Skipping seed to avoid duplication.")
        print("To force re-seed, truncate the students table first.")
        conn.close()
        return

    students = []

    # 100 internal ACTIVE students (grade 12 and 13)
    for i in range(1, 101):
        grade = "12" if i <= 60 else "13"
        students.append(make_student(i, "INTERNAL", "ACTIVE", grade))

    # 60 external PENDING_APPROVAL applicants
    for i in range(101, 161):
        students.append(make_student(i, "EXTERNAL", "PENDING_APPROVAL", "12"))

    # 25 external REJECTED
    for i in range(161, 186):
        students.append(make_student(i, "EXTERNAL", "REJECTED", "12"))

    # 15 external SCHEDULED
    for i in range(186, 201):
        students.append(make_student(i, "EXTERNAL", "SCHEDULED", "12"))

    print(f"Inserting {len(students)} students...")
    inserted_ids = []
    for s in students:
        sql = student_to_sql(s)
        try:
            cur.execute(sql)
            inserted_ids.append((cur.lastrowid, s["studentType"], s["alStream"]))
        except mysql.connector.Error as e:
            print(f"  Skipped (duplicate NIC?): {e}")

    conn.commit()

    # OL results for external applicants only (internal students don't need them for scoring)
    external_ids = [(rid, stream) for rid, stype, stream in inserted_ids if stype == "EXTERNAL"]
    print(f"Inserting OL results for {len(external_ids)} external applicants...")
    for (student_id, stream) in external_ids:
        n_subjects = random.randint(6, 9)
        results = random_ol_results(student_id, n=n_subjects)
        for (sid, subject, grade, year) in results:
            try:
                cur.execute(ol_to_sql(student_id, subject, grade, year))
            except mysql.connector.Error:
                pass

    # Also add some OL results for internal students (for completeness)
    internal_ids = [rid for rid, stype, _ in inserted_ids if stype == "INTERNAL"]
    print(f"Inserting OL results for {len(internal_ids)} internal students...")
    for student_id in internal_ids:
        results = random_ol_results(student_id, n=random.randint(7, 9))
        for (sid, subject, grade, year) in results:
            try:
                cur.execute(ol_to_sql(student_id, subject, grade, year))
            except mysql.connector.Error:
                pass

    conn.commit()
    conn.close()

    counts = {}
    for _, stype, stream in inserted_ids:
        key = f"{stype}/{stream}"
        counts[key] = counts.get(key, 0) + 1

    print("\nDone! Summary:")
    print(f"  Total students inserted: {len(inserted_ids)}")
    print(f"  Internal ACTIVE:         {sum(1 for _, t, _ in inserted_ids if t == 'INTERNAL')}")
    print(f"  External (all):          {sum(1 for _, t, _ in inserted_ids if t == 'EXTERNAL')}")
    print("\nExternal by stream:")
    for k, v in sorted(counts.items()):
        if k.startswith("EXTERNAL"):
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
