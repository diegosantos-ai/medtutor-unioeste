import React, { useState } from 'react';
import { UserProfile, ContentResource } from '../types';
import { generateSummary } from '../geminiService';
import { Search, BookOpen, ExternalLink, ChevronRight, Loader2, Sparkles } from 'lucide-react';

interface StudyResourcesProps {
  profile: UserProfile;
  setView?: (view: 'dashboard' | 'chat' | 'resources' | 'progress') => void;
}

const StudyResources: React.FC<StudyResourcesProps> = ({ profile, setView }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState<ContentResource | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResource(null);
    try {
      const result = await generateSummary("Matéria Geral", query);
      setResource(result);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar trilha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-surface-200">
        <h2 className="text-2xl font-bold text-surface-900 mb-2">Trilhas de Conhecimento</h2>
        <p className="text-surface-500 mb-6">Digite um tema (ex: "Mitose") para gerar um guia de estudo completo.</p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="O que você quer aprender hoje?"
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            Gerar Trilha
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
          <p className="text-surface-500">A IA está estruturando o conteúdo para você...</p>
        </div>
      )}

      {resource && (
        <div className="bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden animate-slide-up">
          <div className="bg-brand-50 p-6 border-b border-brand-100">
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <BookOpen size={18} />
              <span className="text-sm font-bold uppercase tracking-wide">{resource.subject}</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-900">{resource.title}</h1>
          </div>

          <div className="p-8 space-y-8">

            {/* Key Concepts / Prerequisites */}
            {resource.prerequisites.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <ChevronRight size={18} /> Pré-requisitos Sugeridos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.prerequisites.map((req, i) => (
                    <span key={i} className="bg-white text-orange-700 px-3 py-1 rounded border border-orange-200 text-sm">
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-slate max-w-none">
              <div className="text-surface-700 leading-relaxed whitespace-pre-wrap">
                {resource.content}
              </div>
            </div>

            {/* Examples */}
            {resource.examples.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-surface-900 mb-4">Exemplos Práticos</h3>
                <div className="grid gap-4">
                  {resource.examples.map((ex, i) => (
                    <div key={i} className="bg-surface-50 p-4 rounded-lg border-l-4 border-brand-500">
                      <p className="text-surface-700 italic">"{ex}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {resource.externalLinks.length > 0 && (
              <div className="pt-6 border-t border-surface-100">
                <h3 className="text-lg font-bold text-surface-900 mb-4">Aprofunde-se</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resource.externalLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-lg border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
                    >
                      <span className="font-medium text-surface-700 group-hover:text-brand-700 truncate">{link.title}</span>
                      <ExternalLink size={16} className="text-surface-400 group-hover:text-brand-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Finish Action */}
            {setView && (
              <div className="pt-8 flex justify-center border-t border-surface-100">
                <button
                  onClick={() => setView('dashboard')}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-transform hover:scale-105 flex items-center gap-3"
                >
                  ✓ Estudo Concluído: Voltar ao Painel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyResources;
