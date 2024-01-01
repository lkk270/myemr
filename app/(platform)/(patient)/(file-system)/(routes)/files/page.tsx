// import { auth, redirectToSignIn } from "@clerk/nextjs";
import { Sidebar } from "../../_components/sidebar";
import prismadb from "@/lib/prismadb";

import { decryptKey, decryptMultiplePatientFields } from "@/lib/encryption";

const dummyData = [
  {
    id: "folder1",
    userId: "user1",
    patientProfileId: "patient1",
    title: "Folder 1",
    path: "root/Folder 1",
    level: 0,
    files: [
      {
        id: "file1",
        level: 1,
        userId: "user1",
        patientProfileId: "patient1",
        title: "File 1",
        description: "Description of File 1",
        folderId: "folder1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    parentId: null,
    children: [
      {
        id: "folder1-1",
        level: 1,
        userId: "user1",
        patientProfileId: "patient1",
        title: "Subfolder 1-1",
        path: "root/Folder 1/Subfolder 1-1",
        files: [
          {
            id: "file1-1",
            level: 2,
            userId: "user1",
            patientProfileId: "patient1",
            title: "File 1-1",
            description: "Description of File 1-1",
            folderId: "folder1-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        parentId: "folder1",
        children: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "folder2",
    level: 0,
    userId: "user2",
    patientProfileId: "patient2",
    title: "Folder 2",
    path: "root/Folder 2",
    files: [],
    parentId: null,
    children: [
      {
        id: "folder2-1",
        level: 1,
        userId: "user2",
        patientProfileId: "patient2",
        title: "Subfolder 2-1",
        path: "root/Folder 2/Subfolder 2-1",
        files: [
          {
            id: "file2-1",
            level: 2,
            userId: "user2",
            patientProfileId: "patient2",
            title: "File 2-1",
            description: "Description of File 2-1",
            folderId: "folder2-1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        parentId: "folder2",
        children: [],
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const FileSystem = async () => {
  // const { userId } = auth();

  // if (!userId) {
  //   return redirectToSignIn;
  // }
  // const patientMedications = await prismadb.patientProfile.findUnique({
  //   where: {
  //     userId: userId,
  //   },
  //   select: {
  //     medications: {
  //       include: {
  //         dosageHistory: true,
  //       },
  //     },
  //     symmetricKey: true,
  //   },
  // });

  // if (!patientMedications) {
  //   return <div>something went wrong</div>;
  // }
  // let decryptedPatientMedications;

  // try {
  //   const decryptedSymmetricKey = decryptKey(patientMedications.symmetricKey, "patientSymmetricKey");
  //   decryptedPatientMedications = decryptMultiplePatientFields(patientMedications.medications, decryptedSymmetricKey);
  // } catch (e) {
  //   console.log(e);
  //   return <div>something went wrong</div>;
  // }

  return <div className="flex-1">Hello</div>;
};

export default FileSystem;
