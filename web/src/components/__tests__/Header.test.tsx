import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../Header';

describe('Header', () => {
  it('renders the title correctly', () => {
    render(<Header />);
    expect(screen.getByText('Threads 每日穿搭精選')).toBeInTheDocument();
  });

  it('renders with correct styles', () => {
    const { container } = render(<Header />);
    const headerElement = container.firstChild;
    expect(headerElement).toHaveStyle('border-bottom: 1px solid rgba(255, 255, 255, 0.08)');
  });
});
