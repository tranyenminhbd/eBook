
import React, { useState } from 'react';
import { Category, Role } from '../../types';
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon } from '../icons/Icons';
import CategoryModal from './CategoryModal';
import DeleteConfirmModal from './DeleteConfirmModal';

interface CategoryManagementProps {
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
  currentUserRole: Role | null;
  logActivity: (action: string) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onUpdateCategories, currentUserRole, logActivity }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const canCreate = !!currentUserRole?.permissions.categories.create;
  const canUpdate = !!currentUserRole?.permissions.categories.update;
  const canDelete = !!currentUserRole?.permissions.categories.delete;

  const handleOpenModal = (category: Category | null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleSaveCategory = (category: Category) => {
    let updatedCategories;
    if (selectedCategory) {
      updatedCategories = categories.map(d => d.id === category.id ? category : d);
      logActivity(`Cập nhật danh mục "${category.name}".`);
    } else {
      updatedCategories = [...categories, category];
      logActivity(`Tạo danh mục mới "${category.name}".`);
    }
    onUpdateCategories(updatedCategories);
    handleCloseModal();
  };

  const handleOpenDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
      setCategoryToDelete(null);
      setIsDeleteModalOpen(false);
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      onUpdateCategories(categories.filter(d => d.id !== categoryToDelete.id));
      logActivity(`Xóa danh mục "${categoryToDelete.name}".`);
    }
    handleCloseDeleteModal();
  };

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Danh mục</h1>
                <p className="mt-1 text-gray-600">Thêm, chỉnh sửa hoặc xóa các danh mục tài liệu.</p>
            </div>
            {canCreate && (
                <button
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm Danh mục
                </button>
            )}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <FolderIcon className="inline-block h-5 w-5 mr-2" /> Tên Danh mục
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cat.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleOpenModal(cat)} 
                        className={`p-1 rounded-full transition ${canUpdate ? 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                        disabled={!canUpdate}
                        title={canUpdate ? 'Chỉnh sửa' : 'Bạn không có quyền'}
                      >
                        <PencilIcon className="h-5 w-5" />
                        <span className="sr-only">Chỉnh sửa</span>
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(cat)} 
                        className={`p-1 rounded-full transition ${canDelete ? 'text-red-600 hover:text-red-900 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                        disabled={!canDelete}
                        title={canDelete ? 'Xóa' : 'Bạn không có quyền'}
                      >
                        <TrashIcon className="h-5 w-5" />
                        <span className="sr-only">Xóa</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCategory}
        title="Xóa Danh mục?"
        message={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name}" không? Hành động này không thể được hoàn tác.`}
      />
    </div>
  );
};

export default CategoryManagement;
