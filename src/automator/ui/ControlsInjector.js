function injectControls(playlist, currentIndex, courseName = null) {
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
    }

    const titleEl = document.createElement('h1');
    titleEl.className = 'skilluncapped-playlist-title';
    titleEl.textContent = currentItem ? `EP ${currentItem.number}: ${currentItem.title}` : 'Video player';
    titleEl.title = currentItem?.title || '';
    titleGroup.appendChild(titleEl);
    container.appendChild(titleGroup);

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

    if (navigation.childElementCount) container.appendChild(navigation);

    const details = document.querySelector('.skilluncapped-video-details');
    (details || document.body).appendChild(container);

    injectPlaylistSidebar(playlist, currentIndex, courseName);
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
