class CardScanner {
    constructor(navigationHandler) {
        this.navigationHandler = navigationHandler;
    }

    scan() {
        this.scanCards();
        this.scanEpisodes();
        this.scanBrowseCards();
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

    scanBrowseCards() {

        const cards = document.querySelectorAll('[data-name="Course Card Parent"]');

        cards.forEach(card => {
            if (card.querySelector('.skilluncapped-card-play-btn')) return;



            const buttonComponent = new PlayButtonComponent((e) => {
                e.preventDefault();
                e.stopPropagation();

                const firstEpLink = card.querySelector('a[href*="/browse/course/"]');

                if (!firstEpLink) {
                    console.warn("SkillUncapped Assistant: No episode links found on card. Hover to load data?");
                    card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                    return;
                }

                const directUrl = firstEpLink.href;

                let playlist = [];
                let index = -1;
                let courseName = null;

                const listContainer = firstEpLink.closest('.css-bj5ou2') || firstEpLink.parentElement;

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
                }

                const titleContainer = card.querySelector('.css-1rwlwny');
                if (titleContainer) {
                    const courseTitleEl = titleContainer.children[1];
                    if (courseTitleEl) {
                        courseName = courseTitleEl.innerText.trim();
                    }
                }

                console.log("Quick Playing:", { directUrl, index, courseName, playlist });
                this.navigationHandler.openTool(directUrl, playlist, index, courseName);
            });

            const btn = buttonComponent.create();
            btn.classList.add('skilluncapped-card-play-btn');

            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }

            card.appendChild(btn);
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
