export const calculateReadTime = (text: string): string => {
    const wordsPerMinute = 200;
    // Strip HTML tags for accurate word count
    const cleanText = text.replace(/<[^>]*>/g, '');
    const words = cleanText.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    if (minutes < 1) return '< 1 min read';
    return `${minutes} min read`;
};
