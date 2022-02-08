import { fetchTags } from './gitHelper';
import { execSync } from 'child_process';
import semver from 'semver';
import { isVerbose } from './argsHelper';
import * as path from 'path';

const verbose = isVerbose();

(() => {
    console.log('Starting update...');
    try {
        const bundleDir = path.join(__dirname, '..', '..');
        const tags = fetchTags(bundleDir);
        const version = semver.maxSatisfying(tags, '');
        if (!version) {
            console.log('Could not get version list.');
            return;
        }
        execSync(`git checkout ${version}`, { cwd: bundleDir });
        console.log(`Checked out version ${version}`);
        console.log('Installing dependencies...');
        execSync(`npm ci --production`, { cwd: bundleDir });
        console.log(`Done!`);
    } catch (e) {
        if (verbose) {
            console.log('Encountered an error:', e);
        } else {
            console.log('Encountered an error during update. Re-run the script with the --verbose argument to log more information.');
        }
    }
})();
