import RepositoryDetail, {
  type RepositorySearch,
} from "@/features/repositories/components/detail/repository-detail";

type RepositoryDetailPageProps = {
  repositoryId: string;
  search: RepositorySearch;
  onSearchChange: (search: RepositorySearch) => void;
};

export default function RepositoryDetailPage(props: RepositoryDetailPageProps) {
  return <RepositoryDetail {...props} />;
}
