import React, { useCallback, useEffect, useState } from 'react';
import '../library-utilities.css';
import {
  BookOpen,
  Inbox,
  FileText,
  Trash2,
  Plus,
  Download,
  FolderOpen,
  Search,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { libraryApi } from '../api';
import type { Folder, ItemDetail, QuotaInfo } from '../types';
import { CopyItemModal } from './CopyItemModal';
import { CreateItemModal } from './CreateItemModal';
import { EditFileModal } from './EditFileModal';
import { FolderTree } from './FolderTree';
import { ItemCard } from './ItemCard';
import { ItemDetailPanel } from './ItemDetailPanel';
import { LibraryEmptyState } from './LibraryEmptyState';
import { QuickSaveModal } from './QuickSaveModal';
import { QuotaBar } from './QuotaBar';
import { RevisionHistoryModal } from './RevisionHistoryModal';
import { TrashView } from './TrashView';
import { UploadProgressCard, type UploadProgressData, type UploadState } from './UploadProgressCard';

export interface LibraryViewProps {
  workspaceId: string;
  isPersonalWorkspace?: boolean;
  csrfToken?: string;
  actorId?: string;
}

export type MainTab = 'documents' | 'inbox' | 'trash';

interface ActiveUploadState {
  file: File;
  title: string;
  folderId: string | null;
  state: UploadState;
  progress: UploadProgressData;
  errorMessage?: string | null;
}

/**
 * CUXB-01 3-Column Library Main View:
 * - Column 1: Folder Tree (CUXB-01 Left, CUXB-05/06)
 * - Column 2: Item List (CUXB-01 Center, CUXB-04 Search, CUXB-09 Upload Progress, Recipe 2 Miniature Empty State)
 * - Column 3: Item Detail (CUXB-01 Right, CUXB-07 Markdown lists, CUXB-08 File Edit Overwrite vs Copy)
 * - Responsive mobile mode (CUXB-02)
 * - Stageshow aesthetics: 5-tier ink, insets >= 12px, nested radiuses, zero emoji.
 */
export const LibraryView: React.FC<LibraryViewProps> = ({
  workspaceId,
  isPersonalWorkspace = false,
  csrfToken,
  actorId,
}) => {
  const [currentTab, setCurrentTab] = useState<MainTab>('documents');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [trashItems, setTrashItems] = useState<ItemDetail[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quotaError, setQuotaError] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mobile column navigation state (CUXB-02: folders -> list -> detail)
  const [mobileView, setMobileView] = useState<'folders' | 'list' | 'detail'>('list');

  // Real-time upload progress state (CUXB-09)
  const [activeUpload, setActiveUpload] = useState<ActiveUploadState | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
  const [selectedItemForRevisions, setSelectedItemForRevisions] = useState<ItemDetail | null>(null);
  const [selectedItemForCopy, setSelectedItemForCopy] = useState<ItemDetail | null>(null);
  const [selectedItemForEditFile, setSelectedItemForEditFile] = useState<ItemDetail | null>(null);

  const reqOpts = { csrfToken, actorId };

  // Load workspace data
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    setQuotaError(false);
    try {
      // 1. Quota (Requirement 1: Never assume 1 GiB on error)
      try {
        const quotaData = await libraryApi.getWorkspaceQuota(workspaceId, reqOpts);
        setQuota(quotaData);
        setQuotaError(false);
      } catch {
        setQuota(null);
        setQuotaError(true);
      }

      // 2. Folders
      const folderList = await libraryApi.listFolders(workspaceId, reqOpts);
      setFolders(folderList);

      // 3. Active items
      const activeRaw = await libraryApi.listItems(
        workspaceId,
        { folderId: selectedFolderId, status: 'active' },
        reqOpts,
      );

      // Hydrate items with details
      const detailedItems = await Promise.all(
        activeRaw.map(async (it) => {
          try {
            const d = await libraryApi.getItem(it.id, reqOpts);
            return d.item;
          } catch {
            return it as ItemDetail;
          }
        }),
      );
      setItems(detailedItems);

      // Keep selected item synced
      if (selectedItemId) {
        const found = detailedItems.find((i) => i.id === selectedItemId);
        if (!found && detailedItems.length > 0) {
          setSelectedItemId(detailedItems[0].id);
        }
      } else if (detailedItems.length > 0) {
        setSelectedItemId(detailedItems[0].id);
      }

      // 4. Trash items
      const trashRaw = await libraryApi.listItems(workspaceId, { status: 'trash' }, reqOpts);
      const detailedTrash = await Promise.all(
        trashRaw.map(async (it) => {
          try {
            const d = await libraryApi.getItem(it.id, reqOpts);
            return d.item;
          } catch {
            return it as ItemDetail;
          }
        }),
      );
      setTrashItems(detailedTrash);
    } catch (err) {
      console.error('Failed to load library data', err);
      setFolders([]);
      setItems([]);
      setTrashItems([]);
      setQuota(null);
      setSelectedItemId(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, selectedFolderId, csrfToken, actorId, selectedItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selected item reference for Column 3
  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  // Actions
  const handleCreateText = async (title: string, content: string, folderId: string | null) => {
    const res = await libraryApi.createItem(
      workspaceId,
      {
        type: 'text',
        title: title || undefined,
        content,
        folderId: folderId || undefined,
      },
      reqOpts,
    );
    await loadData();
    setSelectedItemId(res.item.id);
    setMobileView('detail');
  };

  const handleCreateLink = async (title: string, url: string, folderId: string | null) => {
    const res = await libraryApi.createItem(
      workspaceId,
      {
        type: 'link',
        title: title || undefined,
        url,
        folderId: folderId || undefined,
      },
      reqOpts,
    );
    await loadData();
    setSelectedItemId(res.item.id);
    setMobileView('detail');
  };

  // CUXB-09 Real-time byte upload flow
  const executeUploadWithProgress = async (file: File, title: string, folderId: string | null) => {
    setActiveUpload({
      file,
      title: title || file.name,
      folderId,
      state: 'uploading',
      progress: { loadedBytes: 0, totalBytes: file.size, percent: 0 },
      errorMessage: null,
    });

    try {
      // Step 1: Start upload
      const startRes = await libraryApi.startUpload(
        {
          fileName: file.name,
          size: file.size,
          declaredType: file.type || 'application/octet-stream',
          scopeType: 'workspace',
          scopeId: workspaceId,
        },
        reqOpts,
      );

      // Step 2: Binary transfer with real-time byte progress
      await libraryApi.uploadContentWithProgress(
        startRes.id,
        file,
        (prog) => {
          setActiveUpload((prev) =>
            prev ? { ...prev, progress: prog, state: 'uploading' } : null,
          );
        },
        reqOpts,
      );

      // Step 3: Commit library item metadata
      setActiveUpload((prev) => (prev ? { ...prev, state: 'saving' } : null));
      const newItem = await libraryApi.createItem(
        workspaceId,
        {
          type: 'file',
          title: title || file.name,
          uploadId: startRes.id,
          folderId: folderId || undefined,
        },
        reqOpts,
      );

      // Step 4: Full success -> show centered green checkmark (CUXB-09)
      setActiveUpload((prev) =>
        prev
          ? {
              ...prev,
              state: 'completed',
              progress: { loadedBytes: file.size, totalBytes: file.size, percent: 100 },
            }
          : null,
      );

      // Wait 1.3s for user to perceive green checkmark before clearing slot
      setTimeout(async () => {
        setActiveUpload(null);
        await loadData();
        setSelectedItemId(newItem.item.id);
        setMobileView('detail');
      }, 1300);
    } catch (err: any) {
      console.error('Upload failed', err);
      // CUXB-09: On error, show error and Retry button, NEVER show checkmark or completed item
      setActiveUpload((prev) =>
        prev
          ? {
              ...prev,
              state: 'error',
              errorMessage:
                err.message || 'Lỗi khi tải lên tệp. Dữ liệu dở dang đã được dọn sạch.',
            }
          : null,
      );
    }
  };

  const handleQuickSave = async (type: 'text' | 'link', title: string, contentOrUrl: string) => {
    if (type === 'text') {
      await libraryApi.quickSaveToInbox(
        {
          type: 'text',
          title: title || undefined,
          content: contentOrUrl,
        },
        reqOpts,
      );
    } else {
      await libraryApi.quickSaveToInbox(
        {
          type: 'link',
          title: title || undefined,
          url: contentOrUrl,
        },
        reqOpts,
      );
    }
    await loadData();
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    await libraryApi.createFolder(
      workspaceId,
      {
        name,
        parentId,
      },
      reqOpts,
    );
    await loadData();
  };

  const handleRenameFolder = async (folderId: string, newName: string, etag: string) => {
    await libraryApi.updateFolder(
      folderId,
      {
        name: newName,
      },
      { ...reqOpts, etag },
    );
    await loadData();
  };

  const handleDeleteFolder = async (folderId: string, etag: string) => {
    await libraryApi.deleteFolder(folderId, { ...reqOpts, etag });
    await loadData();
  };

  const handleMoveFolder = async (item: ItemDetail, folderId: string | null) => {
    await libraryApi.updateItem(
      item.id,
      { folderId: folderId ?? undefined },
      { ...reqOpts, etag: `"${item.version}"` },
    );
    await loadData();
  };

  const handleTrashItem = async (item: ItemDetail) => {
    if (!window.confirm(`Chuyển tài liệu "${item.title || item.type}" vào Thùng rác (lưu 30 ngày)?`)) return;
    await libraryApi.trashItem(item.id, { ...reqOpts, etag: `"${item.version}"` });
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    }
    await loadData();
  };

  const handleRestoreItem = async (item: ItemDetail) => {
    await libraryApi.restoreItem(item.id, { ...reqOpts, etag: `"${item.version}"` });
    await loadData();
  };

  const handleCopyItem = async (itemId: string, targetWorkspaceId: string, folderId?: string) => {
    const item = items.find((i) => i.id === itemId) || trashItems.find((i) => i.id === itemId);
    if (!item?.currentRevisionId) return;
    await libraryApi.copyItem(
      itemId,
      {
        targetWorkspaceId,
        sourceRevisionId: item.currentRevisionId,
        folderId,
      },
      reqOpts,
    );
    alert('Đã sao chép tài liệu sang workspace đích thành công!');
  };

  const handleOverwriteRevision = async (itemId: string, etag: string, input: any) => {
    await libraryApi.createRevision(itemId, input, { ...reqOpts, etag });
    await loadData();
  };

  // CUXB-08: File Overwrite action
  const handleOverwriteUploadedFile = async (file: File) => {
    if (!selectedItemForEditFile) return;
    const item = selectedItemForEditFile;

    // 1. Upload staging
    const startRes = await libraryApi.startUpload(
      {
        fileName: file.name,
        size: file.size,
        declaredType: file.type || 'application/octet-stream',
        scopeType: 'workspace',
        scopeId: workspaceId,
      },
      reqOpts,
    );

    // 2. Put binary
    await libraryApi.uploadContent(startRes.id, file, reqOpts);

    // 3. Create new revision (LIB-13)
    await libraryApi.createRevision(
      item.id,
      {
        type: 'file',
        title: file.name,
        uploadId: startRes.id,
      },
      { ...reqOpts, etag: `"${item.version}"` },
    );

    await loadData();
    setSelectedItemId(item.id);
  };

  // CUXB-08: File Copy As New action
  const handleCopyAsNewUploadedFile = async (file: File, folderId: string | null) => {
    await executeUploadWithProgress(file, file.name, folderId);
  };

  const handleDownload = async (item: ItemDetail) => {
    try {
      const download = await libraryApi.getDownload(item.id, reqOpts);
      window.open(download.url, '_blank');
    } catch (err: any) {
      alert(`Không thể tải xuống: ${err.message || 'Lỗi quyền truy cập'}`);
    }
  };

  const filteredItems = items.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = it.title?.toLowerCase().includes(q);
    const textMatch = it.revision?.text?.toLowerCase().includes(q);
    const urlMatch = it.revision?.url?.toLowerCase().includes(q);
    return titleMatch || textMatch || urlMatch;
  });

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <main className="library-feature flex flex-col h-full bg-[var(--surface-ground)] min-h-screen text-[var(--ink-body)] font-sans">
      {/* Top Header */}
      <header className="bg-[var(--surface-raised)] border-b border-[var(--hairline)] px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-[var(--ink-title)] flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            <span>Thư viện tài liệu</span>
            {isPersonalWorkspace && (
              <span className="text-xs bg-[var(--surface-ground)] text-[var(--ink-subtle)] px-2.5 py-0.5 rounded-md font-medium border border-[var(--hairline)]">
                Workspace cá nhân
              </span>
            )}
          </h1>
          <p className="text-xs text-[var(--ink-subtle)] mt-0.5">
            Quản lý văn bản, liên kết tham khảo, tệp đính kèm và thùng rác 30 ngày
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick save button (LIB-02) */}
          <button
            type="button"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            onClick={() => setIsQuickSaveOpen(true)}
            title="Lưu nhanh vào Hộp thu cá nhân (LIB-02)"
          >
            <Download size={14} />
            <span>Lưu nhanh</span>
          </button>

          {/* Add item button */}
          <button
            type="button"
            className="px-4 py-2 bg-[var(--accent)] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={14} />
            <span>Thêm tài liệu</span>
          </button>
        </div>
      </header>

      {/* Quota Bar Banner (Requirement 1: No 1 GiB assumption on error) */}
      <div className="px-6 py-2.5 bg-[var(--surface-ground)] border-b border-[var(--hairline)]">
        <QuotaBar
          quota={quota}
          loading={loading}
          error={quotaError}
          onRetry={() => void loadData()}
        />
      </div>

      {loadError && (
        <div
          role="alert"
          className="mx-6 mt-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs flex items-center justify-between gap-3 shadow-sm"
        >
          <span>Không thể tải tài liệu trong workspace này.</span>
          <button
            type="button"
            onClick={() => void loadData()}
            className="border border-red-300 rounded-lg px-3 py-1 font-semibold hover:bg-red-100 transition-colors inline-flex items-center gap-1"
          >
            <RefreshCw size={12} />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-[var(--surface-raised)] border-b border-[var(--hairline)] px-6 flex justify-between items-center">
        <nav className="flex gap-6" aria-label="Tabs Thư viện">
          <button
            type="button"
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'documents'
                ? 'border-[var(--accent)] text-blue-600'
                : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
            }`}
            onClick={() => {
              setCurrentTab('documents');
              setMobileView('list');
            }}
          >
            <FileText size={14} />
            <span>Tài liệu</span>
            <span className="text-[11px] bg-[var(--surface-ground)] text-[var(--ink-subtle)] px-2 py-0.5 rounded-full border border-[var(--hairline)]">
              {items.length}
            </span>
          </button>

          {isPersonalWorkspace && (
            <button
              type="button"
              className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                currentTab === 'inbox'
                  ? 'border-[var(--accent)] text-blue-600'
                  : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
              }`}
              onClick={() => {
                setCurrentTab('inbox');
                setSelectedFolderId(null);
                setMobileView('list');
              }}
            >
              <Inbox size={14} />
              <span>Hộp thu (Inbox)</span>
            </button>
          )}

          <button
            type="button"
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'trash'
                ? 'border-[var(--accent)] text-blue-600'
                : 'border-transparent text-[var(--ink-subtle)] hover:text-[var(--ink-title)]'
            }`}
            onClick={() => {
              setCurrentTab('trash');
              setMobileView('list');
            }}
          >
            <Trash2 size={14} />
            <span>Thùng rác</span>
            {trashItems.length > 0 && (
              <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
                {trashItems.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Main 3-Column Content Area (CUXB-01) */}
      <div className="flex-1 flex overflow-hidden">
        {currentTab === 'documents' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Cột 1: Cây thư mục (CUXB-01 Bên trái, CUXB-05/06) */}
            <div
              className={`w-full md:w-64 flex-shrink-0 h-full overflow-y-auto ${
                mobileView === 'folders' ? 'block' : 'hidden md:block'
              }`}
            >
              <FolderTree
                folders={folders}
                items={items}
                selectedFolderId={selectedFolderId}
                onSelectFolder={(id) => {
                  setSelectedFolderId(id);
                  setMobileView('list');
                }}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            </div>

            {/* Cột 2: Danh sách mục (CUXB-01 Ở giữa, CUXB-04 Tìm kiếm, CUXB-09 Upload, Recipe 2 Empty State) */}
            <section
              className={`w-full md:flex-1 min-w-0 border-r border-[var(--hairline)] bg-[var(--surface-ground)]/40 flex flex-col h-full overflow-hidden ${
                mobileView === 'list' ? 'flex' : 'hidden md:flex'
              }`}
              aria-label="Danh sách tài liệu"
            >
              {/* Header: Search and Filter Info */}
              <div className="p-3.5 bg-[var(--surface-raised)] border-b border-[var(--hairline)] flex flex-col gap-2.5">
                {/* Mobile folder back button */}
                <div className="flex items-center justify-between md:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileView('folders')}
                    className="inline-flex items-center gap-1 text-xs text-[var(--ink-subtle)] font-medium hover:text-[var(--ink-title)]"
                  >
                    <ArrowLeft size={13} />
                    <span>Xem danh mục thư mục</span>
                  </button>
                  <span className="text-xs font-semibold text-[var(--ink-title)]">
                    {selectedFolder ? selectedFolder.name : 'Tất cả tài liệu'}
                  </span>
                </div>

                {/* Search Bar (CUXB-04) */}
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
                  />
                  <input
                    type="search"
                    placeholder="Tìm theo tiêu đề, URL, ghi chú..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[var(--hairline)] rounded-lg focus:outline-none focus:border-blue-500 text-[var(--ink-body)] placeholder:text-[var(--ink-faint)] transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[var(--ink-subtle)] px-0.5">
                  <span className="truncate max-w-[200px]">
                    {selectedFolder ? `Thư mục: ${selectedFolder.name}` : 'Tất cả tài liệu'}
                  </span>
                  <span>{filteredItems.length} mục</span>
                </div>
              </div>

              {/* Real-time upload slot/card (CUXB-09) */}
              {activeUpload && (
                <div className="p-3.5 pb-0">
                  <UploadProgressCard
                    fileName={activeUpload.file.name}
                    fileSize={activeUpload.file.size}
                    state={activeUpload.state}
                    progress={activeUpload.progress}
                    errorMessage={activeUpload.errorMessage}
                    onRetry={() =>
                      executeUploadWithProgress(
                        activeUpload.file,
                        activeUpload.title,
                        activeUpload.folderId,
                      )
                    }
                    onCancel={() => setActiveUpload(null)}
                  />
                </div>
              )}

              {/* Items List Content */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="h-28 bg-[var(--surface-raised)] border border-[var(--hairline)] rounded-xl"
                      />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  // Requirement 4: Recipe 2 Miniature Showcase for Empty State
                  <LibraryEmptyState
                    folderName={selectedFolder?.name}
                    onAction={() => setIsCreateOpen(true)}
                  />
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3" role="list">
                    {filteredItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        folders={folders}
                        isSelected={selectedItemId === item.id}
                        onSelect={(it) => {
                          setSelectedItemId(it.id);
                          setMobileView('detail');
                        }}
                        onOpenRevisions={(it) => setSelectedItemForRevisions(it)}
                        onOpenCopy={(it) => setSelectedItemForCopy(it)}
                        onMoveFolder={handleMoveFolder}
                        onTrash={handleTrashItem}
                        onDownload={item.type === 'file' ? handleDownload : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Cột 3: Chi tiết mục đã chọn (CUXB-01 Bên phải, CUXB-07 Markdown, CUXB-08 Sửa tệp) */}
            <section
              className={`w-full md:w-[340px] md:flex-shrink-0 h-full overflow-hidden bg-[var(--surface-raised)] ${
                mobileView === 'detail' ? 'block' : selectedItem ? 'hidden md:block' : 'hidden'
              }`}
              aria-label="Chi tiết tài liệu đã chọn"
            >
              {/* Mobile Back Button to Item List */}
              <div className="p-3 border-b border-[var(--hairline)] flex items-center md:hidden bg-[var(--surface-ground)]/30">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-title)] hover:text-blue-600"
                >
                  <ArrowLeft size={14} />
                  <span>Quay lại danh sách</span>
                </button>
              </div>

              <ItemDetailPanel
                item={selectedItem}
                folders={folders}
                onClose={() => setSelectedItemId(null)}
                onOpenEditFile={(it) => setSelectedItemForEditFile(it)}
                onOpenRevisions={(it) => setSelectedItemForRevisions(it)}
                onOpenCopy={(it) => setSelectedItemForCopy(it)}
                onMoveFolder={handleMoveFolder}
                onTrash={handleTrashItem}
                onDownload={selectedItem?.type === 'file' ? handleDownload : undefined}
              />
            </section>
          </div>
        )}

        {/* Tab: Hộp thu cá nhân (LIB-02) */}
        {currentTab === 'inbox' && (
          <section className="flex-1 p-6 overflow-y-auto" aria-label="Hộp thu cá nhân">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 mb-4 shadow-sm">
              <span className="font-semibold">Hộp thu cá nhân (LIB-02):</span> Nơi chứa các ghi chú và liên kết lưu nhanh chưa phân loại. Chỉ duy nhất bạn thấy nội dung trong Hộp thu này. Hãy dùng chức năng &quot;Chuyển&quot; để xếp vào thư mục hoặc &quot;Sao chép&quot; vào nhóm.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
              {items
                .filter((it) => !it.folderId)
                .map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    folders={folders}
                    isSelected={selectedItemId === item.id}
                    onSelect={(it) => setSelectedItemId(it.id)}
                    onOpenRevisions={(it) => setSelectedItemForRevisions(it)}
                    onOpenCopy={(it) => setSelectedItemForCopy(it)}
                    onMoveFolder={handleMoveFolder}
                    onTrash={handleTrashItem}
                    onDownload={item.type === 'file' ? handleDownload : undefined}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Tab: Thùng rác (LIB-14) */}
        {currentTab === 'trash' && (
          <section className="flex-1 p-6 overflow-y-auto">
            <TrashView
              trashItems={trashItems}
              onRestore={handleRestoreItem}
              loading={loading}
            />
          </section>
        )}
      </div>

      {/* Modals */}
      <CreateItemModal
        isOpen={isCreateOpen}
        folders={folders}
        initialFolderId={selectedFolderId}
        onClose={() => setIsCreateOpen(false)}
        onCreateText={handleCreateText}
        onCreateLink={handleCreateLink}
        onUploadFile={(file, title, folderId) => executeUploadWithProgress(file, title, folderId)}
      />

      <QuickSaveModal
        isOpen={isQuickSaveOpen}
        onClose={() => setIsQuickSaveOpen(false)}
        onQuickSave={handleQuickSave}
      />

      {/* CUXB-08: Sửa tệp có 2 nút Ghi đè mục này / Tạo bản sao */}
      <EditFileModal
        isOpen={!!selectedItemForEditFile}
        item={selectedItemForEditFile}
        folders={folders}
        onClose={() => setSelectedItemForEditFile(null)}
        onOverwrite={handleOverwriteUploadedFile}
        onCopyAsNew={handleCopyAsNewUploadedFile}
      />

      <RevisionHistoryModal
        isOpen={!!selectedItemForRevisions}
        item={selectedItemForRevisions}
        onClose={() => setSelectedItemForRevisions(null)}
        onOverwriteRevision={handleOverwriteRevision}
        onOverwriteUploadFile={handleOverwriteUploadedFile}
      />

      <CopyItemModal
        isOpen={!!selectedItemForCopy}
        item={selectedItemForCopy}
        onClose={() => setSelectedItemForCopy(null)}
        onCopy={handleCopyItem}
      />
    </main>
  );
};
