import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn } from "../ui";
import { users } from "../../utils/api";

function KYCEditModalContent({ submission, onClose, onSaved, getSecureFileUrl }) {
  const [form, setForm] = useState({
    status: submission.status || "pending",
    id_type: submission.id_type || "",
    id_number: submission.id_number || "",
    phone: submission.phone || "",
    biz_name: submission.biz_name || "",
    biz_reg: submission.biz_reg || "",
    rejection_reason: submission.rejection_reason || "",
  });
  const [saving, setSaving] = useState(false);

  const isBusiness = submission.submission_type === "business" || !!submission.biz_name || !!submission.biz_file;

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.status === "rejected" && !form.rejection_reason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      // Only send rejection_reason if status is rejected
      if (payload.status !== "rejected") {
        delete payload.rejection_reason;
      }
      const { error } = await users.updateKYCSubmission(submission.id, payload);
      if (error) {
        alert(error);
      } else {
        onSaved?.();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const statusColors = {
    pending: { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
    approved: { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" },
    rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  };

  const inputStyle = {
    ...fs,
    transition: "border-color .18s, box-shadow .18s",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: T.gray600,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    marginBottom: 5,
    display: "block",
  };

  const sectionStyle = {
    background: T.offWhite,
    borderRadius: 10,
    padding: "16px",
    marginBottom: 14,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 22, 55, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 16,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          boxShadow: "0 24px 80px rgba(0,22,55,.25)",
          animation: "fadeUp .25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: T.primary, margin: 0 }}>
              Edit KYC Submission
            </h2>
            <div style={{ fontSize: 13, color: T.gray500, marginTop: 3 }}>
              {submission.user_name} · {submission.user_email}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 22,
              color: T.gray400,
              lineHeight: 1,
              padding: 4,
            }}
            aria-label="Close"
          >
            <span className="msym">close</span>
          </button>
        </div>

        {/* Submission Info */}
        <div style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 2 }}>Submission Type</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>
              <span className="msym" style={{ fontSize: 16, marginRight: 5, verticalAlign: "middle" }}>
                {isBusiness ? "business_center" : "badge"}
              </span>
              {isBusiness ? "Business Verification" : "Identity (Govt ID) Verification"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 2 }}>Submitted</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.gray700 }}>
              {new Date(submission.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          {/* Status */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Status</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["pending", "approved", "rejected"].map((s) => {
                const sc = statusColors[s];
                const active = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                    style={{
                      flex: 1,
                      padding: "9px 0",
                      borderRadius: 8,
                      border: `2px solid ${active ? sc.border : T.gray100}`,
                      background: active ? sc.bg : T.white,
                      color: active ? sc.color : T.gray500,
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "all .15s",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    <span className="msym" style={{ fontSize: 15, marginRight: 4, verticalAlign: "middle" }}>
                      {s === "pending" ? "schedule" : s === "approved" ? "check_circle" : "cancel"}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rejection Reason (conditional) */}
          {form.status === "rejected" && (
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Rejection Reason *</label>
              <textarea
                value={form.rejection_reason}
                onChange={set("rejection_reason")}
                rows={3}
                placeholder="Explain why this submission is being rejected..."
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 70,
                }}
              />
            </div>
          )}

          {/* Document Links */}
          {(submission.id_file || submission.selfie_file || submission.biz_file || submission.incorp_file) && (
            <div style={{ ...sectionStyle, marginBottom: 16 }}>
              <div style={{ ...labelStyle, marginBottom: 8 }}>Uploaded Documents</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { key: "id_file", label: "ID Document", icon: "badge" },
                  { key: "selfie_file", label: "Selfie", icon: "photo_camera" },
                  { key: "biz_file", label: "Business Doc", icon: "description" },
                  { key: "incorp_file", label: "Incorp Cert", icon: "workspace_premium" },
                ].map(({ key, label, icon }) =>
                  submission[key] ? (
                    <a
                      key={key}
                      href={getSecureFileUrl?.(submission[key]) || submission[key]}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 12px",
                        borderRadius: 7,
                        background: T.white,
                        border: `1px solid ${T.gray100}`,
                        color: T.accent,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "border-color .15s, background .15s",
                      }}
                    >
                      <span className="msym" style={{ fontSize: 15 }}>{icon}</span>
                      {label}
                      <span className="msym" style={{ fontSize: 13 }}>open_in_new</span>
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Identity Fields (for Govt ID type) */}
          {!isBusiness && (
            <div style={{ ...sectionStyle }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>
                <span className="msym" style={{ fontSize: 15, marginRight: 4, verticalAlign: "middle" }}>badge</span>
                Identity Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="modal-grid">
                <div>
                  <label style={{ ...labelStyle, fontSize: 11 }}>ID Type</label>
                  <select value={form.id_type} onChange={set("id_type")} style={inputStyle}>
                    <option value="">— Select —</option>
                    <option value="national_id">National ID</option>
                    <option value="passport">International Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="voters_card">Voter's Card</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: 11 }}>ID Number</label>
                  <input type="text" value={form.id_number} onChange={set("id_number")} style={inputStyle} placeholder="e.g. A12345678" />
                </div>
              </div>
            </div>
          )}

          {/* Business Fields */}
          {isBusiness && (
            <div style={{ ...sectionStyle }}>
              <div style={{ ...labelStyle, marginBottom: 10 }}>
                <span className="msym" style={{ fontSize: 15, marginRight: 4, verticalAlign: "middle" }}>business_center</span>
                Business Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="modal-grid">
                <div>
                  <label style={{ ...labelStyle, fontSize: 11 }}>Business Name</label>
                  <input type="text" value={form.biz_name} onChange={set("biz_name")} style={inputStyle} placeholder="Company Ltd" />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: 11 }}>Registration / CAC Number</label>
                  <input type="text" value={form.biz_reg} onChange={set("biz_reg")} style={inputStyle} placeholder="RC-123456" />
                </div>
              </div>
            </div>
          )}

          {/* Phone */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Phone Number</label>
            <input type="text" value={form.phone} onChange={set("phone")} style={inputStyle} placeholder="+234..." />
          </div>

          {/* Reviewer Info (read-only) */}
          {submission.reviewed_by && (
            <div style={{ ...sectionStyle, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
              <div>
                <div style={{ fontSize: 11, color: T.gray400 }}>Reviewed By</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.gray700 }}>{submission.reviewer_name || `Admin #${submission.reviewed_by}`}</div>
              </div>
              {submission.reviewed_at && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: T.gray400 }}>Reviewed At</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.gray700 }}>{new Date(submission.reviewed_at).toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Current Tier */}
          {submission.current_tier !== undefined && (
            <div style={{ fontSize: 12, color: T.gray500, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="msym" style={{ fontSize: 14 }}>shield</span>
              Current User KYC Tier: <strong style={{ color: T.primary }}>Tier {submission.current_tier}</strong>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn
              variant="outline"
              style={{ fontSize: 13, padding: "9px 20px" }}
              onClick={onClose}
              type="button"
            >
              Cancel
            </Btn>
            <Btn
              variant="green"
              style={{ fontSize: 13, padding: "9px 24px" }}
              type="submit"
              disabled={saving}
            >
              {saving ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span className="msym" style={{ fontSize: 15, animation: "spin 1s linear infinite" }}>progress_activity</span>
                  Saving…
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span className="msym" style={{ fontSize: 15 }}>save</span>
                  Save Changes
                </span>
              )}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function KYCEditModal({ submission, isOpen, onClose, onSaved, getSecureFileUrl }) {
  if (!isOpen || !submission) return null;
  return (
    <KYCEditModalContent
      key={submission.id}
      submission={submission}
      onClose={onClose}
      onSaved={onSaved}
      getSecureFileUrl={getSecureFileUrl}
    />
  );
}
