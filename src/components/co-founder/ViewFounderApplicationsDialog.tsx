import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, ExternalLink, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CreateReviewDialog } from "@/components/CreateReviewDialog";
import { useToast } from "@/hooks/use-toast";

interface Application {
    id: string;
    applicant_id: string;
    message: string;
    contact_info: string;
    created_at: string;
    status: string;
    applicant: {
        full_name: string;
        username: string;
        avatar_url: string | null;
    };
}

interface ViewFounderApplicationsDialogProps {
    listingId: string;
    listingRole: string;
}

export const ViewFounderApplicationsDialog = ({ listingId, listingRole }: ViewFounderApplicationsDialogProps) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchApplications();
        }
    }, [open, listingId]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Check if it's a UUID to avoid errors with mock data
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId);

            if (!isUuid) {
                setApplications([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('founder_applications')
                .select(`
                    *,
                    applicant:applicant_id (
                        full_name,
                        username,
                        avatar_url
                    )
                `)
                .eq('listing_id', listingId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApplications(data || []);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (applicationId: string) => {
        try {
            setLoading(true);

            // Update Application Status
            const { error: appError } = await supabase
                .from('founder_applications')
                .update({ status: 'accepted' })
                .eq('id', applicationId);

            if (appError) throw appError;

            toast({
                title: "Application Accepted",
                description: "You have accepted this co-founder application.",
            });

            // Refresh
            fetchApplications();

        } catch (error) {
            console.error("Error accepting application:", error);
            toast({
                title: "Error",
                description: "Failed to accept application",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5">
                    <Mail className="w-4 h-4" />
                    View Applications
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Applications for {listingRole}</DialogTitle>
                    <DialogDescription>
                        Review the people interested in co-founding with you.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                            <h3 className="font-semibold text-lg">No applications yet</h3>
                            <p className="text-muted-foreground">Share your listing to get more reach!</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[50vh] pr-4">
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div key={app.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border">
                                                    <AvatarImage src={app.applicant?.avatar_url || undefined} />
                                                    <AvatarFallback>{app.applicant?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold">{app.applicant?.full_name}</h4>
                                                    <p className="text-xs text-muted-foreground">@{app.applicant?.username}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                            </Badge>
                                        </div>

                                        <div className="bg-muted/50 p-3 rounded-lg text-sm mb-3">
                                            <p className="font-medium text-xs text-muted-foreground mb-1">PITCH:</p>
                                            <p className="whitespace-pre-wrap">{app.message}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 p-2 rounded border border-primary/10">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="font-semibold">Contact:</span>
                                            <span className="select-all">{app.contact_info}</span>
                                        </div>

                                        <div className="mt-4">
                                            {app.status === 'accepted' ? (
                                                <div className="space-y-2">
                                                    <Button className="w-full bg-green-100 text-green-800 hover:bg-green-200" disabled>
                                                        Accepted as Co-Founder
                                                    </Button>
                                                    <CreateReviewDialog
                                                        revieweeId={app.applicant_id}
                                                        revieweeName={app.applicant?.full_name || "Applicant"}
                                                    />
                                                </div>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => handleAccept(app.id)}
                                                >
                                                    Accept Application
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
