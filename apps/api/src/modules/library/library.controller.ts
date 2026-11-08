import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DomainError, requireAction } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import { ScopedAuthorization } from '../authorization/policy';
import {
  LibraryService,
  type CopyInput,
  type FolderInput,
  type LibraryItemInput,
} from './library-service';
import { QuotaService } from './quota-service';
import { LibrarySessionGuard, libraryPrincipal, type LibraryRequest } from './library-session.guard';

export interface HttpResponse {
  setHeader(name: string, value: string): void;
}

@Controller()
@UseGuards(LibrarySessionGuard)
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly quotaService: QuotaService,
    private readonly auth: ScopedAuthorization,
  ) {}

  @Get('workspaces/:workspaceId/library/items')
  async listWorkspaceItems(
    @Param('workspaceId') workspaceId: string,
    @Req() req: LibraryRequest,
    @Query('folderId') folderId?: string,
    @Query('status') status?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const items = await this.libraryService.listItems(principal, workspaceId, {
        folderId,
        status,
      });
      return { data: items, requestId: reqId };
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('workspaces/:workspaceId/library/items')
  async createWorkspaceItem(
    @Param('workspaceId') workspaceId: string,
    @Body() body: LibraryItemInput,
    @Req() req: LibraryRequest,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.createItem(principal, workspaceId, body);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('library/items/:itemId')
  async getItem(
    @Param('itemId') itemId: string,
    @Req() req: LibraryRequest,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const { item, revision, preview } = await this.libraryService.getItem(principal, itemId);
      res?.setHeader('ETag', `"${item.version}"`);
      return success({ ...item, revision, preview }, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('library/items/:itemId')
  async updateItem(
    @Param('itemId') itemId: string,
    @Body() body: Partial<LibraryItemInput>,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.updateItem(principal, itemId, ifMatch, body);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('me/inbox/items')
  async createInboxItem(
    @Body() body: LibraryItemInput,
    @Req() req: LibraryRequest,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.createInboxItem(principal, body);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('library/items/:itemId/revisions')
  async createRevision(
    @Param('itemId') itemId: string,
    @Body() body: LibraryItemInput,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.createRevision(principal, itemId, ifMatch, body);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('library/items/:itemId/copies')
  async copyItem(
    @Param('itemId') itemId: string,
    @Body() body: CopyInput,
    @Req() req: LibraryRequest,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.copyItem(principal, itemId, body);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('library/items/:itemId/trash')
  async trashItem(
    @Param('itemId') itemId: string,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.trash(principal, itemId, ifMatch);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('library/items/:itemId/restore')
  async restoreItem(
    @Param('itemId') itemId: string,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const item = await this.libraryService.restore(principal, itemId, ifMatch);
      res?.setHeader('ETag', `"${item.version}"`);
      return success(item, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('library/items/:itemId/download')
  async downloadItem(
    @Param('itemId') itemId: string,
    @Req() req: LibraryRequest,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const download = await this.libraryService.getDownload(principal, itemId);
      return success(download, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  // Folders
  @Get('workspaces/:workspaceId/folders')
  async listFolders(
    @Param('workspaceId') workspaceId: string,
    @Req() req: LibraryRequest,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const folders = await this.libraryService.listFolders(principal, workspaceId);
      return { data: folders, requestId: reqId };
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Post('workspaces/:workspaceId/folders')
  async createFolder(
    @Param('workspaceId') workspaceId: string,
    @Body() body: FolderInput,
    @Req() req: LibraryRequest,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const folder = await this.libraryService.createFolder(principal, workspaceId, body);
      res?.setHeader('ETag', `"${folder.version}"`);
      return success(folder, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Patch('folders/:folderId')
  async updateFolder(
    @Param('folderId') folderId: string,
    @Body() body: FolderInput,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const folder = await this.libraryService.updateFolder(principal, folderId, ifMatch, body);
      res?.setHeader('ETag', `"${folder.version}"`);
      return success(folder, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Delete('folders/:folderId')
  async deleteFolder(
    @Param('folderId') folderId: string,
    @Req() req: LibraryRequest,
    @Headers('If-Match') ifMatch?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = libraryPrincipal(req);
      const folder = await this.libraryService.deleteFolder(principal, folderId, ifMatch);
      return success(folder, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('workspaces/:workspaceId/quota')
  async getWorkspaceQuota(
    @Param('workspaceId') workspaceId: string,
    @Req() req: LibraryRequest,
  ) {
    const reqId = requestId();
    try {
      await requireAction(this.auth, libraryPrincipal(req), 'library.read_text', { type: 'workspace', id: workspaceId });
      const quota = await this.quotaService.getWorkspaceQuota(workspaceId);
      return success(quota, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  private handleError(err: unknown, reqId: string): never {
    if (err instanceof DomainError) {
      throw new HttpException(
        { error: { code: err.code, message: err.code, details: {} }, requestId: reqId },
        err.status,
      );
    }
    throw new HttpException(
      { error: { code: 'INTERNAL_ERROR', message: String(err), details: {} }, requestId: reqId },
      500,
    );
  }
}
