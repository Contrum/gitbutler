import { apiToChatMessage, type ApiChatMessage, type ChatMessage } from '$lib/chat/types';
import { apiToPermissions, type ApiPermissions, type Permissions } from '$lib/permissions';
import {
	apiToUserSimple,
	isApiUserSimple,
	type ApiUserSimple,
	type UserSimple
} from '$lib/users/types';
import { gravatarUrlFromEmail } from '@gitbutler/ui/avatar/gravatar';
import type { LoadableData } from '$lib/network/types';
import type { BrandedId } from '$lib/utils/branding';

export type ApiDiffSection = {
	id: number;
	section_type: 'diff';
	identifier: string;
	title?: string;
	position?: number;

	diff_sha: string;
	base_file_sha: string;
	new_file_sha: string;
	old_path?: string;
	old_size?: number;
	new_path?: string;
	new_size?: number;
	hunks?: number;
	lines?: number;
	deletions?: number;
	diff_patch?: string;
};

export type DiffSection = {
	id: number;
	sectionType: 'diff';
	identifier: string;
	title?: string;
	position?: number;

	diffSha: string;
	baseFileSha: string;
	newFileSha: string;
	oldPath?: string;
	oldSize?: number;
	newPath?: string;
	newSize?: number;
	hunks?: number;
	lines?: number;
	deletions?: number;
	diffPatch?: string;
};

export type ApiTextSection = {
	id: number;
	section_type: 'text';
	identifier: string;
	title?: string;
	position?: number;

	version?: number;
	type?: string;
	code?: string;
	plain_text?: string;
	data?: unknown;
};

export type TextSection = {
	id: number;
	sectionType: 'text';
	identifier: string;
	title?: string;
	position?: number;

	version?: number;
	type?: string;
	code?: string;
	plainText?: string;
	data?: unknown;
};

export type ApiSection = ApiDiffSection | ApiTextSection;
export type Section = DiffSection | TextSection;

export function apiToSection(apiSection: ApiSection): Section {
	if (apiSection.section_type === 'diff') {
		return {
			id: apiSection.id,
			sectionType: 'diff',
			identifier: apiSection.identifier,
			title: apiSection.title,
			position: apiSection.position,
			diffSha: apiSection.diff_sha,
			baseFileSha: apiSection.base_file_sha,
			newFileSha: apiSection.new_file_sha,
			oldPath: apiSection.old_path,
			oldSize: apiSection.old_size,
			newPath: apiSection.new_path,
			newSize: apiSection.new_size,
			hunks: apiSection.hunks,
			lines: apiSection.lines,
			deletions: apiSection.deletions,
			diffPatch: apiSection.diff_patch
		};
	} else {
		return {
			id: apiSection.id,
			sectionType: 'text',
			identifier: apiSection.identifier,
			title: apiSection.title,
			position: apiSection.position,
			version: apiSection.version,
			type: apiSection.type,
			code: apiSection.code,
			plainText: apiSection.plain_text,
			data: apiSection.data
		};
	}
}

export type ApiPatchStatistics = {
	file_count: number;
	section_count: number;
	lines: number;
	deletions: number;
	files: string[];
};

export type PatchStatistics = {
	fileCount: number;
	sectionCount: number;
	lines: number;
	deletions: number;
	files: string[];
};

export function apiToPatchStatistics(api: ApiPatchStatistics): PatchStatistics {
	return {
		fileCount: api.file_count,
		sectionCount: api.section_count,
		lines: api.lines,
		deletions: api.deletions,
		files: api.files
	};
}

export type ApiPatchReview = {
	viewed: ApiUserSimple[];
	signed_off: ApiUserSimple[];
	rejected: ApiUserSimple[];
};

export type PatchReview = {
	viewed: UserSimple[];
	signedOff: UserSimple[];
	rejected: UserSimple[];
};

export function apiToPatchReview(api: ApiPatchReview): PatchReview {
	return {
		viewed: api.viewed.map(apiToUserSimple),
		signedOff: api.signed_off.map(apiToUserSimple),
		rejected: api.rejected.map(apiToUserSimple)
	};
}

export type ApiPatch = {
	change_id: string;
	commit_sha: string;
	// patch_sha: string; Not sure this is real
	title?: string;
	description?: string;
	position?: number;
	version?: number;
	contributors: string[];
	statistics: ApiPatchStatistics;
	review: ApiPatchReview;
	review_all: ApiPatchReview;
	sections?: ApiSection[];
	created_at: string;
	updated_at: string;
};

export type Patch = {
	changeId: string;
	commitSha: string;
	// patch_sha: string; Not sure this is real
	title?: string;
	description?: string;
	position?: number;
	version?: number;
	contributors: string[];
	statistics: PatchStatistics;
	review: PatchReview;
	reviewAll: PatchReview;
	sectionIds?: number[];
	createdAt: string;
	updatedAt: string;
};

