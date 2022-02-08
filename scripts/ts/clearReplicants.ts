import { isVerbose } from './argsHelper';
import { emptyDirSync } from 'fs-extra';
import { askYesNo } from './input';
import path from 'path';

const verbose = isVerbose();

askYesNo('This will clear all overlay data. Are you sure you want to continue?').then(doDelete => {
    if (!doDelete) {
        return;
    }
    console.log('Clearing ipl-overlay-controls replicant data...');
    try {
        emptyDirSync(path.join(__dirname, '..', '..', '..', '..', 'db', 'replicants', 'ipl-overlay-controls'));
        console.log('Done!');
    } catch (e) {
        if (verbose) {
            console.log('Encountered an error:', e);
        } else {
            console.log('Encountered an error. Re-run the script with the --verbose argument to log more information.');
        }
    }
});
