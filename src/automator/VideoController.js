function attemptAutoplay(targetUrl, playlist, currentIndexStr, courseName) {
    if (!targetUrl) return;

    const interval = setInterval(() => {
        const input = document.getElementById('url');
        const btn = document.querySelector('button.btn') || document.querySelector('button[onclick="stream()"]');

        if (input && btn) {
            clearInterval(interval);
            input.value = targetUrl;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            btn.click();

            let parsedPlaylist = [];
            let parsedIndex = -1;

            if (playlist && currentIndexStr !== null) {
                try {
                    parsedPlaylist = JSON.parse(playlist);
                    parsedIndex = parseInt(currentIndexStr);
                    console.log("Playlist received:", parsedPlaylist);
                } catch (e) {
                    console.error("Failed to parse playlist", e);
                }
            }

            injectControls(parsedPlaylist, parsedIndex, courseName);
        }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
}
