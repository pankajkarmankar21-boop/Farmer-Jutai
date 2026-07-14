import { supabase } from "./supabaseClient";
import { uid } from "./constants";

/* ---------------- FILE UPLOAD ---------------- */
// Uploads a File to the "documents" storage bucket and returns a public URL.
export async function uploadDoc(file, folder) {
  if (!file) return null;
  const path = `${folder}/${uid()}-${file.name}`.replace(/\s+/g, "_");
  const { error } = await supabase.storage.from("documents").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("documents").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, type: file.type, path };
}

/* ---------------- FARMERS ---------------- */
export async function getFarmerByMobile(mobile) {
  const { data, error } = await supabase.from("farmers").select("*").eq("mobile", mobile).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllFarmers() {
  const { data, error } = await supabase.from("farmers").select("*").order("joined", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createFarmer(farmer) {
  const { data, error } = await supabase.from("farmers").insert(farmer).select().single();
  if (error) throw error;
  return data;
}

export async function updateFarmer(mobile, patch) {
  const { data, error } = await supabase.from("farmers").update(patch).eq("mobile", mobile).select().single();
  if (error) throw error;
  return data;
}

/* ---------------- DRIVERS ---------------- */
export async function getDriverByMobile(mobile) {
  const { data, error } = await supabase.from("drivers").select("*").eq("mobile", mobile).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllDrivers() {
  const { data, error } = await supabase.from("drivers").select("*").order("joined", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createDriver(driver) {
  const { data, error } = await supabase.from("drivers").insert(driver).select().single();
  if (error) throw error;
  return data;
}

export async function updateDriver(mobile, patch) {
  const { data, error } = await supabase.from("drivers").update(patch).eq("mobile", mobile).select().single();
  if (error) throw error;
  return data;
}

/* ---------------- BOOKINGS ---------------- */
// Only returns bookings for one farmer (their own history).
export async function getBookingsForFarmer(mobile) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("farmer_mobile", mobile)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// Only returns PENDING bookings for one village - so a driver only ever sees
// requests from their own village, never other villages or other drivers' jobs.
export async function getPendingBookingsForVillage(village) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("village", village)
    .eq("status", "Pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getBookingsForDriver(driverMobile) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("driver_mobile", driverMobile)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllBookings() {
  const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createBooking(booking) {
  const { data, error } = await supabase.from("bookings").insert(booking).select().single();
  if (error) throw error;
  return data;
}

export async function respondToBooking(id, status, driverName, driverMobile) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status, driver_name: driverName, driver_mobile: driverMobile })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- NOTIFICATIONS ---------------- */
// Fetches only notifications addressed to: everyone-of-role, this village, or this exact mobile.
export async function getNotificationsFor({ role, mobile, village }) {
  const orParts = [`target.eq.all_${role}s`, `and(target.eq.village,target_village.eq.${village})`, `and(target.eq.${role},target_mobile.eq.${mobile})`];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(orParts.join(","))
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllNotifications() {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createNotification(n) {
  const { data, error } = await supabase.from("notifications").insert(n).select().single();
  if (error) throw error;
  return data;
}
