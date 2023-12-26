import React from "react";
import SubSubImageComponent from "./sub/SubSubImageComponent";

type ImageProps = {
  src: string;
};

const SubImageComponent = ({ src }: ImageProps) => {
  return (
    <div className="text-red-200 bg-blue subimage">
      <SubSubImageComponent src={src} />
    </div>
  );
};

export default SubImageComponent;
