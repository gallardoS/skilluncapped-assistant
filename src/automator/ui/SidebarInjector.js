function injectPlaylistSidebar(playlist, currentIndex, courseName = null) {
    if (document.getElementById('skilluncapped-playlist-sidebar')) return;

    const hasPlaylist = playlist && playlist.length > 0;
    const sidebar = document.createElement('aside');
    sidebar.id = 'skilluncapped-playlist-sidebar';
    sidebar.className = 'skilluncapped-sidebar-right';
    sidebar.setAttribute('aria-label', 'Course playlist');

    const header = document.createElement('div');
    header.className = 'skilluncapped-playlist-header';

    const headerTitle = document.createElement('strong');
    headerTitle.textContent = courseName || 'Playlist';
    header.appendChild(headerTitle);

    if (hasPlaylist) {
        const progress = document.createElement('span');
        progress.textContent = `${Math.max(currentIndex + 1, 1)} / ${playlist.length}`;
        header.appendChild(progress);
    }

    sidebar.appendChild(header);

    const listContainer = document.createElement('div');
    listContainer.className = 'skilluncapped-playlist-container';

    if (!hasPlaylist) {
        const msg = document.createElement('div');
        msg.className = 'skilluncapped-playlist-empty';
        msg.innerHTML = 'Playlist not found.<br><br>Open the video from the main <b>Browse Courses</b> page.';
        listContainer.appendChild(msg);
    } else {
        playlist.forEach((item, index) => {
            const itemEl = document.createElement('button');
            itemEl.type = 'button';
            itemEl.className = 'skilluncapped-playlist-item';

            const numberEl = document.createElement('span');
            numberEl.className = 'skilluncapped-playlist-number';
            numberEl.textContent = String(item.number ?? index + 1).padStart(2, '0');

            const itemTitle = document.createElement('span');
            itemTitle.className = 'skilluncapped-playlist-item-title';
            itemTitle.textContent = item.title;

            itemEl.append(numberEl, itemTitle);

            if (index === currentIndex) {
                itemEl.classList.add('active');
                itemEl.setAttribute('aria-current', 'true');
            } else {
                itemEl.onclick = () => updatePage(item.url, playlist, index, courseName);
            }

            listContainer.appendChild(itemEl);
        });
    }

    sidebar.appendChild(listContainer);

    const layout = document.getElementById('skilluncapped-watch-layout');
    (layout || document.body).appendChild(sidebar);

    requestAnimationFrame(() => {
        const activeItem = listContainer.querySelector('.active');
        if (!activeItem) return;

        listContainer.scrollTop = activeItem.offsetTop
            - (listContainer.clientHeight / 2)
            + (activeItem.offsetHeight / 2);
    });
}
