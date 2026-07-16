import { useState, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { users } from "../../utils/api";

const SettingsTab = ({ user, onUserUpdate, onLogout }) => {
  const [twoFA, setTwoFA] = useState(!!user?.two_factor_enabled);
  const [notifs, setNotifs] = useState({
    email: user?.notif_email !== undefined ? !!user.notif_email : true,
    sms: !!user?.notif_sms,
    push: user?.notif_push !== undefined ? !!user.notif_push : true,
  });
  const [privacy, setPrivacy] = useState({
    discovery:
      user?.public_profile !== undefined ? !!user.public_profile : true,
    marketing: !!user?.marketing_comms,
  });

  const [showDelete, setShowDelete] = useState(false);
  const [pwFm, setPwFm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNextPw, setShowNextPw] = useState(false);

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  // Password state
  const [pwSaving, setPwSaving] = useState(false);
  const [pwErr, setPwErr] = useState(null);

  // Delete state
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState(null);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsLd, setSessionsLd] = useState(false);

  // Sync preference states when user prop changes
  const [syncedUserId, setSyncedUserId] = useState(user?.id);

  if (user && user.id !== syncedUserId) {
    setSyncedUserId(user.id);
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
    setTwoFA(!!user.two_factor_enabled);
    setNotifs({
      email: user.notif_email !== undefined ? !!user.notif_email : true,
      sms: !!user.notif_sms,
      push: user.notif_push !== undefined ? !!user.notif_push : true,
    });
    setPrivacy({
      discovery:
        user.public_profile !== undefined ? !!user.public_profile : true,
      marketing: !!user.marketing_comms,
    });
  }

  // Fetch sessions from backend
  const fetchSessions = async () => {
    setSessionsLd(true);
    const { data } = await users.getSessions();
    setSessionsLd(false);
    if (data) setSessions(data);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setSessionsLd(true);
      const { data } = await users.getSessions();
      if (cancelled) return;
      setSessionsLd(false);
      if (data) setSessions(data);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Revoke session
  const handleRevokeSession = async (id) => {
    const { error } = await users.revokeSession(id);
    if (error) {
      alert(error);
    } else {
      fetchSessions();
    }
  };

  // Save profile details (name, email)
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    setProfileErr(null);
    const payload = {};
    if (profileName.trim() && profileName.trim() !== user?.name)
      payload.name = profileName.trim();
    if (
      profileEmail.trim() &&
      profileEmail.trim().toLowerCase() !== user?.email
    )
      payload.email = profileEmail.trim();
    if (Object.keys(payload).length === 0) {
      setProfileErr("No changes to save.");
      setProfileSaving(false);
      return;
    }
    const { data, error } = await users.updateProfile(payload);
    setProfileSaving(false);
    if (error) {
      setProfileErr(error);
      return;
    }
    if (data?.user && onUserUpdate) onUserUpdate(data.user);
    setProfileMsg("Profile updated successfully.");
    setTimeout(() => setProfileMsg(null), 3000);
  };

  // Toggle 2FA
  const handleToggleTwoFA = async () => {
    const newVal = !twoFA;
    setTwoFA(newVal);
    const { data, error } = await users.updateProfile({
      two_factor_enabled: newVal,
    });
    if (error) {
      setTwoFA(!newVal); // rollback
      alert(error);
    } else if (data?.user && onUserUpdate) {
      onUserUpdate(data.user);
    }
  };

  // Toggle Notification preferences
  const handleToggleNotif = async (key) => {
    const newVal = !notifs[key];
    const updatedNotifs = { ...notifs, [key]: newVal };
    setNotifs(updatedNotifs);
    const payload = {};
    if (key === "email") payload.notif_email = newVal;
    if (key === "sms") payload.notif_sms = newVal;
    if (key === "push") payload.notif_push = newVal;

    const { data, error } = await users.updateProfile(payload);
    if (error) {
      setNotifs(notifs); // rollback
      alert(error);
    } else if (data?.user && onUserUpdate) {
      onUserUpdate(data.user);
    }
  };

  // Toggle Privacy preferences
  const handleTogglePrivacy = async (key) => {
    const newVal = !privacy[key];
    const updatedPrivacy = { ...privacy, [key]: newVal };
    setPrivacy(updatedPrivacy);
    const payload = {};
    if (key === "discovery") payload.public_profile = newVal;
    if (key === "marketing") payload.marketing_comms = newVal;

    const { data, error } = await users.updateProfile(payload);
    if (error) {
      setPrivacy(privacy); // rollback
      alert(error);
    } else if (data?.user && onUserUpdate) {
      onUserUpdate(data.user);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setPwSaving(true);
    setPwErr(null);
    setPwSaved(false);
    const { error } = await users.changePassword(pwFm.current, pwFm.next);
    setPwSaving(false);
    if (error) {
      setPwErr(error);
      return;
    }
    setPwSaved(true);
    setPwFm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteErr(null);
    const { error } = await users.deleteAccount();
    setDeleting(false);
    if (error) {
      setDeleteErr(error);
      return;
    }
    if (onLogout) onLogout();
  };

  const Toggle = ({ on, onToggle }) => (
    <div
      onClick={onToggle}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        background: on ? T.green : T.gray100,
        cursor: "pointer",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
        border: `1.5px solid ${on ? T.green : T.gray100}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: on ? "calc(100% - 19px)" : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: T.white,
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          transition: "left .2s",
        }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2
          style={{
            fontSize: "clamp(18px,3vw,22px)",
            fontWeight: 700,
            color: T.primary,
            marginBottom: 4,
          }}
        >
          Account Settings
        </h2>
        <p style={{ color: T.gray500, fontSize: 13.5 }}>
          Manage your security preferences and personal information.
        </p>
      </div>

      <div
        className="g2-dash"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              padding: "clamp(16px,3vw,24px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg,${T.primary},${T.primaryDk})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 20,
                  color: T.white,
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 16, color: T.primary }}
                >
                  {user?.name || "User"}
                </div>
                <div style={{ fontSize: 13, color: T.gray500 }}>
                  {user?.email || ""}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: T.green,
                    background: T.greenLt,
                    padding: "2px 9px",
                    borderRadius: 20,
                  }}
                >
                  <span className="msym" style={{ fontSize: 13 }}>
                    check_circle
                  </span>
                  Email verified
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.gray500,
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Full Name
                </label>
                <input
                  style={{ ...fs, background: T.offWhite }}
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.gray500,
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Role
                </label>
                <input
                  style={{ ...fs, background: T.offWhite }}
                  defaultValue={
                    user?.role === "client" ? "Client" : "Service Provider"
                  }
                  readOnly
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.gray500,
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Email Address
                </label>
                <input
                  style={{ ...fs, background: T.offWhite }}
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
              </div>
            </div>
            {profileMsg && (
              <div
                style={{
                  background: T.greenLt,
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                  color: T.green,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span className="msym" style={{ fontSize: 15 }}>
                  check_circle
                </span>
                {profileMsg}
              </div>
            )}
            {profileErr && (
              <div
                style={{
                  background: "#fef2f2",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                  color: T.red,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span className="msym" style={{ fontSize: 15 }}>
                  error
                </span>
                {profileErr}
              </div>
            )}
            <Btn
              variant="primary"
              style={{ fontSize: 13, padding: "9px 18px" }}
              disabled={profileSaving}
              onClick={handleSaveProfile}
            >
              {profileSaving ? (
                <>
                  <Spin /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Btn>
          </div>

          {/* 2FA + Login Activity side by side */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
            className="g2-dash"
          >
            {/* 2FA */}
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.gray100}`,
                borderRadius: 14,
                padding: "clamp(14px,2.5vw,22px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 22, color: T.primary }}
                  >
                    verified_user
                  </span>
                  <div
                    style={{ fontWeight: 700, fontSize: 15, color: T.primary }}
                  >
                    Two-Factor Auth
                  </div>
                </div>
                <p style={{ fontSize: 13, color: T.gray500, lineHeight: 1.7 }}>
                  Add an extra layer of security. A code from your authenticator
                  app is required at each login.
                </p>
              </div>
              {twoFA ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: T.greenLt,
                    borderRadius: 9,
                    padding: "10px 13px",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span
                      className="msym"
                      style={{ fontSize: 17, color: T.green }}
                    >
                      check_circle
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.green,
                        }}
                      >
                        2FA Enabled
                      </div>
                      <div style={{ fontSize: 11.5, color: T.green }}>
                        Authenticator app connected
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleTwoFA}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.red,
                      fontSize: 12.5,
                      fontWeight: 700,
                      padding: 0,
                    }}
                  >
                    Disable
                  </button>
                </div>
              ) : (
                <Btn
                  variant="primary"
                  style={{
                    fontSize: 13,
                    padding: "9px 16px",
                    alignSelf: "flex-start",
                  }}
                  onClick={handleToggleTwoFA}
                >
                  Enable 2FA
                </Btn>
              )}
            </div>
            {/* Login Activity */}
            <div
              style={{
                background: T.white,
                border: `1px solid ${T.gray100}`,
                borderRadius: 14,
                padding: "clamp(14px,2.5vw,22px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span
                  className="msym"
                  style={{ fontSize: 22, color: T.primary }}
                >
                  devices
                </span>
                <div
                  style={{ fontWeight: 700, fontSize: 15, color: T.primary }}
                >
                  Login Activity
                </div>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {sessionsLd ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 10,
                      color: T.gray500,
                    }}
                  >
                    <Spin /> Loading sessions...
                  </div>
                ) : sessions.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: 10,
                      color: T.gray500,
                    }}
                  >
                    No active sessions
                  </div>
                ) : (
                  sessions.map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingBottom: i < sessions.length - 1 ? 12 : 0,
                        borderBottom:
                          i < sessions.length - 1
                            ? `1px solid ${T.gray100}`
                            : "",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.primary,
                          }}
                        >
                          {s.device} &middot; {s.location}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: T.gray400,
                            marginTop: 2,
                          }}
                        >
                          {s.active
                            ? "Current session"
                            : new Date(s.last_active).toLocaleString()}
                        </div>
                      </div>
                      {s.active ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: T.green,
                            background: T.greenLt,
                            padding: "3px 9px",
                            borderRadius: 20,
                          }}
                        >
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: T.red,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              padding: "clamp(14px,3vw,24px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span className="msym" style={{ fontSize: 22, color: T.primary }}>
                visibility
              </span>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.primary }}>
                Privacy &amp; Data
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
              className="g2-dash"
            >
              {[
                {
                  k: "discovery",
                  label: "Public Profile Discovery",
                  desc: "Allow other users to find you by email or name during escrow setup.",
                },
                {
                  k: "marketing",
                  label: "Marketing Communications",
                  desc: "Receive updates about new features and secure trading tips.",
                },
              ].map((p) => (
                <div
                  key={p.k}
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <Toggle
                    on={privacy[p.k]}
                    onToggle={() => handleTogglePrivacy(p.k)}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: T.primary,
                        marginBottom: 3,
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: T.gray500,
                        lineHeight: 1.65,
                      }}
                    >
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              padding: "clamp(14px,3vw,24px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span className="msym" style={{ fontSize: 22, color: T.primary }}>
                lock
              </span>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.primary }}>
                Change Password
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: T.gray500,
                    marginBottom: 5,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Current Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={fs}
                    type={showCurrentPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={pwFm.current}
                    onChange={(e) =>
                      setPwFm((p) => ({ ...p, current: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.gray400,
                    }}
                  >
                    <span className="msym" style={{ fontSize: 18 }}>
                      {showCurrentPw ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
                className="g2-dash"
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.gray500,
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={fs}
                      type={showNextPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={pwFm.next}
                      onChange={(e) =>
                        setPwFm((p) => ({ ...p, next: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNextPw((v) => !v)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.gray400,
                      }}
                    >
                      <span className="msym" style={{ fontSize: 18 }}>
                        {showNextPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      color: T.gray500,
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    Confirm New
                  </label>
                  <input
                    style={fs}
                    type="password"
                    placeholder="Repeat password"
                    value={pwFm.confirm}
                    onChange={(e) =>
                      setPwFm((p) => ({ ...p, confirm: e.target.value }))
                    }
                  />
                </div>
              </div>
              {pwSaved && (
                <div
                  style={{
                    background: T.greenLt,
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: T.green,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span className="msym" style={{ fontSize: 15 }}>
                    check_circle
                  </span>
                  Password updated successfully.
                </div>
              )}
              {pwErr && (
                <div
                  style={{
                    background: "#fef2f2",
                    borderRadius: 8,
                    padding: "9px 12px",
                    fontSize: 13,
                    color: T.red,
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span className="msym" style={{ fontSize: 15 }}>
                    error
                  </span>
                  {pwErr}
                </div>
              )}
              <Btn
                variant="primary"
                style={{
                  fontSize: 13,
                  padding: "9px 18px",
                  alignSelf: "flex-start",
                }}
                disabled={
                  !pwFm.current ||
                  !pwFm.next ||
                  pwFm.next !== pwFm.confirm ||
                  pwSaving
                }
                onClick={handleChangePassword}
              >
                {pwSaving ? (
                  <>
                    <Spin /> Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Btn>
            </div>
          </div>
        </div>
        {/* end left column */}

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Notification Channels */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              padding: "clamp(14px,2.5vw,22px)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: T.primary,
                marginBottom: 16,
              }}
            >
              Notification Channels
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { k: "email", icon: "mail", label: "Email" },
                { k: "sms", icon: "sms", label: "SMS Alerts" },
                { k: "push", icon: "notifications", label: "Push" },
              ].map((n) => (
                <div
                  key={n.k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      className="msym"
                      style={{ fontSize: 20, color: T.gray500 }}
                    >
                      {n.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: T.primary,
                      }}
                    >
                      {n.label}
                    </span>
                  </div>
                  <Toggle
                    on={notifs[n.k]}
                    onToggle={() => handleToggleNotif(n.k)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div
            style={{
              background: T.white,
              border: `1px solid ${T.gray100}`,
              borderRadius: 14,
              padding: "clamp(14px,2.5vw,22px)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: T.primary,
                marginBottom: 14,
              }}
            >
              Verification Status
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "mail", label: "Email", done: !!user?.is_verified },
                { icon: "smartphone", label: "Phone", done: !!user?.phone && !!user?.phone_verified },
                {
                  icon: "badge",
                  label: "Identity (ID)",
                  done: user?.kyc_tier > 1,
                },
              ].map((v) => (
                <div
                  key={v.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: T.offWhite,
                    borderRadius: 9,
                  }}
                >
                  <span
                    className="msym"
                    style={{
                      fontSize: 18,
                      color: v.done ? T.green : T.gray400,
                    }}
                  >
                    {v.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13.5,
                      color: T.primary,
                      fontWeight: 500,
                    }}
                  >
                    {v.label}
                  </span>
                  {v.done ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.green,
                        background: T.greenLt,
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      Verified
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.gray400,
                        background: "rgba(197,198,207,.25)",
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div
            style={{
              background: "#fff5f5",
              border: "1.5px solid #fecaca",
              borderRadius: 14,
              padding: "clamp(14px,2.5vw,22px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span className="msym" style={{ fontSize: 20, color: T.red }}>
                warning
              </span>
              <div style={{ fontWeight: 700, fontSize: 15, color: T.red }}>
                Danger Zone
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: T.gray500,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              Permanently delete your account and all associated escrow history.
              This action cannot be undone.
            </p>
            {deleteErr && (
              <div
                style={{
                  background: "#fef2f2",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                  color: T.red,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span className="msym" style={{ fontSize: 15 }}>
                  error
                </span>
                {deleteErr}
              </div>
            )}
            {!showDelete ? (
              <Btn
                variant="red"
                style={{ width: "100%", fontSize: 13 }}
                onClick={() => setShowDelete(true)}
              >
                Delete Account
              </Btn>
            ) : (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 9,
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.red,
                    marginBottom: 6,
                  }}
                >
                  Are you absolutely sure?
                </div>
                <p
                  style={{ fontSize: 12.5, color: T.gray500, marginBottom: 12 }}
                >
                  All your transactions, documents, and history will be
                  permanently erased.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant="outline"
                    style={{ flex: 1, fontSize: 12 }}
                    onClick={() => setShowDelete(false)}
                  >
                    Cancel
                  </Btn>
                  <Btn
                    variant="red"
                    style={{ flex: 1, fontSize: 12 }}
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? (
                      <>
                        <Spin /> Deleting...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* end right sidebar */}
      </div>
    </div>
  );
};
export default SettingsTab;
