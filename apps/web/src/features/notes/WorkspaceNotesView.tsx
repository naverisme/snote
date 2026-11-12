import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { FileText, Pin, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { libraryApi } from '../library/api';
import type { ItemDetail } from '../library/types';

interface Props {
  workspaceId: string;
  actorId?: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Thao tác chưa thành công. Vui lòng thử lại.';
}

export function WorkspaceNotesView({ workspaceId, actorId }: Props) {
  const [notes, setNotes] = useState<ItemDetail[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = (await libraryApi.listItems(workspaceId, { status: 'active' })).filter(item => item.type === 'text');
      const details = await Promise.allSettled(items.map(item => libraryApi.getItem(item.id)));
      setNotes(details.flatMap(result => result.status === 'fulfilled' ? [result.value.item] : [])
        .sort((a, b) => Number(b.pinned) - Number(a.pinned)));
      if (details.some(result => result.status === 'rejected')) setError('Một số ghi chú chưa tải được. Hãy thử lại.');
    } catch (cause) {
      setNotes([]);
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { void load(); }, [load]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await libraryApi.createItem(workspaceId, { type: 'text', title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      await load();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  };

  const remove = async (note: ItemDetail) => {
    if (!window.confirm(`Chuyển “${note.title || 'Ghi chú'}” vào Thùng rác?`)) return;
    setBusy(true);
    setError(null);
    try {
      await libraryApi.trashItem(note.id, { etag: `"${note.version}"` });
      await load();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  };

  const togglePin = async (note: ItemDetail) => {
    setBusy(true);
    setError(null);
    try {
      await libraryApi.updateItem(note.id, { pinned: !note.pinned }, { etag: `"${note.version}"` });
      await load();
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  };

  return <div className="review-screen notes-screen">
    <form className="review-panel notes-composer" onSubmit={event => void create(event)}>
      <h1>Ghi chú & Mục lưu ý Workspace</h1>
      <p>Ghi nhanh thông tin trong workspace. Các ghi chú này cũng có trong Thư viện.</p>
      <label htmlFor="note-title">Tiêu đề</label>
      <input id="note-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Tiêu đề mục lưu ý..." required maxLength={200} />
      <label htmlFor="note-content">Nội dung</label>
      <textarea id="note-content" value={content} onChange={event => setContent(event.target.value)} placeholder="Nội dung chi tiết..." required rows={3} />
      <button type="submit" className="btn btn-primary" disabled={busy}><Plus size={15} /> Ghi lại mục này</button>
    </form>

    {error && <div role="alert" className="review-panel notes-error">{error} <button type="button" className="btn btn-secondary btn-sm" onClick={() => void load()}><RefreshCw size={13} /> Thử lại</button></div>}
    {loading ? <div className="review-panel review-empty">Đang tải ghi chú...</div> : notes.length === 0 && !error ? <div className="review-panel review-empty">Chưa có ghi chú văn bản trong workspace này.</div> : <div className="notes-grid">
      {notes.map(note => <article className="review-panel notes-card" key={note.id} data-pinned={note.pinned ? 'true' : undefined}>
        <h2><FileText size={16} /> {note.title || 'Ghi chú không tiêu đề'}</h2>
        <p>{note.revision?.text || 'Chưa có nội dung.'}</p>
        <div className="notes-card-footer"><span>{note.revision?.at ? new Date(note.revision.at).toLocaleDateString('vi-VN') : 'Đã lưu'}</span>{actorId && note.revision?.actorId === actorId && <span className="notes-card-actions"><button className="notes-pin" type="button" aria-label={`${note.pinned ? 'Bỏ ghim' : 'Ghim'} ${note.title || 'ghi chú'}`} title={note.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'} disabled={busy} onClick={() => void togglePin(note)}><Pin size={14} fill={note.pinned ? 'currentColor' : 'none'} /></button><button type="button" aria-label={`Xóa ${note.title || 'ghi chú'}`} title="Chuyển vào Thùng rác" disabled={busy} onClick={() => void remove(note)}><Trash2 size={14} /></button></span>}</div>
      </article>)}
    </div>}
  </div>;
}
