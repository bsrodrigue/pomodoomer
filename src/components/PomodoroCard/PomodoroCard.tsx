import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PomodoroStateMap } from '../../interfaces';
import './style.css';

// Skippable states: FOCUS, BREAK

enum PomodoroState {
    STOP, FOCUS, FOCUS_PAUSE, DONE, BREAK, BREAK_PAUSE
}

const EMPTY_STATE_MAP: PomodoroStateMap = {
    settings: { disabled: false, action: () => { }, title: "" },
    stop: { disabled: false, action: () => { }, title: "" },
    focus: { disabled: false, action: () => { }, title: "" },
    onMount: () => { },
}

const DEFAULT_FOCUS_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;
const INITIAL_STATE = PomodoroState.STOP;


function getPomodoroStateMap(params: {
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
            return EMPTY_STATE_MAP;
    }
}

function getClockString(time: number): string {
    let minutes = (Math.trunc(time / 60)).toString();
    let seconds = (time % 60).toString();

    if (seconds.length === 1) {
        seconds = seconds.padStart(2, '0');
    }
    return `${minutes}:${seconds}`;
}

function notify(notificationPermission: boolean, title: string, body: string = "Notification"): Notification | null {
    let notification = null;
    if (notificationPermission) {
        notification = new Notification(title, {
            body,
        });
    }
    return notification;
}

export function PomodoroCard() {
    const [time, setTime] = useState<number>(DEFAULT_FOCUS_TIME);
    const [state, setState] = useState<number>(INITIAL_STATE);
    const [contextColor, setContextColor] = useState<string>('#FF0075')
    const [permissions, setPermissions] = useState<any>({});

    const { settings, stop, focus, skip, onMount } = getPomodoroStateMap({
        currentState: state, setTime, setState
    });

    const pageTitle = `Pomodoomer ${getClockString(time)}`;

    useEffect(() => {
        async function requestNotificationPermission() {
            const permission = await Notification.requestPermission();
            setPermissions((permissions: any) => {
                permissions['notification'] = permission === 'granted';
                return permissions;
            })
        }

        requestNotificationPermission();
    }, [])

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    useEffect(() => {
        const FOCUS_TIME_OVER_MSG = "Focus time is over, take a break!"
        const BREAK_TIME_OVER_MSG = "Break time is over, back to work!"
        if (time === 0) {
            if (state === PomodoroState.FOCUS) {
                setState(PomodoroState.DONE);
                toast(FOCUS_TIME_OVER_MSG, { type: 'success' });
                notify(permissions['notification'], FOCUS_TIME_OVER_MSG);
            } else if (state === PomodoroState.BREAK) {
                setState(PomodoroState.STOP);
                toast(BREAK_TIME_OVER_MSG, { type: 'error' });
                notify(permissions['notification'], BREAK_TIME_OVER_MSG);
            }
        }
    }, [time, state, permissions]);

    useEffect(() => {
        const interval = onMount();
        if (state === PomodoroState.DONE) {
            if (interval) clearInterval(interval);
            setContextColor('#77D970');
        } else if (state === PomodoroState.STOP) {
            if (interval) clearInterval(interval);
            setContextColor('#FF0075');
        }
        return () => {
            clearInterval(interval);
        }
    }, [state, onMount]);

    useEffect(() => {
        const body = document.querySelector('body');
        if (body) {
            body.style.backgroundColor = contextColor;
        }
    }, [contextColor]);

    return (
        <div className='pomodoro-card material-shadow'>
            <div className='pomodoro-card-header'>
                <p className="pomodoro-card-header-title">Pomodoomer</p>
                <div className='pomodoro-card-header-actions'>
                    <button onClick={() => { settings.action(); }} disabled={settings.disabled} className="pomodoro-button">{settings.title}</button>
                </div>
            </div>
            <div className='pomodoro-card-content'>
                <p style={{ color: contextColor }} className="pomodoro-timer">{getClockString(time)}</p>
            </div>
            <div className='pomodoro-card-footer'>
                <button onClick={() => { focus.action(); }} disabled={focus.disabled} className="pomodoro-button">{focus.title}</button>
                {
                    skip && (
                        <button onClick={() => { skip.action(); }} disabled={skip.disabled} className="pomodoro-button">{skip.title}</button>
                    )
                }
                <button onClick={() => { stop.action(); }} disabled={stop.disabled} className="pomodoro-button">{stop.title}</button>
            </div>
        </div>
    )
}