/**
 * Virtual Branch feature package (experiment)
 *
 * There are three interesting data types coming from the rust IPC api:
 *  - Branch, representing a virtual branch
 *  - BranchData, representing a remote branch
 *  - BaseBranch, representing a target base remote branch
 *
 * The three types are obtained as reactive stores from the BranchStoresCache's methods:
 *  - getVirtualBranchStore - List of Branch (virtual branches)
 *  - getRemoteBranchStore - List of BranchData (remote branches)
 *  - getBaseBranchStore - BaseBranch (single target branch)
 *
 * BranchController is a class where all virtual branch operations are performed
 * This class gets the three stores injected at construction so that any related updates can be peformed
 *
 * Note to self:
 *
 *  - Create the BranchStoresCacheat the top level (where projects are listed),
 *    so that it can take advantage of caching, making project navigation quicker.
 *  - Create the BranchController at the level of a specific project and inject it to components that need it.
 */
export { Branch, File, Hunk, Commit, BranchData, BaseBranch } from './types';
export { BranchStoresCache } from './branchStoresCache';
export { BranchController } from './branchController';
