import UsersHeader from "./header/header";
import UsersToolbar from "./toolbar/toolbar";
import UsersTable from "./table/users-table";

export default function Users() {
  return (
    <section id="users" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <UsersHeader />
      <UsersToolbar />
      <UsersTable />
    </section>
  );
}
