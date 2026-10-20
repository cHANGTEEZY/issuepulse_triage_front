import { useState } from "react";
import { Drawer } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/_common/hairline-figure";
import { useRepositoryTree } from "@/api/hooks/use-repositories";
import Button from "@/components/_ui/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { TreeView, type TreeNode } from "@/components/arc/tree-view/tree-view";
import { cn } from "@/lib/utils";
import {
  expandedFolderIds,
  fileTree,
  type FileTreeNode,
} from "@/features/repositories/lib/file-tree";
import DetailState from "./detail-state";
import FileView from "./file-view";

type FilesSectionProps = {
  repositoryId: string;
  defaultBranch: string;
  folder: string;
  file: string | undefined;
  branch: string | undefined;
  isNew: boolean;
  htmlUrl: string | undefined;
  onOpenFile: (path: string) => void;
  onNewFile: (folder: string) => void;
  onClose: () => void;
  onRefChange: (ref: string) => void;
  onOpened: (path: string, ref: string) => void;
  onComposePull: (head: string, base: string) => void;
};

export default function FilesSection({
  repositoryId,
  defaultBranch,
  folder,
  file,
  branch,
  isNew,
  htmlUrl,
  onOpenFile,
  onNewFile,
  onClose,
  onRefChange,
  onOpened,
  onComposePull,
}: FilesSectionProps) {
  const treeRef = branch ?? defaultBranch;
  const tree = useRepositoryTree(repositoryId, branch ?? "");
  const [pickedFolder, setPickedFolder] = useState<string | null>(null);
  const viewing = Boolean(file) || isNew;
  const createIn = pickedFolder ?? folder;
  const nodes = fileTree(tree.data?.entries ?? []);
  const expanded = expandedFolderIds(file, folder);

  function select(node: TreeNode) {
    const item = node as FileTreeNode;
    if (item.kind === "dir") {
      setPickedFolder(item.path);
      return;
    }
    if (item.kind === "submodule") {
      if (!htmlUrl) return;
      const encoded = item.path.split("/").map(encodeURIComponent).join("/");
      window.open(
        `${htmlUrl}/tree/${encodeURIComponent(treeRef)}/${encoded}`,
        "_blank",
        "noopener",
      );
      return;
    }
    setPickedFolder(item.path.split("/").slice(0, -1).join("/"));
    onOpenFile(item.path);
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-3 lg:sticky lg:top-0 lg:w-[22em]",
          viewing && "max-lg:hidden",
        )}
      >
        {!viewing && (
          <div className="flex lg:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNewFile(createIn)}
            >
              New file
            </Button>
          </div>
        )}
        <DetailState
          isPending={tree.isPending}
          isError={tree.isError}
          error={tree.error}
          fallback="Could not load files."
          pendingLabel="Loading files…"
        >
          {nodes.length === 0 ? (
            <EmptyState
              illustration={<HairlineFigure figure={Drawer} />}
              title="This repository is empty"
              description="There are no files on the default branch yet."
            />
          ) : (
            <>
              <div className="lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto">
                <TreeView
                  key={treeRef}
                  nodes={nodes}
                  defaultExpandedIds={expanded}
                  onSelect={select}
                  aria-label="Repository files"
                />
              </div>
              {tree.data?.truncated && (
                <p className="caption-style text-subtle px-1">
                  GitHub returned part of this tree. Some files are not listed.
                </p>
              )}
            </>
          )}
        </DetailState>
      </div>

      <div className={cn("min-w-0 flex-1", !viewing && "max-lg:hidden")}>
        {viewing ? (
          <FileView
            key={isNew ? `new-${createIn}` : file}
            repositoryId={repositoryId}
            defaultBranch={defaultBranch}
            path={file ?? ""}
            folder={isNew ? createIn : folder}
            branch={branch}
            isNew={isNew}
            onRefChange={onRefChange}
            onClose={onClose}
            onOpened={onOpened}
            onComposePull={onComposePull}
            onNewFile={() => onNewFile(createIn)}
          />
        ) : (
          <div className="flex flex-col items-start gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNewFile(createIn)}
            >
              New file
            </Button>
            <p className="text-subtle">Select a file to read or edit it.</p>
          </div>
        )}
      </div>
    </div>
  );
}
