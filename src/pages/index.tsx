import { SignInButton, useUser } from "@clerk/nextjs";

import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
dayjs.extend(relativeTime);
const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  console.log(user);
  return (
    <div className="flex w-full gap-3 ">
      <Image
        src={user.profileImageUrl}
        alt={`${user?.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />{" "}
      <input
        className="grow bg-transparent outline-none"
        placeholder="type some emojis!"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4" key={post.id}>
      <Image
        src={author.profileImageUrl}
        alt={`@${author?.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col font-bold">
        <div>
          <span className="text-slate-300">{`@${author?.username}`}</span>
        </div>
        <div>
          <span>{post.content}</span>{" "}
          <span className="font-thin">{`· ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!data) <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {[...data, ...data]?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  //const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) return <div />;
  api.posts.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className=" flex border-b border-slate-400 p-4">
            <div className="flex w-full justify-center">
              {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
