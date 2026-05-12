"use client";

import { useEffect, useState } from "react";

export function useLocalHistory(key: string) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setItems(JSON.parse(raw));
  }, [key]);

  const addItem = (value: string) => {
    const next = [value, ...items.filter((item) => item !== value)].slice(0, 8);
    setItems(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return { items, addItem };
}
