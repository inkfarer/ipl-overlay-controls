import { fetchTags } from './gitHelper';
import { execSync } from 'child_process';
import semver from 'semver';

(() => {
    console.log('Starting update...');
    const tags = fetchTags('../');
    const version = semver.maxSatisfying(tags, '');
    if (!version) {
        console.log('Could not get version list.');
        return;
    }
    execSync(`git checkout ${version}`);
    console.log(`Done! (Checked out version ${version})`);
})();
