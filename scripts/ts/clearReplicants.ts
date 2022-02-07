import { isVerbose } from './argsHelper';
import { emptyDirSync } from 'fs-extra';

const verbose = isVerbose();

console.log('Clearing ipl-overlay-controls replicant data...');
try {
    emptyDirSync('../../../../db/replicants/low-ink-overlays/');
    console.log('Done!');
} catch (e) {
    if (verbose) {
        console.log('Encountered an error:', e);
    } else {
        console.log('Encountered an error. Re-run the script with the --verbose argument to log more information.');
    }
}
