import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, BookOpen, FileText, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourTip } from './TourTip';
import { casesApi, ClinicalCase, CaseAnswerResponse } from './api/casesApi';

interface CasesProps {
  showTour?: boolean;
}

export const ClinicalCases: React.FC<CasesProps> = ({ showTour = false }) => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<CaseAnswerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await casesApi.getCases();
      setCases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar casos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const currentCase = cases[currentCaseIndex];
  const currentEtapa = currentCase?.etapas?.[currentStep];

  const handleSelect = async (optionKey: string) => {
    if (showFeedback || !currentCase || !currentEtapa) return;
    
    setSelectedOption(optionKey);
    setShowFeedback(true);

    try {
      const result = await casesApi.submitAnswer(currentCase.id, {
        etapa_id: currentEtapa.id,
        resposta: optionKey
      });
      setFeedback(result);
    } catch (err) {
      console.error('Erro ao submeter resposta:', err);
    }
  };

  const handleNext = () => {
    if (currentCase && currentStep < currentCase.etapas.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setFeedback(null);
    } else if (currentCaseIndex < cases.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
      setCurrentStep(0);
      setSelectedOption(null);
      setShowFeedback(false);
      setFeedback(null);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentCaseIndex(0);
    setCurrentStep(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setFeedback(null);
    setCompleted(false);
    fetchCases();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500">Carregando casos clínicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-zinc-700 mb-2">Erro ao carregar casos</p>
        <p className="text-zinc-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchCases}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 text-center">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mx-auto mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Nenhum caso disponível</h2>
        <p className="text-zinc-500 mb-6">Não há casos clínicos cadastrados no momento.</p>
        <button onClick={fetchCases} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold">
          Atualizar
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <>
        <TourTip show={showTour} title="Simulado de Questões" description="Pratique com questões no estilo da prova da UNIOESTE. Analise o enunciado e escolha a alternativa correta."/>
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Simulado Concluído!</h2>
          <p className="text-zinc-500 mb-6">Bom trabalho! Revise as explicações para fixar o conteúdo.</p>
          <button onClick={handleRestart} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors">
            Novo Simulado
          </button>
        </div>
      </>
    );
  }

  if (!currentCase || !currentEtapa) {
    return null;
  }

  const alternativas = currentEtapa.alternativas || {};
  const isCorrect = selectedOption?.toUpperCase() === currentEtapa.resposta_correta?.toUpperCase();

  return (
    <>
      <TourTip 
        show={showTour} 
        title="Simulado Vestibular UNIOESTE" 
        description="Resolva questões no padrão da prova. Leia o contexto com atenção, analise as alternativas e confira a explicação após responder." 
      />
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 bg-zinc-950 text-white relative">
          <GraduationCap className="w-24 h-24 absolute right-6 top-6 opacity-10" />
          <h3 className="text-xs font-bold text-emerald-400 tracking-wider uppercase mb-2">
            Caso #{currentCase.id} • Etapa {currentStep + 1}/{currentCase.etapas.length}
          </h3>
          <h2 className="text-2xl font-bold mb-4">{currentCase.titulo}</h2>
          <p className="text-zinc-300 text-sm leading-relaxed max-w-xl">{currentCase.descricao}</p>
          
          <div className="flex gap-4 mt-6">
            <div className="bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 text-xs flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400">Dificuldade:</span> 
              <span className="font-bold">{currentCase.dificuldade}</span>
            </div>
            <div className="bg-zinc-900 rounded-lg px-4 py-2 border border-zinc-800 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="text-zinc-400">Progresso:</span> 
              <span className="font-bold">{currentCaseIndex + 1} / {cases.length}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-zinc-800 mb-6">{currentEtapa.pergunta}</h3>
          
          <div className="space-y-3">
            {Object.entries(alternativas).map(([key, value]) => {
              const isSelected = selectedOption === key;
              const isCorrectOption = key === currentEtapa.resposta_correta;
              
              let btnClass = "border-zinc-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700";
              if (showFeedback) {
                if (isCorrectOption) btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                else if (isSelected && !isCorrectOption) btnClass = "border-rose-500 bg-rose-50 text-rose-900";
                else btnClass = "border-zinc-100 bg-zinc-50 text-zinc-400 opacity-50";
              }

              return (
                <button 
                  key={key}
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium flex items-center justify-between group ${btnClass}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 text-xs font-bold">
                      {key}
                    </span>
                    {value}
                  </span>
                  {showFeedback && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {showFeedback && isSelected && !isCorrectOption && <AlertCircle className="w-5 h-5 text-rose-600" />}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {showFeedback && feedback && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6"
              >
                <div className={`p-4 rounded-xl text-sm ${
                  isCorrect 
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  <strong>{isCorrect ? 'Correto! ' : 'Incorreto. '}</strong>
                  {feedback.explicacao}
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                  >
                    {currentCaseIndex < cases.length - 1 || currentStep < currentCase.etapas.length - 1 
                      ? 'Continuar' 
                      : 'Finalizar'} 
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
