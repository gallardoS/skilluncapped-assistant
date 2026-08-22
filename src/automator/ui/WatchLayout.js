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

    const floatingBrand = document.createElement('div');
    floatingBrand.className = 'skilluncapped-floating-brand';

    const brand = document.createElement('div');
    brand.className = 'skilluncapped-floating-brand-text';

    const brandName = document.createElement('strong');
    brandName.textContent = 'SkillUncapped';

    const brandSuffix = document.createElement('span');
    brandSuffix.textContent = ' assistant';

    brand.append(brandName, brandSuffix);

    const versionLink = document.createElement('a');
    versionLink.className = 'skilluncapped-version-link';
    versionLink.href = 'https://github.com/gallardoS/skilluncapped-assistant/releases';
    versionLink.target = '_blank';
    versionLink.rel = 'noopener noreferrer';
    versionLink.textContent = 'v1.4';

    const versionSeparator = document.createElement('span');
    versionSeparator.className = 'skilluncapped-version-separator';
    versionSeparator.textContent = '·';

    const updateAlert = document.createElement('a');
    updateAlert.className = 'skilluncapped-update-alert';
    updateAlert.href = 'https://github.com/gallardoS/skilluncapped-assistant/releases';
    updateAlert.target = '_blank';
    updateAlert.rel = 'noopener noreferrer';
    updateAlert.dataset.tooltip = 'A new version is available';
    updateAlert.setAttribute('aria-label', 'A new version is available');
    updateAlert.hidden = true;

    const updateAlertIcon = document.createElement('span');
    updateAlertIcon.className = 'skilluncapped-update-alert-icon';
    updateAlertIcon.textContent = '!';
    updateAlert.appendChild(updateAlertIcon);

    floatingBrand.append(brand, versionSeparator, versionLink, updateAlert);

    document.body.prepend(layout);
    document.body.appendChild(floatingBrand);
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
