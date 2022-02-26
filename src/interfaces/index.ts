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
    skip?: {
        disabled: boolean;
        action: Function;
        title: string;
    },
    save?: {
        disabled: boolean;
        action: Function;
        title: string;
    }
    onMount: Function;
}

export interface TimeSettings {
    focus: {
        minutes: number;
        seconds: number;
    }
    break: {
        minutes: number;
        seconds: number;
    }
}

export interface PermissionMap {
    [permission: string]: boolean;
}
