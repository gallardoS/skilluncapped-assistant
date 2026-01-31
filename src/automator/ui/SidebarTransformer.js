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

function startSidebarObserver() {
    const sidebarInterval = setInterval(() => {
        if (document.querySelector('.container')) {
            initSidebarTransformation();
            clearInterval(sidebarInterval);
        }
    }, 500);
    setTimeout(() => clearInterval(sidebarInterval), 10000);
}
