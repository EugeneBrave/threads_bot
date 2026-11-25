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

    /* Raw Light Palette (Warm Japanese Magazine Paper) */
    --bg-canvas-light: #f5f2eb;
    --bg-surface-light: #fdfbf7;
    --bg-elevated-light: #ebe6db;
    --bg-header-light: rgba(245, 242, 235, 0.88);
    --text-primary-light: #1c1917;
    --text-secondary-light: #57534e;
    --text-muted-light: #8a8278;
    --border-subtle-light: #dfd9cc;
    --border-strong-light: #1c1917;
    --accent-indigo-light: #1e3a5f;
    --accent-indigo-soft-light: rgba(30, 58, 95, 0.08);
    --accent-terracotta-light: #b85032;
    --accent-terracotta-soft-light: rgba(184, 80, 50, 0.1);
    --scrollbar-track-light: #ebe6db;
    --scrollbar-thumb-light: #b8b0a2;

    /* Raw Dark Palette (Midnight Indigo & Brass) */
    --bg-canvas-dark: #121316;
    --bg-surface-dark: #1a1c21;
    --bg-elevated-dark: #23262e;
    --bg-header-dark: rgba(18, 19, 22, 0.88);
    --text-primary-dark: #f2efe9;
    --text-secondary-dark: #b8b2a6;
    --text-muted-dark: #7d786f;
    --border-subtle-dark: #2c303a;
    --border-strong-dark: #e8e2d5;
    --accent-indigo-dark: #82ace0;
    --accent-indigo-soft-dark: rgba(130, 172, 224, 0.14);
    --accent-terracotta-dark: #e28d6b;
    --accent-terracotta-soft-dark: rgba(226, 141, 107, 0.15);
    --scrollbar-track-dark: #1a1c21;
    --scrollbar-thumb-dark: #484d59;

    /* Default (Light) fallback */
    --bg-canvas: var(--bg-canvas-light);
    --bg-surface: var(--bg-surface-light);
    --bg-elevated: var(--bg-elevated-light);
    --bg-header: var(--bg-header-light);
    --text-primary: var(--text-primary-light);
    --text-secondary: var(--text-secondary-light);
    --text-muted: var(--text-muted-light);
    --border-subtle: var(--border-subtle-light);
    --border-strong: var(--border-strong-light);
    --accent-indigo: var(--accent-indigo-light);
    --accent-indigo-soft: var(--accent-indigo-soft-light);
    --accent-terracotta: var(--accent-terracotta-light);
    --accent-terracotta-soft: var(--accent-terracotta-soft-light);
    --scrollbar-track: var(--scrollbar-track-light);
    --scrollbar-thumb: var(--scrollbar-thumb-light);

    /* Fallback for browsers without light-dark() */
    @media (prefers-color-scheme: dark) {
      --bg-canvas: var(--bg-canvas-dark);
      --bg-surface: var(--bg-surface-dark);
      --bg-elevated: var(--bg-elevated-dark);
      --bg-header: var(--bg-header-dark);
      --text-primary: var(--text-primary-dark);
      --text-secondary: var(--text-secondary-dark);
      --text-muted: var(--text-muted-dark);
      --border-subtle: var(--border-subtle-dark);
      --border-strong: var(--border-strong-dark);
      --accent-indigo: var(--accent-indigo-dark);
      --accent-indigo-soft: var(--accent-indigo-soft-dark);
      --accent-terracotta: var(--accent-terracotta-dark);
      --accent-terracotta-soft: var(--accent-terracotta-soft-dark);
      --scrollbar-track: var(--scrollbar-track-dark);
      --scrollbar-thumb: var(--scrollbar-thumb-dark);
    }

    /* Modern light-dark() tokens */
    @supports (color: light-dark(white, black)) {
      --bg-canvas: light-dark(var(--bg-canvas-light), var(--bg-canvas-dark));
      --bg-surface: light-dark(var(--bg-surface-light), var(--bg-surface-dark));
      --bg-elevated: light-dark(var(--bg-elevated-light), var(--bg-elevated-dark));
      --bg-header: light-dark(var(--bg-header-light), var(--bg-header-dark));
      --text-primary: light-dark(var(--text-primary-light), var(--text-primary-dark));
      --text-secondary: light-dark(var(--text-secondary-light), var(--text-secondary-dark));
      --text-muted: light-dark(var(--text-muted-light), var(--text-muted-dark));
      --border-subtle: light-dark(var(--border-subtle-light), var(--border-subtle-dark));
      --border-strong: light-dark(var(--border-strong-light), var(--border-strong-dark));
      --accent-indigo: light-dark(var(--accent-indigo-light), var(--accent-indigo-dark));
      --accent-indigo-soft: light-dark(var(--accent-indigo-soft-light), var(--accent-indigo-soft-dark));
      --accent-terracotta: light-dark(var(--accent-terracotta-light), var(--accent-terracotta-dark));
      --accent-terracotta-soft: light-dark(var(--accent-terracotta-soft-light), var(--accent-terracotta-soft-dark));
      --scrollbar-track: light-dark(var(--scrollbar-track-light), var(--scrollbar-track-dark));
      --scrollbar-thumb: light-dark(var(--scrollbar-thumb-light), var(--scrollbar-thumb-dark));
    }

    --font-serif: 'Playfair Display', 'Noto Serif TC', Georgia, serif;
    --font-sans: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    accent-color: var(--accent-indigo);
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
    line-height: 1.6;
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
    background: var(--accent-indigo-soft);
    color: var(--accent-indigo);
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
