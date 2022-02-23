import { useEffect, useRef, useState } from 'react';
import { PomodoroActionMap } from '../../interfaces';
import './style.css';

enum PomodoroStates {
    STOP, FOCUS, PAUSE, DONE, BREAK
}

const DEFAULT_ACTION_MAP: PomodoroActionMap = {
    settings: { disabled: false, action: () => { }, title: "Settings" },
    quit: { disabled: false, action: () => { }, title: "Quit" },
    stop: { disabled: false, action: () => { }, title: "Stop" },
    focus: { disabled: false, action: () => { }, title: "Focus" },
    onMount: () => { },
}

const INITIAL_TIME = 25 * 60;
const INITIAL_STATE = PomodoroStates.STOP;


function getPomodoroActionMap(currentState: PomodoroStates, ref: any, setTime: Function, setState: Function): PomodoroActionMap {
    switch (currentState) {
        case PomodoroStates.STOP:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: () => { }, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.FOCUS);
                    }, title: "Focus"
                },
                onMount: () => {

                },
            }
        case PomodoroStates.FOCUS:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: () => { }, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.PAUSE);
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
        case PomodoroStates.PAUSE:
            return {
                settings: { disabled: false, action: () => { }, title: "Settings" },
                quit: { disabled: false, action: () => { }, title: "Quit" },
                stop: { disabled: false, action: () => { }, title: "Stop" },
                focus: {
                    disabled: false, action: () => {
                        setState(PomodoroStates.FOCUS);
                    }, title: "Focus Again"
                },
                onMount: () => {
                },
            }
        default:
            return DEFAULT_ACTION_MAP;
    }
}

export function PomodoroCard() {
    const ref = useRef<number>(INITIAL_TIME);
    const [time, setTime] = useState<number>(INITIAL_TIME);
    const [state, setState] = useState<number>(INITIAL_STATE);


    const { settings, quit, stop, focus, onMount } = getPomodoroActionMap(state, ref, setTime, setState);


    useEffect(() => {
        const interval = onMount();
        return () => {
            clearInterval(interval);
        }
    }, [state]);


    useEffect(() => {
        if (time === 0) {
            console.log("Time over");
        }
    }, [time]);


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
                    <button onClick={() => { quit.action(); }} disabled={quit.disabled} className="pomodoro-button">{quit.title}</button>
                </div>
            </div>
            <div className='pomodoro-card-content'>
                <p className="pomodoro-timer">{`${minutes}:${seconds}`}</p>
            </div>

            <div className='pomodoro-card-footer'>
                <button onClick={() => { focus.action(); }} disabled={focus.disabled} className="pomodoro-button">{focus.title}</button>
                <button onClick={() => { stop.action(); }} disabled={stop.disabled} className="pomodoro-button">{stop.title}</button>
            </div>
        </div>
    )
}