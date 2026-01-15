import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, HelpCircle } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title = 'SGDRecep',
    children,
    footer,
    type = 'default' // 'default', 'confirm', 'prompt', 'alert'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-root">
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className="modal-container">
                        <motion.div
                            className="modal-content glass"
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="header-title">
                                    {type === 'alert' && <AlertCircle className="text-warning" size={20} />}
                                    {type === 'confirm' && <HelpCircle className="text-primary" size={20} />}
                                    <h3>{title}</h3>
                                </div>
                                <button className="close-btn" onClick={onClose}><X size={20} /></button>
                            </div>

                            <div className="modal-body">
                                {children}
                            </div>

                            {footer && (
                                <div className="modal-footer">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <style jsx>{`
                        .modal-root {
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100vw;
                            height: 100vh;
                            z-index: 9999;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        .modal-backdrop {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(15, 23, 42, 0.6);
                            backdrop-filter: blur(4px);
                        }
                        .modal-container {
                            position: relative;
                            z-index: 10000;
                            width: 100%;
                            max-width: 450px;
                            padding: 20px;
                        }
                        .modal-content {
                            background: white;
                            border-radius: 16px;
                            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                            overflow: hidden;
                        }
                        .modal-header {
                            padding: 20px 24px;
                            border-bottom: 1px solid #f1f5f9;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .header-title {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                        }
                        .modal-header h3 {
                            margin: 0;
                            font-size: 1.1rem;
                            color: #1e293b;
                            font-weight: 700;
                        }
                        .close-btn {
                            background: none;
                            border: none;
                            cursor: pointer;
                            color: #94a3b8;
                            padding: 4px;
                            border-radius: 6px;
                            transition: all 0.2s;
                        }
                        .close-btn:hover {
                            background: #f1f5f9;
                            color: #475569;
                        }
                        .modal-body {
                            padding: 24px;
                            color: #475569;
                            font-size: 0.95rem;
                            line-height: 1.5;
                        }
                        .modal-footer {
                            padding: 16px 24px;
                            background: #f8fafc;
                            border-top: 1px solid #f1f5f9;
                            display: flex;
                            justify-content: flex-end;
                            gap: 12px;
                        }
                        .text-warning { color: #f59e0b; }
                        .text-primary { color: #3b82f6; }
                    `}</style>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
