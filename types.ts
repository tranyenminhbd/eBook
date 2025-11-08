
export interface Attachment {
  name: string;
  url: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'video' | 'link';
}

export interface Document {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  issuingDepartmentId: string;
  createdAt: string;
  lastUpdated: string;
  attachments: Attachment[];
  status: 'active' | 'suspended';
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  departmentId: string;
  roleId: string;
  lastLogin: string;
  status: 'active' | 'suspended';
}

export interface Department {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PermissionSet {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface DocumentPermissions extends PermissionSet {
  editOthers?: boolean; // Can edit documents from other departments
}

export type PermissionCategory = 'documents' | 'categories' | 'users' | 'departments' | 'roles';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    documents: DocumentPermissions;
    categories: PermissionSet;
    users: PermissionSet;
    departments: PermissionSet;
    roles: PermissionSet;
  };
}

export interface Config {
  logo: string;
  companyName: string;
  developerName: string;
  developerUrl: string;
  themeColor: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
}