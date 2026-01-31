window.alert = function () { console.log("SkillUncapped Assistant: Alert suppressed"); return true; };
window.confirm = function () { console.log("SkillUncapped Assistant: Confirm suppressed"); return true; };
window.prompt = function () { console.log("SkillUncapped Assistant: Prompt suppressed"); return null; };

const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');
const playlistJson = params.get('playlist');
const currentIndexStr = params.get('index');
const courseName = params.get('course');

if (targetUrl) {
    const interval = setInterval(() => {
        const input = document.getElementById('url');
        const btn = document.querySelector('button.btn') || document.querySelector('button[onclick="stream()"]');

        if (input && btn) {
            clearInterval(interval);
            input.value = targetUrl;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            btn.click();

            let playlist = [];
            let currentIndex = -1;

            if (playlistJson && currentIndexStr !== null) {
                try {
                    playlist = JSON.parse(playlistJson);
                    currentIndex = parseInt(currentIndexStr);
                    console.log("Playlist received:", playlist);
                } catch (e) {
                    console.error("Failed to parse playlist", e);
                }
            }

            injectControls(playlist, currentIndex, courseName);
        }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
}

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

function initSidebarTransformation() {
    if (document.querySelector('.skilluncapped-sidebar')) return;

    const originalContainer = document.querySelector('.container');
    if (!originalContainer) return;

    const sidebar = document.createElement('div');
    sidebar.className = 'skilluncapped-sidebar';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'skilluncapped-sidebar-toggle';
    toggleBtn.innerHTML = '◀';
    toggleBtn.title = 'Toggle Sidebar';

    toggleBtn.onclick = () => {
        sidebar.classList.toggle('closed');
        if (sidebar.classList.contains('closed')) {
            toggleBtn.innerHTML = '▶';
        } else {
            toggleBtn.innerHTML = '◀';
        }
    };

    sidebar.appendChild(toggleBtn);

    document.body.appendChild(sidebar);

    sidebar.appendChild(originalContainer);

    originalContainer.style.maxWidth = '100%';
    originalContainer.style.margin = '0';
    originalContainer.style.padding = '0';
    originalContainer.style.background = 'transparent';
    originalContainer.style.boxShadow = 'none';
}

const sidebarInterval = setInterval(() => {
    if (document.querySelector('.container')) {
        initSidebarTransformation();
        clearInterval(sidebarInterval);
    }
}, 500);
setTimeout(() => clearInterval(sidebarInterval), 10000);
