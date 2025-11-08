
import React, { useState } from 'react';
import { Document, Category, Department, User, Role } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeOffIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';
import DocumentModal from './DocumentModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface DocumentManagementProps {
  documents: Document[];
  onUpdateDocuments: (docs: Document[]) => void;
  categories: Category[];
  departments: Department[];
  currentUser: User | null;
  currentUserRole: Role | null;
  onViewDocument: (doc: Document) => void;
  logActivity: (action: string) => void;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ documents, onUpdateDocuments, categories, departments, currentUser, currentUserRole, onViewDocument, logActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); // Reset to first page
  };
  
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleOpenModal = (doc: Document | null) => {
    setSelectedDocument(doc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedDocument(null);
    setIsModalOpen(false);
  };

  const handleSaveDocument = (doc: Document) => {
    let updatedDocuments;
    if (selectedDocument) {
      updatedDocuments = documents.map(d => d.id === doc.id ? { ...doc, lastUpdated: new Date().toISOString().slice(0, 10) } : d);
      logActivity(`Cập nhật tài liệu "${doc.title}".`);
    } else {
      const newDoc = { ...doc, id: `doc-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), lastUpdated: new Date().toISOString().slice(0, 10) };
      updatedDocuments = [newDoc, ...documents];
      logActivity(`Tạo tài liệu mới "${doc.title}".`);
    }
    onUpdateDocuments(updatedDocuments);
    handleCloseModal();
  };

  const handleOpenDeleteModal = (doc: Document) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDocumentToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteDocument = () => {
    if (documentToDelete) {
      onUpdateDocuments(documents.filter(d => d.id !== documentToDelete.id));
      logActivity(`Xóa tài liệu "${documentToDelete.title}".`);
    }
    handleCloseDeleteModal();
  };

  const handleToggleStatus = (docId: string) => {
    let toggledDoc: Document | undefined;
    const updatedDocuments = documents.map(d => {
        if (d.id === docId) {
            toggledDoc = { ...d, status: d.status === 'active' ? 'suspended' : 'active' };
            return toggledDoc;
        }
        return d;
    });
    onUpdateDocuments(updatedDocuments);
    if (toggledDoc) {
        logActivity(`Thay đổi trạng thái tài liệu "${toggledDoc.title}" thành "${toggledDoc.status === 'active' ? 'Kích hoạt' : 'Ngưng'}".`);
    }
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'N/A';
  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Tài liệu</h1>
                <p className="mt-1 text-gray-600">Thêm, chỉnh sửa hoặc xóa các tài liệu của công ty.</p>
            </div>
            <button
                onClick={() => handleOpenModal(null)}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
            >
                <PlusIcon className="h-5 w-5 mr-2" />
                Thêm Tài liệu
            </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nơi ban hành</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật lần cuối</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocuments.map((doc) => {
                  const isOwner = currentUser && currentUser.departmentId === doc.issuingDepartmentId;
                  const canEditOthers = currentUserRole?.permissions.documents.editOthers === true;

                  const canUpdate = currentUserRole?.permissions.documents.update;
                  const canDelete = currentUserRole?.permissions.documents.delete;
                  
                  const canPerformUpdate = canUpdate && (isOwner || canEditOthers);
                  const canPerformDelete = canDelete && (isOwner || canEditOthers);
                  
                  return (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryName(doc.categoryId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getDepartmentName(doc.issuingDepartmentId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {doc.status === 'active' ? 'Kích hoạt' : 'Ngưng'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.lastUpdated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                            onClick={() => onViewDocument(doc)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-gray-100 transition"
                            title="Xem chi tiết"
                        >
                            <EyeIcon className="h-5 w-5" />
                            <span className="sr-only">Xem chi tiết</span>
                        </button>
                        <button 
                            onClick={() => handleToggleStatus(doc.id)} 
                            className={`p-1 rounded-full transition ${
                                canPerformUpdate
                                ? (doc.status === 'active' ? 'text-yellow-600 hover:text-yellow-900 hover:bg-gray-100' : 'text-green-600 hover:text-green-900 hover:bg-gray-100')
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!canPerformUpdate}
                            title={
                                !canPerformUpdate
                                ? 'Bạn không có quyền thay đổi trạng thái tài liệu này.'
                                : (doc.status === 'active' ? 'Ngưng' : 'Kích hoạt')
                            }
                        >
                            {doc.status === 'active' ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            <span className="sr-only">{doc.status === 'active' ? 'Ngưng' : 'Kích hoạt'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenModal(doc)}
                          className={`p-1 rounded-full transition ${
                            canPerformUpdate
                            ? 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-gray-100'
                            : 'text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!canPerformUpdate}
                          title={!canPerformUpdate ? 'Bạn không có quyền chỉnh sửa tài liệu này.' : 'Chỉnh sửa'}
                        >
                            <PencilIcon className="h-5 w-5" />
                            <span className="sr-only">Chỉnh sửa</span>
                        </button>
                        <button
                            onClick={() => handleOpenDeleteModal(doc)}
                            className={`p-1 rounded-full transition ${
                                canPerformDelete
                                ? 'text-red-600 hover:text-red-900 hover:bg-gray-100'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!canPerformDelete}
                            title={!canPerformDelete ? 'Bạn không có quyền xóa tài liệu này.' : 'Xóa'}
                        >
                            <TrashIcon className="h-5 w-5" />
                            <span className="sr-only">Xóa</span>
                        </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
            {/* Pagination Controls */}
            {documents.length > 10 && (
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="flex items-center space-x-2 text-sm">
                        <label htmlFor="itemsPerPage" className="text-gray-600">Hiển thị:</label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>

                    <div className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, documents.length)} trên tổng {documents.length}
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="p-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-700 px-2">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="p-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      <DocumentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDocument}
        document={selectedDocument}
        categories={categories}
        departments={departments}
        currentUser={currentUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteDocument}
        title="Xóa Tài liệu?"
        message={`Bạn có chắc chắn muốn xóa tài liệu "${documentToDelete?.title}" không? Hành động này không thể được hoàn tác.`}
      />
    </div>
  );
};

export default DocumentManagement;
