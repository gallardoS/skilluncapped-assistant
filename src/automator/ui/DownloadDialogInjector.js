function injectDownloadDialog(videoTitle) {
    const existingButton = document.getElementById('skilluncapped-download-button');
    if (existingButton) return existingButton;

    const nativeResolution = document.getElementById('resolution');
    const nativeVideoName = document.getElementById('videoName');
    const nativeDownloadButton = Array.from(document.querySelectorAll('button'))
        .find(button => button.getAttribute('onclick')?.includes('downloadAndMergeVideo'));

    const trigger = document.createElement('button');
    trigger.id = 'skilluncapped-download-button';
    trigger.className = 'skilluncapped-download-button';
    trigger.type = 'button';
    trigger.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11 3h2v10.17l3.59-3.58L18 11l-6 6-6-6 1.41-1.41L11 13.17V3ZM5 19h14v2H5v-2Z"></path>
        </svg>
        <span>Download</span>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'skilluncapped-download-overlay';
    overlay.className = 'skilluncapped-download-overlay';
    overlay.hidden = true;

    const dialog = document.createElement('div');
    dialog.className = 'skilluncapped-download-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'skilluncapped-download-dialog-title');

    const header = document.createElement('div');
    header.className = 'skilluncapped-download-dialog-header';

    const heading = document.createElement('h2');
    heading.id = 'skilluncapped-download-dialog-title';
    heading.textContent = 'Download video';

    const closeButton = document.createElement('button');
    closeButton.className = 'skilluncapped-download-close';
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close download dialog');

    header.append(heading, closeButton);

    const nameLabel = document.createElement('span');
    nameLabel.className = 'skilluncapped-download-label';
    nameLabel.textContent = 'File name';

    const nameValue = document.createElement('div');
    nameValue.className = 'skilluncapped-download-name';
    nameValue.textContent = videoTitle;

    const qualityLabel = document.createElement('label');
    qualityLabel.className = 'skilluncapped-download-label';
    qualityLabel.htmlFor = 'skilluncapped-download-quality';
    qualityLabel.textContent = 'Quality';

    const qualitySelect = document.createElement('select');
    qualitySelect.id = 'skilluncapped-download-quality';
    qualitySelect.className = 'skilluncapped-download-quality';

    if (nativeResolution) {
        Array.from(nativeResolution.options).forEach(option => {
            qualitySelect.add(new Option(option.text, option.value, option.defaultSelected, option.selected));
        });
    }

    const actions = document.createElement('div');
    actions.className = 'skilluncapped-download-dialog-actions';

    const cancelButton = document.createElement('button');
    cancelButton.className = 'skilluncapped-download-cancel';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';

    const confirmButton = document.createElement('button');
    confirmButton.className = 'skilluncapped-download-confirm';
    confirmButton.type = 'button';
    confirmButton.textContent = 'Download';

    const canDownload = nativeResolution && nativeVideoName && nativeDownloadButton;
    trigger.disabled = !canDownload;
    confirmButton.disabled = !canDownload;

    actions.append(cancelButton, confirmButton);
    dialog.append(header, nameLabel, nameValue, qualityLabel, qualitySelect, actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const closeDialog = () => {
        overlay.hidden = true;
        trigger.focus();
    };

    const openDialog = () => {
        if (nativeResolution) qualitySelect.value = nativeResolution.value;
        overlay.hidden = false;
        qualitySelect.focus();
    };

    trigger.onclick = openDialog;
    closeButton.onclick = closeDialog;
    cancelButton.onclick = closeDialog;
    overlay.onclick = event => {
        if (event.target === overlay) closeDialog();
    };

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !overlay.hidden) closeDialog();
    });

    confirmButton.onclick = () => {
        const safeTitle = videoTitle.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').trim() || 'Video';
        nativeResolution.value = qualitySelect.value;
        nativeResolution.dispatchEvent(new Event('change', { bubbles: true }));
        nativeVideoName.value = safeTitle;
        nativeVideoName.dispatchEvent(new Event('input', { bubbles: true }));
        nativeVideoName.dispatchEvent(new Event('change', { bubbles: true }));
        closeDialog();
        nativeDownloadButton.click();
    };

    return trigger;
}
