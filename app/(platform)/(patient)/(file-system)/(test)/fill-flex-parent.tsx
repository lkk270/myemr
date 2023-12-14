"use client";

import React, { ReactElement } from "react";
import mergeRefs from "./merge-refs";
import useResizeObserver from "use-resize-observer";

type Props = {
  realWidth: number;
  height: number;
  children: (dimens: { width: number; height: number }) => ReactElement;
};

export const FillFlexParent = React.forwardRef(function FillFlexParent(props: Props, forwardRef) {
  const { ref, width, height } = useResizeObserver();

  // Use the realWidth from the props instead of the observed width.
  const effectiveWidth = props.realWidth;

  return (
    <div className="flex-1 w-full h-full min-h-[0px] min-w-[0px]" ref={mergeRefs(ref, forwardRef)}>
      {/* Use the effectiveWidth for the width */}
      {props.children({ width: effectiveWidth, height: props.height })}
    </div>
  );
});
