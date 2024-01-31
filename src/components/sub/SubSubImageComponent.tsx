import React from "react";

type ImageProps = {
  src: string;
};

const SubSubImageComponent = ({ src }: ImageProps) => {
  return (
    <div>
      <img src={src} className="border rounded-full w-16 h-16" />
    </div>
  );
};

export default SubSubImageComponent;
