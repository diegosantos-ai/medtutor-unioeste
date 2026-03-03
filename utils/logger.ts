// Sistema de Logging para Diagnóstico
// Captura erros, comportamentos e interações do usuário

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  userAgent: string;
  url: string;
  sessionId: string;
}

const MAX_LOGS = 100;
const STORAGE_KEY = 'medtutor_logs';
const SESSION_KEY = 'medtutor_session_id';

class Logger {
  private sessionId: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private setupGlobalErrorHandlers() {
    // Captura erros JavaScript não tratados
    window.addEventListener('error', (event) => {
      this.log('ERROR', 'Global', 'Erro JavaScript não tratado', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, {
        message: event.message,
        stack: event.error?.stack,
        name: event.error?.name,
      });
    });

    // Captura rejeições de Promise não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.log('ERROR', 'Global', 'Promise rejeitada não tratada', {
        reason: error?.message || String(error),
      }, error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined);
    });
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      online: navigator.onLine,
    };
  }

  log(
    level: LogLevel,
    component: string,
    message: string,
    data?: any,
    error?: { message: string; stack?: string; name?: string }
  ): void {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data: {
        ...data,
        device: this.getDeviceInfo(),
      },
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
    };

    // Salva no localStorage
    this.saveLog(entry);

    // Também loga no console em desenvolvimento
    if (import.meta.env.DEV) {
      const consoleMethod = level === 'ERROR' || level === 'FATAL' ? 'error' 
        : level === 'WARN' ? 'warn' 
        : 'log';
      console[consoleMethod](`[${level}] ${component}:`, message, data, error);
    }
  }

  private saveLog(entry: LogEntry): void {
    try {
      const existingLogs = this.getLogs();
      const newLogs = [entry, ...existingLogs].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
    } catch (e) {
      console.error('Erro ao salvar log:', e);
    }
  }

  getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Erro ao recuperar logs:', e);
      return [];
    }
  }

  clearLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exportLogs(): string {
    const logs = this.getLogs();
    const exportData = {
      exportDate: new Date().toISOString(),
      sessionId: this.sessionId,
      device: this.getDeviceInfo(),
      logs,
    };
    return JSON.stringify(exportData, null, 2);
  }

  downloadLogs(): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medtutor_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Métodos de conveniência
  debug(component: string, message: string, data?: any) {
    this.log('DEBUG', component, message, data);
  }

  info(component: string, message: string, data?: any) {
    this.log('INFO', component, message, data);
  }

  warn(component: string, message: string, data?: any) {
    this.log('WARN', component, message, data);
  }

  error(component: string, message: string, error?: Error, data?: any) {
    this.log('ERROR', component, message, data, error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined);
  }

  fatal(component: string, message: string, error?: Error, data?: any) {
    this.log('FATAL', component, message, data, error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined);
  }

  // Log de performance
  logPerformance(component: string, action: string, durationMs: number, data?: any) {
    this.log('INFO', component, `Performance: ${action}`, {
      ...data,
      durationMs,
      action,
    });
  }

  // Log de API
  logApiRequest(method: string, url: string, data?: any) {
    this.log('DEBUG', 'API', `Request: ${method} ${url}`, { method, url, data });
  }

  logApiResponse(method: string, url: string, status: number, data?: any, error?: Error) {
    const level = status >= 400 ? 'ERROR' : 'DEBUG';
    this.log(level, 'API', `Response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      data,
    }, error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : undefined);
  }

  // Log de navegação
  logNavigation(from: string, to: string) {
    this.log('INFO', 'Navigation', `Navegação: ${from} → ${to}`, { from, to });
  }

  // Log de interação do usuário
  logUserAction(action: string, component: string, details?: any) {
    this.log('INFO', component, `Ação do usuário: ${action}`, details);
  }
}

// Instância singleton
export const logger = new Logger();

// Hook para uso em componentes React
export function useLogger(component: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(component, message, data),
    info: (message: string, data?: any) => logger.info(component, message, data),
    warn: (message: string, data?: any) => logger.warn(component, message, data),
    error: (message: string, error?: Error, data?: any) => logger.error(component, message, error, data),
    logPerformance: (action: string, durationMs: number, data?: any) => 
      logger.logPerformance(component, action, durationMs, data),
    logUserAction: (action: string, details?: any) => 
      logger.logUserAction(action, component, details),
  };
}

export default logger;
