import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, RotateCcw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { TourTip } from './TourTip';
import { useFlashcards } from './hooks/useFlashcards';

interface FlashcardsProps {
  showTour?: boolean;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ showTour = false }) => {
  const { flashcards, isLoading, error, reviewCard, dueCount, refetch } = useFlashcards(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleNext = async (quality: number) => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    await reviewCard(currentCard.id, quality);
    setIsFlipped(false);

    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    }, 200);
  };

  const handleRestart = () => {
    setCompleted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500">Carregando flashcards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-zinc-700 mb-2">Erro ao carregar flashcards</p>
        <p className="text-zinc-500 text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-emerald-500 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Tudo em dia!</h2>
        <p className="text-zinc-500 text-center mb-6">
          Não há flashcards para revisar agora. <br />
          O algoritmo separará mais cards conforme seu progresso.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors"
        >
          Verificar novamente
        </button>
      </div>
    );
  }

  if (completed) {
    return (
      <>
        {showTour && (
          <TourTip 
            title="Revisão Concluída" 
            text="Você finalizou os flashcards agendados para hoje. O algoritmo SM-2 separou os próximos baseado nos seus erros e acertos." 
          />
        )}
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-zinc-100 p-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Revisão Concluída!</h2>
          <p className="text-zinc-500 mb-8">Você revisou {flashcards.length} cards hoje. O algoritmo separou os próximos para amanhã.</p>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-emerald-500 transition-colors"
          >
            Revisar Novamente
          </button>
        </div>
      </>
    );
  }

  const card = flashcards[currentIndex];

  return (
    <>
      {showTour && (
        <TourTip 
          title="Repetição Espaçada (SRS)" 
          text="Aqui você revisa o conteúdo através de Flashcards. Responda mentalmente e clique para virar. Classifique sua facilidade para que o algoritmo agende a próxima revisão." 
        />
      )}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
              <Layers className="text-emerald-500" />
              Revisão Espaçada (SRS)
            </h2>
            <p className="text-sm text-zinc-500">Flashcards Inteligentes com base no seu histórico.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
              {dueCount} pendentes
            </span>
            <span className="bg-zinc-100 text-zinc-600 px-4 py-2 rounded-xl text-sm font-bold">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>
        </div>

        <div 
          className="relative w-full h-80 perspective-1000 mb-8 cursor-pointer" 
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateX: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* FRENTE */}
            <div className="absolute w-full h-full backface-hidden bg-white border border-zinc-200 shadow-lg rounded-3xl p-8 flex flex-col justify-center items-center text-center">
              <span className="absolute top-6 left-6 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                {card.topic}
              </span>
              <h3 className="text-2xl font-medium text-zinc-800">{card.front}</h3>
              <p className="absolute bottom-6 text-sm text-zinc-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Clique para virar
              </p>
            </div>

            {/* VERSO */}
            <div 
              className="absolute w-full h-full backface-hidden bg-emerald-50 border border-emerald-200 shadow-lg rounded-3xl p-8 flex flex-col justify-center items-center text-center"
              style={{ transform: 'rotateX(180deg)', backfaceVisibility: 'hidden' }}
            >
              <h3 className="text-xl font-medium text-emerald-900 mb-6">{card.back}</h3>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isFlipped && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-4 gap-3"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(0); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors font-bold"
              >
                <AlertCircle className="mb-1" />
                Errei
                <span className="text-xs font-normal text-rose-500 mt-1">&lt; 1 min</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(1); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-bold"
              >
                <AlertCircle className="mb-1" />
                Difícil
                <span className="text-xs font-normal text-amber-500 mt-1">1 dia</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(2); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-bold"
              >
                <Check className="mb-1" />
                Bom
                <span className="text-xs font-normal text-blue-500 mt-1">2 dias</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(3); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-bold"
              >
                <RotateCcw className="mb-1" />
                Fácil
                <span className="text-xs font-normal text-emerald-600 mt-1">4+ dias</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
