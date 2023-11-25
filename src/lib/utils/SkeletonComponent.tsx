import React from "react";

const SkeletonComponent = () => {
  return (
    <div className="flex flex-col border items-center w-32 p-4 gap-4">
      <div className="border rounded-full  w-16 h-16 bg-gray-300 animate-pulse"></div>
      <div className="capitalize w-10 h-6 text-xl  bg-gray-300 animate-pulse"></div>
    </div>
  );
};

export default SkeletonComponent;
