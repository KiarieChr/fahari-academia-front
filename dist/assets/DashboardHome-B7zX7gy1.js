const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/FeesCollectionTab-207fAP1y.js","assets/ui-B5yEZb_Z.js","assets/vendor-BtjeaPOD.js","assets/index-DqGIjqDE.js","assets/pdf--8FpopuW.js","assets/index-DvKDaqlW.css","assets/PayablesFinanceTab-DLH7mKyT.js","assets/ExaminationsTab-Cmko0eeQ.js","assets/HRPayrollTab-HayJRlDL.js"])))=>i.map(i=>d[i]);
import{_ as j}from"./pdf--8FpopuW.js";import{j as e,R,T as f,B as u,m as N,l as O,n as D,F as v,o as I,A as G,p as H,q as V,r as Y,s as k,t as B,u as S,D as Q,C as W,v as X,G as q,w as J}from"./ui-B5yEZb_Z.js";import{u as _,r as d}from"./vendor-BtjeaPOD.js";import{S as w}from"./StatCardMini-BMBS5SQ8.js";import{R as p,B as P,X as z,Y as C,T as y,a as b,P as U,b as F,C as T,c as K,L as Z,A as ee,d as $,e as se,f as te,g as ae}from"./charts-guUefrk3.js";import{a as re}from"./index-DqGIjqDE.js";import{C as ie}from"./ClockInOutWidget-BZi5lPSB.js";import{D as ne}from"./DashboardLayout-Gs6tmNGc.js";/* empty css                  */const L="http://192.168.100.8:8000",le={getStats:async()=>{try{const s=localStorage.getItem("token"),t=await fetch(`${L}/api/dashboard/stats/`,{method:"GET",headers:{"Content-Type":"application/json",...s&&{Authorization:`Token ${s}`}}});if(!t.ok)throw new Error(`Failed to fetch stats: ${t.status}`);return await t.json()}catch(s){throw console.error("Error fetching dashboard stats:",s),s}},getSimpleStats:async()=>{try{const s=localStorage.getItem("token"),t=await fetch(`${L}/api/dashboard/debug/`,{method:"GET",headers:{"Content-Type":"application/json",...s&&{Authorization:`Token ${s}`}}});if(!t.ok)throw new Error(`Failed to fetch simple stats: ${t.status}`);return await t.json()}catch(s){throw console.error("Error fetching simple stats:",s),s}}},oe=({data:s})=>e.jsxs("div",{style:{background:"white",padding:"1.5rem",borderRadius:"var(--border-radius)",boxShadow:"var(--shadow-sm)",border:"1px solid var(--border-color-light)",height:"100%"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",fontWeight:"700",color:"var(--text-main)"},children:"Weekly Attendance"}),e.jsxs("select",{style:{padding:"4px 8px",borderRadius:"6px",border:"1px solid var(--border-color-light)",fontSize:"0.85rem",outline:"none",color:"var(--text-secondary)"},children:[e.jsx("option",{children:"This Week"}),e.jsx("option",{children:"Last Week"})]})]}),e.jsx("div",{style:{width:"100%",height:300},children:e.jsx(p,{children:e.jsxs(P,{data:s,barGap:4,children:[e.jsx(z,{dataKey:"name",axisLine:!1,tickLine:!1,tick:{fontSize:12,fill:"#94a3b8"},dy:10}),e.jsx(C,{axisLine:!1,tickLine:!1,tick:{fontSize:12,fill:"#94a3b8"}}),e.jsx(y,{cursor:{fill:"transparent"},contentStyle:{borderRadius:"12px",border:"none",boxShadow:"var(--shadow-lg)",padding:"12px"}}),e.jsx(b,{dataKey:"present",fill:"#4caf50",radius:[4,4,0,0],barSize:40}),e.jsx(b,{dataKey:"absent",fill:"#f44336",radius:[4,4,0,0],barSize:40})]})})})]}),de=({data:s,currentTerm:t})=>{const a=r=>r>=1e6?`${(r/1e6).toFixed(1)}M`:r>=1e3?`${(r/1e3).toFixed(0)}K`:r.toLocaleString();return e.jsxs("div",{style:{background:"white",padding:"1.5rem",borderRadius:"var(--border-radius)",boxShadow:"var(--shadow-sm)",border:"1px solid var(--border-color-light)",height:"100%"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",fontWeight:"700",color:"var(--text-main)"},children:"Fee Collection"}),e.jsx("span",{style:{fontSize:"0.85rem",color:"var(--text-muted)"},children:t||"Current Term"})]}),e.jsxs("div",{style:{width:"100%",height:260,position:"relative"},children:[e.jsx(p,{children:e.jsxs(U,{children:[e.jsx(F,{data:s,cx:"50%",cy:"50%",innerRadius:70,outerRadius:90,paddingAngle:2,dataKey:"value",children:s.map((r,i)=>e.jsx(T,{fill:r.color,stroke:"none"},`cell-${i}`))}),e.jsx(y,{contentStyle:{borderRadius:"12px",border:"none",boxShadow:"var(--shadow-lg)",padding:"12px"}})]})}),e.jsx("div",{style:{display:"flex",justifyContent:"center",gap:"1.5rem",marginTop:"1rem"},children:s.map((r,i)=>e.jsxs("div",{style:{textAlign:"center"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",fontSize:"0.8rem",color:"var(--text-secondary)",marginBottom:"4px"},children:[e.jsx("div",{style:{width:"8px",height:"8px",borderRadius:"50%",background:r.color}}),r.name]}),e.jsxs("div",{style:{fontWeight:"700",color:"var(--text-main)",fontSize:"0.9rem"},children:["KES ",a(r.value)]})]},i))})]})]})},ce=({data:s,compact:t=!1})=>{const a=s||[{subject:"Math",score:85,average:75,max:100},{subject:"Science",score:78,average:72,max:100},{subject:"English",score:92,average:80,max:100},{subject:"History",score:88,average:78,max:100},{subject:"Art",score:95,average:85,max:100},{subject:"PE",score:90,average:82,max:100}],r=["#3f51b5","#4caf50","#ff9800","#e91e63","#9c27b0","#00bcd4"];return e.jsxs("div",{className:"performance-chart",style:{height:t?"250px":"350px",width:"100%"},children:[e.jsx(p,{width:"100%",height:"100%",children:e.jsxs(P,{data:a,margin:t?{top:10,right:10,left:0,bottom:0}:{top:20,right:30,left:20,bottom:5},barSize:t?20:30,children:[e.jsx(K,{strokeDasharray:"3 3",stroke:"#e0e0e0",vertical:!1}),e.jsx(z,{dataKey:"subject",axisLine:!1,tickLine:!1,tick:{fontSize:t?10:12}}),e.jsx(C,{axisLine:!1,tickLine:!1,tick:{fontSize:t?10:12},domain:[0,100],label:t?null:{value:"Score (%)",angle:-90,position:"insideLeft"}}),e.jsx(y,{formatter:i=>[`${i}%`,"Score"],labelFormatter:i=>`Subject: ${i}`,contentStyle:{backgroundColor:"var(--card-bg)",border:"1px solid var(--border-color-light)",borderRadius:"8px",fontSize:t?"11px":"12px"}}),!t&&e.jsx(Z,{}),e.jsx(b,{dataKey:"score",name:"Student Score",radius:[4,4,0,0],children:a.map((i,c)=>e.jsx(T,{fill:r[c%r.length]},`cell-${c}`))}),!t&&e.jsx(b,{dataKey:"average",name:"Class Average",fill:"#82ca9d",radius:[4,4,0,0],opacity:.7})]})}),t&&e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"1rem",marginTop:"0.5rem",flexWrap:"wrap"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx("div",{style:{width:"10px",height:"10px",backgroundColor:"#3f51b5",borderRadius:"2px"}}),e.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-secondary)"},children:"Score"})]}),!t&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx("div",{style:{width:"10px",height:"10px",backgroundColor:"#82ca9d",borderRadius:"2px"}}),e.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-secondary)"},children:"Average"})]})]})]})},me=({data:s,compact:t=!1})=>{const a=s||[{month:"Jan",enrollments:45,target:50},{month:"Feb",enrollments:52,target:55},{month:"Mar",enrollments:48,target:52},{month:"Apr",enrollments:60,target:58},{month:"May",enrollments:55,target:60},{month:"Jun",enrollments:65,target:62},{month:"Jul",enrollments:58,target:60},{month:"Aug",enrollments:70,target:65},{month:"Sep",enrollments:68,target:70},{month:"Oct",enrollments:75,target:72},{month:"Nov",enrollments:72,target:75},{month:"Dec",enrollments:80,target:78}];return e.jsxs("div",{className:"enrollment-chart",style:{height:t?"250px":"350px",width:"100%"},children:[e.jsx(p,{width:"100%",height:"100%",children:e.jsxs(ee,{data:a,margin:t?{top:10,right:10,left:0,bottom:0}:{top:20,right:30,left:20,bottom:5},children:[e.jsxs("defs",{children:[e.jsxs("linearGradient",{id:"colorEnrollments",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"5%",stopColor:"#3f51b5",stopOpacity:.8}),e.jsx("stop",{offset:"95%",stopColor:"#3f51b5",stopOpacity:0})]}),e.jsxs("linearGradient",{id:"colorTarget",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"5%",stopColor:"#ff9800",stopOpacity:.8}),e.jsx("stop",{offset:"95%",stopColor:"#ff9800",stopOpacity:0})]})]}),e.jsx(K,{strokeDasharray:"3 3",stroke:"#e0e0e0",vertical:!1}),e.jsx(z,{dataKey:"month",axisLine:!1,tickLine:!1,tick:{fontSize:t?10:12}}),e.jsx(C,{axisLine:!1,tickLine:!1,tick:{fontSize:t?10:12},label:t?null:{value:"Enrollments",angle:-90,position:"insideLeft"}}),e.jsx(y,{formatter:r=>[`${r} students`,""],labelFormatter:r=>`Month: ${r}`,contentStyle:{backgroundColor:"var(--card-bg)",border:"1px solid var(--border-color-light)",borderRadius:"8px",fontSize:t?"11px":"12px"}}),e.jsx($,{type:"monotone",dataKey:"enrollments",stroke:"#3f51b5",fillOpacity:1,fill:"url(#colorEnrollments)",name:"Actual Enrollments",strokeWidth:2}),e.jsx($,{type:"monotone",dataKey:"target",stroke:"#ff9800",fillOpacity:.3,fill:"url(#colorTarget)",name:"Target Enrollments",strokeWidth:1,strokeDasharray:"5 5"}),!t&&e.jsx(Legend,{})]})}),t&&e.jsxs("div",{style:{display:"flex",justifyContent:"center",gap:"1rem",marginTop:"0.5rem",flexWrap:"wrap"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx("div",{style:{width:"10px",height:"2px",backgroundColor:"#3f51b5",borderRadius:"1px"}}),e.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-secondary)"},children:"Actual"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem"},children:[e.jsx("div",{style:{width:"10px",height:"2px",backgroundColor:"#ff9800",borderRadius:"1px",borderStyle:"dashed"}}),e.jsx("span",{style:{fontSize:"0.7rem",color:"var(--text-secondary)"},children:"Target"})]})]})]})},he=({compact:s=!1})=>{const t=_(),[a,r]=d.useState(null),[i,c]=d.useState(!0),[x,h]=d.useState(null),[m,l]=d.useState("overview");d.useEffect(()=>{o()},[]);const o=async()=>{c(!0),h(null);try{const n=await re.get("/api/fees/insights/");n.success?r(n.data):h("Failed to load insights")}catch(n){console.error("Error fetching insights:",n),h(n.message||"Failed to load insights")}finally{c(!1)}},g=n=>n>=1e6?`KES ${(n/1e6).toFixed(1)}M`:n>=1e3?`KES ${(n/1e3).toFixed(0)}K`:`KES ${n.toLocaleString()}`,M=[{id:"overview",label:"Overview",icon:D},{id:"invoicing",label:"Invoicing",icon:v},{id:"defaulters",label:"Defaulters",icon:f},{id:"attendance",label:"Attendance",icon:I}];return i?e.jsx("div",{className:"smart-insights-widget",children:e.jsxs("div",{className:"insights-loading",children:[e.jsx(R,{className:"spin",size:24}),e.jsx("span",{children:"Loading insights..."})]})}):x?e.jsx("div",{className:"smart-insights-widget",children:e.jsxs("div",{className:"insights-error",children:[e.jsx(f,{size:24}),e.jsx("span",{children:x}),e.jsx("button",{onClick:o,className:"btn btn-sm btn-outline-primary",children:"Retry"})]})}):a?e.jsxs("div",{className:"smart-insights-widget",children:[e.jsxs("div",{className:"insights-header",children:[e.jsxs("div",{className:"insights-title",children:[e.jsx(u,{size:18}),e.jsx("h3",{children:"Smart Insights"}),e.jsxs("span",{className:"term-badge",children:[a.current_term," ",a.current_year]})]}),e.jsx("button",{onClick:o,className:"btn-refresh",title:"Refresh insights",children:e.jsx(R,{size:16})})]}),a.alerts&&a.alerts.length>0&&e.jsx("div",{className:"insights-alerts",children:a.alerts.map((n,A)=>e.jsxs(N.div,{className:`alert-card alert-${n.type}`,initial:{opacity:0,x:-20},animate:{opacity:1,x:0},transition:{delay:A*.1},onClick:()=>t(n.action_url),children:[e.jsx("div",{className:"alert-icon",children:n.type==="danger"?e.jsx(f,{size:18}):e.jsx(u,{size:18})}),e.jsxs("div",{className:"alert-content",children:[e.jsx("strong",{children:n.title}),e.jsx("span",{children:n.message})]}),e.jsx(O,{size:18,className:"alert-arrow"})]},A))}),!s&&e.jsx("div",{className:"insights-tabs",children:M.map(n=>e.jsxs("button",{className:`tab-btn ${m===n.id?"active":""}`,onClick:()=>l(n.id),children:[e.jsx(n.icon,{size:14}),e.jsx("span",{children:n.label})]},n.id))}),e.jsx(G,{mode:"wait",children:e.jsxs(N.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},className:"insights-content",children:[m==="overview"&&e.jsx(xe,{insights:a,formatCurrency:g,navigate:t}),m==="invoicing"&&e.jsx(ge,{insights:a,navigate:t}),m==="defaulters"&&e.jsx(pe,{insights:a,formatCurrency:g,navigate:t}),m==="attendance"&&e.jsx(fe,{insights:a})]},m)}),e.jsx("style",{children:`
                .smart-insights-widget {
                    background: var(--card-bg, #fff);
                    border-radius: 12px;
                    padding: 1rem;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .insights-loading, .insights-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                .insights-error {
                    color: var(--danger, #dc3545);
                }

                .spin {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .insights-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid var(--border-color, #e5e7eb);
                }

                .insights-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .insights-title h3 {
                    margin: 0;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .term-badge {
                    background: var(--primary-light, #e3f2fd);
                    color: var(--primary, #2196f3);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 500;
                }

                .btn-refresh {
                    background: none;
                    border: none;
                    padding: 0.4rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .btn-refresh:hover {
                    background: var(--hover-bg, #f3f4f6);
                    color: var(--primary, #2196f3);
                }

                .insights-alerts {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .alert-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .alert-card:hover {
                    transform: translateX(4px);
                }

                .alert-warning {
                    background: #fff3e0;
                    border-left: 3px solid #ff9800;
                }

                .alert-warning .alert-icon { color: #ff9800; }

                .alert-danger {
                    background: #ffebee;
                    border-left: 3px solid #f44336;
                }

                .alert-danger .alert-icon { color: #f44336; }

                .alert-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .alert-content strong {
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .alert-content span {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }

                .alert-arrow {
                    color: var(--text-muted);
                }

                .insights-tabs {
                    display: flex;
                    gap: 0.25rem;
                    margin-bottom: 0.75rem;
                    padding: 0.25rem;
                    background: var(--bg-secondary, #f3f4f6);
                    border-radius: 8px;
                }

                .tab-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.35rem;
                    padding: 0.4rem 0.5rem;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab-btn:hover {
                    color: var(--text-main);
                }

                .tab-btn.active {
                    background: var(--card-bg, #fff);
                    color: var(--primary, #2196f3);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .insights-content {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Stats Grid */
                .stats-mini-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .stat-mini {
                    background: var(--bg-secondary, #f9fafb);
                    padding: 0.6rem;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-mini-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .stat-mini-label {
                    font-size: 0.65rem;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-mini.success .stat-mini-value { color: #4caf50; }
                .stat-mini.warning .stat-mini-value { color: #ff9800; }
                .stat-mini.danger .stat-mini-value { color: #f44336; }
                .stat-mini.info .stat-mini-value { color: #2196f3; }

                /* Progress Bar */
                .progress-section {
                    margin-bottom: 0.75rem;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.35rem;
                }

                .progress-label {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .progress-value {
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .progress-bar-bg {
                    height: 8px;
                    background: var(--bg-secondary, #e5e7eb);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .progress-bar-fill.success { background: linear-gradient(90deg, #4caf50, #66bb6a); }
                .progress-bar-fill.warning { background: linear-gradient(90deg, #ff9800, #ffb74d); }
                .progress-bar-fill.danger { background: linear-gradient(90deg, #f44336, #ef5350); }

                /* List Items */
                .insights-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .insights-list-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.5rem;
                    background: var(--bg-secondary, #f9fafb);
                    border-radius: 6px;
                    font-size: 0.75rem;
                }

                .insights-list-item-left {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .insights-list-item-name {
                    font-weight: 500;
                }

                .insights-list-item-meta {
                    color: var(--text-muted);
                    font-size: 0.65rem;
                }

                .insights-list-item-value {
                    font-weight: 600;
                    color: var(--danger, #f44336);
                }

                /* Section Headers */
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .section-header-icon {
                    padding: 0.3rem;
                    background: var(--bg-secondary, #f3f4f6);
                    border-radius: 6px;
                }

                /* Action Buttons */
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.6rem;
                    margin-top: 0.75rem;
                    background: var(--primary, #2196f3);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: var(--primary-dark, #1976d2);
                }

                .action-btn.secondary {
                    background: var(--bg-secondary, #f3f4f6);
                    color: var(--text-main);
                }

                .action-btn.secondary:hover {
                    background: var(--border-color, #e5e7eb);
                }

                /* Attendance Dots */
                .attendance-visual {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 0.5rem;
                }

                .attendance-stat {
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.75rem;
                }

                .attendance-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .attendance-dot.present { background: #4caf50; }
                .attendance-dot.absent { background: #f44336; }
                .attendance-dot.late { background: #ff9800; }
            `})]}):null},xe=({insights:s,formatCurrency:t,navigate:a})=>e.jsxs("div",{className:"overview-tab",children:[e.jsxs("div",{className:"stats-mini-grid",children:[e.jsxs("div",{className:"stat-mini success",children:[e.jsxs("div",{className:"stat-mini-value",children:[s.collection?.collection_rate||0,"%"]}),e.jsx("div",{className:"stat-mini-label",children:"Collection Rate"})]}),e.jsxs("div",{className:"stat-mini info",children:[e.jsxs("div",{className:"stat-mini-value",children:[s.invoicing?.invoicing_rate||0,"%"]}),e.jsx("div",{className:"stat-mini-label",children:"Invoiced"})]}),e.jsxs("div",{className:"stat-mini warning",children:[e.jsx("div",{className:"stat-mini-value",children:s.defaulters?.current_term?.count||0}),e.jsx("div",{className:"stat-mini-label",children:"Defaulters"})]}),e.jsxs("div",{className:"stat-mini",children:[e.jsxs("div",{className:"stat-mini-value",children:[s.attendance?.today?.rate||0,"%"]}),e.jsx("div",{className:"stat-mini-label",children:"Attendance Today"})]})]}),e.jsxs("div",{className:"progress-section",children:[e.jsxs("div",{className:"progress-header",children:[e.jsx("span",{className:"progress-label",children:"Fee Collection Progress"}),e.jsx("span",{className:"progress-value",children:t(s.collection?.total_collected||0)})]}),e.jsx("div",{className:"progress-bar-bg",children:e.jsx("div",{className:`progress-bar-fill ${s.collection?.collection_rate>=70?"success":s.collection?.collection_rate>=40?"warning":"danger"}`,style:{width:`${s.collection?.collection_rate||0}%`}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:"0.25rem"},children:[e.jsxs("span",{style:{fontSize:"0.65rem",color:"var(--text-muted)"},children:["Billed: ",t(s.collection?.total_billed||0)]}),e.jsxs("span",{style:{fontSize:"0.65rem",color:"var(--text-muted)"},children:["Outstanding: ",t(s.collection?.total_outstanding||0)]})]})]}),s.payables&&(s.payables.due_within_7_days?.count>0||s.payables.overdue?.count>0)&&e.jsxs("div",{className:"payables-section",style:{background:"#fff3e0",padding:"0.6rem",borderRadius:"8px",marginTop:"0.5rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.35rem"},children:[e.jsx(H,{size:14,style:{color:"#ff9800"}}),e.jsx("span",{style:{fontSize:"0.75rem",fontWeight:"600"},children:"Supplier Payments"})]}),e.jsxs("div",{style:{display:"flex",gap:"1rem",fontSize:"0.7rem"},children:[e.jsxs("span",{children:["Due Soon: ",s.payables.due_within_7_days?.count||0]}),e.jsxs("span",{style:{color:"#f44336"},children:["Overdue: ",s.payables.overdue?.count||0]})]})]}),e.jsxs("button",{className:"action-btn",onClick:()=>a("/dashboard/fees/invoices"),children:[e.jsx(V,{size:16}),"View Fee Dashboard"]})]}),ge=({insights:s,navigate:t})=>e.jsxs("div",{className:"invoicing-tab",children:[e.jsxs("div",{className:"stats-mini-grid",children:[e.jsxs("div",{className:"stat-mini info",children:[e.jsx("div",{className:"stat-mini-value",children:s.invoicing?.total_enrolled||0}),e.jsx("div",{className:"stat-mini-label",children:"Total Enrolled"})]}),e.jsxs("div",{className:"stat-mini success",children:[e.jsx("div",{className:"stat-mini-value",children:s.invoicing?.invoiced||0}),e.jsx("div",{className:"stat-mini-label",children:"Invoiced"})]}),e.jsxs("div",{className:"stat-mini warning",children:[e.jsx("div",{className:"stat-mini-value",children:s.invoicing?.not_invoiced||0}),e.jsx("div",{className:"stat-mini-label",children:"Not Invoiced"})]}),e.jsxs("div",{className:"stat-mini",children:[e.jsx("div",{className:"stat-mini-value",children:s.invoicing?.needs_manual_count||0}),e.jsx("div",{className:"stat-mini-label",children:"Need Manual"})]})]}),e.jsxs("div",{className:"progress-section",children:[e.jsxs("div",{className:"progress-header",children:[e.jsx("span",{className:"progress-label",children:"Invoicing Coverage"}),e.jsxs("span",{className:"progress-value",children:[s.invoicing?.invoicing_rate||0,"%"]})]}),e.jsx("div",{className:"progress-bar-bg",children:e.jsx("div",{className:`progress-bar-fill ${s.invoicing?.invoicing_rate>=90?"success":s.invoicing?.invoicing_rate>=60?"warning":"danger"}`,style:{width:`${s.invoicing?.invoicing_rate||0}%`}})})]}),s.invoicing?.needs_manual_invoicing?.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"section-header",children:[e.jsx("div",{className:"section-header-icon",children:e.jsx(Y,{size:14})}),"Students Needing Invoices"]}),e.jsx("div",{className:"insights-list",children:s.invoicing.needs_manual_invoicing.slice(0,5).map((a,r)=>e.jsxs("div",{className:"insights-list-item",children:[e.jsx("div",{className:"insights-list-item-left",children:e.jsxs("span",{className:"insights-list-item-name",children:[a.student__first_name," ",a.student__last_name]})}),e.jsx("span",{className:"insights-list-item-meta",children:a.admission_number})]},r))})]}),e.jsxs("button",{className:"action-btn",onClick:()=>t("/dashboard/fees/invoices"),children:[e.jsx(v,{size:16}),"Generate Invoices"]})]}),pe=({insights:s,formatCurrency:t,navigate:a})=>e.jsxs("div",{className:"defaulters-tab",children:[e.jsxs("div",{className:"stats-mini-grid",children:[e.jsxs("div",{className:"stat-mini danger",children:[e.jsx("div",{className:"stat-mini-value",children:s.defaulters?.current_term?.count||0}),e.jsxs("div",{className:"stat-mini-label",children:[s.current_term," Defaulters"]})]}),e.jsxs("div",{className:"stat-mini warning",children:[e.jsx("div",{className:"stat-mini-value",children:s.defaulters?.previous_term?.count||0}),e.jsx("div",{className:"stat-mini-label",children:"Previous Term"})]})]}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem",marginBottom:"0.75rem"},children:[e.jsxs("div",{style:{flex:1,background:"#ffebee",padding:"0.6rem",borderRadius:"8px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:"0.65rem",color:"#f44336",marginBottom:"0.25rem"},children:"Current Arrears"}),e.jsx("div",{style:{fontSize:"1rem",fontWeight:"700",color:"#d32f2f"},children:t(s.defaulters?.current_term?.total_arrears||0)})]}),e.jsxs("div",{style:{flex:1,background:"#fff3e0",padding:"0.6rem",borderRadius:"8px",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:"0.65rem",color:"#ff9800",marginBottom:"0.25rem"},children:"Previous Arrears"}),e.jsx("div",{style:{fontSize:"1rem",fontWeight:"700",color:"#f57c00"},children:t(s.defaulters?.previous_term?.total_arrears||0)})]})]}),s.defaulters?.current_term?.top_defaulters?.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"section-header",children:[e.jsx("div",{className:"section-header-icon",children:e.jsx(f,{size:14})}),"Top Defaulters"]}),e.jsx("div",{className:"insights-list",children:s.defaulters.current_term.top_defaulters.slice(0,5).map((r,i)=>e.jsxs("div",{className:"insights-list-item",children:[e.jsxs("div",{className:"insights-list-item-left",children:[e.jsxs("span",{className:"insights-list-item-name",children:[r.student__student__first_name," ",r.student__student__last_name]}),e.jsx("span",{className:"insights-list-item-meta",children:r.student__admission_number})]}),e.jsx("span",{className:"insights-list-item-value",children:t(r.balance)})]},i))})]}),e.jsxs("button",{className:"action-btn",onClick:()=>a("/dashboard/fees/arrears"),children:[e.jsx(f,{size:16}),"View All Defaulters"]})]}),fe=({insights:s})=>e.jsxs("div",{className:"attendance-tab",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("div",{className:"section-header-icon",children:e.jsx(k,{size:14})}),"Today's Attendance"]}),e.jsxs("div",{className:"stats-mini-grid",children:[e.jsxs("div",{className:"stat-mini success",children:[e.jsx("div",{className:"stat-mini-value",children:s.attendance?.today?.present||0}),e.jsx("div",{className:"stat-mini-label",children:"Present"})]}),e.jsxs("div",{className:"stat-mini danger",children:[e.jsx("div",{className:"stat-mini-value",children:s.attendance?.today?.absent||0}),e.jsx("div",{className:"stat-mini-label",children:"Absent"})]}),e.jsxs("div",{className:"stat-mini warning",children:[e.jsx("div",{className:"stat-mini-value",children:s.attendance?.today?.late||0}),e.jsx("div",{className:"stat-mini-label",children:"Late"})]}),e.jsxs("div",{className:"stat-mini info",children:[e.jsxs("div",{className:"stat-mini-value",children:[s.attendance?.today?.rate||0,"%"]}),e.jsx("div",{className:"stat-mini-label",children:"Rate"})]})]}),e.jsxs("div",{className:"progress-section",style:{marginTop:"0.75rem"},children:[e.jsxs("div",{className:"progress-header",children:[e.jsx("span",{className:"progress-label",children:"Today's Attendance Rate"}),e.jsxs("span",{className:"progress-value",children:[s.attendance?.today?.rate||0,"%"]})]}),e.jsx("div",{className:"progress-bar-bg",children:e.jsx("div",{className:`progress-bar-fill ${s.attendance?.today?.rate>=90?"success":s.attendance?.today?.rate>=75?"warning":"danger"}`,style:{width:`${s.attendance?.today?.rate||0}%`}})})]}),e.jsxs("div",{className:"section-header",style:{marginTop:"1rem"},children:[e.jsx("div",{className:"section-header-icon",children:e.jsx(D,{size:14})}),"This Week"]}),e.jsxs("div",{style:{background:"var(--bg-secondary, #f9fafb)",padding:"0.75rem",borderRadius:"8px"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"},children:[e.jsx("span",{style:{fontSize:"0.75rem",color:"var(--text-secondary)"},children:"Total Records"}),e.jsx("span",{style:{fontSize:"0.85rem",fontWeight:"600"},children:s.attendance?.this_week?.total||0})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"0.5rem"},children:[e.jsx("span",{style:{fontSize:"0.75rem",color:"var(--text-secondary)"},children:"Weekly Rate"}),e.jsxs("span",{style:{fontSize:"0.85rem",fontWeight:"600",color:s.attendance?.this_week?.rate>=90?"#4caf50":s.attendance?.this_week?.rate>=75?"#ff9800":"#f44336"},children:[s.attendance?.this_week?.rate||0,"%"]})]}),e.jsxs("div",{className:"attendance-visual",children:[e.jsxs("div",{className:"attendance-stat",children:[e.jsx("div",{className:"attendance-dot present"}),e.jsxs("span",{children:[s.attendance?.this_week?.present||0," Present"]})]}),e.jsxs("div",{className:"attendance-stat",children:[e.jsx("div",{className:"attendance-dot absent"}),e.jsxs("span",{children:[s.attendance?.this_week?.absent||0," Absent"]})]})]})]})]}),ve=({data:s,compact:t=!1})=>{const a=s||{storage:{used:75,total:100,unit:"GB"},bandwidth:{used:45,total:100,unit:"GB"},activeUsers:{count:235,total:300},serverLoad:{percentage:68}},r=[{name:"Used",value:a.storage.used,color:"#3f51b5"},{name:"Free",value:a.storage.total-a.storage.used,color:"#e0e0e0"}],i=[{name:"Used",value:a.bandwidth.used,color:"#4caf50"},{name:"Remaining",value:a.bandwidth.total-a.bandwidth.used,color:"#e0e0e0"}],c=(h,m,l,o="")=>e.jsxs("div",{style:{flex:1,textAlign:"center"},children:[e.jsxs("div",{style:{height:t?"80px":"120px",position:"relative"},children:[e.jsx(p,{width:"100%",height:"100%",children:e.jsxs(se,{innerRadius:t?"70%":"60%",outerRadius:"100%",data:[{value:h}],startAngle:180,endAngle:-180,children:[e.jsx(te,{type:"number",domain:[0,100],angleAxisId:0,tick:!1}),e.jsx(ae,{background:{fill:"#e0e0e0"},dataKey:"value",cornerRadius:10,fill:l,minAngle:15})]})}),e.jsx("div",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",textAlign:"center"},children:e.jsxs("div",{style:{fontSize:t?"1.2rem":"1.5rem",fontWeight:"bold",color:"var(--text-main)"},children:[h,"%"]})})]}),e.jsx("div",{style:{fontSize:t?"0.75rem":"0.9rem",color:"var(--text-secondary)",marginTop:"0.5rem"},children:m})]}),x=(h,m,l)=>e.jsxs("div",{style:{flex:1,textAlign:"center"},children:[e.jsx("div",{style:{height:t?"80px":"120px"},children:e.jsx(p,{width:"100%",height:"100%",children:e.jsx(U,{children:e.jsx(F,{data:h,cx:"50%",cy:"50%",innerRadius:t?25:35,outerRadius:t?40:50,paddingAngle:0,dataKey:"value",children:h.map((o,g)=>e.jsx(T,{fill:l[g]},`cell-${g}`))})})})}),e.jsx("div",{style:{fontSize:t?"0.75rem":"0.9rem",color:"var(--text-secondary)",marginTop:"0.5rem"},children:m})]});return e.jsx("div",{className:"resource-usage",style:{height:"100%"},children:t?e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",height:"100%"},children:[c(a.serverLoad.percentage,"Server Load","#ff9800"),c(Math.round(a.activeUsers.count/a.activeUsers.total*100),"Active Users","#e91e63"),x(r,`Storage: ${a.storage.used}/${a.storage.total}${a.storage.unit}`,["#3f51b5","#e0e0e0"]),x(i,`Bandwidth: ${a.bandwidth.used}/${a.bandwidth.total}${a.bandwidth.unit}`,["#4caf50","#e0e0e0"])]}):e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"2rem",height:"100%"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem"},children:[e.jsxs("div",{children:[e.jsx("h4",{style:{marginBottom:"0.5rem",color:"var(--text-main)"},children:"Storage Usage"}),x(r,`${a.storage.used}${a.storage.unit} used of ${a.storage.total}${a.storage.unit}`,["#3f51b5","#e0e0e0"])]}),e.jsxs("div",{children:[e.jsx("h4",{style:{marginBottom:"0.5rem",color:"var(--text-main)"},children:"Bandwidth Usage"}),x(i,`${a.bandwidth.used}${a.bandwidth.unit} used this month`,["#4caf50","#e0e0e0"])]})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem"},children:[e.jsxs("div",{children:[e.jsx("h4",{style:{marginBottom:"0.5rem",color:"var(--text-main)"},children:"Server Load"}),c(a.serverLoad.percentage,`${a.serverLoad.percentage}% CPU Usage`,"#ff9800")]}),e.jsxs("div",{children:[e.jsx("h4",{style:{marginBottom:"0.5rem",color:"var(--text-main)"},children:"Active Users"}),c(Math.round(a.activeUsers.count/a.activeUsers.total*100),`${a.activeUsers.count} active of ${a.activeUsers.total}`,"#e91e63")]})]})]})})},ue={"user-plus":B,"credit-card":S,"file-text":v,bell:u},be=({activities:s})=>e.jsxs("div",{style:{background:"white",padding:"1.5rem",borderRadius:"var(--border-radius)",boxShadow:"var(--shadow-sm)",border:"1px solid var(--border-color-light)",height:"100%",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",fontWeight:"700",color:"var(--text-main)"},children:"Recent Activity"}),e.jsx("button",{style:{border:"none",background:"transparent",color:"var(--primary-color)",fontSize:"0.9rem",cursor:"pointer",fontWeight:"600",transition:"color 0.2s"},children:"View All"})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1.2rem",flex:1,overflowY:"auto"},children:s.map(t=>{const a=ue[t.icon]||u;return e.jsxs("div",{style:{display:"flex",gap:"1rem",alignItems:"flex-start"},children:[e.jsx("div",{style:{minWidth:"40px",height:"40px",borderRadius:"12px",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#555"},children:e.jsx(a,{size:20})}),e.jsxs("div",{children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--text-main)",marginBottom:"4px"},children:t.title}),e.jsx("p",{style:{fontSize:"0.85rem",color:"var(--text-secondary)",marginBottom:"4px",lineHeight:"1.3"},children:t.desc}),e.jsxs("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(W,{size:12})," ",t.time]})]})]},t.id)})})]}),E=()=>{const s=_(),t=[{label:"Add Student",icon:B,color:"#e3f2fd",textColor:"#1976d2",path:"/dashboard/students/admission"},{label:"Generate Report",icon:v,color:"#e8f5e9",textColor:"#2e7d32",path:"/dashboard/academics/reports"},{label:"Record Payment",icon:S,color:"#fff3e0",textColor:"#f57c00",path:"/dashboard/fees/receipts"},{label:"Take Attendance",icon:I,color:"#ffebee",textColor:"#d32f2f",path:"/dashboard/hr/staff-attendance"},{label:"Schedule Exam",icon:k,color:"#f3e5f5",textColor:"#7b1fa2",path:"/dashboard/academics"},{label:"Export Data",icon:Q,color:"#efebe9",textColor:"#5d4037",path:"/dashboard/settings"}];return e.jsxs("div",{style:{background:"white",padding:"1.5rem",borderRadius:"var(--border-radius)",boxShadow:"var(--shadow-sm)",border:"1px solid var(--border-color-light)",height:"100%",display:"flex",flexDirection:"column"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",fontWeight:"700",color:"var(--text-main)",marginBottom:"1.5rem"},children:"Quick Actions"}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"1rem",flex:1},children:t.map((a,r)=>e.jsxs("div",{className:"action-card",onClick:()=>a.path&&s(a.path),style:{background:a.color,borderRadius:"12px",padding:"1rem",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",textAlign:"center",gap:"8px",height:"100%",border:"1px solid transparent"},onMouseEnter:i=>{i.currentTarget.style.transform="translateY(-2px)",i.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.05)"},onMouseLeave:i=>{i.currentTarget.style.transform="translateY(0)",i.currentTarget.style.boxShadow="none"},children:[e.jsx(a.icon,{size:24,color:a.textColor}),e.jsx("span",{style:{fontSize:"0.8rem",fontWeight:"600",color:a.textColor,lineHeight:"1.2"},children:a.label})]},r))})]})},je=({events:s})=>e.jsxs("div",{style:{background:"white",padding:"1.5rem",borderRadius:"var(--border-radius)",boxShadow:"var(--shadow-sm)",border:"1px solid var(--border-color-light)",height:"100%",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"},children:[e.jsx("h3",{style:{fontSize:"1.1rem",fontWeight:"700",color:"var(--text-main)"},children:"Upcoming Events"}),e.jsx("button",{style:{border:"none",background:"transparent",color:"var(--primary-color)",fontSize:"0.9rem",cursor:"pointer",fontWeight:"600",transition:"color 0.2s"},children:"View Calendar"})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"1rem",flex:1,overflowY:"auto"},children:s.map(t=>e.jsx("div",{style:{display:"flex",gap:"12px",padding:"1rem",background:"#f8fafc",borderRadius:"12px",borderLeft:`4px solid ${t.color}`,transition:"background 0.2s"},onMouseEnter:a=>a.currentTarget.style.background="#f1f5f9",onMouseLeave:a=>a.currentTarget.style.background="#f8fafc",children:e.jsxs("div",{style:{flex:1},children:[e.jsx("h4",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--text-main)",marginBottom:"4px"},children:t.title}),e.jsxs("div",{style:{display:"flex",gap:"1rem",fontSize:"0.8rem",color:"var(--text-secondary)"},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(k,{size:12})," ",t.date]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"4px"},children:[e.jsx(W,{size:12})," ",t.time]})]}),e.jsx("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",marginTop:"4px"},children:t.location})]})},t.id))})]}),ye=d.lazy(()=>j(()=>import("./FeesCollectionTab-207fAP1y.js"),__vite__mapDeps([0,1,2,3,4,5]))),we=d.lazy(()=>j(()=>import("./PayablesFinanceTab-DLH7mKyT.js"),__vite__mapDeps([6,1,2,3,4,5]))),Ne=d.lazy(()=>j(()=>import("./ExaminationsTab-Cmko0eeQ.js"),__vite__mapDeps([7,1,2,3,4,5]))),ke=d.lazy(()=>j(()=>import("./HRPayrollTab-HayJRlDL.js"),__vite__mapDeps([8,1,2,3,4,5]))),Ee=()=>{_();const[s,t]=d.useState(null),[a,r]=d.useState(!0),[i,c]=d.useState("overview"),x=[{key:"overview",label:"Overview",icon:X},{key:"fees",label:"Fees & Collection",icon:S},{key:"payables",label:"Payables & Finance",icon:v},{key:"examinations",label:"Examinations",icon:q},{key:"hr",label:"HR & Payroll",icon:J}];d.useEffect(()=>{(async()=>{try{const o=await le.getStats();o.success&&t(o.data)}catch(o){console.error("Failed to fetch dashboard stats",o)}finally{r(!1)}})()},[]);const h={hidden:{opacity:0},show:{opacity:1,transition:{staggerChildren:.05}}},m=()=>{if(!s?.user)return"User";const{first_name:l,last_name:o,username:g}=s.user;return l||o?`${l||""} ${o||""}`.trim():g||"User"};return e.jsx(ne,{title:"Dashboard",children:e.jsxs("div",{className:"dashboard-home",children:[e.jsxs("div",{className:"dashboard-header",children:[e.jsxs("h1",{children:["Welcome back, ",m(),"!"]}),e.jsx("p",{children:"Here's what's happening at your school today."})]}),e.jsx("div",{className:"dashboard-tabs",children:x.map(l=>{const o=l.icon;return e.jsxs("button",{className:`dashboard-tab ${i===l.key?"active":""}`,onClick:()=>c(l.key),children:[e.jsx(o,{size:16}),e.jsx("span",{children:l.label})]},l.key)})}),i==="overview"&&s&&e.jsxs(N.div,{initial:"hidden",animate:"show",variants:h,className:"dashboard-content",children:[e.jsx("div",{className:"mb-4","data-tour":"dashboard-clock-widget",children:e.jsxs("div",{className:"chart-container-compact",style:{minHeight:"260px"},children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"My Attendance Clock"}),e.jsx("p",{children:"Clock in or out directly from your dashboard."})]}),e.jsx(ie,{compact:!0})]})}),e.jsxs("div",{className:"stats-grid-dense p-5",children:[s.stats.slice(0,4).map((l,o)=>e.jsx(w,{...l},o)),s.stats.slice(4,8).map((l,o)=>e.jsx(w,{...l,variant:"secondary"},o+4))]}),s.stats.length>8&&e.jsxs("div",{className:"stats-section",children:[e.jsx("h3",{className:"section-title",children:"Additional Metrics"}),e.jsx("div",{className:"stats-scrollable",children:s.stats.slice(8).map((l,o)=>e.jsx(w,{...l,variant:"compact"},o+8))})]}),e.jsxs("div",{className:"charts-grid-3col",children:[e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Weekly Attendance"}),e.jsx("p",{children:"Last 7 days attendance rate"})]}),e.jsx(oe,{data:s.charts.weekly_attendance,compact:!0})]}),e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Fee Collection"}),e.jsx("p",{children:"Current term fee collection"})]}),e.jsx(de,{data:s.charts.fee_collection,currentTerm:s.charts.current_term,compact:!0})]}),e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Student Performance"}),e.jsx("p",{children:"Average scores by subject"})]}),e.jsx(ce,{data:s.charts.performance,compact:!0})]})]}),e.jsxs("div",{className:"charts-grid-3col",style:{marginTop:"1rem"},children:[e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Enrollment Trends"}),e.jsx("p",{children:"Monthly new enrollments"})]}),e.jsx(me,{data:s.charts.enrollment,compact:!0})]}),e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Quick Actions"}),e.jsx("p",{children:"Frequently used operations"})]}),e.jsx(E,{compact:!0})]}),e.jsxs("div",{className:"chart-container-compact",children:[e.jsxs("div",{className:"chart-header-compact",children:[e.jsx("h3",{children:"Resource Usage"}),e.jsx("p",{children:"System resource utilization"})]}),e.jsx(ve,{data:s.resource_usage})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginTop:"1rem"},children:[e.jsx("div",{className:"widget-compact",style:{minHeight:"400px"},children:e.jsx(he,{})}),e.jsxs("div",{className:"widget-compact",children:[e.jsxs("div",{className:"widget-header-compact",children:[e.jsx("h3",{children:"Recent Activity"}),e.jsx("p",{children:"Latest system activities"})]}),e.jsx("div",{className:"widget-content-compact",children:e.jsx(be,{activities:s.recent_activity,compact:!0})})]})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"2fr 1fr",gap:"1rem",marginTop:"1rem"},children:[e.jsxs("div",{className:"widget-compact",children:[e.jsxs("div",{className:"widget-header-compact",children:[e.jsx("h3",{children:"Upcoming Events"}),e.jsx("p",{children:"Next 7 days schedule"})]}),e.jsx("div",{className:"widget-content-compact",children:e.jsx(je,{events:s.upcoming_events,compact:!0})})]}),e.jsxs("div",{className:"widget-compact",children:[e.jsxs("div",{className:"widget-header-compact",children:[e.jsx("h3",{children:"Quick Links"}),e.jsx("p",{children:"Frequently used"})]}),e.jsx("div",{className:"widget-content-compact",children:e.jsx(E,{compact:!0})})]})]})]}),i!=="overview"&&e.jsxs(d.Suspense,{fallback:e.jsxs("div",{className:"dashboard-tab-loading",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:"Loading..."})]}),children:[i==="fees"&&e.jsx(ye,{}),i==="payables"&&e.jsx(we,{}),i==="examinations"&&e.jsx(Ne,{}),i==="hr"&&e.jsx(ke,{})]}),e.jsx("style",{children:`
                    .dashboard-header {
                        margin-bottom: 1.5rem;
                        padding: 0 1rem;
                    }
                    
                    .dashboard-header h1 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin-bottom: 0.25rem;
                    }
                    
                    .dashboard-header p {
                        color: var(--text-secondary);
                        font-size: 0.9rem;
                    }

                    .dashboard-tabs {
                        display: flex;
                        gap: 0.25rem;
                        padding: 0 1rem;
                        margin-bottom: 1.25rem;
                        border-bottom: 2px solid var(--border-color, #e2e8f0);
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    .dashboard-tab {
                        display: flex;
                        align-items: center;
                        gap: 0.4rem;
                        padding: 0.6rem 1rem;
                        border: none;
                        background: none;
                        color: var(--text-secondary, #64748b);
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                        margin-bottom: -2px;
                        white-space: nowrap;
                        transition: all 0.2s;
                        border-radius: 6px 6px 0 0;
                    }

                    .dashboard-tab:hover {
                        color: var(--text-main, #1e293b);
                        background: var(--bg-hover, #f1f5f9);
                    }

                    .dashboard-tab.active {
                        color: #2563eb;
                        border-bottom-color: #2563eb;
                        background: rgba(37, 99, 235, 0.05);
                    }

                    .dashboard-tab-loading {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 4rem 1rem;
                        color: var(--text-secondary, #64748b);
                    }

                    .dashboard-tab-loading .spinner {
                        width: 32px;
                        height: 32px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #2563eb;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin-bottom: 0.75rem;
                    }

                    @keyframes spin { to { transform: rotate(360deg); } }
                    
                    .dashboard-content {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        padding: 0 1rem;
                    }
                    
                    .section-title {
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: var(--text-main);
                        margin-bottom: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .stats-section {
                        margin-bottom: 1rem;
                    }
                    
                    /* Responsive adjustments */
                    @media (max-width: 1200px) {
                        .charts-grid-3col {
                            grid-template-columns: repeat(2, 1fr);
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .charts-grid-3col {
                            grid-template-columns: 1fr;
                        }
                        
                        .dashboard-content > div:last-child {
                            grid-template-columns: 1fr;
                        }
                        
                        .dashboard-header {
                            padding: 0 0.75rem;
                        }
                        
                        .dashboard-content {
                            padding: 0 0.75rem;
                        }
                    }
                `})]})})};export{Ee as default};
