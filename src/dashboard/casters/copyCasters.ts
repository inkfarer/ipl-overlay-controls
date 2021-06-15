import { casters } from './replicants';

document.getElementById('copy-casters-btn').addEventListener('click', () => {
    let casterText = '';

    Object.keys(casters.value).forEach((item, index, arr) => {
        const element = casters.value[item];
        casterText += `${element.name} (${element.pronouns}, ${element.twitter})`;

        if (arr[index + 2]) casterText += ', ';
        else if (arr[index + 1]) casterText += ' & ';
    });

    navigator.clipboard.writeText(casterText).then(null, () => {
        console.error('Error copying to clipboard.');
    });
});
