import { useState } from "react";
import { T, fs } from "../../tokens";
import { Btn, Spin } from "../../components/ui";

const SettingsTab=({user})=>{
  const [twoFA,setTwoFA]=useState(false);
  const [notifs,setNotifs]=useState({email:true,sms:false,push:true});
  const [privacy,setPrivacy]=useState({discovery:true,marketing:false});
  const [showDelete,setShowDelete]=useState(false);
  const [pwFm,setPwFm]=useState({current:"",next:"",confirm:""});
  const [pwSaved,setPwSaved]=useState(false);
  const [showCurrentPw,setShowCurrentPw]=useState(false);
  const [showNextPw,setShowNextPw]=useState(false);

  const Toggle=({on,onToggle})=>(
    <div onClick={onToggle} style={{width:42,height:24,borderRadius:12,background:on?T.green:T.gray100,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,border:`1.5px solid ${on?T.green:T.gray100}`}}>
      <div style={{position:"absolute",top:3,left:on?"calc(100% - 19px)":3,width:14,height:14,borderRadius:"50%",background:T.white,boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"left .2s"}}/>
    </div>
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div><h2 style={{fontSize:"clamp(18px,3vw,22px)",fontWeight:700,color:T.primary,marginBottom:4}}>Account Settings</h2><p style={{color:T.gray500,fontSize:13.5}}>Manage your security preferences and personal information.</p></div>

      <div className="g2-dash" style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start"}}>

        {/* Left column */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Profile */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(16px,3vw,24px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${T.primary},${T.primaryDk})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:20,color:T.white,flexShrink:0}}>
                {user?.name?user.name[0].toUpperCase():"U"}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:16,color:T.primary}}>{user?.name||"User"}</div>
                <div style={{fontSize:13,color:T.gray500}}>{user?.email||""}</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:4,marginTop:4,fontSize:11.5,fontWeight:700,color:T.green,background:T.greenLt,padding:"2px 9px",borderRadius:20}}>
                  <span className="msym" style={{fontSize:13}}>check_circle</span>Email verified
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Full Name</label>
                <input style={{...fs,background:T.offWhite}} defaultValue={user?.name||""}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Role</label>
                <input style={{...fs,background:T.offWhite}} defaultValue={user?.role==="client"?"Client":"Service Provider"} readOnly/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Email Address</label>
                <input style={{...fs,background:T.offWhite}} type="email" defaultValue={user?.email||""}/>
              </div>
            </div>
            <Btn variant="primary" style={{fontSize:13,padding:"9px 18px"}}>Save Changes</Btn>
          </div>

          {/* 2FA + Login Activity side by side */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="g2-dash">
            {/* 2FA */}
            <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,2.5vw,22px)",display:"flex",flexDirection:"column",justifyContent:"space-between",gap:16}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span className="msym" style={{fontSize:22,color:T.primary}}>verified_user</span>
                  <div style={{fontWeight:700,fontSize:15,color:T.primary}}>Two-Factor Auth</div>
                </div>
                <p style={{fontSize:13,color:T.gray500,lineHeight:1.7}}>Add an extra layer of security. A code from your authenticator app is required at each login.</p>
              </div>
              {twoFA
                ?<div style={{display:"flex",alignItems:"center",gap:8,background:T.greenLt,borderRadius:9,padding:"10px 13px"}}>
                    <span className="msym" style={{fontSize:17,color:T.green}}>check_circle</span>
                    <div><div style={{fontSize:13,fontWeight:700,color:T.green}}>2FA Enabled</div><div style={{fontSize:11.5,color:T.green}}>Authenticator app connected</div></div>
                  </div>
                :<Btn variant="primary" style={{fontSize:13,padding:"9px 16px",alignSelf:"flex-start"}} onClick={()=>setTwoFA(true)}>Enable 2FA</Btn>
              }
            </div>
            {/* Login Activity */}
            <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,2.5vw,22px)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span className="msym" style={{fontSize:22,color:T.primary}}>devices</span>
                <div style={{fontWeight:700,fontSize:15,color:T.primary}}>Login Activity</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[{device:"MacBook Pro · Lagos",time:"Current session",active:true},{device:"iPhone 15 · Abuja",time:"2 hours ago",active:false}].map((s,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:i===0?12:0,borderBottom:i===0?`1px solid ${T.gray100}`:""}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:T.primary}}>{s.device}</div>
                      <div style={{fontSize:11.5,color:T.gray400,marginTop:2}}>{s.time}</div>
                    </div>
                    {s.active
                      ?<span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenLt,padding:"3px 9px",borderRadius:20}}>Active</span>
                      :<button style={{fontSize:12.5,fontWeight:700,color:T.red,background:"none",border:"none",cursor:"pointer",padding:0}}>Revoke</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Data */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,3vw,24px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <span className="msym" style={{fontSize:22,color:T.primary}}>visibility</span>
              <div style={{fontWeight:700,fontSize:15,color:T.primary}}>Privacy &amp; Data</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="g2-dash">
              {[
                {k:"discovery",label:"Public Profile Discovery",desc:"Allow other users to find you by email or name during escrow setup."},
                {k:"marketing",label:"Marketing Communications",desc:"Receive updates about new features and secure trading tips."},
              ].map(p=>(
                <div key={p.k} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Toggle on={privacy[p.k]} onToggle={()=>setPrivacy(v=>({...v,[p.k]:!v[p.k]}))}/>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:600,color:T.primary,marginBottom:3}}>{p.label}</div>
                    <div style={{fontSize:12.5,color:T.gray500,lineHeight:1.65}}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,3vw,24px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <span className="msym" style={{fontSize:22,color:T.primary}}>lock</span>
              <div style={{fontWeight:700,fontSize:15,color:T.primary}}>Change Password</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Current Password</label>
                <div style={{position:"relative"}}>
                  <input style={fs} type={showCurrentPw?"text":"password"} placeholder="••••••••" value={pwFm.current} onChange={e=>setPwFm(p=>({...p,current:e.target.value}))}/>
                  <button type="button" onClick={()=>setShowCurrentPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.gray400}}>
                    <span className="msym" style={{fontSize:18}}>{showCurrentPw?"visibility_off":"visibility"}</span>
                  </button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}} className="g2-dash">
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>New Password</label>
                  <div style={{position:"relative"}}>
                    <input style={fs} type={showNextPw?"text":"password"} placeholder="Min. 8 characters" value={pwFm.next} onChange={e=>setPwFm(p=>({...p,next:e.target.value}))}/>
                    <button type="button" onClick={()=>setShowNextPw(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.gray400}}>
                      <span className="msym" style={{fontSize:18}}>{showNextPw?"visibility_off":"visibility"}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,fontWeight:700,color:T.gray500,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>Confirm New</label>
                  <input style={fs} type="password" placeholder="Repeat password" value={pwFm.confirm} onChange={e=>setPwFm(p=>({...p,confirm:e.target.value}))}/>
                </div>
              </div>
              {pwSaved&&(
                <div style={{background:T.greenLt,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.green,display:"flex",gap:6,alignItems:"center"}}>
                  <span className="msym" style={{fontSize:15}}>check_circle</span>Password updated successfully.
                </div>
              )}
              <Btn
                variant="primary"
                style={{fontSize:13,padding:"9px 18px",alignSelf:"flex-start"}}
                disabled={!pwFm.current||!pwFm.next||pwFm.next!==pwFm.confirm}
                onClick={()=>{setPwSaved(true);setPwFm({current:"",next:"",confirm:""});setTimeout(()=>setPwSaved(false),3000);}}
              >Update Password</Btn>
            </div>
          </div>

        </div>{/* end left column */}

        {/* Right sidebar */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Notification Channels */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,2.5vw,22px)"}}>
            <div style={{fontWeight:700,fontSize:15,color:T.primary,marginBottom:16}}>Notification Channels</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {[{k:"email",icon:"mail",label:"Email"},{k:"sms",icon:"sms",label:"SMS Alerts"},{k:"push",icon:"notifications",label:"Push"}].map(n=>(
                <div key={n.k} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span className="msym" style={{fontSize:20,color:T.gray500}}>{n.icon}</span>
                    <span style={{fontSize:14,fontWeight:500,color:T.primary}}>{n.label}</span>
                  </div>
                  <Toggle on={notifs[n.k]} onToggle={()=>setNotifs(v=>({...v,[n.k]:!v[n.k]}))}/>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Status */}
          <div style={{background:T.white,border:`1px solid ${T.gray100}`,borderRadius:14,padding:"clamp(14px,2.5vw,22px)"}}>
            <div style={{fontWeight:700,fontSize:15,color:T.primary,marginBottom:14}}>Verification Status</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[{icon:"mail",label:"Email",done:true},{icon:"smartphone",label:"Phone",done:false},{icon:"badge",label:"Identity (ID)",done:false}].map(v=>(
                <div key={v.label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.offWhite,borderRadius:9}}>
                  <span className="msym" style={{fontSize:18,color:v.done?T.green:T.gray400}}>{v.icon}</span>
                  <span style={{flex:1,fontSize:13.5,color:T.primary,fontWeight:500}}>{v.label}</span>
                  {v.done
                    ?<span style={{fontSize:11,fontWeight:700,color:T.green,background:T.greenLt,padding:"2px 8px",borderRadius:20}}>Verified</span>
                    :<span style={{fontSize:11,fontWeight:700,color:T.gray400,background:"rgba(197,198,207,.25)",padding:"2px 8px",borderRadius:20}}>Pending</span>
                  }
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:14,padding:"clamp(14px,2.5vw,22px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span className="msym" style={{fontSize:20,color:T.red}}>warning</span>
              <div style={{fontWeight:700,fontSize:15,color:T.red}}>Danger Zone</div>
            </div>
            <p style={{fontSize:13,color:T.gray500,lineHeight:1.7,marginBottom:14}}>Permanently delete your account and all associated escrow history. This action cannot be undone.</p>
            {!showDelete
              ?<Btn variant="red" style={{width:"100%",fontSize:13}} onClick={()=>setShowDelete(true)}>Delete Account</Btn>
              :<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:9,padding:"12px"}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.red,marginBottom:6}}>Are you absolutely sure?</div>
                  <p style={{fontSize:12.5,color:T.gray500,marginBottom:12}}>All your transactions, documents, and history will be permanently erased.</p>
                  <div style={{display:"flex",gap:8}}>
                    <Btn variant="outline" style={{flex:1,fontSize:12}} onClick={()=>setShowDelete(false)}>Cancel</Btn>
                    <Btn variant="red" style={{flex:1,fontSize:12}}>Confirm Delete</Btn>
                  </div>
                </div>
            }
          </div>

        </div>{/* end right sidebar */}
      </div>
    </div>
  );
};
export default SettingsTab;
