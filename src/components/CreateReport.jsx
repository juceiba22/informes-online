import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { parseTextToReport } from '../services/gemini';
import { Sparkles, Copy, ExternalLink, Check, FileText, Loader2, Sun } from 'lucide-react';

const THEMES = [
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    desc: 'Estética Fintech premium, fondos oscuros y acentos dorados.',
    bgColor: '#080C10',
    accentColor: '#E3B64F',
    textColor: '#F0F6FC',
    borderColor: 'rgba(255,255,255,0.08)'
  },
  {
    id: 'corporate-light',
    name: 'Corporate Light',
    desc: 'Estética limpia institucional con acento azul corporativo.',
    bgColor: '#F8FAFC',
    accentColor: '#0284C7',
    textColor: '#0F172A',
    borderColor: '#E2E8F0'
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    desc: 'Estética de terminal/desarrollador en negro y verde neón.',
    bgColor: '#000000',
    accentColor: '#22C55E',
    textColor: '#E5E5E5',
    borderColor: '#262626',
    font: 'monospace'
  },
  {
    id: 'executive-pitch',
    name: 'Executive Pitch',
    desc: 'Alto contraste, tipografía moderna y enfoque presentación.',
    bgColor: '#0F172A',
    accentColor: '#38BDF8',
    textColor: '#F8FAFC',
    borderColor: 'rgba(255,255,255,0.1)'
  },
  {
    id: 'argentine-sky',
    name: 'Argentine Sky',
    desc: 'Estética patria, fondos claros, celeste cielo y detalles en amarillo sol.',
    bgColor: '#F0F4F8',
    accentColor: '#74ACDF',
    textColor: '#1E293B',
    borderColor: '#D0DDEC'
  },
  {
    id: 'brutalist-yellow',
    name: 'Brutalist Yellow',
    desc: 'Estética retro brutalista, alto contraste, bordes amarillos y fondo oscuro.',
    bgColor: '#121212',
    accentColor: '#F1B51C',
    textColor: '#FFFFFF',
    borderColor: '#F1B51C',
    font: 'monospace'
  }
];

export default function CreateReport() {
  const [rawText, setRawText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('dark-luxury');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Process plain text with Gemini
      const reportJson = await parseTextToReport(rawText);

      // 2. Save structured report to Firestore
      const docRef = await addDoc(collection(db, 'reports'), {
        content: reportJson,
        theme: selectedTheme,
        createdAt: serverTimestamp()
      });

      // 3. Set success state with unique ID
      const shareUrl = `${window.location.origin}/r/${docRef.id}`;
      setSuccessData({ id: docRef.id, shareUrl });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ocurrió un error inesperado al procesar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!successData) return;
    navigator.clipboard.writeText(successData.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: '#030712', minHeight: '100vh', padding: '1px 0' }}>
      <div className="creator-container animate-fade-in">
        <div className="creator-header">
          <div style={{ display: 'inline-flex', padding: '8px', background: 'rgba(241, 181, 28, 0.15)', borderRadius: '12px', color: '#F1B51C', marginBottom: '16px' }}>
            <Sun size={28} />
          </div>
          <h1 className="creator-title">Argentum AI</h1>
          <p className="creator-subtitle">
            Convierte tus notas, textos o borradores en reportes ejecutivos interactivos listos para compartir.
          </p>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label className="form-label">Contenido de Entrada (Notas, Texto o Código)</label>
            <textarea
              className="textarea-input"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Pega aquí tus notas desordenadas, un fragmento de código, apuntes de reuniones o texto estructurado..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Elige un Tema Estético Premium</label>
            <div className="theme-selector-grid">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-card ${selectedTheme === theme.id ? 'active' : ''}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="theme-card-title">
                    <span>{theme.name}</span>
                    {selectedTheme === theme.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }} />}
                  </div>
                  <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>{theme.desc}</p>
                  
                  {/* Miniature Visual Preview of theme variables */}
                  <div 
                    className="theme-preview" 
                    style={{ 
                      backgroundColor: theme.bgColor, 
                      borderColor: theme.borderColor,
                      color: theme.textColor,
                      fontFamily: theme.font || 'sans-serif'
                    }}
                  >
                    <div className="preview-bar" style={{ backgroundColor: theme.accentColor }} />
                    <div className="preview-subbar" style={{ backgroundColor: theme.textColor, opacity: 0.3 }} />
                    <div className="preview-btn" style={{ backgroundColor: theme.accentColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading || !rawText.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span>Procesando con Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Procesar y Generar Reporte</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">
              <FileText size={32} />
            </div>
            <h3 className="modal-title">¡Reporte Creado!</h3>
            <p className="modal-desc">
              Tu reporte ha sido procesado con IA y ya está disponible públicamente en internet.
            </p>

            <div className="share-link-box">
              <input 
                type="text" 
                className="share-link-input" 
                value={successData.shareUrl} 
                readOnly 
              />
              <button className="btn-copy" onClick={copyToClipboard}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="modal-actions">
              <a 
                href={`/r/${successData.id}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-action-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>Ver Reporte</span>
                <ExternalLink size={16} />
              </a>
              <button 
                className="btn-action-secondary" 
                onClick={() => {
                  setSuccessData(null);
                  setRawText('');
                }}
              >
                Crear Otro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
