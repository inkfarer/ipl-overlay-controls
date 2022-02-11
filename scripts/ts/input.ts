import { promisify } from 'util';
import readline from 'readline';

export async function askYesNo(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const question = promisify(rl.question).bind(rl);

    try {
        const answer = await question(`${message} (y/n): `);
        const answerLower = answer?.toLowerCase();
        rl.close();
        return answerLower === 'y' || answerLower === 'yes';
    } catch (e) {
        rl.close();
        return false;
    }
}
