import React, { useState, useRef, useEffect } from 'react';
import { Settings, Upload, Copy, Download, Moon, Sun, X, Check, Trash2 } from 'lucide-react';
import { useIgnoreList } from './hooks/useIgnoreList';
import { extractUniqueWords, parseFileText, downloadTextFile } from './utils/textLogic';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const [inputText, setInputText] = useState('');
  const [uniqueWords, setUniqueWords] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newIgnoreWord, setNewIgnoreWord] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ignoreListFileInputRef = useRef<HTMLInputElement>(null);

  const { ignoreList, addWord, removeWord, importList } = useIgnoreList();

  useEffect(() => {
    // Initial theme setup based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleExtract = () => {
    if (!inputText.trim()) {
      setUniqueWords([]);
      return;
    }
    const extracted = extractUniqueWords(inputText, ignoreList);
    setUniqueWords(extracted);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await parseFileText(file);
        setInputText(text);
      } catch (err) {
        console.error("Error reading file", err);
        alert("Failed to read file.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = () => {
    if (uniqueWords.length === 0) return;
    navigator.clipboard.writeText(uniqueWords.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    if (uniqueWords.length === 0) return;
    downloadTextFile(uniqueWords.join('\n'), 'unique-words.txt');
  };

  const handleExportCsv = () => {
    if (uniqueWords.length === 0) return;
    // Simple CSV: one column named "Word"
    const csvContent = 'Word\n' + uniqueWords.map(w => `"${w.replace(/"/g, '""')}"`).join('\n');
    downloadTextFile(csvContent, 'unique-words.csv');
  };

  const handleAddIgnoreWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIgnoreWord.trim()) {
      addWord(newIgnoreWord.trim());
      setNewIgnoreWord('');
    }
  };

  const handleIgnoreListImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const text = await parseFileText(file);
        // split by comma or newline for CSV/TXT
        const words = text.split(/[\n,]+/);
        importList(words);
      } catch (err) {
        console.error("Error reading ignore list file", err);
        alert("Failed to import ignore list.");
      }
    }
    if (ignoreListFileInputRef.current) ignoreListFileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col relative overflow-hidden font-sans transition-colors duration-500">
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen transition-opacity duration-500">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-l from-purple-500 to-pink-500 blur-[120px] animate-pulse" style={{ animationDelay: '2s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6 sm:space-y-8">

        {/* Header */}
        <header className="flex justify-between items-center glass-panel p-4 sm:p-6 shadow-sm border border-white/40 dark:border-white/10 rounded-3xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
              <span className="font-bold text-xl">W</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">
              Unique Words
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 sm:p-3 rounded-2xl bg-white/50 dark:bg-black/40 hover:bg-white/70 dark:hover:bg-black/60 backdrop-blur-md transition-all active:scale-95 text-slate-700 dark:text-slate-300 shadow-sm border border-white/50 dark:border-white/10"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:p-3 rounded-2xl bg-white/50 dark:bg-black/40 hover:bg-white/70 dark:hover:bg-black/60 backdrop-blur-md transition-all active:scale-95 text-slate-700 dark:text-slate-300 shadow-sm border border-white/50 dark:border-white/10"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Input Section */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 min-h-[500px]">

          <div className="glass-panel p-6 flex flex-col space-y-4 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">Input Text</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 text-sm px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
              >
                <Upload size={16} />
                <span>Upload File</span>
              </button>
              <input
                type="file"
                accept=".txt,.csv,.md"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </div>

            <textarea
              className="flex-1 w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Paste your text here or upload a .txt, .csv, or .md file..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              onClick={handleExtract}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98]"
            >
              Extract Unique Words
            </button>
          </div>

          {/* Results Section */}
          <div className="glass-panel p-6 flex flex-col space-y-4 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg relative">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
                Results <span className="text-sm font-normal text-slate-500 ml-2">({uniqueWords.length})</span>
              </h2>
              {uniqueWords.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <button
                    onClick={handleExportTxt}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    title="Download .TXT"
                  >
                    <span className="text-xs font-bold leading-none select-none px-1">TXT</span>
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center justify-center"
                    title="Download .CSV"
                  >
                     <Download size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 w-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 overflow-y-auto">
              {uniqueWords.length > 0 ? (
                <div className="flex flex-wrap gap-2 content-start">
                  {uniqueWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center">
                  Extracted unique words will appear here.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal - Ignore List */}
      <div
        className={cx(
          "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300",
          isSettingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSettingsOpen(false)}></div>

        <div
          className={cx(
            "relative w-full max-w-lg glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh]",
            isSettingsOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
          )}
        >
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold mb-2 text-slate-800 dark:text-slate-100">Ignore List</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Words listed here will be excluded from the unique words extraction.
          </p>

          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => ignoreListFileInputRef.current?.click()}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Upload size={16} />
              <span>Import CSV/TXT</span>
            </button>
            <input
              type="file"
              accept=".txt,.csv"
              className="hidden"
              ref={ignoreListFileInputRef}
              onChange={handleIgnoreListImport}
            />
          </div>

          <form onSubmit={handleAddIgnoreWord} className="flex space-x-2 mb-6">
            <input
              type="text"
              placeholder="Add word to ignore..."
              value={newIgnoreWord}
              onChange={(e) => setNewIgnoreWord(e.target.value)}
              className="flex-1 bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newIgnoreWord.trim()}
              className="px-6 py-3 rounded-2xl bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-medium disabled:opacity-50 transition-opacity"
            >
              Add
            </button>
          </form>

          <div className="flex-1 overflow-y-auto bg-white/30 dark:bg-black/20 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            {ignoreList.size > 0 ? (
              <ul className="space-y-2">
                {Array.from(ignoreList).map(word => (
                  <li key={word} className="flex justify-between items-center px-4 py-2 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-sm text-sm text-slate-700 dark:text-slate-300">
                    <span>{word}</span>
                    <button
                      onClick={() => removeWord(word)}
                      className="text-red-400 hover:text-red-500 p-1"
                      aria-label="Remove word"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm text-center">
                  Ignore list is empty.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;