import { existsSync, readdirSync, readFileSync } from 'fs';
import { fetchTags, getDefaultBranch } from './gitHelper';
import semver from 'semver';
import { execSync } from 'child_process';
import { isVerbose } from './argsHelper';
import * as path from 'path';

let hasErrors = false;
const verbose = isVerbose();
const bundlesDir = path.join(__dirname, '..', '..', '..');
const bundles = readdirSync(bundlesDir, { withFileTypes: true })
    .filter(dir => dir.isDirectory() && dir.name !== 'ipl-overlay-controls');

console.log(__dirname);
console.log(bundlesDir);

bundles.forEach(bundle => {
    const bundlePath = `${bundlesDir}/${bundle.name}`;
    const bundlePackagePath = `${bundlePath}/package.json`;
    if (existsSync(bundlePackagePath)) {
        const parsedPackage = JSON.parse(readFileSync(bundlePackagePath, 'utf-8'));

        if ('compatibleDashboardVersion' in parsedPackage) {
            console.log(`Updating ${bundle.name}...`);
            console.log('Fetching versions...');
            const tags = fetchTags(bundlePath);
            const latestVersion = semver.maxSatisfying(tags, '');
            try {
                if (tags.length <= 0 || !latestVersion) {
                    console.log('No versions found. Pulling changes from git...');
                    const branch = getDefaultBranch(bundlePath);
                    console.log(`Using branch '${branch}'`);
                    execSync(`git checkout ${branch}`, { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                    execSync('git pull', { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                } else {
                    console.log(`Checking out version ${latestVersion}...`);
                    execSync(
                        `git checkout ${latestVersion}`,
                        { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                }
                console.log('Updating dependencies...');
                execSync('npm ci --production', { cwd: bundlePath, stdio: [ 'ignore', 'ignore', 'pipe' ] });
                console.log(`Updated ${bundle.name}`);
            } catch (e) {
                hasErrors = true;
                if (verbose) {
                    console.log(`Failed to update ${bundle.name}:`, e);
                } else {
                    console.log(`Failed to update ${bundle.name}`);
                }
                return;
            }
        }
    }
});
console.log('Done!');
if (hasErrors && !verbose) {
    console.log('Found errors during update. Re-run the script with the --verbose argument to log more information.');
}
