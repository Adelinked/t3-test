import { type InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetServerSidePropsContext } from "next";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUserName.useQuery({
    username: username,
  });
  console.log(username);
  if (isLoading) console.log("...is loading");
  if (!data || !data.username) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36  bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-16 ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-16" />
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="border-b border-slate-400" />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps = async (context: GetServerSidePropsContext) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("No slug!");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });
  return {
    props: { trpcState: ssg.dehydrate(), username },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
