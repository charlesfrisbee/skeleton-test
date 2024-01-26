type AsyncComponentProps = {
  pokemonName: string;
};
function FetchComponent() {
  return <div className="flex flex-col border items-center w-64 p-4 gap-4">
      <img className="border rounded-full  w-16 h-16" />
      <p className="capitalize w-10 h-6 text-xl "></p>
      <img className="border rounded-full  w-16 h-16" />
      <p className="capitalize w-10 h-6 text-xl "></p>
      <img className="border rounded-full  w-16 h-16" />
      <span>
        <div>
      <div className="text-red-200 bg-blue subimage">
      <span>
      <img className="border rounded-full w-14 h-14" />
    </span>
    </div>
    </div>
      </span>
      <p className="capitalize w-10 h-6 text-xl "></p>
    </div>;
}
export default FetchComponent;