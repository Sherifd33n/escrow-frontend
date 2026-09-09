import { useState, useRef, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin, FormField as F } from "../ui";
import { users } from "../../utils/api";

// ── Upload Zone Component ────────────────────────────────
const UploadZone = ({
  file,
  preview,
  accept,
  onSelect,
  onRemove,
  label,
  hint,
  icon = "photo_camera",
}) => {
  const inputRef = useRef();
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: T.gray700,
          marginBottom: 8,
        }}
      >
        {label} *
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept || "image/jpeg,image/png,application/pdf"}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) onSelect(e.target.files[0]);
          e.target.value = "";
        }}
      />
      {!file ? (
        <div
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${T.gray100}`,
            borderRadius: 12,
            padding: "28px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: T.offWhite,
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.green;
            e.currentTarget.style.background = "rgba(0,108,71,.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.gray100;
            e.currentTarget.style.background = T.offWhite;
          }}
        >
          <span
            className="msym"
            style={{
              fontSize: 32,
              color: T.gray400,
              display: "block",
              marginBottom: 8,
            }}
          >
            {icon}
          </span>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: T.gray700,
              marginBottom: 3,
            }}
          >
            Click to upload
          </div>
          <div style={{ fontSize: 11.5, color: T.gray500 }}>
            {hint || "JPG, PNG or PDF — max 5MB"}
          </div>
        </div>
      ) : (
        <div
          style={{
            border: `1.5px solid ${T.green}`,
            borderRadius: 12,
            padding: "14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: T.greenLt,
          }}
        >
          {preview && preview !== "pdf" ? (
            <img
              src={preview}
              alt="preview"
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 8,
                background: T.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span className="msym" style={{ fontSize: 24, color: T.green }}>
                description
              </span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: T.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: T.green,
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <span className="msym" style={{ fontSize: 12 }}>
                check_circle
              </span>
              Uploaded
            </div>
          </div>
          <button
            onClick={onRemove}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.gray500,
              padding: 6,
              flexShrink: 0,
            }}
          >
            <span className="msym" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

const KYC = ({ user, onClose, initialBiz = false }) => {
  const [step, setStep] = useState(1);
  const [fm, setFm] = useState({
    phone: user?.phone || "",
    idType: "passport",
    idNum: "",
    bizName: "",
    bizReg: "",
  });
  const [ld, setLd] = useState(true);
  const [kycState, setKycState] = useState("form"); // "form" | "review" | "rejected" | "approved"
  const [notifyEmail, setNotifyEmail] = useState(false);

  // File states — store actual File objects + preview URLs
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [bizFile, setBizFile] = useState(null);
  const [bizPreview, setBizPreview] = useState(null);
  const [incorpFile, setIncorpFile] = useState(null);
  const [incorpPreview, setIncorpPreview] = useState(null);

  const [err, setErr] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [prevPhone, setPrevPhone] = useState(user?.phone);
  if (user?.phone !== prevPhone) {
    setPrevPhone(user?.phone);
    setFm((p) => ({ ...p, phone: user?.phone || "" }));
  }

  const h = (k) => (e) => setFm((p) => ({ ...p, [k]: e.target.value }));
  const total = 2; // Clean 2 steps for both Government ID and Business Profile

  // Load current status on mount
  useEffect(() => {
    users.getKYCStatus().then(({ data, error }) => {
      setLd(false);
      if (!error && data) {
        const targetStatus = initialBiz
          ? (data.biz_status || "none")
          : (data.govt_id_status || "none");

        if (targetStatus === "pending") {
          setKycState("review");
        } else if (targetStatus === "rejected") {
          setKycState("rejected");
          const reason = initialBiz
            ? data.biz_rejection_reason
            : data.govt_rejection_reason;
          if (reason) setRejectionReason(reason);
        } else if (targetStatus === "approved") {
          setKycState("approved");
        } else {
          setKycState("form");
        }

        setFm((p) => ({
          ...p,
          phone: data.phone || user?.phone || "",
          idType: data.id_type || "passport",
          idNum: data.id_number || "",
          bizName: data.biz_name || "",
          bizReg: data.biz_reg || "",
        }));
      }
    });
  }, [initialBiz, user?.phone]);

  // Cleans up object URLs to avoid memory leaks
  const revokeURL = (url) => {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
  };

  const handleFile = (file, setFile, setPreview, prevPreview) => {
    if (!file) return;
    revokeURL(prevPreview);
    setFile(file);
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview("pdf");
    }
  };

  const removeFile = (setFile, setPreview, prevPreview) => {
    revokeURL(prevPreview);
    setFile(null);
    setPreview(null);
  };

  // Validate current step before advancing
  const canAdvance = () => {
    setErr("");
    if (!user?.phone_verified) {
      setErr("Please verify your phone number on the dashboard first.");
      return false;
    }

    if (initialBiz) {
      // Business Profile Verification validation
      if (step === 1) {
        if (!fm.bizName.trim()) {
          setErr("Registered business name is required.");
          return false;
        }
        if (!fm.bizReg.trim()) {
          setErr("Registration / CAC number is required.");
          return false;
        }
        if (!bizFile) {
          setErr("Please upload your business document (CAC / TIN / cert).");
          return false;
        }
        return true;
      }
      if (step === 2) {
        if (!incorpFile) {
          setErr("Please upload your certificate of incorporation.");
          return false;
        }
        return true;
      }
    } else {
      // Government ID Verification validation
      if (step === 1) {
        if (!fm.idNum.trim()) {
          setErr("ID number is required.");
          return false;
        }
        if (!idFile) {
          setErr("Please upload your ID document.");
          return false;
        }
        return true;
      }
      if (step === 2) {
        if (!selfieFile) {
          setErr("Please upload a selfie holding your ID.");
          return false;
        }
        return true;
      }
    }
    return true;
  };

  const next = () => {
    if (!canAdvance()) return;
    if (step < total) {
      setStep((p) => p + 1);
    } else {
      setLd(true);
      const fd = new FormData();
      fd.append("phone", fm.phone);
      fd.append("biz", initialBiz ? "true" : "false");

      if (initialBiz) {
        fd.append("bizName", fm.bizName);
        fd.append("bizReg", fm.bizReg);
        if (bizFile) fd.append("bizFile", bizFile);
        if (incorpFile) fd.append("incorpFile", incorpFile);
        if (selfieFile) fd.append("selfieFile", selfieFile);
      } else {
        fd.append("idType", fm.idType);
        fd.append("idNum", fm.idNum);
        if (idFile) fd.append("idFile", idFile);
        if (selfieFile) fd.append("selfieFile", selfieFile);
      }

      users.submitKYC(fd).then(({ error }) => {
        setLd(false);
        if (error) {
          setErr(error);
        } else {
          setKycState("review");
        }
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: T.white,
          borderRadius: 20,
          width: "100%",
          maxWidth: 540,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.22)",
          animation: "fadeUp .3s ease",
          margin: "auto",
        }}
      >
        {/* ═══ APPROVED STATE ═══ */}
        {kycState === "approved" && (
          <div style={{ padding: "40px 30px", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: T.greenLt,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <span className="msym" style={{ fontSize: 34, color: T.green }}>
                verified
              </span>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: T.primary,
                marginBottom: 6,
              }}
            >
              {initialBiz ? "Business Profile Verified" : "Identity Verified"}
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: T.gray500,
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              {initialBiz
                ? "Your business profile and incorporation documents have been verified and approved."
                : "Your government ID and identity details have been approved by the admin. Your account is verified."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="primary" onClick={onClose}>
                Close
              </Btn>
            </div>
          </div>
        )}

        {/* ═══ REJECTED STATE ═══ */}
        {kycState === "rejected" && (
          <div style={{ padding: "40px 30px", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "#ffdad6",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <span className="msym" style={{ fontSize: 34, color: T.red }}>
                cancel
              </span>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: T.gray900,
                marginBottom: 6,
              }}
            >
              {initialBiz
                ? "Business Verification Rejected"
                : "Identity Verification Rejected"}
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: T.gray500,
                lineHeight: 1.7,
                marginBottom: 16,
              }}
            >
              Your submitted documents were rejected by the administrator.
            </p>
            {rejectionReason && (
              <div
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#dc2626",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                <strong>Reason:</strong> {rejectionReason}
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="outline" onClick={onClose}>
                Close
              </Btn>
              <Btn
                variant="primary"
                onClick={async () => {
                  setLd(true);
                  await users.resetKYC({
                    type: initialBiz ? "business" : "govt_id",
                  });
                  setLd(false);
                  setKycState("form");
                  setStep(1);
                }}
              >
                Try Again
              </Btn>
            </div>
          </div>
        )}

        {/* ═══ REVIEW / PENDING STATE ═══ */}
        {kycState === "review" && (
          <div style={{ padding: "40px 30px", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: T.greenLt,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <span className="msym" style={{ fontSize: 34, color: T.green }}>
                schedule
              </span>
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: T.primary,
                marginBottom: 6,
              }}
            >
              Verification Submitted
            </div>
            <p
              style={{
                fontSize: 13.5,
                color: T.gray500,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Your {initialBiz ? "business documents" : "identity documents"} are
              under review. This usually takes 1–24 hours. We'll notify you once
              it's complete.
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 24,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: T.green }}
              />
              <span style={{ fontSize: 13, color: T.gray700 }}>
                Email me when verification completes
              </span>
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="outline" onClick={onClose}>
                Close
              </Btn>
            </div>
          </div>
        )}

        {/* ═══ FORM STATE ═══ */}
        {kycState === "form" && (
          <>
            {/* Header */}
            <div
              style={{
                background: `linear-gradient(135deg,${T.primary},${T.primaryDk})`,
                padding: "22px 26px",
                color: T.white,
                position: "sticky",
                top: 0,
                zIndex: 5,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="msym" style={{ fontSize: 20 }}>
                    {initialBiz ? "business" : "badge"}
                  </span>
                  {initialBiz
                    ? "Business Profile Verification (Tier 3)"
                    : "Identity Verification (KYC)"}
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,.12)",
                    border: "none",
                    color: T.white,
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 4,
                      background: i < step ? T.gold : "rgba(255,255,255,.2)",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "rgba(255,255,255,.6)",
                  marginTop: 8,
                }}
              >
                Step {step} of {total}
              </div>
            </div>

            <div style={{ padding: "26px" }}>
              {err && (
                <div
                  style={{
                    background: "#ffdad6",
                    border: "1px solid #ba1a1a33",
                    borderRadius: 9,
                    padding: "10px 14px",
                    marginBottom: 18,
                    fontSize: 13.5,
                    color: "#93000a",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="msym" style={{ fontSize: 18 }}>
                    error
                  </span>
                  {err}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* ── MODE 1: BUSINESS PROFILE VERIFICATION ───────────────── */}
              {/* ────────────────────────────────────────────────────────── */}
              {initialBiz && (
                <>
                  {/* Step 1: Business Info & Registration Doc */}
                  {step === 1 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.gray700,
                            marginBottom: 5,
                          }}
                        >
                          Contact Phone Number *
                          {user?.phone_verified ? (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11.5,
                                color: T.green,
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span className="msym" style={{ fontSize: 13 }}>
                                verified
                              </span>{" "}
                              Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11.5,
                                color: T.red,
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span className="msym" style={{ fontSize: 13 }}>
                                error
                              </span>{" "}
                              Unverified
                            </span>
                          )}
                        </label>
                        <input
                          style={fs}
                          placeholder="Verify phone number on dashboard first"
                          value={fm.phone}
                          disabled={true}
                        />
                        {!user?.phone_verified && (
                          <div
                            style={{
                              fontSize: 12,
                              color: T.red,
                              marginTop: 5,
                              fontWeight: 500,
                            }}
                          >
                            ⚠️ You must verify your phone number on the dashboard
                            before continuing.
                          </div>
                        )}
                      </div>

                      <F label="Registered Business Name" req>
                        <input
                          style={fs}
                          placeholder="e.g. Devcraft Solutions Ltd"
                          value={fm.bizName}
                          onChange={h("bizName")}
                          disabled={!user?.phone_verified}
                        />
                      </F>

                      <F label="Registration / CAC / Tax Number" req>
                        <input
                          style={fs}
                          placeholder="e.g. RC1234567 or BN987654"
                          value={fm.bizReg}
                          onChange={h("bizReg")}
                          disabled={!user?.phone_verified}
                        />
                      </F>

                      <UploadZone
                        label="Upload Business Registration Document"
                        hint="CAC certificate, business registration, or tax identification"
                        icon="business"
                        file={bizFile}
                        preview={bizPreview}
                        onSelect={(f) =>
                          handleFile(f, setBizFile, setBizPreview, bizPreview)
                        }
                        onRemove={() =>
                          removeFile(setBizFile, setBizPreview, bizPreview)
                        }
                      />
                    </div>
                  )}

                  {/* Step 2: Incorporation Certificate + Rep Selfie */}
                  {step === 2 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                      }}
                    >
                      <UploadZone
                        label="Certificate of Incorporation / Form CAC 1.1"
                        hint="Official incorporation document or status report"
                        icon="article"
                        file={incorpFile}
                        preview={incorpPreview}
                        onSelect={(f) =>
                          handleFile(
                            f,
                            setIncorpFile,
                            setIncorpPreview,
                            incorpPreview,
                          )
                        }
                        onRemove={() =>
                          removeFile(
                            setIncorpFile,
                            setIncorpPreview,
                            incorpPreview,
                          )
                        }
                      />
                      <UploadZone
                        label="Director / Representative Selfie with ID (Optional)"
                        hint="Clear selfie holding director's ID"
                        icon="photo_camera"
                        accept="image/jpeg,image/png"
                        file={selfieFile}
                        preview={selfiePreview}
                        onSelect={(f) =>
                          handleFile(
                            f,
                            setSelfieFile,
                            setSelfiePreview,
                            selfiePreview,
                          )
                        }
                        onRemove={() =>
                          removeFile(
                            setSelfieFile,
                            setSelfiePreview,
                            selfiePreview,
                          )
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* ── MODE 2: GOVERNMENT ID VERIFICATION (KYC) ────────────── */}
              {/* ────────────────────────────────────────────────────────── */}
              {!initialBiz && (
                <>
                  {/* Step 1: Phone + ID Document */}
                  {step === 1 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.gray700,
                            marginBottom: 5,
                          }}
                        >
                          Phone Number *
                          {user?.phone_verified ? (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11.5,
                                color: T.green,
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span className="msym" style={{ fontSize: 13 }}>
                                verified
                              </span>{" "}
                              Verified
                            </span>
                          ) : (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11.5,
                                color: T.red,
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <span className="msym" style={{ fontSize: 13 }}>
                                error
                              </span>{" "}
                              Unverified
                            </span>
                          )}
                        </label>
                        <input
                          style={fs}
                          placeholder="Verify phone number on dashboard first"
                          value={fm.phone}
                          disabled={true}
                        />
                        {!user?.phone_verified && (
                          <div
                            style={{
                              fontSize: 12,
                              color: T.red,
                              marginTop: 5,
                              fontWeight: 500,
                            }}
                          >
                            ⚠️ You must verify your phone number on the dashboard
                            before continuing.
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.gray700,
                            marginBottom: 5,
                          }}
                        >
                          ID Type *
                        </label>
                        <select
                          style={fs}
                          value={fm.idType}
                          onChange={h("idType")}
                          disabled={!user?.phone_verified}
                        >
                          <option value="passport">International Passport</option>
                          <option value="license">Driver's License</option>
                          <option value="nin">National ID (NIN)</option>
                          <option value="voters">Voter's Card</option>
                        </select>
                      </div>

                      <F label="ID Number" req>
                        <input
                          style={fs}
                          placeholder="Enter document number"
                          value={fm.idNum}
                          onChange={h("idNum")}
                          disabled={!user?.phone_verified}
                        />
                      </F>

                      <UploadZone
                        label="Upload ID Document"
                        hint="Clear photo or scan of the front of your ID"
                        icon="badge"
                        file={idFile}
                        preview={idPreview}
                        onSelect={(f) =>
                          handleFile(f, setIdFile, setIdPreview, idPreview)
                        }
                        onRemove={() =>
                          removeFile(setIdFile, setIdPreview, idPreview)
                        }
                      />
                    </div>
                  )}

                  {/* Step 2: Selfie Holding ID */}
                  {step === 2 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 18,
                      }}
                    >
                      <div
                        style={{
                          background: "#f0f4ff",
                          border: "1px solid #c7d7fd",
                          borderRadius: 10,
                          padding: "12px 14px",
                          fontSize: 13,
                          color: "#1e40af",
                          display: "flex",
                          gap: 8,
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          className="msym"
                          style={{ fontSize: 18, flexShrink: 0 }}
                        >
                          info
                        </span>
                        <span>
                          Take a clear selfie of yourself holding your ID
                          document next to your face.
                        </span>
                      </div>
                      <UploadZone
                        label="Upload Selfie with ID"
                        hint="Your face and ID must both be clearly visible"
                        icon="photo_camera"
                        accept="image/jpeg,image/png"
                        file={selfieFile}
                        preview={selfiePreview}
                        onSelect={(f) =>
                          handleFile(
                            f,
                            setSelfieFile,
                            setSelfiePreview,
                            selfiePreview,
                          )
                        }
                        onRemove={() =>
                          removeFile(
                            setSelfieFile,
                            setSelfiePreview,
                            selfiePreview,
                          )
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {/* Footer buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                {step > 1 && (
                  <Btn
                    variant="outline"
                    onClick={() => setStep((p) => p - 1)}
                    style={{ flex: 1 }}
                  >
                    Back
                  </Btn>
                )}
                <Btn
                  variant="primary"
                  onClick={next}
                  disabled={ld || !user?.phone_verified}
                  style={{ flex: 2 }}
                >
                  {ld ? (
                    <>
                      <Spin />
                      Submitting…
                    </>
                  ) : step < total ? (
                    "Continue"
                  ) : (
                    "Submit for Review"
                  )}
                </Btn>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KYC;
