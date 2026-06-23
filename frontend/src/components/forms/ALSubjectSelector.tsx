import { cn } from "@/lib/utils";
import {
    AL_MANDATORY_SUBJECTS,
    AL_TECHNOLOGY_PRIMARY,
    AL_THIRD_SUBJECT_OPTIONS,
    AL_SUBJECT_LABELS,
    type ALStream,
} from "@/lib/alSubjects";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Lock } from "lucide-react";

interface ALSubjectSelectorProps {
    stream: ALStream;
    value: string[];                     // always 0–3 strings
    onChange: (subjects: string[]) => void;
    error?: string;
}

function SubjectBadge({ subject, locked }: { subject: string; locked?: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium",
                locked
                    ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    : "bg-primary/10 text-primary"
            )}
        >
            {locked && <Lock className="h-3 w-3" />}
            {AL_SUBJECT_LABELS[subject] ?? subject.replace(/_/g, " ")}
        </span>
    );
}

function SubjectSelect({
    options,
    value,
    onChange,
    placeholder,
}: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder ?? "Select subject"} />
            </SelectTrigger>
            <SelectContent>
                {options.map((s) => (
                    <SelectItem key={s} value={s}>
                        {AL_SUBJECT_LABELS[s] ?? s.replace(/_/g, " ")}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function ALSubjectSelector({
    stream,
    value,
    onChange,
    error,
}: ALSubjectSelectorProps) {
    const mandatory = AL_MANDATORY_SUBJECTS[stream];
    const thirdOptions = AL_THIRD_SUBJECT_OPTIONS[stream];

    // ── Arts — pick any 3 from the basket ────────────────────────────────────
    if (stream === "ARTS") {
        const selected = value.filter(Boolean);
        const toggle = (subject: string) => {
            if (selected.includes(subject)) {
                onChange(selected.filter((s) => s !== subject));
            } else if (selected.length < 3) {
                onChange([...selected, subject]);
            }
        };
        return (
            <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                    Select any 3 subjects ({selected.length}/3 chosen)
                </p>
                <div className="flex flex-wrap gap-2">
                    {thirdOptions.map((s) => {
                        const isSelected = selected.includes(s);
                        const isDisabled = !isSelected && selected.length >= 3;
                        return (
                            <button
                                key={s}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => toggle(s)}
                                className={cn(
                                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                                    isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : isDisabled
                                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                )}
                            >
                                {AL_SUBJECT_LABELS[s] ?? s.replace(/_/g, " ")}
                            </button>
                        );
                    })}
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        );
    }

    // ── Technology — SFT (locked) + primary choice + 3rd choice ─────────────
    if (stream === "TECHNOLOGY") {
        const primarySelected = value.find((s) => AL_TECHNOLOGY_PRIMARY.includes(s)) ?? "";
        const thirdSelected =
            value.find(
                (s) => s !== "SCIENCE_FOR_TECHNOLOGY" && !AL_TECHNOLOGY_PRIMARY.includes(s)
            ) ?? "";

        const handlePrimary = (v: string) => {
            onChange(["SCIENCE_FOR_TECHNOLOGY", v, thirdSelected].filter(Boolean));
        };
        const handleThird = (v: string) => {
            onChange(["SCIENCE_FOR_TECHNOLOGY", primarySelected, v].filter(Boolean));
        };

        return (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <SubjectBadge subject="SCIENCE_FOR_TECHNOLOGY" locked />
                    <span className="text-xs text-muted-foreground">auto-assigned</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Primary technical subject</p>
                        <SubjectSelect
                            options={AL_TECHNOLOGY_PRIMARY}
                            value={primarySelected}
                            onChange={handlePrimary}
                            placeholder="Engineering or Bio-Systems Technology"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Third subject</p>
                        <SubjectSelect
                            options={thirdOptions}
                            value={thirdSelected}
                            onChange={handleThird}
                        />
                    </div>
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        );
    }

    // ── Physical Science, Biological Science, Commerce — 2 locked + 1 choice ─
    const thirdSelected = value.find((s) => !mandatory.includes(s)) ?? "";

    const handleThird = (v: string) => {
        onChange([...mandatory, v]);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {mandatory.map((s) => (
                    <SubjectBadge key={s} subject={s} locked />
                ))}
                <span className="text-xs text-muted-foreground self-center">auto-assigned</span>
            </div>
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Third subject</p>
                <SubjectSelect
                    options={thirdOptions}
                    value={thirdSelected}
                    onChange={handleThird}
                />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
