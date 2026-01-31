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
                let courseName = null;

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

                        const hoverPar = listContainer.parentElement;
                        if (hoverPar) {
                            const titleContainer = hoverPar.querySelector('.css-1rwlwny');
                            if (titleContainer) {
                                const courseTitleEl = titleContainer.children[1];
                                if (courseTitleEl) {
                                    courseName = courseTitleEl.innerText.trim();
                                    console.log("Course Name extracted:", courseName);
                                }
                            }
                        }
                    }
                }

                this.navigationHandler.openTool(directUrl, playlist, index, courseName);
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
