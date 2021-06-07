import { MainFlavorText, NextRoundStartTime, NextRoundStartTimeShown } from 'types/schemas';
import { addChangeReminder } from '../globalScripts';

const mainFlavorText = nodecg.Replicant<MainFlavorText>('mainFlavorText');
const nextRoundStartTimeShown = nodecg.Replicant<NextRoundStartTimeShown>('nextRoundStartTimeShown');
const nextRoundStartTime = nodecg.Replicant<NextRoundStartTime>('nextRoundStartTime');

const flavorTextInput = document.getElementById('flavor-text-input') as HTMLInputElement;
const mainSceneUpdateBtn = document.getElementById('main-scene-update-btn') as HTMLButtonElement;
const minuteInput = document.getElementById('next-stage-minute-input') as HTMLInputElement;
const hourInput = document.getElementById('next-stage-hour-input') as HTMLInputElement;
const daySelect = document.getElementById('next-stage-day-select') as HTMLSelectElement;
const nextStageTimerToggle = document.getElementById('next-stage-timer-toggle') as HTMLInputElement;

mainFlavorText.on('change', newValue => {
    flavorTextInput.value = newValue;
});
mainSceneUpdateBtn.onclick = () => {
    mainFlavorText.value = flavorTextInput.value;
    updateStageTime();
};

nextStageTimerToggle.addEventListener('change', e => {
    nextStageTimerToggle.checked = (e.target as HTMLInputElement).checked;
});

nextRoundStartTimeShown.on('change', newValue => {
    nextStageTimerToggle.checked = newValue;
});

nextRoundStartTime.on('change', newValue => {
    minuteInput.value = String(newValue.minute);
    hourInput.value = String(newValue.hour);
    updateDaySelector(newValue.month, newValue.day);
    daySelect.value = `${newValue.day}/${newValue.month}`;
});

function updateDaySelector(selectedMonth: number, selectedDayOfMonth: number) {
    daySelect.innerHTML = '';

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayElem = getDayElem(today);
    daySelect.appendChild(todayElem);

    const tomorrowElem = getDayElem(tomorrow);
    daySelect.appendChild(tomorrowElem);

    const selectedDay = `${selectedDayOfMonth}/${selectedMonth}`;
    if (todayElem.value !== selectedDay && tomorrowElem.value !== selectedDay) {
        const selectedDayElem = document.createElement('option');
        selectedDayElem.innerText = selectedDay;
        selectedDayElem.value = selectedDay;
        selectedDayElem.dataset.day = String(selectedDayOfMonth);
        selectedDayElem.dataset.month = String(selectedMonth);
        daySelect.appendChild(selectedDayElem);
    }
}

function getDayElem(date: Date): HTMLOptionElement {
    const dayElem = document.createElement('option');
    const dateText = getDayText(date);
    dayElem.innerText = dateText;
    dayElem.value = dateText;
    dayElem.dataset.day = String(date.getDate());
    dayElem.dataset.month = String(date.getMonth() + 1);
    return dayElem;
}

function getDayText(date: Date): string {
    return `${date.getDate()}/${date.getMonth() + 1}`;
}

function updateStageTime() {
    const min = parseInt(minuteInput.value, 10);
    const hour = parseInt(hourInput.value, 10);
    const selText = daySelect.options[daySelect.selectedIndex];
    if (selText) {
        const day = Number(selText.dataset.day);
        const month = Number(selText.dataset.month);

        if (min <= 59 && min >= 0 && hour <= 23 && hour >= 0) {
            nextRoundStartTime.value = {
                hour,
                minute: min,
                day,
                month
            };
        }
    }
}

addChangeReminder(document.querySelectorAll('.main-update-reminder'), mainSceneUpdateBtn);
