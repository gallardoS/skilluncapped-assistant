function injectControls(playlist, currentIndex, courseName = null) {
    if (document.getElementById('skilluncapped-controls')) return;

    const container = document.createElement('div');
    container.id = 'skilluncapped-controls';

    if (currentIndex > 0) {
        const prevItem = playlist[currentIndex - 1];
        const prevBtn = createNavButton('◀️', prevItem.title, () => {
            const newIndex = currentIndex - 1;
            updatePage(prevItem.url, playlist, newIndex, courseName);
        });
        container.appendChild(prevBtn);
    }

    const currentItem = playlist[currentIndex];
    const titleEl = document.createElement('div');
    titleEl.className = 'skilluncapped-playlist-title';
    titleEl.textContent = currentItem ? `EP ${currentItem.number}: ${currentItem.title}` : '';
    titleEl.title = currentItem ? currentItem.title : '';
    container.appendChild(titleEl);

    if (currentIndex < playlist.length - 1) {
        const nextItem = playlist[currentIndex + 1];
        const nextBtn = createNavButton('▶️', nextItem.title, () => {
            const newIndex = currentIndex + 1;
            updatePage(nextItem.url, playlist, newIndex, courseName);
        });
        container.appendChild(nextBtn);
    }

    document.body.appendChild(container);

    injectPlaylistSidebar(playlist, currentIndex, courseName);
}

function createNavButton(text, title, onClick) {
    const wrapper = document.createElement('div');
    wrapper.className = 'skilluncapped-btn-wrapper';
    wrapper.title = title;

    const baseDelays = [0, 0.7, 1.2];
    const randomOffset = Math.random() * 2;

    for (let i = 0; i < 3; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'skilluncapped-sparkle';
        sparkle.style.animationDelay = `${baseDelays[i] + randomOffset}s`;
        wrapper.appendChild(sparkle);
    }

    const btn = document.createElement('div');
    btn.className = 'skilluncapped-nav-btn';
    btn.textContent = text;
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
