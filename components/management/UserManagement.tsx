
import React, { useState } from 'react';
import { User, Department, Role } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, EyeOffIcon, KeyIcon } from '../icons/Icons';
import UserModal from './UserModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import ResetPasswordModal from './ResetPasswordModal';

interface UserManagementProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  departments: Department[];
  roles: Role[];
  currentUserRole: Role | null;
  logActivity: (action: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers, departments, roles, currentUserRole, logActivity }) => {
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

    const canCreate = !!currentUserRole?.permissions.users.create;
    const canUpdate = !!currentUserRole?.permissions.users.update;
    const canDelete = !!currentUserRole?.permissions.users.delete;


    const handleOpenUserModal = (user: User | null) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const handleCloseUserModal = () => {
        setSelectedUser(null);
        setIsUserModalOpen(false);
    };

    const handleSaveUser = (user: User) => {
        let updatedUsers;
        if (selectedUser) {
            updatedUsers = users.map(u => u.id === user.id ? user : u);
            logActivity(`Cập nhật người dùng "${user.name}".`);
        } else {
            updatedUsers = [...users, user];
            logActivity(`Tạo người dùng mới "${user.name}".`);
        }
        onUpdateUsers(updatedUsers);
        handleCloseUserModal();
    };

    const handleOpenDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            onUpdateUsers(users.filter(u => u.id !== userToDelete.id));
            logActivity(`Xóa người dùng "${userToDelete.name}".`);
        }
        handleCloseDeleteModal();
    };
    
    const handleToggleStatus = (userId: string) => {
        let toggledUser: User | undefined;
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                toggledUser = { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
                return toggledUser;
            }
            return u;
        });
        onUpdateUsers(updatedUsers);
        if(toggledUser) {
            logActivity(`Thay đổi trạng thái người dùng "${toggledUser.name}" thành "${toggledUser.status === 'active' ? 'Kích hoạt' : 'Ngưng'}".`);
        }
    };

    const handleOpenResetPasswordModal = (user: User) => {
        setUserToResetPassword(user);
        setIsResetPasswordModalOpen(true);
    };

    const handleCloseResetPasswordModal = () => {
        setUserToResetPassword(null);
        setIsResetPasswordModalOpen(false);
    };

    const handleConfirmResetPassword = (password: string) => {
        if (userToResetPassword) {
            const updatedUsers = users.map(u =>
                u.id === userToResetPassword.id
                ? { ...u, password: password }
                : u
            );
            onUpdateUsers(updatedUsers);
            logActivity(`Đặt lại mật khẩu cho người dùng "${userToResetPassword.name}".`);
        }
        handleCloseResetPasswordModal();
    };


  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Người dùng</h1>
                <p className="mt-1 text-gray-600">Thêm, chỉnh sửa hoặc xóa người dùng hệ thống.</p>
            </div>
            {canCreate && (
                <button
                    onClick={() => handleOpenUserModal(null)}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Thêm Người dùng
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng ban</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đăng nhập lần cuối</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Hành động</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const userRole = roles.find(r => r.id === user.roleId);
                  const userDepartment = departments.find(d => d.id === user.departmentId);
                  return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userDepartment?.name || 'Không xác định'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-800)]">
                            {userRole?.name || 'Không xác định'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {user.status === 'active' ? 'Kích hoạt' : 'Ngưng'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button 
                            onClick={() => handleToggleStatus(user.id)} 
                            className={`p-1 rounded-full transition ${
                                canUpdate 
                                ? (user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900 hover:bg-gray-100' : 'text-green-600 hover:text-green-900 hover:bg-gray-100')
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!canUpdate}
                            title={canUpdate ? (user.status === 'active' ? 'Ngưng' : 'Kích hoạt') : 'Bạn không có quyền'}
                        >
                            {user.status === 'active' ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            <span className="sr-only">{user.status === 'active' ? 'Ngưng' : 'Kích hoạt'}</span>
                        </button>
                        <button 
                            onClick={() => handleOpenResetPasswordModal(user)} 
                            className={`p-1 rounded-full transition ${canUpdate ? 'text-gray-500 hover:text-gray-800 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!canUpdate}
                            title={canUpdate ? "Đặt lại Mật khẩu" : 'Bạn không có quyền'}
                        >
                            <KeyIcon className="h-5 w-5" />
                            <span className="sr-only">Đặt lại Mật khẩu</span>
                        </button>
                        <button 
                            onClick={() => handleOpenUserModal(user)} 
                            className={`p-1 rounded-full transition ${canUpdate ? 'text-[var(--color-primary-600)] hover:text-[var(--color-primary-900)] hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!canUpdate}
                            title={canUpdate ? 'Chỉnh sửa' : 'Bạn không có quyền'}
                        >
                            <PencilIcon className="h-5 w-5" />
                            <span className="sr-only">Chỉnh sửa</span>
                        </button>
                        <button 
                            onClick={() => handleOpenDeleteModal(user)} 
                            className={`p-1 rounded-full transition ${canDelete ? 'text-red-600 hover:text-red-900 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!canDelete}
                            title={canDelete ? 'Xóa' : 'Bạn không có quyền'}
                        >
                            <TrashIcon className="h-5 w-5" />
                            <span className="sr-only">Xóa</span>
                        </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        onSave={handleSaveUser}
        user={selectedUser}
        departments={departments}
        roles={roles}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteUser}
        title="Xóa Người dùng?"
        message={`Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.name}" không? Hành động này không thể được hoàn tác.`}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={handleCloseResetPasswordModal}
        onConfirm={handleConfirmResetPassword}
        user={userToResetPassword}
      />
    </div>
  );
};

export default UserManagement;
