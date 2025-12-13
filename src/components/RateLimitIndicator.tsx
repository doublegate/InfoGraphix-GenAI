/**
 * Rate Limit Indicator Component
 * v1.9.1 - TD-032: Rate Limiting UI
 *
 * Displays rate limit status and cooldown timer when rate limited.
 */

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getRateLimiter } from '../services/geminiService';

/**
 * Props for RateLimitIndicator component.
 */
interface RateLimitIndicatorProps {
  /** Whether to show remaining requests (default: true) */
  showRemaining?: boolean;
  /** Whether to show only when rate limited (default: false) */
  showOnlyWhenLimited?: boolean;
}

/**
 * Displays rate limit status with countdown timer during cooldown.
 * Updates every second to show accurate remaining time.
 *
 * @example
 * ```tsx
 * // Show full indicator with remaining requests
 * <RateLimitIndicator />
 *
 * // Show only during cooldown
 * <RateLimitIndicator showOnlyWhenLimited={true} />
 *
 * // Hide remaining requests count
 * <RateLimitIndicator showRemaining={false} />
 * ```
 */
const RateLimitIndicator: React.FC<RateLimitIndicatorProps> = ({
  showRemaining = true,
  showOnlyWhenLimited = false
}) => {
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);

  useEffect(() => {
    const rateLimiter = getRateLimiter();

    // Update state immediately
    const updateState = () => {
      setTimeUntilReset(rateLimiter.getTimeUntilReset());
      setRemaining(rateLimiter.getRemainingRequests());
      setIsInCooldown(rateLimiter.isInCooldown());
    };

    // Initial update
    updateState();

    // Update every second
    const interval = setInterval(updateState, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const formatTime = (ms: number): string => {
    if (ms <= 0) return '0s';

    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Don't show if only showing when limited and not limited
  if (showOnlyWhenLimited && !isInCooldown && timeUntilReset === 0) {
    return null;
  }

  // Cooldown mode - prominent warning
  if (isInCooldown || timeUntilReset > 0) {
    return (
      <div
        className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/50 rounded-xl"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-orange-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-400" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-orange-300">
            Rate Limit Active
          </h4>
          <p className="text-xs text-orange-400/80 mt-0.5">
            Please wait before generating more infographics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/30">
          <Clock className="w-4 h-4 text-orange-400" aria-hidden="true" />
          <span className="text-sm font-mono font-semibold text-orange-300">
            {formatTime(timeUntilReset)}
          </span>
        </div>
      </div>
    );
  }

  // Normal mode - show remaining requests
  if (showRemaining) {
    const config = getRateLimiter().getConfig();
    const percentRemaining = (remaining / config.maxRequests) * 100;

    // Color based on remaining percentage
    const getColor = () => {
      if (percentRemaining > 50) return 'blue';
      if (percentRemaining > 25) return 'yellow';
      return 'orange';
    };

    const color = getColor();

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 bg-${color}-500/10 border border-${color}-500/30 rounded-lg`}
        role="status"
        aria-live="polite"
      >
        <div className={`w-2 h-2 rounded-full bg-${color}-400 animate-pulse`} aria-hidden="true"></div>
        <span className={`text-xs font-medium text-${color}-300`}>
          {remaining} / {config.maxRequests} requests available
        </span>
      </div>
    );
  }

  return null;
};

export default RateLimitIndicator;
