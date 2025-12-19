
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Plus, Minus, X, Divide, Equal, Delete, History, 
  BrainCircuit, Sparkles, Trash2, ChevronRight, Calculator as CalcIcon,
  RotateCcw, Info, MessageSquare
} from 'lucide-react';
import { CalcMode, Calculation, AIResponse } from './types';
import { solveMathProblem, explainConcept } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [mode, setMode] = useState<CalcMode>(CalcMode.BASIC);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIResponse | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleInput = (val: string) => {
    setInput(prev => prev + val);
    setAiAnalysis(null);
    setAiExplanation(null);
  };

  const clear = () => {
    setInput('');
    setResult('');
    setAiAnalysis(null);
    setAiExplanation(null);
  };

  const backspace = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const calculate = useCallback(() => {
    try {
      if (!input) return;
      // Sanitize and evaluate basic math
      const sanitizedInput = input.replace(/×/g, '*').replace(/÷/g, '/');
      // Using direct eval for this "simple" calculator demo (in production use a math parser)
      // Note: We wrap it in a function to keep the scope clean
      const evalResult = Function(`'use strict'; return (${sanitizedInput})`)();
      const finalResult = String(evalResult);
      
      setResult(finalResult);
      
      const newCalc: Calculation = {
        id: Math.random().toString(36).substr(2, 9),
        expression: input,
        result: finalResult,
        timestamp: Date.now()
      };
      setHistory(prev => [newCalc, ...prev].slice(0, 50));
    } catch (err) {
      setResult('Error');
    }
  }, [input]);

  const handleAiSolve = async () => {
    if (!input) return;
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const solution = await solveMathProblem(input);
      setAiAnalysis(solution);
      setResult(solution.solution);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiExplain = async () => {
    if (!input && !result) return;
    setIsAiLoading(true);
    try {
      const explanation = await explainConcept(input || result);
      setAiExplanation(explanation);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'text-rose-400 font-bold' },
    { label: '(', onClick: () => handleInput('('), className: 'text-emerald-400' },
    { label: ')', onClick: () => handleInput(')'), className: 'text-emerald-400' },
    { label: '÷', onClick: () => handleInput('÷'), className: 'text-blue-400' },
    
    { label: '7', onClick: () => handleInput('7') },
    { label: '8', onClick: () => handleInput('8') },
    { label: '9', onClick: () => handleInput('9') },
    { label: '×', onClick: () => handleInput('×'), className: 'text-blue-400' },
    
    { label: '4', onClick: () => handleInput('4') },
    { label: '5', onClick: () => handleInput('5') },
    { label: '6', onClick: () => handleInput('6') },
    { label: '-', onClick: () => handleInput('-'), className: 'text-blue-400' },
    
    { label: '1', onClick: () => handleInput('1') },
    { label: '2', onClick: () => handleInput('2') },
    { label: '3', onClick: () => handleInput('3') },
    { label: '+', onClick: () => handleInput('+'), className: 'text-blue-400' },
    
    { label: '0', onClick: () => handleInput('0'), className: 'col-span-1' },
    { label: '.', onClick: () => handleInput('.') },
    { label: 'DEL', onClick: backspace, className: 'text-slate-400' },
    { label: '=', onClick: calculate, className: 'bg-blue-600 hover:bg-blue-500 text-white rounded-xl' },
  ];

  const scientificButtons = [
    { label: 'sin', onClick: () => handleInput('Math.sin(') },
    { label: 'cos', onClick: () => handleInput('Math.cos(') },
    { label: 'tan', onClick: () => handleInput('Math.tan(') },
    { label: 'log', onClick: () => handleInput('Math.log10(') },
    { label: 'π', onClick: () => handleInput('Math.PI') },
    { label: 'e', onClick: () => handleInput('Math.E') },
    { label: '^', onClick: () => handleInput('**') },
    { label: '√', onClick: () => handleInput('Math.sqrt(') },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center bg-slate-950">
      {/* Background Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: History (Visible on Desktop) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col glass rounded-3xl p-6 h-[700px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              History
            </h2>
            <button 
              onClick={() => setHistory([])}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-500 hover:text-rose-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {history.length === 0 ? (
              <div className="text-slate-500 text-center py-10 italic">No calculations yet</div>
            ) : (
              history.map(calc => (
                <div 
                  key={calc.id} 
                  className="group p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-all border border-transparent hover:border-slate-700"
                  onClick={() => {
                    setInput(calc.expression);
                    setResult(calc.result);
                  }}
                >
                  <div className="text-sm text-slate-400 truncate">{calc.expression}</div>
                  <div className="text-lg font-medium text-blue-300">= {calc.result}</div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* Center: Main Calculator */}
        <div className="lg:col-span-5 flex flex-col glass rounded-3xl overflow-hidden shadow-2xl border-white/5">
          {/* Display Area */}
          <div className="bg-slate-900/50 p-8 flex flex-col items-end justify-end min-h-[220px] relative overflow-hidden">
            <div className="absolute top-4 left-4 flex gap-2">
              <button 
                onClick={() => setMode(CalcMode.BASIC)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${mode === CalcMode.BASIC ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Basic
              </button>
              <button 
                onClick={() => setMode(CalcMode.SCIENTIFIC)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${mode === CalcMode.SCIENTIFIC ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                Scientific
              </button>
            </div>
            
            <div className="text-xl text-slate-500 mb-2 math-font break-all text-right w-full">
              {input || '0'}
            </div>
            <div className="text-5xl font-bold text-white math-font break-all text-right w-full">
              {result ? `= ${result}` : ''}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-6 bg-slate-800/20">
            {mode === CalcMode.SCIENTIFIC && (
              <div className="grid grid-cols-4 gap-3 mb-4 animate-in fade-in duration-500">
                {scientificButtons.map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.onClick}
                    className="calc-button h-12 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-sm font-medium border border-white/5"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {buttons.map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.onClick}
                  className={`calc-button h-16 flex items-center justify-center rounded-2xl text-xl font-medium border border-white/5 ${btn.className || 'bg-slate-800/40 hover:bg-slate-700/60 text-white'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* AI Controls */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAiSolve}
                disabled={isAiLoading || !input}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
              >
                {isAiLoading ? (
                  <RotateCcw className="w-5 h-5 animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                AI Solve
              </button>
              <button
                onClick={handleAiExplain}
                disabled={isAiLoading || (!input && !result)}
                className="h-14 w-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-blue-400 flex items-center justify-center border border-white/5 transition-all shadow-md"
                title="Explain concept"
              >
                <Info className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: AI Analysis & Insights */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="glass rounded-3xl p-6 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">AI Assistant</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {isAiLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <BrainCircuit className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="text-slate-400 animate-pulse font-medium">Analyzing problem...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 mb-2">Conceptual Summary</h3>
                    <p className="text-slate-200 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                      {aiAnalysis.explanation}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Step-by-Step Solution</h3>
                    <div className="space-y-4">
                      {aiAnalysis.steps.map((step, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <div className="pt-1 text-slate-300 leading-relaxed border-b border-slate-800/50 pb-4 flex-1">
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Deep Explanation</h3>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-mono text-sm">
                    {aiExplanation}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
                  <MessageSquare className="w-16 h-16 text-slate-500 mb-2" />
                  <p className="text-lg font-medium text-slate-400">Ready for complexity</p>
                  <p className="text-sm text-slate-500 max-w-[200px]">Enter a formula and click AI Solve for detailed breakdown.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="glass rounded-3xl p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <h3 className="flex items-center gap-2 font-semibold text-blue-300 mb-3">
              <CalcIcon className="w-4 h-4" /> Pro Tip
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use the Scientific mode to access trig functions and powers. The AI can handle word problems too—just type them out!
            </p>
          </div>
        </div>
      </div>

      {/* Footer / Info */}
      <footer className="mt-12 text-slate-600 text-sm flex items-center gap-6">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> System Active</span>
        <span className="flex items-center gap-1 hover:text-blue-400 cursor-pointer transition-colors"><Info className="w-4 h-4" /> MathMind Documentation</span>
        <span className="hidden md:inline">Powered by Gemini 3 Flash</span>
      </footer>
    </div>
  );
};

export default App;
