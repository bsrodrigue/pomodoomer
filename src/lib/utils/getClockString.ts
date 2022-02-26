export function getClockString(time: number): string {
    let minutes = (Math.trunc(time / 60)).toString();
    let seconds = (time % 60).toString();

    if (seconds.length === 1) {
        seconds = seconds.padStart(2, '0');
    }
    return `${minutes}:${seconds}`;
}