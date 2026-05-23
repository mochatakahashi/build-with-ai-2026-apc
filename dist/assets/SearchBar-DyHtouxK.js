import{c as l,r as n,j as e,X as p}from"./index-UyJ-zxDp.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=l("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=l("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);function j({value:a,onChange:t,placeholder:h="Search..."}){const[c,s]=n.useState(a);n.useEffect(()=>{s(a)},[a]);const i=u=>{const r=u.target.value;s(r),t(r)},o=()=>{s(""),t("")};return e.jsxs("div",{className:"search-bar",children:[e.jsx(x,{className:"search-bar__icon",size:18}),e.jsx("input",{type:"text",className:"search-bar__input form-input",placeholder:h,value:c,onChange:i}),c&&e.jsx("button",{className:"search-bar__clear",onClick:o,type:"button",title:"Clear search",children:e.jsx(p,{size:16})})]})}export{m as P,j as S};
//# sourceMappingURL=SearchBar-DyHtouxK.js.map
