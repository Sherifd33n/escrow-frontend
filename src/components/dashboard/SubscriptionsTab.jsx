import { useState } from "react";
import { SUBSCRIBED_PAYMENTS, PLANS } from "../../data/constants";

const STATUS_CFG = {
  in_progress: { label:"In Progress", dot:"#3b82f6", bg:"#eff6ff", color:"#1d4ed8" },
  completed:   { label:"Completed",   dot:"#006c47", bg:"#f0fdf4", color:"#006c47" },
  due:         { label:"Payment Due",  dot:"#ef4444", bg:"#fef2f2", color:"#dc2626" },
  upcoming:    { label:"Upcoming",    dot:"#8b5cf6", bg:"#f5f3ff", color:"#7c3aed" },
};

const MILESTONE_CFG = {
  paid:     { label:"Paid",    icon:"check_circle",  color:"#006c47", bg:"#f0fdf4" },
  due:      { label:"Due Now", icon:"schedule",      color:"#dc2626", bg:"#fef2f2" },
  upcoming: { label:"Upcoming",icon:"radio_button_unchecked", color:"#8b5cf6", bg:"#f5f3ff" },
};

function PaymentCard({ payment, onPay }) {
  const [open, setOpen] = useState(false);
  const plan = PLANS.find(p => p.id === payment.plan);
  const sc = STATUS_CFG[payment.status];
  const pct = Math.round((payment.paid / payment.totalAmount) * 100);
  const gradStr = plan ? `linear-gradient(135deg,${plan.gradient.join(",")})` : "#001637";

  return (
    <div style={{background:"#fff",borderRadius:16,border:"1px solid #e9e7eb",overflow:"hidden",
      boxShadow:"0 2px 12px rgba(0,0,0,.04)",transition:"box-shadow .2s"}} className="pay-card">

      {/* Card top bar – matches plan colour */}
      <div style={{height:6,background:gradStr}}/>

      <div style={{padding:"20px 20px 16px"}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:16}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,fontWeight:700,color:"#001637",marginBottom:4,
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {payment.serviceTitle}
            </div>
            <div style={{fontSize:12,color:"#75777f",display:"flex",alignItems:"center",gap:6}}>
              <span className="msym" style={{fontSize:14}}>business</span>{payment.vendor}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6,background:sc.bg,borderRadius:20,
              padding:"4px 12px"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:sc.dot,flexShrink:0}}/>
              <span style={{fontSize:11,fontWeight:700,color:sc.color}}>{sc.label}</span>
            </div>
            {plan && (
              <div style={{display:"flex",alignItems:"center",gap:4,
                background:gradStr,borderRadius:6,padding:"2px 10px"}}>
                <span className="msym" style={{fontSize:12,color:"#fff"}}>{plan.icon}</span>
                <span style={{fontSize:10,fontWeight:700,color:"#fff"}}>{plan.name.toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financials */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:12,marginBottom:16}}>
          {[
            {label:"Total",value:`$${payment.totalAmount.toLocaleString()}`,icon:"payments",color:"#001637"},
            {label:"Paid",value:`$${payment.paid.toLocaleString()}`,icon:"check_circle",color:"#006c47"},
            {label:"Remaining",value:`$${payment.remaining.toLocaleString()}`,icon:"schedule",color: payment.remaining > 0 ? "#dc2626" : "#006c47"},
          ].map(f => (
            <div key={f.label} style={{background:"#f5f3f6",borderRadius:10,padding:"12px 14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                <span className="msym" style={{fontSize:14,color:f.color}}>{f.icon}</span>
                <span style={{fontSize:10,fontWeight:600,color:"#75777f",letterSpacing:".04em"}}>{f.label.toUpperCase()}</span>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:f.color}}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:11,fontWeight:600,color:"#75777f"}}>Payment Progress</span>
            <span style={{fontSize:11,fontWeight:700,color:"#001637"}}>{pct}%</span>
          </div>
          <div style={{height:8,background:"#f0eef1",borderRadius:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,borderRadius:8,
              background: pct===100 ? "#006c47" : gradStr,
              transition:"width .4s ease"}}/>
          </div>
        </div>

        {/* Dates */}
        <div style={{display:"flex",gap:16,fontSize:11,color:"#75777f",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span className="msym" style={{fontSize:14}}>calendar_today</span>
            Started: {payment.startDate}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span className="msym" style={{fontSize:14}}>event</span>
            Due: {payment.dueDate}
          </div>
        </div>

        {/* Expand milestones */}
        <button onClick={() => setOpen(v => !v)}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
            background:"#f5f3f6",border:"1px solid #e9e7eb",borderRadius:10,
            padding:"10px 14px",cursor:"pointer",fontFamily:"'Inter',sans-serif",
            fontSize:13,fontWeight:600,color:"#44474e",transition:"background .15s"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span className="msym" style={{fontSize:16}}>account_tree</span>
            Milestones ({payment.milestones.length})
          </div>
          <span className="msym" style={{fontSize:18,transition:"transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)"}}>expand_more</span>
        </button>

        {open && (
          <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8,animation:"fadeIn .2s ease"}}>
            {payment.milestones.map((m,i) => {
              const mc = MILESTONE_CFG[m.status];
              const isDue = m.status === "due";
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,
                  background: mc.bg,borderRadius:10,padding:"12px 14px",
                  border:`1px solid ${isDue ? "#fecaca" : "#e9e7eb"}`}}>
                  <div style={{width:32,height:32,borderRadius:8,background:"#fff",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                    boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
                    <span className="msym" style={{fontSize:18,color:mc.color}}>{mc.icon}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#001637",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</div>
                    <div style={{fontSize:11,color:"#75777f",marginTop:2}}>
                      {m.date} · <span style={{fontWeight:600,color:mc.color}}>{mc.label}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:"#001637"}}>${m.amount.toLocaleString()}</div>
                    {isDue && (
                      <button onClick={() => onPay(payment,m)}
                        style={{marginTop:4,background:"#dc2626",color:"#fff",border:"none",
                          borderRadius:6,padding:"4px 12px",fontSize:11,fontWeight:700,
                          cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsTab({ user, navigate }) {
  const [payments, setPayments] = useState(SUBSCRIBED_PAYMENTS);
  const [payModal, setPayModal] = useState(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const totalPaid = payments.reduce((s,p) => s + p.paid, 0);
  const totalRemaining = payments.reduce((s,p) => s + p.remaining, 0);
  const dueCount = payments.filter(p => p.status === "due").length;

  const handlePay = (payment, milestone) => {
    setPayModal({ payment, milestone });
  };

  const confirmPay = () => {
    setPayments(prev => prev.map(p => {
      if (p.id !== payModal.payment.id) return p;
      const updatedMilestones = p.milestones.map((m,i) => {
        if (m.label !== payModal.milestone.label) return m;
        return {...m, status:"paid"};
      });
      const paidNow = p.paid + payModal.milestone.amount;
      const remainingNow = p.remaining - payModal.milestone.amount;
      // Auto-set next milestone to "due"
      const nextIdx = updatedMilestones.findIndex(m => m.status === "upcoming");
      if (nextIdx !== -1) updatedMilestones[nextIdx] = {...updatedMilestones[nextIdx], status:"due"};
      return {
        ...p,
        paid: paidNow,
        remaining: remainingNow,
        milestones: updatedMilestones,
        status: remainingNow === 0 ? "completed" : p.status,
      };
    }));
    setPayModal(null);
    setPaySuccess(true);
    setTimeout(() => setPaySuccess(false), 3000);
  };

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"24px 0"}}>

      {/* Success toast */}
      {paySuccess && (
        <div style={{background:"#001637",color:"#fff",borderRadius:12,padding:"14px 20px",
          marginBottom:20,display:"flex",alignItems:"center",gap:12,animation:"fadeUp .3s ease"}}>
          <span className="msym" style={{fontSize:22,color:"#82f9be"}}>check_circle</span>
          <div>
            <div style={{fontWeight:700,fontSize:14}}>Payment Successful</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>Milestone marked as paid</div>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Active Services",value:payments.filter(p=>p.status!=="completed").length,icon:"subscriptions",color:"#001637",bg:"#e8edf5"},
          {label:"Total Paid",value:`$${totalPaid.toLocaleString()}`,icon:"check_circle",color:"#006c47",bg:"#e8f5ee"},
          {label:"Remaining",value:`$${totalRemaining.toLocaleString()}`,icon:"schedule",color:"#dc2626",bg:"#fef2f2"},
          {label:"Payments Due",value:dueCount,icon:"warning",color:"#D97706",bg:"#fffbeb"},
        ].map(k => (
          <div key={k.label} style={{background:"#fff",borderRadius:14,padding:"16px",
            border:"1px solid #e9e7eb",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:34,height:34,borderRadius:10,background:k.bg,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="msym" style={{fontSize:18,color:k.color}}>{k.icon}</span>
              </div>
            </div>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:k.color}}>{k.value}</div>
              <div style={{fontSize:11,fontWeight:600,color:"#75777f",marginTop:2}}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {payments.length === 0 ? (
          <div style={{background:"#fff",borderRadius:16,border:"1px solid #e9e7eb",padding:"48px 24px",textAlign:"center"}}>
            <span className="msym" style={{fontSize:48,color:"#c5c6cf",display:"block",marginBottom:12}}>subscriptions</span>
            <div style={{fontWeight:700,fontSize:16,color:"#44474e",marginBottom:8}}>No active subscriptions</div>
            <div style={{fontSize:13,color:"#75777f",marginBottom:20}}>Browse our digital services to get started.</div>
            <button onClick={() => navigate("services")}
              style={{background:"#001637",color:"#fff",border:"none",borderRadius:10,
                padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
              Browse Services
            </button>
          </div>
        ) : (
          payments.map(p => <PaymentCard key={p.id} payment={p} onPay={handlePay} />)
        )}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:200,
          display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:400,
            boxShadow:"0 32px 80px rgba(0,0,0,.22)",overflow:"hidden",animation:"fadeUp .25s ease"}}>
            <div style={{background:"linear-gradient(135deg,#001637,#172b4d)",padding:"24px 24px 20px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.6)",marginBottom:4}}>PAYMENT</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{payModal.milestone.label}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:4}}>{payModal.payment.serviceTitle}</div>
            </div>
            <div style={{padding:"24px"}}>
              <div style={{background:"#f5f3f6",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
                <div style={{fontSize:12,color:"#75777f",fontWeight:600}}>AMOUNT TO PAY</div>
                <div style={{fontSize:32,fontWeight:800,color:"#001637",marginTop:4}}>
                  ${payModal.milestone.amount.toLocaleString()}
                  <span style={{fontSize:14,fontWeight:500,color:"#75777f"}}> USD</span>
                </div>
                <div style={{fontSize:12,color:"#75777f",marginTop:6,display:"flex",alignItems:"center",gap:4}}>
                  <span className="msym" style={{fontSize:14}}>lock</span>
                  Held securely in escrow until delivery approved
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={() => setPayModal(null)}
                  style={{flex:1,height:46,borderRadius:10,border:"1.5px solid #e9e7eb",
                    background:"#fff",color:"#44474e",fontWeight:700,fontSize:14,cursor:"pointer",
                    fontFamily:"'Inter',sans-serif"}}>
                  Cancel
                </button>
                <button onClick={confirmPay}
                  style={{flex:2,height:46,borderRadius:10,border:"none",
                    background:"#001637",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  <span className="msym" style={{fontSize:18}}>lock</span>Pay into Escrow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.pay-card:hover{box-shadow:0 8px 28px rgba(0,0,0,.09)!important;}`}</style>
    </div>
  );
}
