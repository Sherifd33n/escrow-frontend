import { useState, useEffect } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";
import { BANKS, SVCS } from "../../data/constants";
import { wallet } from "../../utils/api";

const FLW_PUBLIC_KEY = "FLWPUBK_TEST-PASTE-YOUR-KEY-HERE";

// Defined outside WalletTab so React treats it as a stable component reference
// across re-renders — keeping it inside the function body recreated a brand new
// component type on every keystroke, which made inputs lose focus after each character.
const InputField=({label,children,req})=>(
  <div><label style={{display:"block",fontSize:13,fontWeight:600,color:T.gray700,marginBottom:5}}>{label}{req&&" *"}</label>{children}</div>
);

const SectionBtn=({id,icon,label,color="#001637",section,setSection})=>(
  <button onClick={()=>setSection(id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"16px 12px",background:section===id?T.primary:T.white,borderRadius:12,border:`1.5px solid ${section===id?T.primary:T.gray100}`,cursor:"pointer",flex:1,transition:"all .18s",minWidth:0}}>
    <div style={{width:40,height:40,borderRadius:10,background:section===id?T.white+"22":color+"14",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span className="msym" style={{fontSize:22,color:section===id?T.white:color}}>{icon}</span>
    </div>
    <span style={{fontSize:11.5,fontWeight:700,color:section===id?T.white:T.gray700,textAlign:"center",lineHeight:1.2}}>{label}</span>
  </button>
);

const chargeFLWCard = async ({ amount, currency="USD", email, name, cardNumber, cvv, expiryMonth, expiryYear, txRef, onSuccess, onError }) => {
  try {
    const res = await fetch("https://api.flutterwave.com/v3/charges?type=card", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${FLW_PUBLIC_KEY}` },
      body: JSON.stringify({
        card_number: cardNumber, cvv, expiry_month: expiryMonth, expiry_year: expiryYear,
        currency, amount, email, fullname: name, tx_ref: txRef,
        redirect_url: "https://vaultpay.app/wallet/pay/callback",
        authorization: { mode: "noauth" },
      }),
    });
    const data = await res.json();
    if (data.status === "success" && (data.data?.status === "successful" || data.data?.status === "pending")) {
      onSuccess(data.data);
    } else if (data.meta?.authorization?.mode === "pin" || data.meta?.authorization?.mode === "avs_noauth") {
      onError("This card requires 3D-Secure. Please use another card.");
    } else {
      onError(data.message || "Payment declined. Check card details and try again.");
    }
  } catch (e) {
    onError("Network error — could not reach payment processor. Please try again.");
  }
};

const WalletTab=({user,balance,onBalanceChange,activeTxs=[]})=>{
  const [section,setSection]=useState("overview"); // overview | fund | transfer | withdraw | pay
  const [ld,setLd]=useState(false);
  const [toast,setToast]=useState(null);
  const [history,setHistory]=useState([]);

  /* Fund form */
  const [fundAmt,setFundAmt]=useState("");
  const [fundBank,setFundBank]=useState("gtb");
  /* Transfer form */
  const [txAmt,setTxAmt]=useState("");
  const [txTo,setTxTo]=useState("");
  const [txNote,setTxNote]=useState("");
  /* Withdraw form */
  const [wdAmt,setWdAmt]=useState("");
  const [wdBank,setWdBank]=useState("first");
  const [wdAcct,setWdAcct]=useState("");
  /* Pay services form */
  const [svcProvider,setSvcProvider]=useState("aws");
  const [svcAmt,setSvcAmt]=useState("");
  const [svcRef,setSvcRef]=useState("");
  const [cardNum,setCardNum]=useState("");
  const [cardExp,setCardExp]=useState("");
  const [cardCvv,setCardCvv]=useState("");
  const [payStep,setPayStep]=useState("form"); // form | processing | success | error
  const [payError,setPayError]=useState("");

  const BANKS=[
    {id:"gtb",label:"GTBank"},
    {id:"first",label:"First Bank"},
    {id:"access",label:"Access Bank"},
    {id:"zenith",label:"Zenith Bank"},
    {id:"uba",label:"UBA"},
    {id:"opay",label:"OPay"},
    {id:"kuda",label:"Kuda Bank"},
    {id:"palmpay",label:"PalmPay"},
  ];
  const SVCS=[
    {id:"aws",     label:"Amazon Web Services",  icon:"cloud",            color:"#FF9900"},
    {id:"gcp",     label:"Google Cloud",          icon:"cloud_sync",       color:"#4285F4"},
    {id:"azure",   label:"Microsoft Azure",       icon:"cloud_done",       color:"#0078D4"},
    {id:"netlify", label:"Netlify",               icon:"deployed_code",    color:"#00C7B7"},
    {id:"vercel",  label:"Vercel",                icon:"rocket_launch",    color:"#000000"},
    {id:"gsuite",  label:"Google Workspace",      icon:"workspace_premium",color:"#34A853"},
    {id:"github",  label:"GitHub",                icon:"code",             color:"#24292F"},
    {id:"do",      label:"DigitalOcean",          icon:"water_drop",       color:"#0080FF"},
  ];

  const showToast=(msg,type="success")=>{
    setToast({msg,type});
    setTimeout(()=>setToast(null),3200);
  };

  // Fetch balance and transaction history on mount
  const loadWalletData = async () => {
    const [balRes, histRes] = await Promise.all([
      wallet.get(),
      wallet.history()
    ]);
    if (balRes.data && onBalanceChange) {
      onBalanceChange(parseFloat(balRes.data.balance) || 0);
    }
    if (histRes.data?.history) {
      setHistory(histRes.data.history);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDeposit = async () => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) return showToast("Please enter a valid amount.", "error");
    setLd(true);
    const { data, error } = await wallet.deposit(amt);
    setLd(false);
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast(`₦${amt.toLocaleString()} added to your wallet.`);
    loadWalletData();
    setSection("overview");
    setFundAmt("");
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(wdAmt);
    if (!amt || amt <= 0) return showToast("Please enter a valid amount.", "error");
    setLd(true);
    const { data, error } = await wallet.withdraw(amt, wdBank, wdAcct);
    setLd(false);
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast(`$${amt.toLocaleString()} withdrawal to ${BANKS.find(b=>b.id===wdBank)?.label} initiated.`);
    loadWalletData();
    setSection("overview");
    setWdAmt("");
    setWdAcct("");
  };

  const handleTransfer = async () => {
    const amt = parseFloat(txAmt);
    if (!amt || amt <= 0) return showToast("Please enter a valid amount.", "error");
    if (!txTo) return showToast("Recipient email is required.", "error");
    setLd(true);
    const { data, error } = await wallet.transfer(amt, txTo, txNote);
    setLd(false);
    if (error) {
      showToast(error, "error");
      return;
    }
    showToast(`$${amt.toLocaleString()} sent to ${txTo}.`);
    loadWalletData();
    setSection("overview");
    setTxAmt("");
    setTxTo("");
    setTxNote("");
  };

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16,position:"relative"}}>

      {/* Toast */}
      {toast&&(
        <div style={{position:"fixed",top:76,right:18,zIndex:9999,background:toast.type==="error"?T.red:T.green,color:T.white,padding:"12px 20px",borderRadius:12,fontSize:13.5,fontWeight:600,boxShadow:"0 6px 28px rgba(0,0,0,.2)",animation:"slideDown .2s ease",display:"flex",alignItems:"center",gap:8,maxWidth:340}}>
          <span className="msym" style={{fontSize:18}}>{toast.type==="error"?"error":"check_circle"}</span>{toast.msg}
        </div>
      )}

      {/* Header */}
      {(()=>{
        const isVendor=user?.role==="seller"||user?.role==="vendor"||user?.role==="provider";
        return(
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <div>
              <h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,color:T.primary,marginBottom:4}}>Wallet</h2>
              <p style={{color:T.gray500,fontSize:13.5}}>
                {isVendor
                  ?"Fund your wallet, receive client payments, withdraw to your bank, and pay for tech services."
                  :"Fund your wallet from your bank, transfer to vendors, and pay for tech services with your card."}
              </p>
            </div>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:isVendor?T.greenLt:"#eff6ff",border:`1px solid ${isVendor?T.green+"40":"#bfdbfe"}`,fontSize:12,fontWeight:700,color:isVendor?T.green:"#2563eb",flexShrink:0}}>
              <span className="msym" style={{fontSize:14}}>{isVendor?"storefront":"person"}</span>
              {isVendor?"Vendor Account":"Client Account"}
            </span>
          </div>
        );
      })()}

      {/* Balance Card */}
      <div style={{background:`linear-gradient(135deg,${T.primary} 0%,#0a2d5a 100%)`,borderRadius:16,padding:"28px 24px",color:T.white,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:160,height:160,borderRadius:"50%",background:"rgba(130,249,190,.08)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:60,bottom:-40,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.04)",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:11.5,fontWeight:700,color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:8}}>Available Balance</div>
            <div style={{fontSize:"clamp(28px,5vw,42px)",fontWeight:800,letterSpacing:"-.5px",lineHeight:1}}>${balance.toLocaleString("en",{minimumFractionDigits:2})}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:8,display:"flex",alignItems:"center",gap:5}}>
              <span className="msym" style={{fontSize:14}}>account_balance_wallet</span>Escrow Wallet &bull; {user?.name||"User"}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11.5,fontWeight:700,color:"rgba(255,255,255,.4)",marginBottom:4}}>Escrow Protected</div>
            <div style={{fontSize:18,fontWeight:700,color:T.gold}}>${activeTxs.reduce((a,b)=>a+b.amount,0).toLocaleString()}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>{activeTxs.length} active transaction{activeTxs.length===1?"":"s"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:22,flexWrap:"wrap"}}>
          {(()=>{
            const isVendor=user?.role==="seller"||user?.role==="vendor"||user?.role==="provider";
            const actions=isVendor
              ?[
                  {icon:"add_circle",       label:"Fund Wallet",  id:"fund"},
                  {icon:"account_balance",  label:"Withdraw",     id:"withdraw"},
                  {icon:"payments",         label:"Pay Services", id:"pay"},
                ]
              :[
                  {icon:"add_circle",  label:"Fund",         id:"fund"},
                  {icon:"send",        label:"Transfer",     id:"transfer"},
                  {icon:"payments",    label:"Pay Services", id:"pay"},
                ];
            return actions.map(a=>(
              <button key={a.id} onClick={()=>setSection(a.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.15)",color:T.white,cursor:"pointer",fontSize:12.5,fontWeight:700,transition:"background .15s",backdropFilter:"blur(4px)"}}>
                <span className="msym" style={{fontSize:16}}>{a.icon}</span>{a.label}
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Action Quick Nav */}
      {(()=>{
        const isVendor=user?.role==="seller"||user?.role==="vendor"||user?.role==="provider";
        const btns=isVendor
          ?[
              {id:"overview",  icon:"bar_chart",        label:"Overview",     color:"#3b82f6"},
              {id:"fund",      icon:"add_circle",        label:"Fund Wallet",  color:T.green},
              {id:"withdraw",  icon:"account_balance",   label:"Withdraw",     color:"#f59e0b"},
              {id:"pay",       icon:"payments",          label:"Pay Services", color:"#ef4444"},
            ]
          :[
              {id:"overview",  icon:"bar_chart",        label:"Overview",     color:"#3b82f6"},
              {id:"fund",      icon:"add_circle",        label:"Fund Wallet",  color:T.green},
              {id:"transfer",  icon:"send",              label:"Transfer",     color:"#8b5cf6"},
              {id:"pay",       icon:"payments",          label:"Pay Services", color:"#ef4444"},
            ];
        return(
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {btns.map(b=><SectionBtn key={b.id} id={b.id} icon={b.icon} label={b.label} color={b.color} section={section} setSection={setSection}/>)}
          </div>
        );
      })()}

      {/* ── OVERVIEW ── */}
      {section==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Quick stats */}
          {(()=>{
            const moneyIn = history.filter(t => t.type === 'deposit' || t.type === 'escrow_release').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            const moneyOut = history.filter(t => t.type === 'withdrawal' || t.type === 'escrow_hold').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            const techSpend = history.filter(t => t.type === 'withdrawal' && (t.description.toLowerCase().includes('aws') || t.description.toLowerCase().includes('cloud') || t.description.toLowerCase().includes('workspace') || t.description.toLowerCase().includes('github') || t.description.toLowerCase().includes('vercel') || t.description.toLowerCase().includes('netlify'))).reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            return (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}} className="g3-dash">
                {[
                  {label:"Money In",    icon:"arrow_downward", val:"$"+moneyIn.toLocaleString("en",{minimumFractionDigits:2}), color:"#10b981", bg:"#f0fdf4"},
                  {label:"Money Out",   icon:"arrow_upward",   val:"$"+moneyOut.toLocaleString("en",{minimumFractionDigits:2}),  color:T.red,     bg:"#fef2f2"},
                  {label:"Tech Spend",  icon:"cloud",          val:"$"+techSpend.toLocaleString("en",{minimumFractionDigits:2}),    color:"#8b5cf6", bg:"#f5f3ff"},
                ].map(s=>(
                  <div key={s.label} style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:12,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <span className="msym" style={{fontSize:20,color:s.color}}>{s.icon}</span>
                    </div>
                    <div>
                      <div style={{fontSize:10.5,fontWeight:700,color:T.gray400,textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{s.label}</div>
                      <div style={{fontSize:17,fontWeight:800,color:T.primary}}>{s.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Recent transactions */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.gray100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:700,fontSize:14,color:T.primary}}>Recent Wallet Activity</div>
              <span style={{fontSize:12,color:T.accent,fontWeight:600,cursor:"pointer"}}>View all</span>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: T.gray400, fontSize: 13 }}>No recent transactions</div>
            ) : (
              history.map((t,i)=>{
                const isCredit = t.type === 'deposit' || t.type === 'escrow_release';
                const amtStr = parseFloat(t.amount || 0).toLocaleString("en", { minimumFractionDigits: 2 });
                const dateStr = new Date(t.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <div key={t.id} style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:i<history.length-1?`1px solid ${T.gray100}`:"none",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
                      <div style={{width:36,height:36,borderRadius:10,background:isCredit?"#f0fdf4":"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <span className="msym" style={{fontSize:18,color:isCredit?"#10b981":T.red}}>{isCredit?"arrow_downward":"arrow_upward"}</span>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13.5,fontWeight:600,color:T.primary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>
                        <div style={{fontSize:11,color:T.gray400,marginTop:2}}>{t.reference} &bull; {dateStr}</div>
                      </div>
                    </div>
                    <div style={{fontSize:14,fontWeight:800,color:isCredit?"#10b981":T.red,flexShrink:0}}>
                      {isCredit?"+":"-"}${amtStr}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── FUND WALLET ── */}
      {section==="fund"&&(
        <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(16px,4vw,28px)",maxWidth:560}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:40,height:40,borderRadius:10,background:T.greenLt,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="msym" style={{fontSize:22,color:T.green}}>add_circle</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:T.primary}}>Fund Wallet from Bank</div>
              <div style={{fontSize:12.5,color:T.gray500}}>Deposit from your Nigerian bank account</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <InputField label="Amount (NGN)" req>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:15,fontWeight:700,color:T.gray600}}>₦</span>
                <input style={{...fs,paddingLeft:32}} type="number" placeholder="0.00" value={fundAmt} onChange={e=>setFundAmt(e.target.value)}/>
              </div>
              {fundAmt && parseFloat(fundAmt) > 0 && (
                <div style={{fontSize:12,color:T.gray500,marginTop:4,paddingLeft:2}}>
                  Equivalent: <strong>${(parseFloat(fundAmt) / 1381.215).toLocaleString("en", {maximumFractionDigits: 2})} USD</strong> (@ ₦1,381.22/$)
                </div>
              )}
            </InputField>
            <InputField label="Select Bank" req>
              <select style={fs} value={fundBank} onChange={e=>setFundBank(e.target.value)}>
                {BANKS.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </InputField>
            {/* <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"13px 14px",fontSize:13,color:"#065f46",lineHeight:1.75}}>
              <div style={{fontWeight:700,marginBottom:4,display:"flex",alignItems:"center",gap:6}}><span className="msym" style={{fontSize:16}}>info</span>How to fund</div>
              Transfer to <strong>Escrow Virtual Account — {BANKS.find(b=>b.id===fundBank)?.label||""}</strong><br/>
              Account No: <strong>7082914350</strong> &bull; Sort Code: <strong>058</strong><br/>
              Your name as narration. Funds reflect within 60 seconds.
            </div>
             */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {[5000,10000,25000,50000].map(a=>(
                <button key={a} onClick={()=>setFundAmt(String(a))} style={{flex:1,padding:"9px 0",border:`1.5px solid ${fundAmt===String(a)?T.green:T.gray100}`,borderRadius:8,background:fundAmt===String(a)?T.greenLt:T.white,cursor:"pointer",fontSize:13,fontWeight:700,color:fundAmt===String(a)?T.green:T.gray700,minWidth:70,transition:"all .15s"}}>₦{a.toLocaleString()}</button>
              ))}
            </div>
            <Btn variant="green" onClick={handleDeposit} disabled={ld||!fundAmt} style={{width:"100%",fontSize:15}}>
              {ld?<><Spin/>Processing…</>:<><span className="msym" style={{fontSize:18}}>add_circle</span>Fund Wallet</>}
            </Btn>
          </div>
        </div>
      )}

      {/* ── TRANSFER (Clients only) ── */}
      {section==="transfer"&&(
        <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(16px,4vw,28px)",maxWidth:560}}>
          {(user?.role==="seller"||user?.role==="vendor"||user?.role==="provider")
            /* Vendors don't transfer — show a clear nudge */
            ?<div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:"#fffbeb",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                  <span className="msym" style={{fontSize:30,color:"#f59e0b"}}>info</span>
                </div>
                <div style={{fontWeight:700,fontSize:16,color:T.primary,marginBottom:8}}>Not available for vendors</div>
                <p style={{fontSize:13.5,color:T.gray500,lineHeight:1.75,maxWidth:340,margin:"0 auto 20px"}}>As a vendor, you receive payments from clients via escrow. To move funds out, use <strong>Withdraw to Bank</strong> instead.</p>
                <Btn variant="accent" onClick={()=>setSection("withdraw")}><span className="msym" style={{fontSize:16}}>account_balance</span>Go to Withdraw</Btn>
              </div>
            /* Clients see the full transfer form */
            :<>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
                <div style={{width:40,height:40,borderRadius:10,background:"#f5f3ff",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span className="msym" style={{fontSize:22,color:"#8b5cf6"}}>send</span>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:T.primary}}>Transfer to Vendor</div>
                  <div style={{fontSize:12.5,color:T.gray500}}>Send funds from your wallet directly to a vendor on Escrow</div>
                </div>
              </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <InputField label="Recipient Email / Escrow ID" req>
              <input style={fs} placeholder="vendor@email.com" value={txTo} onChange={e=>setTxTo(e.target.value)}/>
            </InputField>
            <InputField label="Amount (USD)" req>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color:T.gray600}}>$</span>
                <input style={{...fs,paddingLeft:28}} type="number" placeholder="0.00" value={txAmt} onChange={e=>setTxAmt(e.target.value)}/>
              </div>
            </InputField>
            <InputField label="Note (optional)">
              <input style={fs} placeholder="e.g. Milestone 2 payment" value={txNote} onChange={e=>setTxNote(e.target.value)}/>
            </InputField>
            <div style={{background:T.offWhite,borderRadius:10,padding:"12px 14px",fontSize:13,color:T.gray600,lineHeight:1.75}}>
              <span style={{fontWeight:700,color:T.primary}}>Balance after transfer:</span>{" "}
              <span style={{fontWeight:800,color:T.green}}>${Math.max(0,balance-(parseFloat(txAmt)||0)).toLocaleString("en",{minimumFractionDigits:2})}</span>
              <div style={{fontSize:12,marginTop:3,color:T.gray400}}>No transfer fee for wallet-to-wallet payments.</div>
            </div>
            <Btn variant="purple" onClick={handleTransfer} disabled={ld||!txAmt||!txTo} style={{width:"100%",fontSize:15,background:"#8b5cf6"}}>
              {ld?<><Spin/>Sending…</>:<><span className="msym" style={{fontSize:18}}>send</span>Send Transfer</>}
            </Btn>
          </div>
            </>
          }
        </div>
      )}

      {/* ── WITHDRAW ── */}
      {section==="withdraw"&&(
        <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(16px,4vw,28px)",maxWidth:560}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#fffbeb",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="msym" style={{fontSize:22,color:"#f59e0b"}}>account_balance</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:T.primary}}>Withdraw to Bank</div>
              <div style={{fontSize:12.5,color:T.gray500}}>
                {(user?.role==="seller"||user?.role==="vendor"||user?.role==="provider")
                  ?"Cash out your vendor earnings to your Nigerian bank account"
                  :"Transfer funds from your wallet to your bank account"}
              </div>
            </div>
          </div>
          {(user?.role==="seller"||user?.role==="vendor"||user?.role==="provider")&&(
            <div style={{background:T.greenLt,border:`1px solid ${T.green}30`,borderRadius:10,padding:"11px 14px",fontSize:13,color:"#065f46",display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
              <span className="msym" style={{fontSize:16,flexShrink:0}}>storefront</span>
              <div>Your escrow earnings and wallet balance are available to withdraw at any time.</div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <InputField label="Destination Bank" req>
              <select style={fs} value={wdBank} onChange={e=>setWdBank(e.target.value)}>
                {BANKS.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </InputField>
            <InputField label="Account Number" req>
              <input style={fs} placeholder="10-digit account number" maxLength={10} value={wdAcct} onChange={e=>setWdAcct(e.target.value.replace(/\D/g,""))}/>
            </InputField>
            <InputField label="Amount to Withdraw (USD)" req>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color:T.gray600}}>$</span>
                <input style={{...fs,paddingLeft:28}} type="number" placeholder="0.00" value={wdAmt} onChange={e=>setWdAmt(e.target.value)}/>
              </div>
            </InputField>
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#92400e",lineHeight:1.7,display:"flex",gap:8,alignItems:"flex-start"}}>
              <span className="msym" style={{fontSize:16,flexShrink:0,marginTop:1}}>schedule</span>
              <div>Withdrawals processed within <strong>1–2 business days</strong>. A small international transfer fee may apply for non-NGN accounts.</div>
            </div>
            <Btn variant="accent" onClick={handleWithdraw} disabled={ld||!wdAmt||!wdAcct||wdAcct.length<10} style={{width:"100%",fontSize:15}}>
              {ld?<><Spin/>Processing…</>:<><span className="msym" style={{fontSize:18}}>account_balance</span>Withdraw Funds</>}
            </Btn>
          </div>
        </div>
      )}


      {/* ── PAY TECH SERVICES (Flutterwave) ── */}
      {section==="pay"&&(
        <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(16px,4vw,28px)",maxWidth:620}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:40,height:40,borderRadius:10,background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="msym" style={{fontSize:22,color:"#ef4444"}}>payments</span>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:T.primary}}>Pay for Tech Services</div>
              <div style={{fontSize:12.5,color:T.gray500}}>Powered by Flutterwave — AWS, GCP, Azure, GitHub and more</div>
            </div>
          </div>

          {/* ── SUCCESS STATE ── */}
          {payStep==="success"&&(
            <div style={{textAlign:"center",padding:"32px 0"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:T.greenLt,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <span className="msym" style={{fontSize:34,color:T.green}}>check_circle</span>
              </div>
              <div style={{fontWeight:700,fontSize:18,color:T.primary,marginBottom:6}}>Payment Successful</div>
              <div style={{fontSize:13.5,color:T.gray500,marginBottom:20}}>
                ${parseFloat(svcAmt||0).toLocaleString()} paid to <strong>{SVCS.find(s=>s.id===svcProvider)?.label}</strong> via Flutterwave.
              </div>
              <div style={{background:T.offWhite,borderRadius:10,padding:"12px",fontSize:12.5,color:T.gray500,marginBottom:22}}>
                Your service account should reflect within a few minutes. Keep your Flutterwave transaction reference for disputes.
              </div>
              <Btn variant="outline" onClick={()=>{setPayStep("form");setSvcAmt("");setSvcRef("");setCardNum("");setCardExp("");setCardCvv("");}}>
                Make Another Payment
              </Btn>
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {payStep==="error"&&(
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
                <span className="msym" style={{fontSize:32,color:T.red}}>error</span>
              </div>
              <div style={{fontWeight:700,fontSize:16,color:T.red,marginBottom:8}}>Payment Failed</div>
              <div style={{fontSize:13.5,color:T.gray600,marginBottom:20,lineHeight:1.7}}>{payError}</div>
              <Btn variant="outline" onClick={()=>setPayStep("form")}>Try Again</Btn>
            </div>
          )}

          {/* ── FORM STATE ── */}
          {(payStep==="form"||payStep==="processing")&&(<>
            {/* Service picker */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:13,fontWeight:600,color:T.gray700,marginBottom:10}}>Select Service Provider *</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {SVCS.map(s=>(
                  <button key={s.id} onClick={()=>setSvcProvider(s.id)} disabled={payStep==="processing"} style={{border:`1.5px solid ${svcProvider===s.id?s.color:T.gray100}`,borderRadius:10,padding:"10px 6px",cursor:"pointer",background:svcProvider===s.id?s.color+"10":T.white,transition:"all .15s",textAlign:"center",opacity:payStep==="processing"?.5:1}}>
                    <span className="msym" style={{fontSize:22,color:svcProvider===s.id?s.color:T.gray400,display:"block",marginBottom:4}}>{s.icon}</span>
                    <div style={{fontSize:10.5,fontWeight:700,color:svcProvider===s.id?s.color:T.gray600,lineHeight:1.2}}>{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 90px",gap:10}}>
                <InputField label="Amount" req>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color:T.gray600}}>$</span>
                    <input style={{...fs,paddingLeft:28}} type="number" placeholder="0.00" value={svcAmt} onChange={e=>setSvcAmt(e.target.value)} disabled={payStep==="processing"}/>
                  </div>
                </InputField>
                <InputField label="Currency">
                  <select style={fs} disabled={payStep==="processing"}>
                    <option>USD</option><option>NGN</option><option>GBP</option><option>EUR</option>
                  </select>
                </InputField>
              </div>

              <InputField label="Service Reference / Account ID">
                <input style={fs} placeholder="e.g. AWS account ID or project name" value={svcRef} onChange={e=>setSvcRef(e.target.value)} disabled={payStep==="processing"}/>
              </InputField>

              {/* Card section */}
              <div style={{background:T.offWhite,borderRadius:12,padding:"16px",display:"flex",flexDirection:"column",gap:12,border:`1px solid ${T.gray100}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <span className="msym" style={{fontSize:18,color:T.primary}}>credit_card</span>
                    <div style={{fontWeight:700,fontSize:13.5,color:T.primary}}>Card Details</div>
                  </div>
                  {/* Card brand icons */}
                  <div style={{display:"flex",gap:5,alignItems:"center"}}>
                    {["visa","mastercard","verve"].map(b=>(
                      <span key={b} style={{fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:4,border:`1px solid ${T.gray100}`,color:T.gray500,background:T.white,textTransform:"uppercase",letterSpacing:".04em"}}>{b}</span>
                    ))}
                  </div>
                </div>

                <InputField label="Card Number" req>
                  <input
                    style={{...fs,letterSpacing:"1px"}}
                    placeholder="1234  5678  9012  3456"
                    maxLength={19}
                    value={cardNum}
                    disabled={payStep==="processing"}
                    onChange={e=>{
                      const raw=e.target.value.replace(/\D/g,"").slice(0,16);
                      setCardNum(raw.replace(/(.{4})/g,"$1 ").trim());
                    }}
                  />
                </InputField>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <InputField label="Expiry (MM/YY)" req>
                    <input
                      style={fs}
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExp}
                      disabled={payStep==="processing"}
                      onChange={e=>{
                        let v=e.target.value.replace(/\D/g,"");
                        if(v.length>=3) v=v.slice(0,2)+"/"+v.slice(2,4);
                        setCardExp(v);
                      }}
                    />
                  </InputField>
                  <InputField label="CVV" req>
                    <input style={fs} placeholder="•••" maxLength={4} type="password" value={cardCvv} disabled={payStep==="processing"} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,""))}/>
                  </InputField>
                </div>
              </div>

              {/* Flutterwave badge */}
              <div style={{background:"#fff9f0",border:"1px solid #fde68a",borderRadius:10,padding:"11px 14px",fontSize:12.5,color:"#92400e",display:"flex",gap:8,alignItems:"center"}}>
                <span className="msym" style={{fontSize:16,flexShrink:0}}>lock</span>
                <div>Payments processed securely by <strong>Flutterwave</strong>. PCI-DSS Level 1 certified. Your CVV is never stored.</div>
              </div>

              {/* Amount summary */}
              {svcAmt&&(
                <div style={{background:T.offWhite,borderRadius:10,padding:"11px 14px",fontSize:13,color:T.gray700}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span>Service amount</span><span style={{fontWeight:700}}>${parseFloat(svcAmt||0).toLocaleString()}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,color:T.gray500}}>
                    <span>Flutterwave fee (1.4%)</span><span>+${(parseFloat(svcAmt||0)*0.014).toFixed(2)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,color:T.primary,borderTop:`1px solid ${T.gray100}`,paddingTop:7,marginTop:4}}>
                    <span>Total charged</span><span>${(parseFloat(svcAmt||0)*1.014).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Validation checklist — only shows what's still missing */}
              {(()=>{
                const missing=[];
                if(!svcAmt) missing.push("Enter an amount");
                if(cardNum.replace(/\s/g,"").length<16) missing.push(`Card number needs ${16-cardNum.replace(/\s/g,"").length} more digit${16-cardNum.replace(/\s/g,"").length===1?"":"s"}`);
                if(cardExp.length<5) missing.push("Enter expiry as MM/YY");
                if(cardCvv.length<3) missing.push("CVV needs at least 3 digits");
                if(!missing.length||payStep==="processing") return null;
                return(
                  <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"11px 14px",fontSize:12.5,color:"#92400e"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,fontWeight:700,marginBottom:6}}>
                      <span className="msym" style={{fontSize:16}}>info</span>Complete these to continue:
                    </div>
                    {missing.map(m=>(
                      <div key={m} style={{display:"flex",alignItems:"center",gap:7,marginLeft:23,marginBottom:2}}>
                        <span style={{width:4,height:4,borderRadius:"50%",background:"#92400e",flexShrink:0}}/>{m}
                      </div>
                    ))}
                  </div>
                );
              })()}

              <Btn
                variant="red"
                style={{width:"100%",fontSize:15,background:"#ef4444"}}
                disabled={payStep==="processing"||!svcAmt||cardNum.replace(/\s/g,"").length<16||cardExp.length<5||cardCvv.length<3}
                onClick={async()=>{
                  setPayStep("processing");
                  setPayError("");
                  const [mm,yy]=(cardExp||"/").split("/");
                  await chargeFLWCard({
                    amount:parseFloat(svcAmt)*1.014,
                    currency:"USD",
                    email:user?.email||"user@Escrow.app",
                    name:user?.name||"Escrow User",
                    cardNumber:cardNum.replace(/\s/g,""),
                    cvv:cardCvv,
                    expiryMonth:mm,
                    expiryYear:"20"+yy,
                    txRef:`VP-PAY-${Date.now()}`,
                    onSuccess:(data)=>{
                      setPayStep("success");
                      showToast(`Payment of $${parseFloat(svcAmt).toLocaleString()} to ${SVCS.find(s=>s.id===svcProvider)?.label} confirmed.`);
                    },
                    onError:(msg)=>{
                      setPayError(msg);
                      setPayStep("error");
                    },
                  });
                }}
              >
                {payStep==="processing"
                  ?<><Spin/>Processing via Flutterwave…</>
                  :<><span className="msym" style={{fontSize:18}}>payments</span>Pay {SVCS.find(s=>s.id===svcProvider)?.label} via Flutterwave</>
                }
              </Btn>
            </div>
          </>)}
        </div>
      )}
    </div>
  );
};
export default WalletTab;
