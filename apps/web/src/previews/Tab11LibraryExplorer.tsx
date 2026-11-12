import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Upload,
  Trash2,
  HardDrive,
  MoreVertical,
  Search,
  Check,
  Download,
  FileSpreadsheet,
  FileArchive,
  FileImage,
  FileCode,
  History,
  RotateCcw,
  LayoutGrid,
  List,
  ExternalLink,
  X,
  ChevronRight,
  AlertCircle,
  Eye,
  Plus,
  Link2,
  Copy,
  ShieldCheck,
  Clock,
  Layers,
  Inbox,
  ArrowUpDown
} from 'lucide-react';

export type FileFormat = 'pdf' | 'doc' | 'sheet' | 'image' | 'archive' | 'link' | 'note';

export interface FileVersion {
  version: string;
  eTag: string;
  updatedAt: string;
  author: string;
  size: string;
  notes: string;
}

export interface FileItem {
  id: string;
  name: string;
  format: FileFormat;
  size: string;
  sizeBytes: number;
  folderId: string;
  updatedAt: string;
  author: string;
  eTag: string;
  versions: FileVersion[];
  description?: string;
  isTrashed?: boolean;
  trashedAt?: string;
  inbox?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  isInbox?: boolean;
  isSystem?: boolean;
}

const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'f-root', name: 'Tất cả tài liệu', isSystem: true },
  { id: 'f-inbox', name: 'Hộp thu cá nhân (Inbox)', isInbox: true },
  { id: 'f-spec', name: 'Đặc tả kỹ thuật (Specs)' },
  { id: 'f-slides', name: 'Slide thuyết trình' },
  { id: 'f-code', name: 'Tài liệu API & Schemas' },
  { id: 'f-reports', name: 'Báo cáo đồ án & Bảng biểu' },
];

const INITIAL_FILES: FileItem[] = [
  {
    id: 'file-1',
    name: 'SNOTE_v2_Architecture_Manifest.pdf',
    format: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2516582,
    folderId: 'f-spec',
    updatedAt: '08/11/2026',
    author: 'Lê Hoàng Nam',
    eTag: 'etag-8f92a1c',
    description: 'Bản đặc tả kiến trúc phân lớp, module contracts và giao thức bảo mật v2.',
    versions: [
      { version: 'v2', eTag: 'etag-8f92a1c', updatedAt: '08/11/2026 14:30', author: 'Lê Hoàng Nam', size: '2.4 MB', notes: 'Bổ sung sơ đồ luồng dữ liệu 3-Zone Desktop.' },
      { version: 'v1', eTag: 'etag-1a2b3c4', updatedAt: '01/11/2026 09:15', author: 'Trần Thị Mai', size: '2.1 MB', notes: 'Khởi tạo tài liệu kiến trúc sơ bộ.' }
    ]
  },
  {
    id: 'file-2',
    name: 'OpenAPI_Contracts_v3.json',
    format: 'doc',
    size: '480 KB',
    sizeBytes: 491520,
    folderId: 'f-code',
    updatedAt: '07/11/2026',
    author: 'Trần Thị Mai',
    eTag: 'etag-3d4e5f6',
    description: 'Đặc tả toàn bộ REST Endpoints, DTOs và schema dữ liệu.',
    versions: [
      { version: 'v3', eTag: 'etag-3d4e5f6', updatedAt: '07/11/2026 18:20', author: 'Trần Thị Mai', size: '480 KB', notes: 'Cập nhật chuẩn ETag concurrency cho upload.' },
      { version: 'v2', eTag: 'etag-7g8h9i0', updatedAt: '04/11/2026 11:00', author: 'Nguyễn Văn Minh', size: '450 KB', notes: 'Thêm endpoints cho phân hệ Library & Storage.' }
    ]
  },
  {
    id: 'file-3',
    name: 'Database_Schema_Migration_Matrix.xlsx',
    format: 'sheet',
    size: '1.8 MB',
    sizeBytes: 1887436,
    folderId: 'f-code',
    updatedAt: '06/11/2026',
    author: 'Nguyễn Văn Minh',
    eTag: 'etag-2b4c6d8',
    description: 'Ma trận đối soát bảng dữ liệu và script di chuyển schema.',
    versions: [
      { version: 'v1', eTag: 'etag-2b4c6d8', updatedAt: '06/11/2026 10:45', author: 'Nguyễn Văn Minh', size: '1.8 MB', notes: 'Phiên bản gốc ban đầu.' }
    ]
  },
  {
    id: 'file-4',
    name: 'Slide_Bao_Cao_Tien_Do_Giua_Ky.pptx',
    format: 'doc',
    size: '8.1 MB',
    sizeBytes: 8493465,
    folderId: 'f-slides',
    updatedAt: '06/11/2026',
    author: 'Phạm Quỳnh Anh',
    eTag: 'etag-9c8b7a6',
    description: 'Bản trình bày thuyết minh tiến độ đồ án trước hội đồng.',
    versions: [
      { version: 'v1', eTag: 'etag-9c8b7a6', updatedAt: '06/11/2026 16:00', author: 'Phạm Quỳnh Anh', size: '8.1 MB', notes: 'Slide hoàn chỉnh mid-term.' }
    ]
  },
  {
    id: 'file-5',
    name: 'System_Architecture_Topology.png',
    format: 'image',
    size: '3.2 MB',
    sizeBytes: 3355443,
    folderId: 'f-spec',
    updatedAt: '05/11/2026',
    author: 'Lê Hoàng Nam',
    eTag: 'etag-5e6f7a8',
    description: 'Sơ đồ topo mạng phân tán và ranh giới bảo mật hạ tầng.',
    versions: [
      { version: 'v1', eTag: 'etag-5e6f7a8', updatedAt: '05/11/2026 08:30', author: 'Lê Hoàng Nam', size: '3.2 MB', notes: 'Render export từ Mermaid & draw.io.' }
    ]
  },
  {
    id: 'file-6',
    name: 'SNOTE_Core_Release_v2.0_Artifacts.zip',
    format: 'archive',
    size: '14.5 MB',
    sizeBytes: 15204352,
    folderId: 'f-reports',
    updatedAt: '04/11/2026',
    author: 'Đỗ Quốc Bảo',
    eTag: 'etag-1f3e5d7',
    description: 'Gói nén mã nguồn kiểm thử và bộ dữ liệu seed thử nghiệm.',
    versions: [
      { version: 'v1', eTag: 'etag-1f3e5d7', updatedAt: '04/11/2026 21:00', author: 'Đỗ Quốc Bảo', size: '14.5 MB', notes: 'Bản đóng gói kiểm thử độc lập.' }
    ]
  },
  {
    id: 'file-7',
    name: 'Ghi chú nhanh: Kế hoạch rà soát hạ tầng',
    format: 'note',
    size: '12 KB',
    sizeBytes: 12288,
    folderId: 'f-inbox',
    updatedAt: '09/11/2026',
    author: 'Bạn (Người dùng)',
    eTag: 'etag-7a8b9c0',
    description: 'Mục lưu nhanh chưa phân loại đưa vào Hộp thu cá nhân.',
    inbox: true,
    versions: [
      { version: 'v1', eTag: 'etag-7a8b9c0', updatedAt: '09/11/2026 11:20', author: 'Bạn', size: '12 KB', notes: 'Tạo tự động từ Quick Save.' }
    ]
  }
];