export function getPatchStatus(
	patch: Patch
): 'approved' | 'changes-requested' | 'unreviewed' | 'in-discussion' {
	if (patch.review.rejected.length > 0) return 'changes-requested';
	if (patch.review.signedOff.length > 0) return 'approved';
	if (patch.review.viewed.length > 0) return 'in-discussion';
	return 'unreviewed';
}

async function getUsersWithAvatarsFromMails(userEmails: string[]) {
	return await Promise.all(
		userEmails.map(async (user) => {
			return {
				srcUrl: await gravatarUrlFromEmail(user),
				name: user
			};
		})
	);
}

export type Commenter = {
	avatarUrl?: string;
	email?: string;
	login?: string;
	name?: string;
};

export async function getUsersWithAvatars(commenters: Commenter[]) {
	return await Promise.all(
		commenters.map(async (commenter) => {
			const name = commenter.login ?? commenter.email ?? commenter.name ?? 'unknown';
			const email = commenter.email ?? 'unknown';
			return {
				srcUrl: commenter.avatarUrl ?? (await gravatarUrlFromEmail(email)),
				name
			};
		})
	);
}

export async function getPatchContributorsWithAvatars(patch: Patch) {
	return await getUsersWithAvatarsFromMails(patch.contributors);
}

export async function getPatchApproversWithAvatars(patch: Patch) {
	return await getUsersWithAvatars(patch.review.signedOff);
}

export async function getPatchRejectorsWithAvatars(patch: Patch) {
	return await getUsersWithAvatars(patch.review.rejected);
}

export async function getPatchViewersWithAvatars(patch: Patch) {
	return await getUsersWithAvatars(patch.review.viewed);
}

export async function getPatchViewersAllWithAvatars(patch: Patch) {
	return await getUsersWithAvatars(patch.reviewAll.viewed);
}

export type LoadablePatch = LoadableData<Patch, Patch['changeId']>;

export function apiToPatch(api: ApiPatch): Patch {
	return {
		changeId: api.change_id,
		commitSha: api.commit_sha,
		title: api.title,
		description: api.description,
		position: api.position,
		version: api.version,
		contributors: api.contributors,
		statistics: apiToPatchStatistics(api.statistics),
		review: apiToPatchReview(api.review),
		reviewAll: apiToPatchReview(api.review_all),
		sectionIds: api.sections?.map((section) => section.id),
		createdAt: api.created_at,
		updatedAt: api.updated_at
	};
}

export enum BranchStatus {
	Active = 'active',
	Inactive = 'inactive',
	Closed = 'closed',
	Loading = 'loading',
	All = 'all',
	Previous = 'previous'
}

export type ApiBranch = {
	branch_id: string;
	oplog_sha?: string;
	uuid: string;
	title?: string;
	description?: string;
	status?: BranchStatus;
	version?: number;
	created_at: string;
	updated_at: string;
	stack_size?: number;
	contributors: string[];
	patches: ApiPatch[];
	repository_id: string;
	branch_stack_id?: string;
	branch_stack_order?: number;
	permissions: ApiPermissions;
	owner_login?: string;
};

export type Branch = {
	branchId: string;
	oplogSha?: string;
	uuid: string;
	title?: string;
	description?: string;
	status?: BranchStatus;
	version?: number;
	createdAt: string;
	updatedAt: string;
	stackSize?: number;
	contributors: string[];
	patchIds: string[];
	patches: Patch[];
	repositoryId: string;
	stackId: string;
	stackOrder: number;
	permissions: Permissions;
};

export type LoadableBranch = LoadableData<Branch, Branch['uuid']>;

export function apiToBranch(api: ApiBranch): Branch {
	return {
		branchId: api.branch_id,
		oplogSha: api.oplog_sha,
		uuid: api.uuid,
		title: api.title,
		description: api.description,
		status: api.status,
		version: api.version,
		createdAt: api.created_at,
		updatedAt: api.updated_at,
		stackSize: api.stack_size,
		contributors: api.contributors,
		patchIds: api.patches.map((patch) => patch.change_id),
		patches: api.patches.map(apiToPatch),
		repositoryId: api.repository_id,
		// Its good enough
		stackId: api.branch_stack_id || String(Math.random()),
		stackOrder: api.branch_stack_order || 1,
		permissions: apiToPermissions(api.permissions)
	};
}

export type LoadableBranchUuid = LoadableData<string, string>;
export type LoadableBranchReviewListing = LoadableData<string[], string>;

export function toCombineSlug(ownerSlug: string, projectSlug: string) {
	return `${ownerSlug}/${projectSlug}`;
}

type ApiPatchEventBase = {
	uuid: string;
	user: ApiUserSimple | null;
	event_type: string;
	data: unknown;
	object: unknown;
};

function isApiPatchEventBase(data: unknown): data is ApiPatchEventBase {
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof (data as any).uuid === 'string' &&
		typeof (data as any).event_type === 'string' &&
		(isApiUserSimple((data as any).user) || (data as any).user === null)
	);
}

