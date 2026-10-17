class CoursePageAdapter {
    getCourseRoute(href = window.location.href) {
        try {
            const url = new URL(href, window.location.origin);
            const match = url.pathname.match(/^(\/[^/]+\/browse\/(?:course|all)\/)([^/]+)\/([^/]+)\/?$/);
            if (url.origin !== window.location.origin || !match) return null;
            return { url, prefix: match[1], videoId: match[2], courseId: match[3] };
        } catch {
            return null;
        }
    }

    getLessonUrl(row, href = window.location.href) {
        const route = this.getCourseRoute(href);
        if (!route) return null;

        const link = row.matches('a[href]') ? row : row.querySelector('a[href*="/browse/course/"], a[href*="/browse/all/"]');
        if (link) {
            const linkedRoute = this.getCourseRoute(link.href);
            if (linkedRoute?.courseId === route.courseId) return linkedRoute.url.href;
        }

        const poster = row.querySelector('img[data-rail-poster], img[src*="/posters/"], img[src*="/videos/"]');
        const source = poster?.getAttribute('src') || poster?.getAttribute('srcset') || '';
        const videoId = source.match(/\/posters\/(?:[^/?]+\/)*([a-z0-9]{10})\.(?:jpg|png|webp)(?:[?\s]|$)/i)?.[1]
            || source.match(/\/videos\/([a-z0-9]{10})\//i)?.[1];
        if (!videoId) return null;

        const url = new URL(route.url.href);
        url.pathname = `${route.prefix}${videoId}/${route.courseId}`;
        url.hash = '';
        return url.href;
    }

    getContext(href = window.location.href) {
        const route = this.getCourseRoute(href);
        const currentRoute = this.getCourseRoute();
        const list = document.querySelector('#learning-course-videos');
        if (!route || !currentRoute || route.courseId !== currentRoute.courseId || !list) return null;

        const rows = Array.from(list.querySelectorAll('[data-course-lesson]'));
        const playlist = rows.map((row, index) => ({
            url: this.getLessonUrl(row, href),
            number: row.querySelector('[data-number-tag]')?.textContent.trim() || String(index + 1).padStart(2, '0'),
            title: row.querySelector('[data-course-lesson-title]')?.textContent.trim()
                || row.getAttribute('aria-label')?.split(',')[0] || 'Unknown Episode'
        }));
        if (!playlist.length || playlist.some(item => !item.url)) return null;
        const index = playlist.findIndex(item => this.getCourseRoute(item.url)?.videoId === route.videoId);
        if (index < 0) return null;

        const currentRow = rows.find(row => row.hasAttribute('aria-current'));
        if (currentRow && this.getCourseRoute(this.getLessonUrl(currentRow))?.videoId !== currentRoute.videoId) return null;

        const navigation = list.closest('[data-course-navigation]') || list.parentElement;
        const courseName = navigation?.querySelector('h2')?.textContent.trim()
            || list.getAttribute('aria-label')?.replace(/\s+lessons$/i, '') || null;
        return { playlist, index, courseName };
    }
}
