import { execSync } from 'child_process';

export function fetchTags(directory: string): string[] {
    execSync('git fetch', { cwd: directory, stdio: [ 'ignore', 'ignore', 'pipe' ] });
    const tags = execSync('git ls-remote --refs --tags', { cwd: directory, stdio: 'pipe' })
        .toString()
        .trim()
        .split('\n')
        .filter(line => line.includes('refs/tags'));
    return tags.map(tag => tag.split('refs/tags/').pop());
}
