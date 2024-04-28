import i18next from 'i18next';
import { Duration } from 'luxon';

export function addDurationFormatter() {
    i18next.services.formatter.add('duration', (value, lng, options) => {
        return Duration.fromObject({ seconds: Number(value) }).toFormat(options?.format ?? 'm:ss');
    });
}
