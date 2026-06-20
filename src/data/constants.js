export const CATS = [
  {id:"software", label:"Software Dev",   color:"#3b82f6"},
  {id:"mobile",   label:"Mobile App",     color:"#8b5cf6"},
  {id:"web",      label:"Web Dev",        color:"#10b981"},
  {id:"uiux",     label:"UI/UX Design",  color:"#ec4899"},
  {id:"cyber",    label:"Cybersecurity",  color:"#ef4444"},
  {id:"cloud",    label:"Cloud/DevOps",   color:"#006c47"},
  {id:"ai",       label:"AI Dev",         color:"#6366f1"},
  {id:"it",       label:"IT Consulting",  color:"#0d9488"},
  {id:"data",     label:"Data Analytics", color:"#006c47"},
  {id:"docs",     label:"Tech Docs",      color:"#64748b"},
];

export const CURR = ["USD","GBP","EUR","AUD","CAD","NGN"];

export const SCFG = {
  pending:    {label:"Awaiting Funds", dot:"#8b5cf6", bg:"#f5f3ff"},
  funded:     {label:"Funded",         dot:"#3b82f6", bg:"#eff6ff"},
  inprogress: {label:"In Progress",    dot:"#006c47", bg:"#fffbeb"},
  inspection: {label:"In Review",      dot:"#006c47", bg:"#fffbeb"},
  audit:      {label:"AI Audit",       dot:"#0d9488", bg:"#e6faf8"},
  approved:   {label:"Approved",       dot:"#10b981", bg:"#f0fdf4"},
  revision:   {label:"Revision Req.",  dot:"#006c47", bg:"#fff7ed"},
  completed:  {label:"Completed",      dot:"#6b7280", bg:"#f9fafb"},
  disputed:   {label:"Disputed",       dot:"#ef4444", bg:"#fef2f2"},
};

export const MTX = [
  {id:"TXN-88401",title:"E-commerce Backend + REST API",       type:"Software Dev",  cat:"software", amount:18000, currency:"USD", role:"Buyer",  other:"Devcraft Solutions", status:"inspection", date:"May 14, 2025", milestones:3},
  {id:"TXN-88256",title:"Mobile Banking App (iOS+Android)",    type:"Mobile App",    cat:"mobile",   amount:35000, currency:"USD", role:"Buyer",  other:"AppForge Ltd",       status:"funded",     date:"May 20, 2025", milestones:4},
  {id:"TXN-88103",title:"Company Website Redesign",            type:"Web Dev",       cat:"web",      amount:4800,  currency:"USD", role:"Seller", other:"TechStar Agency",    status:"approved",   date:"May 22, 2025", milestones:1},
  {id:"TXN-87940",title:"Dashboard UI/UX & Design System",     type:"UI/UX Design",  cat:"uiux",     amount:6200,  currency:"USD", role:"Buyer",  other:"Studio Vela",        status:"completed",  date:"Apr 30, 2025", milestones:2},
  {id:"TXN-87801",title:"AWS Cloud Infrastructure Migration",  type:"Cloud/DevOps",  cat:"cloud",    amount:12500, currency:"USD", role:"Buyer",  other:"CloudShift Inc",     status:"disputed",   date:"May 10, 2025", milestones:2},
];

export const BANKS = [
  {id:"gtb",     label:"GTBank"},
  {id:"first",   label:"First Bank"},
  {id:"access",  label:"Access Bank"},
  {id:"zenith",  label:"Zenith Bank"},
  {id:"uba",     label:"UBA"},
  {id:"opay",    label:"OPay"},
  {id:"kuda",    label:"Kuda Bank"},
  {id:"palmpay", label:"PalmPay"},
];

export const SVCS = [
  {id:"aws",     label:"Amazon Web Services", icon:"cloud",             color:"#FF9900"},
  {id:"gcp",     label:"Google Cloud",        icon:"cloud_sync",        color:"#4285F4"},
  {id:"azure",   label:"Microsoft Azure",     icon:"cloud_done",        color:"#0078D4"},
  {id:"netlify", label:"Netlify",             icon:"deployed_code",     color:"#00C7B7"},
  {id:"vercel",  label:"Vercel",              icon:"rocket_launch",     color:"#000000"},
  {id:"gsuite",  label:"Google Workspace",    icon:"workspace_premium", color:"#34A853"},
  {id:"github",  label:"GitHub",              icon:"code",              color:"#24292F"},
  {id:"do",      label:"DigitalOcean",        icon:"water_drop",        color:"#0080FF"},
];

export const NAV_ITEMS = [
  {label:"Platform",    ch:[{l:"How It Works",d:"9-step AI workflow"},{l:"Tech Categories",d:"10 service types"}]},
  {label:"AI Features", ch:[{l:"Scope Generator",d:"AI writes your scope"},{l:"Contract Generator",d:"Smart legal contracts"},{l:"Deliverable Auditor",d:"Technical audit engine"},{l:"Dispute Assistant",d:"AI-powered resolution"}]},
  {label:"Business",    ch:[{l:"Enterprise",d:"Agency & multi-user"},{l:"Escrow API",d:"Full REST API"},{l:"White Label",d:"Your brand, our rails"},{l:"Become a Partner",d:"Revenue sharing"}]},
  {label:"Pricing",     ch:[{l:"Subscription Plans",d:"Starter, Pro, Enterprise"},{l:"Escrow Fees",d:"Transaction fee schedule"},{l:"AI Audit Fees",d:"Per-audit pricing"}]},
  {label:"Help",        ch:[{l:"Help Center",d:"Browse FAQs"},{l:"Contact Us",d:"Get in touch"},{l:"API Docs",d:"For developers"}]},
];
