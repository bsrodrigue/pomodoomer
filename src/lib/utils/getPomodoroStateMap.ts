import { PomodoroState } from "../../enums";
import { PomodoroStateMap } from "../../interfaces";
import { settings } from "../../settings";


const { DEFAULT_BREAK_TIME, DEFAULT_FOCUS_TIME } = settings;

const EMPTY_STATE_MAP: PomodoroStateMap = {
    settings: { disabled: false, action: () => { }, title: "" },
    stop: { disabled: false, action: () => { }, title: "" },
    focus: { disabled: false, action: () => { }, title: "" },
    onMount: () => { },
}

export function getPomodoroStateMap(params: {
    currentState: PomodoroState, setTime: Function, setState: Function
}): PomodoroStateMap {

    const { currentState, setTime, setState } = params;

    function onStop() {
        setState(PomodoroState.STOP);
    }

    function onSettings() {

    }

    const stop = { disabled: false, action: onStop, title: "Stop" };
    const settings = { disabled: true, action: onSettings, title: "Settings" };

    switch (currentState) {
        case PomodoroState.STOP:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.FOCUS);
                    }, title: "Focus"
                },
                onMount: () => {
                    setTime(DEFAULT_FOCUS_TIME);
                },
            }
        case PomodoroState.FOCUS:
            return {
                settings,
                stop,
                skip: {
                    disabled: false,
                    action: () => {
                        setState(PomodoroState.DONE);
                    },
                    title: "Skip",
                },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.FOCUS_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        setTime((time: number) => time - 1);
                    }, 1000);
                    return interval;
                },
            }
        case PomodoroState.FOCUS_PAUSE:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.FOCUS);
                    }, title: "Resume focus"
                },
                onMount: () => {
                },
            }
        case PomodoroState.BREAK_PAUSE:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.BREAK);
                    }, title: "Resume break"
                },
                onMount: () => {
                },
            }
        case PomodoroState.DONE:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.BREAK);
                    }, title: "Take a break"
                },
                onMount: () => {
                    setTime(DEFAULT_BREAK_TIME);
                },
            }
        case PomodoroState.BREAK:
            return {
                settings,
                stop,
                skip: {
                    disabled: false,
                    action: () => {
                        setState(PomodoroState.STOP);
                    },
                    title: "Skip",
                },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.BREAK_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        setTime((time: number) => time - 1);
                    }, 1000);
                    return interval;
                },
            }
        default:
            console.warn("Unknown state: ", currentState);
            return EMPTY_STATE_MAP;
    }
}