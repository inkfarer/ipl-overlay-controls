<template>
    <div class="layout horizontal center-horizontal">
        <div class="width-wrapper layout horizontal">
            <ipl-input
                v-model="hour"
                name="hour"
                type="number"
                :label="$t('nextStageTimer.hourInput')"
                :formatter="hourFormatter"
                centered
                @focuschange="handleFocusEvent"
            />
            <span>:</span>
            <ipl-input
                v-model="minute"
                name="min"
                type="number"
                :label="$t('nextStageTimer.minuteInput')"
                :formatter="minuteFormatter"
                centered
                @focuschange="handleFocusEvent"
            />
            <ipl-select
                v-model="date"
                :label="$t('nextStageTimer.daySelect')"
                data-test="next-stage-date-select"
                :options="dateOptions"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { DateObjectUnits, DateTime } from 'luxon';
import { IplInput, IplSelect, padNumber } from '@iplsplatoon/vue-components';

const dayMonthFormat = 'dd/MM';
const dayMonthYearFormat = 'dd/MM/yyyy';

export default defineComponent({
    name: 'NextStageTimeInput',

    components: { IplSelect, IplInput },

    props: {
        modelValue: {
            type: [String, null],
            required: true,
            validator: (value?: string) => {
                if (!value) return true;

                return DateTime.fromISO(value).isValid;
            }
        }
    },

    emits: [ 'update:modelValue', 'focuschange' ],

    setup(props, { emit }) {
        const time = ref<DateTime>(null);
        watch(() => props.modelValue, newValue => {
            time.value = DateTime.fromISO(newValue).toLocal();
        }, { immediate: true });

        const dateOptions = computed(() => {
            function getOption(date: DateTime) {
                return {
                    name: date.toFormat(dayMonthFormat),
                    value: date.toFormat(dayMonthYearFormat)
                };
            }

            const today = DateTime.now();
            const tomorrow = DateTime.now().plus({ days: 1 });

            const result = [
                getOption(today),
                getOption(tomorrow)
            ];

            if (!time.value.hasSame(today, 'days') && !time.value.hasSame(tomorrow, 'days')) {
                result.push(getOption(time.value));
            }

            return result;
        });

        const date = computed({
            get() {
                return time.value.toFormat(dayMonthYearFormat);
            },
            set(value: string) {
                const newDate = DateTime.fromFormat(value, dayMonthYearFormat);
                updateTime({ month: newDate.month, day: newDate.day, year: newDate.year });
            }
        });
        const hour = computed({
            get() {
                return padNumber(time.value.hour);
            },
            set(value: string) {
                updateTime({ hour: parseInt(value) });
            }
        });
        const minute = computed({
            get() {
                return padNumber(time.value.minute);
            },
            set(value: string) {
                updateTime({ minute: parseInt(value) });
            }
        });

        function updateTime(values: DateObjectUnits): void {
            emit('update:modelValue', time.value.set(values).toUTC().toISO());
        }

        function getNumberFormatter(max: number): (value: string) => string {
            return (value: string) => {
                if (value === '') return '';

                const parsedValue = parseInt(value);
                if (isNaN(parsedValue) || parsedValue < 0) return '00';
                if (parsedValue > max) return max.toString();

                return padNumber(value);
            };
        }
        return {
            dateOptions,
            minute,
            hour,
            date,
            hourFormatter: getNumberFormatter(23),
            minuteFormatter: getNumberFormatter(59),
            handleFocusEvent(event: boolean) {
                emit('focuschange', event);
            }
        };
    }
});
</script>

<style lang="scss" scoped>
@import './src/dashboard/styles/colors';

.width-wrapper {
    max-width: 165px;

    span {
        margin-top: 21px;
        border-bottom: 1px solid $input-color;
    }

    .ipl-select__wrapper {
        min-width: 75px;
    }
}
</style>
