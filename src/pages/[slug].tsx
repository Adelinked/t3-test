import { type InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { type GetServerSidePropsContext } from "next";

import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data || data.length == 0) return <div>User has not posted yet</div>;
  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}{" "}
    </div>
  );
};

const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUserName.useQuery({
    username: username,
  });
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
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps = async (context: GetServerSidePropsContext) => {
  const ssg = generateSSGHelper();
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
