import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyNumberProps {
  label?: string;
  onChange: (newValue: number) => void;
  value: number;
  min?: number;
  max?: number;
  size?: 'm' | 's';
  className?: string;
}

const PropertyNumber: React.FC<PropertyNumberProps> = ({ 
  label = '', 
  onChange, 
  value, 
  min = 0, 
  max = 20, 
  size = 'm',
  className 
}) => {
  const inputSizes = {
    m: 'w-16 h-16 text-3xl',
    s: 'w-12 h-12 text-2xl',
  };
  
  const labelMargin = size === 'm' ? 'mb-2' : 'mb-1';

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && (
        <label className={cn(
          "text-sm font-heading font-semibold uppercase tracking-wide text-aventurian-700 dark:text-aventurian-300",
          labelMargin
        )}>
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-8 w-8 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className={cn(
            "text-center font-heading font-bold border-2 border-aventurian-400 dark:border-aventurian-600",
            "focus:border-aventurian-600 dark:focus:border-aventurian-400",
            "bg-card",
            inputSizes[size]
          )}
        />
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-8 w-8 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PropertyNumber;