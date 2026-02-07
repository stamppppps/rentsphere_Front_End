import express from "express";
import cors from "cors";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import { randomUUID } from "crypto";

const app = express();

// ✅ CORS (รองรับ header x-admin-secret)
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "x-line-user-id", "x-admin-secret"],
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
  })
);
// ✅ กัน preflight ตาย
app.options("*", cors());

app.use(express.json());

const fetchFn = globalThis.fetch;

// ✅ ชื่อ bucket ต้องตรงใน Supabase Storage
const REPAIR_BUCKET = "repair-images";
const PARCEL_BUCKET = "parcel-images";

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("HAS_SERVICE_ROLE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("REPAIR_BUCKET:", REPAIR_BUCKET);
console.log("PARCEL_BUCKET:", PARCEL_BUCKET);
console.log("HAS_LINE_MESSAGING_TOKEN:", !!process.env.LINE_MESSAGING_ACCESS_TOKEN);
console.log("HAS_ADMIN_DEV_SECRET:", !!process.env.ADMIN_DEV_SECRET);

// ---- Supabase Admin Client ----
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ✅ health check
app.get("/health", (req, res) => res.json({ ok: true }));

// ===== helpers =====
function genCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
const pickErr = (e) => (typeof e === "string" ? e : e?.message || String(e));

// ===== multer =====
const upload = multer({ storage: multer.memoryStorage() });

/* ===================================
   ========== DORM + LINE LOGIN =======
   =================================== */

// ===== 1) สมัครหอพัก =====
app.post("/dorm/register", async (req, res) => {
  try {
    const { full_name, phone, email } = req.body || {};
    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ error: "full_name is required" });
    }

    const payload = {
      full_name: String(full_name).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
    };

    for (let tries = 0; tries < 5; tries++) {
      const code = genCode(8);

      const { data, error } = await supabaseAdmin
        .schema("public")
        .from("dorm_users")
        .insert([{ code, ...payload }])
        .select("code, registered_at")
        .single();

      if (!error) return res.json({ ok: true, ...data });

      if (error.code !== "23505") {
        return res.status(500).json({ step: "insert_failed", error: pickErr(error) });
      }
    }

    return res.status(500).json({ error: "Could not generate unique code" });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

// ===== 2) LINE login =====
app.get("/auth/line/login", (req, res) => {
  const state = Math.random().toString(36).slice(2);

  const url =
    `https://access.line.me/oauth2/v2.1/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.LINE_LOGIN_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.LINE_LOGIN_REDIRECT_URI)}` +
    `&state=${state}` +
    `&scope=profile%20openid`;

  return res.redirect(url);
});

// ===== 3) LINE callback =====
app.get("/auth/line/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code");

  try {
    const tokenRes = await fetchFn("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: process.env.LINE_LOGIN_REDIRECT_URI,
        client_id: process.env.LINE_LOGIN_CLIENT_ID,
        client_secret: process.env.LINE_LOGIN_CLIENT_SECRET,
      }),
    });

    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) {
      return res.status(400).json({ step: "token_exchange_failed", status: tokenRes.status, token });
    }

    const profileRes = await fetchFn("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });

    const profile = await profileRes.json();
    if (!profileRes.ok || !profile.userId) {
      return res.status(400).json({ step: "profile_fetch_failed", status: profileRes.status, profile });
    }

    const { error: upsertErr } = await supabaseAdmin
      .schema("public")
      .from("line_users")
      .upsert(
        {
          line_user_id: profile.userId,
          display_name: profile.displayName,
          picture_url: profile.pictureUrl,
          raw_profile: profile,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "line_user_id" }
      );

    if (upsertErr) {
      return res.status(500).json({ step: "supabase_upsert_failed", error: pickErr(upsertErr) });
    }

    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontend}/owner/line-login-success?lineUserId=${encodeURIComponent(profile.userId)}`);

  } catch (e) {
    return res.status(500).json({ step: "callback_catch", error: pickErr(e) });
  }
});

// ===== 4) link code =====
app.post("/dorm/link-line", async (req, res) => {
  try {
    const { code, lineUserId } = req.body || {};
    if (!code || !lineUserId) return res.status(400).json({ error: "code and lineUserId required" });

    const normalizedCode = String(code).trim().toUpperCase();

    const { data: user, error: findErr } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .select("id, line_user_id")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (findErr) return res.status(500).json({ step: "find_failed", error: pickErr(findErr) });
    if (!user) return res.status(404).json({ error: "invalid_code" });
    if (user.line_user_id) return res.status(409).json({ error: "code_already_used" });

    const { error: updErr } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .update({ line_user_id: String(lineUserId) })
      .eq("id", user.id);

    if (updErr) return res.status(500).json({ step: "update_failed", error: pickErr(updErr) });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

// dorm status
app.get("/dorm/status", async (req, res) => {
  try {
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .select("id, full_name, phone, email, registered_at, line_user_id")
      .eq("line_user_id", String(lineUserId))
      .maybeSingle();

    if (error) return res.status(500).json({ error: pickErr(error) });
    if (!data) return res.json({ ok: true, linked: false });

    return res.json({ ok: true, linked: true, dormUser: data });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

/* ===================================
   ========== REPAIRS API =============
   =================================== */

app.post("/repair/create", upload.array("images", 5), async (req, res) => {
  try {
    const { lineUserId, problem_type, description, location, room, room_id } = req.body || {};
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });
    if (!problem_type || !String(problem_type).trim()) return res.status(400).json({ error: "problem_type required" });

    const { data: dormUser, error: dormErr } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .select("id")
      .eq("line_user_id", String(lineUserId))
      .maybeSingle();

    if (dormErr) return res.status(500).json({ step: "find_dorm_failed", error: pickErr(dormErr) });
    if (!dormUser) return res.status(403).json({ error: "not_linked_dorm_code" });

    const files = req.files || [];
    const imageUrls = [];

    for (const f of files) {
      const ext = (f.mimetype?.split("/")?.[1] || "jpg").replace("jpeg", "jpg");
      const filename = `${randomUUID()}.${ext}`;
      const path = `${dormUser.id}/${Date.now()}_${filename}`;

      const { error: upErr } = await supabaseAdmin.storage
        .from(REPAIR_BUCKET)
        .upload(path, f.buffer, { contentType: f.mimetype, upsert: false });

      if (upErr) return res.status(500).json({ step: "upload_failed", error: pickErr(upErr), bucket: REPAIR_BUCKET });

      const { data: pub } = supabaseAdmin.storage.from(REPAIR_BUCKET).getPublicUrl(path);
      imageUrls.push(pub.publicUrl);
    }

    const payload = {
      problem_type: String(problem_type).trim(),
      description: description ? String(description) : null,
      location: location ? String(location) : null,
      room: room ? String(room) : null,
      room_id: room_id ? String(room_id) : null,
      status: "new",
      line_user_id: String(lineUserId),
      dorm_user_id: dormUser.id,
      image_url: imageUrls[0] || null,
    };

    const { data: created, error: insErr } = await supabaseAdmin
      .schema("public")
      .from("repair_request")
      .insert([payload])
      .select("*")
      .single();

    if (insErr) return res.status(500).json({ step: "insert_failed", error: pickErr(insErr) });

    return res.json({ ok: true, repair: created, imageUrls });
  } catch (e) {
    return res.status(500).json({ step: "catch", error: pickErr(e) });
  }
});

app.get("/repair/my", async (req, res) => {
  try {
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("repair_request")
      .select("id, created_at, problem_type, status, location, room, image_url")
      .eq("line_user_id", String(lineUserId))
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ step: "select_failed", error: pickErr(error) });

    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

app.get("/repair/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("repair_request")
      .select("*")
      .eq("id", id)
      .eq("line_user_id", String(lineUserId))
      .maybeSingle();

    if (error) return res.status(500).json({ step: "select_failed", error: pickErr(error) });
    if (!data) return res.status(404).json({ error: "not_found" });

    return res.json({ ok: true, item: data });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

/* ===================================
   ========== ADMIN + LINE PUSH =======
   =================================== */

async function isAdminLineUser(lineUserId) {
  const { data, error } = await supabaseAdmin
    .schema("public")
    .from("line_users")
    .select("role")
    .eq("line_user_id", String(lineUserId))
    .maybeSingle();

  if (error) throw error;
  return data?.role === "admin";
}

async function requireAdmin(req, res, next) {
  try {
    const secret = req.headers["x-admin-secret"] || req.query.adminSecret || req.body?.adminSecret;

    // ✅ dev secret ผ่านเลย
    if (secret && process.env.ADMIN_DEV_SECRET && String(secret) === String(process.env.ADMIN_DEV_SECRET)) {
      req.adminLineUserId = "dev-admin";
      return next();
    }

    // ✅ โหมดจริง
    const adminLineUserId = req.headers["x-line-user-id"] || req.query.adminLineUserId || req.body?.adminLineUserId;
    if (!adminLineUserId) return res.status(401).json({ error: "adminLineUserId required" });

    const ok = await isAdminLineUser(String(adminLineUserId));
    if (!ok) return res.status(403).json({ error: "forbidden_not_admin" });

    req.adminLineUserId = String(adminLineUserId);
    next();
  } catch (e) {
    return res.status(500).json({ error: e.message || "admin_check_failed" });
  }
}

// ✅ ปรับ push ให้รองรับ text หรือ text+image
async function pushLineMessage(toLineUserId, payload) {
  const token = process.env.LINE_MESSAGING_ACCESS_TOKEN;
  if (!token) throw new Error("Missing LINE_MESSAGING_ACCESS_TOKEN");

  let messages = [];

  // payload เป็น string (ข้อความอย่างเดียว)
  if (typeof payload === "string") {
    messages = [{ type: "text", text: payload }];
  }
  // payload เป็น object แบบ { type:"text", text:"..." }
  else if (payload?.type === "text") {
    messages = [{ type: "text", text: String(payload.text) }];
  }
  // payload เป็น object แบบ { type:"multi", text:"...", imageUrl:"..." }
  else if (payload?.type === "multi") {
    const img = String(payload.imageUrl || "").trim();
    if (!img) throw new Error("Missing imageUrl for multi");

    messages = [
      { type: "text", text: String(payload.text || "") },
      {
        type: "image",
        originalContentUrl: img,
        previewImageUrl: img,
      },
    ];
  } else {
    throw new Error("Invalid push payload");
  }

  const r = await fetchFn("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: String(toLineUserId), messages }),
  });

  const raw = await r.text();
  if (!r.ok) throw new Error(`LINE push failed: ${r.status} ${raw}`);
}

// ===== admin: รายชื่อผู้เช่า =====
app.get("/admin/tenants", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .select("id, full_name, phone, email, line_user_id, registered_at")
      .not("line_user_id", "is", null)
      .order("registered_at", { ascending: false });

    if (error) return res.status(500).json({ error: pickErr(error) });
    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server error" });
  }
});

// ===== admin: สร้างพัสดุ + อัปโหลดรูป + ส่ง LINE =====
app.post("/admin/parcel/create", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { dormUserId, note } = req.body || {};
    if (!dormUserId) return res.status(400).json({ error: "dormUserId required" });
    if (!req.file) return res.status(400).json({ error: "image file required" });

    const { data: tenant, error: tErr } = await supabaseAdmin
      .schema("public")
      .from("dorm_users")
      .select("id, line_user_id, full_name")
      .eq("id", String(dormUserId))
      .maybeSingle();

    if (tErr) return res.status(500).json({ error: pickErr(tErr) });
    if (!tenant) return res.status(404).json({ error: "tenant_not_found" });
    if (!tenant.line_user_id) return res.status(400).json({ error: "tenant_has_no_line_user_id" });

    const f = req.file;
    const ext = (f.mimetype?.split("/")?.[1] || "jpg").replace("jpeg", "jpg");
    const filename = `${randomUUID()}.${ext}`;
    const path = `${tenant.id}/${Date.now()}_${filename}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(PARCEL_BUCKET)
      .upload(path, f.buffer, { contentType: f.mimetype, upsert: false });

    if (upErr) return res.status(500).json({ step: "upload_failed", error: pickErr(upErr) });

    const { data: pub } = supabaseAdmin.storage.from(PARCEL_BUCKET).getPublicUrl(path);
    const imageUrl = pub.publicUrl;

    const { data: created, error: insErr } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .insert([{
        dorm_user_id: tenant.id,
        line_user_id: tenant.line_user_id,
        image_url: imageUrl,
        note: note ? String(note) : null,
      }])
      .select("*")
      .single();

    if (insErr) return res.status(500).json({ step: "insert_failed", error: pickErr(insErr) });

    const text =
      (note && String(note).trim())
        ? `📦 พัสดุมาถึงแล้ว!\n${String(note).trim()}`
        : `📦 พัสดุมาถึงแล้ว!\nกรุณามารับที่จุดรับพัสดุ`;

    await pushLineMessage(tenant.line_user_id, { type: "multi", text, imageUrl });

    return res.json({ ok: true, item: created, imageUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server error" });
  }
});

