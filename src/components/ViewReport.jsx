import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Printer, ArrowLeft, Loader2, Sparkles, AlertCircle, Sun } from 'lucide-react';

export default function ViewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [theme, setTheme] = useState('dark-luxury');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const docRef = doc(db, 'reports', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setReport(data.content);
          setTheme(data.theme || 'dark-luxury');
        } else {
          setError('El reporte solicitado no existe o fue eliminado.');
        }
      } catch (err) {
        console.error(err);
        setError('Error al conectar con la base de datos de Firestore.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#030712', color: '#f3f4f6' }}>
        <Loader2 className="spinner spinner-large" style={{ marginBottom: '16px' }} />
        <p style={{ fontSize: '16px', fontWeight: 500 }}>Cargando reporte interactivo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#030712', padding: '1px 0' }}>
        <div className="error-card animate-fade-in">
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 className="error-title">¡Ups! Algo salió mal</h2>
          <p className="error-desc">{error}</p>
          <Link to="/" className="btn-control" style={{ display: 'inline-flex', textDecoration: 'none', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
            <span>Volver al Creador</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-container theme-${theme}`}>
      <div className="report-wrapper animate-fade-in">
        
        {/* Top Controls Bar (Hidden during printing) */}
        <div className="top-actions-bar no-print">
          <Link to="/" className="logo-link">
            <Sun size={20} style={{ color: '#F1B51C' }} />
            <span>Argentum AI</span>
          </Link>

          <div className="right-controls">
            {/* Real-time Theme selector dropdown */}
            <div className="theme-dropdown">
              <select 
                className="theme-select" 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                title="Cambiar tema en tiempo real"
              >
                <option value="dark-luxury">💎 Dark Luxury</option>
                <option value="corporate-light">🏢 Corporate Light</option>
                <option value="minimal-mono">📟 Minimal Mono</option>
                <option value="executive-pitch">📊 Executive Pitch</option>
                <option value="argentine-sky">☀️ Argentine Sky</option>
                <option value="brutalist-yellow">🚧 Brutalist Yellow</option>
              </select>
            </div>

            <button className="btn-control" onClick={handlePrint}>
              <Printer size={16} />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <article className="report-body">
          {/* Cover Header */}
          <header className="report-header-section">
            {report.badge && (
              <span className="report-badge">{report.badge}</span>
            )}
            <h1 className="report-title">{report.title}</h1>
            <p className="report-subtitle">{report.subtitle}</p>
          </header>

          {/* Executive Summary */}
          {report.summary && (
            <div className="report-summary-box">
              <div className="report-summary-title">Resumen Ejecutivo</div>
              <p>{report.summary}</p>
            </div>
          )}

          {/* Dynamic Content Sections */}
          {report.sections && report.sections.map((section, sIndex) => {
            const hasItems = section.items && section.items.length > 0;
            return (
              <section key={sIndex} className="section-block">
                <h2 className="section-header">
                  {section.icon && <span style={{ marginRight: '6px' }}>{section.icon}</span>}
                  <span>{section.title}</span>
                </h2>

                {/* Bullets Content Type */}
                {section.contentType === 'bullets' && hasItems && (
                  <ul className="bullets-list">
                    {section.items.map((item, iIndex) => (
                      <li key={iIndex} className="bullet-item">
                        {item.label && <div className="bullet-label">{item.label}</div>}
                        {item.value && <div className="bullet-value">{item.value}</div>}
                        {item.description && <div className="bullet-value" style={{ marginTop: '4px', fontStyle: 'italic', fontSize: '12px' }}>{item.description}</div>}
                        {item.tag && <span className="bullet-tag">{item.tag}</span>}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Cards Content Type */}
                {section.contentType === 'cards' && hasItems && (
                  <div className="cards-grid">
                    {section.items.map((item, iIndex) => (
                      <div key={iIndex} className="content-card">
                        <div>
                          {item.label && <h4 className="card-label">{item.label}</h4>}
                          {item.value && <p className="card-value">{item.value}</p>}
                          {item.description && <p className="card-value" style={{ fontStyle: 'italic', fontSize: '11px', opacity: 0.8 }}>{item.description}</p>}
                        </div>
                        {item.tag && <span className="card-tag">{item.tag}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Table Content Type */}
                {section.contentType === 'table' && hasItems && (
                  <div className="table-container">
                    <table className="report-table">
                      <thead>
                        <tr>
                          <th>Componente / Ítem</th>
                          <th>Valor</th>
                          <th>Descripción / Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, iIndex) => (
                          <tr key={iIndex}>
                            <td>
                              <strong>{item.label || '-'}</strong>
                              {item.tag && (
                                <span className="bullet-tag" style={{ marginLeft: '8px', verticalAlign: 'middle', marginTop: 0 }}>
                                  {item.tag}
                                </span>
                              )}
                            </td>
                            <td>{item.value || '-'}</td>
                            <td>{item.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Code Content Type */}
                {section.contentType === 'code' && (
                  <div className="code-block-container">
                    <div className="code-header-bar">
                      <span>{section.title || 'Código Fuente'}</span>
                      <span>Text / Code Editor</span>
                    </div>
                    {section.codeOrTree ? (
                      <pre className="code-pre">
                        <code>{section.codeOrTree}</code>
                      </pre>
                    ) : hasItems ? (
                      <pre className="code-pre">
                        <code>
                          {section.items.map(item => `${item.label || ''}${item.value ? ': ' + item.value : ''}${item.description ? ' // ' + item.description : ''}`).join('\n')}
                        </code>
                      </pre>
                    ) : (
                      <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>Ningún código provisto.</div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {/* Footer Info */}
          <footer className="report-footer">
            <span>Argentum AI · Impulsado por Gemini 2.5 Flash</span>
            <span>Documento Web Interactivo</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
