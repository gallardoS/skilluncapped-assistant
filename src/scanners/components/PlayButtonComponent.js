class PlayButtonComponent {
    constructor(onClick) {
        this.onClick = onClick;
    }

    create() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("skilluncapped-btn-wrapper");

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 42 42");
        svg.classList.add("skilluncapped-play-btn");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M20.91,0A20.92,20.92,0,1,0,41.83,20.91,20.91,20.91,0,0,0,20.91,0ZM16,29.29V12.53l14.71,8.38Z");
        svg.appendChild(path);

        svg.addEventListener('click', (e) => this.onClick(e));

        const baseDelays = [0, 0.7, 1.2];
        const randomOffset = Math.random() * 2;

        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement("span");
            sparkle.classList.add("skilluncapped-sparkle");
            sparkle.style.animationDelay = `${baseDelays[i] + randomOffset}s`;
            wrapper.appendChild(sparkle);
        }

        wrapper.appendChild(svg);
        return wrapper;
    }
}
