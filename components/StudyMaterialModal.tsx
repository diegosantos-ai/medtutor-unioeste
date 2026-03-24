import React, { useState, useEffect } from 'react';
import { X, BookOpen, Lightbulb, CheckCircle2, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { generateSummary } from '../geminiService';
import { ContentResource } from '../types';
import { MarkdownRenderer, cleanMarkdown, renderListItems } from './MarkdownRenderer';

interface StudyMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: string;
    topic: string;
}

export const StudyMaterialModal: React.FC<StudyMaterialModalProps> = ({
    isOpen,
    onClose,
    subject,
    topic
}) => {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<ContentResource | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadContent();
        }
    }, [isOpen, subject, topic]);

    const loadContent = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await generateSummary(subject, topic);
            setContent(data);
        } catch (err) {
            console.error(err);
            setError("Não foi possível gerar o material de estudo agora. Verifique sua conexão ou tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 text-lg leading-tight">{topic}</h3>
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{subject} • UNIOESTE</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                            <div className="text-center">
                                <p className="text-zinc-900 font-bold">Gerando material didático...</p>
                                <p className="text-zinc-500 text-sm">Consultando diretrizes do vestibular UNIOESTE</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                <X size={32} />
                            </div>
                            <p className="text-zinc-800 font-medium max-w-md">{error}</p>
                            <button
                                onClick={loadContent}
                                className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : content ? (
                        <div className="space-y-8">
                            {/* Main Content - Renderizado com Markdown */}
                            <div className="border-l-4 border-emerald-400 pl-6 bg-emerald-50/30 py-4 rounded-r-lg">
                                <MarkdownRenderer content={cleanMarkdown(content.content)} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Key Points */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                        <Sparkles size={18} className="text-amber-500" />
                                        <h4>Pontos Chave</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {renderListItems(content.prerequisites?.join('\n') || '').map((point, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                                <MarkdownRenderer content={point} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Examples */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                                        <Lightbulb size={18} className="text-emerald-500" />
                                        <h4>Exemplos e Contexto</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {renderListItems(content.examples?.join('\n') || '').map((ex, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-zinc-600 bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50">
                                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-2" />
                                                <MarkdownRenderer content={ex} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Action Suggestion */}
                            <div className="bg-zinc-900 rounded-2xl p-6 text-white flex items-center justify-between group cursor-pointer hover:bg-zinc-800 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                                        <BrainCircuit className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-bold">Pronto para testar?</h5>
                                        <p className="text-xs text-zinc-400">Gere um quiz rápido agora sobre este conteúdo.</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-emerald-500 transition-all">
                                    <Sparkles size={14} className="group-hover:text-emerald-400" />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">Powered by MedTutor AI Specialist</p>
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-zinc-200"
                    >
                        Entendi, voltar ao plano
                    </button>
                </div>
            </div>
        </div>
    );
};
