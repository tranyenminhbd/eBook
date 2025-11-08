import React from 'react';
import { Config } from '../types';

interface FooterProps {
    config: Config;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const developerCredit = config.developerUrl ? (
    <a href={config.developerUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-primary-600)] hover:underline">
        {config.developerName}
    </a>
  ) : (
    <span className="font-semibold text-[var(--color-primary-600)]">
        {config.developerName}
    </span>
  );
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {config.companyName}. Phát triển bởi {developerCredit}.</p>
      </div>
    </footer>
  );
};

export default Footer;