import React, { createContext, useContext, useState } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};

export const LayoutProvider = ({ children }) => {
    const [hideBottomNav, setHideBottomNav] = useState(false);

    return (
        <LayoutContext.Provider value={{ hideBottomNav, setHideBottomNav }}>
            {children}
        </LayoutContext.Provider>
    );
};
