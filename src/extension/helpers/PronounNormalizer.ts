import { isBlank } from '../../helpers/stringHelper';

export function normalizePronouns(pronouns: string): string {
    if (pronouns == null || typeof pronouns !== 'string' || isBlank(pronouns)) {
        return pronouns;
    }

    pronouns = pronouns.toLowerCase();

    if (/(^|\s)any\s/gi.test(pronouns)) {
        return 'any pronouns';
    }

    return pronouns
        .replace(/\s*\/\s*/g, '/')
        .match(/\S*\/\S*/g)
        .map(pronouns => pronouns.replace(/[.,!-]/g, ''))
        .join(', ');
}
