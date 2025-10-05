import React from "react";

interface PropertyNumberProps {
  label: string;
  onChange: (newValue: number) => void;
  value: number;
  min?: number;
  max?: number;
  size?: 'm' | 's'
}

const PropertyNumber: React.FC<PropertyNumberProps> = ({ label, onChange, value, min = 0, max = 20, size = 'm' }) => {
  const inputSizes= size==='m' ? 'w-16 h-16 text-3xl':'w-12 h-12 text-2xl';
  const labelMargin = size ==='m' ? 'mb-1' : 'mb-3'
  return (
    <div className="flex flex-col items-center">
      <label className={labelMargin}>{label}</label>
      <input 
      className={`px-3 py-2 rounded-md bg-white text-black dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-dsaBlue text-center ${inputSizes}`}
      type="number" 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
    />
    </div>
  );
};

export default PropertyNumber;
