function initSidebarTransformation() {
    if (document.getElementById('skilluncapped-watch-layout')) return;

    const originalContainer = document.querySelector('.container');
    const video = document.getElementById('video');
    if (!originalContainer || !video) return;

    document.body.classList.add('skilluncapped-watch-page');

    const layout = document.createElement('main');
    layout.id = 'skilluncapped-watch-layout';

    const watchMain = document.createElement('section');
    watchMain.className = 'skilluncapped-watch-main';

    const player = document.createElement('div');
    player.className = 'skilluncapped-player';
    player.appendChild(video);

    const statusEl = document.getElementById('status');
    if (statusEl) player.appendChild(statusEl);

    const details = document.createElement('div');
    details.className = 'skilluncapped-video-details';

    const existingControls = document.getElementById('skilluncapped-controls');
    if (existingControls) details.appendChild(existingControls);

    watchMain.append(player, details);
    layout.appendChild(watchMain);

    const existingPlaylist = document.getElementById('skilluncapped-playlist-sidebar');
    if (existingPlaylist) layout.appendChild(existingPlaylist);

    document.body.prepend(layout);

    const sidebar = document.createElement('aside');
    sidebar.className = 'skilluncapped-sidebar closed';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'skilluncapped-sidebar-toggle';
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = '⚙';
    toggleBtn.title = 'Open player settings';
    toggleBtn.setAttribute('aria-label', 'Open player settings');
    toggleBtn.setAttribute('aria-expanded', 'false');

    toggleBtn.onclick = () => {
        const isClosed = sidebar.classList.toggle('closed');
        toggleBtn.innerHTML = isClosed ? '⚙' : '←';
        toggleBtn.title = isClosed ? 'Open player settings' : 'Close player settings';
        toggleBtn.setAttribute('aria-expanded', String(!isClosed));
    };

    sidebar.append(toggleBtn, originalContainer);
    document.body.appendChild(sidebar);
}

function startSidebarObserver() {
    const sidebarInterval = setInterval(() => {
        if (document.querySelector('.container') && document.getElementById('video')) {
            initSidebarTransformation();
            clearInterval(sidebarInterval);
        }
    }, 100);
    setTimeout(() => clearInterval(sidebarInterval), 10000);
}
