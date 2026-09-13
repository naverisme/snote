import { Request, Response } from 'express';
import { ProjectsService } from './projects.service';
import { createProjectSchema, updateProjectSchema } from './projects.schemas';

export class ProjectsController {
  constructor(private readonly service: ProjectsService = new ProjectsService()) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const semesterId = req.query.semesterId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;
    const data = await this.service.getAllProjects(userId, semesterId, subjectId);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách dự án / bài tập lớn thành công',
      data
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = await this.service.getProjectById(id, userId);
    res.status(200).json({
      success: true,
      data
    });
  };

  getWorkspace = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = await this.service.getProjectWorkspace(id, userId);
    res.status(200).json({
      success: true,
      message: 'Lấy không gian làm việc dự án thành công',
      data
    });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const validated = createProjectSchema.parse(req.body);
    const data = await this.service.createProject(userId, validated);
    res.status(201).json({
      success: true,
      message: 'Tạo dự án / bài tập lớn mới thành công',
      data
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const validated = updateProjectSchema.parse(req.body);
    const data = await this.service.updateProject(id, userId, validated);
    res.status(200).json({
      success: true,
      message: 'Cập nhật dự án thành công',
      data
    });
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    await this.service.deleteProject(id, userId);
    res.status(200).json({
      success: true,
      message: 'Xóa dự án / bài tập lớn thành công'
    });
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = await this.service.addMember(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Thêm thành viên vào dự án thành công',
      data
    });
  };

  updateMemberRole = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const targetUserId = req.params.memberUserId as string;
    const data = await this.service.updateMemberRole(id, userId, targetUserId, req.body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành viên thành công',
      data
    });
  };

  removeMember = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const targetUserId = req.params.memberUserId as string;
    const isSelf = userId === targetUserId;
    await this.service.removeMember(id, userId, targetUserId);
    res.status(200).json({
      success: true,
      message: isSelf ? 'Rời khỏi nhóm dự án thành công' : 'Xóa thành viên khỏi dự án thành công'
    });
  };

  getInvitations = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const data = await this.service.getInvitations(userId);
    res.status(200).json({
      success: true,
      data
    });
  };

  acceptInvitation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    await this.service.respondInvitation(id, userId, true);
    res.status(200).json({
      success: true,
      message: 'Bạn đã chấp nhận tham gia dự án thành công'
    });
  };

  declineInvitation = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    await this.service.respondInvitation(id, userId, false);
    res.status(200).json({
      success: true,
      message: 'Bạn đã từ chối tham gia dự án'
    });
  };

  // Discussions (Group Team Chat)
  getDiscussions = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = await this.service.getDiscussions(id, userId);
    res.status(200).json({
      success: true,
      data
    });
  };

  createDiscussion = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const data = await this.service.createDiscussion(id, userId, req.body);
    res.status(201).json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      data
    });
  };

  deleteDiscussion = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const messageId = req.params.messageId as string;
    await this.service.deleteDiscussion(id, userId, messageId);
    res.status(200).json({
      success: true,
      message: 'Đã xóa tin nhắn trao đổi'
    });
  };
}
