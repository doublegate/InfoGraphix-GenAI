import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import ProcessingState from './ProcessingState';

describe('ProcessingState', () => {
  it('should render analyzing state', () => {
    render(<ProcessingState step="analyzing" />);

    expect(screen.getByText(/Deep Analysis in Progress/i)).toBeInTheDocument();
  });

  it('should render generating state', () => {
    render(<ProcessingState step="generating" />);

    expect(screen.getByText(/Generating High-Fidelity Render/i)).toBeInTheDocument();
  });

  it('should not render when idle', () => {
    const { container } = render(<ProcessingState step="idle" />);

    expect(container.firstChild).toBeNull();
  });

  it('should not render when complete', () => {
    const { container } = render(<ProcessingState step="complete" />);

    expect(container.firstChild).toBeNull();
  });

  it('should display progress indicators', () => {
    render(<ProcessingState step="analyzing" />);

    // Check for the step indicator text
    expect(screen.getByText(/Gemini 3 Pro is researching/i)).toBeInTheDocument();
  });
});
