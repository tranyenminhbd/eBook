import React from 'react';
import { Document, Category, Department, ActivityLog } from '../types';
import { FileIcon, FolderIcon, BuildingIcon, ClockIcon, UserCircleIcon, EyeIcon } from './icons/Icons';

interface DashboardProps {
    documents: Document[];
    categories: Category[];
    departments: Department[];
    activityLog: ActivityLog[];
    onViewDocument: (doc: Document) => void;
}

const timeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm trước";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng trước";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày trước";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ trước";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút trước";
    return "vài giây trước";
}

const StatCard: React.FC<{ title: string; value: number | string; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className="bg-[var(--color-primary-100)] p-3 rounded-full">
            <Icon className="h-6 w-6 text-[var(--color-primary-600)]" />
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const BarChartCard: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1); // Avoid division by zero
    return (
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <p className="w-1/3 text-sm text-gray-600 truncate pr-2">{item.label}</p>
                        <div className="w-2/3 bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-[var(--color-primary-500)] h-4 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className="text-xs font-medium text-white">{item.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ documents, categories, departments, activityLog, onViewDocument }) => {
    
    const docsByCategory = categories.map(cat => ({
        label: cat.name,
        value: documents.filter(doc => doc.categoryId === cat.id).length
    })).sort((a,b) => b.value - a.value);

    const docsByDepartment = departments.map(dep => ({
        label: dep.name,
        value: documents.filter(doc => doc.issuingDepartmentId === dep.id).length
    })).sort((a,b) => b.value - a.value);

    const recentLogs = activityLog.slice(0, 10);
    
    const recentDocuments = [...documents]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
        
    const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'N/A';

    return (
        <div className="p-6 sm:p-8 bg-gray-50 h-full overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển Tổng quan</h1>
                <p className="mt-1 text-gray-600">Thống kê và các hoạt động gần đây của hệ thống.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng số tài liệu" value={documents.length} icon={FileIcon} />
                <StatCard title="Số danh mục" value={categories.length} icon={FolderIcon} />
                <StatCard title="Số phòng ban" value={departments.length} icon={BuildingIcon} />
                <StatCard title="Hoạt động gần nhất" value={recentLogs.length > 0 ? timeAgo(recentLogs[0].timestamp) : 'Chưa có'} icon={ClockIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Charts */}
                <div className="lg:col-span-2 space-y-8">
                     <BarChartCard title="Thống kê tài liệu theo Danh mục" data={docsByCategory} />
                     <BarChartCard title="Thống kê tài liệu theo Phòng ban" data={docsByDepartment} />
                </div>

                {/* Right side: Feeds */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Hoạt động gần đây</h3>
                         <ul className="space-y-4">
                             {recentLogs.map(log => (
                                 <li key={log.id} className="flex items-start">
                                     <div className="bg-gray-100 p-2 rounded-full mr-3">
                                         <UserCircleIcon className="h-5 w-5 text-gray-500"/>
                                     </div>
                                     <div>
                                         <p className="text-sm text-gray-700">
                                            <span className="font-semibold">{log.userName}</span> {log.action.toLowerCase()}
                                         </p>
                                         <p className="text-xs text-gray-400 mt-0.5">{timeAgo(log.timestamp)}</p>
                                     </div>
                                 </li>
                             ))}
                         </ul>
                    </div>
                     {/* Recently Added Documents */}
                     <div className="bg-white p-6 rounded-lg shadow-md">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Tài liệu mới thêm</h3>
                         <ul className="space-y-3">
                             {recentDocuments.map(doc => (
                                 <li key={doc.id} className="flex items-center justify-between group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-500">{getDepartmentName(doc.issuingDepartmentId)} - {new Date(doc.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => onViewDocument(doc)} className="ml-2 p-1.5 rounded-full bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-600)]">
                                        <EyeIcon className="h-4 w-4"/>
                                    </button>
                                 </li>
                             ))}
                         </ul>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
