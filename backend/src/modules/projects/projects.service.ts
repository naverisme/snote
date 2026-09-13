import { ProjectsRepository } from './projects.repository';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponseDto,
  AddProjectMemberDto,
  ProjectMemberDto,
  UpdateProjectMemberRoleDto,
  ProjectWorkspaceDto
} from './projects.types';
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors/appErrors';
import { prisma } from '../../shared/db/prismaClient';
import { ProjectDiscussionsService } from './projectDiscussions.service';

export class ProjectsService {
  constructor(private readonly repo: ProjectsRepository = new ProjectsRepository()) {}

  private mapDto(project: any): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      semesterId: project.semesterId,
      subjectId: project.subjectId,
      status: project.status,
      startDate: project.startDate,
      dueDate: project.dueDate,
      notesCount: project._count?.notes ?? 0,
      tasksCount: project._count?.tasks ?? 0,
      membersCount: project._count?.members ?? (project.members?.length ?? 0),
      members: project.members?.map((m: any): ProjectMemberDto => ({
        id: m.id,
        projectId: m.projectId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt,
        user: m.user ? {
          id: m.user.id,
          email: m.user.email,
          fullName: m.user.fullName,
          avatarUrl: m.user.avatarUrl
        } : undefined
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  async getAllProjects(userId: string, semesterId?: string, subjectId?: string): Promise<ProjectResponseDto[]> {
    const list = await this.repo.findByUserId(userId, semesterId, subjectId);
    return list.map((p) => this.mapDto(p));
  }

  async getProjectById(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.repo.findByIdAndUserId(id, userId);
    if (!project) {
      throw new NotFoundError('Không tìm thấy dự án yêu cầu hoặc bạn không có quyền truy cập');
    }
    return this.mapDto(project);
  }

  async getProjectWorkspace(id: string, userId: string): Promise<ProjectWorkspaceDto> {
    const project = await this.repo.findWorkspaceById(id, userId);
    if (!project) {
      throw new NotFoundError('Không tìm thấy dự án hoặc bạn chưa là thành viên của dự án này');
    }

    return {
      ...this.mapDto(project),
      subject: project.subject,
      semester: project.semester,
      notes: project.notes.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        noteType: n.noteType,
        isPinned: n.isPinned,
        isArchived: n.isArchived,
        author: n.user,
        tags: n.noteTags.map((nt: any) => nt.tag),
        createdAt: n.createdAt,
        updatedAt: n.updatedAt
      })),
      tasks: project.tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        completedAt: t.completedAt,
        assignee: t.user,
        tags: t.taskTags.map((tt: any) => tt.tag),
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    };
  }

  async createProject(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.repo.create(userId, dto);
    return this.mapDto(project);
  }

  async updateProject(id: string, userId: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.getProjectById(id, userId);
    const currentMember = project.members?.find((m) => m.userId === userId);
    if (currentMember?.role === 'VIEWER') {
      throw new ForbiddenError('Tài khoản của bạn chỉ có quyền Người xem (Viewer), không thể chỉnh sửa thông tin dự án');
    }
    const updated = await this.repo.update(id, userId, dto);
    return this.mapDto(updated);
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const project = await this.getProjectById(id, userId);
    const memberRole = project.members?.find((m) => m.userId === userId)?.role;
    if (memberRole !== 'OWNER') {
      throw new ForbiddenError('Chỉ Trưởng nhóm (Owner) mới có quyền xóa toàn bộ dự án / bài tập lớn này');
    }
    await this.repo.softDelete(id, userId);
  }

  async addMember(projectId: string, currentUserId: string, dto: AddProjectMemberDto): Promise<ProjectResponseDto> {
    const project = await this.getProjectById(projectId, currentUserId);

    // Kiểm tra quyền: Chỉ OWNER và ADMIN mới có quyền thêm/mời thành viên
    const currentMember = project.members?.find((m) => m.userId === currentUserId);
    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      throw new ForbiddenError('Chỉ Trưởng nhóm (Owner) hoặc Quản trị viên (Admin) mới có quyền mời thành viên vào dự án');
    }

    // Admin không thể tự phong thành viên mới thành OWNER
    if (currentMember.role === 'ADMIN' && dto.role === 'OWNER') {
      throw new ForbiddenError('Chỉ Trưởng nhóm (Owner) mới có quyền chỉ định vai trò Trưởng nhóm');
    }

