import React, { useState } from 'react';
import { BookX, CheckCircle, ChevronRight, XCircle, BrainCircuit, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourTip } from './TourTip';
import { useErrors } from './hooks/useErrors';
import { MockQuestion } from './api/mockData';

interface ErrorProps {
  showTour?: boolean;
}

export const ErrorNotebook: React.FC<ErrorProps> = ({ showTour = false }) => {
  const { errors, isLoading, error: errorMsg, refetch } = useErrors();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const currentError = errors[currentIndex];

  const handleSelect = (option: string) => {
    if (answered || !currentError) return;
    setSelectedOpt(option);
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < errors.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setShowHistory(true);
      setCurrentIndex(0);
      setSelectedOpt(null);
      setAnswered(false);
    }
  };

  const getAlternativas = (error: MockQuestion): Record<string, string> => {
    return error.alternativas;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="text-zinc-500">Carregando caderno de erros...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-zinc-700 mb-2">Erro ao carregar caderno</p>
        <p className="text-zinc-500 text-sm mb-4">{errorMsg}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-rose-500 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Caderno de Erros</h2>
              <p className="text-zinc-500 text-sm">Parabéns! Você ainda não tem erros registrados.</p>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <p className="text-emerald-800 mb-2">
              Continue praticando! Os erros aparecerão aqui automaticamente conforme você responder questões.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="max-w-4xl mx-auto w-full">
        <TourTip 
          show={showTour} 
          title="Caderno de Erros Inteligente" 
          description="Sua aprovação mora onde você erra. Este caderno agrupa questões que você falhou no passado. Clique em 'Treinar Foco' para tentar resolver novamente." 
        />
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <BookX className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Seu Caderno de Erros</h2>
              <p className="text-zinc-500 text-sm">Foque onde dói mais. Essa é a chave da sua aprovação.</p>
            </div>
            <span className="ml-auto bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold">
              {errors.length} erros
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {errors.map((error, i) => (
              <div key={error.question_id} className="border border-zinc-200 rounded-xl p-5 hover:border-rose-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                    {error.materia} • {error.assunto}
                  </span>
                  <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">
                    {new Date(error.data_erro).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-zinc-800 font-medium line-clamp-2 mb-3">{error.enunciado}</p>
                
                <div className="p-3 bg-zinc-50 rounded-lg border-l-4 border-l-purple-500">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase mb-1">
                    <BrainCircuit className="w-4 h-4" /> Explicação
                  </h4>
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {error.explicacao}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => { 
              setShowHistory(false); 
              setCurrentIndex(0); 
              setSelectedOpt(null); 
              setAnswered(false); 
            }}
            className="mt-6 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold w-full hover:bg-emerald-600 transition-colors"
          >
            Treinar Foco (Refazer Erros)
          </button>
        </div>
      </div>
    );
  }

  if (!currentError) {
    return null;
  }

  const alternativas = getAlternativas(currentError);
  const isCorrect = selectedOpt?.toUpperCase() === currentError.resposta_correta.toUpperCase();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 max-w-4xl mx-auto overflow-hidden flex flex-col md:flex-row">
      
      {/* Sidebar de Contexto */}
      <div className="bg-zinc-950 p-6 md:w-64 text-zinc-100 flex-shrink-0 flex flex-col items-start relative">
        <BookX className="absolute bottom-4 right-4 w-32 h-32 text-zinc-900 z-0" />
        <div className="z-10 w-full">
          <div className="bg-rose-500/20 text-rose-400 font-bold text-[10px] px-2 py-1 rounded uppercase tracking-wider mb-4 inline-block border border-rose-500/50">
            Treino de Foco
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{currentError.assunto}</h2>
          <p className="text-zinc-400 text-sm mb-6 pb-6 border-b border-zinc-800">
            Questão errada em {new Date(currentError.data_erro).toLocaleDateString('pt-BR')}
          </p>

          <div className="space-y-3">
            <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
              <span className="text-xs text-zinc-500 block mb-1">Matéria</span>
              <span className="text-lg font-bold text-white">{currentError.materia}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Área da Questão */}
      <div className="p-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-zinc-400">
            Questão {currentIndex + 1} de {errors.length}
          </span>
          <button 
            onClick={() => setShowHistory(true)} 
            className="text-xs font-bold text-zinc-500 hover:text-zinc-800 underline"
          >
            Ver Diário de Erros Completo
          </button>
        </div>

        <h3 className="text-xl text-zinc-800 font-medium leading-relaxed mb-8">
          {currentError.enunciado}
        </h3>

        <div className="space-y-3">
          {Object.entries(alternativas).map(([key, value]) => {
            const isSelected = selectedOpt === key;
            const isCorrectOption = key === currentError.resposta_correta.toUpperCase();
            
            let btnClass = "border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700";
            if (answered) {
              if (isCorrectOption) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
              else if (isSelected && !isCorrectOption) btnClass = "border-rose-500 bg-rose-50 text-rose-900";
              else btnClass = "border-zinc-100 bg-zinc-50 text-zinc-400 opacity-50";
            }

            return (
              <button 
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium flex gap-3 group ${btnClass}`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold group-hover:bg-zinc-200">
                  {key}
                </div>
                <span className="flex-1">{value}</span>
                {answered && isCorrectOption && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                {answered && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-rose-600" />}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {answered && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              className="mt-6 pt-6 border-t border-zinc-100"
            >
              <div className={`rounded-xl p-5 border relative overflow-hidden ${
                isCorrect 
                  ? 'bg-emerald-50 border-emerald-100' 
                  : 'bg-purple-50 border-purple-100'
              }`}>
                <BrainCircuit className={`absolute -right-4 -bottom-4 w-24 h-24 ${
                  isCorrect ? 'text-emerald-200/50' : 'text-purple-200/50'
                }`} />
                <h4 className={`font-bold mb-2 flex items-center gap-2 ${
                  isCorrect ? 'text-emerald-900' : 'text-purple-900'
                }`}>
                  <BrainCircuit className="w-5 h-5" />
                  {isCorrect ? 'Muito bem!' : 'Explicação'}
                </h4>
                <p className={`text-sm leading-relaxed max-w-xl relative z-10 ${
                  isCorrect ? 'text-emerald-800' : 'text-purple-800'
                }`}>
                  {isCorrect 
                    ? "Você acertou desta vez! Continue praticando para fixar o conteúdo." 
                    : currentError.explicacao}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  {currentIndex < errors.length - 1 ? 'Próximo Erro' : 'Voltar ao Caderno'} 
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
