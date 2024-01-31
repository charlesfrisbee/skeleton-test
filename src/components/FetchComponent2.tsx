import ImageComponent from "./ImageComponent";

type AsyncComponentProps = {
  pokemonName: string;
};

async function FetchComponent2() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  // take one second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="flex flex-col border items-center justify-center w-64 p-4 gap-4">
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-md w-full aspect-square"
      />
      <p className="capitalize w-full text-center  text-xl ">{pokemon.name}</p>
    </div>
  );
}

export default FetchComponent2;
