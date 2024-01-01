// import { auth, redirectToSignIn } from "@clerk/nextjs";

import { CitiesTree } from "../../(file-system)/(test)/cities-tree";
const DndTest = async () => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }

  return (
    <div className="flex sm:px-10 h-full justify-center">
      <CitiesTree />
    </div>
  );
};

export default DndTest;
