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
    <div className="flex flex-col border items-center justify-center w-64 p-4 gap-4">
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <p className="capitalize w-1/2 text-center text-xl ">{pokemon.name}</p>
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <p className="capitalize w-10  text-xl ">{pokemon.name}</p>
      <img
        src={pokemon.sprites.front_default}
        className="border rounded-full  w-16 h-16"
      />
      <div>
        <ImageComponent src={pokemon.sprites.front_default} />
      </div>
      <ul>
        <li>
          <p className="capitalize w-10  text-xl ">{pokemon.name}</p>
        </li>
        <li>
          <p className="capitalize w-10  text-xl ">{pokemon.name}</p>
        </li>
        <li>
          <p className="capitalize w-10  text-xl ">{pokemon.name}</p>
        </li>
      </ul>
      <p className="capitalize w-10 text-xl ">{pokemon.name}</p>
    </div>
  );
}

export default FetchComponent;
