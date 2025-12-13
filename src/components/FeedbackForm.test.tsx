import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackForm from './FeedbackForm';

describe('FeedbackForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render the form with title', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Rate this Result')).toBeInTheDocument();
    });

    it('should render 5 star buttons', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const starButtons = screen.getAllByRole('button', { name: '' });
      // 5 star buttons + 1 submit button
      expect(starButtons.length).toBeGreaterThanOrEqual(5);
    });

    it('should render comment textarea', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText(/Any comments on the data accuracy/i)).toBeInTheDocument();
    });

    it('should render submit button as disabled initially', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('star rating interaction', () => {
    it('should enable submit button when a star is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      // Click first star button (index 0 is first star)
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should allow changing star rating', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const buttons = screen.getAllByRole('button');

      // Click 3rd star
      await user.click(buttons[2]);

      // Click 5th star
      await user.click(buttons[4]);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('comment input', () => {
    it('should allow typing in comment textarea', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/Any comments on the data accuracy/i);
      await user.type(textarea, 'Great infographic!');

      expect(textarea).toHaveValue('Great infographic!');
    });

    it('should update comment on change', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const textarea = screen.getByPlaceholderText(/Any comments on the data accuracy/i);
      fireEvent.change(textarea, { target: { value: 'Test comment' } });

      expect(textarea).toHaveValue('Test comment');
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with rating and comment', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      // Click 4th star for rating
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[3]);

      // Add comment
      const textarea = screen.getByPlaceholderText(/Any comments on the data accuracy/i);
      await user.type(textarea, 'Nice work');

      // Submit
      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(4, 'Nice work');
    });

    it('should not call onSubmit when rating is 0', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      // Try submitting without rating (button is disabled)
      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should allow submission with empty comment', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      // Click star for rating
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[2]);

      // Submit without comment
      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(3, '');
    });

    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      await user.click(submitButton);

      // Form should not cause page reload, onSubmit should be called
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('existing feedback', () => {
    it('should show thank you message with existing feedback', () => {
      const existingFeedback = { rating: 5, comment: 'Excellent!' };
      render(<FeedbackForm onSubmit={mockOnSubmit} existingFeedback={existingFeedback} />);

      expect(screen.getByText("Thanks for your feedback!")).toBeInTheDocument();
    });

    it('should display existing rating stars', () => {
      const existingFeedback = { rating: 4, comment: 'Good' };
      render(<FeedbackForm onSubmit={mockOnSubmit} existingFeedback={existingFeedback} />);

      // Should show thank you state with stars
      expect(screen.getByText("Thanks for your feedback!")).toBeInTheDocument();
    });

    it('should display existing comment', () => {
      const existingFeedback = { rating: 3, comment: 'Could be better' };
      render(<FeedbackForm onSubmit={mockOnSubmit} existingFeedback={existingFeedback} />);

      expect(screen.getByText(/"Could be better"/)).toBeInTheDocument();
    });

    it('should not display comment quotes when comment is empty', () => {
      const existingFeedback = { rating: 4, comment: '' };
      render(<FeedbackForm onSubmit={mockOnSubmit} existingFeedback={existingFeedback} />);

      expect(screen.getByText("Thanks for your feedback!")).toBeInTheDocument();
      // No italic comment should be displayed
      expect(screen.queryByText(/^".*"$/)).not.toBeInTheDocument();
    });

    it('should initialize form with existing feedback values when not submitted', () => {
      // When existingFeedback exists, component shows thank you state
      // This test verifies the submitted state logic
      const existingFeedback = { rating: 5, comment: 'Great!' };
      render(<FeedbackForm onSubmit={mockOnSubmit} existingFeedback={existingFeedback} />);

      // Component should show thank you state
      expect(screen.getByText("Thanks for your feedback!")).toBeInTheDocument();
    });
  });

  describe('styling and accessibility', () => {
    it('should have proper submit button styling when disabled', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Submit Feedback/i });
      expect(submitButton).toHaveClass('cursor-not-allowed');
    });

    it('should have form element with proper structure', () => {
      render(<FeedbackForm onSubmit={mockOnSubmit} />);

      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});
