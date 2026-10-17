class App {
    constructor() {
        this.navigationHandler = new NavigationHandler();
        this.cardScanner = new CardScanner(this.navigationHandler);
        this.lastUrl = location.href;
        this.scanScheduled = false;
    }

    init() {
        this.cardScanner.scan();
        this.startObserver();
        this.navigationHandler.checkInterval = setInterval(() => this.checkUrlChange(), 250);
        window.addEventListener('popstate', () => this.scheduleScan());
    }

    scheduleScan() {
        if (this.scanScheduled) return;
        this.scanScheduled = true;
        setTimeout(() => {
            this.scanScheduled = false;
            this.cardScanner.scan();
            this.checkUrlChange();
        }, 50);
    }

    startObserver() {
        const observer = new MutationObserver((mutations) => {
            if (mutations.some(mutation => mutation.type === 'attributes') || this.hasAddedNodes(mutations)) {
                this.scheduleScan();
            }
            this.checkUrlChange();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href', 'aria-current', 'data-course-lesson', 'src']
        });
    }

    checkUrlChange() {
        const url = location.href;
        if (url !== this.lastUrl) {
            this.lastUrl = url;
            this.scheduleScan();
        }
        this.navigationHandler.handleUrlChange(url);
    }

    hasAddedNodes(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) return true;
        }
        return false;
    }
}

const app = new App();
app.init();
