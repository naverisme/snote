import { prisma } from '../../shared/db/prismaClient';
import { CreateNoteDto, UpdateNoteDto, NoteFilter } from './notes.types';

export class NotesRepository {
  constructor(private readonly db: typeof prisma = prisma) {}

  async findMany(userId: string, filter?: NoteFilter): Promise<{ notes: any[]; total: number }> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      deletedAt: null,
      subjectId: filter?.subjectId || undefined,
      projectId: filter?.projectId || undefined,
      noteType: filter?.noteType || undefined,
      isPinned: filter?.isPinned !== undefined ? filter.isPinned : undefined,
      isArchived: filter?.isArchived !== undefined ? filter.isArchived : undefined
    };

    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const [total, notes] = await Promise.all([
      this.db.note.count({ where }),
      this.db.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          subject: {
            select: { id: true, name: true, code: true, color: true }
          },
          project: {
            select: { id: true, name: true }
          },
          noteTags: {
            include: { tag: true }
          }
        }
      })
    ]);

    return { notes, total };
  }

  async findById(id: string, userId: string): Promise<any | null> {
    const hasShare = await this.db.resourceShare.findFirst({
      where: {
        targetType: 'NOTE',
        targetId: id,
        sharedWithUserId: userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      }
    });

    return this.db.note.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(hasShare ? {} : { userId })
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        project: {
          select: { id: true, name: true }
        },
        noteTags: {
          include: { tag: true }
        }
      }
    });
  }

  async findOwnedById(id: string, userId: string): Promise<any | null> {
    return this.db.note.findFirst({ where: { id, userId, deletedAt: null } });
  }

  private async getOrCreateTags(userId: string, tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const cleanName = name.trim();
      if (!cleanName) continue;
      const tag = await this.db.tag.upsert({
        where: { userId_name: { userId, name: cleanName } },
        update: {},
        create: { userId, name: cleanName }
      });
      tagIds.push(tag.id);
    }
    return tagIds;
  }

  async create(userId: string, data: CreateNoteDto): Promise<any> {
    let tagIds: string[] = [];
    if (data.tagNames && data.tagNames.length > 0) {
      tagIds = await this.getOrCreateTags(userId, data.tagNames);
    }

    return this.db.note.create({
      data: {
        userId,
        title: data.title || 'Ghi chú không tiêu đề',
        content: data.content,
        subjectId: data.subjectId || null,
        projectId: data.projectId || null,
        noteType: data.noteType || 'GENERAL',
        isPinned: data.isPinned ?? false,
        noteTags: {
          create: tagIds.map((tagId) => ({ tagId }))
        }
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        project: {
          select: { id: true, name: true }
        },
        noteTags: {
          include: { tag: true }
        }
      }
    });
  }

  async update(id: string, userId: string, data: UpdateNoteDto): Promise<any> {
    let noteTagsUpdate: any = undefined;

    if (data.tagNames !== undefined) {
      const tagIds = await this.getOrCreateTags(userId, data.tagNames);
      noteTagsUpdate = {
        deleteMany: {},
        create: tagIds.map((tagId) => ({ tagId }))
      };
    }

    return this.db.note.update({
      where: { id, userId, deletedAt: null },
      data: {
        title: data.title,
        content: data.content,
        subjectId: data.subjectId !== undefined ? (data.subjectId || null) : undefined,
        projectId: data.projectId !== undefined ? (data.projectId || null) : undefined,
        noteType: data.noteType,
        isPinned: data.isPinned,
        isArchived: data.isArchived,
        noteTags: noteTagsUpdate
      },
      include: {
        subject: {
          select: { id: true, name: true, code: true, color: true }
        },
        project: {
          select: { id: true, name: true }
        },
        noteTags: {
          include: { tag: true }
        }
      }
    });
  }

  async softDelete(id: string, userId: string): Promise<void> {
    await this.db.note.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
  }

  async togglePin(id: string, userId: string): Promise<any> {
    const note = await this.findOwnedById(id, userId);
    if (!note) return null;
    return this.update(id, userId, { isPinned: !note.isPinned });
  }

  async toggleArchive(id: string, userId: string): Promise<any> {
    const note = await this.findOwnedById(id, userId);
    if (!note) return null;
    return this.update(id, userId, { isArchived: !note.isArchived });
  }
}
