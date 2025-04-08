import { useEffect, useRef, type RefObject } from 'react';

/**
 * Custom hook that automatically scrolls to the bottom of a container
 * when the number of messages changes.
 *
 * @param messagesLength - The number of messages in the container
 * @returns A ref object that should be attached to the last element in the container
 *
 * Usage:
 * 1. Create a ref: const endRef = useScrollToBottom<HTMLDivElement>(messages.length);
 * 2. Attach the ref to the last element in your container
 */
export function useScrollToBottom<T extends HTMLElement>(
  messagesLength: number,
): RefObject<T> {
  const endRef = useRef<T>(null);

  useEffect(() => {
    const end = endRef.current;

    if (end) {
      end.scrollIntoView({ behavior: 'instant', block: 'end' });
    }
  }, [messagesLength]);

  return endRef;
}
