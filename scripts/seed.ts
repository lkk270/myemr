const { PrismaClient } = require("@prisma/client");

const prismadb = new PrismaClient();

async function deleteAllFiles() {
  await prismadb.file.deleteMany({});
  await prismadb.insuranceFile.deleteMany({});
}

async function main() {
  const files = await prismadb.file.findMany({});
  const folders = await prismadb.folder.findMany({});
  console.log(files);
  if (files.length === 0 && folders.length === 0) {
    await createFolder("Root", "/", "/Root", null, "clqvdl88c0004cah8gho5yxe2", "clqvdl88c0003cah8li8dt7fy", 3);
  }
}
async function createFolder(
  name: string,
  path: string,
  namePath: string,
  parentId: string | null,
  patientProfileId: string,
  userId: string,
  depth: number,
) {
  if (depth === 0) return null;

  // Create folder
  const folder = await prismadb.folder.create({
    data: {
      name,
      path,
      namePath,
      parentId,
      patientProfileId,
      userId,
      files: {
        create: [
          {
            name: `File1_in_${name}`,
            path: `${path}$FILL/`,
            namePath: `${namePath}/File1_in_${name}`,
            patientProfileId,
            userId,
          },
          {
            name: `File2_in_${name}`,
            path: `${path}$FILL/`,
            namePath: `${namePath}/File2_in_${name}`,
            patientProfileId,
            userId,
          },
        ],
      },
    },
  });

  // Create subfolders
  await createFolder(
    `Subfolder1_of_${name}`,
    `${path}${folder.id}/`,
    `${namePath}/Subfolder1_of_${name}`,
    folder.id,
    patientProfileId,
    userId,
    depth - 1,
  );
  await createFolder(
    `Subfolder2_of_${name}`,
    `${path}${folder.id}/`,
    `${namePath}/Subfolder2_of_${name}`,
    folder.id,
    patientProfileId,
    userId,
    depth - 1,
  );

  return folder;
}

deleteAllFiles();
