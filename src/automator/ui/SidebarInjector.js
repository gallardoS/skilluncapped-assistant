function injectPlaylistSidebar(playlist, currentIndex, courseName = null) {
    if (document.getElementById('skilluncapped-playlist-sidebar')) return;

    const hasPlaylist = playlist && playlist.length > 0;
    const sidebar = document.createElement('div');
    sidebar.id = 'skilluncapped-playlist-sidebar';
    sidebar.className = hasPlaylist ? 'skilluncapped-sidebar-right' : 'skilluncapped-sidebar-right closed';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'skilluncapped-sidebar-toggle-right';
    toggleBtn.innerHTML = hasPlaylist ? '\u25b6' : '\u25c0';
    toggleBtn.title = 'Toggle Playlist';

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('closed');
        toggleBtn.innerHTML = sidebar.classList.contains('closed') ? '\u25c0' : '\u25b6';
    };
    sidebar.appendChild(toggleBtn);

    const header = document.createElement('div');
    header.className = 'skilluncapped-playlist-header';
    header.textContent = courseName || 'Playlist';
    sidebar.appendChild(header);

    const listContainer = document.createElement('div');
    listContainer.className = 'skilluncapped-playlist-container';

    if (!hasPlaylist) {
        const msg = document.createElement('div');
        msg.style.padding = '15px';
        msg.style.color = '#ff6b6b';
        msg.style.textAlign = 'center';
        msg.style.fontSize = '14px';
        msg.innerHTML = 'Playlist not found.<br><br>Please access this video from the main <b>Browse Courses</b> page, not from the specific Course Overview page.';
        listContainer.appendChild(msg);
    } else {
        playlist.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'skilluncapped-playlist-item';
            if (index === currentIndex) {
                itemEl.classList.add('active');
            }
            itemEl.textContent = `EP ${item.number}: ${item.title}`;
            itemEl.onclick = () => {
                if (index !== currentIndex) {
                    updatePage(item.url, playlist, index, courseName);
                }
            };
            listContainer.appendChild(itemEl);
        });
    }

    sidebar.appendChild(listContainer);
    document.body.appendChild(sidebar);
}
