class AdjacentVideoPreloader {
    constructor() {
        this.cacheKey = 'skilluncapped-video-boundaries-v2';
        this.segmentPattern = /\/([a-z0-9]{10})\/HIDDEN4500-(\d{5})\.ts(?:$|\?)/i;
        this.nativeFetch = window.fetch.bind(window);
        this.inFlightResolutions = new Map();
        this.availabilityChecks = new Map();

        window.fetch = this.fetchWithCache.bind(this);
    }

    preloadAdjacent(playlist, currentIndex, video) {
        if (!Array.isArray(playlist) || !Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= playlist.length) return;

        const adjacentUrls = [playlist[currentIndex - 1]?.url, playlist[currentIndex + 1]?.url].filter(Boolean);
        if (adjacentUrls.length === 0) return;

        const startPreloading = () => this.preload(adjacentUrls);

        if (video instanceof HTMLVideoElement && !video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            startPreloading();
            return;
        }

        video?.addEventListener('playing', startPreloading, { once: true });
    }

    preload(rawUrls) {
        return Promise.allSettled(rawUrls.map(rawUrl => this.resolveBoundary(rawUrl)));
    }

    async resolveBoundary(rawUrl) {
        const videoId = this.getVideoId(rawUrl);
        if (!videoId) return null;

        const cachedBoundary = this.getCachedBoundary(videoId);
        if (cachedBoundary !== null) return cachedBoundary;
        if (this.inFlightResolutions.has(videoId)) return this.inFlightResolutions.get(videoId);

        const resolution = this.findBoundary(videoId)
            .catch(error => {
                console.warn(`SkillUncapped Assistant: Failed to preload ${videoId}`, error);
                return null;
            })
            .finally(() => {
                this.inFlightResolutions.delete(videoId);
            });

        this.inFlightResolutions.set(videoId, resolution);
        return resolution;
    }

    async findBoundary(videoId) {
        await this.verifyAvailability(videoId);
        let firstPossiblePart = 0;
        let lastPossiblePart = 999;
        let boundary = -1;

        while (firstPossiblePart <= lastPossiblePart) {
            const part = Math.floor((firstPossiblePart + lastPossiblePart) / 2);
            const segmentUrl = `https://d13z5uuzt1wkbz.cloudfront.net/${videoId}/HIDDEN4500-${String(part).padStart(5, '0')}.ts`;
            const response = await this.nativeFetch(segmentUrl, { method: 'HEAD' });

            if (response.status === 403 || response.status === 404) {
                lastPossiblePart = part - 1;
            } else if (response.ok) {
                boundary = part;
                firstPossiblePart = part + 1;
            } else {
                throw new Error(`Playback server returned HTTP ${response.status}`);
            }
        }

        if (boundary >= 0) this.cacheBoundary(videoId, boundary);
        return boundary >= 0 ? boundary : null;
    }

    verifyAvailability(videoId) {
        if (this.availabilityChecks.has(videoId)) return this.availabilityChecks.get(videoId);

        const segmentUrl = `https://d13z5uuzt1wkbz.cloudfront.net/${videoId}/HIDDEN4500-00001.ts`;
        const check = this.nativeFetch(segmentUrl, { method: 'HEAD' })
            .then(response => {
                if (!response.ok) {
                    const error = new Error(`Playback server returned HTTP ${response.status}`);
                    error.status = response.status;
                    throw error;
                }
            })
            .catch(error => {
                this.availabilityChecks.delete(videoId);
                throw error;
            });
        this.availabilityChecks.set(videoId, check);
        return check;
    }

    async fetchWithCache(input, init) {
        const requestUrl = typeof input === 'string' ? input : input?.url;
        const requestMethod = (init?.method || input?.method || 'GET').toUpperCase();
        const segmentMatch = requestMethod === 'HEAD' && requestUrl ? requestUrl.match(this.segmentPattern) : null;

        if (segmentMatch) {
            try {
                await this.verifyAvailability(segmentMatch[1]);
            } catch (error) {
                const status = document.getElementById('status');
                if (status) {
                    status.textContent = error.status === 403 || error.status === 404
                        ? 'This video is unavailable from the SkillUncapped playback server.'
                        : 'Could not reach the playback server. Please try again later.';
                }
                throw error;
            }
            const cachedBoundary = this.getCachedBoundary(segmentMatch[1]);
            if (cachedBoundary !== null) {
                const requestedPart = Number.parseInt(segmentMatch[2], 10);
                return new Response(null, { status: requestedPart <= cachedBoundary ? 200 : 403 });
            }
        }

        return this.nativeFetch(input, init);
    }

    getVideoId(rawUrl) {
        if (typeof rawUrl !== 'string') return null;

        const trimmedUrl = rawUrl.replace(/\/[^/]*$/, '');
        const ids = Array.from(trimmedUrl.matchAll(/([a-z0-9]{10})(?:\/|$)/gi), match => match[1]);
        if (ids.length === 0) return null;
        return trimmedUrl.includes('browse3') ? ids[0] : ids[ids.length - 1];
    }

    getCachedBoundary(videoId) {
        const boundary = this.readCache()[videoId];
        return Number.isInteger(boundary) ? boundary : null;
    }

    cacheBoundary(videoId, boundary) {
        try {
            const cache = this.readCache();
            cache[videoId] = boundary;
            sessionStorage.setItem(this.cacheKey, JSON.stringify(cache));
        } catch (error) {
            console.warn('SkillUncapped Assistant: Failed to save preload cache', error);
        }
    }

    readCache() {
        try {
            const cache = JSON.parse(sessionStorage.getItem(this.cacheKey));
            return cache && typeof cache === 'object' && !Array.isArray(cache) ? cache : {};
        } catch (error) {
            console.warn('SkillUncapped Assistant: Failed to read preload cache', error);
            return {};
        }
    }
}

window.skillUncappedAdjacentVideoPreloader ??= new AdjacentVideoPreloader();
