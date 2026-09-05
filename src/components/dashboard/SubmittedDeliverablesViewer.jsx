import React, { useState } from "react";
import { T } from "../../tokens";
import { Btn } from "../ui";

/**
 * Downloads a string of text as a local .txt file in the browser.
 */
export function downloadTextFile(filename, textContent) {
  if (!textContent) return;
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "provider_note.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Initiates browser download for a deliverable file or URL using authentication.
 */
export async function downloadDeliverableFile(fileUrl, fileName = "deliverable.zip") {
  if (!fileUrl) return;
  const token =
    sessionStorage.getItem("vp_token") ||
    localStorage.getItem("vp_token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    "";
  const backendBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://localhost:4000";

  const fullUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${backendBase}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;

  // If local /uploads/ URL, perform authenticated fetch to get blob and trigger download
  if (fullUrl.includes("/uploads/")) {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(fullUrl, { headers });

      if (!response.ok) {
        // Fallback: Try with query parameter token
        const urlWithToken = `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
        window.open(urlWithToken, "_blank");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName || "deliverable.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      return;
    } catch (err) {
      console.warn("Direct blob download failed, falling back to window.open with token query:", err);
      const urlWithToken = `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`;
      window.open(urlWithToken, "_blank");
      return;
    }
  }

  // External URLs (e.g. GitHub releases, S3 links)
  const link = document.createElement("a");
  link.href = fullUrl;
  link.download = fileName || "deliverable.zip";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function SubmittedDeliverablesViewer({ tx, activeMilestone, compact = false }) {
  const [downloadingUrl, setDownloadingUrl] = useState(null);

  // Extract all milestones or specified active milestone
  const milestones = tx?.milestones || [];
  const submissions = [];

  milestones.forEach((m) => {
    if (Array.isArray(m.submissions)) {
      m.submissions.forEach((s) => submissions.push({ ...s, milestoneTitle: m.title }));
    }
  });

  // If no submissions in array, check for deliverable_note on milestone
  let latestSub = submissions.length > 0 ? submissions[submissions.length - 1] : null;
  
  const activeM = activeMilestone || milestones.find((m) => m.deliverable_note || (m.submissions && m.submissions.length > 0)) || milestones[0];

  const deliverableNote = latestSub?.deliverable_note || activeM?.deliverable_note || tx?.deliverable_note || "";
  const subData = latestSub?.submission_data || {};
  const providerNotesText = subData.provider_notes || subData.summary || deliverableNote;

  // Extract files from submission_data evidence
  const fileItems = [];
  const linkItems = [];

  const addEvidenceItem = (item) => {
    if (!item) return;
    const url = typeof item === "string" ? item : item.url || item.original_url || "";
    if (!url) return;

    const label = item.label || item.description || item.type || "Deliverable File";
    const fileName = item.file_name || (url.includes("/") ? url.split("/").pop().split("?")[0] : "deliverable.zip");
    const isZip = url.toLowerCase().includes(".zip") || (fileName && fileName.toLowerCase().endsWith(".zip"));

    if (url.includes("/uploads/") || isZip || fileName.includes(".")) {
      if (!fileItems.some((f) => f.url === url)) {
        fileItems.push({ label, fileName, url, isZip });
      }
    } else {
      if (!linkItems.some((l) => l.url === url)) {
        linkItems.push({ label, url });
      }
    }
  };

  if (Array.isArray(subData.additional_evidence)) {
    subData.additional_evidence.forEach(addEvidenceItem);
  }
  if (Array.isArray(subData.deliverables)) {
    subData.deliverables.forEach((d) => {
      if (Array.isArray(d.evidence)) d.evidence.forEach(addEvidenceItem);
    });
  }
  if (subData.testing?.reportUrl) {
    addEvidenceItem({ label: "Automated Test Report", url: subData.testing.reportUrl });
  }

  // Also check milestone level evidence_items
  milestones.forEach((m) => {
    if (Array.isArray(m.evidence_items)) {
      m.evidence_items.forEach((e) => {
        addEvidenceItem({
          label: e.file_name || `${e.evidence_type?.toUpperCase()} Deliverable Package`,
          url: e.original_url || e.file_path,
          file_name: e.file_name,
          type: e.evidence_type,
        });
      });
    }
  });

  // Fallback: search raw deliverable note text for ZIP or uploaded links if not explicitly in JSON
  if (fileItems.length === 0 && providerNotesText) {
    const urlMatches = providerNotesText.match(/(https?:\/\/[^\s]+|\/uploads\/[^\s]+)/gi);
    if (urlMatches) {
      urlMatches.forEach((url) => {
        const cleanUrl = url.replace(/[.,;)]+$/, "");
        const fileName = cleanUrl.split("/").pop().split("?")[0] || "deliverable.zip";
        const isZip = cleanUrl.toLowerCase().includes(".zip");
        if (!fileItems.some((f) => f.url === cleanUrl)) {
          fileItems.push({
            label: isZip ? "Complete Project Implementation Archive (.zip)" : "Submitted Deliverable File",
            fileName,
            url: cleanUrl,
            isZip,
          });
        }
      });
    }
  }

  if (!providerNotesText && fileItems.length === 0 && linkItems.length === 0) {
    return null;
  }

  const txCode = tx?.id || tx?.txn_code || "PROJECT";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        padding: "16px 18px",
        marginTop: 12,
        marginBottom: 14,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: "1px solid #f1f5f9",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="msym" style={{ fontSize: 22, color: "#2563eb" }}>
            inventory_2
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
              Submitted Deliverables &amp; Provider Evidence
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b" }}>
              Manual inspection files &amp; text submitted by provider
              {latestSub?.version ? ` • Submission v${latestSub.version}` : ""}
            </div>
          </div>
        </div>

        {/* Action Buttons for downloading note as file */}
        {providerNotesText && (
          <Btn
            variant="outline"
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderColor: "#2563eb",
              color: "#1d4ed8",
              background: "#eff6ff",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            onClick={() => downloadTextFile(`provider_note_${txCode}.txt`, providerNotesText)}
          >
            <span className="msym" style={{ fontSize: 16 }}>
              download
            </span>
            Download Provider Note (.txt)
          </Btn>
        )}
      </div>



      {/* Submitted Files & ZIP Packages List */}
      {fileItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#475569", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <span className="msym" style={{ fontSize: 16, color: "#2563eb" }}>
              folder_zip
            </span>
            Submitted Deliverable Files &amp; Archives:
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fileItems.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: 8,
                  padding: "10px 14px",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: file.isZip ? "#dbeafe" : "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="msym" style={{ fontSize: 20, color: file.isZip ? "#1d4ed8" : "#0284c7" }}>
                      {file.isZip ? "folder_zip" : "insert_drive_file"}
                    </span>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#0369a1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.fileName}
                    </div>
                  </div>
                </div>

                <Btn
                  variant="teal"
                  disabled={downloadingUrl === file.url}
                  style={{
                    fontSize: 12,
                    padding: "6px 14px",
                    background: downloadingUrl === file.url ? "#64748b" : "#0284c7",
                    borderColor: downloadingUrl === file.url ? "#64748b" : "#0284c7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    cursor: downloadingUrl === file.url ? "wait" : "pointer",
                  }}
                  onClick={async () => {
                    try {
                      setDownloadingUrl(file.url);
                      await downloadDeliverableFile(file.url, file.fileName);
                    } finally {
                      setDownloadingUrl(null);
                    }
                  }}
                >
                  <span className="msym" style={{ fontSize: 16 }}>
                    {downloadingUrl === file.url ? "hourglass_top" : "file_download"}
                  </span>
                  {downloadingUrl === file.url
                    ? "Downloading..."
                    : `Download Deliverable (${file.isZip ? "ZIP" : "File"})`}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Repository or Staging Links */}
      {linkItems.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {linkItems.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 12,
                color: "#334155",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <span className="msym" style={{ fontSize: 15 }}>
                open_in_new
              </span>
              {link.label || "View External Link"}
            </a>
          ))}
        </div>
      )}

      {/* Info notice for Client Manual Verification */}
      <div
        style={{
          marginTop: 12,
          padding: "8px 12px",
          background: "#f8fafc",
          borderRadius: 6,
          fontSize: 11.5,
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span className="msym" style={{ fontSize: 15, color: "#0284c7" }}>
          info
        </span>
        <span>
          <strong>Manual Verification:</strong> You can download the submitted files and notes above to test the work manually on your machine before releasing payment.
        </span>
      </div>
    </div>
  );
}
