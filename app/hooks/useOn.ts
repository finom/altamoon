/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';

type EventName = string;

type Handler = (...args: any[]) => void;

const allHandlers: Record<EventName, Handler[]> = {};

export function trigger(eventName: EventName, ...args: any[]) {
  const handlers = allHandlers[eventName];

  if (handlers?.length) {
    handlers.forEach((h) => h(...args));
  }
}

export default function useOn(eventName: EventName, handler: Handler) {
  useEffect(() => {
    const handlers = allHandlers[eventName] ?? [];

    allHandlers[eventName] = handlers;

    allHandlers[eventName].push(handler);

    return () => {
      allHandlers[eventName] = allHandlers[eventName].filter((h) => h !== handler);
    };
  });
}
