class VideoGesturesController {
    constructor(video, player) {
        this.video = video;
        this.player = player;
        this.holdTimer = null;
        this.holdActive = false;
        this.previousPlaybackRate = 1;
        this.pointerStart = null;
        this.suppressNextClick = false;
        this.clickTimer = null;
        this.playbackFeedbackTimer = null;
        this.feedbackTimer = null;
        this.fullscreenGuardUntil = 0;
        this.fullscreenGuardTimer = null;
        this.fullscreenExitPending = false;
        this.lastPointerDownAt = 0;
        this.nativeControlsRestoreTimer = null;
        this.lastClickAt = 0;
        this.lastClickSide = null;
        this.playbackStateBeforeClick = null;

        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handlePointerDown = this.handlePointerDown.bind(this);
        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.stopFastPlayback = this.stopFastPlayback.bind(this);
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);

        this.createGestureSurface();
        this.createFeedback();
        this.attach();
    }

    attach() {
        this.attachGestureSurfaceEvents();
        this.video.addEventListener('pointerdown', this.handlePointerDown);
        this.video.addEventListener('click', this.handleClick);
        this.video.addEventListener('keydown', this.handleKeyDown);
        this.player.addEventListener('dblclick', this.handleDoubleClick, true);
        window.addEventListener('pointermove', this.handlePointerMove, true);
        window.addEventListener('pointerup', this.handlePointerUp, true);
        window.addEventListener('pointercancel', this.handlePointerUp, true);
        window.addEventListener('blur', this.stopFastPlayback);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.stopFastPlayback();
        });
    }

    attachGestureSurfaceEvents() {
        this.gestureSurface.addEventListener('pointerdown', this.handlePointerDown);
        this.gestureSurface.addEventListener('click', this.handleClick);
    }

    createGestureSurface() {
        this.gestureSurface = document.createElement('div');
        this.gestureSurface.className = 'skilluncapped-gesture-surface';
        this.gestureSurface.setAttribute('aria-hidden', 'true');
        this.player.appendChild(this.gestureSurface);
    }

    createFeedback() {
        this.feedback = document.createElement('div');
        this.feedback.className = 'skilluncapped-gesture-feedback';
        this.feedback.setAttribute('aria-live', 'polite');
        this.player.appendChild(this.feedback);
    }

    isInsideVideoSurface(event) {
        if (event.target === this.gestureSurface) return true;
        if (event.target !== this.video) return false;

        const rect = this.player.getBoundingClientRect();
        return event.clientY < rect.bottom - 56;
    }

    handleDoubleClick(event) {
        if (event.target !== this.gestureSurface && event.target !== this.player) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        this.cancelHold();
        this.cancelSingleClick();
        this.startFullscreenGuard();
    }

    seekFromPoint(clientX) {
        const rect = this.player.getBoundingClientRect();
        const direction = clientX < rect.left + rect.width / 3 ? -1 : 1;
        this.seekBy(direction * 10);
    }

    seekBy(seconds) {
        const nextTime = Math.max(0, this.video.currentTime + seconds);
        const boundedTime = Number.isFinite(this.video.duration)
            ? Math.min(nextTime, this.video.duration)
            : nextTime;

        this.video.currentTime = boundedTime;
        this.showFeedback(seconds < 0 ? '−10 seconds' : '+10 seconds', seconds < 0 ? 'left' : 'right');
    }

    handleKeyDown(event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        event.preventDefault();
        event.stopPropagation();
        this.seekBy(event.key === 'ArrowLeft' ? -10 : 10);
    }

    handleFullscreenChange() {
        this.exitAccidentalFullscreen();
    }

    startFullscreenGuard() {
        this.fullscreenGuardUntil = performance.now() + 2000;
        if (this.fullscreenGuardTimer !== null) clearInterval(this.fullscreenGuardTimer);

        this.fullscreenGuardTimer = setInterval(() => {
            if (performance.now() > this.fullscreenGuardUntil) {
                clearInterval(this.fullscreenGuardTimer);
                this.fullscreenGuardTimer = null;
                return;
            }
            this.exitAccidentalFullscreen();
        }, 50);
    }

    exitAccidentalFullscreen() {
        if (
            performance.now() > this.fullscreenGuardUntil
            || !document.fullscreenElement
            || this.fullscreenExitPending
        ) return;

        this.fullscreenExitPending = true;
        document.exitFullscreen()
            .catch(() => { })
            .finally(() => {
                this.fullscreenExitPending = false;
            });
    }

    handlePointerDown(event) {
        if (event.button !== 0 || !this.isInsideVideoSurface(event)) return;

        event.preventDefault();
        this.video.focus({ preventScroll: true });

        const pointerDownAt = performance.now();
        if (pointerDownAt - this.lastPointerDownAt < 350) this.suspendNativeControls();
        this.lastPointerDownAt = pointerDownAt;

        this.cancelHold();
        this.pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
        this.holdTimer = setTimeout(() => {
            this.holdTimer = null;
            if (this.video.paused || this.video.ended) return;

            this.previousPlaybackRate = this.video.playbackRate;
            this.video.playbackRate = 2;
            this.holdActive = true;
            this.suppressNextClick = true;
            this.player.classList.add('skilluncapped-fast-playing');
        }, 450);
    }

    handlePointerMove(event) {
        if (!this.pointerStart || event.pointerId !== this.pointerStart.id || this.holdActive) return;

        const distance = Math.hypot(
            event.clientX - this.pointerStart.x,
            event.clientY - this.pointerStart.y
        );

        if (distance > 12) this.cancelHold();
    }

    handlePointerUp(event) {
        if (this.pointerStart && event.pointerId !== this.pointerStart.id) return;
        this.cancelHold();
        this.stopFastPlayback();
    }

    handleClick(event) {
        if (!this.isInsideVideoSurface(event)) return;

        event.preventDefault();
        event.stopPropagation();

        if (this.suppressNextClick) {
            this.suppressNextClick = false;
            this.replaceGestureSurface();
            this.gestureSurface.classList.remove('capture-next-click');
            return;
        }

        const rect = this.player.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width;
        const clickSide = relativeX < 1 / 3 ? 'left' : relativeX > 2 / 3 ? 'right' : 'center';
        const clickedAt = performance.now();
        const isRapidSecondClick = clickedAt - this.lastClickAt < 350;
        const isSeekGesture = isRapidSecondClick
            && clickSide !== 'center'
            && clickSide === this.lastClickSide;

        if (isRapidSecondClick) {
            this.cancelSingleClick();
            this.restorePlaybackState();
            this.hideFeedback();
            this.lastClickAt = 0;
            this.lastClickSide = null;
            if (isSeekGesture) {
                this.startFullscreenGuard();
                this.seekFromPoint(event.clientX);
            }
            this.replaceGestureSurface();
            this.gestureSurface.classList.remove('capture-next-click');
            return;
        }

        this.lastClickAt = clickedAt;
        this.lastClickSide = clickSide;
        this.playbackStateBeforeClick = this.video.paused;
        const feedbackKind = this.video.paused ? 'play' : 'pause';

        if (this.video.paused) {
            this.video.play().catch(() => { });
        } else {
            this.video.pause();
        }

        if (clickSide === 'center') {
            this.showFeedback('', 'center', false, feedbackKind);
        } else {
            this.playbackFeedbackTimer = setTimeout(() => {
                this.playbackFeedbackTimer = null;
                this.showFeedback('', 'center', false, feedbackKind);
            }, 140);
        }

        this.clickTimer = setTimeout(() => {
            this.clickTimer = null;
            this.lastClickAt = 0;
            this.lastClickSide = null;
            this.playbackStateBeforeClick = null;
            this.gestureSurface.classList.remove('capture-next-click');
        }, 350);

        this.replaceGestureSurface();
        this.gestureSurface.classList.add('capture-next-click');
    }

    cancelSingleClick() {
        if (this.clickTimer !== null) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }
        if (this.playbackFeedbackTimer !== null) {
            clearTimeout(this.playbackFeedbackTimer);
            this.playbackFeedbackTimer = null;
        }
        this.gestureSurface.classList.remove('capture-next-click');
    }

    restorePlaybackState() {
        if (this.playbackStateBeforeClick === null) return;

        if (this.playbackStateBeforeClick) {
            this.video.pause();
        } else {
            this.video.play().catch(() => { });
        }
        this.playbackStateBeforeClick = null;
    }

    suspendNativeControls() {
        if (!this.video.controls) return;

        this.video.controls = false;
        if (this.nativeControlsRestoreTimer !== null) clearTimeout(this.nativeControlsRestoreTimer);
        this.nativeControlsRestoreTimer = setTimeout(() => {
            this.video.controls = true;
            this.nativeControlsRestoreTimer = null;
        }, 700);
    }

    replaceGestureSurface() {
        const replacement = this.gestureSurface.cloneNode(false);
        this.gestureSurface.replaceWith(replacement);
        this.gestureSurface = replacement;
        this.attachGestureSurfaceEvents();
    }

    cancelHold() {
        if (this.holdTimer !== null) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
        this.pointerStart = null;
    }

    stopFastPlayback() {
        this.cancelHold();
        if (!this.holdActive) return;

        this.video.playbackRate = this.previousPlaybackRate;
        this.holdActive = false;
        this.player.classList.remove('skilluncapped-fast-playing');
        this.hideFeedback();
    }

    showFeedback(text, position, persistent = false, kind = 'seek') {
        if (this.feedbackTimer !== null) clearTimeout(this.feedbackTimer);

        this.feedback.textContent = text;
        this.feedback.dataset.position = position;
        this.feedback.dataset.kind = kind;
        this.feedback.classList.add('visible');

        if (!persistent) {
            this.feedbackTimer = setTimeout(() => this.hideFeedback(), 650);
        }
    }

    hideFeedback() {
        if (this.feedbackTimer !== null) {
            clearTimeout(this.feedbackTimer);
            this.feedbackTimer = null;
        }
        this.feedback.classList.remove('visible');
    }
}

function setupVideoGestures(video, player) {
    if (!(video instanceof HTMLVideoElement) || !player) return;
    if (video.dataset.skilluncappedGestures === 'true') return;

    video.dataset.skilluncappedGestures = 'true';
    new VideoGesturesController(video, player);
}
