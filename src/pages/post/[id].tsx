import { type InferGetStaticPropsType, type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { type GetServerSidePropsContext } from "next";

import { PageLayout } from "~/components/layout";

import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postView";
type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const SinglePostPage: NextPage<PageProps> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    id,
  });
  if (isLoading) console.log("...is loading");
  if (!data || !data.post.id) return <div>404</div>;
  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

export const getStaticProps = async (context: GetServerSidePropsContext) => {
  const ssg = generateSSGHelper();
  let id = context.params?.id;
  if (typeof id !== "string") throw new Error("No id!");

  id = id.replace("@", "");

  await ssg.posts.getById.prefetch({ id });
  return {
    props: { trpcState: ssg.dehydrate(), id },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
