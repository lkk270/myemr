import { auth, redirectToSignIn } from "@clerk/nextjs";

import { CitiesComponent } from "../../(file-system)/(test)/cities";
const DndTest = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn;
  }

  return (
    <div className="flex sm:px-10 h-full justify-center">
      <CitiesComponent />
    </div>
  );
};

export default DndTest;
