import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import PageContainer from "@/components/layout/PageContainer";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    Upload,
    FileBarChart,
    RefreshCw,
    AlertCircle,
    ClipboardCheck,
    ArrowRight,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import api from "@/lib/api";
import type { ALStream } from "@/types";

interface OLSubjectSummary {
    subject: string;
    pass: number;
    fail: number;
    [grade: string]: string | number;
}

// ── AL Stream colours ────────────────────────────────────────────────────────
const STREAM_HEX: Record<string, string> = {
    PHYSICAL_SCIENCE:   "hsl(213, 80%, 52%)",
    BIOLOGICAL_SCIENCE: "hsl(145, 60%, 40%)",
    COMMERCE:           "hsl(270, 65%, 55%)",
    TECHNOLOGY:         "hsl(25, 88%, 52%)",
    ARTS:               "hsl(340, 70%, 52%)",
};

const STREAM_BADGE: Record<string, string> = {
    PHYSICAL_SCIENCE:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    BIOLOGICAL_SCIENCE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    COMMERCE:           "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY:         "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    ARTS:               "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const GENDER_COLORS = ["hsl(213, 70%, 50%)", "hsl(330, 70%, 55%)"];

// Short subject abbreviations for the OL chart X-axis
const SUBJECT_SHORT: Record<string, string> = {
    MATHEMATICS: "Maths",
    SCIENCE: "Science",
    ENGLISH: "English",
    SINHALA_LANGUAGE: "Sinhala",
    TAMIL_LANGUAGE: "Tamil",
    HISTORY: "History",
    GEOGRAPHY: "Geo",
    ICT: "ICT",
    COMMERCE: "Commerce",
    HEALTH_PHYSICAL_EDUCATION: "Health",
    ART_PAINTING: "Art",
    RELIGION: "Religion",
    BUSINESS_ACCOUNTING: "Bus.Acc",
    CIVIC_EDUCATION: "Civics",
};

function shortSubject(code: string): string {
    return SUBJECT_SHORT[code] ?? code.replace(/_/g, " ").split(" ").slice(0, 2).join(" ");
}

// ── Custom pie chart label ────────────────────────────────────────────────────
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
    if (value === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {value}
        </text>
    );
};

