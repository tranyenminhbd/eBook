
import React, { useState, useEffect } from 'react';
import { Role, PermissionCategory, PermissionSet, DocumentPermissions } from '../../types';
import { XIcon } from '../icons/Icons';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: Role) => void;
  role: Role | null;
}

const emptyPermissions: Role['permissions'] = {
    documents: { create: false, read: true, update: false, delete: false, editOthers: false },
    categories: { create: false, read: false, update: false, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    departments: { create: false, read: false, update: false, delete: false },
    roles: { create: false, read: false, update: false, delete: false },
};

const emptyRole: Omit<Role, 'id'> = {
    name: '',
    description: '',
    permissions: emptyPermissions,
};

const permissionLabels: Record<PermissionCategory, string> = {
    documents: 'Quản lý Tài liệu',
    categories: 'Quản lý Danh mục',
    users: 'Quản lý Người dùng',
    departments: 'Quản lý Phòng ban',
    roles: 'Quản lý Nhóm quyền',
};

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, role }) => {
  const [formData, setFormData] = useState<Omit<Role, 'id'>>(emptyRole);

  useEffect(() => {
    if (isOpen) {
      setFormData(role ? { name: role.name, description: role.description, permissions: JSON.parse(JSON.stringify(role.permissions)) } : JSON.parse(JSON.stringify(emptyRole)));
    }
  }, [isOpen, role]);

  const handlePermissionChange = (category: PermissionCategory, permission: keyof PermissionSet) => {
    const newPermissions = { ...formData.permissions };
    newPermissions[category][permission] = !newPermissions[category][permission];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSpecialPermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData(prev => ({
        ...prev,
        permissions: {
            ...prev.permissions,
            documents: {
                ...prev.permissions.documents,
                editOthers: checked,
            }
        }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave({ ...formData, id: role?.id || '' });
    }
  };

  if (!isOpen) return null;

  const modalTitle = role ? 'Chỉnh sửa Nhóm quyền' : 'Thêm Nhóm quyền Mới';

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-xl shadow-lg p-8"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <XIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalTitle}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên nhóm quyền</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleTextChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleTextChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm"></textarea>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quyền hạn</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Xem</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sửa</th>
                            <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Object.keys(permissionLabels).map(cat => {
                            const category = cat as PermissionCategory;
                            return (
                                <tr key={category}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permissionLabels[category]}</td>
                                    {(['read', 'create', 'update', 'delete'] as const).map(perm => (
                                        <td key={perm} className="px-4 py-4 whitespace-nowrap text-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions[category]?.[perm] || false}
                                                onChange={() => handlePermissionChange(category, perm)}
                                                className="h-4 w-4 text-[var(--color-primary-600)] border-gray-300 rounded focus:ring-[var(--color-primary-500)]"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 border-t pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-2">Quyền đặc biệt</h4>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={!!formData.permissions.documents.editOthers}
                        onChange={handleSpecialPermissionChange}
                        className="h-4 w-4 text-[var(--color-primary-600)] border-gray-300 rounded focus:ring-[var(--color-primary-500)]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cho phép chỉnh sửa, xóa và thay đổi trạng thái tài liệu của các phòng ban khác.</span>
                </label>
            </div>
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

export default RoleModal;