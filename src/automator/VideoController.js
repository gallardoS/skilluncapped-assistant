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
            setupNextVideoCountdown(parsedPlaylist, parsedIndex, courseName);
            window.skillUncappedAdjacentVideoPreloader?.preloadAdjacent(
                parsedPlaylist,
                parsedIndex,
                document.getElementById('video')
            );
        }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
}

function setupNextVideoCountdown(playlist, currentIndex, courseName = null) {
    if (!Array.isArray(playlist) || !Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= playlist.length - 1) return;

    const nextItem = playlist[currentIndex + 1];
    if (!nextItem?.url) return;

    let countdownTimer = null;
    let terminalStallTimer = null;
    let previousStatusText = null;

    const clearTerminalStallTimer = () => {
        if (terminalStallTimer !== null) {
            clearTimeout(terminalStallTimer);
            terminalStallTimer = null;
        }
    };

    const removeCountdown = () => {
        clearTerminalStallTimer();
        if (countdownTimer !== null) {
            clearInterval(countdownTimer);
            countdownTimer = null;
        }

        const status = document.getElementById('status');
        if (status?.classList.contains('skilluncapped-next-video-countdown')) {
            status.textContent = previousStatusText ?? '';
            status.classList.remove('skilluncapped-next-video-countdown');
        }
        previousStatusText = null;
    };

    const startCountdown = () => {
        if (countdownTimer !== null) return;

        const status = document.getElementById('status');
        if (!status) return;

        removeCountdown();

        let secondsLeft = 3;
        previousStatusText = status.textContent;
        status.classList.add('skilluncapped-next-video-countdown');
        status.textContent = `Loading next video in... ${secondsLeft}`;

        countdownTimer = setInterval(() => {
            secondsLeft -= 1;

            if (secondsLeft === 0) {
                removeCountdown();
                updatePage(nextItem.url, playlist, currentIndex + 1, courseName);
                return;
            }

            status.textContent = `Loading next video in... ${secondsLeft}`;
        }, 750);
    };

    const isAtRealPlaybackEnd = (video) => {
        if (!Number.isFinite(video.duration) || !Number.isFinite(video.currentTime)) return false;

        const reportedSecondsLeft = video.duration - video.currentTime;
        if (reportedSecondsLeft < 0 || reportedSecondsLeft > 15 || video.buffered.length === 0) return false;

        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        return bufferedEnd - video.currentTime <= 0.75;
    };

    const checkForTerminalStall = (video) => {
        clearTerminalStallTimer();
        if (!isAtRealPlaybackEnd(video)) return;

        const timeWhenCheckStarted = video.currentTime;
        terminalStallTimer = setTimeout(() => {
            terminalStallTimer = null;

            const playbackDidNotAdvance = Math.abs(video.currentTime - timeWhenCheckStarted) < 0.25;

            if (playbackDidNotAdvance && isAtRealPlaybackEnd(video)) {
                startCountdown();
            }
        }, 1000);
    };

    const attachToVideo = (video) => {
        if (!(video instanceof HTMLVideoElement)) return false;
        if (video.dataset.skilluncappedNextVideo === 'true') return true;

        video.dataset.skilluncappedNextVideo = 'true';
        video.addEventListener('ended', startCountdown);
        video.addEventListener('play', removeCountdown);
        video.addEventListener('playing', removeCountdown);
        video.addEventListener('timeupdate', () => checkForTerminalStall(video));
        video.addEventListener('pause', () => checkForTerminalStall(video));
        video.addEventListener('waiting', () => checkForTerminalStall(video));
        video.addEventListener('stalled', () => checkForTerminalStall(video));
        return true;
    };

    if (attachToVideo(document.getElementById('video'))) return;

    const observer = new MutationObserver(() => {
        if (attachToVideo(document.getElementById('video'))) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
}
