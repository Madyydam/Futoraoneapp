import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ImageLightbox = ({ imageUrl, isOpen, onClose }: ImageLightboxProps) => {
    const [scale, setScale] = useState(1);

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 1));
    };

    const handleReset = () => {
        setScale(1);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
                <div className="relative w-full h-full flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                        onClick={onClose}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/50 rounded-lg p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleZoomOut}
                            disabled={scale <= 1}
                        >
                            -
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                            onClick={handleZoomIn}
                            disabled={scale >= 3}
                        >
                            +
                        </Button>
                    </div>

                    <div className="overflow-auto max-w-full max-h-full p-8">
                        <img
                            src={imageUrl}
                            alt="Full size"
                            className="transition-transform duration-200"
                            style={{ transform: `scale(${scale})` }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
