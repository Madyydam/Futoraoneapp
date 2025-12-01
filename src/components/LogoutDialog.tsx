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
import { LogOut, Heart } from "lucide-react";

interface LogoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export const LogoutDialog = ({
    open,
    onOpenChange,
    onConfirm,
}: LogoutDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                        Leaving so soon?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="pt-2">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Heart className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <p className="text-center text-base">
                                We'll miss you! Come back soon to see what's new in the community. 👋
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Stay a bit longer</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Log Out
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
