export function generateId(): string {
    return String(Math.random().toString(36).substr(2, 9));
}
