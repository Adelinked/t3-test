import { SignInButton, useUser } from "@clerk/nextjs";

import { type NextPage } from "next";

import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput(""), void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post please try again later!");
      }
    },
  });

  const ctx = api.useContext();

  if (!user || !user.username) return null;

  //console.log(user);
  return (
    <div className="flex w-full  items-center gap-3 ">
      <Image
        src={user.profileImageUrl}
        alt={`${user.username}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />{" "}
      <input
        className="grow bg-transparent outline-none"
        placeholder="type some emojis!"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input.length > 0 ? (
        <button
          onClick={() => mutate({ content: input })}
          className="flex h-12 w-16 items-center justify-center rounded bg-slate-700 "
          disabled={isPosting}
        >
          {!isPosting ? "Post" : <LoadingSpinner size={22} />}
        </button>
      ) : null}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!data) <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
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
    <PageLayout>
      <div className=" flex border-b border-slate-400 p-4">
        <div className="flex w-full justify-center">
          {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
        </div>
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
