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
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Student } from "@/types";

type ReportType = "all-students" | "by-grade" | "by-stream" | "by-gender";

const reportTypes: { id: ReportType; label: string; description: string; icon: React.ElementType }[] = [
    { id: "all-students", label: "All Students", description: "Complete student list", icon: Users },
    { id: "by-grade", label: "By Grade", description: "Students grouped by grade", icon: BarChart3 },
    { id: "by-stream", label: "By Stream", description: "Students grouped by stream", icon: FileText },
    { id: "by-gender", label: "By Gender", description: "Students grouped by gender", icon: Users },
];

function downloadCSV(data: string, filename: string) {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function studentsToCSV(students: Student[]): string {
    if (students.length === 0) return "No data";
    const headers = ["Admission Number", "Full Name", "Gender", "Date of Birth", "Grade", "Stream", "Contact Number", "Address"];
    const rows = students.map((s) => [
        s.admissionNumber,
        s.fullName,
        s.gender,
        s.dateOfBirth || "",
        s.grade,
        s.stream,
        s.contactNumber || "",
        s.address || "",
    ]);
    return [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
}

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<ReportType>("all-students");
    const [filterGrade, setFilterGrade] = useState<string>("all");
    const [filterStream, setFilterStream] = useState<string>("all");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await api.get<Student[]>("/students");
            let students = res.data;
            let filename = "sims-report";

            switch (selectedReport) {
                case "all-students":
                    filename = "all-students";
                    break;
                case "by-grade":
                    if (filterGrade !== "all") {
                        students = students.filter((s) => s.grade === Number(filterGrade));
                        filename = `grade-${filterGrade}-students`;
                    } else {
                        filename = "students-by-grade";
                    }
                    break;
                case "by-stream":
                    if (filterStream !== "all") {
                        students = students.filter((s) => s.stream === filterStream);
                        filename = `${filterStream.toLowerCase()}-stream-students`;
                    } else {
                        filename = "students-by-stream";
                    }
                    break;
                case "by-gender":
                    filename = "students-by-gender";
                    break;
            }

            if (students.length === 0) {
                toast.error("No students match the selected criteria");
                return;
            }

            const csv = studentsToCSV(students);
            downloadCSV(csv, `${filename}.csv`);
            toast.success(`Downloaded ${students.length} student records`);
        } catch {
            toast.error("Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <PageContainer title="Reports" description="Generate and export student reports">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Report Type Selection */}
                <div className="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Select Report Type</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {reportTypes.map(({ id, label, description, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedReport(id)}
                                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${selectedReport === id
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "hover:border-primary/50 hover:bg-muted/50"
                                    }`}
                            >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{label}</p>
                                    <p className="text-xs text-muted-foreground">{description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters & Generate */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Filters</h3>
                        <div className="space-y-4">
                            {selectedReport === "by-grade" && (
                                <div className="space-y-2">
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

                            {selectedReport === "by-stream" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stream</label>
                                    <Select value={filterStream} onValueChange={setFilterStream}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Streams</SelectItem>
                                            <SelectItem value="SCIENCE">Science</SelectItem>
                                            <SelectItem value="COMMERCE">Commerce</SelectItem>
                                            <SelectItem value="ARTS">Arts</SelectItem>
                                            <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(selectedReport === "all-students" || selectedReport === "by-gender") && (
                                <p className="text-sm text-muted-foreground">
                                    No additional filters for this report type.
                                </p>
                            )}
                        </div>
                    </div>

                    <Button className="w-full h-12" onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        {isGenerating ? "Generating…" : "Generate & Download CSV"}
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
}
