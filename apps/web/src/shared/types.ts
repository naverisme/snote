import type { components } from '@snote/contracts';

export type Account = components['schemas']['Account'];
export type Usages = Account['usages'];
export type Class = components['schemas']['Class'];
export type Workspace = components['schemas']['Workspace'];
export type Membership = components['schemas']['Membership'];
export type Invitation = components['schemas']['Invitation'];
export type JoinRequest = components['schemas']['JoinRequest'];
export type Policy = components['schemas']['Policy'];
export type JoinCodeState = components['schemas']['JoinCodeState'];
export type OwnershipTransfer = components['schemas']['OwnershipTransfer'];
export type Action = components['schemas']['Action'];
export type Grant = components['schemas']['Grant'];
