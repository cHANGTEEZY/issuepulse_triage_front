import RepositoryDetail, {
  type RepositoryTab,
} from "@/features/repositories/components/detail/repository-detail";

type RepositoryDetailPageProps = {
  repositoryId: string;
  tab: RepositoryTab;
  path: string;
  onTabChange: (tab: RepositoryTab) => void;
  onPathChange: (path: string) => void;
};

export default function RepositoryDetailPage(props: RepositoryDetailPageProps) {
  return <RepositoryDetail {...props} />;
}
