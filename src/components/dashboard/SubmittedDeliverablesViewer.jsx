import { useState } from "react";
import { Btn } from "../ui";

function resolveEvidenceUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return "";

  let url = fileUrl.trim();

  // Fix accidentally concatenated duplicate URLs, e.g.:
  // "https://escrow-backend-s1ws.onrender.comhttps://res.cloudinary.com/..."
  // "https://escrow-backend-s1ws.onrender.com/https://..."
  // "http://localhost:4000https://..."
  const nestedHttpMatch = url.match(/https?:\/\/.*?(https?:\/\/.*)$/i);
  if (nestedHttpMatch && nestedHttpMatch[1]) {
    url = nestedHttpMatch[1];
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const configuredApiUrl = import.meta.env.VITE_API_URL;
  const backendBase = configuredApiUrl
    ? configuredApiUrl.replace(/\/api\/?$/, "")
    : "http://localhost:4000";

  const relativePath = url.startsWith("/") ? url : `/${url}`;
  return `${backendBase}${relativePath}`;
}

/**
 * Downloads a string of text as a local .txt file in the browser.
 */
function downloadTextFile(filename, textContent) {
  if (!textContent) return;

  const blob = new Blob([textContent], {
    type: "text/plain;charset=utf-8",
  });

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
async function downloadDeliverableFile(
  fileUrl,
  fileName = "deliverable.zip"
) {
  if (!fileUrl) return;

  const token =
    sessionStorage.getItem("vp_token") ||
    localStorage.getItem("vp_token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    "";

  const fullUrl = resolveEvidenceUrl(fileUrl);
  if (!fullUrl) return;

  const isLocalUpload = fullUrl.includes("/uploads/");

  // Try direct blob download first (works for local files and CORS-enabled public cloud storage)
  try {
    const headers = isLocalUpload && token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(fullUrl, { headers });

    if (response.ok) {
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
    }
  } catch (err) {
    console.warn(
      "Direct blob download failed, falling back to direct link / window.open:",
      err
    );
  }

  // Fallback: If fetch fails or CORS prevents blob, use link or window.open
  const urlWithToken = isLocalUpload && token
    ? `${fullUrl}${fullUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
    : fullUrl;

  const link = document.createElement("a");
  link.href = urlWithToken;
  link.download = fileName || "deliverable.zip";
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function SubmittedDeliverablesViewer({
  tx,
  activeMilestone,
}) {
  const [downloadingUrl, setDownloadingUrl] = useState(null);

  // Extract all milestones or specified active milestone
  const milestones = tx?.milestones || [];
  const submissions = [];

  milestones.forEach((m) => {
    if (Array.isArray(m.submissions)) {
      m.submissions.forEach((s) =>
        submissions.push({
          ...s,
          milestoneTitle: m.title,
        })
      );
    }
  });

  // If no submissions in array, check for deliverable_note on milestone
  let latestSub =
    submissions.length > 0
      ? submissions[submissions.length - 1]
      : null;

  const activeM =
    activeMilestone ||
    milestones.find(
      (m) =>
        m.deliverable_note ||
        (m.submissions && m.submissions.length > 0)
    ) ||
    milestones[0];

  const deliverableNote =
    latestSub?.deliverable_note ||
    activeM?.deliverable_note ||
    tx?.deliverable_note ||
    "";

  const subData = latestSub?.submission_data || {};

  const providerNotesText =
    subData.provider_notes ||
    subData.summary ||
    deliverableNote;

  // Extract files from submission_data evidence
  const fileItems = [];
  const linkItems = [];

  const isValidUrlOrPath = (str) => {
    if (!str || typeof str !== "string") return false;
    const s = str.trim();
    return (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("/") ||
      s.startsWith("uploads/") ||
      s.startsWith("./")
    );
  };

  const addEvidenceItem = (item) => {
    if (!item) return;

    const rawUrl =
      typeof item === "string"
        ? item
        : item.url || item.original_url || "";

    if (!isValidUrlOrPath(rawUrl)) return;

    const url = rawUrl.trim();
    const resolved = resolveEvidenceUrl(url);

    const label =
      item.label ||
      item.description ||
      item.type ||
      "Deliverable File";

    let fileName =
      item.file_name ||
      (url.includes("/")
        ? url.split("/").pop().split("?")[0]
        : "deliverable.zip");

    const isZip =
      url.toLowerCase().includes(".zip") ||
      (fileName && fileName.toLowerCase().endsWith(".zip")) ||
      label.toLowerCase().includes("zip") ||
      label.toLowerCase().includes("archive");

    if (isZip && !fileName.toLowerCase().endsWith(".zip")) {
      fileName = `${fileName}.zip`;
    }

    const isFile =
      url.includes("/uploads/") ||
      isZip ||
      (/\.(zip|tar|gz|rar|7z|pdf|docx?|xlsx?|png|jpe?g|gif|mp4|webm)$/i.test(fileName) &&
        !url.toLowerCase().includes("figma.com") &&
        !url.toLowerCase().includes("github.com") &&
        !url.toLowerCase().includes("gitlab.com"));

    if (item.type !== "link" && isFile) {
      if (!fileItems.some((f) => resolveEvidenceUrl(f.url) === resolved)) {
        fileItems.push({
          label,
          fileName,
          url,
          isZip,
        });
      }
    } else {
      if (!linkItems.some((l) => resolveEvidenceUrl(l.url) === resolved)) {
        linkItems.push({
          label,
          url,
        });
      }
    }
  };

  if (Array.isArray(subData.additional_evidence)) {
    subData.additional_evidence.forEach(addEvidenceItem);
  }

  if (Array.isArray(subData.deliverables)) {
    subData.deliverables.forEach((d) => {
      if (Array.isArray(d.evidence)) {
        d.evidence.forEach(addEvidenceItem);
      }
    });
  }

  if (subData.testing?.reportUrl) {
    addEvidenceItem({
      label: "Automated Test Report",
      url: subData.testing.reportUrl,
    });
  }

  // Also check milestone level evidence_items
  milestones.forEach((m) => {
    if (Array.isArray(m.evidence_items)) {
      m.evidence_items.forEach((e) => {
        addEvidenceItem({
          label:
            e.file_name ||
            `${e.evidence_type?.toUpperCase()} Deliverable Package`,
          url: e.original_url || e.file_path,
          file_name: e.file_name,
          type: e.evidence_type,
        });
      });
    }
  });

  // Fallback: search raw deliverable note text for ZIP or uploaded links if not explicitly in JSON
  if (fileItems.length === 0 && providerNotesText) {
    const urlMatches = providerNotesText.match(
      /(https?:\/\/[^\s]+|\/uploads\/[^\s]+)/gi
    );

    if (urlMatches) {
      urlMatches.forEach((url) => {
        const cleanUrl = url.replace(/[.,;)]+$/, "");

        const fileName =
          cleanUrl.split("/").pop().split("?")[0] ||
          "deliverable.zip";

        const isZip =
          cleanUrl.toLowerCase().includes(".zip");

        if (!fileItems.some((f) => f.url === cleanUrl)) {
          fileItems.push({
            label: isZip
              ? "Complete Project Implementation Archive (.zip)"
              : "Submitted Deliverable File",
            fileName,
            url: cleanUrl,
            isZip,
          });
        }
      });
    }
  }

  if (
    !providerNotesText &&
    fileItems.length === 0 &&
    linkItems.length === 0
  ) {
    return null;
  }

  const txCode =
    tx?.id ||
    tx?.txn_code ||
    "PROJECT";

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            className="msym"
            style={{
              fontSize: 22,
              color: "#2563eb",
            }}
          >
            inventory_2
          </span>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#0f172a",
              }}
            >
              Submitted Deliverables &amp; Provider Evidence
            </div>

            <div
              style={{
                fontSize: 11.5,
                color: "#64748b",
              }}
            >
              Manual inspection files &amp; text submitted by provider
              {latestSub?.version
                ? ` • Submission v${latestSub.version}`
                : ""}
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
            onClick={() =>
              downloadTextFile(
                `provider_note_${txCode}.txt`,
                providerNotesText
              )
            }
          >
            <span
              className="msym"
              style={{ fontSize: 16 }}
            >
              download
            </span>
            Download Provider Note (.txt)
          </Btn>
        )}
      </div>

      {/* Checkpoint Summary — what was contracted for this milestone */}
      {activeM && (activeM.expected_project_progress != null || (Array.isArray(activeM.deliverables) && activeM.deliverables.length > 0) || (Array.isArray(activeM.acceptance_criteria) && activeM.acceptance_criteria.length > 0)) && (
        <div
          style={{
            background: "#faf5ff",
            border: "1px solid #e9d5ff",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span className="msym" style={{ fontSize: 16, color: "#7c3aed" }}>flag</span>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#6d28d9" }}>
              Agreed Checkpoint — {activeM.title || "Milestone"}
            </span>
            {activeM.expected_project_progress != null && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#ede9fe", borderRadius: 6, padding: "1px 7px", marginLeft: "auto" }}>
                🎯 {activeM.expected_project_progress}%
              </span>
            )}
          </div>
          {Array.isArray(activeM.deliverables) && activeM.deliverables.length > 0 && (
            <div style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6d28d9", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Expected Deliverables</div>
              {activeM.deliverables.map((d, idx) => (
                <div key={idx} style={{ fontSize: 11.5, color: "#374151", paddingLeft: 6, display: "flex", gap: 5, lineHeight: 1.5 }}>
                  <span style={{ color: "#7c3aed", flexShrink: 0 }}>•</span>
                  <span>{typeof d === "string" ? d : d.name || d.description || JSON.stringify(d)}</span>
                </div>
              ))}
            </div>
          )}
          {Array.isArray(activeM.acceptance_criteria) && activeM.acceptance_criteria.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0369a1", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>Acceptance Criteria</div>
              {activeM.acceptance_criteria.map((c, idx) => (
                <div key={idx} style={{ fontSize: 11.5, color: "#374151", paddingLeft: 6, display: "flex", gap: 5, lineHeight: 1.5 }}>
                  <span style={{ color: "#0369a1", flexShrink: 0 }}>✓</span>
                  <span>{typeof c === "string" ? c : c.description || c.text || JSON.stringify(c)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submitted Files & ZIP Packages List */}
      {fileItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 12,
              color: "#475569",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              className="msym"
              style={{
                fontSize: 16,
                color: "#2563eb",
              }}
            >
              folder_zip
            </span>
            Submitted Deliverable Files &amp; Archives:
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: file.isZip
                        ? "#dbeafe"
                        : "#e0f2fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="msym"
                      style={{
                        fontSize: 20,
                        color: file.isZip
                          ? "#1d4ed8"
                          : "#0284c7",
                      }}
                    >
                      {file.isZip
                        ? "folder_zip"
                        : "insert_drive_file"}
                    </span>
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: "#0369a1",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.label}
                    </div>

                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
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
                    background:
                      downloadingUrl === file.url
                        ? "#64748b"
                        : "#0284c7",
                    borderColor:
                      downloadingUrl === file.url
                        ? "#64748b"
                        : "#0284c7",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    cursor:
                      downloadingUrl === file.url
                        ? "wait"
                        : "pointer",
                  }}
                  onClick={async () => {
                    try {
                      setDownloadingUrl(file.url);

                      await downloadDeliverableFile(
                        file.url,
                        file.fileName
                      );
                    } finally {
                      setDownloadingUrl(null);
                    }
                  }}
                >
                  <span
                    className="msym"
                    style={{ fontSize: 16 }}
                  >
                    {downloadingUrl === file.url
                      ? "hourglass_top"
                      : "file_download"}
                  </span>

                  {downloadingUrl === file.url
                    ? "Downloading..."
                    : `Download Deliverable (${
                        file.isZip ? "ZIP" : "File"
                      })`}
                </Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Repository, Figma, or Staging Links */}
      {linkItems.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {linkItems.map((link, idx) => {
            const lowerUrl = (link.url || "").toLowerCase();
            const isFigma = lowerUrl.includes("figma.com");
            const isGithub =
              lowerUrl.includes("github.com") || lowerUrl.includes("gitlab.com");
            return (
              <a
                key={idx}
                href={resolveEvidenceUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: isFigma
                    ? "#fdf2f8"
                    : isGithub
                    ? "#f8fafc"
                    : "#f0f9ff",
                  border: isFigma
                    ? "1px solid #fbcfe8"
                    : isGithub
                    ? "1px solid #cbd5e1"
                    : "1px solid #bae6fd",
                  borderRadius: 8,
                  fontSize: 12,
                  color: isFigma
                    ? "#be185d"
                    : isGithub
                    ? "#0f172a"
                    : "#0369a1",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span
                  className="msym"
                  style={{
                    fontSize: 15,
                    color: isFigma
                      ? "#db2777"
                      : isGithub
                      ? "#334155"
                      : "#0284c7",
                  }}
                >
                  {isFigma ? "palette" : isGithub ? "code" : "open_in_new"}
                </span>

                {link.label &&
                !link.label.startsWith("2. Project Link") &&
                !link.label.startsWith("3. Project Link")
                  ? link.label
                  : isFigma
                  ? "Open Figma Link"
                  : isGithub
                  ? "Open Repository Link"
                  : "Open Project Link"}
              </a>
            );
          })}
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
        <span
          className="msym"
          style={{
            fontSize: 15,
            color: "#0284c7",
          }}
        >
          info
        </span>

        <span>
          <strong>Manual Verification:</strong> You can
          download the submitted files and notes above to
          test the work manually on your machine before
          releasing payment.
        </span>
      </div>
    </div>
  );
}