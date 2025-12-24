import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Handle ChunkLoadError (common during navigation when code-split files fail to load)
        if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
            console.log("ChunkLoadError detected, attempting auto-recovery...");
            window.location.reload();
        }
    }

    private handleReset = () => {
        // Clear potentially corrupted state/cache
        try {
            // We don't want to clear EVERYTHING (like auth), 
            // but maybe clearing some query cache would help if needed.
            // For now, just a hard reload is usually enough for white screen issues.
            window.location.assign("/");
        } catch (e) {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground text-center animate-in fade-in duration-500">
                    <div className="max-w-md w-full space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-destructive/10 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-destructive" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Bas thoda sa atak gayi.
                            </h1>
                            <div className="space-y-2">
                                <p className="text-muted-foreground leading-relaxed">
                                    Badi mushkil se bani hoon, time lagega na 😄
                                </p>
                                <p className="text-muted-foreground font-medium">
                                    Ek refresh aur ho jaaye!
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg border border-border text-left overflow-auto max-h-[200px]">
                            <p className="text-xs font-mono text-muted-foreground break-all">
                                {this.state.error?.toString()}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={this.handleReset}
                                className="w-full gradient-primary text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                            >
                                <RefreshCcw className="mr-2 h-5 w-5" />
                                Refresh App
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                If the problem persists, please try clearing your browser cache.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
