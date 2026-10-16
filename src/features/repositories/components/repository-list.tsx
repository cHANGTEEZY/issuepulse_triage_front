import { useState } from "react";
import PageHeader from "@/components/_common/page-header";
import Button from "@/components/_ui/button";
import DataTableSearch from "@/components/_ui/data-table/data-table-search";
import { isApiError } from "@/lib/apiClient";
import {
  useInstallUrl,
  useRepositoryCatalog,
  useSyncRepository,
} from "@/api/hooks/use-repositories";
import RepositoryTable from "@/features/repositories/components/table/repository-table";

function errorMessage(error: unknown, fallback: string) {
  if (isApiError(error)) return error.message;
  return fallback;
}

export default function RepositoryList() {
  const repositories = useRepositoryCatalog();
  const sync = useSyncRepository();
  const install = useInstallUrl();
  const [query, setQuery] = useState("");
  const rows = repositories.data ?? [];
  const connected = rows.length > 0;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? rows.filter((repository) =>
        `${repository.owner}/${repository.name}`.toLowerCase().includes(needle),
      )
    : rows;

  async function connect() {
    const url = await install.mutateAsync();
    window.location.assign(url);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col">
      <PageHeader
        title="Repositories"
        description="Repositories on the GitHub App installation. Sync one to pull its issues."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" href="/">
              Issues
            </Button>
            {!connected && (
              <Button
                variant="primary"
                size="md"
                onClick={() => void connect()}
                disabled={install.isPending || repositories.isPending}
              >
                {install.isPending ? "Opening GitHub…" : "Connect repository"}
              </Button>
            )}
          </div>
        }
      />

      {connected && (
        <div className="border-border flex items-center border-b px-4 py-3">
          <DataTableSearch
            value={query}
            onValueChange={setQuery}
            placeholder="Search repositories"
            aria-label="Search repositories"
          />
        </div>
      )}

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
      {repositories.refreshError && !connected && (
        <p className="text-destructive px-4 py-3">
          {errorMessage(repositories.refreshError, "Could not refresh repositories from GitHub.")}
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
      {!repositories.isPending && !connected && (
        <p className="text-subtle px-4 py-6">
          No repositories yet. Connect the GitHub App to add one.
        </p>
      )}
      {connected && (
        <RepositoryTable
          rows={visible}
          syncingId={sync.isPending && sync.variables ? sync.variables : null}
          onSync={(id) => sync.mutate(id)}
        />
      )}
    </section>
  );
}
