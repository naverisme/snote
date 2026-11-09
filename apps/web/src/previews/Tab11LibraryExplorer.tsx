import React, { useState } from 'react';
import { Folder, FolderPlus, FileText, Upload, Trash2, HardDrive, MoreVertical, Search, Check, Download } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  folderId: string;
  updatedAt: string;
  author: string;
}

const FOLDERS = [
  { id: 'f-root', name: 'Tất cả tài liệu' },
  { id: 'f-spec', name: 'Đặc tả kỹ thuật (Specs)' },
  { id: 'f-slides', name: 'Slide thuyết trình' },
  { id: 'f-code', name: 'Tài liệu API & Schemas' },
];

const INITIAL_FILES: FileItem[] = [
  { id: 'file-1', name: 'SNOTE_v2_Architecture_Manifest.pdf', size: '2.4 MB', folderId: 'f-spec', updatedAt: '08/11/2026', author: 'Lê Hoàng Nam' },
  { id: 'file-2', name: 'OpenAPI_Contracts_v3.json', size: '480 KB', folderId: 'f-code', updatedAt: '07/11/2026', author: 'Trần Thị Mai' },
  { id: 'file-3', name: 'Slide_Bao_Cao_Giua_Ky.pptx', size: '8.1 MB', folderId: 'f-slides', updatedAt: '06/11/2026', author: 'Nguyễn Văn Minh' },
  { id: 'file-4', name: 'Design_System_Monochrome_Tokens.css', size: '56 KB', folderId: 'f-spec', updatedAt: '05/11/2026', author: 'Phạm Quỳnh Anh' },
];

export const Tab11LibraryExplorer: React.FC = () => {
  const [activeFolderId, setActiveFolderId] = useState('f-root');
  const [files, setFiles] = useState(INITIAL_FILES);
  const [isTrashView, setIsTrashView] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const currentFiles = files.filter(f => activeFolderId === 'f-root' || f.folderId === activeFolderId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {notice && (
        <div style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-divider)', padding: '10px 16px', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Top Toolbar */}
      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {isTrashView ? 'Thùng rác tài liệu (Trash)' : 'Thư viện & Kho tài liệu chung'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-sm ${isTrashView ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setIsTrashView(!isTrashView)}
          >
            <Trash2 size={14} style={{ marginRight: '6px' }} />
            <span>{isTrashView ? 'Về thư mục chính' : 'Thùng rác'}</span>
          </button>
          {!isTrashView && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => showNotice('Mở hộp thoại tải lên tài liệu mới')}
            >
              <Upload size={14} style={{ marginRight: '6px' }} />
              <span>Tải file lên</span>
            </button>
          )}
        </div>
      </div>

      {/* Explorer Layout: Sidebar Folders 240px + File Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px' }}>
        {/* Left Folder Tree & Quota */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '14px 12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, padding: '0 8px 8px' }}>Thư mục</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {FOLDERS.map(folder => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => { setActiveFolderId(folder.id); setIsTrashView(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: activeFolderId === folder.id && !isTrashView ? 'var(--surface-hover)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: activeFolderId === folder.id ? 600 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Folder size={15} style={{ color: 'var(--text-primary)' }} />
                  <span>{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quota Bar Card */}
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HardDrive size={16} style={{ color: 'var(--text-primary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Dung lượng Workspace</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Đã dùng <strong>11.0 MB</strong> / 500 MB (2.2%)
            </div>
            <div style={{ width: '100%', height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '2.2%', height: '100%', background: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        {/* Right Files Grid */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-divider)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {currentFiles.map(file => (
              <div
                key={file.id}
                style={{
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border-divider)',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '130px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <FileText size={18} style={{ color: 'var(--text-primary)' }} />
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{file.size}</div>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word', marginBottom: '6px' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Bởi: {file.author} • {file.updatedAt}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-divider)' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => showNotice(`Bắt đầu tải về ${file.name}`)}
                  >
                    <Download size={12} style={{ marginRight: '4px' }} />
                    <span>Tải về</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '3px 8px', fontSize: '11px', color: 'rgba(248, 113, 113, 0.9)' }}
                    onClick={() => {
                      setFiles(files.filter(f => f.id !== file.id));
                      showNotice(`Đã chuyển ${file.name} vào thùng rác`);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
