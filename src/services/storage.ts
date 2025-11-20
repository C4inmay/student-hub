import { supabase, PROFILE_PICTURES_BUCKET } from "../../supabaseClient";

const PUBLIC_PATH_SEGMENT = `/storage/v1/object/public/${PROFILE_PICTURES_BUCKET}/`;

const sanitizeUid = (uid: string) => uid.trim().toLowerCase();

const buildProfileImagePath = (uid: string) => `${sanitizeUid(uid)}/avatar`;

const resolveStoragePath = (pathOrUrl: string) => {
  if (!pathOrUrl) return "";
  if (pathOrUrl.includes(PUBLIC_PATH_SEGMENT)) {
    return pathOrUrl.split(PUBLIC_PATH_SEGMENT)[1];
  }
  return pathOrUrl;
};

export const uploadProfileImage = async (file: File | Blob, uid: string) => {
  if (!uid?.trim()) {
    throw new Error("UID is required before uploading a profile image");
  }

  const path = buildProfileImagePath(uid);
  const { error } = await supabase.storage.from(PROFILE_PICTURES_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file instanceof File && file.type ? file.type : undefined,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(PROFILE_PICTURES_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error("Unable to resolve public URL for uploaded profile image");
  }

  return { publicUrl: data.publicUrl, path };
};

export const deleteProfileImage = async (pathOrUrl: string | null | undefined) => {
  if (!pathOrUrl) return;
  const storagePath = resolveStoragePath(pathOrUrl);
  if (!storagePath) return;
  const { error } = await supabase.storage.from(PROFILE_PICTURES_BUCKET).remove([storagePath]);
  if (error && !/not found/i.test(error.message)) {
    throw error;
  }
};

export const getProfileImagePathFromUrl = (url: string | null | undefined) => {
  if (!url) return null;
  return resolveStoragePath(url);
};