// ===== admin: งานซ่อม =====
app.get("/admin/repairs", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let q = supabaseAdmin
      .schema("public")
      .from("repair_request")
      .select("id, created_at, problem_type, description, status, location, room, image_url, line_user_id")
      .order("created_at", { ascending: false });

    if (status) q = q.eq("status", String(status));

    const { data, error } = await q;
    if (error) return res.status(500).json({ error: pickErr(error) });

    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server error" });
  }
});

app.patch("/admin/repair/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body || {};
    if (!status) return res.status(400).json({ error: "status required" });

    const { data: ticket, error: findErr } = await supabaseAdmin
      .schema("public")
      .from("repair_request")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (findErr) return res.status(500).json({ error: pickErr(findErr) });
    if (!ticket) return res.status(404).json({ error: "not_found" });

    const { data: updated, error: updErr } = await supabaseAdmin
      .schema("public")
      .from("repair_request")
      .update({ status: String(status) })
      .eq("id", id)
      .select("*")
      .single();

    if (updErr) return res.status(500).json({ error: pickErr(updErr) });

    const text = message?.trim()
      ? message.trim()
      : `อัปเดตงานแจ้งซ่อม #${ticket.id}\nสถานะ: ${status}`;

    if (ticket.line_user_id) await pushLineMessage(ticket.line_user_id, text);

    return res.json({ ok: true, item: updated });
  } catch (e) {
    return res.status(500).json({ error: e.message || "server error" });
  }
});
app.get("/parcels/my", async (req, res) => {
  try {
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .select("id, created_at, image_url, note")
      .eq("line_user_id", String(lineUserId))
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: pickErr(error) });

    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

// =========================
// ✅ TENANT PARCELS API
// =========================
// พัสดุผู้เช่า
// list ของฉัน




app.get("/parcels/my", async (req, res) => {
  try {
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .select("id, created_at, image_url, note, status, picked_up_at")
      .eq("line_user_id", String(lineUserId))
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: pickErr(error) });

    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

// detail ของฉัน
app.get("/parcels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { lineUserId } = req.query;
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    const { data, error } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .select("*")
      .eq("id", String(id))
      .eq("line_user_id", String(lineUserId))
      .maybeSingle();

    if (error) return res.status(500).json({ error: pickErr(error) });
    if (!data) return res.status(404).json({ error: "not_found" });

    return res.json({ ok: true, item: data });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});

// ยืนยันรับพัสดุ (picked_up)
app.patch("/parcels/:id/pickup", async (req, res) => {
  try {
    const { id } = req.params;
    const { lineUserId } = req.body || {};
    if (!lineUserId) return res.status(400).json({ error: "lineUserId required" });

    // กันคนอื่นมากดยืนยันแทน + กันกดซ้ำ
    const { data: parcel, error: fErr } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .select("id, line_user_id, status, picked_up_at")
      .eq("id", String(id))
      .maybeSingle();

    if (fErr) return res.status(500).json({ error: pickErr(fErr) });
    if (!parcel) return res.status(404).json({ error: "not_found" });
    if (String(parcel.line_user_id) !== String(lineUserId)) {
      return res.status(403).json({ error: "forbidden" });
    }

    if (String(parcel.status || "").toLowerCase() === "picked_up") {
      return res.json({ ok: true, item: parcel, already: true });
    }

    const { data: updated, error: uErr } = await supabaseAdmin
      .schema("public")
      .from("parcels")
      .update({ status: "picked_up", picked_up_at: new Date().toISOString() })
      .eq("id", String(id))
      .eq("line_user_id", String(lineUserId))
      .select("*")
      .single();

    if (uErr) return res.status(500).json({ error: pickErr(uErr) });
    return res.json({ ok: true, item: updated });
  } catch (e) {
    return res.status(500).json({ error: pickErr(e) });
  }
});


console.log("Routes ready:", [
  "GET /health",
  "POST /dorm/register",
  "POST /dorm/link-line",
  "GET /dorm/status",
  "GET /auth/line/login",
  "GET /auth/line/callback",
  "POST /repair/create",
  "GET /repair/my",
  "GET /repair/:id",
  "GET /admin/tenants",
  "POST /admin/parcel/create",
  "GET /admin/repairs",
  "PATCH /admin/repair/:id/status",
]);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
