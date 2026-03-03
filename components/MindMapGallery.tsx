import React, { useState } from 'react';
import { Share2, Download, Search, Map, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourTip } from './TourTip';

interface MindMapProps {
  showTour?: boolean;
}

const MOCK_MAPS = [
  { id: 1, title: 'Divisao Celular: Mitose e Meiose', subject: 'Biologia', color: 'bg-emerald-100 text-emerald-800' },
  { id: 2, title: 'Tabela Periodica e Propriedades', subject: 'Quimica', color: 'bg-sky-100 text-sky-800' },
  { id: 3, title: 'Leis de Newton e Aplicacoes', subject: 'Fisica', color: 'bg-blue-100 text-blue-800' },
  { id: 4, title: 'Funcoes: Afim, Quadratica e Exponencial', subject: 'Matematica', color: 'bg-amber-100 text-amber-800' },
  { id: 5, title: 'Brasil Colonia: Ciclos Economicos', subject: 'Historia', color: 'bg-rose-100 text-rose-800' },
  { id: 6, title: 'Biomas Brasileiros e Impactos Ambientais', subject: 'Geografia', color: 'bg-teal-100 text-teal-800' },
];

export const MindMapGallery: React.FC<MindMapProps> = ({ showTour = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMap, setSelectedMap] = useState<number | null>(null);

  const filtered = MOCK_MAPS.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.subject.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <TourTip 
        show={showTour} 
        title="Mapas Mentais e Galeria Visual" 
        description="Clique nos cartões para expandir o mapa em HD. Esses mapas são curados com base nas estatísticas das provas para que você memorize a imagem e o conceito juntos." 
      />
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 max-w-5xl mx-auto w-full relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-500" />
            Conteúdo Resumido Visual
          </h2>
          <p className="text-zinc-500 text-sm mt-2">Mapas mentais de alta retenção desenhados para revisão ativa.</p>
        </div>
        
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Buscar assunto..." 
            className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(map => (
          <div 
            key={map.id}
            onClick={() => setSelectedMap(map.id)}
            className="group cursor-pointer bg-zinc-50 border border-zinc-100 rounded-2xl p-1 relative overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className="aspect-[4/3] bg-zinc-200 rounded-xl overflow-hidden relative">
              {/* Fake Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center">
                <Map className="w-12 h-12 text-zinc-400 opacity-50 group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-150%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-zinc-700 hover:text-emerald-600 hover:bg-white">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded mb-2 inline-block ${map.color}`}>
                {map.subject}
              </span>
              <h3 className="font-bold text-zinc-800 text-sm leading-tight group-hover:text-emerald-600 transition-colors">
                {map.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">Nenhum mapa mental encontrado para sua busca.</p>
        </div>
      )}

      {/* Modal Visualizador */}
      <AnimatePresence>
        {selectedMap && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <h3 className="font-bold text-zinc-800">{MOCK_MAPS.find(m => m.id === selectedMap)?.title}</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-zinc-200 mx-2"></div>
                  <button onClick={() => setSelectedMap(null)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-zinc-100 flex items-center justify-center min-h-[50vh]">
                {/* Aqui entra a imagem hd real do RAG ou Bucket */}
                <div className="w-full h-full min-h-[400px] border-2 border-dashed border-zinc-300 rounded-2xl flex flex-col items-center justify-center text-zinc-400">
                  <Map className="w-16 h-16 mb-4 opacity-50" />
                  <p className="font-medium text-lg text-zinc-600 mb-2">Simulador de Alta Resolução</p>
                  <p className="text-sm max-w-md text-center text-zinc-500">
                    Ao subir os PDFs do seu cursinho (na versão com backend completo e banco vetorial configurado), o sistema exibe os mapas mentais aqui, de forma processada, cortada e em alta qualidade (ex: via baldes da AWS S3).
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};
