type AsyncComponentProps = {
  pokemonName: string;
};
function FetchComponent() {
  return <div className="flex flex-col border items-center justify-center w-64 p-4 gap-4">
      <img className="border rounded-full  w-16 h-16" />
      <p className="capitalize w-1/2 text-center text-xl ">&nbsp;</p>
      <img className="border rounded-full  w-16 h-16" />
      <p className="capitalize w-10  text-xl ">&nbsp;</p>
      <img className="border rounded-full  w-16 h-16" />
      <div>
        <div>
      <div className="text-red-200 bg-blue">
      <div>
      <img className="border rounded-full w-14 h-14" />
    </div>
    </div>
    </div>
      </div>
      <ul>
        <li>
          <p className="capitalize w-10  text-xl ">&nbsp;</p>
        </li>
        <li>
          <p className="capitalize w-10  text-xl ">&nbsp;</p>
        </li>
        <li>
          <p className="capitalize w-10  text-xl ">&nbsp;</p>
        </li>
      </ul>
      <p className="capitalize w-10 text-xl ">&nbsp;</p>
    </div>;
}
export default FetchComponent;