import { T } from "../tokens";
import { Btn } from "../components/ui";

const AuthShell=({children,navigate})=>(
  <div style={{minHeight:"100vh",background:"#fbf9fc",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    {/* Background blobs */}
    <div className="auth-bg-blob" style={{width:420,height:420,background:"rgba(0,22,55,.06)",top:"-12%",right:"-8%"}}/>
    <div className="auth-bg-blob" style={{width:320,height:320,background:"rgba(130,249,190,.18)",bottom:"-10%",left:"-6%"}}/>
    {/* Header */}
    <header style={{background:"#fff",borderBottom:"1px solid #e4e2e5",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 1.5rem",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 0 #e4e2e5"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>navigate("home")}>
        <div style={{width:36,height:36,background:"linear-gradient(135deg,#1a56a0,#0f3d7a)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:"#fff",fontWeight:800,fontSize:17,fontFamily:"'Inter',sans-serif"}}>E</span>
        </div>
        <span style={{fontWeight:800,fontSize:19,color:"#001637",letterSpacing:"-.4px"}}><span style={{color:"#006c47"}}>Escrow</span></span>
      </div>
      <button
        onClick={()=>navigate("home")}
        style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1.5px solid #c5c6cf",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:700,color:"#44474e",fontFamily:"'Inter',sans-serif",transition:"all .15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="#001637";e.currentTarget.style.color="#001637";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="#c5c6cf";e.currentTarget.style.color="#44474e";}}
      >
        <span className="msym" style={{fontSize:17}}>arrow_back</span>
        <span className="ndsk-inline">Back to Home</span>
      </button>
    </header>
    {/* Content */}
    <main style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 16px",position:"relative",zIndex:1}}>
      {children}
    </main>
  </div>
);
export default AuthShell;
