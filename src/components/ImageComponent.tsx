import React from "react";
import SubImageComponent from "./SubImageComponent";

type ImageProps = {
  src: string;
};

const ImageComponent = ({ src }: ImageProps) => {
  return (
    <div>
      <SubImageComponent src={src} />
    </div>
  );
};

export default ImageComponent;
