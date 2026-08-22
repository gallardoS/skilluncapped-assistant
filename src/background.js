importScripts('ReleaseUpdateChecker.js');

const releaseUpdateChecker = new ReleaseUpdateChecker({
    apiUrl: 'https://api.github.com/repos/gallardoS/skilluncapped-assistant/releases/latest',
    releasesUrl: 'https://github.com/gallardoS/skilluncapped-assistant/releases',
    cacheKey: 'skilluncapped-release-check-v1',
    cacheTtl: 12 * 60 * 60 * 1000
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== 'SKILLUNCAPPED_CHECK_FOR_UPDATE') return false;

    releaseUpdateChecker.check()
        .then(result => sendResponse({ ok: true, ...result }))
        .catch(error => sendResponse({ ok: false, error: error.message }));

    return true;
});
