'use client';

import { useState, useEffect } from 'react';

interface DebugLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  component: string;
  message: string;
  data?: unknown;
}

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function DebugPanel({ isVisible, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Listen for debug messages from console.log
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.log = (...args) => {
      originalConsoleLog(...args);
      addLog('info', 'Console', args.join(' '));
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      addLog('error', 'Console', args.join(' '));
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      addLog('warning', 'Console', args.join(' '));
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  const addLog = (type: DebugLog['type'], component: string, message: string, data?: unknown) => {
    const newLog: DebugLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      component,
      message,
      data
    };

    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep only last 100 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const getLogIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getLogColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isMinimized ? '▼' : '▲'}
          </button>
          <h3 className="text-sm font-medium text-gray-800">Debug Panel</h3>
          <span className="text-xs text-gray-500">({logs.length} logs)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-64 overflow-y-auto bg-gray-900 text-green-400 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No debug logs yet. Try clicking on search results or performing actions.
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 py-1 border-b border-gray-700 last:border-b-0">
                  <span className="text-gray-500 text-xs mt-0.5">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-xs mt-0.5">
                    {getLogIcon(log.type)}
                  </span>
                  <span className="text-blue-400 text-xs mt-0.5 min-w-0 flex-shrink-0">
                    [{log.component}]
                  </span>
                  <span className={`text-xs mt-0.5 flex-1 break-words ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                  {log.data !== undefined ? (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                        Data
                      </summary>
                      <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                        {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
