
import React, { useState, useEffect, useRef } from 'react';
import { Config } from '../../types';
import { CheckIcon, DownloadIcon, UploadIcon } from '../icons/Icons';
import DeleteConfirmModal from './DeleteConfirmModal';

interface ConfigurationPageProps {
    config: Config;
    onUpdateConfig: (config: Config) => void;
    onResetData: () => void;
    logActivity: (action: string) => void;
}

const ConfigurationPage: React.FC<ConfigurationPageProps> = ({ config, onUpdateConfig, onResetData, logActivity }) => {
    const [formData, setFormData] = useState<Config>(config);
    const [isSuccess, setIsSuccess] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string>(config.logo);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreFileData, setRestoreFileData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setFormData(config);
        setLogoPreview(config.logo)
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({...prev, logo: base64String}));
                setLogoPreview(base64String);
            }
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateConfig(formData);
        logActivity('Cập nhật cấu hình hệ thống.');
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(config);

    const handleBackup = () => {
        try {
            const keysToBackup = ['documents', 'categories', 'departments', 'roles', 'users', 'config', 'activityLog'];
            const backupData: Record<string, any> = {};

            keysToBackup.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    backupData[key] = JSON.parse(item);
                }
            });

            const jsonString = JSON.stringify(backupData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `docuflow-backup-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            logActivity('Tải xuống bản sao lưu hệ thống.');
        } catch (error) {
            console.error("Failed to create backup:", error);
            alert("Đã xảy ra lỗi khi tạo tệp sao lưu.");
        }
    };

    const handleRestoreTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                try {
                    const data = JSON.parse(content);
                    // Basic validation
                    if (data && typeof data === 'object' && data.config && data.documents) {
                        setRestoreFileData(content);
                        setIsRestoreModalOpen(true);
                    } else {
                        alert("Tệp sao lưu không hợp lệ hoặc bị hỏng.");
                    }
                } catch {
                     alert("Tệp sao lưu không hợp lệ. Vui lòng chọn một tệp JSON hợp lệ.");
                }
            };
            reader.readAsText(file);
        }
        // Reset file input to allow re-selecting the same file
        e.target.value = '';
    };

    const handleConfirmRestore = () => {
        if (!restoreFileData) return;
        try {
            const data = JSON.parse(restoreFileData);
            const keys = ['documents', 'categories', 'departments', 'roles', 'users', 'config', 'activityLog'];
            
            const hasAllKeys = keys.every(key => key in data);
            if (!hasAllKeys) {
                // Check for older backup format without activityLog
                const oldKeys = ['documents', 'categories', 'departments', 'roles', 'users', 'config'];
                const hasOldKeys = oldKeys.every(key => key in data);
                if (!hasOldKeys) {
                    throw new Error("Missing required data in backup file.");
                }
            }
            
            // Clear all possible keys before restoring
            const allKnownKeys = ['documents', 'categories', 'departments', 'roles', 'users', 'config', 'currentUser', 'sidebarCollapsed', 'activityLog'];
            allKnownKeys.forEach(key => localStorage.removeItem(key));
            
            // Restore new data
            Object.keys(data).forEach(key => {
                if (allKnownKeys.includes(key)) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                }
            });
            
            logActivity('Phục hồi hệ thống từ tệp sao lưu.');

            setIsRestoreModalOpen(false);
            setRestoreFileData(null);
            
            // Force reload to apply all changes
            alert('Phục hồi dữ liệu thành công! Hệ thống sẽ được tải lại.');
            window.location.reload();

        } catch (error) {
            console.error("Failed to restore data:", error);
            alert("Đã xảy ra lỗi khi phục hồi dữ liệu. Tệp có thể bị hỏng hoặc không đúng định dạng.");
            setIsRestoreModalOpen(false);
            setRestoreFileData(null);
        }
    };
    
    const handleConfirmReset = () => {
        logActivity('Thực hiện đặt lại toàn bộ dữ liệu hệ thống.');
        onResetData();
    }

  return (
    <div className="p-6 sm:p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cấu hình Hệ thống</h1>
        <p className="mt-1 text-gray-600">Quản lý các cài đặt chung và giao diện cho ứng dụng.</p>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thông tin chung</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Tên công ty</label>
                        <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Logo công ty</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                {logoPreview ? <img src={logoPreview} alt="Xem trước logo" className="h-full w-full object-contain" /> : <span className="text-xs text-gray-500">Logo</span>}
                            </div>
                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoChange}/>
                            <label htmlFor="logo-upload" className="cursor-pointer text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] bg-white border border-gray-300 px-3 py-2 rounded-md shadow-sm">
                                Tải lên
                            </label>
                             {logoPreview && <button type="button" onClick={() => { setLogoPreview(''); setFormData(prev => ({...prev, logo: ''}))}} className="text-sm text-gray-600 hover:text-red-600">Xóa</button>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Giao diện</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700">Màu chủ đạo</label>
                        <div className="mt-1 flex items-center space-x-3">
                            <input type="color" name="themeColor" id="themeColor" value={formData.themeColor} onChange={handleChange} className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer" />
                            <input type="text" value={formData.themeColor} onChange={handleChange} name="themeColor" className="block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Thông tin nhà phát triển</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="developerName" className="block text-sm font-medium text-gray-700">Tên nhà phát triển</label>
                        <input type="text" name="developerName" id="developerName" value={formData.developerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="developerUrl" className="block text-sm font-medium text-gray-700">Website (Tùy chọn)</label>
                        <input type="text" name="developerUrl" id="developerUrl" value={formData.developerUrl} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] sm:text-sm" placeholder="https://example.com" />
                    </div>
                </div>
            </div>

             <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-4 mb-6">Sao lưu & Phục hồi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex flex-col items-start space-y-2">
                        <p className="font-medium text-gray-800">Tạo bản sao lưu</p>
                        <p className="text-sm text-gray-500">Tải xuống tệp chứa tất cả dữ liệu hệ thống (tài liệu, người dùng, cài đặt, v.v.).</p>
                        <button
                            type="button"
                            onClick={handleBackup}
                            className="mt-2 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Tải xuống bản sao lưu
                        </button>
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                        <p className="font-medium text-gray-800">Phục hồi dữ liệu</p>
                        <p className="text-sm text-gray-500">Phục hồi toàn bộ hệ thống từ một tệp sao lưu. <strong className="text-red-600">Toàn bộ dữ liệu hiện tại sẽ bị ghi đè.</strong></p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".json"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={handleRestoreTrigger}
                            className="mt-2 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition"
                        >
                            <UploadIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Phục hồi từ tệp...
                        </button>
                    </div>
                </div>
            </div>


             <div className="bg-white shadow-md rounded-lg p-8">
                <h2 className="text-xl font-semibold text-red-600 border-b border-red-200 pb-4 mb-6">Khu vực nguy hiểm</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800">Đặt lại toàn bộ dữ liệu ứng dụng</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Thao tác này sẽ xóa tất cả người dùng, tài liệu, danh mục, phòng ban, vai trò và cấu hình hiện tại. <br/>
                            Dữ liệu sẽ được khôi phục về trạng thái mặc định ban đầu. <strong>Hành động này không thể hoàn tác.</strong>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsResetModalOpen(true)}
                        className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
                    >
                        Đặt lại dữ liệu
                    </button>
                </div>
            </div>


            <div className="pt-2 pb-4 flex items-center justify-end space-x-3">
                {isSuccess && <div className="flex items-center text-green-600 text-sm"><CheckIcon className="h-5 w-5 mr-1" />Đã lưu cấu hình thành công!</div>}
                <button
                    type="submit"
                    disabled={!hasChanges}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Lưu thay đổi
                </button>
            </div>
        </form>
      </div>

       <DeleteConfirmModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleConfirmReset}
            title="Đặt lại toàn bộ dữ liệu?"
            message="Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu ứng dụng không? Tất cả các thay đổi sẽ bị mất và dữ liệu sẽ được khôi phục về trạng thái mặc định. Hành động này không thể hoàn tác."
            confirmText="Tôi hiểu, đặt lại"
        />
        
        <DeleteConfirmModal
            isOpen={isRestoreModalOpen}
            onClose={() => setIsRestoreModalOpen(false)}
            onConfirm={handleConfirmRestore}
            title="Phục hồi dữ liệu từ tệp?"
            message="Bạn có chắc chắn muốn phục hồi dữ liệu từ tệp đã chọn không? Thao tác này sẽ XÓA TOÀN BỘ DỮ LIỆU HIỆN TẠI và thay thế bằng dữ liệu trong tệp sao lưu. Hành động này không thể hoàn tác."
            confirmText="Tôi hiểu, phục hồi"
        />
    </div>
  );
};

export default ConfigurationPage;