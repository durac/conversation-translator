import React from 'react';
import { languages } from '../lib/languages';

type LanguageSelectorProps = {
  value: string;
  onChange: (language: string) => void;
  className?: string;
  placeholder?: string;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  value, 
  onChange, 
  className = '',
  placeholder = 'Select your language'
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`input bg-white ${className}`}
    >
      <option value="" disabled>{placeholder}</option>
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;