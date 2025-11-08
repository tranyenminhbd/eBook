
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DocumentList from './components/DocumentList';
import DocumentView from './components/DocumentView';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

// Management Components
import UserManagement from './components/management/UserManagement';
import DepartmentManagement from './components/management/DepartmentManagement';
import RoleManagement from './components/management/RoleManagement';
import CategoryManagement from './components/management/CategoryManagement';
import DocumentManagement from './components/management/DocumentManagement';
import ProfilePage from './components/management/ProfilePage';
import ConfigurationPage from './components/management/ConfigurationPage';

import { Document, Category, Department, Role, User, Config, ActivityLog } from './types';
import { documents as mockDocuments, categories as mockCategories, departments as mockDepartments, roles as mockRoles, users as mockUsers, activityLogs as mockActivityLogs } from './data/mockData';

// --- THEME HELPER FUNCTIONS ---

// Helper to convert hex to an RGB string for CSS variables
const hexToRgbString = (hex: string): string | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
};

// Helper to generate a full palette from a base hex color
const generateColorPalette = (baseHex: string): { [key: number]: string } => {
    const hexToRgbArray = (hex: string): [number, number, number] | null => {
        if (!/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(hex)) return null;
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
        return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    };
    
    const rgbToHex = (r: number, g: number, b: number): string => {
        const toHex = (c: number) => `0${Math.round(c).toString(16)}`.slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
    
    const mix = (color1: number, color2: number, weight: number): number => {
        const result = weight * color1 + (1 - weight) * color2;
        return result < 0 ? 0 : result > 255 ? 255 : result;
    }

    const baseRgb = hexToRgbArray(baseHex);
    
    // Fallback to default if base color is invalid
    if (!baseRgb) {
        return {
            50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
            500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        };
    }

    const [r, g, b] = baseRgb;
    const shades: { [key: number]: string } = {};

    shades[600] = baseHex;
    // Lighter shades by mixing with white
    shades[500] = rgbToHex(mix(r, 255, 0.85), mix(g, 255, 0.85), mix(b, 255, 0.85));
    shades[400] = rgbToHex(mix(r, 255, 0.7), mix(g, 255, 0.7), mix(b, 255, 0.7));
    shades[300] = rgbToHex(mix(r, 255, 0.5), mix(g, 255, 0.5), mix(b, 255, 0.5));
    shades[200] = rgbToHex(mix(r, 255, 0.3), mix(g, 255, 0.3), mix(b, 255, 0.3));
    shades[100] = rgbToHex(mix(r, 255, 0.15), mix(g, 255, 0.15), mix(b, 255, 0.15));
    shades[50] = rgbToHex(mix(r, 255, 0.07), mix(g, 255, 0.07), mix(b, 255, 0.07));
    // Darker shades by mixing with black
    shades[700] = rgbToHex(mix(r, 0, 0.87), mix(g, 0, 0.87), mix(b, 0, 0.87));
    shades[800] = rgbToHex(mix(r, 0, 0.74), mix(g, 0, 0.74), mix(b, 0, 0.74));
    shades[900] = rgbToHex(mix(r, 0, 0.61), mix(g, 0, 0.61), mix(b, 0, 0.61));
    
    return shades;
}


function App() {
  // --- STATE MANAGEMENT ---
  const [documents, setDocuments] = useState<Document[]>(() => {
      const saved = localStorage.getItem('documents');
      return saved ? JSON.parse(saved) : mockDocuments;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
      const saved = localStorage.getItem('categories');
      return saved ? JSON.parse(saved) : mockCategories;
  });
  const [departments, setDepartments] = useState<Department[]>(() => {
      const saved = localStorage.getItem('departments');
      return saved ? JSON.parse(saved) : mockDepartments;
  });
  const [roles, setRoles] = useState<Role[]>(() => {
      const saved = localStorage.getItem('roles');
      return saved ? JSON.parse(saved) : mockRoles;
  });
  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('users');
      return saved ? JSON.parse(saved) : mockUsers;
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
      const saved = localStorage.getItem('activityLog');
      return saved ? JSON.parse(saved) : mockActivityLogs;
  });
  const [config, setConfig] = useState<Config>(() => {
      const saved = localStorage.getItem('config');
      const defaultConfig: Config = {
          logo: '',
          companyName: 'DocuFlow',
          developerName: 'Gemini Coder',
          developerUrl: 'https://gemini.google.com/',
          themeColor: '#4f46e5',
      };
      if (saved) {
          const parsed = JSON.parse(saved);
          const { headerColor, ...restOfParsed } = parsed; // Safely remove old property
          return { ...defaultConfig, ...restOfParsed };
      }
      return defaultConfig;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Load all users from storage to ensure we have the latest data available in this browser.
    const allUsers: User[] = (() => {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : mockUsers;
    })();
    
    // Check if there is a reference to a logged-in user.
    const savedCurrentUserRef = localStorage.getItem('currentUser');
    if (!savedCurrentUserRef) {
      return null;
    }
    
    try {
      const loggedInUserRef = JSON.parse(savedCurrentUserRef);
      if (!loggedInUserRef || !loggedInUserRef.id) return null;
      
      // Find the full, up-to-date user data from the master list.
      const freshUserData = allUsers.find(u => u.id === loggedInUserRef.id);
      
      // If the user exists and is active, use their data. Otherwise, they are logged out.
      if (freshUserData && freshUserData.status === 'active') {
        return freshUserData;
      }
    } catch (e) {
      // If parsing fails, treat as logged out.
      console.error("Failed to parse currentUser from localStorage", e);
      return null;
    }
    
    return null;
  });

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true'); // For desktop collapse
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  const [view, setView] = useState('documents'); // 'documents', 'users', 'departments', 'roles', etc.
  const [documentFilter, setDocumentFilter] = useState<{ type: string; id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- DERIVED STATE ---
  const currentUserRole = roles.find(r => r.id === currentUser?.roleId) || null;
  
  const filteredDocuments = documents
    .filter(d => d.status === 'active' || (currentUser && currentUserRole?.permissions.documents.update))
    .filter(d => {
        if (!documentFilter) return true;
        if (documentFilter.type === 'category') return d.categoryId === documentFilter.id;
        if (documentFilter.type === 'department') return d.issuingDepartmentId === documentFilter.id;
        return true;
    })
    .filter(d => {
        if (searchQuery.trim() === '') return true;
        const lowerCaseQuery = searchQuery.toLowerCase();
        const searchableContent = d.content.replace(/<[^>]*>?/gm, ' '); // Strip HTML tags for searching
        return d.title.toLowerCase().includes(lowerCaseQuery) || searchableContent.toLowerCase().includes(lowerCaseQuery);
    });
  
  // --- EFFECTS ---
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Save to local storage on change
    localStorage.setItem('documents', JSON.stringify(documents));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('departments', JSON.stringify(departments));
    localStorage.setItem('roles', JSON.stringify(roles));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('config', JSON.stringify(config));
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('currentUser');
    }
  }, [documents, categories, departments, roles, users, config, currentUser, activityLog]);
  
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    // Apply theme color by generating and setting a full palette
    const palette = generateColorPalette(config.themeColor);
    const root = document.documentElement;
    
    // Set the full palette as CSS variables
    for (const [key, value] of Object.entries(palette)) {
        root.style.setProperty(`--color-primary-${key}`, value);
    }

    // Also set the --color-primary-rgb for any components that might use it for rgba()
    const rgbString = hexToRgbString(palette[600]);
    if (rgbString) {
        root.style.setProperty('--color-primary-rgb', rgbString);
    }
  }, [config.themeColor]);

  // --- HANDLERS ---
  
  const logActivity = (action: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      action,
    };
    // Add to the beginning of the array and keep the last 50 entries
    setActivityLog(prev => [newLog, ...prev].slice(0, 50));
  };


  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    logActivity(`Người dùng "${user.name}" đã đăng nhập.`);
    setView('documents'); // This will now show the dashboard
  };

  const handleLogout = () => {
    if(currentUser) {
        logActivity(`Người dùng "${currentUser.name}" đã đăng xuất.`);
    }
    setCurrentUser(null);
    setSelectedDocument(null);
    setView('documents');
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
      }
      logActivity(`Cập nhật thông tin cá nhân.`);
  };

  const handleNavigate = (newView: string, filter?: { type: string; id: string }) => {
    setView(newView);
    setSelectedDocument(null);
    setDocumentFilter(newView === 'documents' ? filter || null : null);
    if (filter) { // Clear search if a sidebar filter is applied
        setSearchQuery('');
    }
    if(isMobileView) setIsSidebarOpen(false);
  };
  
  const handleSelectDocument = (doc: Document) => {
      setSelectedDocument(doc);
  };

  const handleViewDocumentFromManagement = (doc: Document) => {
      setView('documents');
      setSelectedDocument(doc);
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      // Clear sidebar filters when user starts searching
      if(query.trim() !== '' && documentFilter) {
        setDocumentFilter(null);
      }
  };
  
  const handleResetData = () => {
      const keysToRemove = ['documents', 'categories', 'departments', 'roles', 'users', 'config', 'currentUser', 'sidebarCollapsed', 'activityLog'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      window.location.reload();
  };


  const renderPublicDocumentView = () => {
    let listTitle = 'Tất cả tài liệu';
    if (searchQuery.trim()) {
      listTitle = `Kết quả cho "${searchQuery}"`;
    } else if (documentFilter) {
      if (documentFilter.type === 'category') {
        listTitle = categories.find(c => c.id === documentFilter.id)?.name || 'Danh mục';
      } else if (documentFilter.type === 'department') {
        listTitle = departments.find(d => d.id === documentFilter.id)?.name || 'Phòng ban';
      }
    }

    return (
      <div className="flex h-full">
        {!(isMobileView && selectedDocument) && (
          <DocumentList 
            documents={filteredDocuments} 
            onSelectDocument={handleSelectDocument}
            categories={categories}
            departments={departments}
            title={listTitle}
          />
        )}
        {(!isMobileView || selectedDocument) && (
          <DocumentView 
            document={selectedDocument} 
            onBack={() => setSelectedDocument(null)}
            isMobile={isMobileView}
          />
        )}
      </div>
    );
  };

  const renderMainContent = () => {
    // For logged-in users, the 'documents' view becomes the dashboard
    if (currentUser && view === 'documents' && !documentFilter && !searchQuery && !selectedDocument) {
        return <Dashboard 
            documents={documents}
            categories={categories}
            departments={departments}
            activityLog={activityLog}
            onViewDocument={handleViewDocumentFromManagement}
        />;
    }
      
    switch (view) {
      case 'users':
        return currentUserRole?.permissions.users.read
          ? <UserManagement users={users} onUpdateUsers={setUsers} departments={departments} roles={roles} currentUserRole={currentUserRole} logActivity={logActivity}/>
          : renderPublicDocumentView();
      case 'departments':
        return currentUserRole?.permissions.departments.read
          ? <DepartmentManagement departments={departments} onUpdateDepartments={setDepartments} currentUserRole={currentUserRole} logActivity={logActivity}/>
          : renderPublicDocumentView();
      case 'roles':
        return currentUserRole?.permissions.roles.read
          ? <RoleManagement roles={roles} onUpdateRoles={setRoles} currentUserRole={currentUserRole} logActivity={logActivity}/>
          : renderPublicDocumentView();
      case 'categories':
        return currentUserRole?.permissions.categories.read
          ? <CategoryManagement categories={categories} onUpdateCategories={setCategories} currentUserRole={currentUserRole} logActivity={logActivity}/>
          : renderPublicDocumentView();
      case 'documents-management':
          return currentUserRole?.permissions.documents.read
            ? <DocumentManagement documents={documents} onUpdateDocuments={setDocuments} categories={categories} departments={departments} currentUser={currentUser} currentUserRole={currentUserRole} onViewDocument={handleViewDocumentFromManagement} logActivity={logActivity}/>
            : renderPublicDocumentView();
      case 'profile':
          return currentUser
            ? <ProfilePage currentUser={currentUser} onUpdateUser={handleUpdateUser} departments={departments} roles={roles} logActivity={logActivity}/>
            : renderPublicDocumentView();
      case 'config':
          return currentUserRole?.id === 'super-admin'
            ? <ConfigurationPage config={config} onUpdateConfig={setConfig} onResetData={handleResetData} logActivity={logActivity}/>
            : renderPublicDocumentView();
      case 'documents':
      default:
        return renderPublicDocumentView();
    }
  };


  return (
    <div className="h-screen w-screen bg-gray-100 flex font-sans text-gray-900 antialiased">
        <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            categories={categories}
            departments={departments}
            currentUser={currentUser}
            currentUserRole={currentUserRole}
            onNavigate={handleNavigate}
            activeView={view}
            documentFilter={documentFilter}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
            config={config}
        />
        <div className="flex-1 flex flex-col overflow-y-hidden">
            <Header 
                currentUser={currentUser} 
                onLogout={handleLogout} 
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onProfileClick={() => handleNavigate('profile')}
                onLoginClick={() => setIsLoginModalOpen(true)}
                config={config}
                searchQuery={searchQuery}
                onSearch={handleSearch}
            />
            <main className="flex-1 overflow-y-auto">
                {renderMainContent()}
            </main>
            <Footer config={config} />
        </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        users={users}
        config={config}
      />
    </div>
  );
}

export default App;