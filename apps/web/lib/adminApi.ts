import { supabase } from './supabase';

export type Row = Record<string, any>;
export type Access = {
  is_admin: boolean;
  is_super?: boolean;
  permissions?: { modules: string[]; can_edit: boolean; can_publish: boolean; can_delete: boolean } | null;
};
export type Page = { total: number; rows: Row[] };

// All admin reads/writes go through SECURITY DEFINER RPCs: authorisation, column allow-lists and
// audit logging are enforced in the database, never in the browser.
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args as any);
  if (error) throw new Error(error.message);
  return data as T;
}

export const adminMyAccess = () => rpc<Access>('admin_my_access');
export const adminList = (entity: string, o: { search?: string; filters?: Record<string, string>; limit?: number; offset?: number; id?: string } = {}) =>
  rpc<Page>('admin_list_records', { p_entity: entity, p_search: o.search || null, p_filters: o.filters || {}, p_limit: o.limit ?? 25, p_offset: o.offset ?? 0, p_id: o.id ?? null });
export const adminUpdate = (entity: string, id: string, patch: Row) => rpc<Row>('admin_update_record', { p_entity: entity, p_id: id, p_patch: patch });
export const adminDeleteListing = (id: string) => rpc<{ deleted: string; storage_paths: string[] }>('admin_delete_listing', { p_id: id });
export const adminSetUserRole = (id: string, role: string, level?: string) => rpc<Row>('admin_set_user_role', { p_id: id, p_role: role, p_admin_level: level ?? null });
export const adminSetStaffPermissions = (id: string, modules: string[], edit: boolean, publish: boolean, del: boolean) =>
  rpc<Row>('admin_set_staff_permissions', { p_user: id, p_modules: modules, p_can_edit: edit, p_can_publish: publish, p_can_delete: del });
export const adminListAudit = (o: { search?: string; entityType?: string; limit?: number; offset?: number } = {}) =>
  rpc<Page>('admin_list_audit', { p_search: o.search || null, p_entity_type: o.entityType || null, p_limit: o.limit ?? 50, p_offset: o.offset ?? 0 });

// ---------------------------------------------------------------- media
const BUCKET = 'listing-images';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

export const mediaUrl = (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed`;
  if (file.size > MAX_BYTES) return `${file.name}: larger than 10 MB`;
  return null;
}

/** Uploads to the public media bucket and verifies the file is really reachable before returning. */
export async function uploadAdminImage(folder: string, file: File): Promise<{ path: string; url: string }> {
  const bad = validateImage(file);
  if (bad) throw new Error(bad);
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `admin/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const url = mediaUrl(path);
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    if (!res.ok) throw new Error(`Uploaded file is not publicly reachable (HTTP ${res.status})`);
  } catch (e) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw e instanceof Error ? e : new Error('Upload could not be verified');
  }
  return { path, url };
}

/** Removes a storage object only if it is one the admin tool uploaded (never external/sourced images). */
export async function removeAdminObjectByUrl(url: string) {
  const tail = url.split(`/object/public/${BUCKET}/`)[1];
  if (!tail) return;
  const path = decodeURIComponent(tail.split('?')[0]);
  if (path.startsWith('admin/')) await supabase.storage.from(BUCKET).remove([path]);
}
export async function removeStoragePaths(paths: string[]) {
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}

export type ListingImage = { id: string; storage_path: string; sort_order: number; is_cover: boolean };

export async function getListingImages(listingId: string): Promise<ListingImage[]> {
  const { data, error } = await supabase.from('listing_images').select('id,storage_path,sort_order,is_cover').eq('listing_id', listingId).order('sort_order');
  if (error) throw new Error(error.message);
  return (data || []) as ListingImage[];
}

/** Writes sort_order / is_cover for the given order (first image = cover). Fails loudly if RLS blocks a row. */
export async function persistListingOrder(images: ListingImage[]) {
  for (let i = 0; i < images.length; i++) {
    const { data, error } = await supabase.from('listing_images').update({ sort_order: i, is_cover: i === 0 }).eq('id', images[i].id).select('id');
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error('Image order was not saved (permission denied)');
  }
}

export async function addListingImage(listingId: string, file: File, order: number) {
  const { path } = await uploadAdminImage(`listings/${listingId}`, file);
  const { data, error } = await supabase.from('listing_images').insert({ listing_id: listingId, storage_path: path, sort_order: order, is_cover: order === 0 }).select('id').single();
  if (error || !data) {
    await removeStoragePaths([path]);
    throw new Error(error?.message || 'Image record was not created');
  }
}

export async function replaceListingImage(img: ListingImage, file: File, listingId: string) {
  const { path } = await uploadAdminImage(`listings/${listingId}`, file);
  const { data, error } = await supabase.from('listing_images').update({ storage_path: path }).eq('id', img.id).select('id');
  if (error || !data || data.length === 0) {
    await removeStoragePaths([path]);
    throw new Error(error?.message || 'Image was not replaced (permission denied)');
  }
  await removeStoragePaths([img.storage_path]);
}

export async function deleteListingImage(img: ListingImage) {
  const { data, error } = await supabase.from('listing_images').delete().eq('id', img.id).select('id');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('Image was not deleted (permission denied)');
  await removeStoragePaths([img.storage_path]);
}
