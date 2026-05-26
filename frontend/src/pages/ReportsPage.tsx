import { useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Download,
    Users,
    BarChart3,
    Loader2,
    Filter,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { Student, ALStream } from "@/types";

const API_BASE = (api.defaults.baseURL ?? "").replace(/\/$/, "");

type ReportType = "all-students" | "by-grade" | "by-stream" | "by-gender";

const REPORT_TYPES: { id: ReportType; label: string; description: string; icon: React.ElementType }[] = [
    { id: "all-students", label: "All Students",  description: "Complete active student list",       icon: Users    },
    { id: "by-grade",     label: "By Grade",      description: "Filter by Grade 12 or 13",           icon: BarChart3 },
    { id: "by-stream",    label: "By Stream",     description: "Filter by A/L stream",               icon: FileText  },
    { id: "by-gender",    label: "By Gender",     description: "Filter by male or female",           icon: Users    },
];

const AL_STREAMS: ALStream[] = [
    "PHYSICAL_SCIENCE", "BIOLOGICAL_SCIENCE", "COMMERCE", "TECHNOLOGY", "ARTS",
];

function escapeCSV(val: string | number | undefined | null): string {
    const s = val == null ? "" : String(val);
    return `"${s.replace(/"/g, '""')}"`;
}

function studentsToCSV(students: Student[]): string {
    if (students.length === 0) return "No data";
    const headers = [
        "Admission Number", "Full Name", "Gender", "Date of Birth",
        "Grade", "Stream", "Medium", "NIC", "Email",
        "Contact Number", "Address",
    ];
    const rows = students.map((s) => [
        s.admissionNumber,
        s.fullName,
        s.gender,
        s.dateOfBirth ?? "",
        s.grade,
        s.alStream ? (AL_STREAM_LABELS[s.alStream] ?? s.alStream) : "",
        s.medium ?? "",
        s.nicNumber ?? "",
        s.email ?? "",
        s.contactNumber ?? "",
        s.address ?? "",
    ].map(escapeCSV).join(","));
    return [headers.map(escapeCSV).join(","), ...rows].join("\n");
}

function downloadCSV(data: string, filename: string) {
    const blob = new Blob(["﻿" + data], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<ReportType>("all-students");
    const [filterGrade,  setFilterGrade]  = useState("all");
    const [filterStream, setFilterStream] = useState("all");
    const [filterGender, setFilterGender] = useState("all");
    const [isGenerating,    setIsGenerating]    = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleGenerateCSV = async () => {
        setIsGenerating(true);
        try {
            const res = await api.get<Student[]>("/students");
            let students = res.data.filter((s) => s.registrationStatus === "ACTIVE");
            let filename = "sims-report";

            if (selectedReport === "by-grade" && filterGrade !== "all") {
                students = students.filter((s) => s.grade === filterGrade);
                filename  = `grade-${filterGrade}-students`;
            } else if (selectedReport === "by-stream" && filterStream !== "all") {
                students = students.filter((s) => s.alStream === filterStream);
                filename  = `${filterStream.toLowerCase()}-stream-students`;
            } else if (selectedReport === "by-gender" && filterGender !== "all") {
                students = students.filter((s) => s.gender === filterGender);
                filename  = `${filterGender.toLowerCase()}-students`;
            } else {
                filename = `${selectedReport}-students`;
            }

            if (students.length === 0) {
                toast.error("No students match the selected criteria");
                return;
            }

            downloadCSV(studentsToCSV(students), `${filename}.csv`);
            toast.success(`Downloaded ${students.length} student records`);
        } catch {
            toast.error("Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGeneratePDF = async () => {
        setIsGeneratingPdf(true);
        try {
            const params = new URLSearchParams();
            if (selectedReport === "by-grade"  && filterGrade  !== "all") params.set("grade",    filterGrade);
            if (selectedReport === "by-stream" && filterStream !== "all") params.set("alStream", filterStream);
            if (selectedReport === "by-gender" && filterGender !== "all") params.set("gender",   filterGender);

            const url = `${API_BASE}/students/export/pdf${params.size > 0 ? "?" + params.toString() : ""}`;
            const res = await api.get(url, { responseType: "blob" });
            const blob = new Blob([res.data], { type: "application/pdf" });
            const a    = document.createElement("a");
            a.href     = URL.createObjectURL(blob);
            a.download = "students-report.pdf";
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success("PDF downloaded");
        } catch {
            toast.error("Failed to generate PDF");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const busy = isGenerating || isGeneratingPdf;

    return (
        <PageContainer title="Reports" description="Generate and export student reports">
            <div className="grid gap-6 lg:grid-cols-3">

                {/* ── Report Type Selection ─────────────────────────── */}
                <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-1 text-base font-semibold">Report Type</h3>
                    <p className="text-xs text-muted-foreground mb-4">Choose what to include in the export</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {REPORT_TYPES.map(({ id, label, description, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => {
                                    setSelectedReport(id);
                                    setFilterGrade("all");
                                    setFilterStream("all");
                                    setFilterGender("all");
                                }}
                                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                    selectedReport === id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "hover:border-primary/40 hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Filters + Export ──────────────────────────────── */}
                <div className="space-y-4">
                    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-base font-semibold">Filters</h3>
                        </div>

                        {/* Grade filter */}
                        {selectedReport === "by-grade" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Grade</label>
                                <Select value={filterGrade} onValueChange={setFilterGrade}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Grades</SelectItem>
                                        <SelectItem value="12">Grade 12</SelectItem>
                                        <SelectItem value="13">Grade 13</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Stream filter */}
                        {selectedReport === "by-stream" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">A/L Stream</label>
                                <Select value={filterStream} onValueChange={setFilterStream}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Streams</SelectItem>
                                        {AL_STREAMS.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {AL_STREAM_LABELS[s]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Gender filter */}
                        {selectedReport === "by-gender" && (
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Gender</label>
                                <Select value={filterGender} onValueChange={setFilterGender}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Genders</SelectItem>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {selectedReport === "all-students" && (
                            <p className="text-sm text-muted-foreground">
                                Exports all active students with no filter.
                            </p>
                        )}

                        {/* Active filter summary */}
                        {((selectedReport === "by-grade"  && filterGrade  !== "all") ||
                          (selectedReport === "by-stream" && filterStream !== "all") ||
                          (selectedReport === "by-gender" && filterGender !== "all")) && (
                            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary font-medium">
                                {selectedReport === "by-grade"  && `Filtering: Grade ${filterGrade}`}
                                {selectedReport === "by-stream" && `Filtering: ${AL_STREAM_LABELS[filterStream as ALStream] ?? filterStream}`}
                                {selectedReport === "by-gender" && `Filtering: ${filterGender.charAt(0) + filterGender.slice(1).toLowerCase()}`}
                            </div>
                        )}
                    </div>

                    <Button className="w-full h-11" onClick={handleGenerateCSV} disabled={busy}>
                        {isGenerating
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <Download className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Generating…" : "Download CSV"}
                    </Button>

                    <Button variant="outline" className="w-full h-11" onClick={handleGeneratePDF} disabled={busy}>
                        {isGeneratingPdf
                            ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            : <FileText className="mr-2 h-4 w-4" />}
                        {isGeneratingPdf ? "Generating PDF…" : "Export as PDF"}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
