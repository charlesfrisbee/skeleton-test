import React from "react";

type ImageProps = {
  src: string;
};

const SubSubImageComponent = ({ src }: ImageProps) => {
  return (
    <span>
      <img src={src} className="border rounded-full w-14 h-14" />;
    </span>
  );
};

export default SubSubImageComponent;
