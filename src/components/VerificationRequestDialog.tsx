import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, Sparkles, Star } from "lucide-react";

interface VerificationRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    onRequestSubmitted?: () => void;
}

export const VerificationRequestDialog = ({
    open,
    onOpenChange,
    userId,
    onRequestSubmitted,
}: VerificationRequestDialogProps) => {
    const { toast } = useToast();
    const [reason, setReason] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim() || !category) {
            toast({
                title: "Oops! Missing some info",
                description: "Please fill out all fields to help us review your request 🙏",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Check if there's already a pending request
            const { data: existingRequest } = await supabase
                .from("verification_requests" as any)
                .select("id")
                .eq("user_id", userId)
                .eq("status", "pending")
                .single();

            if (existingRequest) {
                toast({
                    title: "You're already in the queue! 🎯",
                    description: "We're reviewing your verification request. Hang tight!",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            // Create new verification request
            const { error } = await supabase
                .from("verification_requests" as any)
                .insert({
                    user_id: userId,
                    reason: reason.trim(),
                    category,
                    status: "pending",
                });

            if (error) throw error;

            toast({
                title: "🎉 Request submitted successfully!",
                description: "We'll review your application soon. Keep being awesome!",
            });

            setReason("");
            setCategory("");
            onOpenChange(false);
            onRequestSubmitted?.();
        } catch (error: any) {
            console.error("Error submitting verification request:", error);
            toast({
                title: "Something went wrong 😔",
                description: error.message || "Please try again in a moment",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="relative">
                            <BadgeCheck className="text-blue-500 w-6 h-6" />
                            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                        </div>
                        Get Verified!
                    </DialogTitle>
                    <DialogDescription className="text-base pt-1">
                        Join the verified community! Tell us why you deserve that blue checkmark ✨
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium">
                            What describes you best?
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose your category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="developer">
                                    <div className="flex items-center gap-2">
                                        <span>💻</span> Developer
                                    </div>
                                </SelectItem>
                                <SelectItem value="creator">
                                    <div className="flex items-center gap-2">
                                        <span>🎨</span> Creator
                                    </div>
                                </SelectItem>
                                <SelectItem value="business">
                                    <div className="flex items-center gap-2">
                                        <span>🚀</span> Business
                                    </div>
                                </SelectItem>
                                <SelectItem value="other">
                                    <div className="flex items-center gap-2">
                                        <span>⭐</span> Other
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                            Why should you be verified?
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Share your story! Tell us about your notable projects, community impact, credentials, or what makes you stand out... ✍️"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={6}
                            className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                {reason.length < 50 ? (
                                    <span className="text-orange-500">
                                        {50 - reason.length} more characters needed
                                    </span>
                                ) : (
                                    <span className="text-green-500 flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Looking good!
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {reason.length}/500
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Maybe Later
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || reason.length < 50 || !category}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span> Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Submit Request
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
