"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Square, ListChecks, X, Eraser, CheckCircle2, AlertCircle, RefreshCw, Trophy, Lightbulb, Play, FastForward, Pause, Settings2, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { puzzles, Puzzle } from '@/lib/puzzles';
import { CSPSolver, Step, SolverOptions } from '@/lib/csp';

type GridState = Record<number, Record<string, string>>;

export default function ZebraPuzzle() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle>(puzzles[0]);
  const [gridState, setGridState] = useState<GridState>({});
  const [crossedClues, setCrossedClues] = useState<Set<number>>(new Set());
  const [activeCell, setActiveCell] = useState<{house: number, category: string} | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'error'>('playing');
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintTimeout, setHintTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // AI Solver State
  const [isAISolving, setIsAISolving] = useState(false);
  const [aiSteps, setAiSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [aiSpeed, setAiSpeed] = useState(500); // ms per step
  const [domains, setDomains] = useState<Record<string, number[]>>({});
  const [benchmarkStats, setBenchmarkStats] = useState<{ timeMs: number, steps: number, backtracks: number } | null>(null);
  const [solverOptions, setSolverOptions] = useState<SolverOptions>({
    forwardChecking: true,
    mrv: true,
    degree: true,
    lcv: true
  });

  const loadPuzzle = (puzzle: Puzzle) => {
    setCurrentPuzzle(puzzle);
    setGridState({});
    setCrossedClues(new Set());
    setActiveCell(null);
    setGameStatus('playing');
    setHintMessage(null);
    setIsAISolving(false);
    setAiSteps([]);
    setCurrentStepIndex(0);
    setDomains({});
    setBenchmarkStats(null);
  };

  const toggleClue = (index: number) => {
    const newSet = new Set(crossedClues);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCrossedClues(newSet);
  };

  const isGridFull = () => {
    for (let i = 0; i < currentPuzzle.houses; i++) {
      for (const cat of currentPuzzle.categories) {
        if (!gridState[i]?.[cat.name]) return false;
      }
    }
    return true;
  };

  const checkWin = () => {
    for (let i = 0; i < currentPuzzle.houses; i++) {
      for (const cat of currentPuzzle.categories) {
        if (gridState[i]?.[cat.name] !== currentPuzzle.solution[i][cat.name]) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (isGridFull()) {
      if (checkWin()) {
        setGameStatus('won');
      } else {
        setGameStatus('error');
      }
    } else {
      setGameStatus('playing');
    }
  }, [gridState, currentPuzzle]);

  const handleSelect = (val: string) => {
    if (!activeCell) return;
    setGridState(prev => ({
      ...prev,
      [activeCell.house]: {
        ...(prev[activeCell.house] || {}),
        [activeCell.category]: val
      }
    }));
    setActiveCell(null);
  };

  const handleHint = () => {
    if (gameStatus === 'won' || isAISolving) return;

    const incorrectCells: {house: number, category: string}[] = [];
    const emptyCells: {house: number, category: string}[] = [];

    for (let i = 0; i < currentPuzzle.houses; i++) {
      for (const cat of currentPuzzle.categories) {
        const currentVal = gridState[i]?.[cat.name];
        const correctVal = currentPuzzle.solution[i][cat.name];
        
        if (currentVal) {
          if (currentVal !== correctVal) {
            incorrectCells.push({ house: i, category: cat.name });
          }
        } else {
          emptyCells.push({ house: i, category: cat.name });
        }
      }
    }

    if (incorrectCells.length > 0) {
      const cell = incorrectCells[Math.floor(Math.random() * incorrectCells.length)];
      setGridState(prev => {
        const newState = { ...prev };
        if (newState[cell.house]) {
          const newHouse = { ...newState[cell.house] };
          delete newHouse[cell.category];
          newState[cell.house] = newHouse;
        }
        return newState;
      });
      setHintMessage(`Removed incorrect ${cell.category} from House ${cell.house + 1}.`);
    } else if (emptyCells.length > 0) {
      const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const correctVal = currentPuzzle.solution[cell.house][cell.category];
      setGridState(prev => ({
        ...prev,
        [cell.house]: {
          ...(prev[cell.house] || {}),
          [cell.category]: correctVal
        }
      }));
      setHintMessage(`House ${cell.house + 1}'s ${cell.category} is ${correctVal}.`);
    } else {
      setHintMessage("Grid is full! Check if you won.");
    }
    
    if (hintTimeout) clearTimeout(hintTimeout);
    setHintTimeout(setTimeout(() => setHintMessage(null), 5000));
  };

  const startAISolve = () => {
    setGridState({});
    setCrossedClues(new Set());
    setBenchmarkStats(null);
    
    // Small delay to allow state to clear before heavy computation
    setTimeout(() => {
      const solver = new CSPSolver(currentPuzzle);
      const startTime = performance.now();
      const steps = solver.solve(solverOptions);
      const endTime = performance.now();
      
      setBenchmarkStats({
        timeMs: endTime - startTime,
        steps: steps.length,
        backtracks: steps.filter(s => s.type === 'BACKTRACK').length
      });

      setAiSteps(steps);
      setCurrentStepIndex(0);
      setIsAISolving(true);
      setGameStatus('playing');
    }, 50);
  };

  const instantSolve = () => {
    setGridState({});
    setCrossedClues(new Set());
    setIsAISolving(false);
    setDomains({});
    setBenchmarkStats(null);
    
    setTimeout(() => {
      const solver = new CSPSolver(currentPuzzle);
      const startTime = performance.now();
      const steps = solver.solve(solverOptions);
      const endTime = performance.now();
      
      setBenchmarkStats({
        timeMs: endTime - startTime,
        steps: steps.length,
        backtracks: steps.filter(s => s.type === 'BACKTRACK').length
      });
      
      // Reconstruct final state instantly
      const finalState: GridState = {};
      steps.forEach(step => {
        if (step.type === 'ASSIGN' && step.variable && step.value !== undefined) {
          const category = currentPuzzle.categories.find(c => c.options.includes(step.variable!))?.name;
          if (category) {
            if (!finalState[step.value]) finalState[step.value] = {};
            finalState[step.value][category] = step.variable;
          }
        } else if (step.type === 'BACKTRACK' && step.variable && step.value !== undefined) {
          const category = currentPuzzle.categories.find(c => c.options.includes(step.variable!))?.name;
          if (category && finalState[step.value]) {
            delete finalState[step.value][category];
          }
        }
      });
      
      setGridState(finalState);
      setGameStatus('won');
      setHintMessage(`Solved instantly in ${(endTime - startTime).toFixed(2)}ms!`);
      if (hintTimeout) clearTimeout(hintTimeout);
      setHintTimeout(setTimeout(() => setHintMessage(null), 5000));
    }, 50);
  };

  const stopAISolve = () => {
    setIsAISolving(false);
    setHintMessage("AI Solver stopped.");
    if (hintTimeout) clearTimeout(hintTimeout);
    setHintTimeout(setTimeout(() => setHintMessage(null), 3000));
  };

  useEffect(() => {
    if (!isAISolving || aiSteps.length === 0 || currentStepIndex >= aiSteps.length) {
      if (isAISolving && currentStepIndex >= aiSteps.length) {
        setIsAISolving(false);
        setHintMessage("AI finished solving!");
        if (hintTimeout) clearTimeout(hintTimeout);
        setHintTimeout(setTimeout(() => setHintMessage(null), 5000));
      }
      return;
    }

    const timer = setTimeout(() => {
      const step = aiSteps[currentStepIndex];
      
      if (step.domains) {
        setDomains(step.domains);
      }

      if (step.type === 'ASSIGN' && step.variable && step.value !== undefined) {
        setGridState(prev => {
          const category = currentPuzzle.categories.find(c => c.options.includes(step.variable!))?.name;
          if (!category) return prev;
          return {
            ...prev,
            [step.value!]: {
              ...(prev[step.value!] || {}),
              [category]: step.variable!
            }
          };
        });
      } else if (step.type === 'BACKTRACK' && step.variable && step.value !== undefined) {
        setGridState(prev => {
          const category = currentPuzzle.categories.find(c => c.options.includes(step.variable!))?.name;
          if (!category) return prev;
          const newState = { ...prev };
          if (newState[step.value!]) {
            const newHouse = { ...newState[step.value!] };
            delete newHouse[category];
            newState[step.value!] = newHouse;
          }
          return newState;
        });
      }

      setHintMessage(`[${step.type}] ${step.message}`);
      setCurrentStepIndex(prev => prev + 1);
    }, aiSpeed);

    return () => clearTimeout(timer);
  }, [isAISolving, currentStepIndex, aiSteps, aiSpeed, currentPuzzle]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-900 font-sans selection:bg-indigo-200">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">Z</span>
            </div>
            <h1 className="text-xl font-bold text-stone-800 hidden sm:block">Zebra Puzzle</h1>
          </div>
          <div className="flex gap-2 p-1 bg-stone-100 rounded-xl">
            {puzzles.map(p => (
              <button
                key={p.id}
                onClick={() => loadPuzzle(p)}
                className={clsx(
                  "px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  currentPuzzle.id === p.id 
                    ? "bg-white text-indigo-700 shadow-sm ring-1 ring-stone-200/50" 
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                )}
              >
                {p.difficulty}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Grid & Status */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Status Banner */}
          <AnimatePresence mode="wait">
            {hintMessage && (
              <motion.div
                key="hint"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm"
              >
                <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                  <Lightbulb className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-indigo-800 font-bold text-lg">Hint</h3>
                  <p className="text-indigo-700 text-sm">{hintMessage}</p>
                </div>
              </motion.div>
            )}

            {gameStatus === 'won' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm"
              >
                <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-emerald-800 font-bold text-lg">Puzzle Solved!</h3>
                  <p className="text-emerald-600 text-sm">Congratulations! You have successfully solved {currentPuzzle.title}.</p>
                </div>
                <button 
                  onClick={() => loadPuzzle(currentPuzzle)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
                >
                  Play Again
                </button>
              </motion.div>
            )}
            
            {gameStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm"
              >
                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-amber-800 font-bold text-lg">Not quite right</h3>
                  <p className="text-amber-700 text-sm">The grid is full, but there are some mistakes. Review the clues and try adjusting your answers.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h2 className="text-xl font-bold text-stone-800">{currentPuzzle.title}</h2>
                <p className="text-sm text-stone-500 mt-1">Fill in the grid based on the clues.</p>
              </div>
              <div className="flex items-center gap-2">
                {!isAISolving ? (
                  <>
                    <button 
                      onClick={startAISolve}
                      className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-2 px-3 border border-indigo-200"
                      title="Watch AI Solve (CSP)"
                    >
                      <Play className="w-4 h-4" />
                      <span className="text-sm font-medium">AI Solve</span>
                    </button>
                    <button 
                      onClick={instantSolve}
                      className="p-2 text-fuchsia-600 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-xl transition-colors flex items-center gap-2 px-3 border border-fuchsia-200"
                      title="Instant Solve & Benchmark"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:block">Instant</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={stopAISolve}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 px-3 border border-red-200"
                    title="Stop AI"
                  >
                    <Pause className="w-4 h-4" />
                    <span className="text-sm font-medium">Stop AI</span>
                  </button>
                )}
                <button 
                  onClick={handleHint}
                  disabled={isAISolving}
                  className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center gap-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Get a Hint"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span className="text-sm font-medium">Hint</span>
                </button>
                <button 
                  onClick={() => {
                    setGridState({});
                    setCrossedClues(new Set());
                    setIsAISolving(false);
                    setDomains({});
                    setBenchmarkStats(null);
                  }}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                  title="Reset Puzzle"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* AI Settings Bar */}
            <div className="bg-stone-50 border-b border-stone-100 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 font-medium text-stone-700">
                  <Settings2 className="w-4 h-4" />
                  AI Algorithms:
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900">
                  <input 
                    type="checkbox" 
                    checked={solverOptions.forwardChecking} 
                    onChange={e => setSolverOptions(s => ({...s, forwardChecking: e.target.checked}))}
                    disabled={isAISolving}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Forward Checking
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900">
                  <input 
                    type="checkbox" 
                    checked={solverOptions.mrv} 
                    onChange={e => setSolverOptions(s => ({...s, mrv: e.target.checked}))}
                    disabled={isAISolving}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  MRV
                </label>
                <label className={clsx("flex items-center gap-1.5 cursor-pointer transition-opacity", !solverOptions.mrv ? "opacity-50" : "text-stone-600 hover:text-stone-900")}>
                  <input 
                    type="checkbox" 
                    checked={solverOptions.degree} 
                    onChange={e => setSolverOptions(s => ({...s, degree: e.target.checked}))}
                    disabled={isAISolving || !solverOptions.mrv}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Degree
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 hover:text-stone-900">
                  <input 
                    type="checkbox" 
                    checked={solverOptions.lcv} 
                    onChange={e => setSolverOptions(s => ({...s, lcv: e.target.checked}))}
                    disabled={isAISolving}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  LCV
                </label>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                {(isAISolving || benchmarkStats) && (
                  <div className="flex flex-wrap items-center gap-3 mr-4 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg font-mono text-xs border border-indigo-200">
                    {benchmarkStats && !isAISolving && (
                      <span title="Computation time">⏱ {benchmarkStats.timeMs.toFixed(2)}ms</span>
                    )}
                    <span title="Total steps">👣 {isAISolving ? `${currentStepIndex} / ${aiSteps.length}` : benchmarkStats?.steps} steps</span>
                    <span title="Backtracks" className="font-semibold text-red-600">
                      ↩️ {isAISolving ? aiSteps.slice(0, currentStepIndex).filter(s => s.type === 'BACKTRACK').length : benchmarkStats?.backtracks} backtracks
                    </span>
                  </div>
                )}
                <span className="font-medium text-stone-700">Speed:</span>
                <input 
                  type="range" 
                  min="10" 
                  max="1000" 
                  step="10" 
                  value={aiSpeed} 
                  onChange={e => setAiSpeed(Number(e.target.value))}
                  className="w-24 accent-indigo-600"
                />
                <span className="text-stone-500 font-mono w-12 text-right">{aiSpeed}ms</span>
              </div>
            </div>
            
            <div className="overflow-x-auto p-6">
              <table className="w-full text-left border-separate border-spacing-y-2 border-spacing-x-2 min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-2 w-32"></th>
                    {Array.from({length: currentPuzzle.houses}).map((_, i) => (
                      <th key={i} className="p-3 bg-stone-100 rounded-xl font-bold text-center text-stone-600 text-sm uppercase tracking-wider">
                        House {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentPuzzle.categories.map(cat => (
                    <tr key={cat.name}>
                      <td className="p-3 font-semibold text-stone-700 text-sm flex items-center h-14">
                        {cat.name}
                      </td>
                      {Array.from({length: currentPuzzle.houses}).map((_, i) => {
                        const val = gridState[i]?.[cat.name];
                        const isActive = activeCell?.house === i && activeCell?.category === cat.name;
                        
                        // Calculate domain for this cell if AI is solving
                        let domainOptions: string[] = [];
                        if (isAISolving && !val) {
                          domainOptions = cat.options.filter(opt => domains[opt]?.includes(i));
                        }

                        return (
                          <td key={i} className="p-0 h-14 relative">
                            <button
                              disabled={isAISolving}
                              onClick={() => setActiveCell({ house: i, category: cat.name })}
                              className={clsx(
                                "w-full h-full rounded-xl border-2 flex items-center justify-center text-sm font-medium transition-all",
                                val 
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-300" 
                                  : "bg-white border-stone-200 text-stone-400 hover:border-indigo-300 hover:bg-stone-50",
                                isActive && "ring-4 ring-indigo-100 border-indigo-500 bg-indigo-50",
                                isAISolving && !val && "cursor-default"
                              )}
                            >
                              {val ? val : (
                                isAISolving && domainOptions.length > 0 ? (
                                  <div className="flex flex-wrap justify-center gap-0.5 px-1 opacity-40 text-[9px] leading-tight max-h-full overflow-hidden">
                                    {domainOptions.map(opt => (
                                      <span key={opt}>{opt.substring(0, 3)}</span>
                                    ))}
                                  </div>
                                ) : "---"
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Clues */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 xl:sticky xl:top-24">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
              <ListChecks className="w-6 h-6 text-indigo-500" />
              Clues
            </h2>
            <ul className="space-y-2">
              {currentPuzzle.clues.map((clue, i) => {
                const isCrossed = crossedClues.has(i);
                return (
                  <li
                    key={i}
                    className={clsx(
                      "flex gap-3 cursor-pointer p-3 rounded-xl transition-all border-2",
                      isCrossed 
                        ? "bg-stone-50 border-transparent opacity-60" 
                        : "bg-white border-stone-100 hover:border-indigo-200 hover:bg-indigo-50/30 shadow-sm"
                    )}
                    onClick={() => toggleClue(i)}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCrossed ? (
                        <CheckSquare className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-300" />
                      )}
                    </div>
                    <span className={clsx("text-sm leading-relaxed", isCrossed ? "line-through text-stone-500" : "text-stone-700")}>
                      {clue}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </main>

      {/* Selection Panel */}
      <AnimatePresence>
        {activeCell && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40" 
              onClick={() => setActiveCell(null)} 
            />
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 pb-10 border-t border-stone-200 lg:bottom-auto lg:top-1/2 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-3xl lg:min-w-[480px] lg:pb-6"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-800">
                    House {activeCell.house + 1}
                  </h3>
                  <p className="text-sm text-stone-500 font-medium mt-1">Select {activeCell.category}</p>
                </div>
                <button onClick={() => setActiveCell(null)} className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-stone-600" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSelect('')}
                  className="p-4 rounded-2xl border-2 border-dashed border-stone-300 text-stone-500 hover:bg-stone-50 hover:border-stone-400 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <Eraser className="w-5 h-5" /> 
                  <span className="text-sm font-medium">Clear</span>
                </button>

                {currentPuzzle.categories.find(c => c.name === activeCell.category)?.options.map(opt => {
                  let usedInHouse = -1;
                  for (let i = 0; i < currentPuzzle.houses; i++) {
                    if (i !== activeCell.house && gridState[i]?.[activeCell.category] === opt) {
                      usedInHouse = i;
                      break;
                    }
                  }
                  const isUsed = usedInHouse !== -1;
                  const isSelected = gridState[activeCell.house]?.[activeCell.category] === opt;

                  return (
                    <button
                      key={opt}
                      disabled={isUsed}
                      onClick={() => handleSelect(opt)}
                      className={clsx(
                        "p-4 rounded-2xl border-2 text-sm font-medium transition-all flex flex-col items-center justify-center gap-1.5",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                          : isUsed
                            ? "border-stone-100 bg-stone-50 text-stone-400 opacity-60 cursor-not-allowed"
                            : "border-stone-200 bg-white text-stone-700 hover:border-indigo-300 hover:bg-stone-50 hover:shadow-sm"
                      )}
                    >
                      <span className={clsx("text-base", isUsed && "line-through")}>{opt}</span>
                      {isUsed && <span className="text-[11px] text-stone-400 font-normal bg-stone-200/50 px-2 py-0.5 rounded-full">in House {usedInHouse + 1}</span>}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-1" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
