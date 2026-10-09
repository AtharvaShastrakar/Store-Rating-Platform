import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  size = 'md',
  onChange,
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.floor(currentDisplayRating);
        const isHalf =
          !isFilled &&
          starValue - currentDisplayRating > 0 &&
          starValue - currentDisplayRating < 1;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive || disabled}
            onClick={() => interactive && onChange && onChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(null)}
            className={`transition-transform duration-150 ${
              interactive && !disabled ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default'
            }`}
          >
            <Star
              className={`${starSizes[size]} ${
                isFilled || isHalf
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-700 text-slate-600'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
