import React from "react";
import SubImageComponent from "./SubImageComponent";

type ImageProps = {
  src: string;
};

const ImageComponent = ({ src }: ImageProps) => {
  return <SubImageComponent src={src} />;
};

export default ImageComponent;
