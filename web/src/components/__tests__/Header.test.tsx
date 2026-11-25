import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  it('renders the title correctly', () => {
    render(<Header />);
    expect(screen.getByText('Threads 每日穿搭精選')).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    render(<Header />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
