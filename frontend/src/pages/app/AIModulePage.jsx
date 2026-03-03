import { useState } from 'react';
import { mockAiHistory } from '../../data/mockData';

const promptSuggestions = [
  'Generate a Pomodoro plan for my exam week',
  'Explain the Pythagorean theorem with examples',
  'Create MCQs from my biology chapter notes',
];

export default function AIModulePage() {
  const [history, setHistory] = useState(mockAiHistory);
  const [prompt, setPrompt] = useState('');

  const submitPrompt = () => {
    if (!prompt.trim()) return;
    setHistory((prev) => [{ id: Date.now(), prompt, createdAt: new Date().toISOString() }, ...prev]);
    setPrompt('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-4">
        <h3 className="text-lg font-semibold">AI Study Assistant</h3>
        <textarea className="mt-3 min-h-28 w-full rounded-xl border p-3" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask AI to summarize, quiz, or plan your study..." />
        <button onClick={submitPrompt} className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-white">Submit Prompt</button>
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">Prompt suggestions</p>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((item) => (
              <button key={item} onClick={() => setPrompt(item)} className="rounded-full bg-slate-100 px-3 py-1 text-xs hover:bg-slate-200">{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4">
        <h3 className="mb-3 text-lg font-semibold">Previous Queries</h3>
        <ul className="space-y-2 text-sm">
          {history.map((item) => (
            <li key={item.id} className="rounded-xl bg-slate-50 p-3">
              <p>{item.prompt}</p>
              <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
