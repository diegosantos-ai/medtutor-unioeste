import React, { useState, useRef, useEffect } from 'react';
import { Message, UserProfile, QuizItem } from '../types';
import { getTutorResponse, generateLargeQuizFromContext } from '../geminiService';
import { useLogger } from '../utils/logger';
import { Send, Bot, User, Loader2, BrainCircuit, X, CheckCircle, AlertCircle } from 'lucide-react';

interface TutorChatProps {
  profile: UserProfile;
}

const TutorChat: React.FC<TutorChatProps> = ({ profile }) => {
  const logger = useLogger('TutorChat');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Ola, ${profile.name}! Sou seu Tutor IA para o vestibular de Medicina da UNIOESTE. Posso ajudar com Biologia, Quimica, Fisica, Matematica, Portugues, Historia, Geografia e Redacao. Sobre o que quer estudar?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persistence
  useEffect(() => {
    const savedMsg = localStorage.getItem('medtutor_chat_history');
    if (savedMsg) {
      setMessages(JSON.parse(savedMsg));
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (messages.length > 1) { // Only save if there is interaction
      localStorage.setItem('medtutor_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    logger.logUserAction('Enviar mensagem', { messageLength: input.length });
    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const startTime = performance.now();
    try {
      const response = await getTutorResponse(input, profile, messages);
      const duration = Math.round(performance.now() - startTime);
      
      logger.logPerformance('getTutorResponse', duration, { success: true });
      
      const botMsg: Message = {
        role: 'bot',
        text: response.text,
        timestamp: Date.now(),
        sources: response.sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logger.error('Falha no getTutorResponse', error instanceof Error ? error : undefined, { 
        duration,
        messageInput: input.substring(0, 50)
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: "Desculpe, tive um erro ao processar. Tente novamente.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      // Use the last few bot messages as context
      const context = messages.filter(m => m.role === 'bot').slice(-3).map(m => m.text).join('\n');
      const subject = "Matérias da UNIOESTE (Foco no contexto da conversa)";

      const generatedQuiz = await generateLargeQuizFromContext(context || "Biologia e Química Geral", subject);
      setQuiz(generatedQuiz);
      setQuizAnswers({});
      setShowQuizResults(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar quiz. Tente falar mais sobre um assunto antes.");
    } finally {
      setQuizLoading(false);
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) correct++;
    });
    return correct;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] animate-fade-in relative">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 mb-4 bg-white rounded-xl shadow-sm border border-surface-200">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'bot' ? 'bg-brand-100 text-brand-600' : 'bg-surface-200 text-surface-600'
              }`}>
              {msg.role === 'bot' ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
              ? 'bg-brand-600 text-white rounded-tr-none'
              : 'bg-surface-100 text-surface-800 rounded-tl-none border border-surface-200'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <Bot size={18} className="text-brand-600" />
            </div>
            <div className="bg-surface-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-surface-400" />
              <span className="text-sm text-surface-500">Digitando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 rounded-xl border border-surface-200 shadow-sm flex items-center gap-2">
        <button
          onClick={handleGenerateQuiz}
          disabled={quizLoading || messages.length < 2}
          className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex flex-col items-center gap-1 min-w-[60px]"
          title="Gerar Quiz do Assunto"
        >
          {quizLoading ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
          <span className="text-[10px] font-bold">QUIZ</span>
        </button>

        <div className="w-px h-8 bg-surface-200"></div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre qualquer materia do vestibular..."
          className="flex-1 bg-transparent outline-none text-surface-800 placeholder-surface-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Quiz Modal */}
      {quiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
            <div className="p-4 border-b border-surface-100 flex justify-between items-center bg-brand-50">
              <h3 className="font-bold text-lg text-brand-800 flex items-center gap-2">
                <BrainCircuit size={20} /> Quiz de Fixação
              </h3>
              <button onClick={() => setQuiz(null)} className="text-surface-500 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {showQuizResults && (
                <div className="bg-brand-100 border border-brand-200 p-4 rounded-lg text-center mb-4">
                  <span className="text-lg font-bold text-brand-800">
                    Você acertou {calculateScore()} de {quiz.length} questões!
                  </span>
                </div>
              )}

              {quiz.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="font-medium text-surface-800">{idx + 1}. {item.question}</p>
                  <div className="grid gap-2">
                    {item.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[idx] === optIdx;
                      const isCorrect = item.correctAnswer === optIdx;
                      let btnClass = "border-surface-200 hover:bg-surface-50 text-surface-700";

                      if (showQuizResults) {
                        if (isCorrect) btnClass = "bg-green-100 border-green-300 text-green-800";
                        else if (isSelected && !isCorrect) btnClass = "bg-red-100 border-red-300 text-red-800";
                      } else {
                        if (isSelected) btnClass = "bg-brand-50 border-brand-300 text-brand-700 font-medium";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => !showQuizResults && setQuizAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                          className={`text-left px-4 py-3 rounded-lg border text-sm transition-all ${btnClass}`}
                          disabled={showQuizResults}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showQuizResults && (
                    <div className="text-xs bg-surface-50 p-2 rounded text-surface-600 border border-surface-100 flex gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-surface-100 bg-surface-50 flex justify-end">
              {!showQuizResults ? (
                <button
                  onClick={() => setShowQuizResults(true)}
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
                >
                  Corrigir Quiz
                </button>
              ) : (
                <button
                  onClick={() => setQuiz(null)}
                  className="bg-surface-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-surface-900 transition-colors"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TutorChat;
