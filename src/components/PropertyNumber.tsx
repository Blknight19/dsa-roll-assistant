import React, { useEffect, useId, useRef } from 'react';
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

const REPEAT_DELAY_MS = 400;
const REPEAT_INTERVAL_MS = 80;

const PropertyNumber: React.FC<PropertyNumberProps> = ({
  label = '',
  onChange,
  value,
  min = 0,
  max = 20,
  size = 'm',
  className
}) => {
  const inputId = useId();

  // Aktuellen Wert für die Auto-Repeat-Callbacks frisch halten
  const valueRef = useRef(value);
  valueRef.current = value;

  const repeatTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const repeatInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  const inputSizes = {
    m: 'w-16 h-16 text-3xl',
    s: 'w-12 h-12 text-2xl',
  };

  const labelMargin = size === 'm' ? 'mb-2' : 'mb-1';

  const step = (delta: number) => {
    const next = Math.min(max, Math.max(min, valueRef.current + delta));
    if (next !== valueRef.current) onChange(next);
  };

  const stopRepeat = () => {
    clearTimeout(repeatTimeout.current);
    clearInterval(repeatInterval.current);
  };

  const startRepeat = (delta: number) => {
    stopRepeat();
    step(delta);
    // Der Button kann am Limit disabled werden und feuert dann kein
    // pointerup mehr — deshalb global auf das Loslassen hören.
    window.addEventListener('pointerup', stopRepeat, { once: true });
    repeatTimeout.current = setTimeout(() => {
      repeatInterval.current = setInterval(() => step(delta), REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  };

  useEffect(() => stopRepeat, []);

  const handleInputChange = (raw: string) => {
    const parsed = Number(raw);
    if (raw === '' || Number.isNaN(parsed)) return;
    onChange(Math.min(max, Math.max(min, parsed)));
  };

  const stepperProps = (delta: number) => ({
    // Klick nur für Tastatur (detail === 0); Pointer läuft über pointerdown + Auto-Repeat
    onClick: (e: React.MouseEvent) => { if (e.detail === 0) step(delta); },
    onPointerDown: () => startRepeat(delta),
    onPointerUp: stopRepeat,
    onPointerLeave: stopRepeat,
    onPointerCancel: stopRepeat,
  });

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'text-sm font-heading font-semibold uppercase tracking-wide text-aventurian-700 dark:text-aventurian-300',
            labelMargin
          )}
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value <= min}
          className="h-11 w-11 rounded-full"
          aria-label={`${label || 'Wert'} verringern`}
          {...stepperProps(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          id={inputId}
          type="number"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          min={min}
          max={max}
          aria-label={label || undefined}
          className={cn(
            'text-center font-heading font-bold border-2 border-aventurian-400 dark:border-aventurian-600',
            'focus:border-aventurian-600 dark:focus:border-aventurian-400',
            'bg-card',
            inputSizes[size]
          )}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={value >= max}
          className="h-11 w-11 rounded-full"
          aria-label={`${label || 'Wert'} erhöhen`}
          {...stepperProps(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PropertyNumber;
