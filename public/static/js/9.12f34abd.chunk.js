(this["webpackJsonpreact-practice"]=this["webpackJsonpreact-practice"]||[]).push([[9],{589:function(e,c,t){"use strict";t.r(c);var s=t(13),a=t(1),n=t(24),r=t(22),j=t.n(r),i=t(249),u=t(248),o=t(73),h=t(74),l=t(132),d=t(251),b=t(2);c.default=function(){var e=Object(a.useState)([]),c=Object(s.a)(e,2),t=c[0],r=c[1],O=Object(a.useState)(!0),p=Object(s.a)(O,2),x=p[0],f=p[1],m=Object(n.h)(),g=decodeURIComponent(m.search.split("=")[1]),v=x?Object(b.jsx)(u.a,{}):t.map((function(e){return Object(b.jsx)(i.a,{product:e},e._id)}));return Object(a.useEffect)((function(){var e=j.a.CancelToken.source();return f(!0),j.a.get("/products/search?q=".concat(g)).then((function(e){r(e.data.results),f(!1)})).catch((function(e){j.a.isCancel(e)||alert(e.response.data.error)})),function(){return e.cancel()}}),[g]),Object(b.jsxs)(o.a,{title:g,children:[Object(b.jsx)(l.a,{}),Object(b.jsx)(h.a,{}),Object(b.jsx)("main",{children:Object(b.jsx)("section",{className:"search-results",children:Object(b.jsxs)("div",{className:"container",children:[Object(b.jsxs)("header",{children:[Object(b.jsx)("h3",{className:"search-results__heading text-center",children:!x&&Object(b.jsxs)(b.Fragment,{children:['You searched for "',g,'"']})}),!x&&!t.length&&Object(b.jsx)("p",{children:"No Results found!"})]}),Object(b.jsx)(d.a,{cards:v})]})})})]})}}}]);
//# sourceMappingURL=9.12f34abd.chunk.js.map