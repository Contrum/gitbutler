<script lang="ts">
	import { getColorFromBranchType, isUpstreamCommit } from '$components/v3/lib';
	import Tooltip from '@gitbutler/ui/Tooltip.svelte';
	import { camelCaseToTitleCase } from '@gitbutler/ui/utils/string';
	import type { Commit, UpstreamCommit } from '$lib/branches/v3';

	interface Props {
		commit: Commit | UpstreamCommit;
		last?: boolean;
		lastBranch?: boolean;
	}

	const { commit, last, lastBranch }: Props = $props();

	const lineColor = $derived(
		isUpstreamCommit(commit)
			? 'var(--clr-commit-upstream)'
			: getColorFromBranchType(commit.state?.type ?? 'LocalOnly')
	);
	const dotRhombus = $derived(!isUpstreamCommit(commit) && commit.state.type === 'LocalAndRemote');

	const tooltipText = $derived(
		isUpstreamCommit(commit) ? 'Upstream' : camelCaseToTitleCase(commit.state.type)
	);
</script>

<div class="commit-lines" style:--commit-color={lineColor}>
	<div class="commit-line__top"></div>
	<Tooltip text={tooltipText}>
		<div class="commit-line__center" class:rhombus={dotRhombus}></div>
	</Tooltip>
	<div class="commit-line__bottom" class:dashed={last && lastBranch}></div>
</div>

<style>
	.commit-lines {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 16px;
		gap: 3px;
	}

	.commit-line__top,
	.commit-line__bottom {
		height: 15px;
		width: 2px;
		background-color: var(--commit-color);

		&.dashed {
			background: linear-gradient(to bottom, var(--commit-color) 50%, transparent 50%);
			background-size: 4px 4px;
		}
	}

	.commit-line__center {
		border-radius: 100%;
		width: 10px;
		height: 10px;
		background-color: var(--commit-color);

		&.rhombus {
			width: 9px;
			height: 9px;
			border-radius: 2px;
			transform: translateX(0.5px) rotate(45deg);
		}
	}
</style>
