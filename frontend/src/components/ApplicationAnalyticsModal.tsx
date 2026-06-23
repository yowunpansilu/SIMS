import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Save, ChevronDown, ChevronUp, SlidersHorizontal, Trophy } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { ALStream, Student } from "@/types";

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
    const short: Record<string, string> = {
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
    };
    return short[code] ?? code.replace(/_/g, " ").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4);
}

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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (student: Student) => void;
    onReject: (student: Student) => void;
}

export default function ApplicationAnalyticsModal({ open, onOpenChange, onApprove, onReject }: Props) {
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
        if (open) {
            fetchRanked(stream);
            fetchConfig(stream);
        }
    }, [open, stream, fetchRanked, fetchConfig]);

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

    const onStreamChange = (s: string) => {
        setStream(s as ALStream);
        setGradeFilters({});
        setExpandedId(null);
    };

    const rankIcon = (rank: number) => {
        if (rank === 1) return <span className="text-amber-500 font-bold">🥇</span>;
        if (rank === 2) return <span className="text-slate-400 font-bold">🥈</span>;
        if (rank === 3) return <span className="text-amber-700 font-bold">🥉</span>;
        return <span className="text-muted-foreground font-mono tabular-nums text-xs">{rank}</span>;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[92vw] w-full max-h-[92vh] overflow-hidden flex flex-col gap-0 p-0">

                {/* ── Header ─────────────────────────────────────────────── */}
                <DialogHeader className="px-6 pt-5 pb-0 shrink-0">
                    <DialogTitle className="text-xl font-semibold">Application Analytics</DialogTitle>
                </DialogHeader>

                {/* ── Stream selector ────────────────────────────────────── */}
                <div className="px-6 pt-4 pb-0 shrink-0">
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {STREAMS.map((s) => (
                            <button
                                key={s}
                                onClick={() => onStreamChange(s)}
                                className={cn(
                                    "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all border",
                                    stream === s
                                        ? "bg-foreground text-background border-foreground shadow-sm"
                                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                                )}
                            >
                                {AL_STREAM_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Inner tabs: Rankings / Score Weights ───────────────── */}
                <Tabs defaultValue="rankings" className="flex-1 overflow-hidden flex flex-col px-6 pt-3 pb-5">
                    <TabsList className="shrink-0 w-fit mb-4 h-8">
                        <TabsTrigger value="rankings" className="gap-1.5 text-xs h-7">
                            <Trophy className="h-3 w-3" />
                            Rankings
                            {filtered.length > 0 && (
                                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
                                    {filtered.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="weights" className="gap-1.5 text-xs h-7">
                            <SlidersHorizontal className="h-3 w-3" />
                            Score Weights
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Rankings tab ─────────────────────────────────────── */}
                    <TabsContent value="rankings" className="flex-1 overflow-hidden flex flex-col mt-0 gap-3">

                        {/* Grade filters */}
                        {allSubjects.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-end shrink-0">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide self-center mr-1">
                                    Filter by OL grade:
                                </span>
                                {allSubjects.map((subj) => (
                                    <div key={subj} className="flex flex-col gap-0.5">
                                        <Label className="text-[10px] text-muted-foreground">{subjectLabel(subj)}</Label>
                                        <select
                                            className="h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                                        className="h-7 text-xs self-end"
                                        onClick={() => setGradeFilters({})}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Table */}
                        <div className="flex-1 overflow-y-auto rounded-lg border">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                                    <Trophy className="h-8 w-8 opacity-20" />
                                    <p className="text-sm">No applicants for this stream yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm border-collapse">
                                    <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-12">#</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Name</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-36">NIC</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-20">Score</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-28">Status</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground w-36">Action</th>
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
                                                            "border-t border-border/50 cursor-pointer transition-colors",
                                                            isExpanded
                                                                ? "bg-muted/60"
                                                                : "hover:bg-muted/30"
                                                        )}
                                                        onClick={() => setExpandedId(isExpanded ? null : r.studentId)}
                                                    >
                                                        <td className="px-4 py-3">{rankIcon(r.rank)}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium leading-tight">{r.fullName}</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">{r.email}</div>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.nicNumber}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-base font-bold tabular-nums">{r.totalScore.toFixed(1)}</span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                                                                STATUS_STYLES[r.registrationStatus] ?? "bg-muted text-muted-foreground"
                                                            )}>
                                                                {STATUS_LABEL[r.registrationStatus] ?? r.registrationStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                            {(r.registrationStatus === "PENDING_APPROVAL" || r.registrationStatus === "SCHEDULED") && (
                                                                <div className="flex justify-end gap-1.5">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                        onClick={() => onApprove({ id: r.studentId, fullName: r.fullName } as Student)}
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 px-2.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
                                                                        onClick={() => onReject({ id: r.studentId, fullName: r.fullName } as Student)}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="pr-3 py-3">
                                                            {isExpanded
                                                                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                                                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                                                        </td>
                                                    </tr>

                                                    {/* Expanded detail row */}
                                                    {isExpanded && (
                                                        <tr key={`${r.studentId}-detail`} className="bg-muted/40 border-t border-border/30">
                                                            <td colSpan={7} className="px-6 py-4">
                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                                                                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium border",
                                                                                        GRADE_COLORS[grade] ?? "bg-muted text-muted-foreground border-border"
                                                                                    )}
                                                                                >
                                                                                    <span className="opacity-70">{subjectLabel(subj)}</span>
                                                                                    <span className="font-bold text-sm">{grade}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
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

                    {/* ── Score Weights tab ─────────────────────────────────── */}
                    <TabsContent value="weights" className="flex-1 overflow-y-auto mt-0">
                        <div className="space-y-4 max-w-lg">
                            <div>
                                <h3 className="text-sm font-semibold">Score Weight Configuration</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Set how much each OL subject counts toward the total score for{" "}
                                    <span className="font-medium text-foreground">{AL_STREAM_LABELS[stream]}</span> applicants.
                                    Default weight is 1.0 (grade points × weight).
                                </p>
                            </div>

                            <div className="rounded-lg border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                                    <span className="flex-1">Subject Code</span>
                                    <span className="w-24 text-center">Weight</span>
                                    <span className="w-8" />
                                </div>
                                {configs.length === 0 && (
                                    <div className="px-4 py-4 text-xs text-muted-foreground italic">
                                        No weights configured — all subjects default to 1.0.
                                    </div>
                                )}
                                <div className="divide-y">
                                    {configs.map((cfg, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                                            <Input
                                                className="h-8 text-xs font-mono flex-1"
                                                placeholder="e.g. MATHEMATICS"
                                                value={cfg.subjectCode}
                                                onChange={(e) =>
                                                    setConfigs((prev) =>
                                                        prev.map((c, j) => j === i ? { ...c, subjectCode: e.target.value.toUpperCase() } : c)
                                                    )
                                                }
                                            />
                                            <Input
                                                className="h-8 text-xs w-24 text-center"
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
                                                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors text-base"
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
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setConfigs((prev) => [...prev, { subjectCode: "", weight: 1.0 }])}
                                >
                                    + Add Subject
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 text-xs"
                                    disabled={isSavingConfig || configs.length === 0}
                                    onClick={handleSaveConfig}
                                >
                                    {isSavingConfig
                                        ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                        : <Save className="mr-1.5 h-3 w-3" />}
                                    Save Weights
                                </Button>
                            </div>

                            <div className="rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground space-y-1">
                                <p className="font-medium text-foreground">Grade point values (fixed)</p>
                                <div className="flex gap-3 mt-1">
                                    {[["A", "5"], ["B", "4"], ["C", "3"], ["S", "2"], ["W", "0"]].map(([g, p]) => (
                                        <span key={g} className="flex items-center gap-1">
                                            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", GRADE_COLORS[g])}>{g}</span>
                                            <span>= {p} pts</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
