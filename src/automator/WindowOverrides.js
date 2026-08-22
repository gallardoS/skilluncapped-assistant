window.alert = function () { console.log("SkillUncapped Assistant: Alert suppressed"); return true; };
window.confirm = function () { console.log("SkillUncapped Assistant: Confirm suppressed"); return true; };
window.prompt = function () { console.log("SkillUncapped Assistant: Prompt suppressed"); return null; };


document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const status = document.getElementById('status');
    const statusBubble = status;

    if (video && status) {

        const checkStatus = () => {
            if (!status.innerText || status.innerText.trim() === '') {
                video.style.display = 'block';
            } else {
                video.style.display = 'none';
            }
        };

        const observer = new MutationObserver((mutations) => {
            checkStatus();
        });

        observer.observe(status, { childList: true, subtree: true, characterData: true });
    }
});
