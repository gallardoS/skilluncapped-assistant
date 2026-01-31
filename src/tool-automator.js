window.alert = function () { console.log("SkillUncapped Assistant: Alert suppressed"); return true; };
window.confirm = function () { console.log("SkillUncapped Assistant: Confirm suppressed"); return true; };
window.prompt = function () { console.log("SkillUncapped Assistant: Prompt suppressed"); return null; };

const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');
const playlistJson = params.get('playlist');
const currentIndexStr = params.get('index');

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

            if (playlistJson && currentIndexStr !== null) {
                try {
                    const playlist = JSON.parse(playlistJson);
                    const currentIndex = parseInt(currentIndexStr);
                    console.log("Playlist received:", playlist);
                    injectControls(playlist, currentIndex);
                } catch (e) {
                    console.error("Failed to parse playlist", e);
                }
            }
        }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
}

function injectControls(playlist, currentIndex) {
    if (document.getElementById('skilluncapped-controls')) return;

    const container = document.createElement('div');
    container.id = 'skilluncapped-controls';

    if (currentIndex > 0) {
        const prevItem = playlist[currentIndex - 1];
        const prevBtn = createNavButton('◀️', prevItem.title, () => {
            const newIndex = currentIndex - 1;
            updatePage(prevItem.url, playlist, newIndex);
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
            updatePage(nextItem.url, playlist, newIndex);
        });
        container.appendChild(nextBtn);
    }

    document.body.appendChild(container);
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

function updatePage(url, playlist, index) {
    const newTarget = `${window.location.pathname}?url=${encodeURIComponent(url)}&playlist=${encodeURIComponent(JSON.stringify(playlist))}&index=${index}`;
    window.location.href = newTarget;
}
