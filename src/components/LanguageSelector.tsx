import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' }
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLanguageChange = (languageCode: string) => {
    void i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
        aria-label={t('accessibility.languageSelector')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Languages className="w-5 h-5 text-slate-400" aria-hidden="true" />
        <span className="text-sm text-slate-400 uppercase">{i18n.language}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
            role="menu"
            aria-label="Language selection"
          >
            <div className="py-2">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-700 transition-colors flex items-center justify-between"
                  role="menuitem"
                >
                  <div>
                    <div className="text-slate-200 font-medium">{language.nativeName}</div>
                    <div className="text-xs text-slate-400">{language.name}</div>
                  </div>
                  {i18n.language === language.code && (
                    <Check className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
