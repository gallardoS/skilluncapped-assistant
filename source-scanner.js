

class PlayButtonComponent {
    constructor(onClick) {
        this.onClick = onClick;
    }

    create() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 42 42");
        svg.classList.add("skilluncapped-play-btn");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M20.91,0A20.92,20.92,0,1,0,41.83,20.91,20.91,20.91,0,0,0,20.91,0ZM16,29.29V12.53l14.71,8.38Z");
        svg.appendChild(path);

        svg.addEventListener('click', (e) => this.onClick(e));
        return svg;
    }
}

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

    openTool(url) {
        const target = `https://skilluncapped.netlify.app/?url=${encodeURIComponent(url)}`;
        window.open(target, '_blank');
    }
}

class CardScanner {
    constructor(navigationHandler) {
        this.navigationHandler = navigationHandler;
    }

    scan() {
        const cards = document.querySelectorAll('[data-name="CourseOverviewVidCard"]');

        cards.forEach(card => {
            if (card.querySelector('.skilluncapped-play-btn')) return;

            const titleEl = card.querySelector('div[style*="font-size: 16px"]');
            if (titleEl && titleEl.parentElement) {
                this.enhanceCard(titleEl.parentElement);
            }
        });
    }

    enhanceCard(container) {
        container.classList.add('skilluncapped-title-container');

        const buttonComponent = new PlayButtonComponent(() => {
            this.navigationHandler.notifyPendingNavigation();
        });

        container.appendChild(buttonComponent.create());
    }
}

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
