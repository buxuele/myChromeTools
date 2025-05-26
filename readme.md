# myTools

A toolbox for automating actions on specific websites

## Features
### Grok Enhancements
- For `x.com/i/grok`:
  - Automatically clicks the "Focus Mode" button.
  - Adjusts the height of the input box for better usability.
  - Converts copied text to Markdown format.
- For `grok.com`:
  - Inserts predefined text into the chat input box using a keyboard shortcut (`Ctrl+Q` or `Command+Shift+G` for Mac).
### Pinterest Image Downloader
- For `i.pinimg.com`:
  - Automatically redirects from preview image URLs (e.g., containing `/736x/` or `/1200x/`) to the original image URL (containing `/originals/`).
  - Automatically triggers a download of the original image once the page with the original image is loaded.
### Auto Scroll
- Enables automatic, smooth scrolling down the current webpage.
- When the bottom of the page is reached, it automatically loops back to the top and continues scrolling.
- This feature is available on all websites.

## Installation
1. Download or clone this repository to your local machine.
2. Open the Google Chrome browser and navigate to `chrome://extensions/`.
3. Enable "Developer mode". You'll usually find this toggle switch in the top right corner of the extensions page.
4. Click on the "Load unpacked" button.
5. In the file selection dialog, navigate to the directory where you downloaded or cloned the repository and select it.
The myTools extension should now be installed and active.

## How to Use
### Grok Enhancements
- For `x.com/i/grok`:
  - The "Focus Mode" activation and input box adjustment are applied automatically when the page loads.
  - When you click the "Copy Text" button on a Grok response, the content will be automatically copied to your clipboard in Markdown format.
- For `grok.com`:
  - Press `Ctrl+Q` (or `Command+Shift+G` on a Mac) to insert the predefined text into the chat input box.
### Pinterest Image Downloader
- When you navigate to a Pinterest image page on `i.pinimg.com` (e.g., by clicking an image from Pinterest), the extension works automatically.
- If the URL is a preview version (like those containing `/736x/` or `/1200x/`), it will first redirect you to the page with the original, full-resolution image (`/originals/`).
- Once the page for the original image is loaded, the download of the image will start automatically.
### Auto Scroll
- Click the extension icon in your browser to open the popup interface.
- In the popup, click the "自动滚动" (`Auto Scroll`) button to start automatic scrolling on the current page.
- To stop scrolling, click the "Stop" button in the popup.

## File Structure Overview
- `manifest.json`: The core configuration file for the Chrome extension. It defines permissions, background scripts, content scripts, and other essential metadata.
- `background.js`: Handles background tasks such as listening for keyboard shortcuts (`Ctrl+Q` for Grok text insertion) and managing downloads (e.g., for Pinterest images).
- `popup.html`: Defines the HTML structure of the extension's popup window, which appears when you click the extension icon. This includes buttons for features like Auto Scroll.
- `popup.js`: Contains the JavaScript logic for `popup.html`. It handles user interactions within the popup, like starting or stopping the auto-scroll feature.
- `grok_content.js`: A content script that runs on `x.com/i/grok`. It enhances the user experience by automatically clicking "Focus Mode", adjusting input box height, and enabling copy-as-markdown.
- `grok_insert_text.js`: A content script for `grok.com`. It listens for messages from `background.js` to insert predefined text when the shortcut is pressed.
- `pinterest_content.js`: A content script that runs on `i.pinimg.com` pages. It modifies the URL to point to the original image and triggers an automatic download.
- `scroll_control.js`: A content script injected into all web pages (matches `<all_urls>`). It provides the auto-scrolling functionality, which is controlled via the extension popup.
- `turndown.js`: A library used by `grok_content.js` to convert HTML content to Markdown.
- `images/`: This directory contains all the icons used by the extension (e.g., for the browser toolbar, popup, etc.).

## Developer Notes
- **Project Purpose**: This project aims to provide personalized automation and enhancements for specific websites, enabling unique operations tailored to individual needs.
- **Architectural Decision - Content Script Refactoring**: The original `content.js` was split into multiple, more focused files (`grok_content.js`, `pinterest_content.js`, `grok_insert_text.js`, `scroll_control.js`). This modular approach was adopted to improve organization, facilitate easier management of distinct functionalities, and simplify future expansion.
- **Adding New Features**:
    1.  First, update `manifest.json` by adding a new entry in the `content_scripts` section, specifying the `matches` (target URLs) and the new JavaScript file(s) for the feature.
    2.  Then, create the new JavaScript file(s) to implement the desired functionality.
