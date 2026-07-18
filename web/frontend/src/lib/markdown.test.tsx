import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SafeMarkdown } from '@/lib/markdown';

describe('SafeMarkdown', () => {
  it('renders allowed markdown tags', () => {
    render(
      <SafeMarkdown
        content={`## Overview

Put **3** breads in the *nest*.`}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Overview' }),
    ).toBeInTheDocument();
    expect(screen.getByText('3').tagName).toBe('STRONG');
    expect(screen.getByText('nest').tagName).toBe('EM');
  });

  it('does not execute or emit raw dangerous HTML', () => {
    const { container } = render(
      <SafeMarkdown
        content={
          'Hello <script>window.__xss = true</script><img src=x onerror="window.__xss=true" /><a href="javascript:alert(1)">click</a>'
        }
      />,
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
    expect((window as Window & { __xss?: boolean }).__xss).toBeUndefined();
    expect(container.textContent).toContain('Hello');
  });

  it('adds noopener noreferrer on links', () => {
    render(
      <SafeMarkdown content={'[docs](https://example.com/guide)'} />,
    );

    const link = screen.getByRole('link', { name: 'docs' });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('href', 'https://example.com/guide');
  });
});
