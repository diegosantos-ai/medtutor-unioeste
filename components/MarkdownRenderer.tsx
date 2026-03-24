import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-zinc max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-bold text-zinc-900 mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold text-zinc-900 mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold text-zinc-900 mt-4 mb-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-bold text-zinc-800 mt-3 mb-2">{children}</h4>,
          p: ({ children }) => <p className="text-zinc-700 leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-zinc-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-zinc-700">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-700">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-zinc-900">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-emerald-400 pl-4 italic text-zinc-600 my-4 bg-emerald-50/30 py-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            if (isInline) {
              return (
                <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-4 rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-zinc-200 border border-zinc-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-zinc-50">{children}</thead>,
          th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-bold text-zinc-700">{children}</th>,
          td: ({ children }) => <td className="px-4 py-2 text-sm text-zinc-600">{children}</td>,
          a: ({ href, children }) => (
            <a href={href} className="text-emerald-600 hover:text-emerald-700 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-zinc-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export function cleanMarkdown(text: string): string {
  if (!text) return '';
  // Remove markdown code blocks markers
  let cleaned = text.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/gm, '');
  cleaned = cleaned.replace(/\s*```$/g, '');

  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

  return cleaned.trim();
}

export function renderListItems(text: string): string[] {
  if (!text) return [];
  // Split by newlines and clean
  const items = text
    .split(/\n/)
    .map(line => {
      // Remove list markers like -, *, 1., 2., etc.
      return line.replace(/^[\s]*[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
    })
    .filter(line => line.length > 0);
  return items;
}
