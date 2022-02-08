import { promisify } from 'util';
import readline from 'readline';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = promisify(rl.question).bind(rl);

export async function askYesNo(message: string): Promise<boolean> {
    try {
        const answer = await question(`${message} (y/n): `);
        const answerLower = answer?.toLowerCase();
        return answerLower === 'y' || answerLower === 'yes';
    } catch (e) {
        console.log(e);
        return false;
    }
}
