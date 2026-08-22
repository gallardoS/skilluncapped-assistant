function initWatchLayout() {
    if (document.getElementById('skilluncapped-watch-layout')) return;

    const nativeControls = document.querySelector('.container');
    const video = document.getElementById('video');
    if (!nativeControls || !video) return;

    document.body.classList.add('skilluncapped-watch-page');
    nativeControls.classList.add('skilluncapped-native-controls');

    const layout = document.createElement('main');
    layout.id = 'skilluncapped-watch-layout';

    const watchMain = document.createElement('section');
    watchMain.className = 'skilluncapped-watch-main';

    const player = document.createElement('div');
    player.className = 'skilluncapped-player';
    player.appendChild(video);

    const statusEl = document.getElementById('status');
    if (statusEl) player.appendChild(statusEl);

    setupVideoGestures(video, player);

    const details = document.createElement('div');
    details.className = 'skilluncapped-video-details';

    const existingControls = document.getElementById('skilluncapped-controls');
    if (existingControls) details.appendChild(existingControls);

    watchMain.append(player, details);
    layout.appendChild(watchMain);

    const existingPlaylist = document.getElementById('skilluncapped-playlist-sidebar');
    if (existingPlaylist) layout.appendChild(existingPlaylist);

    document.body.prepend(layout);
    document.body.appendChild(nativeControls);
}

function startWatchLayoutObserver() {
    const layoutInterval = setInterval(() => {
        if (document.querySelector('.container') && document.getElementById('video')) {
            initWatchLayout();
            clearInterval(layoutInterval);
        }
    }, 100);

    setTimeout(() => clearInterval(layoutInterval), 10000);
}
