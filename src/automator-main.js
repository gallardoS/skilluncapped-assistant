const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');
const playlistJson = params.get('playlist');
const currentIndexStr = params.get('index');
const courseName = params.get('course');
const commentaryJson = params.get('commentary');

if (targetUrl) {
    attemptAutoplay(targetUrl, playlistJson, currentIndexStr, courseName, commentaryJson);
}

startWatchLayoutObserver();