    // Tìm target user theo email hoặc userId an toàn tránh lỗi cú pháp UUID
    const rawInput = dto.emailOrUserId || (dto as any).userId || (dto as any).email || '';
    const input = String(rawInput).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);

    const targetUser = await prisma.user.findFirst({
      where: {
        ...(isUuid ? { OR: [{ id: input }, { email: input.toLowerCase() }] } : { email: input.toLowerCase() }),
        deletedAt: null
      }
    });

    if (!targetUser) {
      throw new NotFoundError('Không tìm thấy tài khoản người dùng với thông tin này');
    }

    await this.repo.addMember(projectId, targetUser.id, dto.role || 'MEMBER');
    return this.getProjectById(projectId, currentUserId);
  }

  async updateMemberRole(
    projectId: string,
    currentUserId: string,
    targetUserId: string,
    dto: UpdateProjectMemberRoleDto
  ): Promise<ProjectResponseDto> {
    const project = await this.getProjectById(projectId, currentUserId);
    const currentMember = project.members?.find((m) => m.userId === currentUserId);
    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      throw new ForbiddenError('Chỉ Trưởng nhóm (Owner) hoặc Quản trị viên (Admin) mới có quyền phân quyền thành viên');
    }

    const targetMember = project.members?.find((m) => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundError('Không tìm thấy thành viên trong dự án này');
    }

    // Nếu current user là ADMIN:
    if (currentMember.role === 'ADMIN') {
      if (targetMember.role === 'OWNER') {
        throw new ForbiddenError('Quản trị viên không thể thay đổi vai trò của Trưởng nhóm');
      }
      if (targetMember.role === 'ADMIN' && targetUserId !== currentUserId) {
        throw new ForbiddenError('Quản trị viên không thể thay đổi vai trò của Quản trị viên khác');
      }
      if (dto.role === 'OWNER') {
        throw new ForbiddenError('Chỉ Trưởng nhóm mới có quyền chuyển giao quyền Trưởng nhóm');
      }
    }

    await this.repo.updateMemberRole(projectId, targetUserId, dto.role);
    return this.getProjectById(projectId, currentUserId);
  }

  async removeMember(projectId: string, currentUserId: string, targetUserId: string): Promise<void> {
    const project = await this.getProjectById(projectId, currentUserId);
    const isSelf = currentUserId === targetUserId;
    const currentMember = project.members?.find((m) => m.userId === currentUserId);
    const targetMember = project.members?.find((m) => m.userId === targetUserId);

    if (!targetMember) {
      throw new NotFoundError('Không tìm thấy thành viên cần thao tác trong dự án');
    }

    if (isSelf) {
      // 1. Tự rời nhóm (Out nhóm)
      if (targetMember.role === 'OWNER' && (project.members?.length || 0) > 1) {
        throw new ValidationError('Vui lòng chuyển giao quyền Trưởng nhóm (Owner) cho thành viên khác trước khi rời khỏi dự án');
      }
    } else {
      // 2. Kick thành viên
      if (!currentMember) {
        throw new ForbiddenError('Bạn không phải là thành viên của dự án này');
      }

      if (currentMember.role === 'OWNER') {
        // Owner có quyền kick bất kỳ ai khác
      } else if (currentMember.role === 'ADMIN') {
        // Admin có thể kick MEMBER hoặc VIEWER, nhưng KHÔNG kick OWNER hoặc ADMIN khác
        if (targetMember.role === 'OWNER') {
          throw new ForbiddenError('Quản trị viên không thể xóa Trưởng nhóm khỏi dự án');
        }
        if (targetMember.role === 'ADMIN') {
          throw new ForbiddenError('Quản trị viên không thể xóa Quản trị viên khác khỏi dự án');
        }
      } else {
        throw new ForbiddenError('Bạn không có quyền xóa thành viên này khỏi dự án');
      }
    }

    await this.repo.removeMember(projectId, targetUserId);
  }

  async getInvitations(userId: string): Promise<any[]> {
    return this.repo.findInvitations(userId);
  }

  async respondInvitation(projectId: string, userId: string, accept: boolean): Promise<void> {
    await this.repo.respondToInvitation(projectId, userId, accept);
  }

  // Discussions
  private readonly discussionService = new ProjectDiscussionsService();

  async getDiscussions(projectId: string, userId: string) {
    return this.discussionService.getDiscussions(projectId, userId);
  }

  async createDiscussion(projectId: string, userId: string, data: any) {
    return this.discussionService.createDiscussion(projectId, userId, data);
  }

  async deleteDiscussion(projectId: string, userId: string, messageId: string) {
    return this.discussionService.deleteDiscussion(projectId, userId, messageId);
  }
}
