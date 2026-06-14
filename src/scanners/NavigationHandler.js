class NavigationHandler {
    constructor() {
        this.playButtonPending = false;
        this.checkInterval = null;
        this.pendingUrlTransformer = null;
    }

    notifyPendingNavigation(urlTransformer = null) {
        this.playButtonPending = true;
        this.pendingUrlTransformer = urlTransformer;

        setTimeout(() => {
            if (this.playButtonPending) {
                this.playButtonPending = false;
                this.pendingUrlTransformer = null;
            }
        }, 5000);
    }

    handleUrlChange(newUrl) {
        if (this.playButtonPending) {
            const urlTransformer = this.pendingUrlTransformer;
            this.playButtonPending = false;
            this.pendingUrlTransformer = null;

            const targetUrl = urlTransformer ? urlTransformer(newUrl) : newUrl;
            if (targetUrl) {
                this.openTool(targetUrl);
            }
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
