import AsyncComponent from "@/components/AsyncComponent";
import FetchComponent from "@/components/FetchComponent";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import SkeletonComponent from "@/components/SkeletonComponent";
import { Suspense } from "react";
import FetchComponent2 from "@/components/FetchComponent2";

export default async function Home() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  return (
    <main className="flex flex-col h-screen  items-center justify-center">
      <Suspense fallback={<SkeletonComponent />}>
        <FetchComponent />
      </Suspense>
    </main>
  );
}
