import { useState, useEffect } from 'react';

interface DraftPost {
    content: string;
    timestamp: number;
}

const DRAFT_KEY = 'futoraone_post_draft';

export const useDraftPost = () => {
    const [draft, setDraft] = useState<string>('');

    useEffect(() => {
        // Load draft on mount
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const parsed: DraftPost = JSON.parse(savedDraft);
                // Only restore if less than 7 days old
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                if (parsed.timestamp > sevenDaysAgo) {
                    setDraft(parsed.content);
                } else {
                    localStorage.removeItem(DRAFT_KEY);
                }
            } catch (e) {
                console.error('Failed to parse draft:', e);
            }
        }
    }, []);

    const saveDraft = (content: string) => {
        if (content.trim()) {
            const draftData: DraftPost = {
                content,
                timestamp: Date.now(),
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
            setDraft(content);
        } else {
            clearDraft();
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraft('');
    };

    return { draft, saveDraft, clearDraft };
};
