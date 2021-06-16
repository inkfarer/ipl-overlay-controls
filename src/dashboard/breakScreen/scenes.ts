import { ActiveBreakScene } from 'schemas';

const activeBreakScene = nodecg.Replicant<ActiveBreakScene>('activeBreakScene');

const sceneSwitchButtons: {[key: string]: HTMLButtonElement} = {
    main: document.getElementById('show-main-scene-btn') as HTMLButtonElement,
    teams: document.getElementById('show-teams-scene-btn') as HTMLButtonElement,
    stages: document.getElementById('show-stages-scene-btn') as HTMLButtonElement
};

for (const [key, value] of Object.entries(sceneSwitchButtons)) {
    value.addEventListener('click', () => {
        activeBreakScene.value = key as ActiveBreakScene;
    });
}

activeBreakScene.on('change', newValue => {
    for (const scene in sceneSwitchButtons) {
        if (!Object.prototype.hasOwnProperty.call(sceneSwitchButtons, scene)) continue;
        sceneSwitchButtons[scene].disabled = false;
    }

    if (sceneSwitchButtons[newValue]) {
        sceneSwitchButtons[newValue].disabled = true;
    }
});
