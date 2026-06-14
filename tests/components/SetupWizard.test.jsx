import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetupWizard from '../../src/components/SetupWizard.jsx';

/**
 * Tests for the SetupWizard component.
 *
 * The wizard guides new users through creating their first goal.
 * Tests cover field validation, optional emoji handling, color
 * selection, and the onComplete callback shape.
 */

const noop = () => {};

describe('SetupWizard', () => {
  it('renders a welcome heading on first load', () => {
    render(<SetupWizard onComplete={noop} />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it('shows a name input field', () => {
    render(<SetupWizard onComplete={noop} />);
    expect(screen.getByPlaceholderText(/goal name/i)).toBeInTheDocument();
  });

  it('shows a target input field', () => {
    render(<SetupWizard onComplete={noop} />);
    expect(screen.getByLabelText(/days per week/i)).toBeInTheDocument();
  });

  it('shows an optional emoji input', () => {
    render(<SetupWizard onComplete={noop} />);
    expect(screen.getByPlaceholderText(/emoji/i)).toBeInTheDocument();
  });

  it('shows a skip emoji option', () => {
    render(<SetupWizard onComplete={noop} />);
    expect(screen.getByText(/skip/i)).toBeInTheDocument();
  });

  it('shows the Monokai color palette for selection', () => {
    render(<SetupWizard onComplete={noop} />);
    // Color swatches should be present — at least 6 (one per palette color)
    const swatches = screen.getAllByRole('button', { name: /color/i });
    expect(swatches.length).toBeGreaterThanOrEqual(6);
  });

  it('calls onComplete with a valid goal when the form is submitted', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);

    await user.type(screen.getByPlaceholderText(/goal name/i), 'Exercise');
    const targetInput = screen.getByLabelText(/days per week/i);
    await user.clear(targetInput);
    await user.type(targetInput, '6');
    await user.click(screen.getByRole('button', { name: /add goal/i }));

    expect(onComplete).toHaveBeenCalledOnce();
    const goal = onComplete.mock.calls[0][0];
    expect(goal.name).toBe('Exercise');
    expect(goal.target).toBe(6);
    expect(goal.id).toBeDefined();
    expect(goal.color).toBeDefined();
  });

  it('does not submit when name is empty', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);
    await user.click(screen.getByRole('button', { name: /add goal/i }));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not submit when target is zero', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);
    await user.type(screen.getByPlaceholderText(/goal name/i), 'Exercise');
    const targetInput = screen.getByLabelText(/days per week/i);
    await user.clear(targetInput);
    await user.type(targetInput, '0');
    await user.click(screen.getByRole('button', { name: /add goal/i }));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('submits without emoji when skip is chosen', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<SetupWizard onComplete={onComplete} />);
    await user.type(screen.getByPlaceholderText(/goal name/i), 'Reading');
    await user.click(screen.getByText(/skip/i));
    await user.click(screen.getByRole('button', { name: /add goal/i }));
    const goal = onComplete.mock.calls[0][0];
    expect(goal.emoji).toBeNull();
  });

  it('shows a validation message when name is missing on submit', async () => {
    const user = userEvent.setup();
    render(<SetupWizard onComplete={noop} />);
    await user.click(screen.getByRole('button', { name: /add goal/i }));
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
