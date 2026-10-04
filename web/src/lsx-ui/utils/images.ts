import axios from "axios";
import { fetchNui } from "./fetchNui";

const dummyURL = 'https://fmapi.net/api/v2/presigned-url/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJON0UxM0tzejFRM0NuSzRHWFBPbmUiLCJ0ZWFtSWQiOiJlMDQ1YnpwZzg5TGpoaUFTaURIdVoiLCJmaWxlVHlwZSI6ImltYWdlIiwidG9rZW5JZCI6ImpwczJ4Z0M1eFZqcnRoeWZTZnFsYSIsInNldHRpbmdzIjp7IlRlYW1JRCI6ImUwNDVienBnODlMamhpQVNpREh1WiIsIkltYWdlTm90aWZpY2F0aW9uVHlwZSI6IiIsIkRpc2NvcmRXZWJob29rIjoiIiwiRGlzY29yZEltYWdlQ2hhbm5lbCI6IiIsIlZpZGVvTm90aWZpY2F0aW9uVHlwZSI6IiIsIkRpc2NvcmRWaWRlb1dlYmhvb2siOiIiLCJEaXNjb3JkVmlkZW9DaGFubmVsIjoiIiwiQXVkaW9Ob3RpZmljYXRpb25UeXBlIjoiIiwiRGlzY29yZEF1ZGlvV2ViaG9vayI6IiIsIkRpc2NvcmRBdWRpb0NoYW5uZWwiOiIiLCJEaXNjb3JkQm90VG9rZW4iOiIiLCJSZXRlbnRpb25FbmFibGVkIjpmYWxzZSwiUmV0ZW50aW9uRGF5cyI6NywiVmlkZW9SZXRlbnRpb25FbmFibGVkIjpmYWxzZSwiVmlkZW9SZXRlbnRpb25EYXlzIjo3LCJBdWRpb1JldGVudGlvbkVuYWJsZWQiOmZhbHNlLCJBdWRpb1JldGVudGlvbkRheXMiOjcsIkxvZ0FsZXJ0RW5hYmxlZCI6ZmFsc2UsIkxvZ0FsZXJ0TGV2ZWxzIjpbXSwiTG9nQWxlcnREaXNjb3JkV2ViaG9vayI6IiIsIk92ZXJyaWRlSW1hZ2VRdWFsaXR5IjpmYWxzZSwiSW1hZ2VRdWFsaXR5Ijo1MH0sImV4cCI6MTc2MTg1MTEzNH0.fpPeQ0GCm5GNTddjttUQ78VMqRUAufXoOvv5C7Vh3WA';

export async function updatePresignedURL(): Promise<string> {
  return await fetchNui<string>('GET_PRESIGNED_URL', undefined, dummyURL);
}

export type UploadImageProps = {
  fileURL: string;
  name?: string;
  description?: string;
};

export async function uploadImage(props: UploadImageProps): Promise<string> {
  // 1. Get presigned URL
  const uploadURL = await updatePresignedURL();

  // 2. Load file data from blob URL
  const response = await fetch(props.fileURL);
  const blob = await response.blob();

  // 👇 3. Wrap it as a File so it behaves properly
  const file = new File([blob], "upload.png", { type: blob.type });
  // 4. Build form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "metadata",
    JSON.stringify({
      name: props.name || file.name,
      description: props.description || "Uploaded via LSX Assets",
    })
  );

  // 5. Upload to the presigned URL
  const uploadRes = await axios.post(uploadURL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // 6. Return final URL
  const finalUrl = uploadRes.data?.data?.url ?? uploadRes.data?.url;
  if (!finalUrl) throw new Error("Upload succeeded but no URL returned");
  return finalUrl;
}


export async function getImageShape(file: File | string): Promise<"square" | "wide"> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      if (img.width > img.height) resolve("wide");
      else resolve("square"); // tall or equal treated as square
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    img.src = typeof file === "string" ? file : URL.createObjectURL(file);
  });
}
