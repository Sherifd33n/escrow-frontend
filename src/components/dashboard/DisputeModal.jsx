import { useState, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { transactions } from "../../utils/api";

const F = ({ label, req, children }) => (
  <div>
    <div style={{ fontSize:13, fontWeight:600, color:T.gray700, marginBottom:8 }}>
      {label}{req && <span style={{ color:T.red }}> *</span>}
    </div>
    {children}
  </div>
);

const DisputeModal = ({ tx, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [desc,   setDesc]   = useState("");
  const [files,  setFiles]  = useState([]);
  const [ld,     setLd]     = useState(false);
  const [summ,   setSumm]   = useState("");
  const [done,   setDone]   = useState(false);
  const [err,    setErr]    = useState("");

  const [existingDispute, setExistingDispute] = useState(null);
  const [loadingDispute, setLoadingDispute] = useState(false);
  const [disputeError, setDisputeError] = useState("");

  useEffect(() => {
    if (tx.status === "disputed") {
      setLoadingDispute(true);
      transactions.getDispute(tx.id)
        .then(({ data, error }) => {
          setLoadingDispute(false);
          if (error) {
            setDisputeError(error);
          } else if (data) {
            setExistingDispute(data);
          }
        })
        .catch(err => {
          setLoadingDispute(false);
          setDisputeError("Failed to load dispute details.");
        });
    }
  }, [tx]);

  const sub = async () => {
    if (!reason || !desc) return;
    setLd(true);
    setErr("");
    try {
      const { data, error } = await transactions.fileDispute(tx.id, {
        reason,
        evidence: desc + (files.length ? `\n\nAttachments: ${files.join(", ")}` : "")
      });
      setLd(false);
      if (error) {
        setErr(error);
      } else {
        setSumm(
          `A dispute has been filed for "${tx.title}". The client reports: ${reason.toLowerCase()}. ` +
          `Both parties have been notified and escrow funds are now frozen. ` +
          `A Dispute Resolution Officer will review all communications and deliverables and issue a binding decision within 5 business days.`
        );
        setDone(true);
        onSubmit();
      }
    } catch (e) {
      setLd(false);
      setErr(e.message || "An unexpected error occurred.");
    }
  };

  if (loadingDispute) {
    return (
      <div
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, padding:40, textAlign:"center" }}>
          <Spin />
          <div style={{ marginTop:12, fontSize:14, color:T.gray500 }}>Loading dispute details...</div>
        </div>
      </div>
    );
  }

  if (disputeError) {
    return (
      <div
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, padding:30, textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,.25)" }}>
          <span className="msym" style={{ fontSize:40, color:T.red, display:"block", marginBottom:12 }}>error</span>
          <div style={{ fontWeight:700, fontSize:16, color:T.primary, marginBottom:8 }}>Error Loading Dispute</div>
          <p style={{ fontSize:13.5, color:T.gray500, marginBottom:20 }}>{disputeError}</p>
          <Btn variant="outline" onClick={onClose} style={{ width:"100%" }}>Close</Btn>
        </div>
      </div>
    );
  }

  if (existingDispute) {
    return (
      <div
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,.25)" }}>
          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)", padding:"22px 26px", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", borderRadius:"20px 20px 0 0", flexShrink:0 }}>
            <div>
              <div style={{ fontWeight:800, fontSize:17, display:"flex", alignItems:"center", gap:8 }}>
                <span className="msym" style={{ fontSize:20 }}>gavel</span>Dispute Details
              </div>
              <div style={{ fontSize:12, opacity:.65, marginTop:3 }}>{tx.title}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.12)", border:"none", color:"#fff", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span className="msym" style={{ fontSize:20 }}>close</span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding:"24px 26px", overflowY:"auto", flex:1, display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.gray400, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Status</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:existingDispute.status === "resolved" ? T.greenLt : "#fff5f5", border: `1px solid ${existingDispute.status === "resolved" ? T.green : "#fecaca"}`, borderRadius:20, padding:"4px 12px", fontSize:12.5, fontWeight:700, color:existingDispute.status === "resolved" ? T.green : "#ba1a1a" }}>
                <span className="msym" style={{ fontSize:14 }}>{existingDispute.status === "resolved" ? "check_circle" : "warning"}</span>
                {existingDispute.status === "resolved" ? "Resolved" : existingDispute.status === "under_review" ? "Under Review" : "Filed"}
              </div>
            </div>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.gray400, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Reason</div>
              <div style={{ fontSize:13.5, color:T.primary, fontWeight:600 }}>{existingDispute.reason}</div>
            </div>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.gray400, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Evidence / Description</div>
              <div style={{ fontSize:13.5, color:T.gray700, background:T.offWhite, padding:12, borderRadius:8, whiteSpace:"pre-wrap", lineHeight:1.6 }}>{existingDispute.evidence || "No evidence uploaded."}</div>
            </div>

            <div>
              <div style={{ fontSize:11, fontWeight:700, color:T.gray400, textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Filed Date</div>
              <div style={{ fontSize:13, color:T.primary }}>{new Date(existingDispute.created_at).toLocaleString()}</div>
            </div>

            {existingDispute.status === "resolved" && (
              <div style={{ background:T.greenLt, border:`1px solid ${T.green}`, borderRadius:12, padding:"16px" }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.green, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                  <span className="msym" style={{ fontSize:15 }}>gavel</span>Resolution Decision
                </div>
                <p style={{ fontSize:13, color:"#1b1b1e", lineHeight:1.7, margin:0 }}>{existingDispute.resolution}</p>
              </div>
            )}

            <div style={{ marginTop:10 }}>
              <Btn variant="outline" onClick={onClose} style={{ width:"100%" }}>Close</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background:"#fff", borderRadius:20, width:"100%", maxWidth:520, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 32px 80px rgba(0,0,0,.25)" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#7f1d1d,#991b1b)", padding:"22px 26px", color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", borderRadius:"20px 20px 0 0", flexShrink:0 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:17, display:"flex", alignItems:"center", gap:8 }}>
              <span className="msym" style={{ fontSize:20 }}>gavel</span>File a Dispute
            </div>
            <div style={{ fontSize:12, opacity:.65, marginTop:3 }}>{tx.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.12)", border:"none", color:"#fff", borderRadius:"50%", width:32, height:32, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span className="msym" style={{ fontSize:20 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding:"24px 26px", overflowY:"auto", flex:1 }}>
          {done ? (
            <>
              <div style={{ textAlign:"center", marginBottom:20 }}>
                <span className="msym" style={{ fontSize:44, color:"#dc2626", display:"block", marginBottom:12 }}>gavel</span>
                <div style={{ fontWeight:700, fontSize:18, color:"#dc2626", marginBottom:6 }}>Dispute Filed</div>
                <p style={{ fontSize:13.5, color:"#75777f" }}>Both parties notified. Our team reviews within 24 hours.</p>
              </div>
              <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:12, padding:"16px 18px", marginBottom:16 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#dc2626", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                  <span className="msym" style={{ fontSize:15 }}>smart_toy</span>AI Case Summary
                </div>
                <p style={{ fontSize:13, color:"#44474e", lineHeight:1.8, margin:0 }}>{summ}</p>
              </div>
              <div style={{ background:"#f5f3f6", borderRadius:10, padding:"13px 15px", fontSize:12.5, color:"#75777f", lineHeight:1.65, marginBottom:20 }}>
                A Dispute Resolution Officer will contact both parties within 24 hours with next steps.
              </div>
              <Btn variant="outline" onClick={onClose} style={{ width:"100%" }}>Close</Btn>
            </>
          ) : (
            <>
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px", fontSize:13, color:"#991b1b", lineHeight:1.65, marginBottom:20 }}>
                <span className="msym" style={{ fontSize:14, verticalAlign:"middle", marginRight:6 }}>warning</span>
                Filing a dispute freezes escrow funds and notifies the other party.
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <F label="Dispute Reason" req>
                  {["Deliverable does not match agreed scope","Work is incomplete or non-functional","No delivery made after funding","Scope was changed without agreement","Other"].map(r => (
                    <label key={r} style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer", padding:"9px 13px", borderRadius:8, border:`1.5px solid ${reason===r?"#dc2626":"#e4e2e5"}`, background:reason===r?"#fff5f5":"#fff", marginBottom:7, transition:"all .15s" }}>
                      <input type="radio" name="reason" value={r} checked={reason===r} onChange={() => setReason(r)} style={{ accentColor:"#dc2626" }}/>
                      <span style={{ fontSize:13.5, color:"#1b1b1e" }}>{r}</span>
                    </label>
                  ))}
                </F>

                <F label="Describe the issue" req>
                  <textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    rows={4}
                    placeholder="Explain what was promised, what was delivered, and what the problem is…"
                    style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid #c5c6cf", fontSize:13.5, resize:"vertical", lineHeight:1.65, fontFamily:"inherit", boxSizing:"border-box", outline:"none" }}
                  />
                </F>

                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#44474e", marginBottom:8 }}>Upload Evidence (optional)</div>
                  <div
                    style={{ border:"2px dashed #c5c6cf", borderRadius:10, padding:"20px", textAlign:"center", cursor:"pointer", background:"#f5f3f6" }}
                    onClick={() => { const names=["screenshot.png","contract.pdf","chat_export.txt"]; setFiles(p => p.length < 3 ? [...p, names[p.length]] : p); }}
                  >
                    <span className="msym" style={{ fontSize:28, color:"#75777f", display:"block", marginBottom:6 }}>attach_file</span>
                    <div style={{ fontSize:13, fontWeight:600, color:"#001637", marginBottom:3 }}>Click to attach files</div>
                    <div style={{ fontSize:12, color:"#75777f" }}>Screenshots, contracts, code links, chat exports</div>
                  </div>
                  {files.length > 0 && (
                    <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:7 }}>
                      {files.map((f, i) => (
                        <span key={i} style={{ fontSize:12, background:"#f5f3f6", border:"1px solid #e4e2e5", borderRadius:6, padding:"4px 10px", color:"#001637", fontWeight:500 }}>📎 {f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {err && (
                <div style={{ color: T.red, fontSize: 13, marginTop: 10, textAlign: "center" }}>
                  {err}
                </div>
              )}

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <Btn variant="outline" onClick={onClose} style={{ flex:1 }}>Cancel</Btn>
                <Btn variant="red" onClick={sub} disabled={!reason || !desc || ld} style={{ flex:1 }}>
                  {ld ? <><Spin/>Analysing…</> : "File Dispute →"}
                </Btn>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default DisputeModal;
