export interface PathInfoArgs {
	ext?: string,
	dir?: string,
	exists?: (path: string) => void,
	not?: (path: string) => void,
	error?: (path: string) => void
}
