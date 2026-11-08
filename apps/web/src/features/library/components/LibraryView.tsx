import React, { useCallback, useEffect, useState } from 'react';
import { BookOpen, Inbox, FileText, Trash2, Plus, Download, FolderOpen } from 'lucide-react';
import { libraryApi } from '../api';
import type { Folder, ItemDetail, Library, QuotaInfo } from '../types';
import { CopyItemModal } from './CopyItemModal';
import { CreateItemModal } from './CreateItemModal';
import { FolderTree } from './FolderTree';
import { ItemCard } from './ItemCard';
import { QuickSaveModal } from './QuickSaveModal';
import { QuotaBar } from './QuotaBar';
import { RevisionHistoryModal } from './RevisionHistoryModal';
import { TrashView } from './TrashView';

export interface LibraryViewProps {
  workspaceId: string;
  isPersonalWorkspace?: boolean;
  csrfToken?: string;
  actorId?: string;
}

export type MainTab = 'documents' | 'inbox' | 'trash';

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
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
  const [selectedItemForRevisions, setSelectedItemForRevisions] = useState<ItemDetail | null>(null);
  const [selectedItemForCopy, setSelectedItemForCopy] = useState<ItemDetail | null>(null);

  const reqOpts = { csrfToken, actorId };

  // Load workspace data
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setQuota(null);
    setFolders([]);
    setItems([]);
    setTrashItems([]);
    try {
      const quotaData = await libraryApi.getWorkspaceQuota(workspaceId, reqOpts);
      setQuota(quotaData);

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
            return null;
          }
        }),
      );
      setItems(detailedItems.filter((item): item is ItemDetail => item !== null));

      // 4. Trash items
      const trashRaw = await libraryApi.listItems(workspaceId, { status: 'trash' }, reqOpts);
      const detailedTrash = await Promise.all(
        trashRaw.map(async (it) => {
          try {
            const d = await libraryApi.getItem(it.id, reqOpts);
            return d.item;
          } catch {
            return null;
          }
        }),
      );
      setTrashItems(detailedTrash.filter((item): item is ItemDetail => item !== null));
    } catch (err) {
      console.error('Failed to load library data', err);
      setLoadError('Không thể tải Thư viện. Vui lòng thử lại.');
      setQuota(null);
      setFolders([]);
      setItems([]);
      setTrashItems([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, selectedFolderId, csrfToken, actorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Actions
  const handleCreateText = async (title: string, content: string, folderId: string | null) => {
    await libraryApi.createItem(
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
  };

  const handleCreateLink = async (title: string, url: string, folderId: string | null) => {
    await libraryApi.createItem(
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
  };

  const handleUploadFile = async (file: File, title: string, folderId: string | null) => {
    // 1. Start upload staging
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

    // 2. Put binary content
    await libraryApi.uploadContent(startRes.id, file, reqOpts);

    // 3. Commit into library item
    await libraryApi.createItem(
      workspaceId,
      {
        type: 'file',
        title: title || file.name,
        uploadId: startRes.id,
        folderId: folderId || undefined,
      },
      reqOpts,
    );

    await loadData();
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
    if (!window.confirm(`Chuyển tài liệu "${item.title || item.type}" vào Thùng rác?`)) return;
    await libraryApi.trashItem(item.id, { ...reqOpts, etag: `"${item.version}"` });
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

  return (
    <main className="library-feature flex flex-col h-full bg-gray-100 min-h-screen text-gray-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-600" />
            <span>Thư viện tài liệu</span>
            {isPersonalWorkspace && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-normal">
                Workspace cá nhân
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý văn bản, liên kết tham khảo, tệp đính kèm và thùng rác 30 ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick save button (LIB-02) */}
          <button
            type="button"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            onClick={() => setIsQuickSaveOpen(true)}
            title="Lưu nhanh vào Hộp thu cá nhân"
          >
            <Download size={14} />
            <span>Lưu nhanh</span>
          </button>

          {/* Add item button */}
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={14} />
            <span>Thêm tài liệu</span>
          </button>
        </div>
      </header>

      {/* Quota Bar Banner */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <QuotaBar quota={quota} loading={loading} />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex justify-between items-center">
        <nav className="flex gap-6" aria-label="Tabs Thư viện">
          <button
            type="button"
            className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setCurrentTab('documents')}
          >
            <FileText size={15} />
            <span>Tài liệu</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {items.length}
            </span>
          </button>

          {isPersonalWorkspace && (
            <button
              type="button"
              className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                currentTab === 'inbox'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setCurrentTab('inbox');
                setSelectedFolderId(null);
              }}
            >
              <Inbox size={15} />
              <span>Hộp thu (Inbox)</span>
            </button>
          )}

          <button
            type="button"
            className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              currentTab === 'trash'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setCurrentTab('trash')}
          >
            <Trash2 size={15} />
            <span>Thùng rác</span>
            {trashItems.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                {trashItems.length}
              </span>
            )}
          </button>
        </nav>

        {/* Search Input */}
        {currentTab === 'documents' && (
          <div className="py-2">
            <input
              type="search"
              placeholder="Tìm kiếm tài liệu..."
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg w-56 focus:outline-none focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loadError && (
        <div role="alert" className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {loadError}
          <button type="button" className="ml-3 underline" onClick={loadData}>Thử lại</button>
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        {currentTab === 'documents' && (
          <>
            {/* Folder Sidebar */}
            <FolderTree
              folders={folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
            />

            {/* Items Grid View */}
            <section className="flex-1 p-6 overflow-y-auto" aria-label="Danh sách tài liệu">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-44 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-6 text-center text-gray-500">
                  <FolderOpen size={44} className="text-gray-300 mb-2 stroke-1" />
                  <p className="font-semibold text-gray-700">Chưa có tài liệu nào trong thư mục này</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    Nhấn vào nút &quot;Thêm tài liệu&quot; ở góc trên để tạo văn bản, lưu đường dẫn hoặc tải lên tệp đính kèm.
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium shadow-sm hover:bg-blue-700 inline-flex items-center gap-1"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    <Plus size={14} />
                    <span>Tạo mục đầu tiên</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      folders={folders}
                      onOpenRevisions={(it) => setSelectedItemForRevisions(it)}
                      onOpenCopy={(it) => setSelectedItemForCopy(it)}
                      onMoveFolder={handleMoveFolder}
                      onTrash={handleTrashItem}
                      onDownload={item.type === 'file' ? handleDownload : undefined}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {currentTab === 'inbox' && (
          <section className="flex-1 p-6 overflow-y-auto" aria-label="Hộp thu cá nhân">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 mb-4">
              <strong>Hộp thu cá nhân (LIB-02):</strong> Nơi chứa các ghi chú và liên kết lưu nhanh chưa phân loại. Chỉ duy nhất bạn thấy nội dung trong Hộp thu này. Hãy dùng chức năng &quot;Chuyển&quot; để xếp vào thư mục hoặc &quot;Sao chép&quot; vào nhóm.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
              {items
                .filter((it) => !it.folderId)
                .map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    folders={folders}
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
        onUploadFile={handleUploadFile}
      />

      <QuickSaveModal
        isOpen={isQuickSaveOpen}
        onClose={() => setIsQuickSaveOpen(false)}
        onQuickSave={handleQuickSave}
      />

      <RevisionHistoryModal
        isOpen={!!selectedItemForRevisions}
        item={selectedItemForRevisions}
        onClose={() => setSelectedItemForRevisions(null)}
        onOverwriteRevision={handleOverwriteRevision}
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
