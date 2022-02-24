import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PomodoroStateMap } from '../../interfaces';
import './style.css';

enum PomodoroState {
    STOP, FOCUS, FOCUS_PAUSE, DONE, BREAK, BREAK_PAUSE
}

const EMPTY_STATE_MAP: PomodoroStateMap = {
    settings: { disabled: false, action: () => { }, title: "" },
    stop: { disabled: false, action: () => { }, title: "" },
    focus: { disabled: false, action: () => { }, title: "" },
    onMount: () => { },
}

const DEFAULT_FOCUS_TIME = 1 * 60;
const DEFAULT_BREAK_TIME = 1 * 60;
const INITIAL_STATE = PomodoroState.STOP;


function getPomodoroStateMap(params: {
    currentState: PomodoroState, timeRef: any, setTime: Function, setState: Function
}): PomodoroStateMap {

    const { currentState, timeRef, setTime, setState } = params;

    function onStop() {
        setState(PomodoroState.STOP);
    }

    function onSettings() {

    }

    const stop = { disabled: false, action: onStop, title: "Stop" };
    const settings = { disabled: false, action: onSettings, title: "Settings" };

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
                    timeRef.current = DEFAULT_FOCUS_TIME;
                    setTime(timeRef.current);
                },
            }
        case PomodoroState.FOCUS:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.FOCUS_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        timeRef.current = timeRef.current - 1;
                        setTime(timeRef.current);
                        if (timeRef.current === 0) clearInterval(interval);
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
                    timeRef.current = DEFAULT_BREAK_TIME;
                    setTime(timeRef.current);
                },
            }
        case PomodoroState.BREAK:
            return {
                settings,
                stop,
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroState.BREAK_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        timeRef.current = timeRef.current - 1;
                        setTime(timeRef.current);
                        if (timeRef.current === 0) clearInterval(interval);
                    }, 1000);
                    return interval;
                },
            }
        default:
            return EMPTY_STATE_MAP;
    }
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
    const timeRef = useRef<number>(DEFAULT_FOCUS_TIME);
    const [time, setTime] = useState<number>(DEFAULT_FOCUS_TIME);
    const [state, setState] = useState<number>(INITIAL_STATE);
    const [contextColor, setContextColor] = useState<string>('#FF0075')
    const [permissions, setPermissions] = useState<any>({});

    const { settings, stop, focus, onMount } = getPomodoroStateMap({
        currentState: state, timeRef, setTime, setState
    });

    useEffect(() => {
        document.title = "Pomodoomer";
        async function requestNotificationPermission() {
            const permission = await Notification.requestPermission();
            permissions['notification'] = permission === 'granted';
            setPermissions(permissions)
        }

        requestNotificationPermission();
    }, []);



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
    }, [time, state]);

    useEffect(() => {
        const interval = onMount();
        if (state === PomodoroState.DONE) {
            setContextColor('#77D970');
        } else if (state === PomodoroState.BREAK) {
            setContextColor('#77D970');
        }
        else if (state === PomodoroState.BREAK_PAUSE) {
            setContextColor('#77D970');
        }
        else {
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



    let minutes = (Math.trunc(time / 60)).toString();
    let seconds = (time % 60).toString();

    if (seconds.length === 1) {
        seconds = seconds.padStart(2, '0');
    }

    return (
        <div className='pomodoro-card material-shadow'>
            <div className='pomodoro-card-header'>
                <p className="pomodoro-card-header-title">Pomodoomer</p>
                <div className='pomodoro-card-header-actions'>
                    <button onClick={() => { settings.action(); }} disabled={settings.disabled} className="pomodoro-button">{settings.title}</button>
                </div>
            </div>
            <div className='pomodoro-card-content'>
                <p style={{ color: contextColor }} className="pomodoro-timer">{`${minutes}:${seconds}`}</p>
            </div>
            <div className='pomodoro-card-footer'>
                <button onClick={() => { focus.action(); }} disabled={focus.disabled} className="pomodoro-button">{focus.title}</button>
                <button onClick={() => { stop.action(); }} disabled={stop.disabled} className="pomodoro-button">{stop.title}</button>
            </div>
        </div>
    )
}