class NavigationHandler {
    constructor() {
        this.playButtonPending = false;
        this.checkInterval = null;
        this.pendingUrlTransformer = null;
        this.pendingMetadata = null;
    }

    notifyPendingNavigation(urlTransformer = null, metadata = null) {
        this.playButtonPending = true;
        this.pendingUrlTransformer = urlTransformer;
        this.pendingMetadata = metadata;

        setTimeout(() => {
            if (this.playButtonPending) {
                this.playButtonPending = false;
                this.pendingUrlTransformer = null;
                this.pendingMetadata = null;
            }
        }, 5000);
    }

    handleUrlChange(newUrl) {
        if (this.playButtonPending) {
            const urlTransformer = this.pendingUrlTransformer;
            const metadata = this.pendingMetadata;
            this.playButtonPending = false;
            this.pendingUrlTransformer = null;
            this.pendingMetadata = null;

            const targetUrl = urlTransformer ? urlTransformer(newUrl) : newUrl;
            if (targetUrl) {
                this.openTool(targetUrl, [], -1, null, metadata);
            }
        }
    }

    openTool(url, playlist = [], index = -1, courseName = null, commentary = null) {
        let target = `https://skilluncapped.netlify.app/?url=${encodeURIComponent(url)}`;
        if (playlist.length > 0 && index >= 0) {
            target += `&playlist=${encodeURIComponent(JSON.stringify(playlist))}&index=${index}`;
        }
        if (courseName) {
            target += `&course=${encodeURIComponent(courseName)}`;
        }
        if (commentary) {
            target += `&commentary=${encodeURIComponent(JSON.stringify(commentary))}`;
        }
        window.open(target, '_blank');
    }
}