export type ApiChatEvent = ApiPatchEventBase & {
	event_type: 'chat';
	object: ApiChatMessage | null;
};

export function isApiChatEvent(data: unknown): data is ApiChatEvent {
	return isApiPatchEventBase(data) && (data as any).event_type === 'chat';
}

export type ApiPatchUpdateEvent = ApiPatchEventBase & {
	event_type: 'patch_version' | 'patch_status';
	object: ApiPatch;
};

export function isApiPatchUpdateEvent(data: unknown): data is ApiPatchUpdateEvent {
	return isApiPatchEventBase(data) && (data as any).event_type !== 'chat';
}

export type ApiIssueUpdate = {
	uuid: string;
	user: ApiUserSimple | null;
	outdated: boolean;
	issue: boolean;
	resolved: boolean;
	thread_id: string | null;
	comment: string;
	diffSha: string | null;
	range: string | null;
	diff_path: string | null;
	diff_patch_array: string[] | null;
	created_at: string;
	updated_at: string;
};

export type ApiIssueUpdateEvent = ApiPatchEventBase & {
	event_type: 'issue_status';
	object: ApiIssueUpdate;
};

export function isApiIssueUpdateEvent(data: unknown): data is ApiIssueUpdateEvent {
	return isApiPatchEventBase(data) && (data as any).event_type === 'issue_status';
}

export type ApiPatchEvent = ApiChatEvent | ApiPatchUpdateEvent | ApiIssueUpdateEvent;

export function isApiPatchEvent(data: unknown): data is ApiPatchEvent {
	return isApiChatEvent(data) || isApiPatchUpdateEvent(data) || isApiIssueUpdateEvent(data);
}

type PatchEventBase = {
	uuid: string;
	user: UserSimple | undefined;
	eventType: string;
	data: unknown;
	object: unknown;
};

export type ChatEvent = PatchEventBase & {
	eventType: 'chat';
	object: ChatMessage | undefined;
};

export type PatchUpdateEvent = PatchEventBase & {
	eventType: 'patch_version' | 'patch_status';
	object: Patch;
};

export type IssueUpdate = {
	uuid: string;
	user: UserSimple | undefined;
	outdated: boolean;
	issue: boolean;
	resolved: boolean;
	threadId: string | undefined;
	comment: string;
	diffSha: string | undefined;
	range: string | undefined;
	diffPath: string | undefined;
	diffPatchArray: string[] | undefined;
	createdAt: string;
	updatedAt: string;
};

export function apiToIssueUpdate(api: ApiIssueUpdate): IssueUpdate {
	return {
		uuid: api.uuid,
		user: api.user ? apiToUserSimple(api.user) : undefined,
		outdated: api.outdated,
		issue: api.issue,
		resolved: api.resolved,
		threadId: api.thread_id ?? undefined,
		comment: api.comment,
		diffSha: api.diffSha ?? undefined,
		range: api.range ?? undefined,
		diffPath: api.diff_path ?? undefined,
		diffPatchArray: api.diff_patch_array ?? undefined,
		createdAt: api.created_at,
		updatedAt: api.updated_at
	};
}

export type IssueUpdateEvent = PatchEventBase & {
	eventType: 'issue_status';
	object: IssueUpdate;
};

export type PatchEvent = ChatEvent | PatchUpdateEvent | IssueUpdateEvent;

export function apiToPatchEvent(api: ApiPatchEvent): PatchEvent {
	switch (api.event_type) {
		case 'chat':
			return {
				eventType: api.event_type,
				uuid: api.uuid,
				user: api.user ? apiToUserSimple(api.user) : undefined,
				data: api.data,
				object: api.object ? apiToChatMessage(api.object) : undefined
			};
		case 'patch_version':
		case 'patch_status':
			return {
				eventType: api.event_type,
				uuid: api.uuid,
				user: api.user ? apiToUserSimple(api.user) : undefined,
				data: api.data,
				object: apiToPatch(api.object)
			};
		case 'issue_status':
			return {
				eventType: api.event_type,
				uuid: api.uuid,
				user: api.user ? apiToUserSimple(api.user) : undefined,
				data: api.data,
				object: apiToIssueUpdate(api.object)
			};
	}
}

type PatchEventChannelId = BrandedId<'PatchEventChannelId'>;

export type PatchEventChannel = {
	/**
	 * The unique identifier of the patch event channel.
	 *
	 * Built from the project ID and the change ID.
	 */
	id: PatchEventChannelId;
	projectId: string;
	changeId: string;
	events: PatchEvent[];
};

export function createPatchEventChannelKey(
	projectId: string,
	changeId: string
): PatchEventChannelId {
	return `${projectId}:${changeId}` as PatchEventChannelId;
}

export type LoadablePatchEventChannel = LoadableData<PatchEventChannel, PatchEventChannel['id']>;
