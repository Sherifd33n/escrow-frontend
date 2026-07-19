export const T = {
  primary:"#001637",   primaryDk:"#001637",   primaryLt:"#172b4d",
  accent:"#006c47",    green:"#006c47",        greenLt:"#e8f5ee",
  white:"#ffffff",     offWhite:"#f5f3f6",     gray100:"#c5c6cf",
  gray400:"#75777f",   gray500:"#75777f",      gray600:"#44474e",
  gray700:"#44474e",   gray900:"#1b1b1e",      red:"#ba1a1a",
  gold:"#82f9be",      teal:"#006c47",         tealLt:"#e8f5ee",
  purple:"#001637",    purpleLt:"#eef2ff",     indigo:"#001637",
  secondary:"#006c47", secContainer:"#82f9be", outline:"#75777f",
  outlineVariant:"#c5c6cf", surface:"#fbf9fc", surfaceLow:"#f5f3f6",
};

export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'Inter',sans-serif;background:#fbf9fc;color:#1b1b1e;}
  .msym{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;display:inline-block;line-height:1;text-transform:none;letter-spacing:normal;white-space:nowrap;}
  input,select,textarea,button{font-family:'Inter',sans-serif;}
  ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#f1f4f9;}::-webkit-scrollbar-thumb{background:#a0aec0;border-radius:3px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
  @keyframes pulse-ring{0%{transform:scale(.95);opacity:.5}50%{transform:scale(1.15);opacity:.2}100%{transform:scale(.95);opacity:.5}}
  @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  .pulse-ring{animation:pulse-ring 3s cubic-bezier(.4,0,.6,1) infinite;}
  .fu{animation:fadeUp .5s ease both;}.fu2{animation:fadeUp .5s .1s ease both;}
  .fu3{animation:fadeUp .5s .2s ease both;}.fu4{animation:fadeUp .5s .3s ease both;}
  .ch{transition:transform .2s,box-shadow .2s;}.ch:hover{transform:translateY(-4px);box-shadow:0 14px 40px rgba(26,86,160,.13)!important;}
  .fc{transition:border-color .2s,transform .2s;}.fc:hover{border-color:#001637!important;transform:translateY(-2px);}
  .nl:hover{color:#006c47!important;}.nl{transition:color .15s;}
  .tr:hover{background:#f1f4f9!important;}.tr{transition:background .12s;}
  .btn-primary:hover{background:#172b4d!important;transform:translateY(-1px);}
  .btn-accent:hover{background:#005235!important;transform:translateY(-1px);}
  .btn-outline:hover{background:#001637!important;color:#fff!important;}
  .btn-green:hover{background:#178050!important;}
  .dm{animation:slideDown .18s ease;}
  @media(max-width:1100px){.g5{grid-template-columns:repeat(3,1fr)!important;}}
  @media(max-width:1024px){.g4{grid-template-columns:repeat(2,1fr)!important;}.g3{grid-template-columns:repeat(2,1fr)!important;}.g2{grid-template-columns:1fr!important;}.fg{grid-template-columns:1fr 1fr!important;}}
  @media(max-width:768px){.g4{grid-template-columns:1fr 1fr!important;}.g5{grid-template-columns:1fr 1fr!important;}.g3{grid-template-columns:1fr!important;}.g2{grid-template-columns:1fr!important;}.hg{grid-template-columns:1fr!important;}.fg{grid-template-columns:1fr!important;}.ndsk{display:none!important;}.mbb{display:flex!important;}.feeg{grid-template-columns:1fr!important;}.dg{grid-template-columns:1fr!important;}.hcta{flex-direction:column!important;}.ctar{flex-direction:column!important;text-align:center!important;}.hero-card{margin-top:0!important;padding:18px 14px!important;}.pay-grid{grid-template-columns:1fr!important;}.modal-grid{grid-template-columns:1fr!important;}.hero-section{padding:40px 1rem 0!important;}.hist-row{flex-direction:column!important;}.g2-dash{grid-template-columns:1fr!important;}.g3-dash{grid-template-columns:1fr 1fr!important;}}
  @media(max-width:480px){.g4{grid-template-columns:1fr!important;}.g5{grid-template-columns:1fr!important;}.sg{grid-template-columns:1fr 1fr!important;}}
  .dash-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
  @media(max-width:860px){.dash-tabs{display:none!important;}.dash-kpi{grid-template-columns:1fr 1fr!important;}}
  @media(max-width:768px){.dg{grid-template-columns:1fr!important;}.tx-tbl{display:none!important;}.tx-mob{display:flex!important;}.g2-dash{grid-template-columns:1fr!important;}.g3-dash{grid-template-columns:1fr!important;}.hist-row{flex-direction:column!important;}}
  @media(max-width:480px){.dash-kpi{grid-template-columns:1fr 1fr!important;}.modal-grid{grid-template-columns:1fr!important;}}
  .dash-drawer{position:fixed;top:0;left:0;bottom:0;width:268px;background:#fbf9fc;border-right:1px solid #c5c6cf;z-index:149;display:flex;flex-direction:column;box-shadow:4px 0 24px rgba(0,0,0,.13);transform:translateX(-100%);transition:transform .24s ease;}
  .dash-drawer.open{transform:translateX(0);}
  .dash-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:148;}
  .dash-overlay.show{display:block;}
  @media(min-width:861px){.mob-menu-btn{display:none!important;}}
  .auth-input{width:100%;height:52px;padding-left:48px;padding-right:16px;background:#f5f3f6;border:1.5px solid #c5c6cf;border-radius:10px;font-size:15px;color:#1b1b1e;outline:none;font-family:'Inter',sans-serif;transition:border-color .18s,box-shadow .18s;}
  .auth-input:focus{border-color:#001637;box-shadow:0 0 0 3px rgba(0,22,55,.08);}
  .auth-input-pr{padding-right:48px;}
  .auth-btn-primary{width:100%;height:52px;background:#001637;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Inter',sans-serif;transition:opacity .18s,transform .12s;}
  .auth-btn-primary:hover{opacity:.88;transform:translateY(-1px);}
  .auth-btn-primary:active{transform:scale(.98);}
  .auth-btn-primary:disabled{opacity:.55;cursor:not-allowed;transform:none;}
  .auth-btn-social{flex:1;height:48px;border:1.5px solid #c5c6cf;border-radius:10px;background:#fff;font-size:13.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:'Inter',sans-serif;color:#1b1b1e;transition:background .15s,border-color .15s;}
  .auth-btn-social:hover{background:#f5f3f6;border-color:#001637;}
  .auth-card{background:rgba(255,255,255,.92);backdrop-filter:blur(14px);border:1px solid rgba(197,198,207,.5);border-radius:20px;padding:36px 32px;box-shadow:0 8px 40px rgba(0,22,55,.1);}
  .auth-role-btn{flex:1;padding:10px 0;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif;}
  .auth-bg-blob{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0;}
  @media(max-width:480px){.auth-card{padding:24px 18px;border-radius:14px;}}
`;

// Shared input field style
export const fs = {
  width:"100%",padding:"11px 14px",border:`1.5px solid #c5c6cf`,
  borderRadius:8,fontSize:14,color:"#1b1b1e",outline:"none",background:"#ffffff"
};
