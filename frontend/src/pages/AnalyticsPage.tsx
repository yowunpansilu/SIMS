import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Save, ChevronDown, ChevronUp, Trophy, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { ALStream } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────

const STREAMS: ALStream[] = [
    "PHYSICAL_SCIENCE",
    "BIOLOGICAL_SCIENCE",
    "COMMERCE",
    "TECHNOLOGY",
    "ARTS",
];

const GRADE_COLORS: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    B: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    C: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    S: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    W: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_STYLES: Record<string, string> = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    SCHEDULED:        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    REJECTED:         "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    ACTIVE:           "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const STATUS_LABEL: Record<string, string> = {
    PENDING_APPROVAL: "Pending",
    SCHEDULED:        "Scheduled",
    REJECTED:         "Rejected",
    ACTIVE:           "Active",
};

function subjectLabel(code: string): string {
    const map: Record<string, string> = {
        MATHEMATICS: "Maths", SCIENCE: "Science", ENGLISH: "English",
        SINHALA_LANGUAGE: "Sinhala", TAMIL_LANGUAGE: "Tamil",
        HISTORY: "History", GEOGRAPHY: "Geography", ICT: "ICT",
        COMMERCE: "Commerce", HEALTH_PHYSICAL_EDUCATION: "Health",
        ART_PAINTING: "Art", RELIGION: "Religion",
        BUSINESS_ACCOUNTING: "Bus. Acc",
    };
    return map[code] ?? code.replace(/_/g, " ");
}

// ── Types ──────────────────────────────────────────────────────────────────

interface RankedApplicant {
    studentId: number;
    fullName: string;
    nicNumber: string;
    email: string;
    alStream: string;
    totalScore: number;
    subjectGrades: Record<string, string>;
    registrationStatus: string;
    rank: number;
}

