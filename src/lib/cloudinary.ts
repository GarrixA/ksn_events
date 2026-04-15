const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const uploadFolder = "ksn_events";
const defaultTransformations = "f_auto,q_auto,w_1400,c_limit";

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

function buildOptimizedCloudinaryUrl(url: string): string {
  const marker = "/image/upload/";
  if (!url.includes(marker)) {
    return url;
  }
  return url.replace(marker, `${marker}${defaultTransformations}/`);
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing Cloudinary config. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", uploadFolder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to upload image to Cloudinary.");
  }

  if (!data.secure_url) {
    throw new Error("Cloudinary did not return an image URL.");
  }

  return buildOptimizedCloudinaryUrl(data.secure_url);
}
