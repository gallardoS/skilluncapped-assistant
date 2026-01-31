# skilluncapped-assistant

enhances the workflow and user experience for SkillUncapped via cross-site automation and a built-in CORS disabler.

## Features

- **Auto-redirection**: Detects course links and opens them in the player automatically.
- **Playlist Extraction**: Extracts the entire course playlist when accessing a video from the main `/game/browse/course` page. This enables browsing through episodes without leaving the page via injected navigation controls.
- **Built-in CORS Handler**: Includes a cross-origin resource sharing disabler required for video playback.

## Installation

1. Download the latest version from the [Releases](https://github.com/gallardoS/skilluncapped-assistant/releases) page.
2. Unzip the downloaded file.
3. Open Chrome and go to `chrome://extensions/`.
4. Enable "Developer mode" in the top right corner.
5. Click on "Load unpacked".
6. Select the folder containing this extension.
