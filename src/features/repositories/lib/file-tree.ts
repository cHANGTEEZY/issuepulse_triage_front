import type { RepositoryTreeEntry } from "@/api/repositories";

export type FileTreeNode = {
  id: string;
  label: string;
  path: string;
  kind: RepositoryTreeEntry["type"];
  size: number;
  children?: FileTreeNode[];
};

function directory(
  path: string,
  dirs: Map<string, FileTreeNode>,
  root: FileTreeNode[],
) {
  const existing = dirs.get(path);
  if (existing) return existing;

  const node: FileTreeNode = {
    id: path,
    label: path.split("/").pop() ?? path,
    path,
    kind: "dir",
    size: 0,
    children: [],
  };
  dirs.set(path, node);

  const slash = path.lastIndexOf("/");
  if (slash === -1) root.push(node);
  else directory(path.slice(0, slash), dirs, root).children?.push(node);
  return node;
}

function byName(a: FileTreeNode, b: FileTreeNode) {
  if (a.kind === "dir" && b.kind !== "dir") return -1;
  if (a.kind !== "dir" && b.kind === "dir") return 1;
  return a.label.localeCompare(b.label, undefined, { numeric: true });
}

function sortNodes(nodes: FileTreeNode[]) {
  nodes.sort(byName);
  for (const node of nodes) {
    if (node.children) sortNodes(node.children);
  }
}

export function fileTree(entries: RepositoryTreeEntry[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const dirs = new Map<string, FileTreeNode>();

  for (const entry of entries) {
    if (entry.type === "dir") {
      directory(entry.path, dirs, root);
      continue;
    }
    const node: FileTreeNode = {
      id: entry.path,
      label: entry.path.split("/").pop() ?? entry.path,
      path: entry.path,
      kind: entry.type,
      size: entry.size,
    };
    const slash = entry.path.lastIndexOf("/");
    if (slash === -1) root.push(node);
    else directory(entry.path.slice(0, slash), dirs, root).children?.push(node);
  }

  sortNodes(root);
  return root;
}

export function expandedFolderIds(file: string | undefined, folder: string) {
  const ids = new Set<string>();

  function add(path: string, includeLast: boolean) {
    const parts = path.split("/").filter(Boolean);
    const count = includeLast ? parts.length : parts.length - 1;
    for (let index = 0; index < count; index += 1) {
      ids.add(parts.slice(0, index + 1).join("/"));
    }
  }

  if (file) add(file, false);
  if (folder) add(folder, true);
  return [...ids];
}
