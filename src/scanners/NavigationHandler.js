class NavigationHandler {
    constructor() {
        this.playButtonPending = false;
        this.checkInterval = null;
        this.pendingUrlTransformer = null;
        this.pendingMetadata = null;
        this.pendingContextResolver = null;
        this.pendingWindow = null;
        this.pendingTimeout = null;
        this.pendingStartUrl = null;
        this.pendingFallback = null;
    }

    clearPendingNavigation(closeWindow = false) {
        clearTimeout(this.pendingTimeout);
        if (closeWindow && this.pendingWindow && !this.pendingWindow.closed) this.pendingWindow.close();
        this.playButtonPending = false;
        this.pendingUrlTransformer = null;
        this.pendingMetadata = null;
        this.pendingContextResolver = null;
        this.pendingWindow = null;
        this.pendingStartUrl = null;
        this.pendingFallback = null;
    }

    notifyPendingNavigation(urlTransformer = null, metadata = null, contextResolver = null, fallback = null) {
        this.clearPendingNavigation(true);
        this.playButtonPending = true;
        this.pendingUrlTransformer = urlTransformer;
        this.pendingMetadata = metadata;
        this.pendingContextResolver = contextResolver;
        this.pendingStartUrl = window.location.href;
        this.pendingFallback = fallback;
        this.pendingWindow = window.open('about:blank', '_blank');
        if (this.pendingWindow) this.pendingWindow.opener = null;

        this.pendingTimeout = setTimeout(() => {
            if (!this.pendingFallback?.url) {
                this.clearPendingNavigation(true);
                return;
            }
            const playbackWindow = this.pendingWindow;
            const pendingFallback = this.pendingFallback;
            const pendingMetadata = this.pendingMetadata;
            this.clearPendingNavigation();
            if (playbackWindow?.closed) return;
            this.openTool(pendingFallback.url, [], -1, pendingFallback.courseName, pendingMetadata, playbackWindow);
        }, 10000);
    }

    handleUrlChange(newUrl) {
        if (this.playButtonPending && newUrl !== this.pendingStartUrl) {
            const urlTransformer = this.pendingUrlTransformer;
            const metadata = this.pendingMetadata;
            const targetUrl = urlTransformer ? urlTransformer(newUrl) : newUrl;
            const context = this.pendingContextResolver?.(targetUrl);
            if (this.pendingContextResolver && !context) return;
            if (targetUrl) {
                const playbackWindow = this.pendingWindow;
                const courseName = context?.courseName || this.pendingFallback?.courseName || null;
                this.clearPendingNavigation();
                if (playbackWindow?.closed) return;
                this.openTool(targetUrl, context?.playlist || [], context?.index ?? -1,
                    courseName, metadata, playbackWindow);
            }
        }
    }

    openTool(url, playlist = [], index = -1, courseName = null, commentary = null, playbackWindow = null) {
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
        if (playbackWindow && !playbackWindow.closed) {
            playbackWindow.location.replace(target);
        } else {
            window.open(target, '_blank');
        }
    }
}
