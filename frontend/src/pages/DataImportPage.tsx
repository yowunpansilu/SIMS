import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface ParsedRow {
    [key: string]: string;
}

interface ImportResult {
    successCount: number;
    errorCount: number;
    errors: string[];
}

type Step = "upload" | "preview" | "importing" | "result";

export default function DataImportPage() {
    const [step, setStep] = useState<Step>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((f: File) => {
        if (!f.name.endsWith(".csv")) {
            toast.error("Only CSV files are supported");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB");
            return;
        }

        setFile(f);
        Papa.parse(f, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data as ParsedRow[];
                if (data.length === 0) {
                    toast.error("CSV file is empty");
                    return;
                }
                setHeaders(Object.keys(data[0]));
                setParsedData(data);
                setStep("preview");
            },
            error: () => {
                toast.error("Failed to parse CSV file");
            },
        });
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile]
    );

    const handleImport = async () => {
        if (!file) return;
        setIsUploading(true);
        setStep("importing");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/students/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setResult(res.data);
            setStep("result");
            toast.success("Import completed");
        } catch {
            // Fallback: try inserting rows individually
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];

            for (const row of parsedData) {
                try {
                    await api.post("/students", {
                        admissionNumber: row.admissionNumber || row["Admission Number"] || row["admission_number"] || "",
                        fullName: row.fullName || row["Full Name"] || row["full_name"] || "",
                        dateOfBirth: row.dateOfBirth || row["Date of Birth"] || row["date_of_birth"] || undefined,
                        gender: (row.gender || row.Gender || "").toUpperCase(),
                        address: row.address || row.Address || "",
                        contactNumber: row.contactNumber || row["Contact Number"] || row["contact_number"] || "",
                        grade: Number(row.grade || row.Grade || 12),
                        stream: (row.stream || row.Stream || "OTHER").toUpperCase(),
                    });
                    successCount++;
                } catch {
                    errorCount++;
                    errors.push(`Row: ${row.fullName || row["Full Name"] || "Unknown"} — failed`);
                }
            }

            setResult({ successCount, errorCount, errors });
            setStep("result");
            if (errorCount === 0) {
                toast.success(`Imported ${successCount} students`);
            } else {
                toast.warning(`Imported ${successCount}, failed ${errorCount}`);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setStep("upload");
        setFile(null);
        setParsedData([]);
        setHeaders([]);
        setResult(null);
    };

    return (
        <PageContainer title="Data Import" description="Import student records from CSV files">
            {/* Step: Upload */}
            {step === "upload" && (
                <div
                    className={cn(
                        "flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-16 transition-colors",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center">
                        <p className="text-lg font-medium">Drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <FileText className="mr-2 h-4 w-4" />
                        Select File
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                        }}
                    />
                    <p className="text-xs text-muted-foreground">CSV files only, max 5MB</p>
                </div>
            )}

            {/* Step: Preview */}
            {step === "preview" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-medium">{file?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {parsedData.length} rows · {headers.length} columns
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={reset}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="rounded-lg border overflow-x-auto max-h-96">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-muted">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        #
                                    </th>
                                    {headers.map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 20).map((row, i) => (
                                    <tr key={i} className="border-t hover:bg-muted/50">
                                        <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                        {headers.map((h) => (
                                            <td key={h} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                                                {row[h] || "—"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {parsedData.length > 20 && (
                        <p className="text-sm text-muted-foreground text-center">
                            Showing first 20 of {parsedData.length} rows
                        </p>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={reset}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import {parsedData.length} Students
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: Importing */}
            {step === "importing" && (
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium">Importing students…</p>
                    <p className="text-sm text-muted-foreground">This may take a moment</p>
                    {isUploading && <Skeleton className="h-2 w-64 rounded-full" />}
                </div>
            )}

            {/* Step: Result */}
            {step === "result" && result && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-4 py-8">
                        {result.errorCount === 0 ? (
                            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                        ) : (
                            <AlertCircle className="h-16 w-16 text-amber-500" />
                        )}
                        <h2 className="text-2xl font-bold">Import Complete</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 max-w-md mx-auto">
                        <div className="rounded-lg border bg-card p-6 text-center">
                            <p className="text-3xl font-bold text-emerald-600">{result.successCount}</p>
                            <p className="text-sm text-muted-foreground">Successful</p>
                        </div>
                        <div className="rounded-lg border bg-card p-6 text-center">
                            <p className="text-3xl font-bold text-red-600">{result.errorCount}</p>
                            <p className="text-sm text-muted-foreground">Failed</p>
                        </div>
                    </div>

                    {result.errors.length > 0 && (
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 max-w-xl mx-auto">
                            <h4 className="font-medium text-destructive mb-2">Errors</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {result.errors.slice(0, 10).map((err, i) => (
                                    <li key={i}>• {err}</li>
                                ))}
                                {result.errors.length > 10 && (
                                    <li>…and {result.errors.length - 10} more</li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-center">
                        <Button onClick={reset}>
                            Import Another File
                        </Button>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
