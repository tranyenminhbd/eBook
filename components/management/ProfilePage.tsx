import React, { useState, useEffect } from 'react';
import { User, Department, Role } from '../../types';
import ChangePasswordModal from './ChangePasswordModal';
import { CheckIcon, KeyIcon } from '../icons/Icons';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  departments: Department[];
  roles: Role[];
  logActivity: (action: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateUser, departments, roles, logActivity }) => {
  const [formData, setFormData] = useState({ name: currentUser.name });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const departmentName = departments.find(d => d.id === currentUser.departmentId)?.name || 'Không xác định';
  const roleName = roles.find(r => r.id === currentUser.roleId)?.name || 'Không xác định';

  const hasChanges = formData.name !== currentUser.name;

  useEffect(() => {
    // Reset form if currentUser changes from outside
    setFormData({ name: currentUser.name });
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...currentUser, name: formData.name };
    onUpdateUser(updatedUser);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000); // Hide success message after 3s
  };

  const handleCancel = () => {
    setFormData({ name: currentUser.name });
  };
  
  const handlePasswordSave = (newPassword: string) => {
    const updatedUser = { ...currentUser, password: newPassword };
    onUpdateUser(updatedUser);
    logActivity('Thay đổi mật khẩu cá nhân.');
    setIsPasswordModalOpen(false);
    // You might want a success indicator for password change as well
  };

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Thông tin cá nhân</h1>
        <p className="mt-1 text-gray-600">Xem và cập nhật thông tin cá nhân của bạn.</p>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-6">
                
                {/* Editable User Info Fields */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Họ và tên</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
                </div>
                
                {/* Read-only info in a bordered box */}
                <div className="border border-gray-200 rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-500 bg-gray-100 p-2 rounded-md">{currentUser.email}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
                            <p className="mt-1 text-sm text-gray-500 bg-gray-100 p-2 rounded-md">{departmentName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nhóm quyền</label>
                            <p className="mt-1 text-sm text-gray-500 bg-gray-100 p-2 rounded-md">{roleName}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="flex items-center justify-center w-full md:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                    >
                      <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
                      Đổi mật khẩu
                    </button>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-5 flex items-center justify-end space-x-3">
                    {isSuccess && <div className="flex items-center text-green-600 text-sm"><CheckIcon className="h-5 w-5 mr-1" />Đã lưu thành công!</div>}
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={!hasChanges}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={!hasChanges}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Lưu thay đổi
                    </button>
                </div>

            </form>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSave={handlePasswordSave}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ProfilePage;
