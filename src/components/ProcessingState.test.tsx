import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import ProcessingState from './ProcessingState';

describe('ProcessingState', () => {
  it('should render analyzing state', () => {
    render(<ProcessingState processingStep="analyzing" />);

    expect(screen.getByText(/Analyzing topic/i)).toBeInTheDocument();
  });

  it('should render generating state', () => {
    render(<ProcessingState processingStep="generating" />);

    expect(screen.getByText(/Generating infographic/i)).toBeInTheDocument();
  });

  it('should not render when idle', () => {
    const { container } = render(<ProcessingState processingStep="idle" />);

    expect(container.firstChild).toBeNull();
  });

  it('should not render when complete', () => {
    const { container } = render(<ProcessingState processingStep="complete" />);

    expect(container.firstChild).toBeNull();
  });

  it('should display thinking indicators', () => {
    render(<ProcessingState processingStep="analyzing" />);

    // Check for loading spinner or animated elements
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });
});
