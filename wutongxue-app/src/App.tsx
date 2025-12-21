import { ScenarioPlayer } from './components/ScenarioPlayer';
import { BookOpen, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-brand-100 selection:text-brand-900">
      
      {/* Header */}
      <header className="h-16 border-b border-stone-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-800 rounded flex items-center justify-center text-white">
            <BookOpen size={18} strokeWidth={2.5} />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-brand-900">NoPainLearn</span>
        </div>
        
        <div className="flex items-center space-x-6 text-sm font-medium text-stone-500">
          <button className="hover:text-brand-800 transition-colors">Library</button>
          <button className="hover:text-brand-800 transition-colors">Create</button>
          <div className="h-4 w-px bg-stone-300"></div>
          <button className="flex items-center space-x-1 text-brand-800 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
            <Sparkles size={14} />
            <span>AI Enhanced</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        <ScenarioPlayer />
      </main>

    </div>
  );
}

export default App;
