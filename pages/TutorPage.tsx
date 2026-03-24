import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { apiClient } from '../components/api/apiClient';

interface Message {
  id?: number;
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
  sources?: any[];
}

interface ChatHistoryItem {
  id: number;
  role: string;
  text: string;
  timestamp: string;
  sources?: any[];
}

interface TutorPageProps {
  userName?: string;
  currentTopic?: string;
}

export const TutorPage: React.FC<TutorPageProps> = ({
  userName = 'Aluno',
  currentTopic = 'Sistema Respiratório'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await apiClient.get<any>('/chat/history');
      if (history.messages && history.messages.length > 0) {
        const loadedMessages: Message[] = history.messages.map((m: ChatHistoryItem) => ({
          id: m.id,
          role: m.role as 'user' | 'bot',
          text: m.text,
          timestamp: new Date(m.timestamp).getTime(),
          sources: m.sources
        }));
        setMessages(loadedMessages);
      } else {
        setMessages([{
          role: 'bot',
          text: `Olá, ${userName}! Sou seu Tutor IA para o vestibular de Medicina da UNIOESTE.\n\nEstou vendo que você está estudando **${currentTopic}**. Posso ajudar com explicações, exercícios, comparações de conceitos e tirar dúvidas específicas.\n\nSobre o que quer perguntar?`,
          timestamp: Date.now()
        }]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setMessages([{
        role: 'bot',
        text: `Olá, ${userName}! Sou seu Tutor IA para o vestibular de Medicina da UNIOESTE.\n\nSobre o que quer perguntar?`,
        timestamp: Date.now()
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setError(null);
    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await apiClient.post<any>('/chat/tutor', {
        query: input,
        profile: { name: userName },
        history: history
      });

      const botMsg: Message = {
        role: 'bot',
        text: response.text || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: Date.now(),
        sources: response.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Erro ao enviar mensagem');
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Desculpe, tive um problema ao processar sua mensagem. Tente novamente.',
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Limpar todo o histórico de chat?')) return;

    try {
      await apiClient.delete('/chat/history');
      setMessages([{
        role: 'bot',
        text: `Olá, ${userName}! Histórico limpo. Sobre o que quer perguntar?`,
        timestamp: Date.now()
      }]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Tutor IA</h1>
          <p className="text-zinc-500 mt-1">
            Tire suas dúvidas sobre qualquer tema do vestibular
          </p>
        </div>
        <button
          onClick={handleClearHistory}
          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          title="Limpar histórico"
        >
          <Trash2 className="w-5 h-5" />
        </button>
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

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

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
