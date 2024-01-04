"use client";

import React, { useEffect, useState } from "react";
import Router from "next/router";
import LoadingBar from "react-top-loading-bar";
import { useLoading } from "@/hooks/use-loading";

const LoadingComponent = () => {
  const { isLoading, hideLoading } = useLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(75);
      setTimeout(() => {
        setProgress(100);
        hideLoading();
      }, 500);
    }
  }, [isLoading]);

  return <LoadingBar color="#4f5eff" progress={progress} onLoaderFinished={() => setProgress(0)} />;
};

export default LoadingComponent;
