import { NotesRepository } from './notes.repository';
import { CreateNoteDto, UpdateNoteDto, NoteFilter, NoteResponseDto } from './notes.types';
import { NotFoundError } from '../../shared/errors/appErrors';
import { allowedSubject, writableProject } from '../../shared/security/studyAccess';

export class NotesService {
  constructor(private readonly repository: NotesRepository = new NotesRepository()) {}

  private extractFallbackTitle(title?: string, content?: string): string {
    if (title && title.trim()) return title.trim();
    if (!content || !content.trim()) return 'Ghi chú không tiêu đề';

    // Trích xuất dòng đầu tiên có nội dung làm tiêu đề tóm tắt
    const firstLine = content.split('\n').map((l) => l.trim()).find((l) => l.length > 0) || '';
    const cleanLine = firstLine.replace(/^[#*•\-_+>\[\]\(\)\d\.\/ ]+/, '').trim();
    if (!cleanLine) return 'Ghi chú không tiêu đề';
    return cleanLine.length > 80 ? cleanLine.substring(0, 77) + '...' : cleanLine;
  }

  private mapDto(note: any): NoteResponseDto {
    return {
      id: note.id,
      userId: note.userId,
      subjectId: note.subjectId,
      projectId: note.projectId,
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      tags: (note.noteTags || []).map((nt: any) => ({
        id: nt.tag.id,
        name: nt.tag.name,
        color: nt.tag.color
      })),
      subject: note.subject,
      project: note.project,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    };
  }

  async getNotes(userId: string, filter?: NoteFilter): Promise<{ notes: NoteResponseDto[]; total: number }> {
    const { notes, total } = await this.repository.findMany(userId, filter);
    return {
      notes: notes.map((n) => this.mapDto(n)),
      total
    };
  }

  async getNoteById(id: string, userId: string): Promise<NoteResponseDto> {
    const note = await this.repository.findById(id, userId);
    if (!note) {
      throw new NotFoundError('Không tìm thấy ghi chú yêu cầu');
    }
    return this.mapDto(note);
  }

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteResponseDto> {
    const project = dto.projectId ? await writableProject(dto.projectId, userId) : null;
    if (dto.subjectId) await allowedSubject(dto.subjectId, userId, project?.subjectId);
    const finalTitle = this.extractFallbackTitle(dto.title, dto.content);
    const note = await this.repository.create(userId, { ...dto, title: finalTitle });
    return this.mapDto(note);
  }

  async updateNote(id: string, userId: string, dto: UpdateNoteDto): Promise<NoteResponseDto> {
    const owned = await this.repository.findOwnedById(id, userId);
    if (!owned) throw new NotFoundError('Không tìm thấy ghi chú thuộc tài khoản của bạn');
    const projectId = dto.projectId === undefined ? owned.projectId : dto.projectId;
    const project = projectId ? await writableProject(projectId, userId) : null;
    if (dto.subjectId) await allowedSubject(dto.subjectId, userId, project?.subjectId);
    let finalTitle = dto.title;
    if (dto.title !== undefined) {
      finalTitle = this.extractFallbackTitle(dto.title, dto.content);
    }
    const updated = await this.repository.update(id, userId, {
      ...dto,
      ...(finalTitle !== undefined ? { title: finalTitle } : {})
    });
    return this.mapDto(updated);
  }

  async deleteNote(id: string, userId: string): Promise<void> {
    const note = await this.repository.findOwnedById(id, userId);
    if (!note) throw new NotFoundError('Không tìm thấy ghi chú thuộc tài khoản của bạn');
    await this.repository.softDelete(id, userId);
  }

  async togglePin(id: string, userId: string): Promise<NoteResponseDto> {
    const note = await this.repository.findOwnedById(id, userId);
    if (!note) throw new NotFoundError('Không tìm thấy ghi chú thuộc tài khoản của bạn');
    const updated = await this.repository.update(id, userId, { isPinned: !note.isPinned });
    return this.mapDto(updated);
  }

  async toggleArchive(id: string, userId: string): Promise<NoteResponseDto> {
    const note = await this.repository.findOwnedById(id, userId);
    if (!note) throw new NotFoundError('Không tìm thấy ghi chú thuộc tài khoản của bạn');
    const updated = await this.repository.update(id, userId, { isArchived: !note.isArchived });
    return this.mapDto(updated);
  }
}
