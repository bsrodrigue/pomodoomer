import { PomodoroState } from "../../enums";
import { PomodoroStateMap } from "../../interfaces";
import { settings as env } from "../../settings";

const EMPTY_STATE_MAP: PomodoroStateMap = {
    settings: { disabled: false, action: () => { }, title: "" },
    stop: { disabled: false, action: () => { }, title: "" },
    focus: { disabled: false, action: () => { }, title: "" },
    onMount: () => { },
}

export function getPomodoroStateMap(params: {
    currentState: PomodoroState, setTime: Function, setState: Function
}): PomodoroStateMap {

    const localStorage = window.localStorage;
    const DEFAULT_FOCUS_TIME = parseInt(localStorage.getItem('DEFAULT_FOCUS_TIME') || '0') || env.DEFAULT_FOCUS_TIME;
    const DEFAULT_BREAK_TIME = parseInt(localStorage.getItem('DEFAULT_BREAK_TIME') || '0') || env.DEFAULT_BREAK_TIME;
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
                settings: {
                    disabled: false,
                    action: () => {
                        setState(PomodoroState.SETTINGS);
                    },
                    title: "Settings",
                },
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
        case PomodoroState.SETTINGS:
            return {
                ...EMPTY_STATE_MAP,
                settings: {
                    disabled: true,
                    action: () => { },
                    title: "Settings"
                },
                save: {
                    disabled: false,
                    action: (timeSettings: any) => {
                        const focusMins = parseInt(timeSettings['focus'].minutes);
                        const focusSecs = parseInt(timeSettings['focus'].seconds);
                        const breakMins = parseInt(timeSettings['break'].minutes);
                        const breakSecs = parseInt(timeSettings['break'].seconds);

                        if ([focusMins, focusSecs, breakMins, breakSecs].some((value) => value === undefined)) {
                            return;
                        }

                        const newFocusTime = (focusMins * 60) + focusSecs;
                        const newBreakTime = (breakMins * 60) + breakSecs;

                        localStorage.setItem('DEFAULT_FOCUS_TIME', newFocusTime.toString());
                        localStorage.setItem('DEFAULT_BREAK_TIME', newBreakTime.toString());

                        setState(PomodoroState.STOP);
                    },
                    title: "Save",
                }
            };
        default:
            console.warn("Unknown state: ", currentState);
            return EMPTY_STATE_MAP;
    }
}