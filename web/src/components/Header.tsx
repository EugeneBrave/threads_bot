import { useEffect, useCallback } from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-header);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border-subtle);
`;

const HeaderInner = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr auto;
    padding: 14px 16px;
  }
`;

const EditionMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const EditionKicker = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent-terracotta);
`;

const EditionSub = styled.span`
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
`;

const Masthead = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (max-width: 640px) {
    align-items: flex-start;
    text-align: left;
  }
`;

const Title = styled.h1`
  font-family: var(--font-serif);
  font-size: clamp(20px, 2.6vw, 28px);
  font-weight: 900;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.04em;
  line-height: 1.15;
`;

const MastheadSub = styled.span`
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  margin-top: 2px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const ThemeToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover {
    border-color: var(--border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--accent-indigo);
    outline-offset: 2px;
  }

  /* Show "switch to dark" when light is active, and "switch to light" when dark is active */
  .theme-to-light {
    display: none;
  }
  .theme-to-dark {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  @media (prefers-color-scheme: dark) {
    .theme-to-light {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .theme-to-dark {
      display: none;
    }
  }

  :root:has(> head > meta[name="color-scheme"][content="dark"]) & {
    .theme-to-light {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .theme-to-dark {
      display: none;
    }
  }

  :root:has(> head > meta[name="color-scheme"][content="light"]) & {
    .theme-to-light {
      display: none;
    }
    .theme-to-dark {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }
`;

const ToggleLabel = styled.span`
  @media (max-width: 480px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

const STORAGE_KEY = 'color-scheme';

function getSystemScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyMetaScheme(value: string | null) {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  if (meta) {
    meta.content = value === 'light' || value === 'dark' ? value : 'light dark';
  }
}

const Header = () => {
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        applyMetaScheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleToggleTheme = useCallback(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }

    const system = getSystemScheme();
    const currentRendered = stored === 'light' || stored === 'dark' ? stored : system;
    const target: 'light' | 'dark' = currentRendered === 'dark' ? 'light' : 'dark';

    const nextStored = target === system ? null : target;
    try {
      if (nextStored) {
        localStorage.setItem(STORAGE_KEY, nextStored);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Still apply to page even if persistence fails
    }

    applyMetaScheme(nextStored);
  }, []);

  return (
    <HeaderWrapper>
      <HeaderInner>
        <EditionMeta>
          <EditionKicker>Daily Curated Magazine</EditionKicker>
          <EditionSub>男裝 · 美式復古 · 阿美咔嘰</EditionSub>
        </EditionMeta>

        <Masthead>
          <Title>Threads 每日穿搭精選</Title>
          <MastheadSub>The Menswear &amp; Heritage Style Digest</MastheadSub>
        </Masthead>

        <Actions>
          <ThemeToggleButton type="button" onClick={handleToggleTheme}>
            <span className="theme-to-dark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <ToggleLabel>深色模式</ToggleLabel>
            </span>
            <span className="theme-to-light">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <ToggleLabel>淺色模式</ToggleLabel>
            </span>
          </ThemeToggleButton>
        </Actions>
      </HeaderInner>
    </HeaderWrapper>
  );
};

export default Header;
