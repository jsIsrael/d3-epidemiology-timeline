import * as React from 'react';
import parse from 'date-fns/parse';

export function assertNoneNull<T>(v: T): asserts v is NonNullable<T> {
  if (v === undefined || v === null) {
    throw new Error("assertNoneNull");
  }
}

export function parseAdHocDate(dateStr: string): Date {
  return parse(dateStr, "dd/MM/yyyy", 0);
}

// Hook
export function useDebounce<T>(value: T, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class.
  // We use it to store the setTimeout ID so that we can cancel it on effect cleanup.
  const handler = React.useRef<any>();

  React.useEffect(
    () => {
      // Update debounced value after delay
      handler.current = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler.current);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
