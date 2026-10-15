import IssueDetail from "@/features/issues/components/issue-detail";

export default function IssueDetailPage({ issueId }: { issueId: string }) {
  return <IssueDetail issueId={issueId} />;
}
