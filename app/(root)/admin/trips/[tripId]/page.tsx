import { TripDetails } from "@/components/pages/admin/TripDetails";

const Page = ({ params }: { params: { tripId: string } }) => {
  return <TripDetails tripId={params.tripId} />;
};

export default Page;
