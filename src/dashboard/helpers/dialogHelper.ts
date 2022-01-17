import { NodecgDialog } from '../types/dialog';

export function closeDialog(dialogName: string): void {
    (nodecg.getDialog(dialogName) as NodecgDialog).close();
}
