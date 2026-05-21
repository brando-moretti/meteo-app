import React, { useState } from 'react';
import { Webhook, Play, AlertCircle, CheckCircle, HelpCircle, Code } from 'lucide-react';
import { N8NConfig, Language } from '../types';

interface N8NConfigWidgetProps {
  config: N8NConfig;
  setConfig: React.Dispatch<React.SetStateAction<N8NConfig>>;
  lang: Language;
}

export default function N8NConfigWidget({ config, setConfig, lang }: N8NConfigWidgetProps) {
  const isIt = lang === 'it';
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{ status?: number; responseText?: string; error?: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const t = {
    title: isIt ? "Integrazione Automazione n8n" : "n8n Automation Pipeline",
    desc: isIt ? "Invia le chiamate meteo al tuo workflow n8n per elaborazioni e automazioni intelligenti." : "Broker weather fetches through your custom n8n workflow for smart triggers.",
    enableLabel: isIt ? "Abilita Pipeline n8n" : "Enable n8n Pipeline",
    urlPlaceholder: isIt ? "Inserisci l'URL del webhook n8n..." : "Insert n8n Webhook URL...",
    apiDescription: isIt ? "Come funziona la connessione:" : "Connection Architecture:",
    integrationPayloadLabel: isIt ? "Payload di input inviato a n8n" : "JSON Input sent to n8n Webhook",
    testConnectionTitle: isIt ? "Invia un test per validare connessione" : "Send validation trigger payload",
    testBtn: isIt ? "Invia segnale di test" : "Dispatch test payload",
    n8nStatusIconLabel: isIt ? "Stato workflow" : "Pipeline status",
    n8nStatusConnected: isIt ? "Conneso e Approvato" : "Active & Ready",
    n8nStatusDisabled: isIt ? "Disattivato (Connessione Diretta)" : "Bypassed (Direct connection)",
    alertPlaceholderError: isIt ? "Errore di connessione" : "Connection error",
  };

  const handleToggle = () => {
    setConfig(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleChangeUrl = (url: string) => {
    setConfig(prev => ({ ...prev, webhookUrl: url }));
  };

  const runN8nTest = async () => {
    if (!config.webhookUrl) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-n8n', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: config.webhookUrl })
      });
      if (res.ok) {
        const body = await res.json();
        setTestResult(body);
      } else {
        setTestResult({ error: `Server returned code ${res.status}` });
      }
    } catch (err: any) {
      setTestResult({ error: err.message || "Failed to call test endpoint" });
    } finally {
      setTesting(false);
    }
  };

  const samplePayload = `{
  "latitude": 45.4642,
  "longitude": 9.1900,
  "cityName": "Milano",
  "timestamp": "2026-05-21T08:56:10Z"
}`;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 select-none relative">
      
      {/* Title */}
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans uppercase tracking-tight flex items-center">
            <Webhook className="w-4 h-4 text-indigo-500 mr-2" />
            {t.title}
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">{t.desc}</p>
        </div>
        <div className="flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
          <span className="text-xs font-mono font-bold">n8n Gateway</span>
        </div>
      </div>

      {/* Primary Configuration Switch */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 font-sans block">{t.enableLabel}</span>
          <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
            {config.enabled ? t.n8nStatusConnected : t.n8nStatusDisabled}
          </span>
        </div>

        {/* Switch Toggle */}
        <button
          id="toggle-n8n-pipeline"
          onClick={handleToggle}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
            config.enabled ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
        >
          <div 
            className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Webhook URL Input */}
      {config.enabled && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 font-sans block mb-1.5">
              Webhook URL (POST)
            </label>
            <input
              id="n8n-webhook-endpoint-input"
              type="url"
              value={config.webhookUrl}
              onChange={(e) => handleChangeUrl(e.target.value)}
              placeholder={t.urlPlaceholder}
              className="w-full bg-white text-slate-800 text-xs font-sans rounded-xl p-3 border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-xs"
            />
          </div>

          {/* Test Dispatching triggers */}
          {config.webhookUrl && (
            <div className="p-4 rounded-2xl bg-indigo-50/10 border border-indigo-100/40">
              <h4 className="text-xs font-bold text-indigo-700 font-sans mb-1">{t.testConnectionTitle}</h4>
              <p className="text-[10px] text-slate-400 font-sans mb-3">Questo invierà un payload di test vuoto per controllare l'indirizzo.</p>

              <button
                id="n8n-connection-tester-btn"
                onClick={runN8nTest}
                disabled={testing}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-sans text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition flex items-center space-x-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{testing ? 'Inviando...' : t.testBtn}</span>
              </button>

              {/* Display Test Results */}
              {testResult && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto select-text">
                  {testResult.error ? (
                    <div className="flex items-center text-rose-400">
                      <AlertCircle className="w-4.5 h-4.5 mr-1" />
                      <span>{t.alertPlaceholderError}: {testResult.error}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center text-green-400 font-semibold mb-1">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Risposta Ricevuta (Status {testResult.status})</span>
                      </div>
                      <span className="text-slate-400">Response:</span> {testResult.responseText || "Nessun testo"}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* API Documentation block */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center space-x-2 mb-2 text-slate-700">
          <Code className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold font-sans uppercase tracking-wide">{t.apiDescription}</h4>
        </div>
        
        <p className="text-[11px] text-slate-500 font-sans leading-relaxed mb-3">
          Quando Aura effettua una query, invierà le seguenti specifiche geografiche via richiesta POST. n8n dovrà idealmente ricevere i dati ed effettuare le aggregazioni sul provider preferito.
        </p>

        <span className="text-[10px] text-slate-400 font-mono block mb-1 uppercase tracking-wider">{t.integrationPayloadLabel}:</span>
        <pre className="p-3 bg-slate-900 text-slate-300 font-mono text-[10px] rounded-xl overflow-x-auto leading-relaxed select-text">
          {samplePayload}
        </pre>
      </div>

    </div>
  );
}
