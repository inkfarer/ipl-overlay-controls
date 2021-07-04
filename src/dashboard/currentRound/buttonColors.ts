import { ScoreboardData } from 'schemas';
import { getContrastingTextColor } from './colorHelper';

const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

scoreboardData.on('change', newValue => {
    document.body.style.setProperty('--team-a-color', newValue.colorInfo.clrA);
    document.body.style.setProperty('--team-b-color', newValue.colorInfo.clrB);
    document.body.style.setProperty('--team-a-text-color', getContrastingTextColor(newValue.colorInfo.clrA));
    document.body.style.setProperty('--team-b-text-color', getContrastingTextColor(newValue.colorInfo.clrB));
});
