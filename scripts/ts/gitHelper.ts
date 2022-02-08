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

export function getDefaultBranch(directory: string): string | null {
    const firstRemote = execSync('git remote', { cwd: directory, stdio: 'pipe' })
        .toString().trim().split('\n')[0];
    return execSync(`git remote show ${firstRemote}`, { cwd: directory, stdio: 'pipe' })
        .toString().trim().split('\n').find(line => line.includes('HEAD branch')).split('HEAD branch: ').pop();
}
