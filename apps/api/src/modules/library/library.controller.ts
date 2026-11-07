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
  Res,
} from '@nestjs/common';
import { DomainError } from '../../core/authorization';
import { requestId, success } from '../../core/http';
import {
  LibraryService,
  type CopyInput,
  type FolderInput,
  type LibraryItemInput,
} from './library-service';
import type { QuotaService } from './quota-service';

export interface HttpResponse {
  setHeader(name: string, value: string): void;
}

@Controller()
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryService,
    private readonly quotaService?: QuotaService,
  ) {}

  @Get('workspaces/:workspaceId/library/items')
  async listWorkspaceItems(
    @Param('workspaceId') workspaceId: string,
    @Query('folderId') folderId?: string,
    @Query('status') status?: string,
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
    @Res({ passthrough: true }) res?: HttpResponse,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
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
    @Headers('If-Match') ifMatch?: string,
    @Headers('X-CSRF-Token') _csrfToken?: string,
    @Headers('x-actor-id') actorId?: string,
  ) {
    const reqId = requestId();
    try {
      const principal = { accountId: actorId ?? '00000000-0000-0000-0000-000000000001' };
      const folder = await this.libraryService.deleteFolder(principal, folderId, ifMatch);
      return success(folder, reqId);
    } catch (err) {
      this.handleError(err, reqId);
    }
  }

  @Get('workspaces/:workspaceId/quota')
  async getWorkspaceQuota(
    @Param('workspaceId') workspaceId: string,
    @Headers('x-actor-id') _actorId?: string,
  ) {
    const reqId = requestId();
    try {
      if (!this.quotaService) {
        throw new DomainError('QUOTA_SERVICE_UNAVAILABLE', 503);
      }
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
