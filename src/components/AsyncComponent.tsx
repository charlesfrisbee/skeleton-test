import React from "react";
type AsyncComponentProps = {
  pokemonName: string;
};

const AsyncComponent = ({ pokemonName }: AsyncComponentProps) => {
  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4">
      <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png"
        className="border rounded-full  w-10 h-10"
      />
      {/* <div className="h-10 w-10 bg-white"></div> */}
      <p className="capitalize w-10 h-6 text-xl ">{pokemonName}</p>
    </div>
  );
};

export default AsyncComponent;
