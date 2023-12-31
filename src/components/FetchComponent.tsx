import ImageComponent from "./ImageComponent";

type AsyncComponentProps = {
  pokemonName: string;
};

async function FetchComponent() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  const pokemon = await res.json();

  // take one second
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4">
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <p className="capitalize w-10 h-6 text-xl ">{pokemon.name}</p>
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <p className="capitalize w-10 h-6 text-xl ">{pokemon.name}</p>
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <span>
        <ImageComponent src={pokemon.sprites.front_default} />
      </span>
      <p className="capitalize w-10 h-6 text-xl ">{pokemon.name}</p>
    </div>
  );
}

export default FetchComponent;
