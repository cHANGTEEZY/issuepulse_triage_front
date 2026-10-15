"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/_ui/checkbox";
import DataTable from "@/components/_ui/data-table/data-table";
import { createDataTableColumnHelper } from "@/components/_ui/data-table/table-features";
import CompanyRow from "./company-row";
import {
  TABLE_COLUMNS,
  TABLE_GRID_CLASS,
  TABLE_ROW_CLASS,
} from "./table-columns";
import { filterCompanies } from "@/features/home/lib/companies";
import type { Company } from "@/features/home/data/companies";
import { useCompaniesStore } from "@/features/home/stores/companies-store";

const columnHelper = createDataTableColumnHelper<Company>();

export default function CompaniesTable() {
  const companies = useCompaniesStore((state) => state.companies);
  const sortBy = useCompaniesStore((state) => state.sortBy);
  const owner = useCompaniesStore((state) => state.owner);
  const stage = useCompaniesStore((state) => state.stage);
  const activityWindow = useCompaniesStore((state) => state.activityWindow);
  const search = useCompaniesStore((state) => state.search);
  const selectedIds = useCompaniesStore((state) => state.selectedIds);
  const detailId = useCompaniesStore((state) => state.detailId);
  const detailOpen = useCompaniesStore((state) => state.detailOpen);
  const toggleSelected = useCompaniesStore((state) => state.toggleSelected);
  const setSelected = useCompaniesStore((state) => state.setSelected);
  const openDetail = useCompaniesStore((state) => state.openDetail);
  const openProfile = useCompaniesStore((state) => state.openProfile);

  const visible = useMemo(
    () =>
      filterCompanies(companies, {
        sortBy,
        owner,
        stage,
        activityWindow,
        search,
      }),
    [companies, sortBy, owner, stage, activityWindow, search],
  );

  const selectedVisible = visible.filter((company) =>
    selectedIds.includes(company.id),
  );
  const allSelected =
    visible.length > 0 && selectedVisible.length === visible.length;
  const someSelected = selectedVisible.length > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? [] : visible.map((company) => company.id));
  }

  const columns = useMemo(
    () =>
      TABLE_COLUMNS.map((column) =>
        columnHelper.display({
          id: column.key,
          header:
            column.key === "name"
              ? () => (
                  <span className="flex items-center gap-5">
                    <Checkbox
                      checked={
                        allSelected
                          ? true
                          : someSelected
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleAll}
                      aria-label="Select all companies"
                    />
                    {column.label}
                  </span>
                )
              : column.label,
          meta: { className: column.className },
        }),
      ),
    [allSelected, someSelected, visible],
  );

  return (
    <DataTable
      columns={columns}
      data={visible}
      getRowId={(company) => company.id}
      tableClassName={TABLE_GRID_CLASS}
      rowClassName={TABLE_ROW_CLASS}
      countLabel="Companies in view"
      empty="No companies match the current filters."
      renderRow={(row) => (
        <CompanyRow
          key={row.id}
          company={row.original}
          selected={selectedIds.includes(row.original.id)}
          active={detailOpen && detailId === row.original.id}
          onToggle={() => toggleSelected(row.original.id)}
          onOpen={() => openDetail(row.original.id)}
          onOpenOwner={() => openProfile(row.original.owner)}
        />
      )}
    />
  );
}
