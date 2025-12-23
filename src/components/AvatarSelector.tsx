import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AVATAR_OPTIONS, AvatarOption } from '@/utils/avatars';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
    selectedAvatar: string | null;
    onSelectAvatar: (avatarUrl: string) => void;
    className?: string;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
    selectedAvatar,
    onSelectAvatar,
    className
}) => {
    return (
        <div className={cn("w-full", className)}>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.url;

                    return (
                        <motion.button
                            key={avatar.id}
                            type="button"
                            onClick={() => onSelectAvatar(avatar.url)}
                            className={cn(
                                "relative aspect-square rounded-full overflow-hidden border-2 transition-all",
                                isSelected
                                    ? "border-primary shadow-lg shadow-primary/50 scale-105"
                                    : "border-white/20 hover:border-primary/50 hover:scale-105"
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Avatar Image */}
                            <img
                                src={avatar.url}
                                alt={avatar.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Selection Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm"
                                >
                                    <div className="bg-primary rounded-full p-1">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                            )}

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                        </motion.button>
                    );
                })}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
                Select a cartoon avatar or upload your own photo
            </p>
        </div>
    );
};
