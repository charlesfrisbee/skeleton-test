import AsyncComponent from "@/components/AsyncComponent";
import FetchComponent from "@/components/FetchComponent";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import SkeletonComponent from "@/lib/utils/SkeletonComponent";
import { Suspense } from "react";

export default async function Home() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  return (
    <main className="flex flex-col h-screen  items-center justify-center">
      {/* <SkeletonWrapper>
        <AsyncComponent pokemonName={pokemon.name} />
      </SkeletonWrapper>
      <br /> */}
      <Suspense
        fallback={
          <SkeletonComponent />
          // <div>loading...</div>
          // <SkeletonWrapper>
          //   <FetchComponent />
          // </SkeletonWrapper>
        }
      >
        <FetchComponent />
      </Suspense>
    </main>
  );
}
