import React, { useState, useEffect, useRef } from 'react';
import { logger, LogEntry, LogLevel } from '../../utils/logger';
import { X, Download, Trash2, RefreshCw, AlertCircle, Info, AlertTriangle, Bug, Terminal, Copy, Check } from 'lucide-react';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOG_COLORS: Record<LogLevel, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  DEBUG: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: <Bug className="w-4 h-4" />
  },
  INFO: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Info className="w-4 h-4" />
  },
  WARN: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <AlertTriangle className="w-4 h-4" />
  },
  ERROR: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: <AlertCircle className="w-4 h-4" />
  },
  FATAL: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: <AlertCircle className="w-4 h-4" />
  },
};

export const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
  };

  const clearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs?')) {
      logger.clearLogs();
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const downloadLogs = () => {
    logger.downloadLogs();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(log => log.level === filter);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">Log Viewer</h2>
              <p className="text-xs text-zinc-400">
                {logs.length} logs | Sessão: {logs[0]?.sessionId?.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadLogs}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={downloadLogs}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={clearLogs}
              className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400"
              title="Limpar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-100 p-3 flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-zinc-600 mr-2">Filtro:</span>
          {(['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === level
                  ? 'bg-zinc-800 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {level}
              {level !== 'ALL' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({logs.filter(l => l.level === level).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Log List */}
          <div
            ref={scrollRef}
            className="w-1/2 border-r border-zinc-200 overflow-y-auto"
          >
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum log encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredLogs.map((log) => {
                  const colors = LOG_COLORS[log.level];
                  return (
                    <button
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`w-full text-left p-3 hover:bg-zinc-50 transition-colors ${
                        selectedLog?.id === log.id ? 'bg-zinc-100' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 ${colors.text}`}>
                          {colors.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                              {log.level}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatTime(log.timestamp)}
                            </span>
                            <span className="text-xs text-zinc-400">
                              {log.component}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-700 truncate">
                            {log.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Log Details */}
          <div className="w-1/2 bg-zinc-50 overflow-y-auto">
            {selectedLog ? (
              <div className="p-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        LOG_COLORS[selectedLog.level].bg
                      } ${LOG_COLORS[selectedLog.level].text}`}>
                        {selectedLog.level}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {formatDate(selectedLog.timestamp)} {formatTime(selectedLog.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                      className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <h3 className="font-medium text-zinc-900 mb-2">{selectedLog.message}</h3>

                  <div className="text-sm text-zinc-600 mb-4">
                    <p><strong>Componente:</strong> {selectedLog.component}</p>
                    <p><strong>URL:</strong> {selectedLog.url}</p>
                    <p><strong>Session ID:</strong> {selectedLog.sessionId}</p>
                  </div>

                  {selectedLog.data && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-zinc-700 mb-2">Dados:</h4>
                      <pre className="bg-zinc-900 text-zinc-100 p-3 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.error && (
                    <div>
                      <h4 className="text-sm font-bold text-rose-700 mb-2">Erro:</h4>
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-rose-900">{selectedLog.error.message}</p>
                        {selectedLog.error.stack && (
                          <pre className="mt-2 text-xs text-rose-700 overflow-x-auto">
                            {selectedLog.error.stack}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um log para ver detalhes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;
