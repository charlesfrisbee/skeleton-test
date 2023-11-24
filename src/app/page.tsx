import AsyncComponent from "@/components/AsyncComponent";
import SkeletonWrapper from "@/components/SkeletonWrapper";

export default async function Home() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  return (
    <main className="flex flex-col h-screen  items-center justify-center">
      <SkeletonWrapper>
        <AsyncComponent pokemonName={pokemon.name} />
      </SkeletonWrapper>
    </main>
  );
}
