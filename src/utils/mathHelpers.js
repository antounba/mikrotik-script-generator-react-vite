// Helper Slugify & FPB (GCD)
export const slugify = (str) => {
    if (!str) return 'unnamed';
    return str.trim().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/gu, '_') || 'unnamed';
};

export const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

export const gcdArray = (arr) => arr.reduce((acc, val) => gcd(acc, val));