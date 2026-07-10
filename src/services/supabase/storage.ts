import { supabase } from "@/lib/supabase";

// ============================================================
// COMPLAINT IMAGE UPLOADS
// ============================================================

export async function uploadComplaintImage(
  complaintId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string }> {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `complaints/${complaintId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("complaint-images")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("complaint-images")
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

export async function deleteComplaintImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from("complaint-images")
    .remove([storagePath]);
  if (error) throw error;
}

// ============================================================
// AVATAR UPLOADS
// ============================================================

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const storagePath = `avatars/${userId}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteAvatar(userId: string): Promise<void> {
  // Try common extensions
  const extensions = ["jpg", "jpeg", "png", "webp"];
  const paths = extensions.map((ext) => `avatars/${userId}.${ext}`);
  await supabase.storage.from("avatars").remove(paths);
}
