'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectDropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  ({ className, label, options, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <select
          className={cn(
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="" className="dark:bg-gray-700">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="dark:bg-gray-700">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

SelectDropdown.displayName = 'SelectDropdown';

export { SelectDropdown };
