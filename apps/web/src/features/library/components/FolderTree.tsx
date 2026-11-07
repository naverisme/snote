import React, { useState } from 'react';
import type { Folder } from '../types';

export interface FolderTreeProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string, etag: string) => Promise<void>;
  onDeleteFolder: (folderId: string, etag: string) => Promise<void>;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(undefined);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      setErrorMessage(null);
      await onCreateFolder(newFolderName.trim(), parentFolderId);
      setNewFolderName('');
      setIsCreating(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tạo thư mục');
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !renameValue.trim()) return;
    try {
      setErrorMessage(null);
      await onRenameFolder(editingFolder.id, renameValue.trim(), `"${editingFolder.version}"`);
      setEditingFolder(null);
      setRenameValue('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể đổi tên thư mục');
    }
  };

  const handleDelete = async (folder: Folder) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thư mục "${folder.name}"?`)) return;
    try {
      setErrorMessage(null);
      await onDeleteFolder(folder.id, `"${folder.version}"`);
      if (selectedFolderId === folder.id) {
        onSelectFolder(null);
      }
    } catch (err: any) {
      // LIB-07 explanation
      if (err.code === 'FOLDER_NOT_EMPTY') {
        setErrorMessage(
          `Không thể xóa thư mục "${folder.name}": Thư mục đang chứa mục hoặc thư mục con. Theo quy tắc LIB-07, bạn phải chuyển các mục ra ngoài hoặc xóa thư mục con trước!`,
        );
      } else {
        setErrorMessage(err.message || 'Không thể xóa thư mục');
      }
    }
  };

  return (
    <aside className="folder-tree w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-3" aria-label="Danh mục thư mục">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Thư mục</h2>
        <button
          type="button"
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => {
            setIsCreating(true);
            setParentFolderId(selectedFolderId ?? undefined);
          }}
          title="Tạo thư mục mới"
        >
          + Thêm
        </button>
      </div>

      {errorMessage && (
        <div className="p-2 text-xs bg-red-100 border border-red-300 text-red-800 rounded" role="alert">
          {errorMessage}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 bg-white border border-blue-300 rounded shadow-sm flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">Tên thư mục mới</label>
          <input
            type="text"
            className="text-sm p-1.5 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            placeholder="Ví dụ: Tài liệu môn học"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-1 text-xs">
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => setIsCreating(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Lưu
            </button>
          </div>
        </form>
      )}

      {editingFolder && (
        <form onSubmit={handleRenameSubmit} className="p-2 bg-white border border-amber-300 rounded shadow-sm flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">Đổi tên thư mục</label>
          <input
            type="text"
            className="text-sm p-1.5 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-1 text-xs">
            <button
              type="button"
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
              onClick={() => setEditingFolder(null)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 font-medium"
            >
              Đổi
            </button>
          </div>
        </form>
      )}

      <nav className="folder-list flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-260px)]">
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${
            selectedFolderId === null
              ? 'bg-blue-100 text-blue-800 font-semibold'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <span aria-hidden="true">📁</span>
          <span>Tất cả tài liệu</span>
        </button>

        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          return (
            <div
              key={folder.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-100 text-blue-800 font-semibold'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <button
                type="button"
                className="flex items-center gap-2 flex-grow text-left truncate mr-2"
                onClick={() => onSelectFolder(folder.id)}
              >
                <span aria-hidden="true">{folder.parentId ? '↳ 📁' : '📂'}</span>
                <span className="truncate">{folder.name}</span>
              </button>

              <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1">
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-blue-600 p-1"
                  title="Đổi tên"
                  onClick={() => {
                    setEditingFolder(folder);
                    setRenameValue(folder.name);
                  }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-red-600 p-1"
                  title="Xóa thư mục"
                  onClick={() => handleDelete(folder)}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
