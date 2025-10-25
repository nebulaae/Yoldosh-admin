import { UserDetail } from "@/components/pages/admin/UserDetail";

const Page = ({ params }: { params: { userId: string } }) => {
  return (
    <section className="w-full p-8">
      <UserDetail userId={params.userId} />
    </section>
  );
};

export default Page;
