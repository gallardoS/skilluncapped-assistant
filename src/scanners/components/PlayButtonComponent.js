class PlayButtonComponent {
    constructor(onClick) {
        this.onClick = onClick;
    }

    create() {
        const wrapper = document.createElement("span");
        wrapper.classList.add("skilluncapped-btn-wrapper");
        wrapper.classList.add("skilluncapped-magic-play-btn");

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 42 42");
        svg.classList.add("skilluncapped-play-btn");

        const disc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        disc.setAttribute("cx", "21");
        disc.setAttribute("cy", "21");
        disc.setAttribute("r", "18");
        disc.classList.add("skilluncapped-play-disc");
        svg.appendChild(disc);

        const glyph = document.createElementNS("http://www.w3.org/2000/svg", "path");
        glyph.setAttribute("d", "M17 12.6L30.8 21L17 29.4Z");
        glyph.classList.add("skilluncapped-play-glyph");
        svg.appendChild(glyph);

        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-label', 'Open in SkillUncapped');
        wrapper.setAttribute('title', 'Open in SkillUncapped');
        wrapper.addEventListener('click', (e) => this.onClick(e));
        wrapper.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                wrapper.click();
            }
        });

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