const INITIAL_TRASH: FileItem[] = [
  {
    id: 'trash-1',
    name: 'Old_Draft_Requirements_v1.docx',
    format: 'doc',
    size: '1.1 MB',
    sizeBytes: 1153433,
    folderId: 'f-spec',
    updatedAt: '02/11/2026',
    author: 'Trần Thị Mai',
    eTag: 'etag-0a1b2c3',
    description: 'Bản nháp yêu cầu cũ đã được hợp nhất vào Manifest.',
    isTrashed: true,
    trashedAt: '02/11/2026 15:00',
    versions: [
      { version: 'v1', eTag: 'etag-0a1b2c3', updatedAt: '02/11/2026', author: 'Trần Thị Mai', size: '1.1 MB', notes: 'Bản nháp ban đầu' }
    ]
  }
];

export const Tab11LibraryExplorer: React.FC = () => {
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('f-root');
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [trashFiles, setTrashFiles] = useState<FileItem[]>(INITIAL_TRASH);
  const [selectedFileId, setSelectedFileId] = useState<string | null>('file-1');
  
  // UI states
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTrashView, setIsTrashView] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState<boolean>(false);
  const [quickSaveType, setQuickSaveType] = useState<'note' | 'link' | 'file'>('file');
  const [quickSaveTitle, setQuickSaveTitle] = useState<string>('');
  const [quickSaveContent, setQuickSaveContent] = useState<string>('');
  const [quickSaveTargetFolder, setQuickSaveTargetFolder] = useState<string>('f-inbox');
  
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState<boolean>(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3200);
  };

  // Helper for Format Icons (Standard Lucide SVG)
  const getFormatIcon = (format: FileFormat, size = 18) => {
    switch (format) {
      case 'pdf':
        return <FileText size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      case 'sheet':
        return <FileSpreadsheet size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      case 'image':
        return <FileImage size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      case 'archive':
        return <FileArchive size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      case 'link':
        return <Link2 size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      case 'note':
        return <FileCode size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
      default:
        return <FileText size={size} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />;
    }
  };

  // Filter files based on folder, search query and format
  const filteredFiles = files.filter(file => {
    const matchesFolder = activeFolderId === 'f-root' || file.folderId === activeFolderId;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = filterFormat === 'all' || file.format === filterFormat;
    return matchesFolder && matchesSearch && matchesFormat;
  });

  const selectedFile = files.find(f => f.id === selectedFileId) || 
                       trashFiles.find(f => f.id === selectedFileId);

  // File Count per Folder
  const getFileCountForFolder = (folderId: string) => {
    if (folderId === 'f-root') return files.length;
    return files.filter(f => f.folderId === folderId).length;
  };

  // Total Quota Calculation (Simulated: 18.5 MB / 1,024 MB = 1.8%)
  const totalSizeBytes = files.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
  const quotaLimitMB = 1024; // 1 GB
  const quotaPercent = ((parseFloat(totalMB) / quotaLimitMB) * 100).toFixed(1);

  // Move to Trash
  const handleMoveToTrash = (file: FileItem) => {
    const updatedFiles = files.filter(f => f.id !== file.id);
    const trashedItem: FileItem = {
      ...file,
      isTrashed: true,
      trashedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setFiles(updatedFiles);
    setTrashFiles([trashedItem, ...trashFiles]);
    if (selectedFileId === file.id) {
      setSelectedFileId(null);
    }
    showNotice(`Đã chuyển "${file.name}" vào thùng rác (lưu giữ 30 ngày)`);
  };

  // Restore from Trash
  const handleRestoreFromTrash = (file: FileItem) => {
    const updatedTrash = trashFiles.filter(f => f.id !== file.id);
    const restoredItem: FileItem = {
      ...file,
      isTrashed: false,
      trashedAt: undefined
    };
    setTrashFiles(updatedTrash);
    setFiles([restoredItem, ...files]);
    showNotice(`Đã khôi phục "${file.name}" về thư mục gốc`);
  };

  // Delete Permanently
  const handlePermanentDelete = (fileId: string) => {
    setTrashFiles(trashFiles.filter(f => f.id !== fileId));
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
    }
    showNotice('Đã xóa vĩnh viễn tệp khỏi máy chủ');
  };

  // Overwrite File (Create Version Snapshot)
  const handleConfirmOverwrite = (isOverwrite: boolean) => {
    if (!selectedFile) return;

    if (isOverwrite) {
      const nextVersionNum = selectedFile.versions.length + 1;
      const newVersion: FileVersion = {
        version: `v${nextVersionNum}`,
        eTag: `etag-${Math.random().toString(36).substring(2, 9)}`,
        updatedAt: 'Vừa xong',
        author: 'Bạn (Người dùng)',
        size: selectedFile.size,
        notes: `Cập nhật bản snapshot v${nextVersionNum} (ghi đè an toàn).`
      };

      const updated = files.map(f => {
        if (f.id === selectedFile.id) {
          return {
            ...f,
            eTag: newVersion.eTag,
            updatedAt: 'Hôm nay',
            author: 'Bạn (Người dùng)',
            versions: [newVersion, ...f.versions]
          };
        }
        return f;
      });

      setFiles(updated);
      showNotice(`Đã ghi đè thành công "${selectedFile.name}" thành phiên bản v${nextVersionNum}`);
    } else {
      // Create new copy
      const copyFile: FileItem = {
        ...selectedFile,
        id: `file-${Date.now()}`,
        name: `${selectedFile.name.replace(/\.[^/.]+$/, '')}_Copy.${selectedFile.name.split('.').pop()}`,
        eTag: `etag-${Math.random().toString(36).substring(2, 9)}`,
        updatedAt: 'Hôm nay',
        author: 'Bạn (Người dùng)',
        versions: [
          {
            version: 'v1',
            eTag: `etag-${Math.random().toString(36).substring(2, 9)}`,
            updatedAt: 'Hôm nay',
            author: 'Bạn (Người dùng)',
            size: selectedFile.size,
            notes: `Tạo bản sao độc lập từ ${selectedFile.name}`
          }
        ]
      };
      setFiles([copyFile, ...files]);
      showNotice(`Đã tạo bản sao độc lập "${copyFile.name}"`);
    }

    setIsOverwriteModalOpen(false);
  };

  // Handle Quick Save Submit
  const handleQuickSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSaveTitle.trim()) {
      showNotice('Vui lòng nhập tên tài liệu hoặc ghi chú');
      return;
    }

    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: quickSaveType === 'link' 
        ? (quickSaveTitle.startsWith('http') ? quickSaveTitle : `https://${quickSaveTitle}`)
        : quickSaveTitle,
      format: quickSaveType === 'file' ? 'doc' : quickSaveType,
      size: quickSaveType === 'note' ? '8 KB' : quickSaveType === 'link' ? '1 KB' : '1.2 MB',
      sizeBytes: quickSaveType === 'note' ? 8192 : quickSaveType === 'link' ? 1024 : 1258291,
      folderId: quickSaveTargetFolder,
      updatedAt: 'Hôm nay',
      author: 'Bạn (Người dùng)',
      eTag: `etag-${Math.random().toString(36).substring(2, 9)}`,
      description: quickSaveContent || 'Mục lưu nhanh qua thanh công cụ.',
      versions: [
        {
          version: 'v1',
          eTag: `etag-${Math.random().toString(36).substring(2, 9)}`,
          updatedAt: 'Hôm nay',
          author: 'Bạn (Người dùng)',
          size: quickSaveType === 'note' ? '8 KB' : '1.2 MB',
          notes: 'Khởi tạo qua Lưu nhanh'
        }
      ]
    };

    setFiles([newFile, ...files]);
    setIsQuickSaveOpen(false);
    setQuickSaveTitle('');
    setQuickSaveContent('');
    showNotice(`Đã lưu thành công vào "${folders.find(f => f.id === quickSaveTargetFolder)?.name || 'Hộp thu'}"`);
  };

  // Handle New Folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFolder: FolderItem = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim()
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
    showNotice(`Đã tạo thư mục mới "${newFolder.name}"`);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        width: '100%',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {/* Toast Notice */}
      {notice && (
        <div 
          role="status" 
          aria-live="polite"
          style={{ 
            background: 'var(--surface-card)', 
            border: '1px solid var(--text-primary)', 
            padding: '12px 18px', 
            borderRadius: '6px', 
            color: 'var(--text-primary)', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'fadeIn 160ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <Check size={16} aria-hidden="true" />
          <span style={{ fontWeight: 500 }}>{notice}</span>
        </div>
      )}

      {/* TOP TOOLBAR: Search, Filters, Quick Actions */}
      <header
        style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border-divider)',
          borderRadius: '8px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Left: Title & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {isTrashView ? 'Thùng rác tài liệu' : 'Thư viện tệp & Kho lưu trữ'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              {isTrashView ? 'Các mục lưu giữ tối đa 30 ngày trước khi tự hủy' : 'Quản lý cây thư mục, tệp đính kèm và kiểm soát hạn mức lưu trữ'}
            </p>
          </div>

          {!isTrashView && (
            <div style={{ position: 'relative', width: '260px' }}>
              <Search 
                size={15} 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm tệp, tác giả..."
                aria-label="Tìm kiếm tệp trong thư viện"
                style={{
                  width: '100%',
                  minHeight: '38px',
                  padding: '6px 12px 6px 34px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 140ms ease'
                }}
              />
            </div>
          )}
        </div>

        {/* Right: Actions (Quick Save, Trash, View Toggle) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Toggle */}
          {!isTrashView && (
            <div 
              role="tablist" 
              aria-label="Chế độ hiển thị danh sách"
              style={{ display: 'flex', border: '1px solid var(--border-divider)', borderRadius: '6px', overflow: 'hidden' }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                aria-label="Hiển thị dạng thẻ lưới"
                onClick={() => setViewMode('grid')}
                style={{
                  minHeight: '38px',
                  minWidth: '38px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--surface-card)',
                  color: viewMode === 'grid' ? 'var(--bg-app)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 140ms ease'
                }}
              >
                <LayoutGrid size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'table'}
                aria-label="Hiển thị dạng danh sách chi tiết"
                onClick={() => setViewMode('table')}
                style={{
                  minHeight: '38px',
                  minWidth: '38px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderLeft: '1px solid var(--border-divider)',
                  background: viewMode === 'table' ? 'var(--text-primary)' : 'var(--surface-card)',
                  color: viewMode === 'table' ? 'var(--bg-app)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 140ms ease'
                }}
              >
                <List size={15} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Toggle Trash View */}
          <button
            type="button"
            onClick={() => {
              setIsTrashView(!isTrashView);
              setSelectedFileId(null);
            }}
            style={{
              minHeight: '38px',
              padding: '0 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-divider)',
              background: isTrashView ? 'var(--text-primary)' : 'transparent',
              color: isTrashView ? 'var(--bg-app)' : 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 140ms ease'
            }}
          >
            <Trash2 size={15} aria-hidden="true" />
            <span>{isTrashView ? 'Quay lại Thư viện' : `Thùng rác (${trashFiles.length})`}</span>
          </button>

          {/* Quick Save Modal Button */}
          {!isTrashView && (
            <button
              type="button"
              onClick={() => setIsQuickSaveOpen(true)}
              style={{
                minHeight: '38px',
                padding: '0 16px',
                borderRadius: '6px',
                border: '1px solid var(--text-primary)',
                background: 'var(--text-primary)',
                color: 'var(--bg-app)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'opacity 140ms ease'
              }}
            >
              <Plus size={15} aria-hidden="true" />
              <span>Lưu nhanh</span>
            </button>
          )}
        </div>
      </header>

      {/* 3-ZONE DESKTOP LAYOUT (CUXB-01) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: selectedFile ? '240px 1fr 340px' : '240px 1fr', 
          gap: '16px',
          alignItems: 'start',
          transition: 'grid-template-columns 180ms ease'
        }}
      >
        {/* VÙNG 1: SIDEBAR CÂY THƯ MỤC & QUOTA CARD (240px) */}
        <aside 
          aria-label="Cây thư mục và dung lượng"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Folder Tree Card */}
          <div 
            style={{ 
              background: 'var(--surface-card)', 
              border: '1px solid var(--border-divider)', 
              borderRadius: '8px', 
              padding: '14px 12px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 10px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                Thư mục lưu trữ
              </span>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(true)}
                title="Tạo thư mục mới"
                aria-label="Tạo thư mục mới"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 140ms ease'
                }}
              >
                <FolderPlus size={15} aria-hidden="true" />
              </button>
            </div>

            <nav 
              role="tablist" 
              aria-label="Danh mục thư mục"
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              {folders.map(folder => {
                const isActive = activeFolderId === folder.id && !isTrashView;
                const count = getFileCountForFolder(folder.id);

                return (
                  <button
                    key={folder.id}
                    type="button"
                    role="tab"
                    id={`folder-tab-${folder.id}`}
                    aria-selected={isActive}
                    aria-controls="file-explorer-content"
                    onClick={() => {
                      setActiveFolderId(folder.id);
                      setIsTrashView(false);
                    }}
                    style={{
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--text-primary)' : 'transparent',
                      background: isActive ? 'var(--surface-hover)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 140ms ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      {folder.isInbox ? (
                        <Inbox size={15} style={{ flexShrink: 0, color: 'var(--text-primary)' }} aria-hidden="true" />
                      ) : (
                        <Folder size={15} style={{ flexShrink: 0, color: 'var(--text-primary)' }} aria-hidden="true" />
                      )}
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {folder.name}
                      </span>
                    </div>

                    <span 
                      style={{ 
                        fontSize: '11px', 
                        padding: '1px 6px', 
                        borderRadius: '10px', 
                        background: isActive ? 'var(--text-primary)' : 'var(--surface-hover)', 
                        color: isActive ? 'var(--bg-app)' : 'var(--text-secondary)',
                        fontWeight: 600
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Storage Quota Card (1 GB Workspace Limit - LIB-16) */}
          <div 
            style={{ 
              background: 'var(--surface-card)', 
              border: '1px solid var(--border-divider)', 
              borderRadius: '8px', 
              padding: '16px' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <HardDrive size={16} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Dung lượng Workspace
              </h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Đã sử dụng</span>
              <strong style={{ color: 'var(--text-primary)' }}>{totalMB} MB / 1,024 MB ({quotaPercent}%)</strong>
            </div>

            {/* High-Contrast Progress Bar */}
            <div 
              role="progressbar"
              aria-valuenow={parseFloat(totalMB)}
              aria-valuemin={0}
              aria-valuemax={1024}
              aria-label="Mức sử dụng hạn ngạch dung lượng"
              style={{ 
                width: '100%', 
                height: '7px', 
                background: 'var(--surface-hover)', 
                borderRadius: '4px', 
                overflow: 'hidden',
                border: '1px solid var(--border-divider)'
              }}
            >
              <div 
                style={{ 
                  width: `${Math.max(parseFloat(quotaPercent), 3)}%`, 
                  height: '100%', 
                  background: 'var(--text-primary)',
                  transition: 'width 240ms ease'
                }} 
              />
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.4' }}>
              Giới hạn thử nghiệm 25 MB mỗi tệp. Mục trong thùng rác không tính vào dung lượng.
            </p>
          </div>
        </aside>

        {/* VÙNG 2: KHU VỰC DANH MỤC TỆP CHÍNH (FLEX 1) */}
        <main 
          id="file-explorer-content"
          role="region"
          aria-label="Danh sách tài liệu"
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          {/* Breadcrumb & Filter Bar */}
          <div 
            style={{ 
              background: 'var(--surface-card)', 
              border: '1px solid var(--border-divider)', 
              borderRadius: '8px', 
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            {/* Breadcrumb Path */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Thư viện</span>
              <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
              <strong style={{ color: 'var(--text-primary)' }}>
                {isTrashView ? 'Thùng rác' : folders.find(f => f.id === activeFolderId)?.name || 'Tất cả'}
              </strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                ({isTrashView ? trashFiles.length : filteredFiles.length} mục)
              </span>
            </div>

            {/* Quick Format Filter Chips */}
            {!isTrashView && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'pdf', label: 'PDF' },
                  { id: 'sheet', label: 'Bảng tính' },
                  { id: 'doc', label: 'Tài liệu' },
                  { id: 'image', label: 'Hình ảnh' },
                  { id: 'archive', label: 'Nén (ZIP)' },
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilterFormat(chip.id)}
                    style={{
                      minHeight: '28px',
                      padding: '2px 10px',
                      borderRadius: '14px',
                      fontSize: '11px',
                      fontWeight: filterFormat === chip.id ? 600 : 400,
                      border: '1px solid',
                      borderColor: filterFormat === chip.id ? 'var(--text-primary)' : 'var(--border-divider)',
                      background: filterFormat === chip.id ? 'var(--text-primary)' : 'transparent',
                      color: filterFormat === chip.id ? 'var(--bg-app)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW: TRASH BIN VIEW (LIB-14) */}
          {isTrashView ? (
            <div 
              style={{ 
                background: 'var(--surface-card)', 
                border: '1px solid var(--border-divider)', 
                borderRadius: '8px', 
                overflow: 'hidden' 
              }}
            >
              <div style={{ padding: '12px 16px', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-divider)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <AlertCircle size={15} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
                <span>Các tệp đã chuyển vào thùng rác sẽ được lưu trữ an toàn trong 30 ngày trước khi bị hủy vĩnh viễn.</span>
              </div>

              {trashFiles.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Thùng rác trống. Chưa có tệp nào bị xóa.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {trashFiles.map(file => (
                    <div 
                      key={file.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--border-divider)',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {getFormatIcon(file.format, 20)}
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {file.size} • Xóa lúc: {file.trashedAt} • Bởi: {file.author}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleRestoreFromTrash(file)}
                          style={{
                            minHeight: '36px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--text-primary)',
                            background: 'var(--text-primary)',
                            color: 'var(--bg-app)',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={13} aria-hidden="true" />
                          <span>Khôi phục</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermanentDelete(file.id)}
                          style={{
                            minHeight: '36px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-divider)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} aria-hidden="true" />
                          <span>Xóa vĩnh viễn</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VIEW: ACTIVE FILES (GRID or TABLE) */
            filteredFiles.length === 0 ? (
              <div 
                style={{ 
                  background: 'var(--surface-card)', 
                  border: '1px solid var(--border-divider)', 
                  borderRadius: '8px', 
                  padding: '50px 20px', 
                  textAlign: 'center' 
                }}
              >
                <FileText size={32} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px' }} aria-hidden="true" />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Không tìm thấy tài liệu phù hợp
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                  Thử tìm kiếm với từ khóa khác hoặc bấm nút "Lưu nhanh" để tải lên tệp mới.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', 
                  gap: '14px' 
                }}
              >
                {filteredFiles.map(file => {
                  const isSelected = selectedFileId === file.id;

                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Xem chi tiết tệp ${file.name}`}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedFileId(file.id);
                        }
                      }}
                      style={{
                        background: isSelected ? 'var(--surface-hover)' : 'var(--surface-card)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-divider)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '150px',
                        cursor: 'pointer',
                        transition: 'all 140ms cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Top Meta: Format Icon & Version Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {getFormatIcon(file.format, 20)}
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {file.size}
                            </span>
                          </div>

                          <span 
                            style={{ 
                              fontSize: '10px', 
                              padding: '1px 6px', 
                              borderRadius: '4px', 
                              background: 'var(--surface-hover)', 
                              border: '1px solid var(--border-divider)',
                              color: 'var(--text-primary)', 
                              fontWeight: 600,
                              fontFamily: 'monospace'
                            }}
                          >
                            {file.versions[0]?.version || 'v1'}
                          </span>
                        </div>

                        {/* File Name */}
                        <div 
                          style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)', 
                            wordBreak: 'break-word',
                            lineHeight: '1.4',
                            marginBottom: '6px'
                          }}
                        >
                          {file.name}
                        </div>

                        {/* Author & Timestamp */}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Bởi {file.author} • {file.updatedAt}
                        </div>
                      </div>

                      {/* Card Quick Actions */}
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end', 
                          gap: '6px', 
                          marginTop: '14px', 
                          paddingTop: '10px', 
                          borderTop: '1px solid var(--border-divider)' 
                        }}
                      >
                        <button
                          type="button"
                          title="Tải tệp về máy"
                          aria-label={`Tải về ${file.name}`}
                          onClick={e => {
                            e.stopPropagation();
                            showNotice(`Đang tải về: ${file.name}`);
                          }}
                          style={{
                            minHeight: '32px',
                            minWidth: '32px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-divider)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Download size={13} aria-hidden="true" />
                          <span>Tải</span>
                        </button>

                        <button
                          type="button"
                          title="Xóa vào thùng rác"
                          aria-label={`Xóa ${file.name} vào thùng rác`}
                          onClick={e => {
                            e.stopPropagation();
                            handleMoveToTrash(file);
                          }}
                          style={{
                            minHeight: '32px',
                            minWidth: '32px',
                            padding: '0 8px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-divider)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'color 140ms ease'
                          }}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div 
                style={{ 
                  background: 'var(--surface-card)', 
                  border: '1px solid var(--border-divider)', 
                  borderRadius: '8px', 
                  overflow: 'hidden' 
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border-divider)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tên tài liệu</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Kích thước</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Phiên bản</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Người cập nhật</th>
                      <th style={{ padding: '12px 14px', fontWeight: 600 }}>Ngày sửa</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map(file => {
                      const isSelected = selectedFileId === file.id;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => setSelectedFileId(file.id)}
                          style={{
                            borderBottom: '1px solid var(--border-divider)',
                            background: isSelected ? 'var(--surface-hover)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 120ms ease'
                          }}
                        >
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {getFormatIcon(file.format, 16)}
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{file.size}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', padding: '2px 6px', background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', borderRadius: '4px' }}>
                              {file.versions[0]?.version || 'v1'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-primary)' }}>{file.author}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{file.updatedAt}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                title="Tải về"
                                aria-label={`Tải về ${file.name}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  showNotice(`Đang tải về: ${file.name}`);
                                }}
                                style={{
                                  minHeight: '30px',
                                  padding: '0 8px',
                                  border: '1px solid var(--border-divider)',
                                  background: 'transparent',
                                  color: 'var(--text-primary)',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Download size={13} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                title="Xóa vào thùng rác"
                                aria-label={`Xóa ${file.name}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleMoveToTrash(file);
                                }}
                                style={{
                                  minHeight: '30px',
                                  padding: '0 8px',
                                  border: '1px solid var(--border-divider)',
                                  background: 'transparent',
                                  color: 'var(--text-secondary)',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={13} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </main>

        {/* VÙNG 3: DRAWER CHI TIẾT & LỊCH SỬ PHIÊN BẢN (340px) */}
        {selectedFile && (
          <aside
            role="complementary"
            aria-label="Thông tin chi tiết và lịch sử phiên bản tệp"
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'sticky',
              top: '16px'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getFormatIcon(selectedFile.format, 22)}
                <div>
                  <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, wordBreak: 'break-word' }}>
                    {selectedFile.name}
                  </h2>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Phiên bản hiện hành: {selectedFile.versions[0]?.version || 'v1'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFileId(null)}
                title="Đóng chi tiết"
                aria-label="Đóng bảng chi tiết"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* File Description */}
            {selectedFile.description && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5', background: 'var(--surface-hover)', padding: '10px 12px', borderRadius: '6px' }}>
                {selectedFile.description}
              </p>
            )}

            {/* Metadata Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-divider)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Kích thước:</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{selectedFile.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mã kiểm tra ETag:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-primary)' }}>{selectedFile.eTag}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Người tải lên:</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedFile.author}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cập nhật lần cuối:</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedFile.updatedAt}</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            {!selectedFile.isTrashed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-divider)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsOverwriteModalOpen(true)}
                  style={{
                    minHeight: '40px',
                    width: '100%',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--text-primary)',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={14} aria-hidden="true" />
                  <span>Ghi đè phiên bản mới</span>
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => showNotice(`Bắt đầu tải về: ${selectedFile.name}`)}
                    style={{
                      minHeight: '38px',
                      flex: 1,
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={13} aria-hidden="true" />
                    <span>Tải về</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showNotice(`Đã sao chép "${selectedFile.name}" sang workspace khác`);
                    }}
                    style={{
                      minHeight: '38px',
                      flex: 1,
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-divider)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={13} aria-hidden="true" />
                    <span>Sao chép</span>
                  </button>
                </div>
              </div>
            )}

            {/* Version History List (QA-05 / LIB-13) */}
            <div style={{ borderTop: '1px solid var(--border-divider)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <History size={14} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
                <h3 style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>
                  Lịch sử phiên bản ({selectedFile.versions.length})
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedFile.versions.map((ver, idx) => (
                  <div
                    key={ver.version}
                    style={{
                      background: idx === 0 ? 'var(--surface-hover)' : 'transparent',
                      border: '1px solid var(--border-divider)',
                      borderRadius: '6px',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>
                          {ver.version}
                        </span>
                        {idx === 0 && (
                          <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: 'var(--text-primary)', color: 'var(--bg-app)', fontWeight: 600 }}>
                            Hiện hành
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {ver.size}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {ver.author} • {ver.updatedAt}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-primary)', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                      {ver.notes}
                    </p>

                    {idx > 0 && !selectedFile.isTrashed && (
                      <button
                        type="button"
                        onClick={() => showNotice(`Đã khôi phục phiên bản ${ver.version}`)}
                        style={{
                          alignSelf: 'flex-start',
                          marginTop: '4px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 0',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'underline'
                        }}
                      >
                        <RotateCcw size={11} aria-hidden="true" />
                        <span>Khôi phục bản này</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* MODAL 1: LƯU NHANH (CUXB-03 / LIB-01) */}
      {isQuickSaveOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="quick-save-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 id="quick-save-title" style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                Lưu nhanh vào Thư viện
              </h2>
              <button
                type="button"
                onClick={() => setIsQuickSaveOpen(false)}
                title="Đóng modal"
                aria-label="Đóng hộp thoại"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* 3 Categories: Text / Link / File */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'file', label: 'Tệp tải lên', icon: FileText },
                { id: 'link', label: 'Đường dẫn liên kết', icon: Link2 },
                { id: 'note', label: 'Ghi chú văn bản', icon: FileCode }
              ].map(cat => {
                const IconComponent = cat.icon;
                const isSelected = quickSaveType === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setQuickSaveType(cat.id as any)}
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-divider)',
                      background: isSelected ? 'var(--surface-hover)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComponent size={16} aria-hidden="true" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleQuickSaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {quickSaveType === 'link' ? 'Địa chỉ URL' : 'Tên tài liệu / Tiêu đề'}
                </label>
                <input
                  type="text"
                  required
                  value={quickSaveTitle}
                  onChange={e => setQuickSaveTitle(e.target.value)}
                  placeholder={
                    quickSaveType === 'link'
                      ? 'example.com/tai-lieu (tự thêm https://)'
                      : 'Nhập tên tài liệu...'
                  }
                  style={{
                    width: '100%',
                    minHeight: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {quickSaveType === 'note' ? 'Nội dung ghi chú' : 'Mô tả hoặc lưu ý tùy chọn'}
                </label>
                <textarea
                  rows={3}
                  value={quickSaveContent}
                  onChange={e => setQuickSaveContent(e.target.value)}
                  placeholder="Ghi chú thêm thông tin cho mục này..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Lưu vào Thư mục
                </label>
                <select
                  value={quickSaveTargetFolder}
                  onChange={e => setQuickSaveTargetFolder(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '38px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'var(--surface-hover)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsQuickSaveOpen(false)}
                  style={{
                    minHeight: '38px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    minHeight: '38px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--text-primary)',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Lưu tài liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GHI ĐÈ PHIÊN BẢN HOẶC TẠO BẢN SAO (CUXB-08 / LIB-13) */}
      {isOverwriteModalOpen && selectedFile && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="overwrite-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <h2 id="overwrite-modal-title" style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 6px 0' }}>
                Cập nhật tệp tin đã tồn tại
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Bạn đang thực hiện thao tác cập nhật cho tệp <strong>"{selectedFile.name}"</strong>. Vui lòng chọn cơ chế xử lý:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Option 1: Overwrite with version snapshot */}
              <button
                type="button"
                onClick={() => handleConfirmOverwrite(true)}
                style={{
                  minHeight: '44px',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--text-primary)',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <Layers size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Ghi đè mục này (Lưu phiên bản v{selectedFile.versions.length + 1})</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Giữ nguyên đường dẫn tệp, tăng số phiên bản và lưu vết bản cũ để khôi phục khi cần.
                  </div>
                </div>
              </button>

              {/* Option 2: Create new independent copy */}
              <button
                type="button"
                onClick={() => handleConfirmOverwrite(false)}
                style={{
                  minHeight: '44px',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <Copy size={18} style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Tạo bản sao mới</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Tạo một mục tệp độc lập hoàn toàn, không ghi đè và không gắn chung lịch sử.
                  </div>
                </div>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsOverwriteModalOpen(false)}
                style={{
                  minHeight: '38px',
                  padding: '0 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TẠO THƯ MỤC MỚI */}
      {isNewFolderModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="new-folder-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-divider)',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <h2 id="new-folder-title" style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
              Tạo thư mục mới
            </h2>

            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                required
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Ví dụ: Tài liệu Đồ án cuối kỳ"
                style={{
                  width: '100%',
                  minHeight: '38px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-divider)',
                  background: 'var(--surface-hover)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewFolderModalOpen(false)}
                  style={{
                    minHeight: '38px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-divider)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    minHeight: '38px',
                    padding: '0 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--text-primary)',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-app)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tạo thư mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
