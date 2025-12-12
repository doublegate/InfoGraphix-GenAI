import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Feedback } from '../types';

interface FeedbackFormProps {
  onSubmit: (rating: number, comment: string) => void;
  existingFeedback?: Feedback;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit, existingFeedback }) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
      setSubmitted(true);
    }
  };

  if (submitted && existingFeedback) {
    return (
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700 text-center">
        <p className="text-sm text-green-400 font-semibold mb-2">Thanks for your feedback!</p>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${s <= existingFeedback.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} />
          ))}
        </div>
        {existingFeedback.comment && <p className="text-xs text-slate-400 italic">"{existingFeedback.comment}"</p>}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Rate this Result</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600 hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
        </div>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any comments on the data accuracy or visual style?"
          className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-3 outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
        />
        
        <button
          type="submit"
          disabled={rating === 0}
          className={`w-full py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            rating > 0
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;