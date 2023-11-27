import React from "react";

const SkeletonComponent = () => {
  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4 bg-gray-300 animate-pulse">
      <img className="border rounded-full  w-16 h-16 bg-gray-300 animate-pulse"></img>
      <p className="capitalize w-10 h-6 text-xl  bg-gray-300 animate-pulse"></p>
      <img className="border rounded-full  w-16 h-16 bg-gray-300 animate-pulse"></img>
      <img className="border rounded-full w-14 h-14 bg-gray-300 animate-pulse"></img>
      <p className="capitalize w-10 h-6 text-xl  bg-gray-300 animate-pulse"></p>
    </div>
  );
};

export default SkeletonComponent;
