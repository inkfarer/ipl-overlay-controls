import { fetchTags } from './gitHelper';
import { execSync } from 'child_process';
import semver from 'semver';
import { isVerbose } from './argsHelper';

const verbose = isVerbose();

(() => {
    console.log('Starting update...');
    try {
        const tags = fetchTags('../');
        const version = semver.maxSatisfying(tags, '');
        if (!version) {
            console.log('Could not get version list.');
            return;
        }
        execSync(`git checkout ${version}`, { cwd: '../' });
        console.log(`Done! (Checked out version ${version})`);
    } catch (e) {
        if (verbose) {
            console.log('Encountered an error:', e);
        } else {
            console.log('Encountered an error during update. Re-run the script with the --verbose argument to log more information.');
        }
    }
})();
