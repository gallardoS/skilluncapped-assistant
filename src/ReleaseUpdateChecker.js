globalThis.ReleaseUpdateChecker = class ReleaseUpdateChecker {
    constructor({
        apiUrl,
        releasesUrl,
        cacheKey,
        cacheTtl,
        storage = chrome.storage.local,
        getCurrentVersion = () => chrome.runtime.getManifest().version,
        fetchRelease = (...args) => globalThis.fetch(...args)
    }) {
        this.apiUrl = apiUrl;
        this.releasesUrl = releasesUrl;
        this.cacheKey = cacheKey;
        this.cacheTtl = cacheTtl;
        this.storage = storage;
        this.getCurrentVersion = getCurrentVersion;
        this.fetchRelease = fetchRelease;
    }

    parseVersion(version) {
        const parts = String(version).match(/\d+/g);
        return parts ? parts.map(Number) : [];
    }

    isVersionNewer(candidate, current) {
        const candidateParts = this.parseVersion(candidate);
        const currentParts = this.parseVersion(current);
        const length = Math.max(candidateParts.length, currentParts.length);

        for (let index = 0; index < length; index += 1) {
            const candidatePart = candidateParts[index] || 0;
            const currentPart = currentParts[index] || 0;
            if (candidatePart > currentPart) return true;
            if (candidatePart < currentPart) return false;
        }

        return false;
    }

    createResult(currentVersion, release) {
        return {
            currentVersion,
            latestVersion: release.latestVersion,
            releaseUrl: release.releaseUrl || this.releasesUrl,
            updateAvailable: this.isVersionNewer(release.latestVersion, currentVersion)
        };
    }

    async getCachedRelease() {
        const stored = await this.storage.get(this.cacheKey);
        return stored[this.cacheKey];
    }

    async storeRelease(release) {
        await this.storage.set({ [this.cacheKey]: release });
    }

    async check() {
        const currentVersion = this.getCurrentVersion();
        const cachedRelease = await this.getCachedRelease();
        const now = Date.now();

        if (
            cachedRelease?.latestVersion
            && now - cachedRelease.checkedAt < this.cacheTtl
        ) {
            return this.createResult(currentVersion, cachedRelease);
        }

        const headers = {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };

        if (cachedRelease?.etag) headers['If-None-Match'] = cachedRelease.etag;

        try {
            const response = await this.fetchRelease(this.apiUrl, { headers });

            if (response.status === 304 && cachedRelease?.latestVersion) {
                const refreshedRelease = { ...cachedRelease, checkedAt: now };
                await this.storeRelease(refreshedRelease);
                return this.createResult(currentVersion, refreshedRelease);
            }

            if (!response.ok) {
                throw new Error(`GitHub release check failed: ${response.status}`);
            }

            const release = await response.json();
            const latestRelease = {
                latestVersion: release.tag_name,
                releaseUrl: release.html_url || this.releasesUrl,
                etag: response.headers.get('etag'),
                checkedAt: now
            };

            await this.storeRelease(latestRelease);
            return this.createResult(currentVersion, latestRelease);
        } catch (error) {
            if (cachedRelease?.latestVersion) {
                return this.createResult(currentVersion, cachedRelease);
            }
            throw error;
        }
    }
};
