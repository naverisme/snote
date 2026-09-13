import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../../shared/db/prismaClient';
import { ForbiddenError, NotFoundError } from '../../shared/errors/appErrors';

export interface DiscussionMessage {
  id: string;
  projectId: string;
  userId: string;
  senderName: string;
  senderEmail?: string;
  senderAvatar?: string | null;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE';
  mediaUrl?: string | null;
  mediaName?: string | null;
  mediaSize?: number | null;
  duration?: number | null;
  createdAt: string;
}

export class ProjectDiscussionsService {
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly dataFile = path.join(this.dataDir, 'project_discussions.json');

  constructor() {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private readAll(): DiscussionMessage[] {
    try {
      this.ensureStorage();
      const raw = fs.readFileSync(this.dataFile, 'utf-8');
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }

  private writeAll(messages: DiscussionMessage[]) {
    this.ensureStorage();
    fs.writeFileSync(this.dataFile, JSON.stringify(messages, null, 2), 'utf-8');
  }

  private async verifyProjectAccess(projectId: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId },
          { members: { some: { userId } } }
        ],
        deletedAt: null
      }
    });

    if (!project) {
      throw new ForbiddenError('Bạn không có quyền truy cập không gian trao đổi của dự án này');
    }
    return project;
  }

  async getDiscussions(projectId: string, userId: string): Promise<DiscussionMessage[]> {
    await this.verifyProjectAccess(projectId, userId);
    const all = this.readAll();
    return all.filter((m) => m.projectId === projectId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async createDiscussion(
    projectId: string,
    userId: string,
    data: {
      content?: string;
      type?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE';
      mediaUrl?: string | null;
      mediaName?: string | null;
      mediaSize?: number | null;
      duration?: number | null;
    }
  ): Promise<DiscussionMessage> {
    await this.verifyProjectAccess(projectId, userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, avatarUrl: true }
    });

    const msg: DiscussionMessage = {
      id: crypto.randomUUID(),
      projectId,
      userId,
      senderName: user?.fullName || 'Thành viên',
      senderEmail: user?.email,
      senderAvatar: user?.avatarUrl,
      content: data.content || '',
      type: data.type || (data.mediaUrl ? 'IMAGE' : 'TEXT'),
      mediaUrl: data.mediaUrl || null,
      mediaName: data.mediaName || null,
      mediaSize: data.mediaSize || null,
      duration: data.duration || null,
      createdAt: new Date().toISOString()
    };

    const all = this.readAll();
    all.push(msg);
    this.writeAll(all);

    return msg;
  }

  async deleteDiscussion(projectId: string, userId: string, messageId: string): Promise<void> {
    await this.verifyProjectAccess(projectId, userId);

    const all = this.readAll();
    const targetIdx = all.findIndex((m) => m.id === messageId && m.projectId === projectId);
    if (targetIdx === -1) {
      throw new NotFoundError('Không tìm thấy tin nhắn trao đổi');
    }

    const targetMsg = all[targetIdx];
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { userId } } }
    });

    const isAuthor = targetMsg.userId === userId;
    const isOwner = project?.userId === userId;
    const isAdmin = project?.members?.[0]?.role === 'ADMIN' || project?.members?.[0]?.role === 'OWNER';

    if (!isAuthor && !isOwner && !isAdmin) {
      throw new ForbiddenError('Chỉ người gửi hoặc Quản trị viên mới có quyền xóa tin nhắn này');
    }

    all.splice(targetIdx, 1);
    this.writeAll(all);
  }
}
