"use client";

import React, { Children, ReactNode } from "react";
import { Skeleton } from "./Skeleton";

type SkeletonWrapperProps = {
  children: React.ReactNode;
};

type SkeletonNode = {
  className: string;
  type: "div" | "default"; // 'div' for elements with 'flex', 'default' for others
  children: SkeletonNode[];
};

function extractSkeletonStructure(child: ReactNode): SkeletonNode {
  const element = child as React.ReactElement;
  let node: SkeletonNode = {
    className: element.props?.className || "",
    type: element.props?.className?.includes("flex") ? "div" : "default",
    children: [],
  };

  if (element.props && element.props.children) {
    React.Children.forEach(element.props.children, (nestedChild) => {
      node.children.push(extractSkeletonStructure(nestedChild));
    });
  }

  return node;
}

const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({ children }) => {
  let skeletonStructure: SkeletonNode[] = [];

  React.Children.forEach(children, (child) => {
    skeletonStructure.push(extractSkeletonStructure(child));
  });

  const renderSkeletonNode = (node: SkeletonNode): React.ReactNode => {
    if (node.type === "div") {
      return (
        <div key={node.className} className={node.className}>
          {node.children.map(renderSkeletonNode)}
        </div>
      );
    } else {
      return <Skeleton key={node.className} className={node.className} />;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>{children}</div>
      {skeletonStructure.map(renderSkeletonNode)}
    </div>
  );
};

export default SkeletonWrapper;
