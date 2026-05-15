/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Send, 
  FileText, 
  MoreVertical, 
  BookOpen,
  Paperclip,
  User,
  Bot,
  Search,
  Globe,
  Zap,
  ArrowRight,
  Settings,
  Share2,
  BarChart2,
  Grid,
  Layout,
  Upload,
  Wand2,
  FilePlus,
  Mic2,
  Presentation,
  Video,
  Network,
  ClipboardList,
  CreditCard,
  HelpCircle,
  Info,
  Table,
  Pin,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- KONFIGURATION ---
const N8N_BASE_URL = "https://notebooklm.app.n8n.cloud";
const LOGO_IMAGE_URL = "https://www.freelogovectors.net/wp-content/uploads/2025/06/notebooklm_logo-freelogovectors.net_.png"; // Hier den Link zum Logo-Bild einfügen

export default function App() {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [sources, setSources] = useState<{ id: string; name: string }[]>([]);
  const [isDevMode, setIsDevMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getWebhookUrl = (type: 'chat' | 'upload') => {
    const prefix = isDevMode ? "/webhook-test/" : "/webhook/";
    const path = type === 'chat' ? "chat-input" : "file-upload";
    return `${N8N_BASE_URL}${prefix}${path}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);

    try {
      // --- N8N CHAT WEBHOOK CALL ---
      const response = await fetch(getWebhookUrl('chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          history: messages,
          sources: sources.map(s => s.name)
        })
      });

      if (!response.ok) throw new Error('Webhook Fehler');

      const data = await response.json();
      
      // Flexible Extraktion der Antwort
      let assistantContent = "";
      
      const extractText = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (Array.isArray(obj) && obj.length > 0) return extractText(obj[0]);
        if (typeof obj === 'object' && obj !== null) {
          return obj.output || obj.text || obj.response || obj.message || obj.content || JSON.stringify(obj);
        }
        return "Keine Textantwort im Webhook-Payload gefunden.";
      };

      assistantContent = extractText(data);

      const assistantMsg = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: assistantContent
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Fehler beim Chat-Webhook:", error);
      // Fallback für Demo-Zwecke, falls URL noch nicht gesetzt ist
      const fallbackMsg = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: "Fehler: Webhook nicht erreichbar. Bitte trage deine n8n URL im Code ein."
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Lokale Anzeige sofort aktualisieren
      const newSource = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name
      };
      setSources(prev => [...prev, newSource]);

      try {
        // --- N8N UPLOAD WEBHOOK CALL ---
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);

        const response = await fetch(getWebhookUrl('upload'), {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload Fehler');
        
        console.log("Datei erfolgreich an n8n gesendet:", file.name);
      } catch (error) {
        console.error("Fehler beim Datei-Upload Webhook:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#F0F4F9] font-sans text-[#1f1f1f] overflow-hidden">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 relative -top-[1px]">
            <img 
              src={LOGO_IMAGE_URL} 
              alt="Logo" 
              className="w-[30px] h-[30px] object-contain" 
              referrerPolicy="no-referrer"
            />
            <span className="text-[24px] font-semibold text-black tracking-tight">Fake NotebookLM</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-black text-white text-[13px] font-semibold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            Notebook erstellen
          </button>
          <div className="flex items-center gap-1 ml-2">
            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center gap-2 text-[13px] font-medium transition-colors">
              <BarChart2 className="w-4 h-4" />
              Analysen
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center gap-2 text-[13px] font-medium transition-colors">
              <Share2 className="w-4 h-4" />
              Freigeben
            </button>
            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 flex items-center gap-2 text-[13px] font-medium transition-colors">
              <Settings className="w-4 h-4" />
              Einstellungen
            </button>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={() => setIsDevMode(!isDevMode)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                isDevMode 
                  ? 'bg-amber-100 text-amber-700 border-amber-200' 
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              DEV MODE: {isDevMode ? 'ON' : 'OFF'}
            </button>
            <span className="text-[10px] font-bold text-gray-400 border border-gray-300 px-1.5 py-0.5 rounded tracking-tighter">PRO</span>
            <Grid className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900 transition-colors" />
            <div className="w-8 h-8 rounded-full bg-[#E64A19] flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer">
              R
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 px-3 pb-3 overflow-hidden">
        
        {/* Left Column: Quellen */}
        <aside className="w-[340px] bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Quellen</h2>
            <Layout className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
          
          <div className="px-4 space-y-4">
            <button 
              onClick={handleFileUpload}
              disabled={isUploading}
              className={`w-full py-2.5 border border-gray-200 rounded-full text-xs text-gray-500 flex items-center justify-center gap-2 transition-colors font-medium ${isUploading ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isUploading ? 'Wird hochgeladen...' : 'Quellen hinzufügen'}
            </button>
            
            <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
              <div className="flex items-center gap-2 text-gray-400 mb-3 px-1">
                <Search className="w-4 h-4 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Im Web nach neuen Quellen suchen" 
                  className="bg-transparent text-xs outline-none w-full text-gray-600 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
                    <Globe className="w-3.5 h-3.5" />
                    Web
                  </button>
                  <button className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition-colors">
                    <Zap className="w-3.5 h-3.5" />
                    Schnelle Recherche
                  </button>
                </div>
                <button className="p-1.5 bg-gray-200 rounded-full text-gray-400 hover:bg-gray-300 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {sources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Gespeicherte Quellen werden hier angezeigt</p>
                <p className="text-[11px] text-gray-400 leading-relaxed px-4">
                  Klicken Sie oben auf „Quelle hinzufügen“, um PDFs, Websites, Text, Videos oder Audiodateien hinzuzufügen.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sources.map(source => (
                  <div key={source.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group border border-transparent hover:border-gray-100 transition-all">
                    <div className="bg-blue-50 p-2 rounded text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">{source.name}</span>
                    <MoreVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center Column: Chat */}
        <main className="flex-1 bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Chat</h2>
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
              <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </div>
          </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-[22px] font-medium text-gray-800 mb-6">Quelle hinzufügen und sofort loslegen</h3>
                <button 
                  onClick={handleFileUpload}
                  className="px-8 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Quelle hochladen
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-10">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'bg-[#EDF2FA] rounded-[24px] px-6 py-3 text-[#1f1f1f]' 
                        : 'bg-white text-[#1f1f1f] py-2'
                    }`}>
                      <div className="text-[15px] leading-[1.6] whitespace-pre-wrap">
                        {msg.content}
                        {msg.role === 'assistant' && (
                          <span className="inline-flex items-center justify-center w-4 h-4 bg-[#F1F3F4] text-[10px] text-gray-500 rounded-full ml-1 align-top mt-1">1</span>
                        )}
                      </div>
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                          <Pin className="w-3.5 h-3.5" />
                          In Notiz speichern
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white text-gray-500 py-4 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0.4, 1, 0.4] 
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1, 
                              delay: i * 0.2,
                              ease: "easeInOut" 
                            }}
                            className="w-1.5 h-1.5 bg-blue-600 rounded-full"
                          />
                        ))}
                      </div>
                      <span className="text-[13px] font-medium animate-pulse">NotebookLM denkt nach...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {messages.length > 0 && (
              <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-4 pointer-events-none">
                <button className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md text-gray-600 hover:bg-gray-50 transition-colors pointer-events-auto">
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Bottom Input */}
          <div className="p-6 pt-2">
            <div className="relative bg-white border border-gray-200 rounded-[24px] p-1.5 pl-6 flex items-center shadow-sm hover:border-gray-300 transition-colors">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Text eingeben..."
                className="flex-1 bg-transparent text-[15px] outline-none text-gray-700 py-3"
              />
              <div className="flex items-center gap-4 pr-1">
                <span className="text-[13px] text-gray-500 whitespace-nowrap">{sources.length} Quellen</span>
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    input.trim() 
                      ? 'bg-[#E8EAED] text-gray-700 hover:bg-gray-200' 
                      : 'bg-[#F1F3F4] text-gray-300'
                  }`}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={onFileChange}
            />
          </div>
        </main>

        {/* Right Column: Studio */}
        <aside className="w-[340px] bg-white rounded-2xl flex flex-col shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700">Studio</h2>
            <Layout className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
          
          <div className="px-4 grid grid-cols-3 gap-2">
            {[
              { icon: <Mic2 className="w-4 h-4" />, label: "Audio-..." },
              { icon: <Presentation className="w-4 h-4" />, label: "Präsentation" },
              { icon: <Video className="w-4 h-4" />, label: "Videoübersicht" },
              { icon: <Network className="w-4 h-4" />, label: "Mindmap" },
              { icon: <ClipboardList className="w-4 h-4" />, label: "Berichte" },
              { icon: <CreditCard className="w-4 h-4" />, label: "Karteikarten" },
              { icon: <HelpCircle className="w-4 h-4" />, label: "Quiz" },
              { icon: <Info className="w-4 h-4" />, label: "Infografik" },
              { icon: <Table className="w-4 h-4" />, label: "Datentabelle" },
            ].map((item, i) => (
              <div key={i} className="bg-[#F8F9FA] rounded-xl p-3 flex flex-col gap-3 hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                <div className="text-gray-400">{item.icon}</div>
                <span className="text-[10px] text-gray-500 font-medium truncate leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <Wand2 className="w-8 h-8 text-gray-300 mb-4" />
            <p className="text-xs font-semibold text-gray-700 mb-2">Hier wird die Ausgabe von Studio gespeichert.</p>
            <p className="text-[11px] text-gray-400 leading-relaxed px-4">
              Nachdem Sie Quellen hinzugefügt haben, klicken Sie Sie, um Audio-Zusammenfassungen, Arbeitshilfen, Mindmaps und mehr hinzuzufügen.
            </p>
          </div>
          
          <div className="p-4 flex justify-end">
            <button className="bg-black text-white text-[13px] font-semibold px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg hover:bg-gray-800 transition-all active:scale-95">
              <FilePlus className="w-4 h-4" />
              Notiz hinzufügen
            </button>
          </div>
        </aside>
      </div>
      
      {/* Footer Disclaimer */}
      <footer className="h-8 flex items-center justify-center text-[10px] text-gray-400 bg-[#F0F4F9] shrink-0">
        NotebookLM kann Fehler machen, überprüfen Sie daher die Antworten.
      </footer>
    </div>
  );
}

