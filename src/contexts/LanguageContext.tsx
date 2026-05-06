import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'pt';

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (en: string, pt: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Persist language preference
    const [lang, setLangState] = useState<Language>(() => {
        const saved = localStorage.getItem('wurm_analytics_lang');
        return (saved === 'pt' || saved === 'en') ? saved : 'en';
    });

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem('wurm_analytics_lang', newLang);
        document.documentElement.lang = newLang; // Good for SEO
    };

    // Helper for inline translations: t("Hello", "Olá")
    const t = (en: string, pt: string) => {
        return lang === 'en' ? en : pt;
    };

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
