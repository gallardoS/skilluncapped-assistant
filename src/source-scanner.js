

class PlayButtonComponent {
    constructor(onClick) {
        this.onClick = onClick;
    }

    create() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("skilluncapped-btn-wrapper");

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 42 42");
        svg.classList.add("skilluncapped-play-btn");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M20.91,0A20.92,20.92,0,1,0,41.83,20.91,20.91,20.91,0,0,0,20.91,0ZM16,29.29V12.53l14.71,8.38Z");
        svg.appendChild(path);

        svg.addEventListener('click', (e) => this.onClick(e));

        const baseDelays = [0, 0.7, 1.2];
        const randomOffset = Math.random() * 2;

        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement("span");
            sparkle.classList.add("skilluncapped-sparkle");
            sparkle.style.animationDelay = `${baseDelays[i] + randomOffset}s`;
            wrapper.appendChild(sparkle);
        }

        wrapper.appendChild(svg);
        return wrapper;
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

    openTool(url, playlist = [], index = -1) {
        let target = `https://skilluncapped.netlify.app/?url=${encodeURIComponent(url)}`;
        if (playlist.length > 0 && index >= 0) {
            target += `&playlist=${encodeURIComponent(JSON.stringify(playlist))}&index=${index}`;
        }
        window.open(target, '_blank');
    }
}

class CardScanner {
    constructor(navigationHandler) {
        this.navigationHandler = navigationHandler;
    }

    scan() {
        this.scanCards();
        this.scanEpisodes();
    }

    scanCards() {
        const cards = document.querySelectorAll('[data-name="CourseOverviewVidCard"]');

        cards.forEach(card => {
            if (card.querySelector('.skilluncapped-play-btn')) return;

            const titleEl = card.querySelector('div[style*="font-size: 16px"]');
            if (titleEl && titleEl.parentElement) {
                this.enhanceCard(titleEl.parentElement);
            }
        });
    }

    scanEpisodes() {
        const anchors = document.querySelectorAll('a[href*="/browse/course/"]');

        anchors.forEach(anchor => {
            if (anchor.querySelector('.skilluncapped-play-btn')) return;

            const originalBtn = anchor.querySelector('svg[data-name="Play Button"]');
            if (originalBtn) {
                const container = anchor.firstElementChild;
                if (container) {
                    this.enhanceCard(container, anchor.href, anchor);
                }
            }
        });
    }

    enhanceCard(container, directUrl = null, anchorElement = null) {
        container.classList.add('skilluncapped-title-container');

        const buttonComponent = new PlayButtonComponent((e) => {
            if (directUrl) {
                e.preventDefault();
                e.stopPropagation();

                let playlist = [];
                let index = -1;

                if (anchorElement) {
                    const listContainer = anchorElement.closest('.css-bj5ou2') || anchorElement.parentElement;
                    if (listContainer) {
                        const siblings = Array.from(listContainer.querySelectorAll('a[href*="/browse/course/"]'));
                        playlist = siblings.map(a => {
                            const numEl = a.querySelector('.css-1mtsivt:nth-child(1) div:nth-child(2)');
                            const titleEl = a.querySelector('.css-1mtsivt:nth-child(2) div');
                            return {
                                url: a.href,
                                number: numEl ? numEl.innerText.trim() : '00',
                                title: titleEl ? titleEl.innerText.trim() : 'Unknown Episode'
                            };
                        });
                        index = playlist.findIndex(item => item.url === directUrl);
                        console.log("Playlist extracted:", playlist);
                        console.log("Current Index:", index);
                    }
                }

                this.navigationHandler.openTool(directUrl, playlist, index);
            } else {
                const card = container.closest('[data-name="CourseOverviewVidCard"]');
                const isCurrent = card && card.querySelector('.current-video');

                if (isCurrent) {
                    this.navigationHandler.openTool(window.location.href);
                } else {
                    this.navigationHandler.notifyPendingNavigation();
                }
            }
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
