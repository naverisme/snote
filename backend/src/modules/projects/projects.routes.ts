import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authGuard } from '../../shared/middleware/authGuard';
import { asyncBoundary } from '../../shared/middleware/asyncBoundary';

const router = Router();
const controller = new ProjectsController();

router.use(authGuard);

// Project invitations routes (must be before /:id)
router.get('/invitations', asyncBoundary(controller.getInvitations));
router.post('/:id/invitations/accept', asyncBoundary(controller.acceptInvitation));
router.post('/:id/invitations/decline', asyncBoundary(controller.declineInvitation));

router.get('/', asyncBoundary(controller.getAll));
router.get('/:id', asyncBoundary(controller.getById));
router.get('/:id/workspace', asyncBoundary(controller.getWorkspace));
router.post('/', asyncBoundary(controller.create));
router.put('/:id', asyncBoundary(controller.update));
router.delete('/:id', asyncBoundary(controller.delete));

// Team collaboration routes
router.post('/:id/members', asyncBoundary(controller.addMember));
router.put('/:id/members/:memberUserId', asyncBoundary(controller.updateMemberRole));
router.delete('/:id/members/:memberUserId', asyncBoundary(controller.removeMember));

// Discussions (Team Chat with Media & Audio)
router.get('/:id/discussions', asyncBoundary(controller.getDiscussions));
router.post('/:id/discussions', asyncBoundary(controller.createDiscussion));
router.delete('/:id/discussions/:messageId', asyncBoundary(controller.deleteDiscussion));

export const projectsRouter = router;
