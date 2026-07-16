import { supabase } from "./supabaseClient";
import { uid } from "./constants";

// Supabase jsonb columns normally come back already parsed, but if a plot
// array was ever stored/returned as a raw JSON string this guarantees the
// app always gets a real array — without this, `.map()` on a farmer with
// farm_plots as a string throws and silently blanks the whole admin card,
// which is why 7/12 documents could appear to "not show" at all.
function normalizeFarmer(f) {
  if (!f) return f;
  let plots = f.farm_plots;
  if (typeof plots === "string") {
    try { plots = JSON.parse(plots); } catch { plots = []; }
  }
  if (!Array.isArray(plots)) plots = [];
  plots = plots.map((p) => ({
    id: p.id || uid(),
    khet: p.khet || "",
    acres: p.acres || "0",
    sevenTwelveUrl: p.sevenTwelveUrl || p.seven_twelve_url || "",
    sevenTwelveName: p.sevenTwelveName || p.seven_twelve_name || "",
    status: p.status || "Documents Baaki",
  }));
  return { ...f, farm_plots: plots };
}

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
  return normalizeFarmer(data);
}

export async function getAllFarmers() {
  const { data, error } = await supabase.from("farmers").select("*").order("joined", { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeFarmer);
}

export async function createFarmer(farmer) {
  const { data, error } = await supabase.from("farmers").insert(farmer).select().single();
  if (error) throw error;
  return normalizeFarmer(data);
}

export async function updateFarmer(mobile, patch) {
  const { data, error } = await supabase.from("farmers").update(patch).eq("mobile", mobile).select().single();
  if (error) throw error;
  return normalizeFarmer(data);
}

export function computeOverallDocsStatus(farmer) {
  const parts = [farmer.aadhar_status, ...(farmer.farm_plots || []).map((p) => p.status || "Documents Baaki")];
  if (parts.length === 0) return "Documents Baaki";
  if (parts.some((s) => s === "Rejected")) return "Rejected";
  if (parts.every((s) => s === "Approved")) return "Approved";
  if (parts.some((s) => s === "Documents Baaki" || !s)) return "Documents Baaki";
  return "Pending";
}

// Approve/reject the farmer's Aadhar (front+back together as one document).
export async function setFarmerAadharStatus(mobile, status) {
  const farmer = await getFarmerByMobile(mobile);
  const updated = { ...farmer, aadhar_status: status };
  const docs_status = computeOverallDocsStatus(updated);
  return updateFarmer(mobile, { aadhar_status: status, docs_status });
}

// Approve/reject exactly ONE 7/12 plot document, without touching the others.
export async function setFarmerPlotStatus(mobile, plotId, status) {
  const farmer = await getFarmerByMobile(mobile);
  const farm_plots = (farmer.farm_plots || []).map((p) => (p.id === plotId ? { ...p, status } : p));
  const docs_status = computeOverallDocsStatus({ ...farmer, farm_plots });
  return updateFarmer(mobile, { farm_plots, docs_status });
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

export async function respondToBooking(id, status, driverName, driverMobile, completionOtp) {
  const patch = { status, driver_name: driverName, driver_mobile: driverMobile };
  if (status === "Accepted" && completionOtp) patch.completion_otp = completionOtp;
  const { data, error } = await supabase.from("bookings").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function getBookingById(id) {
  const { data, error } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function completeBooking(id, completionPhotoUrl) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "Completed", completion_photo_url: completionPhotoUrl })
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
