import { useState, useEffect } from 'react';

export function useIgnoreList() {
  const [ignoreList, setIgnoreList] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('ignoreList');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading ignore list from localStorage', e);
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('ignoreList', JSON.stringify(Array.from(ignoreList)));
  }, [ignoreList]);

  const addWord = (word: string) => {
    const cleaned = word.trim().toLowerCase();
    if (cleaned && !ignoreList.has(cleaned)) {
      setIgnoreList((prev) => {
        const next = new Set(prev);
        next.add(cleaned);
        return next;
      });
    }
  };

  const removeWord = (word: string) => {
    setIgnoreList((prev) => {
      const next = new Set(prev);
      next.delete(word);
      return next;
    });
  };

  const importList = (wordsArray: string[]) => {
    setIgnoreList((prev) => {
      const next = new Set(prev);
      wordsArray.forEach((w) => {
        const cleaned = w.trim().toLowerCase();
        if (cleaned) {
          next.add(cleaned);
        }
      });
      return next;
    });
  };

  return { ignoreList, addWord, removeWord, importList };
}
