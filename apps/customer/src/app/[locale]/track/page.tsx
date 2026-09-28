import TrackTransfer from "@/sections/track";

type TrackPageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const { ref } = await searchParams;

  return <TrackTransfer initialReference={ref?.trim() ?? ""} />;
}
