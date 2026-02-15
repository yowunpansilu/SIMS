import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileQuestion, MoveLeft } from "lucide-react";

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">404</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Page not found. The page you are looking for does not exist.
            </p>
            <div className="mt-8 flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <MoveLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
                <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
        </div>
    );
}
