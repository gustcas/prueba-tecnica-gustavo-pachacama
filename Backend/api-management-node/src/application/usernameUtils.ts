export function sanitizeBase(input: string) {
    return input
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

export function buildBaseUsername(firstName: string, lastName: string) {
    const initial = firstName.trim().charAt(0);
    const base = `${initial}${lastName}`;
    return sanitizeBase(base);
}

export function ensureSystemUsername(base: string) {
    let candidate = base;
    if (!/[A-Z]/.test(candidate)) {
        candidate = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
    if (!/[0-9]/.test(candidate)) {
        candidate = `${candidate}1`;
    }
    while (candidate.length < 8) {
        candidate = `${candidate}1`;
    }
    if (candidate.length > 20) {
        candidate = candidate.slice(0, 20);
    }
    return candidate;
}

export function validateSystemUsername(username: string) {
    const hasUpper = /[A-Z]/.test(username);
    const hasNumber = /[0-9]/.test(username);
    const hasInvalid = /[^a-zA-Z0-9]/.test(username);
    return username.length >= 8 && username.length <= 20 && hasUpper && hasNumber && !hasInvalid;
}
