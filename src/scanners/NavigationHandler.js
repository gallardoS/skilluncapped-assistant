class NavigationHandler {
    constructor() {
        this.playButtonPending = false;
        this.checkInterval = null;
    }

    notifyPendingNavigation() {
        this.playButtonPending = true;

        setTimeout(() => {
            if (this.playButtonPending) {
                this.playButtonPending = false;
            }
        }, 5000);
    }

    handleUrlChange(newUrl) {
        if (this.playButtonPending) {
            this.playButtonPending = false;
            this.openTool(newUrl);
        }
    }

    openTool(url, playlist = [], index = -1, courseName = null) {
        let target = `https://skilluncapped.netlify.app/?url=${encodeURIComponent(url)}`;
        if (playlist.length > 0 && index >= 0) {
            target += `&playlist=${encodeURIComponent(JSON.stringify(playlist))}&index=${index}`;
        }
        if (courseName) {
            target += `&course=${encodeURIComponent(courseName)}`;
        }
        window.open(target, '_blank');
    }
}
