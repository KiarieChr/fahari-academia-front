const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/FeeStructureDashboard-MWkCdTWE.js","assets/ui-vMFa3nTH.js","assets/vendor-BDwHIWx6.js","assets/pdf-BhCKS0Ko.js","assets/index-BSRe-Q7q.js","assets/index-CMbWgOXs.css","assets/ApplyTemplateWizard-Dp5szgfz.js","assets/studentSettingsService-BJdhLz7S.js","assets/FeeTemplateDashboard-DvRuKwKh.js","assets/Modal-B32Lxadp.js"])))=>i.map(i=>d[i]);
import{_ as u}from"./pdf-BhCKS0Ko.js";import{j as e,av as g,p as j}from"./ui-vMFa3nTH.js";import{j as v,u as S,r as o}from"./vendor-BDwHIWx6.js";import{D as y}from"./DashboardLayout-Dga0FO3e.js";import"./index-BSRe-Q7q.js";import"./TopBar-CSJJB_xP.js";/* empty css                  */const w=o.lazy(()=>u(()=>import("./FeeStructureDashboard-MWkCdTWE.js"),__vite__mapDeps([0,1,2,3,4,5,6,7])).then(t=>({default:t.FeeStructureTab}))),k=o.lazy(()=>u(()=>import("./FeeTemplateDashboard-DvRuKwKh.js"),__vite__mapDeps([8,1,2,9,6,4,3,5,7])).then(t=>({default:t.FeeTemplateTab}))),r=({h:t="1rem",w:m="100%",r:n="8px",mb:i="0"})=>e.jsx("div",{style:{height:t,width:m,borderRadius:n,marginBottom:i,background:"linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",backgroundSize:"200% 100%",animation:"feeSkeletonShimmer 1.4s infinite linear"}}),l=()=>e.jsxs("div",{style:{padding:"1.5rem"},children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"1rem",marginBottom:"1.5rem"},children:[0,1,2,3].map(t=>e.jsxs("div",{style:{background:"#fff",borderRadius:"12px",padding:"1.25rem",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"},children:[e.jsx(r,{h:"0.75rem",w:"60%",mb:"0.75rem"}),e.jsx(r,{h:"1.5rem",w:"45%",mb:"0.5rem"}),e.jsx(r,{h:"0.6rem",w:"80%"})]},t))}),e.jsx("div",{style:{background:"#fff",borderRadius:"12px",padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.07)",marginBottom:"1.5rem",display:"flex",gap:"1rem"},children:[0,1,2,3].map(t=>e.jsx(r,{h:"2.25rem",r:"8px"},t))}),e.jsxs("div",{style:{background:"#fff",borderRadius:"12px",padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"},children:[e.jsx(r,{h:"2rem",mb:"1rem"}),[0,1,2,3,4].map(t=>e.jsxs("div",{style:{display:"flex",gap:"1rem",marginBottom:"0.75rem",alignItems:"center"},children:[e.jsx(r,{h:"1rem",w:"30%"}),e.jsx(r,{h:"1rem",w:"20%"}),e.jsx(r,{h:"1rem",w:"15%"}),e.jsx(r,{h:"1rem",w:"15%"}),e.jsx(r,{h:"1rem",w:"12%"})]},t))]})]}),b=[{id:"structure",label:"Fee Structure",icon:g},{id:"templates",label:"Fee Templates",icon:j}],P=()=>{const t=v(),m=S(),n=()=>{const s=new URLSearchParams(t.search).get("tab");return b.find(c=>c.id===s)?s:"structure"},[i,d]=o.useState(n),[p,x]=o.useState(()=>new Set([n()]));o.useEffect(()=>{const a=n();a!==i&&d(a)},[t.search]);const f=a=>{d(a),x(h=>new Set([...h,a]));const s=new URLSearchParams(t.search);a==="structure"?s.delete("tab"):s.set("tab",a);const c=s.toString();m(`${t.pathname}${c?"?"+c:""}`,{replace:!0})};return e.jsxs(y,{title:"Fee Setup",children:[e.jsx("style",{children:`
                @keyframes feeSkeletonShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .fee-setup-tab-nav {
                    display: flex;
                    gap: 0;
                    border-bottom: 2px solid #e5e7eb;
                    margin-bottom: 1.5rem;
                    background: #fff;
                    border-radius: 12px 12px 0 0;
                    padding: 0 1rem;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
                }
                .fee-setup-tab-btn {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 0.85rem 1.4rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #64748b;
                    border: none;
                    background: none;
                    cursor: pointer;
                    position: relative;
                    transition: color 150ms ease;
                    white-space: nowrap;
                    border-bottom: 3px solid transparent;
                    margin-bottom: -2px;
                }
                .fee-setup-tab-btn:hover {
                    color: #4f46e5;
                }
                .fee-setup-tab-btn.active {
                    color: #4f46e5;
                    border-bottom-color: #4f46e5;
                }
                .fee-setup-tab-btn .tab-icon {
                    opacity: 0.7;
                    transition: opacity 150ms;
                }
                .fee-setup-tab-btn.active .tab-icon,
                .fee-setup-tab-btn:hover .tab-icon {
                    opacity: 1;
                }
                .fee-tab-pane {
                    display: none;
                }
                .fee-tab-pane.active {
                    display: block;
                }
            `}),e.jsx("div",{className:"fee-setup-tab-nav",children:b.map(a=>{const s=a.icon;return e.jsxs("button",{className:`fee-setup-tab-btn ${i===a.id?"active":""}`,onClick:()=>f(a.id),children:[e.jsx(s,{size:15,className:"tab-icon"}),a.label]},a.id)})}),e.jsx("div",{className:`fee-tab-pane ${i==="structure"?"active":""}`,children:p.has("structure")&&e.jsx(o.Suspense,{fallback:e.jsx(l,{}),children:e.jsx(w,{})})}),e.jsx("div",{className:`fee-tab-pane ${i==="templates"?"active":""}`,children:p.has("templates")&&e.jsx(o.Suspense,{fallback:e.jsx(l,{}),children:e.jsx(k,{})})})]})};export{P as default};
