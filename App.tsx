import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  Target, 
  Settings, 
  LogOut, 
  Sun, 
  Flame, 
  Sparkles,
  ChevronRight,
  PlusCircle,
  Trash2,
  Brain,
  Video,
  Play,
  Download,
  Key
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { User, Workout, Food, Goal, AppState, PageType } from './types.ts';
import { getGeminiAdvice } from './services/geminiService.ts';

// --- Sub-components ---

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-lg transition-transform hover:scale-[1.02]">
    <div className="flex items-center justify-between mb-4">
      <span className="text-gray-400 font-medium">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-gray-500 text-sm font-semibold">{unit}</span>
    </div>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bebas tracking-wider text-white mb-6 uppercase flex items-center gap-3">
    {children}
  </h2>
);

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fithub_pro');
    if (saved) return JSON.parse(saved);
    return {
      user: null,
      workouts: [],
      foods: [],
      goals: [],
      streak: 0,
      isDarkMode: true
    };
  });

  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [isAuthMode, setIsAuthMode] = useState<'login' | 'signup'>('login');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Video Generation States
  const [videoPrompt, setVideoPrompt] = useState('A cinematic shot of a dedicated athlete training in a futuristic high-tech gym, lens flare, intense atmosphere, 8k');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoadingStep, setVideoLoadingStep] = useState(0);
  const loadingSteps = [
    "Initializing Veo Neural Core...",
    "Calibrating Motivational Biometrics...",
    "Synthesizing High-Intensity Lighting...",
    "Rendering Cinematic Frames...",
    "Optimizing Performance Pixels...",
    "Finalizing Export..."
  ];

  // Persistence
  useEffect(() => {
    localStorage.setItem('fithub_pro', JSON.stringify(state));
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      user: {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        avatar: 'https://picsum.photos/seed/alex/100/100'
      }
    }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
    setAiAdvice(null);
  };

  const addItem = <T,>(listKey: keyof AppState, newItem: T) => {
    setState(prev => ({
      ...prev,
      [listKey]: [newItem, ...(prev[listKey] as any[])]
    }));
  };

  const removeItem = (listKey: keyof AppState, id: string) => {
    setState(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as any[]).filter(item => item.id !== id)
    }));
  };

  const fetchAiAdvice = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    const advice = await getGeminiAdvice(state.workouts, state.foods, state.goals);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  const generateMotivationalVideo = async () => {
    if (!(window as any).aistudio?.hasSelectedApiKey()) {
      await (window as any).aistudio?.openSelectKey();
    }

    setIsGeneratingVideo(true);
    setVideoUrl(null);
    setVideoLoadingStep(0);
    
    const stepInterval = setInterval(() => {
      setVideoLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 4000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: videoResolution,
          aspectRatio: videoAspect
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Video Generation Error:", error);
      alert("Failed to generate video.");
    } finally {
      clearInterval(stepInterval);
      setIsGeneratingVideo(false);
    }
  };

  const getChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      name: day,
      workouts: Math.floor(Math.random() * 5),
      calories: Math.floor(Math.random() * 2500)
    }));
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
        <div className="w-full max-w-md bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-10">
            <h1 className="text-6xl font-bebas text-indigo-500 tracking-tighter">FITHUB PRO</h1>
            <p className="text-gray-400 mt-2">Elite Fitness Intelligence</p>
          </div>
          <div className="flex bg-gray-800 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsAuthMode('login')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${isAuthMode === 'login' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsAuthMode('signup')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all ${isAuthMode === 'signup' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              defaultValue="demo@fithub.pro"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Email"
            />
            <input 
              type="password" 
              defaultValue="password123"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
            />
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]">
              Enter Command Center
            </button>
          </form>
          <p className="mt-8 text-center text-gray-500 text-sm italic">Demo Access Pre-filled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100 pb-20 lg:pb-0">
      <aside className="w-72 bg-gray-900 border-r border-gray-800 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-4xl font-bebas text-indigo-500 tracking-tighter">FITHUB PRO</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'workout', icon: Dumbbell, label: 'Workouts' },
            { id: 'nutrition', icon: Utensils, label: 'Nutrition' },
            { id: 'goals', icon: Target, label: 'Goals' },
            { id: 'ai-coach', icon: Brain, label: 'AI Coach' },
            { id: 'motivation', icon: Video, label: 'Motivational Studio' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as PageType)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activePage === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <item.icon size={22} className={activePage === item.id ? 'text-white' : 'text-gray-400'} />
              <span className="font-semibold">{item.label}</span>
              {activePage === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800/50 p-4 rounded-2xl flex items-center gap-4 mb-4">
            <img src={state.user.avatar} className="w-12 h-12 rounded-full border-2 border-indigo-500" alt="Avatar" />
            <div className="overflow-hidden">
              <p className="font-bold truncate">{state.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{state.user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-semibold">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full border border-orange-500/20">
              <Flame size={18} fill="currentColor" />
              <span className="font-bold">{state.streak} Day Streak</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full">
          {activePage === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionTitle><LayoutDashboard /> Command Dashboard</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Daily Calories" value={state.foods.reduce((acc, f) => acc + f.calories, 0)} unit="kcal" icon={Utensils} color="bg-emerald-500" />
                <StatCard title="Total Workouts" value={state.workouts.length} unit="sessions" icon={Dumbbell} color="bg-blue-500" />
                <StatCard title="Active Goals" value={state.goals.length} unit="targets" icon={Target} color="bg-indigo-500" />
                <StatCard title="Focus Score" value="84" unit="%" icon={Sparkles} color="bg-purple-500" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 min-w-0 bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                  <h3 className="text-xl font-bold mb-6 text-white">Performance Velocity</h3>
                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()}>
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="workouts" radius={[6, 6, 0, 0]}>
                          {getChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 4 ? '#6366f1' : '#374151'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 p-8 rounded-3xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                      <Brain className="text-indigo-400" /> AI Coach Advice
                    </h3>
                    <p className="text-gray-300 text-sm mb-6">Get personalized recommendations powered by Gemini.</p>
                    <button onClick={() => { setActivePage('ai-coach'); fetchAiAdvice(); }} className="bg-white text-indigo-950 font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-indigo-50 transition-all">
                      Analyze My Data
                    </button>
                  </div>
                  <Brain size={180} className="absolute -bottom-10 -right-10 text-white/5 group-hover:rotate-12 transition-transform duration-500" />
                </div>
              </div>
            </div>
          )}

          {activePage === 'motivation' && (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
              <div className="flex items-center justify-between">
                <SectionTitle><Video /> Motivational Studio</SectionTitle>
                <button onClick={() => (window as any).aistudio?.openSelectKey()} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-xs font-bold px-4 py-2 rounded-xl border border-gray-700 transition-all">
                  <Key size={14} /> Update API Key
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4">
                    <h3 className="text-lg font-bold text-white">Creative Prompt</h3>
                    <textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none" />
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Resolution</span>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                          {(['720p', '1080p'] as const).map(res => (
                            <button key={res} onClick={() => setVideoResolution(res)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${videoResolution === res ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{res}</button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Aspect Ratio</span>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                          {(['16:9', '9:16'] as const).map(ratio => (
                            <button key={ratio} onClick={() => setVideoAspect(ratio)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${videoAspect === ratio ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>{ratio}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button onClick={generateMotivationalVideo} disabled={isGeneratingVideo} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                      {isGeneratingVideo ? <Sparkles className="animate-spin" /> : <Play size={20} />}
                      {isGeneratingVideo ? 'Generating Brilliance...' : 'Generate Video'}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center">Requires <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Paid API Key</a></p>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-black border border-gray-800 rounded-[40px] overflow-hidden relative min-h-[400px] flex items-center justify-center">
                  {!isGeneratingVideo && !videoUrl && (
                    <div className="text-center p-12">
                      <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                        <Video size={32} className="text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Vision Theater</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">High-fidelity motivational content appears here once generated.</p>
                    </div>
                  )}
                  {isGeneratingVideo && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={32} />
                      </div>
                      <p className="text-xl font-bebas tracking-widest text-white animate-pulse">{loadingSteps[videoLoadingStep]}</p>
                    </div>
                  )}
                  {videoUrl && (
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <video src={videoUrl} controls className={`max-w-full max-h-[70vh] rounded-2xl shadow-2xl border border-gray-800 ${videoAspect === '9:16' ? 'h-full aspect-[9/16]' : 'w-full aspect-video'}`} />
                      <div className="absolute top-8 right-8">
                        <a href={videoUrl} download="fithub-motivation.mp4" className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20"><Download size={20} /></a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePage === 'workout' && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <SectionTitle><Dumbbell /> Workout Ledger</SectionTitle>
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <input id="ex-name" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3" placeholder="Exercise Name" />
                  <input id="ex-reps" type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3" placeholder="Reps" />
                  <input id="ex-weight" type="number" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3" placeholder="Weight (kg)" />
                </div>
                <button onClick={() => {
                  const name = (document.getElementById('ex-name') as HTMLInputElement).value;
                  const reps = parseInt((document.getElementById('ex-reps') as HTMLInputElement).value);
                  const weight = parseInt((document.getElementById('ex-weight') as HTMLInputElement).value);
                  if (name && reps) {
                    addItem<Workout>('workouts', { id: Date.now().toString(), name, reps, weight, date: new Date().toISOString() });
                    (document.getElementById('ex-name') as HTMLInputElement).value = '';
                    (document.getElementById('ex-reps') as HTMLInputElement).value = '';
                    (document.getElementById('ex-weight') as HTMLInputElement).value = '';
                  }
                }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <PlusCircle size={20} /> Log Performance Data
                </button>
              </div>
              <div className="space-y-4">
                {state.workouts.map(w => (
                  <div key={w.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">{w.name}</h4>
                      <p className="text-sm text-gray-400">{new Date(w.date).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-xl font-bebas tracking-widest text-indigo-400">{w.weight} KG / {w.reps} REPS</p>
                      <button onClick={() => removeItem('workouts', w.id)} className="p-3 text-gray-600 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'ai-coach' && (
            <div className="space-y-8 animate-in zoom-in duration-500 max-w-4xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-pulse">
                  <Brain size={48} className="text-white" />
                </div>
                <h1 className="text-4xl font-bebas tracking-tight">GEMINI SMART COACH</h1>
                <p className="text-gray-400">Deep neural analysis of your fitness biomechanics.</p>
              </div>
              {!aiAdvice && !isAiLoading ? (
                <div className="bg-gray-900 border-2 border-dashed border-gray-800 p-12 rounded-[40px] text-center">
                  <Sparkles size={40} className="text-indigo-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Ready for analysis?</h2>
                  <button onClick={fetchAiAdvice} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl shadow-xl transition-all">
                    Generate Insights
                  </button>
                </div>
              ) : isAiLoading ? (
                <div className="bg-gray-900 border border-gray-800 p-12 rounded-[40px] text-center space-y-6">
                  <p className="text-indigo-400 font-medium animate-pulse">Gemini is crunching the numbers...</p>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 p-10 rounded-[40px] shadow-2xl">
                  <div className="prose prose-invert max-w-none whitespace-pre-wrap text-gray-200 leading-relaxed text-lg">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>
          )}

          {activePage === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <SectionTitle><Settings /> Global Configuration</SectionTitle>
              <div className="bg-gray-900 border border-gray-800 rounded-3xl divide-y divide-gray-800 overflow-hidden">
                <div className="p-8 flex items-center justify-between hover:bg-gray-800/30 transition-all">
                  <div>
                    <h4 className="text-lg font-bold text-white">Export Bio-Data</h4>
                    <p className="text-sm text-gray-500">Download your history as JSON.</p>
                  </div>
                  <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl">Export</button>
                </div>
                <div className="p-8 flex items-center justify-between hover:bg-red-500/5 transition-all">
                  <div>
                    <h4 className="text-lg font-bold text-red-400">Purge Data</h4>
                    <p className="text-sm text-gray-500">Delete all session data.</p>
                  </div>
                  <button onClick={() => {
                    if(confirm('Wipe all data?')) {
                      setState({ user: null, workouts: [], foods: [], goals: [], streak: 0, isDarkMode: true });
                      localStorage.removeItem('fithub_pro');
                    }
                  }} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold px-6 py-2 rounded-xl border border-red-500/20">Purge</button>
                </div>
              </div>
            </div>
          )}

          {(activePage === 'nutrition' || activePage === 'goals') && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <Settings size={32} className="text-gray-600 animate-spin" />
              <h2 className="text-2xl font-bold">Optimization in Progress</h2>
            </div>
          )}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50">
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'workout', icon: Dumbbell },
          { id: 'ai-coach', icon: Brain },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id as PageType)}
            className={`p-3 rounded-2xl transition-all ${activePage === item.id ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}
          >
            <item.icon size={24} />
          </button>
        ))}
      </nav>
    </div>
  );
}