type AsyncComponentProps = {
  pokemonName: string;
};
const FetchComponent = () => {
  return <div className="flex flex-col border items-center justify-center w-64 p-4 gap-4">
      <div>
      <div className="text-red-200 bg-blue">
      <div>
      <img className="border rounded-full w-16 h-16 animate-pulse rounded-md bg-gray-300" />
    </div>
    </div>
      <p className="w-full animate-pulse rounded-md bg-gray-300"></p>
    </div>
      <img className="border rounded-full  w-16 h-16 animate-pulse rounded-md bg-gray-300" />
      <p className="capitalize w-full text-center  text-xl  animate-pulse rounded-md bg-gray-300">&nbsp;</p>
      <img className="border rounded-full  w-16 h-16 animate-pulse rounded-md bg-gray-300" />
      <p className="capitalize w-full text-center  text-xl  animate-pulse rounded-md bg-gray-300">&nbsp;</p>
      <img className="border rounded-full  w-16 h-16 animate-pulse rounded-md bg-gray-300" />
      <img className="border rounded-full  w-16 h-16 animate-pulse rounded-md bg-gray-300" />
      <div>
        <div>
      <div className="text-red-200 bg-blue">
      <div>
      <img className="border rounded-full w-16 h-16 animate-pulse rounded-md bg-gray-300" />
    </div>
    </div>
      <p className="w-full animate-pulse rounded-md bg-gray-300"></p>
    </div>
      </div>
      <ul className="flex flex-col gap-8 w-full">
        <li className="w-full">
          <p className="capitalize w-full text-center  text-xl  animate-pulse rounded-md bg-gray-300">
            &nbsp;
          </p>
        </li>
        <li>
          <p className="capitalize w-full text-center  text-xl  animate-pulse rounded-md bg-gray-300">
            &nbsp;
          </p>
        </li>
      </ul>
      <p className="capitalize w-full text-center  text-xl  animate-pulse rounded-md bg-gray-300">&nbsp;</p>
    </div>;
};
export default FetchComponent;