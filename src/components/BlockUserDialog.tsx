import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert, Ban } from "lucide-react";

interface BlockUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    username: string;
}

export const BlockUserDialog = ({
    open,
    onOpenChange,
    onConfirm,
    username,
}: BlockUserDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                        Block @{username}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3 pt-2">
                        <p>
                            Are you sure you want to block this user?
                        </p>
                        <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-2">
                            <p className="flex items-center gap-2">
                                <Ban className="h-4 w-4 text-muted-foreground" />
                                They won't be able to message you
                            </p>
                            <p className="flex items-center gap-2">
                                <Ban className="h-4 w-4 text-muted-foreground" />
                                They won't see your posts
                            </p>
                            <p className="flex items-center gap-2">
                                <Ban className="h-4 w-4 text-muted-foreground" />
                                You won't see their content
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can unblock them at any time from your settings.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Yes, Block User
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
