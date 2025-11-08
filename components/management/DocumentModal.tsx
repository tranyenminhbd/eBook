import React, { useState, useEffect } from 'react';
import { Document, Category, Department, Attachment, User } from '../../types';
import { XIcon, PlusIcon, TrashIcon } from '../icons/Icons';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Document) => void;
  document: Document | null;
  categories: Category[];
  departments: Department[];
  currentUser: User | null;
}

const emptyDocument: Omit<Document, 'id' | 'lastUpdated' | 'createdAt'> = {
    title: '',
    content: '<h2 class="text-2xl font-bold mb-4">Tiêu đề</h2>\n<p>Nội dung mẫu.</p>',
    categoryId: '',
    issuingDepartmentId: '',
    attachments: [],
    status: 'active',
};


const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, document, categories, departments, currentUser }) => {
  const [formData, setFormData] = useState<Omit<Document, 'id'>>(document || { ...emptyDocument, createdAt: '', lastUpdated: '' });
  const [videoInputMethod, setVideoInputMethod] = useState<Record<number, 'url' | 'file'>>({});

  useEffect(() => {
    if (isOpen) {
        if (document) {
            setFormData(document);
            const initialMethods: Record<number, 'url' | 'file'> = {};
            document.attachments.forEach((att, index) => {
                if (att.type === 'video') {
                    initialMethods[index] = att.url.startsWith('data:video') ? 'file' : 'url';
                }
            });
            setVideoInputMethod(initialMethods);
        } else {
            setFormData({
                ...emptyDocument,
                categoryId: categories[0]?.id || '',
                issuingDepartmentId: currentUser?.departmentId || departments[0]?.id || '',
                status: 'active',
                createdAt: new Date().toISOString().slice(0, 10),
                lastUpdated: new Date().toISOString().slice(0, 10),
            });
            setVideoInputMethod({});
        }
    }
  }, [isOpen, document, categories, departments, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (index: number, field: keyof Attachment, value: string) => {
    const newAttachments = [...formData.attachments];
    const oldAttachment = newAttachments[index];

    // If changing type, reset url and handle video input method state
    if (field === 'type') {
        newAttachments[index] = { ...oldAttachment, type: value as Attachment['type'], url: '' };
        if (value === 'video') {
            setVideoInputMethod(prev => ({ ...prev, [index]: 'url' }));
        } else {
            const newMethods = { ...videoInputMethod };
            delete newMethods[index];
            setVideoInputMethod(newMethods);
        }
    } else {
        newAttachments[index] = { ...oldAttachment, [field]: value };
    }
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };
  
  const handleVideoFileChange = (index: number, files: FileList | null) => {
    if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const newAttachments = [...formData.attachments];
            newAttachments[index] = { ...newAttachments[index], url: dataUrl, name: file.name };
            setFormData(prev => ({ ...prev, attachments: newAttachments }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleVideoInputMethodChange = (index: number, method: 'url' | 'file') => {
      setVideoInputMethod(prev => ({ ...prev, [index]: method }));
      // Clear URL when switching methods to avoid confusion
      const newAttachments = [...formData.attachments];
      newAttachments[index].url = '';
      setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };


  const handleAddAttachment = () => {
    const newAttachment: Attachment = { name: '', url: '', type: 'pdf' };
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment]}));
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData as Document);
    }
  };

  if (!isOpen) return null;

  const modalTitle = document ? 'Chỉnh sửa Tài liệu' : 'Thêm Tài liệu Mới';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-3xl w-full bg-white rounded-xl shadow-lg my-8 p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalTitle}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Danh mục</label>
                <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="issuingDepartmentId" className="block text-sm font-medium text-gray-700">Nơi ban hành</label>
                <select name="issuingDepartmentId" id="issuingDepartmentId" value={formData.issuingDepartmentId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung (HTML)</label>
            <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={12} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 font-mono text-sm focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)]"></textarea>
            <p className="mt-2 text-xs text-gray-500">
                Nội dung được hiển thị bằng HTML. Bạn có thể sử dụng các thẻ như `h2`, `p`, `ul`, `li`, `strong`.
            </p>
          </div>
          
          <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tệp đính kèm</h3>
              <div className="space-y-3">
                  {formData.attachments.map((att, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                          <div className="flex items-center space-x-2">
                              <input 
                                type="text" 
                                placeholder="Tên hiển thị" 
                                value={att.name}
                                onChange={(e) => handleAttachmentChange(index, 'name', e.target.value)}
                                className="flex-grow border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm"
                                required
                              />
                              <select 
                                value={att.type}
                                onChange={(e) => handleAttachmentChange(index, 'type', e.target.value)}
                                className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm"
                              >
                                <option value="pdf">PDF</option>
                                <option value="docx">DOCX</option>
                                <option value="xlsx">XLSX</option>
                                <option value="pptx">PPTX</option>
                                <option value="video">Video</option>
                                <option value="link">Link</option>
                              </select>
                              <button type="button" onClick={() => handleRemoveAttachment(index)} className="text-red-500 hover:text-red-700 p-1">
                                  <TrashIcon className="h-5 w-5" />
                              </button>
                          </div>
                          <div>
                            {att.type === 'video' ? (
                                <div className="pl-2 mt-2 space-y-2 border-l-2 border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`video-input-${index}`}
                                                checked={videoInputMethod[index] !== 'file'}
                                                onChange={() => handleVideoInputMethodChange(index, 'url')}
                                                className="h-4 w-4 text-[var(--color-primary-600)] border-gray-300 focus:ring-[var(--color-primary-500)]"
                                            />
                                            <span className="ml-2 text-gray-700">Đường dẫn (URL)</span>
                                        </label>
                                        <label className="flex items-center text-sm cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`video-input-${index}`}
                                                checked={videoInputMethod[index] === 'file'}
                                                onChange={() => handleVideoInputMethodChange(index, 'file')}
                                                className="h-4 w-4 text-[var(--color-primary-600)] border-gray-300 focus:ring-[var(--color-primary-500)]"
                                            />
                                            <span className="ml-2 text-gray-700">Tải lên tệp</span>
                                        </label>
                                    </div>

                                    {videoInputMethod[index] === 'file' ? (
                                        <div>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                id={`attachment-file-${index}`}
                                                className="hidden"
                                                onChange={(e) => handleVideoFileChange(index, e.target.files)}
                                            />
                                            <div className="flex items-center space-x-3 mt-1">
                                                <label htmlFor={`attachment-file-${index}`} className="cursor-pointer text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] bg-white border border-gray-300 px-3 py-1.5 rounded-md shadow-sm whitespace-nowrap">
                                                     {att.url.startsWith('data:video') ? 'Đổi tệp' : 'Chọn tệp'}
                                                </label>
                                                <span className="text-sm text-gray-600 truncate" title={att.name}>
                                                    {att.url.startsWith('data:video') ? att.name : 'Chưa có tệp nào được chọn'}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <input 
                                            type="text" 
                                            placeholder="URL của video (VD: https://youtube.com/...)" 
                                            value={att.url.startsWith('data:video') ? '' : att.url}
                                            onChange={(e) => handleAttachmentChange(index, 'url', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm"
                                            required
                                        />
                                    )}
                                </div>
                            ) : (
                                <input 
                                    type="text" 
                                    placeholder="URL của tệp (VD: https://...)" 
                                    value={att.url}
                                    onChange={(e) => handleAttachmentChange(index, 'url', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm"
                                    required
                                />
                            )}
                          </div>
                      </div>
                  ))}
              </div>
               <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="mt-3 flex items-center px-3 py-1.5 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Thêm tệp đính kèm
                </button>
          </div>

          <div className="pt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)]"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
