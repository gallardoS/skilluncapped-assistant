class App {
    constructor() {
        this.navigationHandler = new NavigationHandler();
        this.cardScanner = new CardScanner(this.navigationHandler);
        this.lastUrl = location.href;
    }

    init() {
        this.cardScanner.scan();
        this.startObserver();
    }

    startObserver() {
        const observer = new MutationObserver((mutations) => {
            this.checkUrlChange();

            if (this.hasAddedNodes(mutations)) {
                this.cardScanner.scan();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    checkUrlChange() {
        const url = location.href;
        if (url !== this.lastUrl) {
            this.lastUrl = url;
            this.navigationHandler.handleUrlChange(url);
        }
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
