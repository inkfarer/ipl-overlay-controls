import { ScoreboardData } from 'schemas';

const scoreboardData = nodecg.Replicant<ScoreboardData>('scoreboardData');

scoreboardData.on('change', newValue => {
    document.body.style.setProperty('--team-a-color', newValue.colorInfo.clrA);
    document.body.style.setProperty('--team-b-color', newValue.colorInfo.clrB);
    document.body.style.setProperty('--team-a-text-color', getTextColor(newValue.colorInfo.clrA));
    document.body.style.setProperty('--team-b-text-color', getTextColor(newValue.colorInfo.clrB));
});

function getTextColor(hex: string): string {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333' : 'white';
}
