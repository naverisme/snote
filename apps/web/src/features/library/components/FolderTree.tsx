import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, CornerDownRight, Pencil, Trash2, AlertCircle } from 'lucide-react';
import type { Folder as FolderType, ItemDetail } from '../types';

export interface FolderTreeProps {
  folders: FolderType[];
  items?: ItemDetail[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string, etag: string) => Promise<void>;
  onDeleteFolder: (folderId: string, etag: string) => Promise<void>;
}

/**
 * CUXB-01 Column 1 & CUXB-05/06: Folder tree with:
 * - Create, rename, delete actions
 * - Pre-check and strict validation for empty folder before deletion (CUXB-06 / LIB-07)
 * - Stageshow aesthetics with 5-tier ink, insets >= 12px, nested radius
 */
export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  items = [],
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(undefined);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
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

  const handleDelete = async (folder: FolderType) => {
    setErrorMessage(null);

    // CUXB-06 / LIB-07: Client-side pre-validation
    const childFolders = folders.filter((f) => f.parentId === folder.id);
    const folderItems = items.filter((it) => it.folderId === folder.id);

    if (childFolders.length > 0 || folderItems.length > 0) {
      const reason =
        childFolders.length > 0 && folderItems.length > 0
          ? `${folderItems.length} mục và ${childFolders.length} thư mục con`
          : childFolders.length > 0
            ? `${childFolders.length} thư mục con`
            : `${folderItems.length} mục tài liệu`;
      setErrorMessage(
        `Không thể xóa thư mục "${folder.name}": Thư mục đang chứa ${reason}. Theo quy tắc CUXB-06 (LIB-07), bạn phải chuyển các mục ra ngoài hoặc xóa thư mục con trước!`,
      );
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa thư mục rỗng "${folder.name}"?`)) return;

    try {
      await onDeleteFolder(folder.id, `"${folder.version}"`);
      if (selectedFolderId === folder.id) {
        onSelectFolder(null);
      }
    } catch (err: any) {
      if (err.code === 'FOLDER_NOT_EMPTY') {
        setErrorMessage(
          `Không thể xóa thư mục "${folder.name}": Thư mục không rỗng. Theo quy tắc CUXB-06 (LIB-07), vui lòng dọn sạch các mục hoặc thư mục con trước!`,
        );
      } else {
        setErrorMessage(err.message || 'Không thể xóa thư mục');
      }
    }
  };

  return (
    <aside
      className="folder-tree w-64 flex-shrink-0 bg-[var(--surface-ground)] border-r border-[var(--hairline)] p-3.5 flex flex-col gap-3"
      aria-label="Danh mục thư mục"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-[var(--hairline)]">
        <h2 className="font-semibold text-[var(--ink-title)] text-xs uppercase tracking-wider">
          Thư mục
        </h2>
        <button
          type="button"
          className="text-xs bg-[var(--accent)] hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center gap-1 font-medium transition-all active:scale-95"
          onClick={() => {
            setIsCreating(true);
            setParentFolderId(selectedFolderId ?? undefined);
          }}
          title="Tạo thư mục mới (CUXB-05)"
        >
          <Plus size={13} />
          <span>Thêm</span>
        </button>
      </div>

      {errorMessage && (
        <div
          className="p-3 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-1.5"
          role="alert"
        >
          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Create Folder Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-3 bg-white border border-blue-300 rounded-xl shadow-sm flex flex-col gap-2.5 animate-in fade-in duration-150"
        >
          <label className="text-xs font-semibold text-[var(--ink-title)]">
            Tên thư mục mới
          </label>
          <input
            type="text"
            className="text-xs p-2 border border-[var(--hairline)] rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Ví dụ: Đề cương môn học"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-1.5 text-xs pt-1">
            <button
              type="button"
              className="px-2.5 py-1 text-[var(--ink-subtle)] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsCreating(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors"
            >
              Lưu
            </button>
          </div>
        </form>
      )}

      {/* Rename Folder Form */}
      {editingFolder && (
        <form
          onSubmit={handleRenameSubmit}
          className="p-3 bg-white border border-amber-300 rounded-xl shadow-sm flex flex-col gap-2.5 animate-in fade-in duration-150"
        >
          <label className="text-xs font-semibold text-[var(--ink-title)]">
            Đổi tên thư mục
          </label>
          <input
            type="text"
            className="text-xs p-2 border border-[var(--hairline)] rounded-lg focus:border-amber-500 focus:outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-1.5 text-xs pt-1">
            <button
              type="button"
              className="px-2.5 py-1 text-[var(--ink-subtle)] hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setEditingFolder(null)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium shadow-sm transition-colors"
            >
              Đổi
            </button>
          </div>
        </form>
      )}

      {/* Folder Navigation List */}
      <nav className="folder-list flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-270px)]">
        {/* All documents root item */}
        <button
          type="button"
          className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-left transition-colors font-medium ${
            selectedFolderId === null
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-[var(--ink-body)] hover:bg-black/[0.04]'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          {selectedFolderId === null ? (
            <FolderOpen size={15} className="text-[var(--accent)] flex-shrink-0" aria-hidden="true" />
          ) : (
            <Folder size={15} className="text-[var(--ink-muted)] flex-shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">Tất cả tài liệu</span>
        </button>

        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          return (
            <div
              key={folder.id}
              className={`group flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors font-medium ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-[var(--ink-body)] hover:bg-black/[0.04]'
              }`}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 flex-grow text-left truncate mr-1.5"
                onClick={() => onSelectFolder(folder.id)}
              >
                <span className="inline-flex items-center gap-1 text-[var(--ink-muted)] flex-shrink-0" aria-hidden="true">
                  {folder.parentId ? (
                    <>
                      <CornerDownRight size={12} className="opacity-60" />
                      {isSelected ? (
                        <FolderOpen size={14} className="text-amber-500" />
                      ) : (
                        <Folder size={14} className="text-amber-500" />
                      )}
                    </>
                  ) : isSelected ? (
                    <FolderOpen size={15} className="text-amber-500" />
                  ) : (
                    <Folder size={15} className="text-amber-500" />
                  )}
                </span>
                <span className="truncate">{folder.name}</span>
              </button>

              <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-0.5">
                <button
                  type="button"
                  className="text-[var(--ink-muted)] hover:text-blue-600 p-1 rounded-md transition-colors"
                  title="Đổi tên (CUXB-05)"
                  onClick={() => {
                    setEditingFolder(folder);
                    setRenameValue(folder.name);
                  }}
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  className="text-[var(--ink-muted)] hover:text-red-600 p-1 rounded-md transition-colors"
                  title="Xóa thư mục rỗng (CUXB-06)"
                  onClick={() => handleDelete(folder)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
