import SummaryInfo from "./SummaryInfo";

export default function SummaryInfoMain({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <div>
      <SummaryInfo id={params.slug} />
    </div>
  );
}
