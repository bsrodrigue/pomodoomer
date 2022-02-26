import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { PomodoroState } from '../../enums';
import { getClockString, getPomodoroStateMap, notify } from '../../lib/utils';
import { settings } from '../../settings';
import './style.css';

const { DEFAULT_FOCUS_TIME } = settings;
const INITIAL_STATE = PomodoroState.STOP;

export function PomodoroCard() {
    const [time, setTime] = useState<number>(DEFAULT_FOCUS_TIME);
    const [state, setState] = useState<number>(INITIAL_STATE);
    const [contextColor, setContextColor] = useState<string>('#FF0075')
    const [permissions, setPermissions] = useState<any>({});


    const stateMap = useCallback(() => {
        return getPomodoroStateMap({
            currentState: state, setTime, setState
        });
    }, [state]);

    const { stop, settings, skip, focus, onMount } = stateMap();

    document.title = `Pomodoomer ${getClockString(time)}`;

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
            setContextColor('#77D970');
        } else if (state === PomodoroState.STOP) {
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