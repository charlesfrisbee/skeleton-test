import React from "react";

type ImageProps = {
  src: string;
};

const ImageComponent = ({ src }: ImageProps) => {
  return <img src={src} className="border rounded-full  w-16 h-16" />;
};

export default ImageComponent;
