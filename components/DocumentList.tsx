

import React from 'react';
import { Document, Category, Department } from '../types';
import { FileIcon } from './icons/Icons';

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  categories: Category[];
  departments: Department[];
  title?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
    documents, 
    onSelectDocument, 
    categories, 
    departments, 
    title = 'Tất cả tài liệu',
}) => {
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

  return (
    <div className="flex-shrink-0 w-full md:w-2/5 lg:w-1/3 xl:w-1/4 bg-gray-50 border-r border-gray-200 h-full flex flex-col">
      <header className="p-4 border-b bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{documents.length} tài liệu</p>
      </header>
      <ul className="flex-1 overflow-y-auto">
        {documents.length > 0 ? (
          documents.map(doc => (
            <li key={doc.id}>
              <button
                onClick={() => onSelectDocument(doc)}
                className="w-full text-left p-4 border-b hover:bg-gray-100 focus:outline-none focus:bg-[var(--color-primary-50)]"
              >
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                        <FileIcon className="h-6 w-6 text-[var(--color-primary-500)]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                        <div className="mt-1 text-xs text-gray-500 space-x-2">
                            <span>{getDepartmentName(doc.issuingDepartmentId)}</span>
                            <span>&bull;</span>
                            <span>{getCategoryName(doc.categoryId)}</span>
                        </div>
                         <p className="mt-2 text-xs text-gray-400">Cập nhật: {doc.lastUpdated}</p>
                    </div>
                </div>
              </button>
            </li>
          ))
        ) : (
          <li className="p-8 text-center text-gray-500">
            <p>Không tìm thấy tài liệu nào.</p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default DocumentList;