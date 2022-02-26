export function notify(notificationPermission: boolean, title: string, body: string = "Notification"): Notification | null {
    let notification = null;
    try {
        if (notificationPermission) {
            notification = new Notification(title, {
                body,
            });
        }
    } catch (error) {
        console.error(error);
    }
    return notification;
}