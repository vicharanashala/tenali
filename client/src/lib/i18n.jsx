/**
 * i18n Engine for Tenali (Feature U)
 * 
 * Lightweight, zero-dependency internationalization system.
 * All translations are bundled as static JSON — no server calls, no API costs.
 * Switching languages is instant and works fully offline.
 * 
 * Supports: English, Hindi, Bengali, Marathi, Telugu, Tamil
 * Covers 72% of India's 1.4 billion population (NEP 2020 compliant)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Static imports — bundled at build time, zero runtime network cost
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import { translateDynamic } from './QuestionTranslator';
import { AutoTranslator } from './AutoTranslator';

const LOCALE_LOADERS = {
  en: () => en,
  hi: () => hi,
  bn: () => import('../locales/bn.json').then(m => m.default || m),
  mr: () => import('../locales/mr.json').then(m => m.default || m),
  te: () => import('../locales/te.json').then(m => m.default || m),
  ta: () => import('../locales/ta.json').then(m => m.default || m),
};

// Language metadata (displayed in the language selector)
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'bengali' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'devanagari' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'telugu' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'tamil' },
];

const STORAGE_KEY = 'tenali-lang';

const I18nContext = createContext();

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }) {
  // Load saved language preference from localStorage (default: English)
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [translations, setTranslations] = useState(locale === 'hi' ? hi : en);
  const [loading, setLoading] = useState(false);

  // Load translations when locale changes
  useEffect(() => {
    const loader = LOCALE_LOADERS[locale];
    if (!loader) return;

    const result = loader();
    if (result instanceof Promise) {
      setLoading(true);
      result.then(data => {
        setTranslations(data);
        setLoading(false);
      }).catch(() => {
        // Fallback to English if loading fails
        setTranslations(en);
        setLoading(false);
      });
    } else {
      setTranslations(result);
    }

    // Set lang attribute on <html> for CSS script-aware styling
    document.documentElement.setAttribute('lang', locale);

    // Persist preference
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {}
  }, [locale]);

  // Global fetch interceptor to translate API questions/options automatically
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // Only intercept successful JSON requests to our /api/ endpoints (excluding /check)
      if (response.ok && typeof args[0] === 'string' && args[0].includes('-api/') && !args[0].includes('/check')) {
        const clone = response.clone();
        try {
          const data = await clone.json();
          if (locale && locale !== 'en') {
            if (data.prompt) data.prompt = translateDynamic(data.prompt, locale);
            if (data.options) data.options = data.options.map(opt => typeof opt === 'string' ? translateDynamic(opt, locale) : opt);
            if (data.explanation) data.explanation = translateDynamic(data.explanation, locale);
            if (data.question) data.question = translateDynamic(data.question, locale);
            // Handle arrays of questions (if applicable)
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item.prompt) item.prompt = translateDynamic(item.prompt, locale);
                if (item.options) item.options = item.options.map(opt => typeof opt === 'string' ? translateDynamic(opt, locale) : opt);
                if (item.explanation) item.explanation = translateDynamic(item.explanation, locale);
                if (item.question) item.question = translateDynamic(item.question, locale);
              });
            }
          }
          // Return new response with translated data
          return new Response(JSON.stringify(data), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } catch (e) {
          // Fall back to original response if parsing fails
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [locale]);

  // Translation function with English fallback
  const t = useCallback((key, params, defaultValue) => {
    const safeTranslations = translations || en;
    let text = safeTranslations[key] || en[key] || defaultValue || key;

    // Support simple template parameters: t('question_of', { current: 3, total: 20 })
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }

    return text;
  }, [translations]);

  // Change language
  const setLocale = useCallback((code) => {
    if (LOCALE_LOADERS[code] && code !== locale) {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
      window.location.reload();
    }
  }, [locale]);

  // Check if current language has this key translated
  const hasTranslation = useCallback((key) => {
    return !!(translations && translations[key]);
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, hasTranslation, loading, LANGUAGES }}>
      <AutoTranslator />
      {children}
    </I18nContext.Provider>
  );
}
