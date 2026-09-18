import { useState, useEffect } from "react";
import { getDeadlineCountdown } from "../../utils/deadline";

/**
 * Milestone deadline badge with clear submission due date & real-time countdown.
 * Decouples milestone payment from deliverable submission: if client pays in advance
 * but provider has not submitted, the submission due date & countdown remain active.
 */
export const MilestoneDeadlineCountdown = ({
  dueDate,
  timeline,
  status,
  hasSubmission = false,
  reviewDays = 3,
  style = {},
}) => {
  // Trigger regular ticker so countdown updates live
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!dueDate) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [dueDate]);

  // A milestone is truly delivered/completed when:
  // - status is approved/completed with submission, OR explicitly marked approved
  const isApproved = status === "approved" || status === "completed";
  const isPaidWithoutSubmission = status === "paid" && !hasSubmission;
  const isDone = (isApproved && hasSubmission) || (status === "approved" && !isPaidWithoutSubmission);
  const isSubmitted = status === "submitted";
  const info = getDeadlineCountdown(dueDate);

  if (isDone && hasSubmission) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "#15803d",
          marginTop: 6,
          paddingTop: 5,
          borderTop: "1px dashed #e2e8f0",
          ...style,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
          <span>📅</span>
          <span>{info?.formattedDate || (dueDate ? String(dueDate).split("T")[0] : "Delivered")}</span>
        </span>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
            borderRadius: 5,
            padding: "1px 5px",
          }}
        >
          ✓ Delivered
        </span>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: "#0369a1",
          marginTop: 6,
          paddingTop: 5,
          borderTop: "1px dashed #e2e8f0",
          ...style,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}>
          <span>🔍</span>
          <span>Under Review</span>
        </span>
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            background: "#e0f2fe",
            border: "1px solid #bae6fd",
            color: "#0369a1",
            borderRadius: 5,
            padding: "1px 5px",
          }}
        >
          {reviewDays}d review window
        </span>
      </div>
    );
  }

  // If milestone is paid in advance OR upcoming/in-progress, submission deadline & countdown MUST remain visible
  if (info) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginTop: 6,
          paddingTop: 5,
          borderTop: "1px dashed #e2e8f0",
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <span>📥</span>
            <span>Submission Due</span>
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              background: info.badgeBg,
              border: `1px solid ${info.badgeBorder}`,
              color: info.badgeColor,
              borderRadius: 5,
              padding: "1px 6px",
              whiteSpace: "nowrap",
              letterSpacing: ".01em",
            }}
          >
            {info.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, fontSize: 10.5, color: "#64748b", fontWeight: 500 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span>📅</span>
            <span>{info.formattedDate}</span>
          </span>
          {isPaidWithoutSubmission && (
            <span style={{ fontSize: 9.5, fontWeight: 700, color: "#047857", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 4, padding: "1px 5px" }}>
              💰 Funded
            </span>
          )}
        </div>
      </div>
    );
  }

  if (timeline) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          fontSize: 10.5,
          color: "#64748b",
          marginTop: 6,
          paddingTop: 5,
          borderTop: "1px dashed #e2e8f0",
          ...style,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".04em" }}>
          Target Timeline
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#4338ca", background: "#eef2ff", borderRadius: 4, padding: "1px 5px" }}>
          ⏱ {timeline}
        </span>
      </div>
    );
  }

  return null;
};

/**
 * Transaction-level overall deadline countdown banner/pill.
 */
export const TransactionDeadlinePill = ({
  deadline,
  timeline,
  status,
  style = {},
}) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isCompleted = ["completed", "approved"].includes(status);
  const info = getDeadlineCountdown(deadline);

  if (isCompleted) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11.5,
          fontWeight: 600,
          color: "#15803d",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "4px 10px",
          ...style,
        }}
      >
        <span>✓</span>
        <span>Project Delivered & Approved</span>
      </div>
    );
  }

  if (info) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11.5,
          fontWeight: 600,
          color: info.badgeColor,
          background: info.badgeBg,
          border: `1px solid ${info.badgeBorder}`,
          borderRadius: 8,
          padding: "4px 10px",
          ...style,
        }}
      >
        <span className="msym" style={{ fontSize: 15 }}>
          schedule
        </span>
        <span>
          Final Project Deadline: <strong>{info.formattedDate}</strong> ({info.label.replace("⏰ ", "").replace("⚠️ ", "")})
        </span>
      </div>
    );
  }

  if (timeline) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11.5,
          fontWeight: 600,
          color: "#4338ca",
          background: "#eef2ff",
          border: "1px solid #c7d2fe",
          borderRadius: 8,
          padding: "4px 10px",
          ...style,
        }}
      >
        <span className="msym" style={{ fontSize: 15 }}>
          schedule
        </span>
        <span>Est. Project Timeline: {timeline}</span>
      </div>
    );
  }

  return null;
};

export default MilestoneDeadlineCountdown;
