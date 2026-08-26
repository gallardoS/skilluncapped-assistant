function injectControls(playlist, currentIndex, courseName = null, commentary = null) {
    if (document.getElementById('skilluncapped-controls')) return;

    const currentItem = playlist[currentIndex];
    const container = document.createElement('div');
    container.id = 'skilluncapped-controls';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'skilluncapped-title-group';

    if (courseName) {
        const courseEl = document.createElement('div');
        courseEl.className = 'skilluncapped-course-name';
        courseEl.textContent = courseName;
        titleGroup.appendChild(courseEl);
    } else if (commentary) {
        const commentaryDetails = [commentary.player, commentary.rank, commentary.peakRank]
            .filter(Boolean);
        if (commentaryDetails.length) {
            const courseEl = document.createElement('div');
            courseEl.className = 'skilluncapped-course-name';
            courseEl.textContent = commentaryDetails.join(' · ');
            titleGroup.appendChild(courseEl);
        }
    }

    const titleEl = document.createElement('h1');
    titleEl.className = 'skilluncapped-playlist-title';
    if (currentItem) {
        titleEl.textContent = `EP ${currentItem.number}: ${currentItem.title}`;
        titleEl.title = currentItem.title;
    } else if (commentary) {
        renderCommentaryTitle(titleEl, commentary);
    } else {
        titleEl.textContent = 'Video player';
    }
    titleGroup.appendChild(titleEl);
    if (!currentItem && commentary) {
        renderCommentaryLoadout(titleGroup, commentary);
    }
    container.appendChild(titleGroup);

    const actions = document.createElement('div');
    actions.className = 'skilluncapped-video-actions';
    actions.appendChild(injectDownloadDialog(
        titleEl.dataset.downloadTitle || titleEl.title || titleEl.textContent.trim()
    ));
    actions.appendChild(createTheaterModeButton());

    const navigation = document.createElement('div');
    navigation.className = 'skilluncapped-video-navigation';

    if (currentIndex > 0) {
        const prevItem = playlist[currentIndex - 1];
        navigation.appendChild(createNavButton('←', `Previous: ${prevItem.title}`, () => {
            updatePage(prevItem.url, playlist, currentIndex - 1, courseName);
        }));
    }

    if (currentIndex < playlist.length - 1) {
        const nextItem = playlist[currentIndex + 1];
        navigation.appendChild(createNavButton('→', `Next: ${nextItem.title}`, () => {
            updatePage(nextItem.url, playlist, currentIndex + 1, courseName);
        }));
    }

    if (navigation.childElementCount) actions.appendChild(navigation);
    container.appendChild(actions);

    const details = document.querySelector('.skilluncapped-video-details');
    (details || document.body).appendChild(container);

    injectPlaylistSidebar(playlist, currentIndex, courseName);
}

function renderCommentaryTitle(titleEl, commentary) {
    titleEl.classList.add('skilluncapped-commentary-title');

    const icons = Array.isArray(commentary.championIcons) ? commentary.championIcons.slice(0, 2) : [];
    icons.forEach((champion, index) => {
        if (index > 0) {
            const versus = document.createElement('span');
            versus.className = 'skilluncapped-commentary-vs';
            versus.textContent = 'vs';
            titleEl.appendChild(versus);
        }

        const fallbackName = champion.id ? `Champion ${champion.id}` : 'Champion';
        const tooltip = document.createElement('span');
        tooltip.className = 'skilluncapped-commentary-champion-tooltip';
        tooltip.dataset.tooltip = fallbackName;
        tooltip.setAttribute('aria-label', fallbackName);
        tooltip.tabIndex = 0;

        const icon = document.createElement('img');
        icon.className = 'skilluncapped-commentary-champion';
        icon.src = champion.src;
        icon.alt = fallbackName;
        tooltip.appendChild(icon);
        titleEl.appendChild(tooltip);

        champion.tooltipElement = tooltip;
        champion.imageElement = icon;
    });

    const summaryParts = [commentary.role, commentary.kda].filter(Boolean);
    const tags = [commentary.carry, commentary.type, commentary.isNew ? 'NEW' : null].filter(Boolean);
    const readableTitle = [...summaryParts, ...tags].join(' · ') || 'Smurf commentary';

    if (commentary.roleIcon && commentary.role) {
        const roleIcon = document.createElement('img');
        roleIcon.className = 'skilluncapped-commentary-role-icon';
        roleIcon.src = commentary.roleIcon;
        roleIcon.alt = '';
        roleIcon.setAttribute('aria-hidden', 'true');
        titleEl.appendChild(roleIcon);
    }

    const summary = document.createElement('span');
    summary.className = 'skilluncapped-commentary-summary';
    summary.textContent = readableTitle;
    titleEl.appendChild(summary);
    const accessibleTitle = [commentary.player, readableTitle].filter(Boolean).join(' · ');
    titleEl.dataset.downloadTitle = accessibleTitle;
    titleEl.setAttribute('aria-label', accessibleTitle);

    hydrateChampionTooltips(icons, commentary.loadoutIcons);
}

