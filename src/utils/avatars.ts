// Cartoon Avatar Collection using DiceBear API
// These avatars provide consistent, high-quality cartoon representations

export interface AvatarOption {
    id: string;
    name: string;
    url: string;
    seed: string;
}

// Collection of avatar seeds for variety
const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Jasmine', 'Oliver', 'Luna', 'Max',
    'Mia', 'Charlie', 'Lucy', 'Cooper', 'Bella', 'Rocky',
    'Daisy', 'Duke', 'Molly', 'Bear', 'Sadie', 'Jack',
    'Sophie', 'Toby', 'Maggie', 'Zeus', 'Chloe', 'Leo'
];

// Generate avatar URLs using DiceBear API (avataaars style)
export const AVATAR_OPTIONS: AvatarOption[] = AVATAR_SEEDS.map((seed, index) => ({
    id: `avatar-${index + 1}`,
    name: seed,
    url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
    seed: seed
}));

/**
 * Get a random avatar from the collection
 */
export const getRandomAvatar = (): AvatarOption => {
    const randomIndex = Math.floor(Math.random() * AVATAR_OPTIONS.length);
    return AVATAR_OPTIONS[randomIndex];
};

/**
 * Get avatar URL by seed/name
 */
export const getAvatarBySeed = (seed: string): string => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Get avatar option by ID
 */
export const getAvatarById = (id: string): AvatarOption | undefined => {
    return AVATAR_OPTIONS.find(avatar => avatar.id === id);
};

/**
 * Get avatar URL by user ID (for consistent default avatars)
 */
export const getDefaultAvatarForUser = (userId: string): string => {
    // Use user ID as seed for consistent avatar generation
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
};
