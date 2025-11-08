
import React from 'react';
import { Category, Role, User, Department, Config } from '../types';
import { HomeIcon, UsersIcon, BuildingIcon, ShieldIcon, FolderIcon, SettingsIcon, ChevronLeftIcon, FileIcon as DocumentIcon, ProfileIcon } from './icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  departments: Department[];
  currentUser: User | null;
  currentUserRole: Role | null;
  onNavigate: (view: string, filter?: { type: string; id: string }) => void;
  activeView: string;
  documentFilter: { type: string; id: string } | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  config: Config;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories, departments, currentUser, currentUserRole, onNavigate, activeView, documentFilter, isCollapsed, onToggleCollapse, config }) => {
  const NavItem: React.FC<{onClick: () => void, isActive: boolean, title: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, iconClassName?: string}> = 
  ({ onClick, isActive, title, icon: Icon, iconClassName = ''}) => (
      <button 
        onClick={onClick} 
        className={`w-full flex items-center py-2 text-sm font-medium rounded-md transition-all duration-200 ${isCollapsed ? 'justify-center' : 'px-2'} ${isActive ? 'bg-white text-[var(--color-primary-600)] font-semibold shadow' : 'text-gray-200 hover:bg-[rgba(255,255,255,0.1)] hover:text-white'}`}
        title={isCollapsed ? title : undefined}
      >
        <Icon className={`h-5 w-5 ${!isCollapsed && 'mr-3'} ${isActive ? 'text-[var(--color-primary-600)]' : iconClassName}`} />
        {!isCollapsed && title}
      </button>
  );

  const renderGuestSidebar = () => (
    <nav className={`flex-1 overflow-y-auto space-y-4 transition-all ${isCollapsed ? 'p-2' : 'p-4'}`}>
      <div>
        {!isCollapsed && <h3 className="px-2 text-xs font-semibold text-gray-300 opacity-70 uppercase tracking-wider">Tổng quan</h3>}
        <ul className="mt-2 space-y-1">
          <li>
            <NavItem 
              onClick={() => onNavigate('documents')}
              isActive={activeView === 'documents' && !documentFilter}
              title="Tất cả tài liệu"
              icon={HomeIcon}
              iconClassName="text-gray-300"
            />
          </li>
        </ul>
      </div>

       {/* Categories */}
      <div>
        {!isCollapsed && <h3 className="px-2 pt-4 text-xs font-semibold text-gray-300 opacity-70 uppercase tracking-wider">Danh mục</h3>}
        <ul className="mt-2 space-y-1">
          {categories.map(cat => (
            <li key={cat.id}>
               <NavItem 
                onClick={() => onNavigate('documents', { type: 'category', id: cat.id })}
                isActive={documentFilter?.type === 'category' && documentFilter?.id === cat.id}
                title={cat.name}
                icon={FolderIcon}
                iconClassName="text-gray-300"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Departments */}
      <div>
        {!isCollapsed && <h3 className="px-2 pt-4 text-xs font-semibold text-gray-300 opacity-70 uppercase tracking-wider">Phòng ban</h3>}
        <ul className="mt-2 space-y-1">
          {departments.map(dep => (
            <li key={dep.id}>
              <NavItem 
                onClick={() => onNavigate('documents', { type: 'department', id: dep.id })}
                isActive={documentFilter?.type === 'department' && documentFilter?.id === dep.id}
                title={dep.name}
                icon={BuildingIcon}
                iconClassName="text-gray-300"
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );

  const renderUserSidebar = () => {
    // A user must have 'read' permission to see the management link.
    const managementLinks = [
      { view: 'documents-management', label: 'Tài liệu', icon: DocumentIcon, canView: currentUserRole?.permissions.documents.read },
      { view: 'categories', label: 'Danh mục', icon: FolderIcon, canView: currentUserRole?.permissions.categories.read },
      { view: 'users', label: 'Người dùng', icon: UsersIcon, canView: currentUserRole?.permissions.users.read },
      { view: 'departments', label: 'Phòng ban', icon: BuildingIcon, canView: currentUserRole?.permissions.departments.read },
      { view: 'roles', label: 'Nhóm quyền', icon: ShieldIcon, canView: currentUserRole?.permissions.roles.read },
    ];
    const adminLinks = [
        { view: 'profile', label: 'Thông tin cá nhân', icon: ProfileIcon, canView: !!currentUser },
        { view: 'config', label: 'Cấu hình hệ thống', icon: SettingsIcon, canView: currentUserRole?.id === 'super-admin' },
    ];

    const showManagementLinks = managementLinks.some(link => link.canView);
    const showAdminLinks = adminLinks.some(link => link.canView);
    
    return (
      <nav className={`flex-1 overflow-y-auto transition-all ${isCollapsed ? 'p-2 space-y-2' : 'p-4 space-y-1'}`}>
        {/* Dashboard */}
        <NavItem 
          onClick={() => onNavigate('documents')}
          isActive={activeView === 'documents' && !documentFilter}
          title="Tổng quan"
          icon={HomeIcon}
          iconClassName="text-gray-300"
        />

        {/* Separator */}
        {(showManagementLinks || showAdminLinks) && !isCollapsed && <hr className="border-t border-[rgba(255,255,255,0.1)] my-2" />}

        {/* Quản lý Section */}
        {showManagementLinks && (
            <div>
                {!isCollapsed && <h3 className="px-2 pt-2 text-xs font-semibold text-gray-300 opacity-70 uppercase tracking-wider">Quản lý</h3>}
                <ul className="mt-1 space-y-1">
                    {managementLinks.map(link => (
                        link.canView && (
                            <li key={link.view}>
                                <NavItem
                                    onClick={() => onNavigate(link.view)}
                                    isActive={activeView === link.view}
                                    title={link.label}
                                    icon={link.icon}
                                    iconClassName="text-gray-300"
                                />
                            </li>
                        )
                    ))}
                </ul>
            </div>
        )}

        {/* Quản trị Section */}
        {showAdminLinks && (
             <div>
                {!isCollapsed && <h3 className="px-2 pt-2 text-xs font-semibold text-gray-300 opacity-70 uppercase tracking-wider">Quản trị</h3>}
                <ul className="mt-1 space-y-1">
                    {adminLinks.map(link => (
                        link.canView && (
                            <li key={link.view}>
                                <NavItem
                                    onClick={() => onNavigate(link.view)}
                                    isActive={activeView === link.view}
                                    title={link.label}
                                    icon={link.icon}
                                    iconClassName="text-gray-300"
                                />
                            </li>
                        )
                    ))}
                </ul>
            </div>
        )}
      </nav>
    );
  };


  return (
    <>
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 border-r border-r-[rgba(255,255,255,0.1)] z-30 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform lg:transition-all duration-300 ease-in-out w-64 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        style={{ backgroundColor: config.themeColor }}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center h-16 border-b border-[rgba(255,255,255,0.1)] transition-all ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
            {!isCollapsed && (
                <div className="font-bold text-xl text-white truncate">
                    {config.logo ? (
                        <img src={config.logo} alt={config.companyName} className="h-8 w-auto" />
                    ) : (
                        config.companyName
                    )}
                </div>
            )}

            <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md text-gray-200 hover:bg-[rgba(255,255,255,0.1)] hover:text-white"
                title="Đóng menu"
            >
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
                onClick={onToggleCollapse}
                className={`hidden lg:block p-2 rounded-full text-gray-200 hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            >
                <ChevronLeftIcon className="h-6 w-6" />
                <span className="sr-only">{isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}</span>
            </button>
          </div>
          
          {currentUser ? renderUserSidebar() : renderGuestSidebar()}

        </div>
      </aside>
      {/* Overlay for mobile */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-20 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;