async function hydrateChampionTooltips(champions, loadoutIcons) {
    const normalizedLoadout = Array.isArray(loadoutIcons)
        ? loadoutIcons.filter(Boolean).map(normalizeLoadoutIcon)
        : [];
    const version = normalizedLoadout.find(loadout => loadout.version)?.version;
    if (!version || !champions.some(champion => champion.id)) return;

    try {
        const data = await fetchDataDragon(version, 'champion.json');
        const namesById = new Map(
            Object.values(data.data || {}).map(champion => [String(champion.key), champion.name])
        );

        champions.forEach(champion => {
            const name = namesById.get(String(champion.id));
            if (!name || !champion.tooltipElement) return;
            champion.tooltipElement.dataset.tooltip = name;
            champion.tooltipElement.setAttribute('aria-label', name);
            if (champion.imageElement) champion.imageElement.alt = name;
        });
    } catch (error) {
        console.warn('SkillUncapped Assistant: Could not load champion names', error);
    }
}

function renderCommentaryLoadout(titleGroup, commentary) {
    const loadoutIcons = Array.isArray(commentary.loadoutIcons)
        ? commentary.loadoutIcons.filter(Boolean).map(normalizeLoadoutIcon)
        : [];
    if (!loadoutIcons.length) return;

    const description = document.createElement('div');
    description.className = 'skilluncapped-commentary-description';
    description.setAttribute('aria-label', 'Commentary build');

    const label = document.createElement('span');
    label.className = 'skilluncapped-commentary-description-label';
    label.textContent = 'BUILD';
    description.appendChild(label);

    loadoutIcons.forEach(loadout => {
        const isRune = loadout.kind === 'rune';
        const fallbackName = isRune
            ? humanizeRuneName(loadout.iconPath)
            : `Item ${loadout.id || ''}`.trim();

        const tooltip = document.createElement('span');
        tooltip.className = `skilluncapped-commentary-loadout-tooltip${isRune ? ' is-rune' : ''}`;
        tooltip.dataset.tooltip = fallbackName;
        tooltip.setAttribute('aria-label', fallbackName);
        tooltip.tabIndex = 0;

        const icon = document.createElement('img');
        icon.className = 'skilluncapped-commentary-loadout-icon';
        icon.src = loadout.src;
        icon.alt = fallbackName;

        const tooltipCard = document.createElement('span');
        tooltipCard.className = 'skilluncapped-commentary-tooltip-card';
        renderLoadoutTooltipCard(tooltipCard, {
            name: fallbackName,
            iconSrc: loadout.src,
            isRune
        });

        tooltip.append(icon, tooltipCard);
        description.appendChild(tooltip);

        loadout.tooltipElement = tooltip;
        loadout.tooltipCard = tooltipCard;
        loadout.imageElement = icon;
    });

    titleGroup.appendChild(description);
    hydrateLoadoutTooltips(loadoutIcons);
}

function normalizeLoadoutIcon(loadout) {
    if (typeof loadout !== 'string') return { ...loadout };

    const itemMatch = loadout.match(/\/cdn\/([^/]+)\/img\/item\/(\d+)\.png/i);
    const runeMatch = loadout.match(/\/(perk-images\/[^?]+\.png)/i);
    return {
        src: loadout,
        kind: itemMatch ? 'item' : 'rune',
        id: itemMatch?.[2] || null,
        version: itemMatch?.[1] || null,
        iconPath: runeMatch?.[1] || null
    };
}

function humanizeRuneName(iconPath) {
    const filename = iconPath?.split('/').pop()?.replace(/\.png$/i, '') || 'Primary rune';
    return filename.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2');
}

