function injectPlaylistSidebar(playlist, currentIndex, courseName = null) {
    if (document.getElementById('skilluncapped-playlist-sidebar')) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'skilluncapped-playlist-sidebar';
    sidebar.className = 'skilluncapped-sidebar-right';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'skilluncapped-sidebar-toggle-right';
    toggleBtn.innerHTML = '▶';
    toggleBtn.title = 'Toggle Playlist';

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('closed');
        if (sidebar.classList.contains('closed')) {
            toggleBtn.innerHTML = '◀';
        } else {
            toggleBtn.innerHTML = '▶';
        }
    };
    sidebar.appendChild(toggleBtn);

    const header = document.createElement('div');
    header.className = 'skilluncapped-playlist-header';
    header.textContent = courseName || 'Playlist';
    sidebar.appendChild(header);

    const listContainer = document.createElement('div');
    listContainer.className = 'skilluncapped-playlist-container';

    if (!playlist || playlist.length === 0) {
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
