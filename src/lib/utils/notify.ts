export function notify(notificationPermission: boolean, title: string, body: string = "Notification"): Notification | null {
    let notification = null;
    try {
        if (notificationPermission) {
            navigator.serviceWorker.register('sw.js');
            navigator.serviceWorker.ready.then(function (registration) {
                registration.showNotification(title, {
                    body,
                });
            });
        }
    } catch (error) {
        alert(error);
    }
    return notification;
}