async function hydrateLoadoutTooltips(loadoutIcons) {
    const version = loadoutIcons.find(loadout => loadout.version)?.version;
    if (!version) return;

    const setTooltip = (loadout, data) => {
        if (!data?.name || !loadout.tooltipElement) return;
        loadout.tooltipElement.dataset.tooltip = data.name;
        loadout.tooltipElement.setAttribute('aria-label', data.name);
        if (loadout.imageElement) loadout.imageElement.alt = data.name;
        if (loadout.tooltipCard) renderLoadoutTooltipCard(loadout.tooltipCard, data);
    };

    const items = loadoutIcons.filter(loadout => loadout.kind === 'item' && loadout.id);
    const runes = loadoutIcons.filter(loadout => loadout.kind === 'rune' && loadout.iconPath);

    await Promise.allSettled([
        items.length && fetchDataDragon(version, 'item.json').then(data => {
            items.forEach(item => {
                const itemData = data.data?.[item.id];
                if (!itemData) return;
                setTooltip(item, {
                    name: itemData.name,
                    description: itemData.description || itemData.plaintext,
                    gold: itemData.gold,
                    iconSrc: item.src
                });
            });
        }),
        runes.length && fetchDataDragon(version, 'runesReforged.json').then(styles => {
            const runesByIcon = new Map();
            styles.forEach(style => style.slots?.forEach(slot => slot.runes?.forEach(rune => {
                runesByIcon.set(rune.icon?.toLowerCase(), rune);
            })));
            runes.forEach(loadout => {
                const rune = runesByIcon.get(loadout.iconPath.toLowerCase());
                if (!rune) return;
                setTooltip(loadout, {
                    name: rune.name,
                    description: rune.longDesc || rune.shortDesc,
                    iconSrc: loadout.src,
                    isRune: true
                });
            });
        })
    ]);
}

function renderLoadoutTooltipCard(container, data) {
    container.replaceChildren();
    container.classList.toggle('is-rune-tooltip', Boolean(data.isRune));

    const header = document.createElement('span');
    header.className = 'skilluncapped-commentary-tooltip-header';

    const name = document.createElement('strong');
    name.className = 'skilluncapped-commentary-tooltip-name';
    name.textContent = data.name;
    header.appendChild(name);

    if (data.iconSrc) {
        const icon = document.createElement('img');
        icon.className = 'skilluncapped-commentary-tooltip-feature-icon';
        icon.src = data.iconSrc;
        icon.alt = '';
        header.appendChild(icon);
    }

    container.appendChild(header);

    if (data.description) {
        const body = document.createElement('span');
        body.className = 'skilluncapped-commentary-tooltip-body';
        appendDataDragonMarkup(body, data.description);
        container.appendChild(body);
    }

    if (data.gold?.total) {
        const gold = document.createElement('span');
        gold.className = 'skilluncapped-commentary-tooltip-gold';
        gold.textContent = `Cost: ${data.gold.total} gold`;
        if (data.gold.sell) gold.textContent += ` · Sells for: ${data.gold.sell}`;
        container.appendChild(gold);
    }
}

function appendDataDragonMarkup(container, markup) {
    const parsed = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html');

    const appendNode = (source, target) => {
        source.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                target.appendChild(document.createTextNode(node.textContent));
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const tag = node.tagName.toLowerCase();
            if (tag === 'br') {
                target.appendChild(document.createElement('br'));
                return;
            }

            const element = document.createElement(['p', 'ul', 'ol', 'li'].includes(tag) ? tag : 'span');
            element.className = `skilluncapped-dd-${tag.replace(/[^a-z0-9-]/g, '')}`;
            appendNode(node, element);
            target.appendChild(element);
        });
    };

    appendNode(parsed.body, container);
}

function fetchDataDragon(version, filename) {
    window.skilluncappedDataDragonCache ||= new Map();
    const cacheKey = `${version}/${filename}`;
    if (!window.skilluncappedDataDragonCache.has(cacheKey)) {
        const url = `https://ddragon.leagueoflegends.com/cdn/${encodeURIComponent(version)}/data/en_US/${filename}`;
        const request = fetch(url).then(response => {
            if (!response.ok) throw new Error(`Data Dragon request failed: ${response.status}`);
            return response.json();
        });
        window.skilluncappedDataDragonCache.set(cacheKey, request);
    }
    return window.skilluncappedDataDragonCache.get(cacheKey);
}

function createNavButton(text, title, onClick) {
    const wrapper = document.createElement('div');
    wrapper.className = 'skilluncapped-btn-wrapper';

    const btn = document.createElement('button');
    btn.className = 'skilluncapped-nav-btn';
    btn.type = 'button';
    btn.textContent = text;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.onclick = onClick;

    wrapper.appendChild(btn);
    return wrapper;
}

function updatePage(url, playlist, index, courseName = null) {
    let newTarget = `${window.location.pathname}?url=${encodeURIComponent(url)}&playlist=${encodeURIComponent(JSON.stringify(playlist))}&index=${index}`;
    if (courseName) {
        newTarget += `&course=${encodeURIComponent(courseName)}`;
    }
    window.location.href = newTarget;
}
