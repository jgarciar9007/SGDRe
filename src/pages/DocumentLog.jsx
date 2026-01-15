import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Eye, FileText, ArrowUpRight, ArrowDownLeft, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDocuments } from '../context/DocumentContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const DocumentLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null); // For View Modal
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const { user } = useAuth();
  const { documents, deleteDocument } = useDocuments();
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (user?.role !== 'Admin') return;
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (confirmModal.id) {
      deleteDocument(confirmModal.id);
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const handleEdit = (doc) => {
    navigate(`/edit/${doc.id}`);
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
  };

  const handleDownload = (file) => {
    setToast('El fichero se está descargando...');

    if (file && file.url) {
      // Create invisible link and trigger download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback or just simulation for legacy data without content
      console.warn("No content URL found for download");
    }

    setTimeout(() => setToast(null), 3000);
  };

  const filteredDocuments = documents.filter(doc => {
    const term = searchTerm.toLowerCase();
    return (
      (doc.id && doc.id.toLowerCase().includes(term)) ||
      (doc.summary && doc.summary.toLowerCase().includes(term)) ||
      (doc.origin && doc.origin.toLowerCase().includes(term)) ||
      (doc.destination && doc.destination.toLowerCase().includes(term)) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(term)) ||
      (doc.observations && doc.observations.toLowerCase().includes(term)) ||
      (doc.type && doc.type.toLowerCase().includes(term)) ||
      (doc.registrationDate && doc.registrationDate.includes(term)) ||
      (doc.docDate && doc.docDate.includes(term))
    );
  }).sort((a, b) => {
    // Sort by Registration Date Descending
    const dateA = new Date(a.registrationDate);
    const dateB = new Date(b.registrationDate);
    if (dateB - dateA !== 0) return dateB - dateA;
    // Secondary sort by ID desc if dates equal
    return b.id.localeCompare(a.id);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="log-container"
    >
      <div className="log-header-actions glass mb-4">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Buscar por extracto, procedencia o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn-secondary"><Filter size={18} /> Filtrar</button>
          <button className="btn-secondary"><Download size={18} /> Exportar</button>
        </div>
      </div>

      <div className="table-wrapper glass">
        <table className="log-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Nº</th>
              <th>Fecha Reg.</th>
              <th>Tipo</th>
              <th>Nº Doc.</th>
              <th>Fecha Doc.</th>
              <th>Procedencia</th>
              <th>Destino</th>
              <th style={{ width: '25%' }}>Extracto de Contenido</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(doc => (
                <tr key={doc.id}>
                  <td className="font-mono text-center">{doc.id}</td>
                  <td className="text-sm">{doc.registrationDate}</td>
                  <td>
                    <span className={`badge ${doc.type === 'Entrada' ? 'bg-success' : 'bg-primary'}`}>
                      {doc.type === 'Entrada' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {doc.type}
                    </span>
                  </td>
                  <td className="text-sm font-mono">{doc.docNumber}</td>
                  <td className="text-sm">{doc.docDate}</td>
                  <td className="text-sm font-medium">{doc.origin}</td>
                  <td className="text-sm font-medium">{doc.destination}</td>
                  <td>
                    <div className="doc-summary">
                      <FileText size={14} className="text-muted" />
                      <span>{doc.summary}</span>
                    </div>
                  </td>
                  <td className="text-sm text-muted">{doc.observations}</td>
                  <td>
                    <div className="action-btns">
                      <button title="Ver Detalles" onClick={() => handleView(doc)}><Eye size={18} /></button>
                      <button title="Modificar" onClick={() => handleEdit(doc)}><Pencil size={18} /></button>
                      {user?.role === 'Admin' && (
                        <button
                          title="Eliminar"
                          onClick={() => handleDelete(doc.id)}
                          className="delete-btn"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center p-8 text-muted">No se encontraron documentos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              className="modal-content glass"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Detalle del Documento</h3>
                <button className="close-btn" onClick={() => setSelectedDoc(null)}><X size={20} /></button>
              </div>

              <div className="modal-body">
                <div className="detail-row">
                  <strong>Nº Orden:</strong> <span>{selectedDoc.id}</span>
                </div>
                <div className="detail-row">
                  <strong>Tipo:</strong>
                  <span className={`badge ${selectedDoc.type === 'Entrada' ? 'bg-success' : 'bg-primary'}`}>
                    {selectedDoc.type}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Fecha Registro:</strong> <span>{selectedDoc.registrationDate}</span>
                </div>

                <hr className="divider" />

                <div className="detail-row">
                  <strong>Nº Documento:</strong> <span>{selectedDoc.docNumber}</span>
                </div>
                <div className="detail-row">
                  <strong>Fecha Documento:</strong> <span>{selectedDoc.docDate}</span>
                </div>
                <div className="detail-row">
                  <strong>Procedencia:</strong> <span>{selectedDoc.origin}</span>
                </div>
                <div className="detail-row">
                  <strong>Destino:</strong> <span>{selectedDoc.destination}</span>
                </div>

                <hr className="divider" />

                <div className="detail-column">
                  <strong>Extracto de Contenido:</strong>
                  <p>{selectedDoc.summary}</p>
                </div>
                <div className="detail-column">
                  <strong>Observaciones:</strong>
                  <p>{selectedDoc.observations || 'Ninguna'}</p>
                </div>

                {/* Attachments Section */}
                {(selectedDoc.attachments && selectedDoc.attachments.length > 0) ? (
                  <div className="attachments-section">
                    <strong>Adjuntos:</strong>
                    {selectedDoc.attachments.map((file, idx) => (
                      <div key={idx} className="file-attachment">
                        <FileText size={20} />
                        <div className="file-info">
                          <span>{file.name}</span>
                          <small>{file.size ? (file.size / 1024).toFixed(0) + ' KB' : 'Documento'}</small>
                        </div>
                        <button className="btn-download" onClick={() => handleDownload(file)}>
                          <Download size={16} /> Descargar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : selectedDoc.fileName && (
                  <div className="file-attachment">
                    <FileText size={20} />
                    <div className="file-info">
                      <span>{selectedDoc.fileName}</span>
                      <small>Documento Digitalizado</small>
                    </div>
                    <button className="btn-download" onClick={() => handleDownload({ name: selectedDoc.fileName, url: null })}>
                      <Download size={16} /> Descargar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="toast-notification"
          >
            <Download size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        title="Confirmar Eliminación"
        type="confirm"
        footer={(
          <>
            <button
              className="btn-modal-cancel"
              onClick={() => setConfirmModal({ isOpen: false, id: null })}
            >
              Cancelar
            </button>
            <button
              className="btn-modal-delete"
              onClick={confirmDelete}
            >
              Eliminar
            </button>
          </>
        )}
      >
        <p>¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.</p>
      </Modal>

      <style jsx>{`
        /* Modal specific buttons */
        .btn-modal-delete { padding: 8px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-modal-cancel { padding: 8px 20px; background: white; border: 1px solid #e2e8f0; color: #64748b; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-modal-delete:hover { background: #dc2626; }

        .log-header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-radius: 12px;
          background: white;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 8px;
          width: 400px;
        }

        .search-box input {
          background: none;
          border: none;
          padding: 0;
          width: 100%;
          outline: none;
        }

        .filter-actions {
          display: flex;
          gap: 12px;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          color: var(--color-text);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .table-wrapper {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); /* shadow-sm replacement */
          overflow-x: auto;
        }

        .log-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        .log-table th {
          background: #f8fafc;
          padding: 12px 16px;
          font-weight: 700;
          color: #64748b; /* slate-500 */
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }

        .log-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .text-center { text-align: center; }
        .text-sm { font-size: 0.875rem; }
        .font-medium { font-weight: 500; }
        .text-muted { color: #94a3b8; }

        .doc-summary {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.4;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
        }

        .bg-success { background: #10b981; }
        .bg-primary { background: #3b82f6; }

        .action-btns {
          display: flex;
          gap: 8px;
          color: #64748b;
        }

        .action-btns button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
          color: inherit;
        }

        .action-btns button:hover { color: #3b82f6; background: #f1f5f9; }
        .action-btns .delete-btn:hover { color: #ef4444; background: #fee2e2; }

        .mb-4 { margin-bottom: 24px; }

        /* Modal Styles */
        .modal-backdrop {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 1000;
            display: flex; justify-content: center; align-items: center;
        }
        .modal-content {
            background: white; width: 500px; max-width: 90%;
            border-radius: 12px; padding: 24px;
            max-height: 90vh; overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-header h3 { margin: 0; color: var(--color-primary); }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        
        .modal-body { display: flex; flex-direction: column; gap: 12px; }
        .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #f1f5f9; padding-bottom: 8px; }
        .detail-column { display: flex; flex-direction: column; gap: 4px; }
        .detail-column p { background: #f8fafc; padding: 10px; border-radius: 8px; margin: 0; font-size: 0.9rem; }
        .divider { width: 100%; border: none; border-top: 2px solid #f1f5f9; margin: 8px 0; }

        .file-attachment {
            display: flex; align-items: center; gap: 12px;
            background: #eff6ff; border: 1px solid #bfdbfe;
            padding: 12px; border-radius: 8px; margin-top: 12px;
            flex-wrap: wrap; /* Allow wrapping on small screens */
        }
        .file-info { 
            flex: 1; 
            display: flex; 
            flex-direction: column; 
            min-width: 0; /* Crucial for text truncation/wrapping in flex */
        }
        .file-info span { 
            font-weight: 600; 
            font-size: 0.9rem; 
            color: #1e40af; 
            word-break: break-word; /* Wrap long filenames */
            line-height: 1.3;
        }
        .file-info small { color: #60a5fa; font-size: 0.75rem; }
        .btn-download {
            background: white; border: 1px solid #bfdbfe; color: #1e40af;
            padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
            display: flex; align-items: center; gap: 8px; cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
        }
        .btn-download:hover { background: #dbeafe; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .toast-notification {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 2000;
            font-weight: 500;
            font-size: 0.9rem;
        }
      `}</style>
    </motion.div>
  );
};

export default DocumentLog;
