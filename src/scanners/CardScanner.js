class CardScanner {
    constructor(navigationHandler) {
        this.navigationHandler = navigationHandler;
    }

    scan() {
        this.scanCards();
        this.scanEpisodes();
        this.scanBrowseCards();
        this.scanCommentaryCards();
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

    scanCommentaryCards() {
        if (!window.location.pathname.includes('/commentaries')) return;

        const cards = document.querySelectorAll('[data-name*="CommentaryCard"]');
        const links = document.querySelectorAll('a[href*="/commentaries/"]');

        cards.forEach(card => {
            this.enhanceCommentaryCard(card, card.querySelector('a[href*="/commentaries/"]'));
        });

        links.forEach(link => {
            const card = this.findCommentaryCard(link);
            this.enhanceCommentaryCard(card, link);
        });
    }

    enhanceCommentaryCard(card, link = null) {
        if (!card || card.querySelector('.skilluncapped-commentary-play-btn')) return;

        const buttonComponent = new PlayButtonComponent((e) => {
            const targetUrl = link ? this.buildCommentaryPlaybackUrl(link.getAttribute('href')) : null;
            const commentary = this.extractCommentaryMetadata(card);

            if (targetUrl) {
                e.preventDefault();
                e.stopPropagation();
                this.navigationHandler.openTool(targetUrl, [], -1, null, commentary);
                return;
            }

            this.navigationHandler.notifyPendingNavigation(
                (url) => this.buildCommentaryPlaybackUrl(url),
                commentary
            );
            e.preventDefault();
            e.stopPropagation();

            const nativeTarget = this.findCommentaryNativeClickTarget(card);
            if (nativeTarget) {
                nativeTarget.click();
            }
        });

        const btn = buttonComponent.create();
        btn.classList.add('skilluncapped-commentary-play-btn');

        if (getComputedStyle(card).position === 'static') {
            card.style.position = 'relative';
        }

        card.appendChild(btn);
    }

    extractCommentaryMetadata(card) {
        const leafTexts = Array.from(card.querySelectorAll('div, span'))
            .filter(element => element.childElementCount === 0)
            .map(element => element.textContent.trim())
            .filter(Boolean);
        const findText = (pattern) => leafTexts.find(text => pattern.test(text)) || null;
        const findValueAfterLabel = (label) => {
            const labelElement = Array.from(card.querySelectorAll('div, span')).find(element =>
                element.childElementCount === 0 && element.textContent.trim().toUpperCase() === label
            );
            return labelElement?.nextElementSibling?.textContent.trim() || null;
        };

        const championIcons = Array.from(card.querySelectorAll(
            'img[src*="/ddragon/champimg/"], img[srcset*="/ddragon/champimg/"]'
        )).slice(0, 2).map(image => {
            const src = image.currentSrc || image.src;
            const id = src.match(/\/champimg\/(\d+)/)?.[1] || null;
            return { id, src };
        });

        const kdaContainer = Array.from(card.querySelectorAll('div')).find(element => {
            const directSpans = Array.from(element.children).filter(child => child.tagName === 'SPAN');
            return directSpans.length >= 5 && /^\d+\/\d+\/\d+$/.test(element.textContent.replace(/\s/g, ''));
        });
        const playerIcon = card.querySelector(
            'img[src*="commentary-page/Rectangle"], img[srcset*="commentary-page/Rectangle"]'
        );
        const loadoutIcons = Array.from(card.querySelectorAll(
            'img[src*="/img/item/"], img[srcset*="/img/item/"], img[src*="/perk-images/"], img[srcset*="/perk-images/"]'
        )).map(image => {
            const src = image.currentSrc || image.src;
            const itemMatch = src.match(/\/cdn\/([^/]+)\/img\/item\/(\d+)\.png/i);
            const runeMatch = src.match(/\/(perk-images\/[^?]+\.png)/i);

            return {
                src,
                kind: itemMatch ? 'item' : 'rune',
                id: itemMatch?.[2] || null,
                version: itemMatch?.[1] || null,
                iconPath: runeMatch?.[1] || null
            };
        });
        const roleElement = Array.from(card.querySelectorAll('div, span')).find(element =>
            element.childElementCount === 0 &&
            /^(TOP|JUNGLE|MID|MIDDLE|ADC|BOT|BOTTOM|SUPPORT)$/i.test(element.textContent.trim())
        );
        const role = roleElement?.textContent.trim() ||
            findText(/^(TOP|JUNGLE|MID|MIDDLE|ADC|BOT|BOTTOM|SUPPORT)$/i);
        const roleSvg = roleElement?.parentElement?.querySelector('svg');

        return {
            championIcons,
            loadoutIcons,
            role,
            roleIcon: this.serializeSvgIcon(roleSvg, role),
            kda: kdaContainer?.textContent.replace(/\s/g, '') || null,
            player: playerIcon?.parentElement?.textContent.trim() || null,
            rank: findText(/^(IRON|BRONZE|SILVER|GOLD|PLATINUM|EMERALD|DIAMOND|MASTER|GRANDMASTER|CHALLENGER)$/i),
            peakRank: findText(/^PEAK RANK\s*:/i),
            carry: findValueAfterLabel('CARRY'),
            type: findValueAfterLabel('TYPE'),
            isNew: leafTexts.some(text => text.toUpperCase() === 'NEW')
        };
    }

    serializeSvgIcon(svg, role = null) {
        if (!svg) return null;

        const laneIcon = this.createLaneRoleIcon(role);
        if (laneIcon) return laneIcon;

        const clone = svg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.removeAttribute('class');

        const sourceShapes = svg.querySelectorAll('path, polygon, circle, rect, line, polyline, ellipse');
        const clonedShapes = clone.querySelectorAll('path, polygon, circle, rect, line, polyline, ellipse');
        sourceShapes.forEach((shape, index) => {
            const clonedShape = clonedShapes[index];
            if (!clonedShape) return;

            const styles = getComputedStyle(shape);
            if (styles.fill) clonedShape.setAttribute('fill', styles.fill);
            if (styles.stroke) clonedShape.setAttribute('stroke', styles.stroke);
            clonedShape.removeAttribute('class');
        });

        const markup = new XMLSerializer().serializeToString(clone);
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    }

    createLaneRoleIcon(role) {
        const normalizedRole = role?.toUpperCase();
        if (!['TOP', 'MID', 'MIDDLE', 'ADC', 'BOT', 'BOTTOM'].includes(normalizedRole)) return null;

        const inactiveColor = '#4f5661';
        const activeColor = '#ffffff';
        const isTop = normalizedRole === 'TOP';
        const isMid = normalizedRole === 'MID' || normalizedRole === 'MIDDLE';

        if (isMid) {
            const markup = [
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 38">',
                `<polygon fill="${activeColor}" points="36.46 9.93 36.46 4.54 31.07 4.54 7.54 28.07 7.54 33.46 12.93 33.46 36.46 9.93"/>`,
                `<path fill="${inactiveColor}" d="M27,4.54H7.54V24l5.2-5.2V9.74h9.09Zm4.23,14.63v9.09H22.17L17,33.46H36.46V14Z"/>`,
                '</svg>'
            ].join('');
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
        }

        const topColor = isTop ? activeColor : inactiveColor;
        const bottomColor = isTop ? inactiveColor : activeColor;
        const markup = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 38">',
            `<polygon fill="${bottomColor}" points="31.26 12.33 31.26 28.26 15.33 28.26 10.13 33.46 36.46 33.46 36.46 7.13 31.26 12.33"/>`,
            `<polygon fill="${topColor}" points="12.74 25.67 12.74 9.74 28.67 9.74 33.87 4.54 7.54 4.54 7.54 30.86 12.74 25.67"/>`,
            `<rect fill="${inactiveColor}" x="18.11" y="15.11" width="7.78" height="7.78"/>`,
            '</svg>'
        ].join('');

        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    }

    findCommentaryNativeClickTarget(card) {
        return card.querySelector('img[src*="Play%20Button"], img[srcset*="Play%20Button"]') || card;
    }

    findCommentaryCard(link) {
        const namedCard = link.closest('[data-name*="CommentaryCard"]');
        if (namedCard) return namedCard;

        let candidate = link.parentElement;
        while (candidate && candidate !== document.body) {
            if (candidate.querySelectorAll('a[href*="/commentaries/"]').length === 1) {
                return candidate;
            }
            candidate = candidate.parentElement;
        }

        return link.parentElement;
    }

    buildCommentaryPlaybackUrl(href) {
        if (!href) return null;

        try {
            const url = new URL(href, window.location.origin);
            const path = url.pathname.replace(/\/+$/, '');
            if (!/\/commentaries\/[^/]+/.test(path)) return null;

            url.pathname = path.endsWith('/qqq') ? path : `${path}/qqq`;
            return url.href;
        } catch (error) {
            console.warn('SkillUncapped Assistant: Invalid commentary URL', href, error);
            return null;
        }
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
