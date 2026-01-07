import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = useCallback((username, password) => {
        // Simulated authentication logic
        if (username === 'admin' && password === 'admin123') {
            const userData = { username: 'admin', role: 'Admin', name: 'Administrador Sistema' };
            setUser(userData);
            localStorage.setItem('cndes_user', JSON.stringify(userData));
            return { success: true };
        } else if (username === 'recep' && password === 'recep123') {
            const userData = { username: 'recep', role: 'Receptionist', name: 'Recepcionista CNDES' };
            setUser(userData);
            localStorage.setItem('cndes_user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: 'Credenciales inválidas' };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('cndes_user');
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