export default function DashboardPage() {
    const { stats, isLoading, error, refresh } = useDashboard();
    const navigate = useNavigate();

    const [olSummary, setOlSummary] = useState<OLSubjectSummary[]>([]);
    useEffect(() => {
        api.get<OLSubjectSummary[]>("/dashboard/ol-summary")
            .then((r) => setOlSummary(r.data))
            .catch(() => setOlSummary([]));
    }, []);

    // Stream pie data — uses alStream keys from backend
    const streamData = Object.entries(stats.streamCounts)
        .filter(([name, value]) => name != null && value > 0)
        .map(([name, value]) => ({
            name: AL_STREAM_LABELS[name as ALStream] ?? name,
            rawName: name,
            value,
        }));

    const genderData = [
        { name: "Male",   value: stats.maleCount   },
        { name: "Female", value: stats.femaleCount  },
    ].filter((d) => d.value > 0);

    const gradeData = [
        { grade: "Grade 12", count: stats.grade12Count },
        { grade: "Grade 13", count: stats.grade13Count },
    ];

    const olData = olSummary.map((s) => ({
        ...s,
        subject: shortSubject(s.subject),
    }));

    const tooltipStyle = {
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "8px",
        fontSize: "13px",
        color: "hsl(var(--foreground))",
    };

    if (error) {
        return (
            <PageContainer title="Dashboard" description="Overview of student information">
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20">
                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">{error}</p>
                    <Button variant="outline" onClick={refresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title="Dashboard"
            description="Overview of student information"
            actions={
                <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            }
        >
            {/* ── Stat Cards ──────────────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border bg-card p-6">
                            <Skeleton className="h-4 w-24 mb-3" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard title="Total Students"  value={stats.totalStudents}        accent="blue"   />
                        <StatCard title="Grade 12"        value={stats.grade12Count}          accent="green"  />
                        <StatCard title="Grade 13"        value={stats.grade13Count}          accent="purple" />
                        <StatCard title="New Admissions"  value={stats.newAdmissionsThisYear} accent="amber"  description="Current Grade 12" />
                    </>
                )}
            </div>

            {/* ── Charts Row ──────────────────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {/* Stream Distribution */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold">Stream Distribution</h3>
                    <p className="text-xs text-muted-foreground mb-4">Active students by A/L stream</p>
                    {isLoading ? (
                        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : streamData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={streamData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        strokeWidth={0}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {streamData.map((entry) => (
                                            <Cell
                                                key={entry.rawName}
                                                fill={STREAM_HEX[entry.rawName] ?? "hsl(0,0%,60%)"}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Custom legend */}
                            <div className="mt-3 flex flex-col gap-1.5">
                                {streamData.map((entry) => (
                                    <div key={entry.rawName} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: STREAM_HEX[entry.rawName] ?? "hsl(0,0%,60%)" }}
                                            />
                                            <span className="text-foreground">{entry.name}</span>
                                        </div>
                                        <span className="font-semibold tabular-nums text-foreground">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                            No data
                        </div>
                    )}
                </div>

                {/* Gender Distribution */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold">Gender Distribution</h3>
                    <p className="text-xs text-muted-foreground mb-4">Male vs female split</p>
                    {isLoading ? (
                        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : genderData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        strokeWidth={0}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {genderData.map((entry, i) => (
                                            <Cell key={entry.name} fill={GENDER_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-3 flex flex-col gap-1.5">
                                {genderData.map((entry, i) => (
                                    <div key={entry.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: GENDER_COLORS[i] }} />
                                            <span className="text-foreground">{entry.name}</span>
                                        </div>
                                        <span className="font-semibold tabular-nums">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data</div>
                    )}
                </div>

                {/* Grade Distribution */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold">Grade Distribution</h3>
                    <p className="text-xs text-muted-foreground mb-4">Students by grade level</p>
                    {isLoading ? (
                        <Skeleton className="h-48 w-full rounded-lg" />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={gradeData} barSize={56}>
                                <XAxis dataKey="grade" tick={{ fontSize: 13 }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── O/L Results Chart ────────────────────────────────────── */}
            {(isLoading || olData.length > 0) && (
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold">O/L Results by Subject</h3>
                    <p className="text-xs text-muted-foreground mb-4">Pass (A–S) vs Fail (W) across all students</p>
                    {isLoading ? (
                        <Skeleton className="h-52 w-full rounded-lg" />
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={olData} barSize={18} barGap={3} margin={{ bottom: 20 }}>
                                <XAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-35}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                                <Legend verticalAlign="top" height={32} />
                                <Bar dataKey="pass" name="Pass" fill="hsl(145, 60%, 40%)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="fail" name="Fail" fill="hsl(0, 68%, 52%)"   radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            )}

            {/* ── Recent Students + Quick Actions ─────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">

                {/* Recent Students */}
                <div className="rounded-xl border bg-card shadow-sm lg:col-span-2 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <div>
                            <h3 className="text-base font-semibold">Recent Students</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Latest admissions</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => navigate("/students")}
                        >
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : stats.recentStudents.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40">
                                    <th className="px-6 py-2.5 text-left text-xs font-semibold text-muted-foreground">Admission No</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-20">Grade</th>
                                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Stream</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {stats.recentStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-muted/40 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/students/${student.id}`)}
                                    >
                                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                                            {student.admissionNumber ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{student.fullName}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{student.grade ?? "—"}</td>
                                        <td className="px-4 py-3">
                                            {student.stream ? (
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    STREAM_BADGE[student.stream] ?? "bg-muted text-muted-foreground"
                                                )}>
                                                    {AL_STREAM_LABELS[student.stream as ALStream] ?? student.stream}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            title="No recent students"
                            description="Newly admitted students will appear here."
                            icon={Users}
                            className="min-h-[200px] border-none shadow-none"
                        />
                    )}
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <h3 className="mb-1 text-base font-semibold">Quick Actions</h3>
                    <p className="text-xs text-muted-foreground mb-4">Common tasks</p>
                    <div className="space-y-2.5">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-11"
                            onClick={() => navigate("/students")}
                        >
                            <Users className="h-4 w-4 text-primary" />
                            View Students
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-11"
                            onClick={() => navigate("/applications")}
                        >
                            <ClipboardCheck className="h-4 w-4 text-primary" />
                            Applications
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-11"
                            onClick={() => navigate("/import")}
                        >
                            <Upload className="h-4 w-4 text-primary" />
                            Import Data
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-11"
                            onClick={() => navigate("/reports")}
                        >
                            <FileBarChart className="h-4 w-4 text-primary" />
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
