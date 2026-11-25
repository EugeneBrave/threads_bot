import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    color-scheme: light dark;

    &:has(> head > meta[name="color-scheme"][content="dark"]) {
      color-scheme: dark;
    }
    &:has(> head > meta[name="color-scheme"][content="light"]) {
      color-scheme: light;
    }

    /* Light Palette: Starch-White Studio & Heritage Military Olive */
    --bg-canvas-light: #fafafa;
    --bg-surface-light: #ffffff;
    --bg-wash-light: #f0f2f5;
    --bg-header-light: rgba(250, 250, 250, 0.92);
    --text-primary-light: #111827;
    --text-secondary-light: #374151;
    --text-muted-light: #5c6672;
    --border-subtle-light: #e4e7ec;
    --border-strong-light: #111827;
    --accent-light: #1b4332;
    --accent-soft-light: rgba(27, 67, 50, 0.08);
    --accent-text-light: #ffffff;
    --scrollbar-track-light: #f0f2f5;
    --scrollbar-thumb-light: #b6bec9;

    /* Dark Palette: Deep Selvedge Slate & Muted Sage */
    --bg-canvas-dark: #0f1419;
    --bg-surface-dark: #161d24;
    --bg-wash-dark: #1d2630;
    --bg-header-dark: rgba(15, 20, 25, 0.92);
    --text-primary-dark: #eef2f6;
    --text-secondary-dark: #c5ced8;
    --text-muted-dark: #8b98a6;
    --border-subtle-dark: #26313d;
    --border-strong-dark: #eef2f6;
    --accent-dark: #52b788;
    --accent-soft-dark: rgba(82, 183, 136, 0.14);
    --accent-text-dark: #0b1a13;
    --scrollbar-track-dark: #161d24;
    --scrollbar-thumb-dark: #43505e;

    /* Default (Light) fallback */
    --bg-canvas: var(--bg-canvas-light);
    --bg-surface: var(--bg-surface-light);
    --bg-wash: var(--bg-wash-light);
    --bg-header: var(--bg-header-light);
    --text-primary: var(--text-primary-light);
    --text-secondary: var(--text-secondary-light);
    --text-muted: var(--text-muted-light);
    --border-subtle: var(--border-subtle-light);
    --border-strong: var(--border-strong-light);
    --accent: var(--accent-light);
    --accent-soft: var(--accent-soft-light);
    --accent-text: var(--accent-text-light);
    --scrollbar-track: var(--scrollbar-track-light);
    --scrollbar-thumb: var(--scrollbar-thumb-light);

    @media (prefers-color-scheme: dark) {
      --bg-canvas: var(--bg-canvas-dark);
      --bg-surface: var(--bg-surface-dark);
      --bg-wash: var(--bg-wash-dark);
      --bg-header: var(--bg-header-dark);
      --text-primary: var(--text-primary-dark);
      --text-secondary: var(--text-secondary-dark);
      --text-muted: var(--text-muted-dark);
      --border-subtle: var(--border-subtle-dark);
      --border-strong: var(--border-strong-dark);
      --accent: var(--accent-dark);
      --accent-soft: var(--accent-soft-dark);
      --accent-text: var(--accent-text-dark);
      --scrollbar-track: var(--scrollbar-track-dark);
      --scrollbar-thumb: var(--scrollbar-thumb-dark);
    }

    @supports (color: light-dark(white, black)) {
      --bg-canvas: light-dark(var(--bg-canvas-light), var(--bg-canvas-dark));
      --bg-surface: light-dark(var(--bg-surface-light), var(--bg-surface-dark));
      --bg-wash: light-dark(var(--bg-wash-light), var(--bg-wash-dark));
      --bg-header: light-dark(var(--bg-header-light), var(--bg-header-dark));
      --text-primary: light-dark(var(--text-primary-light), var(--text-primary-dark));
      --text-secondary: light-dark(var(--text-secondary-light), var(--text-secondary-dark));
      --text-muted: light-dark(var(--text-muted-light), var(--text-muted-dark));
      --border-subtle: light-dark(var(--border-subtle-light), var(--border-subtle-dark));
      --border-strong: light-dark(var(--border-strong-light), var(--border-strong-dark));
      --accent: light-dark(var(--accent-light), var(--accent-dark));
      --accent-soft: light-dark(var(--accent-soft-light), var(--accent-soft-dark));
      --accent-text: light-dark(var(--accent-text-light), var(--accent-text-dark));
      --scrollbar-track: light-dark(var(--scrollbar-track-light), var(--scrollbar-track-dark));
      --scrollbar-thumb: light-dark(var(--scrollbar-thumb-light), var(--scrollbar-thumb-dark));
    }

    --font-display: 'Space Grotesk', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-sans: 'Noto Sans TC', 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;

    accent-color: var(--accent);
    scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-sans);
    background-color: var(--bg-canvas);
    color: var(--text-primary);
    min-height: 100vh;
    line-height: 1.65;
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  ::selection {
    background: var(--accent-soft);
    color: var(--accent);
  }

  @supports not (scrollbar-color: auto) {
    :root {
      scrollbar-width: auto;
    }
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--scrollbar-track);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--scrollbar-thumb);
      border-radius: 4px;
    }
  }
`;

export default GlobalStyles;
