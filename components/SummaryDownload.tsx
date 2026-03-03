import React from 'react';
import { Download, Map } from 'lucide-react';

interface SummaryDownloadProps {
  summary: string;
  mindmapUrl?: string;
}

export const SummaryDownload: React.FC<SummaryDownloadProps> = ({ summary, mindmapUrl }) => {
  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resumo-unioeste.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 bg-zinc-100 text-zinc-700 font-medium px-4 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors text-sm"
      >
        <Download className="w-4 h-4" />
        Resumo em Texto
      </button>
      {mindmapUrl && (
        <a
          href={mindmapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors text-sm"
        >
          <Map className="w-4 h-4" />
          Mapa Mental Visual
        </a>
      )}
    </div>
  );
};

export default SummaryDownload;
