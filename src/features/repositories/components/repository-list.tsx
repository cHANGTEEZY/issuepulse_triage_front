import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_ui/table";
import { isApiError } from "@/lib/apiClient";
import {
  useInstallUrl,
  useRepositories,
  useSyncRepository,
} from "@/api/hooks/use-repositories";
import { formatWhen } from "@/features/issues/lib/triage";

function errorMessage(error: unknown, fallback: string) {
  if (isApiError(error)) return error.message;
  return fallback;
}

export default function RepositoryList() {
  const repositories = useRepositories();
  const sync = useSyncRepository();
  const install = useInstallUrl();

  async function connect() {
    const url = await install.mutateAsync();
    window.location.assign(url);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Repositories"
        description="Install the GitHub App, then sync issues into triage."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" href="/">
              Issues
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => void connect()}
              disabled={install.isPending}
            >
              {install.isPending ? "Opening GitHub…" : "Connect repository"}
            </Button>
          </div>
        }
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {install.isError && (
          <p className="text-destructive px-4 py-3">
            {errorMessage(install.error, "Could not open the GitHub install page.")}
          </p>
        )}
        {sync.isError && (
          <p className="text-destructive px-4 py-3">
            {errorMessage(sync.error, "Sync failed.")}
          </p>
        )}
        {repositories.isPending && (
          <p className="text-subtle px-4 py-6">Loading repositories…</p>
        )}
        {repositories.isError && (
          <p className="text-destructive px-4 py-6">
            {errorMessage(repositories.error, "Could not load repositories.")}
          </p>
        )}
        {repositories.isSuccess && repositories.data.length === 0 && (
          <p className="text-subtle px-4 py-6">
            No repositories yet. Connect the GitHub App to add one.
          </p>
        )}
        {repositories.isSuccess && repositories.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Last sync</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.data.map((repository) => (
                <TableRow key={repository.id}>
                  <TableCell>
                    {repository.owner}/{repository.name}
                  </TableCell>
                  <TableCell>{formatWhen(repository.lastSyncedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="md"
                      disabled={sync.isPending && sync.variables === repository.id}
                      onClick={() => sync.mutate(repository.id)}
                    >
                      {sync.isPending && sync.variables === repository.id
                        ? "Syncing…"
                        : "Sync now"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
