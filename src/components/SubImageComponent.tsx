import React from "react";

type ImageProps = {
  src: string;
};

const SubImageComponent = ({ src }: ImageProps) => {
  return <img src={src} className="border rounded-full w-14 h-14" />;
};

export default SubImageComponent;
