import React from 'react';
import { BookMarked, Download, Map as MapIcon, ChevronRight } from 'lucide-react';

interface ContentAreaProps {
  summaries: { day: number; summary: string; mindmapUrl?: string }[];
}

export const ContentArea: React.FC<ContentAreaProps> = ({ summaries }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="bg-zinc-50 border-b border-zinc-200 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-500" />
            Acervo de Revisão
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Seus resumos e mapas mentais salvos para revisão rápida.</p>
        </div>
      </div>

      <div className="p-6">
        {summaries.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum material salvo ainda.</p>
            <p className="text-sm mt-1">Conclua suas missões diárias para gerar resumos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaries.map(({ day, summary, mindmapUrl }) => (
              <div key={day} className="border border-zinc-200 rounded-xl p-5 hover:border-emerald-300 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2 py-1 rounded">DIA {day}</span>
                </div>
                <h3 className="font-bold text-zinc-800 line-clamp-2 leading-snug mb-4">{summary}</h3>

                <div className="flex items-center gap-2 mt-auto">
                  <button className="flex-1 flex justify-center items-center gap-2 bg-zinc-100 text-zinc-700 text-sm font-medium py-2 rounded-lg hover:bg-zinc-200 transition">
                    <Download className="w-4 h-4" /> Resumo
                  </button>
                  {mindmapUrl && (
                    <a href={mindmapUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex justify-center items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium py-2 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition">
                      <MapIcon className="w-4 h-4" /> Mapa
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentArea;
