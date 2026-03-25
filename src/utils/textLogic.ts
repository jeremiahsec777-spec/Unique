export const extractUniqueWords = (text: string, ignoreList: Set<string>): string[] => {
  // 1. Remove all punctuation and numbers, keeping only alphabetical characters and spaces
  // This regex replaces anything that is NOT a letter (in any language/unicode) or a space with a space.
  // We use \p{L} to match any kind of letter from any language.
  const cleanedText = text.replace(/[^\p{L}\s]/gu, ' ');

  // 2. Convert to lowercase and split by whitespace
  const words = cleanedText.toLowerCase().split(/\s+/);

  // 3. Filter out empty strings, and words in the ignoreList
  const uniqueWordsSet = new Set<string>();

  for (const word of words) {
    if (word && !ignoreList.has(word)) {
      uniqueWordsSet.add(word);
    }
  }

  // 4. Return as a sorted array
  return Array.from(uniqueWordsSet).sort();
};

export const parseFileText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
