import { useCallback } from "react";
import { getPresignedUrl, getPresignedUrls, getPresignedInsuranceUrl } from "../../actions/get-file-psu";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { InsuranceSide } from "@prisma/client";
import { usePatientMemberStore } from "@/app/(platform)/(provider)/(organization)/(routes)/(patient)/hooks/use-patient-member-store";

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

export const useDownloadFile = () => {
  // const { patientMember } = usePatientMemberStore();
  // let patientMemberId = !!patientMember ? patientMember.id : undefined;
  // let patientProfileId = !!patientMember ? patientMember.patientProfileId : null;
  // // const { isLoading, setIsLoading } = useIsLoading();

  const downloadFile = useCallback(
    async (fileId: string, forInsurance = false, patientMemberIdOrPatientId?: string | null) => {
      // if (isLoading) return;
      // console.log(patientMemberId);
      // console.log(patientProfileId);
      // setIsLoading(true);
      // Call your API endpoint to get the presigned URL
      const data = forInsurance
        ? await getPresignedInsuranceUrl(fileId as InsuranceSide, true, patientMemberIdOrPatientId)
        : await getPresignedUrl(fileId, true, patientMemberIdOrPatientId);
      if (!data || !data.presignedUrl) {
        toast.error("Something went wrong", { duration: 2500 });
        window.location.reload();
      } else {
        // Client-side logic to trigger the download
        const link = document.createElement("a");
        link.href = data.presignedUrl;
        link.setAttribute("download", data.fileName || "download");
        link.addEventListener(
          "click",
          (e) => {
            e.preventDefault(); // Prevent default anchor tag behavior
            e.stopImmediatePropagation(); // Stop the event from propagating
            window.location.href = link.href; // Manually navigate to trigger the download
          },
          true,
        ); // Capture phase
        document.body.appendChild(link);
        link.click(); // This should now prevent the toploader from activating
        document.body.removeChild(link);
      }
    },
    [],
  );
  // setIsLoading(false);
  return downloadFile;
};

export const useDownloadZip = () => {
  // const { isLoading, setIsLoading } = useIsLoading();

  const downloadZip = useCallback(
    async (fileIds: string[], parentNamePath: string, parentName: string, patientMemberId?: string | null) => {
      // Example fileIds could be an array of IDs or keys that identify what you want to download
      const filesData = await getPresignedUrls(fileIds, parentNamePath, patientMemberId);
      // console.log(filesData);
      if (!Array.isArray(filesData)) {
        // Since it's not an array, we now assume it's the error object - handle the error
        toast.error("Something went wrong", { duration: 2500 });
        window.location.reload();
        return;
      } else if (filesData.length === 0) {
        // It's an array but it's empty - handle this case as needed
        toast.error("No files found", { duration: 2500 });

        return;
      }
      const zip = new JSZip();
      const filteredFilesData = filesData.filter(isNotNull);
      // console.log(filteredFilesData);
      // Load files and add them to the zip with their full paths
      const filePromises = filteredFilesData.map(async ({ presignedUrl, path }) => {
        try {
          const response = await fetch(presignedUrl);
          const blob = await response.blob();
          // Add the file to the zip, using `path` for the folder structure
          zip.file(path, blob, { binary: true });
        } catch (error) {
          toast.error("Error downloading or adding file to zip", { duration: 2500 });

          // console.error("Error downloading or adding file to zip:", error);
          // Consider how you want to handle errors for individual files
        }
      });

      // Wait for all files to be processed
      await Promise.all(filePromises);

      // Generate zip file and trigger download
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `${parentName}.zip`);
      });
    },
    [],
  );

  return downloadZip;
};
