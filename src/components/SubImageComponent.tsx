import React from "react";
import SubSubImageComponent from "./SubSubImageComponent";

type ImageProps = {
  src: string;
};

const SubImageComponent = ({ src }: ImageProps) => {
  return (
    <div className="text-red-200">
      <SubSubImageComponent src={src} />
    </div>
  );
};

export default SubImageComponent;
