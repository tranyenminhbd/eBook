import React, { useState } from 'react';
import { Role, PermissionCategory, PermissionSet } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, ShieldIcon, CheckIcon, XIcon as CloseIcon } from '../icons/Icons';
import RoleModal from './RoleModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const PermissionSummary: React.FC<{ permissions: PermissionSet }> = ({ permissions }) => {
    const enabledCount = Object.values(permissions).filter(p => p).length;
    if (enabledCount === 4) return <span className="text-xs font-medium text-green-700">Toàn quyền</span>;
    if (enabledCount === 0) return <span className="text-xs font-medium text-gray-500">Không có quyền</span>;
    
    const permissionNames = [];
    if (permissions.read) permissionNames.push('Xem');
    if (permissions.create) permissionNames.push('Tạo');
    if (permissions.update) permissionNames.push('Sửa');
    if (permissions.delete) permissionNames.push('Xóa');

    return <span className="text-xs text-gray-600">{permissionNames.join(', ')}</span>;
};

interface RoleManagementProps {
    roles: Role[];
    onUpdateRoles: (roles: Role[]) => void;
    currentUserRole: Role | null;
    logActivity: (action: string) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ roles, onUpdateRoles, currentUserRole, logActivity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const canCreate = !!currentUserRole?.permissions.roles.create;
    const canUpdate = !!currentUserRole?.permissions.roles.update;
    const canDelete = !!currentUserRole?.permissions.roles.delete;

    const handleOpenModal = (role: Role | null) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRole(null);
        setIsModalOpen(false);
    };

    const handleSaveRole = (role: Role) => {
        let updatedRoles;
        if (selectedRole) {
            updatedRoles = roles.map(r => r.id === role.id ? role : r);
            logActivity(`Cập nhật nhóm quyền "${role.name}".`);
        } else {
            updatedRoles = [...roles, { ...role, id: `role-${Date.now()}` }];
            logActivity(`Tạo nhóm quyền mới "${role.name}".`);
        }
        onUpdateRoles(updatedRoles);
        handleCloseModal();
    };

    const handleOpenDeleteModal = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setRoleToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteRole = () => {
        if (roleToDelete) {
            onUpdateRoles(roles.filter(r => r.id !== roleToDelete.id));
            logActivity(`Xóa nhóm quyền "${roleToDelete.name}".`);
        }
        handleCloseDeleteModal();
    };
    
    const permissionLabels: Record<PermissionCategory, string> = {
        documents: 'Tài liệu',
        // FIX: Added missing 'categories' property to satisfy the Record type.
        categories: 'Danh mục',
        users: 'Người dùng',
        departments: 'Phòng ban',
        roles: 'Nhóm quyền',
    };

    return (
        <div className="p-6 sm:p-8 h-full flex flex-col">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Quản lý Nhóm quyền</h1>
                        <p className="mt-1 text-gray-600">Định nghĩa vai trò người dùng và các quyền truy cập tương ứng.</p>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => handleOpenModal(null)}
                            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Thêm Nhóm quyền
                        </button>
                    )}
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white shadow-md rounded-lg p-6 flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="bg-[var(--color-primary-100)] p-2 rounded-full">
                                        <ShieldIcon className="h-6 w-6 text-[var(--color-primary-600)]" />
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-bold text-gray-800">{role.name}</h2>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center space-x-1">
                                    <button 
                                        onClick={() => handleOpenModal(role)} 
                                        className={`p-1 rounded-full transition ${canUpdate ? 'text-gray-500 hover:text-[var(--color-primary-600)] hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canUpdate}
                                        title={canUpdate ? 'Chỉnh sửa' : 'Bạn không có quyền'}
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => handleOpenDeleteModal(role)} 
                                        className={`p-1 rounded-full transition ${canDelete ? 'text-gray-500 hover:text-red-600 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                                        disabled={!canDelete}
                                        title={canDelete ? 'Xóa' : 'Bạn không có quyền'}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 flex-grow mb-6">{role.description}</p>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quyền hạn</h3>
                                <ul className="space-y-2">
                                    {Object.keys(role.permissions).map(key => (
                                        <li key={key} className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-gray-700">{permissionLabels[key as PermissionCategory]}</span>
                                            <PermissionSummary permissions={role.permissions[key as PermissionCategory]} />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <RoleModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveRole}
                role={selectedRole}
            />

            <DeleteConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteRole}
                title="Xóa Nhóm quyền?"
                message={`Bạn có chắc chắn muốn xóa nhóm quyền "${roleToDelete?.name}" không? Hành động này không thể được hoàn tác.`}
            />
        </div>
    );
};

export default RoleManagement;
