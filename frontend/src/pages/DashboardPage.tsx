import { useNavigate } from "react-router-dom";
import { useDashboard } from "@/hooks/useDashboard";
import PageContainer from "@/components/layout/PageContainer";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    GraduationCap,
    BookOpen,
    UserPlus,
    Upload,
    BarChart3,
    RefreshCw,
    AlertCircle,
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

// Chart color constants
const STREAM_COLORS: Record<string, string> = {
    SCIENCE: "hsl(210, 80%, 55%)",
    COMMERCE: "hsl(145, 65%, 42%)",
    ARTS: "hsl(280, 65%, 55%)",
    TECHNOLOGY: "hsl(25, 90%, 55%)",
    OTHER: "hsl(0, 0%, 60%)",
};

const GENDER_COLORS: Record<string, string> = {
    MALE: "hsl(210, 70%, 50%)",
    FEMALE: "hsl(330, 70%, 55%)",
    OTHER: "hsl(0, 0%, 60%)",
};

export default function DashboardPage() {
    const { stats, isLoading, error, refresh } = useDashboard();
    const navigate = useNavigate();

    // Prepare chart data
    const streamData = Object.entries(stats.streamCounts).map(([name, value]) => ({
        name: name.charAt(0) + name.slice(1).toLowerCase(),
        value,
        fill: STREAM_COLORS[name] || STREAM_COLORS.OTHER,
    }));

    const genderData = [
        { name: "Male", value: stats.maleCount, fill: GENDER_COLORS.MALE },
        { name: "Female", value: stats.femaleCount, fill: GENDER_COLORS.FEMALE },
    ].filter((d) => d.value > 0);

    const gradeData = [
        { grade: "Grade 12", count: stats.grade12Count },
        { grade: "Grade 13", count: stats.grade13Count },
    ];

    if (error) {
        return (
            <PageContainer title="Dashboard" description="Overview of student information">
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16">
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
            {/* ── Stat Cards ── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-lg border bg-card p-6">
                            <Skeleton className="h-4 w-24 mb-3" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
                        <StatCard title="Grade 12" value={stats.grade12Count} icon={BookOpen} />
                        <StatCard title="Grade 13" value={stats.grade13Count} icon={GraduationCap} />
                        <StatCard
                            title="New Admissions"
                            value={stats.recentStudents.length}
                            icon={UserPlus}
                            description="Recent entries"
                        />
                    </>
                )}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Stream Distribution */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Stream Distribution</h3>
                    {isLoading ? (
                        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : streamData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={streamData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    strokeWidth={2}
                                    stroke="hsl(var(--card))"
                                >
                                    {streamData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                            No data available
                        </div>
                    )}
                </div>

                {/* Gender Distribution */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Gender Distribution</h3>
                    {isLoading ? (
                        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
                    ) : genderData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    strokeWidth={2}
                                    stroke="hsl(var(--card))"
                                >
                                    {genderData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                            No data available
                        </div>
                    )}
                </div>

                {/* Grade Distribution */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Grade Distribution</h3>
                    {isLoading ? (
                        <div className="space-y-3 pt-4">
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={gradeData} barSize={48}>
                                <XAxis dataKey="grade" tick={{ fontSize: 13 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                    }}
                                />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Bottom Row: Recent Students + Quick Actions ── */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Recent Students */}
                <div className="rounded-lg border bg-card p-6 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-lg font-semibold">Recent Students</h3>
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : stats.recentStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Admission No
                                        </th>
                                        <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Name
                                        </th>
                                        <th className="pb-3 pr-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Grade
                                        </th>
                                        <th className="pb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Stream
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/students/${student.id}`)}
                                        >
                                            <td className="py-3 pr-4 font-mono text-xs">
                                                {student.admissionNumber}
                                            </td>
                                            <td className="py-3 pr-4 font-medium">{student.fullName}</td>
                                            <td className="py-3 pr-4">{student.grade}</td>
                                            <td className="py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                        student.stream === "SCIENCE" && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                                                        student.stream === "COMMERCE" && "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                                                        student.stream === "ARTS" && "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
                                                        student.stream === "TECHNOLOGY" && "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                                    )}
                                                >
                                                    {student.stream.charAt(0) + student.stream.slice(1).toLowerCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12"
                            onClick={() => navigate("/students")}
                        >
                            <UserPlus className="h-5 w-5 text-primary" />
                            Add New Student
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12"
                            onClick={() => navigate("/import")}
                        >
                            <Upload className="h-5 w-5 text-primary" />
                            Import Data
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-3 h-12"
                            onClick={() => navigate("/reports")}
                        >
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
