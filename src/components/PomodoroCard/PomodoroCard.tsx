import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PomodoroActionMap } from '../../interfaces';
import './style.css';

enum PomodoroStates {
    STOP, FOCUS, FOCUS_PAUSE, BREAK_PAUSE, DONE, BREAK
}

const DEFAULT_ACTION_MAP: PomodoroActionMap = {
    settings: { disabled: false, action: () => { }, title: "Settings" },
    quit: { disabled: false, action: () => { }, title: "Quit" },
    stop: { disabled: false, action: () => { }, title: "Stop" },
    focus: { disabled: false, action: () => { }, title: "Focus" },
    onMount: () => { },
}

const DEFAULT_FOCUS_TIME = 1 * 10;
const DEFAULT_BREAK_TIME = 1 * 10;
const INITIAL_STATE = PomodoroStates.STOP;


function getPomodoroActionMap(currentState: PomodoroStates, ref: any, setTime: Function, setState: Function): PomodoroActionMap {

    function stop() {
        setState(PomodoroStates.STOP);
    }

    switch (currentState) {
        case PomodoroStates.STOP:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.FOCUS);
                    }, title: "Focus"
                },
                onMount: () => {
                    ref.current = DEFAULT_FOCUS_TIME;
                    setTime(ref.current);
                },
            }
        case PomodoroStates.FOCUS:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.FOCUS_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        ref.current = ref.current - 1;
                        setTime(ref.current);
                        if (ref.current === 0) clearInterval(interval);
                    }, 1000);
                    return interval;
                },
            }
        case PomodoroStates.FOCUS_PAUSE:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.FOCUS);
                    }, title: "Resume focus"
                },
                onMount: () => {
                },
            }
        case PomodoroStates.BREAK_PAUSE:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.BREAK);
                    }, title: "Resume break"
                },
                onMount: () => {
                },
            }
        case PomodoroStates.DONE:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.BREAK);
                    }, title: "Take a break"
                },
                onMount: () => {
                    ref.current = DEFAULT_BREAK_TIME;
                    setTime(ref.current);
                },
            }
        case PomodoroStates.BREAK:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: stop, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.BREAK_PAUSE);
                    }, title: "Pause"
                },
                onMount: () => {
                    let interval = setInterval(() => {
                        ref.current = ref.current - 1;
                        setTime(ref.current);
                        if (ref.current === 0) clearInterval(interval);
                    }, 1000);
                    return interval;
                },
            }
        default:
            return DEFAULT_ACTION_MAP;
    }
}

export function PomodoroCard() {
    const ref = useRef<number>(DEFAULT_FOCUS_TIME);
    const [time, setTime] = useState<number>(DEFAULT_FOCUS_TIME);
    const [state, setState] = useState<number>(INITIAL_STATE);
    const [contextColor, setContextColor] = useState<string>('#FF0075')


    const { settings, stop, focus, onMount } = getPomodoroActionMap(state, ref, setTime, setState);

    useEffect(() => {
        if (time === 0) {
            if (state === PomodoroStates.FOCUS) {
                setState(PomodoroStates.DONE);
                toast("Focus time is over, take a break!", { type: 'success' });
            } else if (state === PomodoroStates.BREAK) {
                setState(PomodoroStates.STOP);
                toast("Break time is over, back to focus!", { type: 'error' });
            }
        }
    }, [time, state]);


    useEffect(() => {
        const interval = onMount();
        if (state === PomodoroStates.DONE) {
            setContextColor('#77D970');
        } else if (state === PomodoroStates.BREAK) {
            setContextColor('#77D970');
        }
        else if (state === PomodoroStates.BREAK_PAUSE) {
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