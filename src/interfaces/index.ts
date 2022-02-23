export interface PomodoroStateMap {
    settings: {
        disabled: boolean;
        action: Function;
        title: string;
    },
    stop: {
        disabled: boolean;
        action: Function;
        title: string;
    },
    focus: {
        disabled: boolean;
        action: Function;
        title: string;
    },
    onMount: Function;
}