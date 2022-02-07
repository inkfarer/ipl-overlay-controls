export function isVerbose(): boolean {
    return process.argv.includes('--verbose') || process.argv.includes('-v');
}
