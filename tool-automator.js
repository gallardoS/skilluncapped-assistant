const params = new URLSearchParams(window.location.search);
const targetUrl = params.get('url');

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
        }
    }, 500);

    setTimeout(() => clearInterval(interval), 10000);
}
