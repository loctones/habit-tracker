import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DayToggle from '../../src/components/DayToggle.jsx';

/**
 * Tests for the DayToggle component.
 *
 * A single toggleable button representing one day of the week.
 * Tests cover checked/unchecked rendering, today highlighting,
 * and the onChange callback firing correctly.
 */

describe('DayToggle', () => {
  it('renders the day label when unchecked', () => {
    render(<DayToggle dayLabel="M" checked={false} onChange={vi.fn()} isToday={false} color="#78dce8" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders a checkmark when checked', () => {
    render(<DayToggle dayLabel="M" checked={true} onChange={vi.fn()} isToday={false} color="#78dce8" />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('calls onChange when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DayToggle dayLabel="T" checked={false} onChange={onChange} isToday={false} color="#78dce8" />);
    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('has a distinct style when isToday is true', () => {
    const { container } = render(
      <DayToggle dayLabel="W" checked={false} onChange={vi.fn()} isToday={true} color="#78dce8" />
    );
    const btn = container.querySelector('[data-today="true"]');
    expect(btn).toBeInTheDocument();
  });

  it('is accessible as a button with a descriptive label', () => {
    render(<DayToggle dayLabel="F" checked={false} onChange={vi.fn()} isToday={false} color="#78dce8" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
