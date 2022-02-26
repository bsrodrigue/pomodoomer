export function notify(notificationPermission: boolean, title: string, body: string = "Notification"): Notification | null {
    let notification = null;
    if (notificationPermission) {
        notification = new Notification(title, {
            body,
        });
    }
    return notification;
}