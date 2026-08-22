function waitForUpdateInterface() {
    return new Promise(resolve => {
        const existingAlert = document.querySelector('.skilluncapped-update-alert');
        if (existingAlert) {
            resolve(existingAlert);
            return;
        }

        const observer = new MutationObserver(() => {
            const alert = document.querySelector('.skilluncapped-update-alert');
            if (!alert) return;
            observer.disconnect();
            resolve(alert);
        });

        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
}

async function initializeUpdateChecker() {
    const updateAlert = await waitForUpdateInterface();
    const currentVersion = chrome.runtime.getManifest().version;
    const versionLink = document.querySelector('.skilluncapped-version-link');

    if (versionLink) versionLink.textContent = `v${currentVersion}`;

    chrome.runtime.sendMessage(
        { type: 'SKILLUNCAPPED_CHECK_FOR_UPDATE' },
        response => {
            if (chrome.runtime.lastError || !response?.ok || !response.updateAvailable) {
                updateAlert.hidden = true;
                return;
            }

            const latestVersion = String(response.latestVersion).replace(/^v/i, '');
            const message = `A new version is available: v${latestVersion}`;
            updateAlert.href = response.releaseUrl;
            updateAlert.dataset.tooltip = message;
            updateAlert.setAttribute('aria-label', message);
            updateAlert.hidden = false;
        }
    );
}

initializeUpdateChecker();
