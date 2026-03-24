import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

interface TutorPageProps {
  userName?: string;
  currentTopic?: string;
}

export const TutorPage: React.FC<TutorPageProps> = ({
  userName = 'Aluno',
  currentTopic = 'Sistema Respiratório'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: `Olá, ${userName}! Sou seu Tutor IA para o vestibular de Medicina da UNIOESTE.\n\nEstou vendo que você está estudando **${currentTopic}**. Posso ajudar com explicações, exercícios, comparações de conceitos e tirar dúvidas específicas.\n\nSobre o que quer perguntar?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botMsg: Message = {
        role: 'bot',
        text: 'Esta é uma resposta simulada do tutor. Em breve integraré com a API de IA com contexto da sessão.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Tutor IA</h1>
        <p className="text-zinc-500 mt-1">
          Tire suas dúvidas sobre qualquer tema do vestibular
        </p>
      </div>

      {/* Context Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-emerald-600 font-medium">Contexto da Sessão</p>
            <p className="text-zinc-900 font-semibold">{currentTopic}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'bot' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-900 text-white'
            }`}>
              {msg.role === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'bot'
                ? 'bg-zinc-100 text-zinc-800'
                : 'bg-zinc-900 text-white'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-zinc-100 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span className="text-sm text-zinc-500">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-zinc-200 p-3 flex items-center gap-2 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua dúvida..."
          className="flex-1 bg-transparent outline-none text-zinc-800 placeholder-zinc-400"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-10 h-10 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TutorPage;
