import { MainFlavorText, NextRoundStartTime } from 'schemas';
import { addChangeReminder } from '../globalScripts';
import { DateTime } from 'luxon';

const mainFlavorText = nodecg.Replicant<MainFlavorText>('mainFlavorText');
const nextRoundStartTime = nodecg.Replicant<NextRoundStartTime>('nextRoundStartTime');

const flavorTextInput = document.getElementById('flavor-text-input') as HTMLInputElement;
const mainSceneUpdateBtn = document.getElementById('main-scene-update-btn') as HTMLButtonElement;
const minuteInput = document.getElementById('next-stage-minute-input') as HTMLInputElement;
const hourInput = document.getElementById('next-stage-hour-input') as HTMLInputElement;
const daySelect = document.getElementById('next-stage-day-select') as HTMLSelectElement;
const nextStageTimerToggle = document.getElementById('next-stage-timer-toggle') as HTMLInputElement;

const dayMonthFormat = 'dd/MM';
const dayMonthYearFormat = 'dd/MM/yyyy';

mainFlavorText.on('change', newValue => {
    flavorTextInput.value = newValue;
});

mainSceneUpdateBtn.onclick = () => {
    mainFlavorText.value = flavorTextInput.value;
    updateStageTime();
};

nextStageTimerToggle.addEventListener('change', e => {
    nextRoundStartTime.value.isVisible = (e.target as HTMLInputElement).checked;
});

nextRoundStartTime.on('change', newValue => {
    const newDate = DateTime.fromISO(newValue.startTime).toLocal();
    minuteInput.value = padNumber(newDate.minute);
    hourInput.value = padNumber(newDate.hour);

    updateDaySelector(newDate);

    nextStageTimerToggle.checked = newValue.isVisible;
});

function updateDaySelector(selectedDate: DateTime) {
    daySelect.innerHTML = '';

    const today = DateTime.now();
    const tomorrow = DateTime.now().plus({ days: 1 });
    daySelect.appendChild(getDayElem(today));
    daySelect.appendChild(getDayElem(tomorrow));

    if (!selectedDate.hasSame(today, 'days') && !selectedDate.hasSame(tomorrow, 'days')) {
        daySelect.appendChild(getDayElem(selectedDate));
    }

    daySelect.value = selectedDate.toFormat(dayMonthYearFormat);
}

function getDayElem(date: DateTime): HTMLOptionElement {
    const dayElem = document.createElement('option');
    dayElem.innerText = date.toFormat(dayMonthFormat);
    dayElem.value = date.toFormat(dayMonthYearFormat);
    return dayElem;
}

function updateStageTime() {
    const minute = parseInt(minuteInput.value, 10);
    const hour = parseInt(hourInput.value, 10);
    const dateOption = daySelect.options[daySelect.selectedIndex];

    if (dateOption && !isNaN(minute) && !isNaN(hour)) {
        const date = DateTime.fromFormat(dateOption.value, dayMonthYearFormat);
        const dateTime = date.set({ minute, hour });

        if (minute >= 0 && minute <= 59 && hour >= 0 && hour <= 23) {
            nextRoundStartTime.value.startTime = dateTime.toUTC().toISO();
        }
    }
}

addChangeReminder(document.querySelectorAll('.main-update-reminder'), mainSceneUpdateBtn);

function padNumber(value: number | string, minLength = 2): string {
    const stringValue = String(value);
    if (stringValue.length < minLength) {
        return '0'.repeat(minLength - stringValue.length) + stringValue;
    } else {
        return stringValue;
    }
}

function padNumberInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    target.value = padNumber(target.value);
}

hourInput.addEventListener('change', padNumberInput);
minuteInput.addEventListener('change', padNumberInput);