interface ScoreConfig {
    subjectCode: string;
    weight: number;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const [stream, setStream]             = useState<ALStream>("PHYSICAL_SCIENCE");
    const [ranked, setRanked]             = useState<RankedApplicant[]>([]);
    const [isLoading, setIsLoading]       = useState(false);
    const [gradeFilters, setGradeFilters] = useState<Record<string, string>>({});
    const [expandedId, setExpandedId]     = useState<number | null>(null);
    const [configs, setConfigs]           = useState<ScoreConfig[]>([]);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const fetchRanked = useCallback(async (s: ALStream) => {
        setIsLoading(true);
        try {
            const res = await api.get<RankedApplicant[]>(`/applications/ranked?stream=${s}`);
            setRanked(res.data);
        } catch {
            toast.error("Failed to load ranked applicants");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchConfig = useCallback(async (s: ALStream) => {
        try {
            const res = await api.get<ScoreConfig[]>(`/score-config/${s}`);
            setConfigs(res.data);
        } catch {
            setConfigs([]);
        }
    }, []);

    useEffect(() => {
        fetchRanked(stream);
        fetchConfig(stream);
    }, [stream, fetchRanked, fetchConfig]);

    const allSubjects = Array.from(new Set(ranked.flatMap((r) => Object.keys(r.subjectGrades))));

    const filtered = ranked.filter((r) =>
        Object.entries(gradeFilters).every(([subj, grade]) => !grade || r.subjectGrades[subj] === grade)
    );

    const handleSaveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await api.put(`/score-config/${stream}`, configs);
            toast.success("Score weights saved");
            fetchRanked(stream);
        } catch {
            toast.error("Failed to save config");
        } finally {
            setIsSavingConfig(false);
        }
    };

    const onStreamChange = (s: ALStream) => {
        setStream(s);
        setGradeFilters({});
        setExpandedId(null);
    };

    const rankBadge = (rank: number) => {
        if (rank === 1) return <span title="1st">🥇</span>;
        if (rank === 2) return <span title="2nd">🥈</span>;
        if (rank === 3) return <span title="3rd">🥉</span>;
        return <span className="text-muted-foreground font-mono tabular-nums text-xs">{rank}</span>;
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="border-b px-8 py-5 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Application Analytics</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Ranked applicants by OL score per A/L stream
                </p>
            </div>

            <div className="flex-1 flex flex-col px-8 py-6 gap-5">

                {/* ── Stream pills ─────────────────────────────────────── */}
                <div className="flex gap-2 flex-wrap">
                    {STREAMS.map((s) => (
                        <button
                            key={s}
                            onClick={() => onStreamChange(s)}
                            className={cn(
                                "rounded-full px-5 py-1.5 text-sm font-semibold border transition-all",
                                stream === s
                                    ? "bg-foreground text-background border-foreground shadow"
                                    : "text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                            )}
                        >
                            {AL_STREAM_LABELS[s]}
                        </button>
                    ))}
                </div>

                {/* ── Inner tabs: Rankings / Score Weights ─────────────── */}
                <Tabs defaultValue="rankings" className="flex-1 flex flex-col gap-4">
                    <TabsList className="w-fit h-9">
                        <TabsTrigger value="rankings" className="gap-2 px-4">
                            <Trophy className="h-3.5 w-3.5" />
                            Rankings
                            {!isLoading && filtered.length > 0 && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums">
                                    {filtered.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="weights" className="gap-2 px-4">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            Score Weights
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Rankings ──────────────────────────────────────── */}
                    <TabsContent value="rankings" className="flex-1 flex flex-col gap-4 mt-0">

                        {/* Grade filters */}
                        {allSubjects.length > 0 && (
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-xs font-medium text-muted-foreground self-end pb-1">
                                    Filter by OL grade:
                                </span>
                                {allSubjects.map((subj) => (
                                    <div key={subj} className="flex flex-col gap-1">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                            {subjectLabel(subj)}
                                        </Label>
                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                            value={gradeFilters[subj] ?? ""}
                                            onChange={(e) =>
                                                setGradeFilters((prev) => ({ ...prev, [subj]: e.target.value }))
                                            }
                                        >
                                            <option value="">Any</option>
                                            {["A", "B", "C", "S", "W"].map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                                {Object.values(gradeFilters).some(Boolean) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs self-end"
                                        onClick={() => setGradeFilters({})}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        <div className="rounded-xl border overflow-hidden">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                                    <Trophy className="h-10 w-10 opacity-20" />
                                    <p className="text-sm">No applicants found for this stream.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm border-collapse">
                                    <thead className="bg-muted/60">
                                        <tr>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-14">#</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Name</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-40">NIC</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-24">Score</th>
                                            <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground w-28">Status</th>
                                            <th className="w-8" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => {
                                            const isExpanded = expandedId === r.studentId;
                                            return (
                                                <>
                                                    <tr
                                                        key={r.studentId}
                                                        className={cn(
                                                            "border-t border-border/50 cursor-pointer transition-colors select-none",
                                                            isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
                                                        )}
                                                        onClick={() => setExpandedId(isExpanded ? null : r.studentId)}
                                                    >
                                                        <td className="px-5 py-3.5 text-base">{rankBadge(r.rank)}</td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="font-semibold">{r.fullName}</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">{r.email}</div>
                                                        </td>
                                                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{r.nicNumber}</td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="text-xl font-bold tabular-nums">{r.totalScore.toFixed(1)}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className={cn(
                                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                                                                STATUS_STYLES[r.registrationStatus] ?? "bg-muted text-muted-foreground"
                                                            )}>
                                                                {STATUS_LABEL[r.registrationStatus] ?? r.registrationStatus}
                                                            </span>
                                                        </td>
                                                        <td className="pr-4 py-3.5">
                                                            {isExpanded
                                                                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                                        </td>
                                                    </tr>

                                                    {/* Expanded OL results row */}
                                                    {isExpanded && (
                                                        <tr key={`${r.studentId}-detail`} className="border-t border-border/30 bg-muted/20">
                                                            <td colSpan={6} className="px-8 py-5">
                                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                                    OL Results
                                                                </p>
                                                                {Object.keys(r.subjectGrades).length === 0 ? (
                                                                    <p className="text-xs text-muted-foreground italic">No OL results recorded.</p>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {Object.entries(r.subjectGrades).map(([subj, grade]) => (
                                                                            <div
                                                                                key={subj}
                                                                                className={cn(
                                                                                    "flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium",
                                                                                    GRADE_COLORS[grade] ?? "bg-muted text-muted-foreground border-border"
                                                                                )}
                                                                            >
                                                                                <span className="opacity-70 text-xs">{subjectLabel(subj)}</span>
                                                                                <span className="font-bold text-base">{grade}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Score Weights ──────────────────────────────────── */}
                    <TabsContent value="weights" className="mt-0">
                        <div className="max-w-xl space-y-5">
                            <div>
                                <h2 className="text-base font-semibold">
                                    Score Weights — {AL_STREAM_LABELS[stream]}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Set how much each OL subject counts toward the ranking score.
                                    Total score = Σ (grade points × weight). Default weight is 1.0.
                                </p>
                            </div>

                            {/* Grade points reference */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-xs text-muted-foreground font-medium">Grade points:</span>
                                {[["A", "5"], ["B", "4"], ["C", "3"], ["S", "2"], ["W", "0"]].map(([g, p]) => (
                                    <span key={g} className="flex items-center gap-1.5 text-xs">
                                        <span className={cn("rounded px-2 py-0.5 text-xs font-bold", GRADE_COLORS[g])}>{g}</span>
                                        <span className="text-muted-foreground">= {p}</span>
                                    </span>
                                ))}
                            </div>

                            {/* Config table */}
                            <div className="rounded-xl border overflow-hidden">
                                <div className="bg-muted/60 px-5 py-2.5 grid grid-cols-[1fr_120px_40px] text-xs font-semibold text-muted-foreground">
                                    <span>Subject Code</span>
                                    <span className="text-center">Weight</span>
                                    <span />
                                </div>
                                {configs.length === 0 && (
                                    <div className="px-5 py-5 text-sm text-muted-foreground italic">
                                        No weights configured — all subjects score at weight 1.0.
                                    </div>
                                )}
                                <div className="divide-y">
                                    {configs.map((cfg, i) => (
                                        <div key={i} className="grid grid-cols-[1fr_120px_40px] items-center gap-3 px-5 py-2.5">
                                            <Input
                                                className="h-9 font-mono text-sm"
                                                placeholder="e.g. MATHEMATICS"
                                                value={cfg.subjectCode}
                                                onChange={(e) =>
                                                    setConfigs((prev) =>
                                                        prev.map((c, j) => j === i ? { ...c, subjectCode: e.target.value.toUpperCase() } : c)
                                                    )
                                                }
                                            />
                                            <Input
                                                className="h-9 text-sm text-center"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={cfg.weight}
                                                onChange={(e) =>
                                                    setConfigs((prev) =>
                                                        prev.map((c, j) => j === i ? { ...c, weight: parseFloat(e.target.value) || 1 } : c)
                                                    )
                                                }
                                            />
                                            <button
                                                className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-lg"
                                                onClick={() => setConfigs((prev) => prev.filter((_, j) => j !== i))}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setConfigs((prev) => [...prev, { subjectCode: "", weight: 1.0 }])}
                                >
                                    + Add Subject
                                </Button>
                                <Button
                                    disabled={isSavingConfig || configs.length === 0}
                                    onClick={handleSaveConfig}
                                >
                                    {isSavingConfig
                                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        : <Save className="mr-2 h-4 w-4" />}
                                    Save Weights
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
