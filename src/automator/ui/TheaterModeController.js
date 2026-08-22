function createTheaterModeButton() {
    const button = document.createElement('button');
    button.id = 'skilluncapped-theater-button';
    button.className = 'skilluncapped-theater-button';
    button.type = 'button';
    button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h18v14H3V5Zm2 2v10h14V7H5Z"></path>
        </svg>
        <span>Theater mode</span>
    `;

    const label = button.querySelector('span');

    const setTheaterMode = enabled => {
        document.body.classList.toggle('skilluncapped-theater-mode', enabled);
        button.setAttribute('aria-pressed', String(enabled));
        button.title = enabled ? 'Exit theater mode' : 'Enter theater mode';
        button.setAttribute('aria-label', button.title);
        label.textContent = enabled ? 'Default view' : 'Theater mode';
        sessionStorage.setItem('skilluncapped-theater-mode', String(enabled));
    };

    const savedMode = sessionStorage.getItem('skilluncapped-theater-mode') === 'true';
    setTheaterMode(savedMode);

    button.onclick = () => {
        setTheaterMode(!document.body.classList.contains('skilluncapped-theater-mode'));
    };

    return button;
}
