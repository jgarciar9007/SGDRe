import React, { createContext, useContext, useState, useEffect } from 'react';

const DocumentContext = createContext();

export const useDocuments = () => {
    const context = useContext(DocumentContext);
    if (!context) {
        throw new Error('useDocuments must be used within a DocumentProvider');
    }
    return context;
};

// Master Data Catalogs
export const DEPARTMENTS = [
    'Presidencia CNDES',
    'Secretaría General',
    'Gabinete Técnico',
    'Administración y Finanzas',
    'Recursos Humanos',
    'Comunicación y Relaciones Públicas',
    'Informática y Tecnología',
    'Planificación Estratégica',
    'Cooperación Internacional',
    'Archivo y Documentación'
];

export const EXTERNAL_ENTITIES = [
    'Presidencia de la República',
    'Ministerio de Hacienda',
    'Ministerio de Asuntos Exteriores',
    'Banco Mundial',
    'FMI',
    'PNUD',
    'Embajadas',
    'GE Proyectos',
    'Empresas Privadas',
    'Particulares'
];

export const DocumentProvider = ({ children }) => {
    // Documents State
    const [documents, setDocuments] = useState(() => {
        const saved = localStorage.getItem('cndes_documents');
        return saved ? JSON.parse(saved) : [];
    });

    // Counters State for Auto-Numbering
    const [counters, setCounters] = useState(() => {
        const saved = localStorage.getItem('cndes_counters');
        return saved ? JSON.parse(saved) : {
            salida: 0,
            interno: 0,
            year: new Date().getFullYear()
        };
    });

    useEffect(() => {
        localStorage.setItem('cndes_documents', JSON.stringify(documents));
    }, [documents]);

    useEffect(() => {
        localStorage.setItem('cndes_counters', JSON.stringify(counters));
    }, [counters]);

    // Check for year change to reset counters could be implemented here
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        if (counters.year !== currentYear) {
            setCounters({
                salida: 0,
                interno: 0,
                year: currentYear
            });
        }
    }, []);

    const generateNextDocNumber = (type) => {
        const year = new Date().getFullYear();
        if (type === 'Salida') {
            const next = counters.salida + 1;
            return `CNDES/SAL/${year}/${String(next).padStart(3, '0')}`;
        } else if (type === 'Interno') {
            const next = counters.interno + 1;
            return `CNDES/INT/${year}/${String(next).padStart(3, '0')}`;
        }
        return '';
    };

    const addDocument = (doc) => {
        // Increment counter if it was an auto-generated type
        if (doc.type === 'Salida') {
            setCounters(prev => ({ ...prev, salida: prev.salida + 1 }));
        } else if (doc.type === 'Interno') {
            setCounters(prev => ({ ...prev, interno: prev.interno + 1 }));
        }

        const newDoc = {
            ...doc,
            // Auto-generate Order Number if not present (simple sequential per log)
            id: doc.id || String(documents.length + 1).padStart(3, '0')
        };
        setDocuments(prev => [newDoc, ...prev]);
    };

    const deleteDocument = (id) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    const updateDocument = (id, updatedFields) => {
        setDocuments(prev => prev.map(doc => (doc.id === id ? { ...doc, ...updatedFields } : doc)));
    };

    const getNextOrderNumber = () => {
        return String(documents.length + 1).padStart(3, '0');
    };

    return (
        <DocumentContext.Provider value={{
            documents,
            addDocument,
            deleteDocument,
            updateDocument,
            getNextOrderNumber,
            generateNextDocNumber,
            departments: DEPARTMENTS,
            externalEntities: EXTERNAL_ENTITIES
        }}>
            {children}
        </DocumentContext.Provider>
    );
};
