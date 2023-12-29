"use client";

import { PuffLoader } from "react-spinners";

const Loader = () => {
  return (
    <div
      className="
        flex
        justify-center
        items-center
        h-screen // This sets the height to the full viewport height
      "
    >
      <PuffLoader size={25} color="#8d4fff" />
    </div>
  );
};

export default Loader;
