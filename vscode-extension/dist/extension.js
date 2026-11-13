var xo=Object.create;var lt=Object.defineProperty;var _o=Object.getOwnPropertyDescriptor;var To=Object.getOwnPropertyNames;var Ao=Object.getPrototypeOf,So=Object.prototype.hasOwnProperty;var Io=(o,e)=>{for(var t in e)lt(o,t,{get:e[t],enumerable:!0})},$s=(o,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of To(e))!So.call(o,a)&&a!==t&&lt(o,a,{get:()=>e[a],enumerable:!(s=_o(e,a))||s.enumerable});return o};var O=(o,e,t)=>(t=o!=null?xo(Ao(o)):{},$s(e||!o||!o.__esModule?lt(t,"default",{value:o,enumerable:!0}):t,o)),Co=o=>$s(lt({},"__esModule",{value:!0}),o);var Jn={};Io(Jn,{activate:()=>Kn,deactivate:()=>Vn});module.exports=Co(Jn);var Bt=O(require("node:http")),N=O(require("vscode"));var Pe=O(require("node:fs"),1),$t=O(require("node:path"),1),ca=O(require("node:os"),1);var Y="https://copilot.tencent.com",J="https://www.codebuddy.cn",q="https://www.workbuddy.ai",Hs="/v2/chat/completions",Us="/v2/plugin/auth/token/refresh",Ws="/v2/enterprises/personal/models",js="/console/enterprises/personal/models",Fs="/v2/plugin/auth/models",Gs="/v3/config",Lt="/v2/billing/meter/get-user-resource",Dt="/billing/meter/get-user-resource",zs="/v2/billing/meter/daily-checkin";var ct="/billing/ide/trial",Re="/v2/videos/generations",qs="/activity/growth/buddy/travel/status",Ks="/activity/growth/buddy/travel/depart",Vs="/activity/growth/buddy/travel/claim",Js="/activity/growth/buddy/info",Xs="/activity/growth/buddy/first",Ys="/activity/growth/buddy/agreement",Zs="/activity/growth/streak",Qs="/activity/growth/redeem",ea="/activity/growth/lottery/chances",ta="/activity/growth/lottery/draw",le="/v2/report",sa="/activity/growth/heatmap",aa="/activity/growth/makeup-cards/use",oa="/billing/meter/claim-gift",na="/billing/meter/claim-compensation";var K="1.3.0",be="XCool-603/dsh-workbuddy2api";var C={NONE:"none",HARD_CREDIT:"hard_credit",SOFT_RATE:"soft_rate",SESSION_DEAD:"session_dead",NOT_FOUND:"not_found",MODEL_BLOCKED:"model_blocked",IMAGE_INVALID:"image_invalid",SERVER:"server",CONTENT_BLOCKED:"content_blocked",BAD_PARAMS:"bad_params",ACCOUNT_FAULT:"account_fault",PROMPT_TOO_LONG:"prompt_too_long",WAF_BLOCK:"waf_block",CLIENT:"client"};function Nt(o,e=[]){let t=String(o||"").replace(/credits?/gi,"").trim(),s=t.match(/x?\s*([0-9]+(?:\.[0-9]+)?)/i),a=s?Number(s[1]):null,n=Array.isArray(e)?e:[],r="";for(let i of n)if(typeof i=="string"&&i.startsWith("badge:")){let d=i.split(":");if(d[1]){r=d[1];break}}let l=a===0||r.includes("\u514D\u8D39")||/free\s*now/i.test(r),c=a!==null?`x${a.toFixed(2)}`:t||"-";return{credits:t||"",rate:c,multiplier:a,isFree:l,badge:r}}var ra={hy4free:{efforts:["high"],defaultEffort:"high"},hy4std:{efforts:["high"],defaultEffort:"high"},"hy4-preview-x":{efforts:["high"],defaultEffort:"high"},hy3:{efforts:["high"],defaultEffort:"high"},"hy3-x":{efforts:["low","high"],defaultEffort:"high"},"glm-5.3":{efforts:["low","high","max"],defaultEffort:"high"},"glm-5.3-flash":{efforts:["low","high","max"],defaultEffort:"high"},"glm-5.2":{efforts:["medium","high"],defaultEffort:"medium"},"glm-4.6v":{efforts:["medium"],defaultEffort:"medium"},"minimax-m2.5":{efforts:["medium"],defaultEffort:"medium"},"minimax-m3.1-flash":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"kimi-k3-1":{efforts:["medium"],defaultEffort:"medium"},"kimi-k3.1-pro":{efforts:["low","high","max"],defaultEffort:"high"},"kimi-k2.8-preview":{efforts:["low","high","max"],defaultEffort:"high"},"kimi-k2.5":{efforts:["medium"],defaultEffort:"medium"},"kimi-k2-thinking":{efforts:["medium"],defaultEffort:"medium"},"deepseek-v4-flash":{efforts:["high"],defaultEffort:"high"},"deepseek-v4.1-flash":{efforts:["low","high","max"],defaultEffort:"high"},"deepseek-v4-pro":{efforts:["high"],defaultEffort:"high"},"deepseek-v3-2-volc":{efforts:["medium"],defaultEffort:"medium"},"hunyuan-2.0-thinking":{efforts:["medium"],defaultEffort:"medium"},"space-bunny":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"step-5-preview":{efforts:["low","medium","high"],defaultEffort:"high"},"mimo-v2.6-pro":{efforts:["high"],defaultEffort:"high"}},ia={"max-model":{efforts:["high"],defaultEffort:"high"},hy4free:{efforts:["high"],defaultEffort:"high"},hy4std:{efforts:["high"],defaultEffort:"high"},hy3:{efforts:["low","high"],defaultEffort:"high"},"deepseek-v4.1-flash-sg":{efforts:["low","high","max"],defaultEffort:"high"},"deepseek-v4.1-flash":{efforts:["high"],defaultEffort:"high"},"gpt-6-astra":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"gpt-6.1-sol":{efforts:["low","medium","high","xhigh"],defaultEffort:"high"},"gpt-6-sol":{efforts:["low","medium","high","xhigh"],defaultEffort:"high"},"gpt-6-luna":{efforts:["low","medium","high","xhigh"],defaultEffort:"high"},"gpt-5.6-sol":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"gpt-5.6-terra":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"gpt-5.6-luna":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"},"grok-4.7":{efforts:["low","medium","high","xhigh"],defaultEffort:"high"},"gemini-3.8-flash":{efforts:["low","medium","high"],defaultEffort:"high"},"glm-5.3":{efforts:["low","high","max"],defaultEffort:"high"},"glm-5.3-flash":{efforts:["low","high","max"],defaultEffort:"high"},"kimi-k3.1-pro":{efforts:["low","high","max"],defaultEffort:"high"},"kimi-k3.1-pro-highspeed":{efforts:["low","high","max"],defaultEffort:"high"},"kimi-k3":{efforts:["medium"],defaultEffort:"medium"},"minimax-m3.1-flash":{efforts:["low","medium","high","xhigh","max"],defaultEffort:"high"}};function B(o){let e=Nt(o.credits,o.tags);return{id:o.id,bareId:o.id.replace(/^(cn|global):/i,""),name:o.name,description:o.description||"",realm:o.realm,contextWindow:o.contextWindow||2e5,maxTokens:o.maxTokens||32e3,supportsImages:!!o.supportsImages,supportsReasoning:!!o.supportsReasoning,supportsToolCall:!!(o.supportsToolCall??!0),supportedEfforts:o.supportedEfforts||[],defaultEffort:o.defaultEffort||"",credits:e.credits,rate:o.rate||e.rate,multiplier:o.multiplier??e.multiplier,isFree:o.isFree??e.isFree,badge:o.badge||e.badge||"",tags:o.tags||[],vendor:o.vendor||""}}var la=[B({id:"auto-free",name:"Auto Free (\u667A\u80FD\u514D\u8D39\u6A21\u578B\u8DEF\u7531)",description:"\u4F18\u5148\u8DEF\u7531\u5F53\u524D\u53EF\u7528 x0.00 \u514D\u8D39\u65D7\u8230\u4E0E\u8D85\u4F4E\u500D\u7387\u6A21\u578B",realm:"auto",contextWindow:96e4,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,credits:"x0.00",isFree:!0,badge:"\u667A\u80FD\u514D\u8D39"}),B({id:"global:hy4free",name:"Hy4 Free (Global)",description:"\u6700\u65B0\u65D7\u8230\u6A21\u578B\uFF0CAgent\u4E0E\u591A\u6A21\u4E13\u957F",realm:"global",contextWindow:96e4,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["high"],credits:"x0.00",badge:"\u514D\u8D39"}),B({id:"global:hy3",name:"Hy3 (Global)",description:"\u6DF7\u5143\u601D\u8003\u6A21\u578B\uFF0C\u589E\u5F3A\u63A8\u7406\u80FD\u529B",realm:"global",contextWindow:2e5,maxTokens:32e3,supportsReasoning:!0,supportedEfforts:["low","high"],credits:"x0.00",badge:"Free now"}),B({id:"global:gpt-6-luna",name:"GPT-6-Luna (Global)",description:"\u9AD8\u541E\u5410\u9AD8\u6027\u4EF7\u6BD4\u8F7B\u91CF\u4EFB\u52A1\u6A21\u578B",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh"],credits:"x0.07"}),B({id:"global:glm-5.3-flash",name:"GLM-5.3-Flash (Global)",description:"\u539F\u751F\u591A\u6A21\u6001\u89C6\u89C9\u4E0E\u6781\u901F\u7F16\u7A0B\u6A21\u578B",realm:"global",contextWindow:1e6,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.08"}),B({id:"global:minimax-m3.1-flash",name:"MiniMax-M3.1-Flash (Global)",description:"\u539F\u751F\u591A\u6A21\u6001 Agent \u4E0E\u6781\u901F\u63A8\u7406",realm:"global",contextWindow:2e5,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x0.08"}),B({id:"global:deepseek-v4.1-flash-sg",name:"DeepSeek-V4.1-Flash (Global)",description:"DeepSeek \u65D7\u8230\u6A21\u578B\uFF0C1M \u4E0A\u4E0B\u6587\u7A97\u53E3\uFF0C\u539F\u751F\u591A\u6A21\u6001",realm:"global",contextWindow:1e6,maxTokens:128e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.11"}),B({id:"global:gpt-5.6-luna",name:"GPT-5.6-Luna (Global)",description:"OpenAI \u8F7B\u91CF\u6A21\u578B\uFF0C\u54CD\u5E94\u5FEB\u901F",realm:"global",contextWindow:272e3,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x0.14"}),B({id:"global:default-model",name:"Auto (Global)",description:"\u5FEB\u901F\u54CD\u5E94\uFF0C\u9002\u5408\u65E5\u5E38\u95EE\u7B54\u548C\u7B80\u5355\u4EFB\u52A1",realm:"global",contextWindow:176e3,maxTokens:24e3,supportsImages:!0,credits:"x0.15"}),B({id:"global:hy4std",name:"Hy4 Standard (Global)",description:"\u6DF7\u5143\u65D7\u8230\u6807\u51C6\u7248",realm:"global",contextWindow:96e4,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["high"],credits:"x0.29"}),B({id:"global:glm-5.3",name:"GLM-5.3 (Global)",description:"\u80FD\u529B\u5747\u8861\uFF0C\u9002\u5408\u957F\u7A0B\u5DE5\u7A0B\u4EFB\u52A1",realm:"global",contextWindow:1e6,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.69"}),B({id:"global:gemini-3.8-flash",name:"Gemini-3.8-Flash (Global)",description:"\u80FD\u529B\u5747\u8861\uFF0C\u591A\u6A21\u6001\u9AD8\u6548\u63A8\u7406",realm:"global",contextWindow:1e6,maxTokens:65536,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high"],credits:"x0.95"}),B({id:"global:kimi-k3.1-pro",name:"Kimi-K3.1-Pro (Global)",description:"3\u4E07\u4EBF\u7EA7\u53C2\u6570\u5168\u80FD\u6A21\u578B",realm:"global",contextWindow:256e3,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.97"}),B({id:"global:gpt-6.1-sol",name:"GPT-6.1-Sol (Global)",description:"\u4E13\u4E3A\u590D\u6742\u7F16\u7801\u4E0E\u667A\u80FD\u4F53\u5DE5\u4F5C\u6D41\u6784\u5EFA",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh"],credits:"x1.33",badge:"\u7F16\u7801\u4E3B\u529B"}),B({id:"global:gpt-6-sol",name:"GPT-6-Sol (Global)",description:"\u590D\u6742\u7F16\u7801\u4E0E\u957F\u7A0B Agent \u65D7\u8230",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh"],credits:"x1.33"}),B({id:"global:max-model",name:"Max (Global)",description:"\u66F4\u5F3A\u7684\u6DF1\u5EA6\u63A8\u7406\u80FD\u529B",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,credits:"x1.33"}),B({id:"global:gpt-5.6-terra",name:"GPT-5.6-Terra (Global)",description:"OpenAI \u5747\u8861\u4E3B\u529B\u6A21\u578B",realm:"global",contextWindow:272e3,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x1.39"}),B({id:"global:kimi-k3.1-pro-highspeed",name:"Kimi-K3.1-Pro-Highspeed (Global)",description:"2-3x \u6781\u901F\u8F93\u51FA\u65D7\u8230",realm:"global",contextWindow:256e3,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x1.56"}),B({id:"global:kimi-k3",name:"Kimi-K3 (Global)",description:"\u590D\u6742\u957F\u7A0B\u4E0E\u524D\u7AEF\u5F00\u53D1\u4E13\u957F",realm:"global",contextWindow:2e5,maxTokens:32e3,supportsReasoning:!0,credits:"x1.62"}),B({id:"global:grok-4.7",name:"Grok-4.7 (Global)",description:"SpaceXAI \u524D\u6CBF\u7F16\u7A0B\u4E0E\u79D1\u7814\u5DE5\u4F5C\u6A21\u578B",realm:"global",contextWindow:256e3,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh"],credits:"x1.90"}),B({id:"global:gpt-5.6-sol",name:"GPT-5.6-Sol (Global)",description:"OpenAI \u6DF1\u5EA6\u957F\u7A0B\u63A8\u7406",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x3.47"}),B({id:"global:gpt-6-astra",name:"GPT-6-Astra (Global)",description:"OpenAI \u9876\u7EA7\u590D\u6742\u63A8\u7406\u65D7\u8230",realm:"global",contextWindow:272e3,maxTokens:72e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x6.67",badge:"\u6700\u9AD8\u500D\u7387"}),B({id:"cn:hy4free",name:"Hy4 \u9650\u65F6\u514D\u8D39 (CN)",description:"\u6700\u65B0\u65D7\u8230\u6A21\u578B\uFF0CAgent\u4E0E\u591A\u6A21\u4E13\u957F",realm:"cn",contextWindow:96e4,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["high"],credits:"x0.00",badge:"\u9650\u65F6\u514D\u8D39"}),B({id:"cn:hy3",name:"Hy3 \u9650\u65F6\u514D\u8D39 (CN)",description:"\u6DF7\u5143\u601D\u8003\u6A21\u578B\uFF0C\u589E\u5F3A\u63A8\u7406\u80FD\u529B",realm:"cn",contextWindow:2e5,maxTokens:32e3,supportsReasoning:!0,credits:"x0.00",badge:"\u9650\u65F6\u514D\u8D39"}),B({id:"cn:hunyuan-2.0-thinking",name:"Hunyuan-2.0-Thinking (CN)",description:"\u6DF7\u5143 2.0 \u601D\u8003\u8F7B\u91CF\u6A21\u578B",realm:"cn",contextWindow:128e3,maxTokens:16e3,supportsReasoning:!0,credits:"x0.04"}),B({id:"cn:hy3-x",name:"Hy3-X (CN)",description:"\u6DF7\u5143\u601D\u8003\u589E\u5F3A\u7248",realm:"cn",contextWindow:2e5,maxTokens:32e3,supportsReasoning:!0,supportedEfforts:["low","high"],credits:"x0.05"}),B({id:"cn:glm-5.3-flash",name:"GLM-5.3-Flash (CN)",description:"\u539F\u751F\u591A\u6A21\u6001\u89C6\u89C9\u6A21\u578B",realm:"cn",contextWindow:1e6,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.08"}),B({id:"cn:minimax-m3.1-flash",name:"MiniMax-M3.1-Flash (CN)",description:"\u6781\u901F\u7F16\u7A0B\u4E0E\u529E\u516C\u591A\u6A21\u6001",realm:"cn",contextWindow:2e5,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x0.08"}),B({id:"cn:space-bunny",name:"Space-Bunny (CN)",description:"\u6781\u5FEB\u7F16\u7801\u533F\u540D\u5927\u6A21\u578B\uFF0C\u652F\u6301\u591A\u6A21\u6001",realm:"cn",contextWindow:2e5,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","medium","high","xhigh","max"],credits:"x0.08"}),B({id:"cn:deepseek-v4.1-flash",name:"DeepSeek-V4.1-Flash (CN)",description:"V4.1-Flash \u6700\u65B0\u7248\uFF0C1M \u4E0A\u4E0B\u6587\uFF0C\u539F\u751F\u591A\u6A21\u6001",realm:"cn",contextWindow:1e6,maxTokens:128e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.11"}),B({id:"cn:glm-4.6v",name:"GLM-4.6V (CN)",description:"\u89C6\u89C9\u591A\u6A21\u6001\u6A21\u578B",realm:"cn",contextWindow:128e3,maxTokens:16e3,supportsImages:!0,credits:"x0.11"}),B({id:"cn:mimo-v2.6-pro",name:"MiMo-V2.6-Pro (CN)",description:"Xiaomi \u65D7\u8230\u63A8\u7406\u6A21\u578B",realm:"cn",contextWindow:256e3,maxTokens:32e3,supportsReasoning:!0,credits:"x0.13"}),B({id:"cn:fast-model",name:"\u5FEB\u901F Fast (CN)",description:"\u4F18\u5148\u54CD\u5E94\u901F\u5EA6\uFF0C\u9002\u5408\u7B80\u5355\u95EE\u7B54",realm:"cn",contextWindow:2e5,maxTokens:32e3,credits:"x0.15"}),B({id:"cn:deepseek-v4-flash",name:"DeepSeek-V4-Flash (CN)",description:"1M \u4E0A\u4E0B\u6587\u65D7\u8230\u5FEB\u901F\u7248",realm:"cn",contextWindow:1e6,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,credits:"x0.17"}),B({id:"cn:minimax-m2.5",name:"MiniMax-M2.5 (CN)",description:"\u7ECF\u5178\u5747\u8861\u5BF9\u8BDD\u6A21\u578B",realm:"cn",contextWindow:2e5,maxTokens:32e3,credits:"x0.18"}),B({id:"cn:glm-4.7",name:"GLM-4.7 (CN)",description:"\u667A\u8C31\u8F7B\u91CF\u4EE3\u7801\u6A21\u578B",realm:"cn",contextWindow:128e3,maxTokens:16e3,credits:"x0.23"}),B({id:"cn:hy4std",name:"Hy4 Standard (CN)",description:"\u6DF7\u5143\u65D7\u8230\u6807\u51C6\u7248",realm:"cn",contextWindow:96e4,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,credits:"x0.29"}),B({id:"cn:step-5-preview",name:"Step-5-Preview (CN)",description:"\u9636\u8DC3 StepFun \u65D7\u8230\u57FA\u6A21",realm:"cn",contextWindow:256e3,maxTokens:32e3,supportsReasoning:!0,supportedEfforts:["low","medium","high"],credits:"x0.33"}),B({id:"cn:kimi-k2.5",name:"Kimi-K2.5 (CN)",description:"\u957F\u6587\u672C\u901A\u7528\u6A21\u578B",realm:"cn",contextWindow:2e5,maxTokens:32e3,credits:"x0.45"}),B({id:"cn:balanced-model",name:"\u5747\u8861 Balanced (CN)",description:"\u517C\u987E\u901F\u5EA6\u4E0E\u8D28\u91CF",realm:"cn",contextWindow:256e3,maxTokens:32e3,credits:"x0.50"}),B({id:"cn:deepseek-v4-pro",name:"DeepSeek-V4-Pro (CN)",description:"DeepSeek \u6DF1\u5EA6\u79D1\u7814/\u4EE3\u7801\u65D7\u8230",realm:"cn",contextWindow:1e6,maxTokens:64e3,supportsImages:!0,supportsReasoning:!0,credits:"x0.51"}),B({id:"cn:glm-5.3",name:"GLM-5.3 (CN)",description:"\u590D\u6742\u8F6F\u4EF6\u5DE5\u7A0B\u4E0E\u957F\u7A0B Agent \u65D7\u8230",realm:"cn",contextWindow:1e6,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.69"}),B({id:"cn:glm-5.2",name:"GLM-5.2 (CN)",description:"1M \u4E0A\u4E0B\u6587\uFF0C\u591C\u95F4\u6298\u6263\u6A21\u578B",realm:"cn",contextWindow:1e6,maxTokens:32e3,supportsImages:!0,supportsReasoning:!0,credits:"x0.79",badge:"\u591C\u95F4\u6298\u6263"}),B({id:"cn:kimi-k3.1-pro",name:"Kimi-K3.1-Pro (CN)",description:"Kimi 3\u4E07\u4EBF\u53C2\u6570\u5168\u80FD\u5347\u7EA7\u7248",realm:"cn",contextWindow:256e3,maxTokens:32e3,supportsReasoning:!0,supportedEfforts:["low","high","max"],credits:"x0.97"}),B({id:"cn:kimi-k3-1",name:"Kimi-K3-1 (CN)",description:"\u590D\u6742\u957F\u7A0B\u4E0E\u524D\u7AEF\u5F00\u53D1\u4E13\u957F",realm:"cn",contextWindow:2e5,maxTokens:32e3,supportsReasoning:!0,credits:"x1.62"}),B({id:"kling-video-v3",name:"Kling 3.0 \u53EF\u7075\u89C6\u9891\u76F4\u51FA",description:"\u6587\u751F\u89C6\u9891 / \u56FE\u751F\u89C6\u9891\u5927\u6A21\u578B",realm:"video",contextWindow:8192,maxTokens:2048,supportsImages:!0,rate:"\u89C6\u9891",badge:"\u53EF\u70753.0"}),B({id:"minimax-video-h3",name:"MiniMax-H3 \u6D77\u87BA\u89C6\u9891\u76F4\u51FA",description:"\u6D77\u87BA\u9AD8\u6E05\u89C6\u9891\u751F\u6210\u6A21\u578B",realm:"video",contextWindow:8192,maxTokens:2048,supportsImages:!0,rate:"\u89C6\u9891",badge:"\u6D77\u87BAH3"})],ce={"deepseek-chat":"cn:deepseek-v4.1-flash","deepseek-reasoner":"cn:deepseek-v4-pro","gpt-4o":"global:gpt-6.1-sol","gpt-4o-mini":"global:gpt-6-luna","claude-3-5-sonnet":"global:gpt-6.1-sol","claude-3-7-sonnet":"global:gpt-6-astra","gemini-flash":"global:gemini-3.8-flash","kling-v3-std":"kling-video-v3","kling-v3-pro":"kling-video-v3",keling:"kling-video-v3",hailuo:"minimax-video-h3"};var ue={checkinHours:[9,21],travelHours:[9,21],tasksHours:[11],schoolHours:[12],catHours:[1],keepaliveHours:[22],activityReportCount:5,checkinEnabled:!0,travelEnabled:!0,tasksEnabled:!0,schoolEnabled:!0,catEnabled:!0,keepaliveEnabled:!0},da={enabled:!1,allowedIPs:[],allowLocalhost:!0},ut={enabled:!1,webhooks:[],events:["ban","401","cooling","low_credit"],minCredit:50},Ht={authDir:"",gatewayPort:7863,apiKey:"",webPassword:"",allowRegister:!1,portalAsHome:!1,maxInFlightCN:3,maxInFlightGlobal:2,queueTimeoutMs:6e4,streamIdleTimeoutMs:9e4,deviceTokenPath:"",autoCheckin:!0,autoTravel:!0,autoTasks:!0,autoRefreshToken:!0,autoFreeEnabled:!0,promptMode:"none",promptText:"",proxy:"",enabledModels:[],aliases:{...ce},modelRoutes:{},freeModels:["global:hy4free","cn:hy4free","global:hy3","cn:hy3","global:deepseek-v4.1-flash-sg","cn:deepseek-v4.1-flash"],schedule:{...ue},ipWhitelist:{...da},alerts:{...ut}};function Be(o,e){if(!Array.isArray(o)||o.length===0)return[...e];let t=o.map(s=>Number(s)).filter(s=>Number.isInteger(s)&&s>=0&&s<=23);return t.length>0?[...new Set(t)].sort((s,a)=>s-a):[...e]}function dt(o){let e=o&&typeof o=="object"?o:{},t=e.schedule&&typeof e.schedule=="object"?e.schedule:{},s=e.ipWhitelist&&typeof e.ipWhitelist=="object"?e.ipWhitelist:{},a=e.alerts&&typeof e.alerts=="object"?e.alerts:{};return{...Ht,...e,aliases:{...ce,...e.aliases&&typeof e.aliases=="object"?e.aliases:{}},modelRoutes:e.modelRoutes&&typeof e.modelRoutes=="object"?{...e.modelRoutes}:{},enabledModels:Array.isArray(e.enabledModels)?[...e.enabledModels]:[],freeModels:Array.isArray(e.freeModels)&&e.freeModels.length>0?[...e.freeModels]:[...Ht.freeModels],schedule:{...ue,...t,checkinHours:Be(t.checkinHours,ue.checkinHours),travelHours:Be(t.travelHours,ue.travelHours),tasksHours:Be(t.tasksHours,ue.tasksHours),schoolHours:Be(t.schoolHours,ue.schoolHours),catHours:Be(t.catHours,ue.catHours),keepaliveHours:Be(t.keepaliveHours,ue.keepaliveHours),activityReportCount:Math.max(1,Number(t.activityReportCount??ue.activityReportCount)||5)},ipWhitelist:{...da,...s,allowedIPs:Array.isArray(s.allowedIPs)?[...s.allowedIPs]:[],allowLocalhost:s.allowLocalhost!==void 0?!!s.allowLocalhost:!0},alerts:{...ut,...a,webhooks:Array.isArray(a.webhooks)?a.webhooks.filter(Boolean):[],events:Array.isArray(a.events)&&a.events.length>0?[...a.events]:[...ut.events],minCredit:Math.max(0,Number(a.minCredit??ut.minCredit)||0)}}}var pt=class{constructor(e={},t={}){let s=typeof t=="string"?t:t?.dshHome;this.dshHome=s||process.env.DSH_HOME||$t.default.join(ca.default.homedir(),".dsh"),this.configPath=$t.default.join(this.dshHome,".workbuddy2api-config.json");let a=e&&typeof e=="object"?e:{};this.data=dt(a),this.load(a)}load(e={}){try{if(Pe.default.existsSync(this.configPath)){let t=JSON.parse(Pe.default.readFileSync(this.configPath,"utf8"));this.data=dt({...e,...t})}}catch(t){console.warn("[config-store] \u8BFB\u53D6\u6301\u4E45\u5316\u914D\u7F6E\u5F02\u5E38:",t.message)}return this.data}get(e){return this.data[e]}getAll(){return dt(this.data)}update(e={}){let t={...this.data};for(let[s,a]of Object.entries(e))a!==void 0&&(s==="aliases"&&a&&typeof a=="object"?t.aliases={...a}:s==="modelRoutes"&&a&&typeof a=="object"?t.modelRoutes={...a}:s==="schedule"&&a&&typeof a=="object"?t.schedule={...t.schedule,...a}:s==="ipWhitelist"&&a&&typeof a=="object"?t.ipWhitelist={...t.ipWhitelist,...a}:s==="alerts"&&a&&typeof a=="object"?t.alerts={...t.alerts,...a}:s==="enabledModels"&&Array.isArray(a)?t.enabledModels=[...a]:s==="freeModels"&&Array.isArray(a)?t.freeModels=[...a]:s in Ht&&(t[s]=a));return this.data=dt(t),this.save(),this.getAll()}save(){try{Pe.default.existsSync(this.dshHome)||Pe.default.mkdirSync(this.dshHome,{recursive:!0}),Pe.default.writeFileSync(this.configPath,JSON.stringify(this.data,null,2),{mode:384})}catch(e){console.warn("[config-store] \u4FDD\u5B58\u914D\u7F6E\u5931\u8D25:",e.message)}}};var Q=O(require("node:fs"),1),oe=O(require("node:path"),1),Wt=O(require("node:os"),1);function ye(o){if(!o||typeof o!="string")return null;let e=o.split(".");if(e.length<2)return null;try{let t=e[1].replace(/-/g,"+").replace(/_/g,"/"),s=t.length%4===0?"":"=".repeat(4-t.length%4),a=Buffer.from(t+s,"base64").toString("utf8");return JSON.parse(a)}catch{return null}}var mt=class{constructor(e={}){this.dshHome=e.dshHome||process.env.DSH_HOME||oe.default.join(Wt.default.homedir(),".dsh"),this.storePath=oe.default.join(this.dshHome,".workbuddy2api-accounts.json"),this.authDir=e.authDir||"",this.skipDiscovery=!!e.skipDiscovery,this.accounts=new Map,this.activeUid=null,this._authWatchTimer=null,this._lastAuthFingerprint="",this._fileSignatures=new Map,this.init()}init(){try{if(Q.default.existsSync(this.storePath)){let e=JSON.parse(Q.default.readFileSync(this.storePath,"utf8"));if(Array.isArray(e.accounts))for(let t of e.accounts)t.account?.uid&&(t.disabled=!!t.disabled,t.disabledReason=t.disabledReason||"",t.manualDisabled=!!t.manualDisabled,t.manualDisabledReason=t.manualDisabledReason||"",this.accounts.set(t.account.uid,t));e.activeUid&&(this.activeUid=e.activeUid)}}catch(e){console.warn("[account-store] \u8BFB\u53D6\u4E3B\u5B58\u50A8\u5F02\u5E38:",e.message)}if(!this.skipDiscovery){let e=[this.authDir,oe.default.join(this.dshHome,"workbuddy2api-auths"),"c:\\Work\\workbody\\workbuddy2api\\auths",oe.default.join(process.cwd(),"auths")].filter(Boolean);for(let t of[...new Set(e)])this.importFromAuthDir(t);this.importFromCodeBuddyCli()}if((!this.activeUid||!this.accounts.has(this.activeUid))&&this.accounts.size>0){let e=this.getAll().find(t=>!this.isAccountUnavailable(t));this.activeUid=e?.account?.uid||this.accounts.keys().next().value}this.save()}importFromAuthDir(e,t={}){if(!e||!Q.default.existsSync(e))return{added:0,updated:0};let s=0,a=0,n=!!t.updateExisting;try{let r=Q.default.readdirSync(e).filter(l=>l.endsWith(".json"));for(let l of r)try{let c=oe.default.join(e,l),i=Q.default.statSync(c),d=`${i.mtimeMs}|${i.size}`;if(n&&this._fileSignatures.get(c)===d)continue;let m=JSON.parse(Q.default.readFileSync(c,"utf8")),h=m.account?.uid||m.uid;if(!h)continue;let g=m.auth?.realm||m.realm||(l.includes("cn")?"cn":"global"),x=m.auth?.accessToken||m.accessToken||"",b=m.auth?.refreshToken||m.refreshToken||"",w=m.auth?.expiresAt||m.expiresAt||0,T=m.auth?.domain||m.domain||"";if(this.accounts.has(h)){if(n){let A=this.accounts.get(h),P=!!(x&&x!==A.auth?.accessToken),$=!!(b&&b!==A.auth?.refreshToken);(P||$)&&(A.auth={...A.auth||{},realm:g||A.auth?.realm||"cn",accessToken:x||A.auth?.accessToken||"",refreshToken:b||A.auth?.refreshToken||"",expiresAt:w||A.auth?.expiresAt||0,domain:T||A.auth?.domain||""},P&&(A.disabled=!1,A.disabledReason="",A.sessionDeadStreak=0),A.updatedAt=Date.now(),a++)}}else{let A={account:{uid:h,nickname:m.account?.nickname||m.nickname||`Account-${h.slice(0,8)}`,enterpriseId:m.account?.enterpriseId||m.enterpriseId||"",provider:m.account?.provider||m.provider||""},auth:{realm:g,accessToken:x,refreshToken:b,expiresAt:w,domain:T},disabled:!!m.disabled,disabledReason:m.disabledReason||"",manualDisabled:!!m.manualDisabled,manualDisabledReason:m.manualDisabledReason||"",source:"workbuddy2api-auths",updatedAt:Date.now()};this.accounts.set(h,A),s++}this._fileSignatures.set(c,d)}catch{}}catch(r){console.warn("[account-store] \u5BFC\u5165 auths \u76EE\u5F55\u5F02\u5E38:",r.message)}return{added:s,updated:a}}importFromCodeBuddyCli(){let e=process.env.LOCALAPPDATA||oe.default.join(Wt.default.homedir(),"AppData","Local"),t=oe.default.join(e,"CodeBuddyExtension","Data","Public","auth");if(Q.default.existsSync(t))try{let s=Q.default.readdirSync(t).filter(a=>a.endsWith(".info"));for(let a of s)try{let n=Q.default.readFileSync(oe.default.join(t,a),"utf8"),r=JSON.parse(n),l=r.uid||r.account?.uid,c=r.token||r.accessToken||r.access_token;l&&c&&!this.accounts.has(l)&&this.accounts.set(l,{account:{uid:l,nickname:r.nickname||r.userName||"CodeBuddy-CLI",enterpriseId:r.enterpriseId||""},auth:{realm:r.realm||"cn",accessToken:c,refreshToken:r.refreshToken||r.refresh_token||"",expiresAt:Date.now()+36e5*2,domain:r.domain||""},disabled:!1,disabledReason:"",source:"codebuddy-cli",updatedAt:Date.now()})}catch{}}catch{}}save(){try{Q.default.existsSync(this.dshHome)||Q.default.mkdirSync(this.dshHome,{recursive:!0});let e={activeUid:this.activeUid,accounts:Array.from(this.accounts.values())};Q.default.writeFileSync(this.storePath,JSON.stringify(e,null,2),{mode:384})}catch(e){console.warn("[account-store] \u4FDD\u5B58\u8D26\u53F7\u5B58\u50A8\u5931\u8D25:",e.message)}}getAll(){return Array.from(this.accounts.values())}get(e){return this.accounts.get(e)}getActive(){return this.activeUid&&this.accounts.has(this.activeUid)?this.accounts.get(this.activeUid):this.accounts.values().next().value||null}setActive(e){return this.accounts.has(e)?(this.activeUid=e,this.save(),!0):!1}isAccountUnavailable(e){return!!(e?.disabled||e?.manualDisabled)}setDisabled(e,t,s=""){let a=this.accounts.get(e);return a?(a.disabled=!!t,a.disabledReason=t?s||"\u7CFB\u7EDF\u505C\u7528":"",a.manualDisabled=!!t,a.manualDisabledReason=t?s||"\u624B\u52A8\u505C\u7528":"",a.updatedAt=Date.now(),this.save(),!0):!1}setAutoDisabled(e,t,s=""){let a=this.accounts.get(e);return a?(a.disabled=!!t,a.disabledReason=t?s||"\u81EA\u52A8\u7194\u65AD\u7981\u7528":"",a.updatedAt=Date.now(),this.save(),!0):!1}setManualDisabled(e,t,s="manual"){let a=this.accounts.get(e);if(!a)return!1;let n=!!a.manualDisabled;return a.manualDisabled=!!t,a.manualDisabledReason=t?s||"manual":"",a.updatedAt=Date.now(),this.save(),{found:!0,changed:n!==a.manualDisabled,acc:a}}reviveAccount(e){let t=this.accounts.get(e);if(!t)return!1;let s=!!(t.disabled||t.disabledReason);return t.disabled=!1,t.disabledReason="",t.sessionDeadStreak=0,t.updatedAt=Date.now(),this.save(),{found:!0,changed:s,acc:t}}updateAccountToken(e,t,s="",a=7200){let n=this.accounts.get(e);return n?(t&&(n.auth.accessToken=String(t).trim()),s&&(n.auth.refreshToken=String(s).trim()),n.auth.expiresAt=Date.now()+Math.max(300,Number(a||7200))*1e3,n.disabled=!1,n.disabledReason="",n.manualDisabled=!1,n.manualDisabledReason="",n.sessionDeadStreak=0,n.updatedAt=Date.now(),this.save(),n):null}upsert(e){let t=e.account?.uid;if(!t)throw new Error("Account must have a valid uid");let s=this.accounts.get(t),a={...s,...e,account:{...s?.account||{},...e.account},auth:{...s?.auth||{},...e.auth},disabled:e.disabled!==void 0?!!e.disabled:!!s?.disabled,disabledReason:e.disabledReason??s?.disabledReason??"",manualDisabled:e.manualDisabled!==void 0?!!e.manualDisabled:!!s?.manualDisabled,manualDisabledReason:e.manualDisabledReason??s?.manualDisabledReason??"",updatedAt:Date.now()};return this.accounts.set(t,a),this.activeUid||(this.activeUid=t),this.save(),a}delete(e){let t=this.accounts.delete(e);return this.activeUid===e&&(this.activeUid=this.accounts.keys().next().value||null),this.save(),t}getAuthWatchDirs(){return[...new Set([this.authDir,oe.default.join(this.dshHome,"workbuddy2api-auths")].filter(Boolean))]}_computeAuthDirsFingerprint(e=this.getAuthWatchDirs()){let t=[];for(let s of e)if(!(!s||!Q.default.existsSync(s)))try{let a=Q.default.readdirSync(s).filter(n=>n.endsWith(".json")).sort();for(let n of a)try{let r=Q.default.statSync(oe.default.join(s,n));t.push(`${s}|${n}|${r.mtimeMs}|${r.size}`)}catch{}}catch{}return t.join(";")}scanAuthDirsOnce(e=this.getAuthWatchDirs()){let t=this._computeAuthDirsFingerprint(e);if(t===this._lastAuthFingerprint)return{changed:!1,added:0,updated:0};this._lastAuthFingerprint=t;let s=0,a=0;for(let n of e){let r=this.importFromAuthDir(n,{updateExisting:!0});s+=r.added,a+=r.updated}if(s>0||a>0){if((!this.activeUid||!this.accounts.has(this.activeUid))&&this.accounts.size>0){let n=this.getAll().find(r=>!this.isAccountUnavailable(r));this.activeUid=n?.account?.uid||this.accounts.keys().next().value}return this.save(),console.log(`[account-store] auths \u76EE\u5F55\u70ED\u91CD\u8F7D\u5B8C\u6210: \u65B0\u589E ${s}, \u66F4\u65B0 ${a}`),{changed:!0,added:s,updated:a}}return{changed:!1,added:0,updated:0}}startAuthDirWatch(e=5e3,t=null){if(this._authWatchTimer)return;let s=t&&Array.isArray(t)?t:this.getAuthWatchDirs();this._lastAuthFingerprint=this._computeAuthDirsFingerprint(s),this._authWatchTimer=setInterval(()=>{try{this.scanAuthDirsOnce(s)}catch(a){console.warn("[account-store] auths \u76EE\u5F55\u70ED\u91CD\u8F7D\u8F6E\u8BE2\u5F02\u5E38:",a.message)}},Math.max(50,Number(e)||5e3)),this._authWatchTimer.unref&&this._authWatchTimer.unref()}stopAuthDirWatch(){this._authWatchTimer&&(clearInterval(this._authWatchTimer),this._authWatchTimer=null)}};var Ue=O(require("node:fs"),1),ls=O(require("node:path"),1);function xe(o){return o.auth?.realm==="global"?q:Y}function Oe(o){let e=xe(o),t={Accept:"application/json, text/plain, */*","Content-Type":"application/json",Origin:e,Referer:`${e}/`,"X-Requested-With":"XMLHttpRequest","User-Agent":"WorkBuddy/1.2.34 WorkBuddy/1.2.34 CLI/1.2.34"};return o.auth?.accessToken&&(t.Authorization=`Bearer ${o.auth.accessToken}`),o.account?.uid&&(t["X-User-Id"]=o.account.uid),o.account?.enterpriseId&&(t["X-Enterprise-Id"]=o.account.enterpriseId),t}async function Ye(o,e=fetch){if(o.auth?.realm==="global")return null;let s=`${xe(o)}${Js}`;try{let a=await e(s,{method:"GET",headers:Oe(o)}),n=await a.json().catch(()=>({}));if(!a.ok||n.code!==0&&n.code!==200)return null;let r=n.data?.buddy;return!r||typeof r!="object"||!r.id?null:{id:r.id,name:r.name||"\u795E\u79D8\u5C0F\u732B"}}catch{return null}}async function jt(o,e=fetch){let s=`${xe(o)}${Ys}`,a=await e(s,{method:"POST",headers:Oe(o),body:JSON.stringify({agree:!0})}),n=await a.json().catch(()=>({}));return a.ok&&(n.code===0||n.code===200)}async function Le(o,e=fetch){let s=`${xe(o)}${Xs}`;try{let a=await e(s,{method:"POST",headers:Oe(o),body:JSON.stringify({})}),n=await a.json().catch(()=>({})),r=(n.msg||"").toLowerCase();return a.ok&&(n.code===0||n.code===200)?{ok:!0,credit:300,message:"\u9886\u517B\u7B2C\u4E00\u53EA\u5C0F\u732B\u6210\u529F\uFF0C\u83B7\u5F97 +300 \u79EF\u5206\uFF01"}:a.status===400&&r.includes("first_buddy task not completed yet")?{ok:!1,incomplete:!0,message:"\u9886\u517B\u524D\u7F6E\u95E8\u69DB\u672A\u8FBE\u6210(\u9700\u5148\u5B8C\u6210\u5BF9\u8BDD\u6D3B\u8DC3\u4E0A\u62A5)"}:{ok:!1,incomplete:!1,message:n.msg||`\u9886\u517B\u8BF7\u6C42\u5931\u8D25 (HTTP ${a.status})`}}catch(a){return{ok:!1,incomplete:!1,message:a.message}}}async function ht(o,e=fetch){if(o.auth?.realm==="global")return{isGlobal:!0,state:"unsupported",message:"\u56FD\u9645\u7248\u8D26\u53F7\u65E0\u732B\u732B\u65C5\u884C\u4F53\u7CFB"};let s=`${xe(o)}${qs}`;try{let a=await e(s,{method:"GET",headers:Oe(o)}),n=await a.json().catch(()=>({}));if(!a.ok||n.code!==0&&n.code!==200)throw new Error(n.msg||`\u67E5\u8BE2\u65C5\u884C\u72B6\u6001\u5931\u8D25 (HTTP ${a.status})`);let r=n.data||{};return{state:r.state||"idle",dailyLimitReached:!!r.daily_limit_reached,recordId:r.record_id||0,rewardCredit:r.reward_credit||0}}catch(a){return{state:"error",error:a.message}}}async function ft(o,e=4,t=fetch){let a=`${xe(o)}${Ks}`,n=await t(a,{method:"POST",headers:Oe(o),body:JSON.stringify({location_id:e})}),r=await n.json().catch(()=>({}));return n.ok&&(r.code===0||r.code===200)?{ok:!0,locationId:e,message:`\u6210\u529F\u6D3E\u51FA\u732B\u732B\u524D\u5F80\u5730\u70B9 ${e}\uFF01`}:{ok:!1,message:r.msg||`\u6D3E\u51FA\u5931\u8D25 (HTTP ${n.status})`}}async function Ft(o,e,t=fetch){let a=`${xe(o)}${Vs}`,n=await t(a,{method:"POST",headers:Oe(o),body:JSON.stringify({record_id:e})}),r=await n.json().catch(()=>({}));if(n.ok&&(r.code===0||r.code===200)){let l=r.data?.reward_credit||0;return{ok:!0,rewardCredit:l,message:`\u9886\u53D6\u65C5\u884C\u5956\u52B1\u6210\u529F\uFF0C\u83B7\u5F97 +${l} \u79EF\u5206\uFF01`}}return{ok:!1,message:r.msg||`\u9886\u53D6\u65C5\u884C\u5956\u52B1\u5931\u8D25 (HTTP ${n.status})`}}async function De(o,e=fetch){if(o.auth?.realm==="global")return{status:"skipped",reason:"global_account_no_travel"};let t=await Ye(o,e);if(!t){await jt(o,e);let n=await Le(o,e);if(!n.ok)return{status:"adopt_failed",detail:n.message};t=await Ye(o,e)}let s=await ht(o,e);if(s.state==="error")return{status:"status_error",detail:s.error};let a={buddy:t,initialStatus:s,actions:[]};if(s.state==="arrived"){let n=await Ft(o,s.recordId,e);a.actions.push({action:"claim",...n});let r=await ht(o,e);if(r.state==="idle"&&!r.dailyLimitReached){let l=await ft(o,4,e);a.actions.push({action:"depart",...l})}}else if(s.state==="idle")if(s.dailyLimitReached)a.actions.push({action:"skip",message:"\u4ECA\u65E5\u6D3E\u51FA\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650 (00:00 CST \u91CD\u7F6E)"});else{let n=await ft(o,4,e);a.actions.push({action:"depart",...n})}else s.state==="traveling"&&a.actions.push({action:"skip",message:`\u732B\u732B\u6B63\u5728\u65C5\u884C\u4E2D (\u8BB0\u5F55ID: ${s.recordId})\uFF0C\u7B49\u5F85\u5230\u7AD9`});return{status:"ok",results:a}}var Kt=O(require("node:crypto"),1);async function _e(o,e=fetch){if(!o||!o.auth?.accessToken)return{ok:!1,status:"NO_TOKEN",message:"\u8D26\u53F7\u672A\u767B\u5F55\u6216\u65E0\u6709\u6548\u4EE4\u724C"};let t=o.auth?.realm==="global",s=t?q:J,n=`${s}${t?ct:zs}`;try{let r=await e(n,{method:"POST",headers:{Authorization:`Bearer ${o.auth.accessToken}`,"Content-Type":"application/json",Accept:"application/json","X-User-Id":o.account?.uid||"","X-CodeBuddy-Request":"1",Origin:s,Referer:`${s}/`,"User-Agent":"WorkBuddy/5.5.4"},body:JSON.stringify({})}),l=await r.json().catch(()=>({})),c=l.msg||l.message||"",i=c.toLowerCase();return r.ok&&(l.code===0||l.code===200)?{ok:!0,status:"SUCCESS",message:t?"\u8BD5\u7528\u989D\u5EA6\u9886\u53D6\u6210\u529F (+Trial)":"\u7B7E\u5230\u6210\u529F"}:i.includes("\u5DF2\u7B7E\u5230")||i.includes("already")||l.code===10001||l.code===14001||l.code===14051?{ok:!0,status:"ALREADY",message:t?"\u8BD5\u7528\u52A0\u901F\u5305\u6B64\u524D\u5DF2\u9886\u53D6\u8FC7":"\u4ECA\u65E5\u5DF2\u5B8C\u6210\u7B7E\u5230"}:{ok:!1,status:"FAIL",message:c||`\u4E0A\u6E38\u8FD4\u56DE\u9519\u8BEF (HTTP ${r.status}, code: ${l.code})`}}catch(r){return{ok:!1,status:"ERROR",message:`\u7F51\u7EDC\u5F02\u5E38: ${r.message}`}}}var ha=O(require("node:crypto"),1);var Te="https://www.workbuddy.cn",Eo="WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1",zt="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",Mo="https://www.workbuddy.cn/space/d/o0KWYeynteVv06UnAZqIFm",qt={create_canvas:{kind:"canvas",target:1,title:"\u521B\u5EFA\u753B\u677F"},template_5:{kind:"template",target:5,title:"\u4F7F\u7528 5 \u4E2A\u6A21\u677F"},expert_5:{kind:"expert",target:5,title:"\u53EC\u5524 5 \u6B21\u4E13\u5BB6"},Expert_team_use_3:{kind:"team",target:3,title:"\u53EC\u5524 3 \u6B21\u4E13\u5BB6\u56E2"},skill_1:{kind:"skill",target:1,title:"\u5C1D\u9C9C\u70ED\u95E8\u6280\u80FD"},automation_1:{kind:"automation",target:1,title:"\u8BBE\u7F6E\u81EA\u52A8\u5316\u4EFB\u52A1"},playbook_prompt:{kind:"playbook",target:1,title:"\u63A2\u7D22\u4F18\u79C0\u7075\u611F"},Expert_lighthouse:{kind:"lighthouse",target:1,title:"\u4F53\u9A8C\u300C\u817E\u8BAF\u8F7B\u91CF\u4E91\u300D\u4E13\u5BB6"},Buddy_App:{kind:"buddy5",target:1,title:"\u4F53\u9A8C WorkBuddy \u300C\u53D1\u73B0\u5E94\u7528\u300D"},Buddy_App_QQ:{kind:"buddy5",target:1,title:"\u4F53\u9A8C\u4F01\u9E45\u6559\u5E08\u52A9\u624B"},Hp_Appearance:{kind:"skin",target:1,title:"\u66F4\u6362\u5916\u89C2\u76AE\u80A4"},chat_5:{kind:"chat",target:5,title:"\u548C AI \u804A\u5929 5 \u6B21"},Model_chat_GLM5_2:{kind:"glmchat",target:1,title:"\u4F53\u9A8C GLM-5.2 \u5BF9\u8BDD"},"Model_chat_GLM5.2":{kind:"glmchat",target:1,title:"\u4F53\u9A8C GLM-5.2 \u5BF9\u8BDD"},black_cat:{kind:"cat",target:3,nightOnly:!0,title:"\u591C\u732B\u5B50\u4EFB\u52A1 (23:00-08:00 CST)"},first_buddy:{kind:"buddyfirst",target:1,title:"\u9886\u517B\u7B2C\u4E00\u53EA AI \u5BA0\u7269"},RichMeow_Chat:{kind:"richmeow",target:1,title:"\u684C\u9762\u7AEF\u5BF9\u8BDD 1 \u6B21"},Library_read:{kind:"library",target:1,title:"\u4F53\u9A8C\u300C\u8D44\u6599\u5E93\u300D"},skill_share:{kind:"skillshare",target:1,title:"\u5206\u4EAB\u70ED\u95E8\u6280\u80FD\u7ED9\u597D\u53CB"},Sequential_Tasks_1:{kind:"minichat",target:1,title:"\u5C0F\u7A0B\u5E8F\u8F7B\u91CF\u5BF9\u8BDD 1 \u6B21"},school_season:{kind:"schoolseason",target:1,title:"\u5F00\u5B66\u5B63\u4E3B\u9898\u6D3B\u52A8\u4EFB\u52A1"},expert_use_maidehao:{kind:"fixed_expert",target:1,expertId:"ex_GDl31WahyIH0",title:"\u4F53\u9A8C\u300C\u4E2D\u56FD\u7535\u5546\u8FD0\u8425\u4E13\u5BB6\u300D"},expert_use_douyinyin:{kind:"fixed_expert",target:1,expertId:"ex_FbY5nlWTqDod",title:"\u4F53\u9A8C\u300C\u6296\u97F3\u7B56\u7565\u5E08\u300D"},expert_use_shangjia_xuanchuan:{kind:"fixed_expert",target:1,expertId:"ex_Weo3x2EZuSDm",title:"\u4F53\u9A8C\u300C\u5546\u5BB6\u5BA3\u4F20\u9875\u4E0E\u6D77\u62A5\u8BBE\u8BA1\u5E08\u300D"},expert_use_bowangwang:{kind:"fixed_expert",target:1,expertId:"ex_WZY136wV5aMt",title:"\u4F53\u9A8C\u300C\u76F4\u64AD\u7535\u5546\u6559\u7EC3\u300D"},WorkBuddy_Valorant:{kind:"fixed_expert",target:1,expertId:"ex_xQHHD1u5Jkua",title:"\u4F53\u9A8C\u300C\u65E0\u754F\u5951\u7EA6\u62FC\u8C46\u4E13\u5BB6\u300D"},wb_wechat_oa_subscribe_task:{unforgeable:!0,reason:"\u9700\u5173\u6CE8\u5FAE\u4FE1\u516C\u4F17\u53F7\u5916\u90E8\u56DE\u8C03"},Expert_Philanthropy:{unforgeable:!0,reason:"\u9700\u771F\u5B9E\u6350\u6B3E"}},ua=[{id:"0",name:"\u5E7B\u706F\u7247"},{id:"2",name:"\u89C6\u9891\u751F\u6210"},{id:"4",name:"\u6DF1\u5EA6\u7814\u7A76"},{id:"6",name:"\u6587\u6863\u5904\u7406"},{id:"8",name:"\u6570\u636E\u5206\u6790"}],pa=[{id:"ContentCreator",name:"\u5185\u5BB9\u521B\u4F5C\u4E13\u5BB6"},{id:"UiDesigner",name:"UI\u8BBE\u8BA1\u5E08"},{id:"DataAnalyticsReporter",name:"\u6570\u636E\u5206\u6790\u62A5\u544A\u5E08"},{id:"ChinaEcommerceOperationsExpert",name:"\u4E2D\u56FD\u7535\u5546\u8FD0\u8425\u4E13\u5BB6"},{id:"DouyinStrategist",name:"\u6296\u97F3\u7B56\u7565\u5E08"}],ma=[{id:"CloudOpsTeam",name:"\u4E91\u8FD0\u7EF4\u56E2\u961F"},{id:"SoftwareCompany",name:"\u8F6F\u4EF6\u5F00\u53D1\u56E2\u961F"},{id:"TradingAgentTeam",name:"\u91CF\u5316\u4EA4\u6613\u56E2\u961F"}];function gt(o,e){return ha.default.createHash("md5").update(`${e}:${o}`).digest("hex").slice(0,36)}function Ro(o){let e=o.account?.uid||"",t=o.account?.nickname||"",s=Date.now();return{timezone:"Asia/Shanghai",reportDelay:2e3,userId:e,username:t,userNickname:t,product:"SaaS",releaseDate:1789036585355,commit:"5f9692923c93033111c51ad7b003eb80204a9b75",ideName:"WorkBuddy",ideType:"WorkBuddy",ideVersion:"5.5.6",machineId:gt(e,"machine"),sessionId:gt(e,"session"),extName:"workbuddy-desktop",extVersion:"5.5.6",os:"win32",arch:"x64",osVersion:"10.0.26220",cpuCores:20,memorySize:24,timestamp:s,presentAt:s}}async function Ze(o,e=fetch){if(o.auth?.realm==="global")return[];let s=`${Y}/v2/activity/growth/tasks`;try{let a=await e(s,{method:"GET",headers:{Authorization:`Bearer ${o.auth.accessToken}`,"X-User-Id":o.account?.uid||"",Accept:"application/json, text/plain, */*","User-Agent":"WorkBuddy/1.2.34"}}),n=await a.json().catch(()=>({}));return a.ok&&(n.code===0||n.code===200)?n.data?.tasks||[]:[]}catch{return[]}}async function Bo(o,e,t=fetch){if(o.auth?.realm==="global"||!e.length)return!0;let a=`${Y}/v2/activity/growth/tasks/accept`;try{return(await t(a,{method:"POST",headers:{Authorization:`Bearer ${o.auth.accessToken}`,"X-User-Id":o.account?.uid||"","Content-Type":"application/json","User-Agent":"WorkBuddy/1.2.34"},body:JSON.stringify({task_codes:e})})).ok}catch{return!1}}async function fa(o,e,t=fetch){let s=o.account?.uid||"",a=o.auth?.accessToken||"";try{let n=`${Y}/activity/growth/tasks/${e}/claim`,r=await t(n,{method:"POST",headers:{Authorization:`Bearer ${a}`,"X-User-Id":s,Accept:"application/json, text/plain, */*","User-Agent":"WorkBuddy/1.2.34"}}),l=await r.json().catch(()=>({}));if(r.ok&&(l.code===0||l.code===200)){let c=l.data||{};return{ok:!0,already:!!c.already_claimed,credit:c.credit||0,energy:c.energy||0,message:c.already_claimed?"\u5956\u52B1\u5DF2\u5728\u8D26":`\u9886\u53D6\u6210\u529F (+${c.credit||0} \u79EF\u5206)`}}if(r.status===400){let c=`${Te}/activity/growth/tasks/${e}/claim`,i=await t(c,{method:"POST",headers:{Authorization:`Bearer ${a}`,Accept:"application/json, text/plain, */*","Content-Type":"application/json",Origin:Te,Referer:`${Te}/profile/growth-center`,"x-client-platform":"web","User-Agent":zt,"X-User-Id":s,"X-Domain":Te}}),d=await i.json().catch(()=>({}));if(i.ok&&(d.code===0||d.code===200)){let m=d.data||{};return{ok:!0,already:!!m.already_claimed,credit:m.credit||0,energy:m.energy||0,message:m.already_claimed?"\u5956\u52B1\u5DF2\u5728\u8D26":`Web\u7AEF\u964D\u7EA7\u9886\u53D6\u6210\u529F (+${m.credit||0} \u79EF\u5206)`}}}return{ok:!1,message:l.msg||`\u9886\u53D6\u5931\u8D25 (HTTP ${r.status})`}}catch(n){return{ok:!1,message:n.message}}}function Po(o){let e=o.account?.uid||"",t=Date.now(),s=`wb-desk-${t}`,a=`${s}-req`,n=`${s}-msg`,r="deepseek-v4-flash";return[{eventCode:"agent_task_created",source:"LOCAL",name:"working",task_target:"local",mode:"craft",requestModelId:r,requestModelName:"DeepSeek V4 Flash",conversationId:s,messageId:n,userId:e},{eventCode:"chat_message_send",messageId:`${n}-assistant`,historyCount:0,traceId:a,rootRequestId:a,parentConversationId:s,agentName:"cli",agentType:"main",userId:e},{eventCode:"chat_request_send",inputLength:24,traceId:a,rootRequestId:a,parentConversationId:s,agentName:"cli",agentType:"main",userId:e},{eventCode:"chat_message_response",messageId:`${n}-assistant`,responseModelId:r,inputToken:120,outputToken:80,totalToken:200,isSuccessful:!0,finishReason:"stop",firstTokenAt:t,traceId:a,conversationId:s,rootRequestId:a,parentConversationId:s,agentName:"cli",agentType:"main",userId:e},{eventCode:"chat_message_status",messageId:`${n}-assistant`,messageErrorCode:"0",traceId:a,rootRequestId:a,parentConversationId:s,agentName:"cli",agentType:"main",userId:e},{eventCode:"chat_request_response",mode:"craft",toolCallCount:0,inputToken:120,outputToken:80,totalToken:200,isSuccessful:!0,finishReason:"stop",rootRequestId:a,parentConversationId:s,userId:e}]}function Oo(o){let e=o.account?.uid||"",t="cb_y5Dy46tPQGGWtueMxXbe",s="\u4F01\u9E45\u6559\u5E08\u52A9\u624B";return[{eventCode:"buddyapp_discover_click",mode:"LOCAL",buddyId:t,buddyName:s,userId:e},{eventCode:"buddyapp_show",mode:"LOCAL",buddyId:t,buddyName:s,position:2,elementId:t,elementName:s,userId:e},{eventCode:"buddyapp_enter_click",mode:"LOCAL",buddyId:t,buddyName:s,position:2,elementId:t,elementName:s,isFirstPage:!0,userId:e},{eventCode:"buddyapp_auth_confirm_click",mode:"LOCAL",buddyId:t,buddyName:s,elementId:t,elementName:s,userId:e},{eventCode:"buddyapp_bindaccount_skip_click",mode:"LOCAL",buddyId:t,buddyName:s,elementId:t,elementName:s,userId:e}]}async function Gt(o,e,t=fetch){let s=Ro(o),a=e.map(c=>({...c,...s})),n=Y,r=`${n}${le}`;return(await t(r,{method:"POST",headers:{Authorization:`Bearer ${o.auth.accessToken}`,Accept:"application/json, text/plain, */*","Content-Type":"application/json;charset=UTF-8","User-Agent":Eo,"X-Domain":n,"X-Product":"SaaS","X-Request-ID":`${gt(o.account.uid,"req")}${Date.now()%1e5}`,"X-User-Id":o.account?.uid||""},body:JSON.stringify(a)})).ok}async function Lo(o,e,t,s,a,n=fetch){let r=Date.now(),l=o.account?.uid||"",c={eventCode:e,timestamp:r,reportDelay:0,pageURL:t,elementId:s,elementName:a,os:"Win32",userAgent:zt,machineId:gt(l,"webmachine"),userId:l,userNickname:o.account?.nickname||""};return(await n(`${Te}${le}`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","x-client-platform":"web",Origin:Te,Referer:t,"User-Agent":zt,"X-User-Id":l,"X-Domain":Te},body:JSON.stringify([c])})).ok}async function ga(o,e,t,s,a=fetch){let n=o.account?.uid||"",r=J,l=`${r}${le}`,c=async i=>(await a(l,{method:"POST",headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json",Origin:r,Referer:`${r}/`,"User-Agent":"WorkBuddy/1.2.34",Authorization:`Bearer ${o.auth.accessToken}`,"X-User-Id":n},body:JSON.stringify(i)})).ok;switch(t.kind){case"canvas":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"wbx_design_canvas_task_create",timestamp:i+h*200,reportDelay:0,conversationId:`wbx-conv-${i}-${h}`,requestId:`wbx-req-${i}-${h}`,source:"summon_keyword",isCustomModel:!1,name:"",inputLength:12,id:`wbx-canvas-${i}-${h}`,cost:0,isSuccessful:!0,userId:n}));return c(d)}case"template":{let i=Date.now(),d=Array.from({length:s},(m,h)=>{let g=ua[h%ua.length];return{eventCode:"agent_task_created_with_template",timestamp:i+h*200,reportDelay:0,isCustomModel:!0,id:g.id,name:g.name,requestId:`wb-tmpl-${i}-${h}`,conversationId:`wb-tmpl-conv-${i}-${h}`,userId:n}});return c(d)}case"expert":{let i=Date.now(),d=Array.from({length:s},(m,h)=>{let g=pa[h%pa.length];return{eventCode:"expert_actual_use",timestamp:i+h*200,reportDelay:0,mode:"CLOUD",id:g.id,name:g.name,expertTitle:g.name,expertType:"agent",source:"builtin",cost:0,characterCount:12,conversationId:`wb-exp-conv-${i}-${h}`,requestId:`wb-exp-req-${i}-${h}`,messageId:`wb-exp-msg-${i}-${h}`,requestModelId:"deepseek-v4-flash",requestModelName:"DeepSeek V4 Flash",userId:n}});return c(d)}case"team":{let i=Date.now(),d=Array.from({length:s},(m,h)=>{let g=ma[h%ma.length];return{eventCode:"expert_actual_use",timestamp:i+h*200,reportDelay:0,mode:"CLOUD",id:g.id,name:g.name,expertTitle:g.name,expertType:"team",source:"builtin",cost:0,characterCount:12,conversationId:`wb-team-conv-${i}-${h}`,requestId:`wb-team-req-${i}-${h}`,messageId:`wb-team-msg-${i}-${h}`,requestModelId:"deepseek-v4-flash",requestModelName:"DeepSeek V4 Flash",userId:n}});return c(d)}case"fixed_expert":{let i=Date.now(),d=t.expertId||"ex_GDl31WahyIH0",m=Array.from({length:s},(h,g)=>({eventCode:"expert_actual_use",timestamp:i+g*200,reportDelay:0,mode:"CLOUD",id:d,name:t.title||"\u6D3B\u52A8\u4E13\u5BB6",expertTitle:t.title||"\u6D3B\u52A8\u4E13\u5BB6",expertType:"agent",source:"builtin",cost:0,characterCount:12,conversationId:`wb-fexp-conv-${i}-${g}`,requestId:`wb-fexp-req-${i}-${g}`,messageId:`wb-fexp-msg-${i}-${g}`,requestModelId:"deepseek-v4-flash",requestModelName:"DeepSeek V4 Flash",userId:n}));return c(m)}case"lighthouse":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"expert_actual_use",timestamp:i+h*200,reportDelay:0,mode:"CLOUD",id:"ex_2cvvUZQhDyeJ",name:"\u817E\u8BAF\u8F7B\u91CF\u4E91\u4E13\u5BB6",expertTitle:"\u817E\u8BAF\u8F7B\u91CF\u4E91\u4E13\u5BB6",type:"02-Engineering",expertType:"agent",version:"1.0.2",source:"builtin",cost:0,characterCount:12,conversationId:`wb-lh-conv-${i}-${h}`,requestId:`wb-lh-req-${i}-${h}`,messageId:`wb-lh-msg-${i}-${h}`,requestModelId:"deepseek-v4-flash",requestModelName:"DeepSeek V4 Flash",userId:n}));return c(d)}case"skill":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"skill_info",timestamp:i+h*200,reportDelay:0,skillId:"skill_2096525080079265792",skillName:"pptx",action:"use",conversationId:`wb-skill-conv-${i}-${h}`,requestId:`wb-skill-req-${i}-${h}`,userId:n}));return c(d)}case"automation":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"automated_task_create_suc",timestamp:i+h*200,reportDelay:0,name:"\u6BCF\u5468\u4E94\u81EA\u52A8\u751F\u6210\u5468\u62A5",source:"manually",modelId:"deepseek-v4-flash",conversationId:`wb-auto-conv-${i}-${h}`,requestId:`wb-auto-req-${i}-${h}`,schedule:{type:"recurring",rrule:"FREQ=WEEKLY;BYDAY=FR;BYHOUR=9;BYMINUTE=0"},prompt:"\u6BCF\u5468\u4E94\u81EA\u52A8\u6574\u7406\u672C\u5468\u5DE5\u4F5C\uFF0C\u751F\u6210\u4E00\u4EFD\u5468\u62A5\u3002",userId:n}));return c(d)}case"playbook":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"playbook_prompt_send",timestamp:i+h*200,reportDelay:0,id:"worker-ledger-freedom-dashboard",name:"\u6253\u5DE5\u4EBA\u5C0F\u8D26\u672C",promptLength:20,isOfficial:1,source:"discover",conversationId:`wb-pb-conv-${i}-${h}`,requestId:`wb-pb-req-${i}-${h}`,userId:n}));return c(d)}case"skin":{let i=Date.now(),d=Array.from({length:s},(m,h)=>({eventCode:"appearance_skin_apply",timestamp:i+h*200,reportDelay:0,action:"apply",source:"settings_close",id:"theme-tkmw7j",name:"\u548C\u5E73\u7CBE\u82F1\u6FC0\u6218\u91D1\u79CB",vipLevel:"free",series:"craft",userId:n}));return c(d)}case"chat":case"glmchat":case"cat":{let i=Date.now(),d=t.kind==="glmchat"||t.kind==="cat",m=Array.from({length:s},(h,g)=>({eventCode:"chat_request_send",timestamp:i+g*200,reportDelay:0,mode:t.kind==="cat"?"night":"craft",conversationId:`wb-chat-conv-${i}-${g}`,requestId:`wb-chat-req-${i}-${g}`,inputLength:12,requestModelId:d?"glm-5.2":"deepseek-v4-flash",requestModelName:d?"GLM-5.2":"DeepSeek V4 Flash",agentName:"default",agentType:"conversation",userId:n}));return c(m)}case"richmeow":{let i=Po(o);return Gt(o,i,a)}case"buddy5":{let i=Oo(o);return Gt(o,i,a)}case"buddyfirst":return!!(await Le(o,a))?.ok;case"skillshare":{let i=Date.now(),d="skill_2096525080079265792",m="pptx",h=[{eventCode:"skill_share_entry_click",skillId:d,skillName:m,skillType:"market",skillSource:"official",entry:"detail",status:"safe",actionSuccessful:!0,clickAt:i,userId:n},{eventCode:"skill_share_channel_action",skillId:d,skillName:m,skillType:"market",action:"wechat",panelAction:"click",panelType:"mini_program_card",isSuccessful:!0,cost:0,id:`share-${i}`,actionAt:i,userId:n},{eventCode:"skill_share_channel_action",skillId:d,skillName:m,skillType:"market",action:"wechat",panelAction:"success",panelType:"mini_program_card",isSuccessful:!0,cost:12,id:`share-${i}`,actionAt:i,userId:n},{eventCode:"skill_share_channel_action",skillId:d,skillName:m,skillType:"market",action:"link",panelAction:"success",panelType:"clipboard",isSuccessful:!0,cost:12,id:`share-${i}-link`,actionAt:i,userId:n}];return Gt(o,h,a)}case"minichat":case"schoolseason":{let i=Date.now(),d=`wb-mp-${i}`,m={eventCode:"chat_request_send",timestamp:i,reportDelay:0,source:"mini_program",ideName:"wx_app_cloud",ideType:"WorkBuddy_MP",extName:"workbuddy-mp",extVersion:"2.4.0",mode:"chat",conversationId:d,requestId:d,inputLength:12,mentionContexts:[],mentionContextCount:0,userId:n};return t.kind==="schoolseason"&&(m.activityId="school_open_day_2026"),c([m])}case"library":return Lo(o,"web_element_click",Mo,"library_doc_intro_click","\u8D44\u6599\u5E93\u4ECB\u7ECD\u70B9\u51FB",a);default:return!1}}function Ne(o=new Date){let e=new Date(o.getTime()+288e5).getUTCHours();return e>=23||e<8}async function ba(o,e=fetch){if(o?.auth?.realm==="global")return{ok:!0,skipped:!0};if(!Ne())return{ok:!0,skipped:!0,reason:"outside_cst_night_window_23_08"};let t=qt.black_cat,s=await ga(o,"black_cat",t,t.target||3,e);await new Promise(n=>setTimeout(n,1200));let a=await fa(o,"black_cat",e);return{ok:s||a.ok,...a}}async function Ae(o,e=fetch){if(o.auth?.realm==="global")return{ok:!0,reason:"global_account_skipped"};let t=[],s=0,a=0,n=await Ze(o,e);if(!n.length)return{ok:!1,message:"\u672A\u83B7\u53D6\u5230\u6210\u957F\u4EFB\u52A1\u5217\u8868"};let r=n.filter(c=>c.accept_status==="not_accepted").map(c=>c.task_code);r.length>0&&(await Bo(o,r,e),t.push({step:"accept_tasks",count:r.length,codes:r}),n=await Ze(o,e));for(let c of n){let i=c.task_code,d=qt[i];if(!d||d.unforgeable)continue;let m=c.progress?.current||0,h=c.progress?.target||d.target||1;if(c.accept_status!=="claimed"&&c.accept_status!=="completed"&&m<h){let g=h-m;try{let x=await ga(o,i,d,g,e);t.push({step:`lightup_${i}`,title:d.title||i,count:g,ok:x})}catch(x){t.push({step:`lightup_${i}`,title:d.title||i,ok:!1,error:x.message})}}}await new Promise(c=>setTimeout(c,1500));let l=await Ze(o,e);for(let c of l){let i=c.task_code,d=qt[i]||{},m=c.progress?.current||0,h=c.progress?.target||d.target||1;if(c.accept_status==="completed"||m>=h&&c.accept_status!=="claimed"){let g=await fa(o,i,e);g.ok&&(s+=g.credit||0,a+=g.energy||0,t.push({step:`claim_${i}`,title:c.title||d.title||i,credit:g.credit,message:g.message}))}}return{ok:!0,totalTasks:n.length,creditGained:s,energyGained:a,logs:t,summary:`\u6210\u957F\u4EFB\u52A1\u5168\u81EA\u52A8\u6536\u5272\u5B8C\u6210\uFF01\u672C\u6B21\u65B0\u5165\u8D26 +${s} \u79EF\u5206\uFF0C+${a} \u80FD\u91CF`}}function et(o){return o.auth?.realm==="global"?q:Y}function Vt(o){return o.auth?.realm==="global"?q:J}function pe(o,e){let t={Accept:"application/json, text/plain, */*","Content-Type":"application/json",Origin:o,Referer:`${o}/`,"X-Requested-With":"XMLHttpRequest","User-Agent":"WorkBuddy/1.2.34 WorkBuddy/1.2.34 CLI/1.2.34"};return e.auth?.accessToken&&(t.Authorization=`Bearer ${e.auth.accessToken}`),e.account?.uid&&(t["X-User-Id"]=e.account.uid),e.account?.enterpriseId&&(t["X-Enterprise-Id"]=e.account.enterpriseId),t}function Do(o=new Date){let t=new Date(o.getTime()+288e5);return t.setUTCDate(t.getUTCDate()-1),t.toISOString().slice(0,10)}async function bt(o,e=5,t=fetch){if(o.auth?.realm==="global")return{ok:!0,status:"skipped_global"};let s=o.account?.uid;if(!s)return{ok:!1,message:"\u8D26\u53F7\u7F3A\u5931 UID"};let a=Vt(o),n=`${a}${le}`,r=Date.now(),l=`wb2api-conv-${r}`,c=[];for(let i=0;i<e;i++){let d=r+i*200;c.push({eventCode:"chat_request_send",timestamp:d,reportDelay:0,mode:"craft",conversationId:l,requestId:`${l}-${i}`,inputLength:16,requestModelId:"deepseek-v4-flash",requestModelName:"DeepSeek V4 Flash",isPlan:!1,isAutoExecuteTerminal:!1,isAutoModify:!1,codebaseEnable:!1,maxToken:0,maxSteps:0,temperature:0,maxRetries:0,mentionContexts:[],knowledgeId:[],knowledgeName:[],codebaseId:"",mentionContextCount:0,command:"",expertId:"",recommendId:"",skillId:"",skillCount:0,totalCount:0,fileUri:"",presentAt:d,traceId:"",rootRequestId:l,parentConversationId:l,agentName:"default",agentType:"conversation",userId:s})}try{let i=await t(n,{method:"POST",headers:pe(a,o),body:JSON.stringify(c)}),d=await i.json().catch(()=>({}));return i.ok&&(d.code===0||d.code===200)?{ok:!0,burst:e,message:`\u6210\u529F\u4E0A\u62A5 ${e} \u6761\u5BF9\u8BDD\u6D3B\u8DC3\u4E8B\u4EF6 (\u70B9\u4EAE\u6D3B\u8DC3\u4E0E\u9886\u517B\u95E8\u69DB)`}:{ok:!1,message:d.msg||`\u4E0A\u62A5\u5931\u8D25 (HTTP ${i.status})`}}catch(i){return{ok:!1,message:`\u4E0A\u62A5\u5F02\u5E38: ${i.message}`}}}async function Jt(o,e=fetch){if(o.auth?.realm==="global")return{ok:!0,status:"skipped_global"};let t=Vt(o),s=`${t}${oa}`;try{let a=await e(s,{method:"POST",headers:pe(t,o),body:JSON.stringify({})}),n=await a.json().catch(()=>({}));if(a.ok&&(n.code===0||n.code===200)){let r=n.data?.credit||0;return{ok:!0,credit:r,message:`\u65B0\u624B\u793C\u5305\u9886\u53D6\u6210\u529F\uFF0C\u83B7\u5F97 +${r} \u79EF\u5206\uFF01`}}return{ok:!1,message:n.msg||"\u65B0\u624B\u793C\u5305\u5DF2\u9886\u6216\u65E0\u53EF\u9886"}}catch(a){return{ok:!1,message:a.message}}}async function Xt(o,e=fetch){if(o.auth?.realm==="global")return{ok:!0,status:"skipped_global"};let t=Vt(o),s=`${t}${na}`;try{let a=await e(s,{method:"POST",headers:pe(t,o),body:JSON.stringify({})}),n=await a.json().catch(()=>({}));if(a.ok&&(n.code===0||n.code===200)){let r=n.data?.credit||0;return{ok:!0,credit:r,message:`\u6D3B\u52A8\u8865\u507F\u9886\u53D6\u6210\u529F\uFF0C\u83B7\u5F97 +${r} \u79EF\u5206\uFF01`}}return{ok:!1,message:n.msg||"\u6D3B\u52A8\u8865\u507F\u5DF2\u9886\u6216\u5F53\u524D\u65E0\u8865\u507F"}}catch(a){return{ok:!1,message:a.message}}}async function yt(o,e=fetch){let t=et(o),s=`${t}${Zs}`;try{let a=await e(s,{method:"GET",headers:pe(t,o)}),n=await a.json().catch(()=>({}));if(!a.ok||n.code!==0&&n.code!==200)return{days:0,redemptionStatus:null,makeupCards:{balance:0,max:0}};let r=n.data||{};return{days:r.streak?.days||0,redemptionStatus:r.redemption_status||null,makeupCards:r.makeup_cards||{balance:0,max:0}}}catch{return{days:0,redemptionStatus:null,makeupCards:{balance:0,max:0}}}}async function Yt(o,e,t=fetch){let s=et(o),a=`${s}${Qs}`,n=`redeem-${e}-${Kt.default.randomUUID()}`;try{let r=await t(a,{method:"POST",headers:pe(s,o),body:JSON.stringify({tier:e,client_token:n})}),l=await r.json().catch(()=>({}));if(r.ok&&(l.code===0||l.code===200)){let c=l.data||{};return{ok:!0,tier:e,creditGranted:c.credit_granted||0,energyGranted:c.energy_granted||0,cardsGranted:c.cards_granted||0,chancesGranted:c.chances_granted||0,message:`\u6210\u529F\u5151\u6362 ${e} \u91CC\u7A0B\u7891\u5956\u52B1\uFF1A+${c.credit_granted||0} \u79EF\u5206\uFF0C\u9001 ${c.chances_granted||0} \u6B21\u62BD\u5956\uFF01`}}return{ok:!1,tier:e,message:l.msg||`\u5151\u6362 ${e} \u5931\u8D25`}}catch(r){return{ok:!1,tier:e,message:r.message}}}async function Qe(o,e=fetch){let t=et(o),s=`${t}${ea}`;try{let a=await e(s,{method:"GET",headers:pe(t,o)}),n=await a.json().catch(()=>({}));return a.ok&&(n.code===0||n.code===200)&&n.data?.balance||0}catch{return 0}}async function Zt(o,e=fetch){let t=et(o),s=`${t}${ta}`,a=`draw-${Kt.default.randomUUID()}`;try{let n=await e(s,{method:"POST",headers:pe(t,o),body:JSON.stringify({client_token:a})}),r=await n.json().catch(()=>({}));if(n.ok&&(r.code===0||r.code===200)){let l=r.data||{};return{ok:!0,prizeName:l.prize_name||"\u7CBE\u7F8E\u5956\u54C1",prizeType:l.prize_type||"credit",creditAmount:l.credit_amount||0,message:`\u62BD\u4E2D [${l.prize_name||"\u5956\u52B1"}] (+${l.credit_amount||0} \u79EF\u5206)`}}return{ok:!1,message:r.msg||"\u62BD\u5956\u672A\u4E2D\u6216\u6B21\u6570\u5DF2\u8017\u5C3D"}}catch(n){return{ok:!1,message:n.message}}}async function Qt(o,e=fetch){if(o.auth?.realm==="global")return{ok:!1,reason:"skipped_global"};try{if(((await yt(o,e)).makeupCards?.balance||0)<=0)return{ok:!1,reason:"no_cards"};let s=et(o),r=(await(await e(`${s}${sa}`,{method:"GET",headers:pe(s,o)})).json().catch(()=>({}))).data?.cells||[],l=Do(),c=r.find(i=>i.date&&i.date.startsWith(l));if(c&&c.score===0){let i=await e(`${s}${aa}`,{method:"POST",headers:pe(s,o),body:JSON.stringify({target_date:l})}),d=await i.json().catch(()=>({}));if(i.ok&&(d.code===0||d.code===200))return{ok:!0,patchedDate:l,message:`\u6210\u529F\u4F7F\u7528\u8865\u7B7E\u5361\u62EF\u6551\u6628\u65E5 (${l}) \u8FDE\u767B\uFF01`}}return{ok:!1,reason:"no_missed_day"}}catch(t){return{ok:!1,error:t.message}}}async function $e(o,e=fetch){let t=[],s=0,a=await _e(o,e);if(t.push({step:"checkin",...a}),o.auth?.realm==="global")return{realm:"global",totalCreditsGained:s,log:t,summary:a.message||"\u56FD\u9645\u7248\u8BD5\u7528\u798F\u5229\u5904\u7406\u5B8C\u6BD5"};let n=await bt(o,5,e);t.push({step:"report_active",...n});let r=await Jt(o,e);r.ok&&r.credit&&(s+=r.credit),t.push({step:"claim_gift",...r});let l=await Xt(o,e);l.ok&&l.credit&&(s+=l.credit),t.push({step:"claim_compensation",...l});let c=await De(o,e);if(c.results?.actions)for(let x of c.results.actions)x.action==="claim"&&x.rewardCredit&&(s+=x.rewardCredit);t.push({step:"cat_travel",...c});let i=await yt(o,e);t.push({step:"streak_info",streakDays:i.days,makeupCards:i.makeupCards?.balance||0});let d=i.redemptionStatus;if(d){let x=["7d","14d","28d"];for(let b of x){let w=`tier_${b}_status`;if(d[w]==="available"){let T=await Yt(o,b,e);T.ok&&T.creditGranted&&(s+=T.creditGranted),t.push({step:`redeem_${b}`,...T})}}}let m=await Qe(o,e),h=0;for(;m>0&&h<10;){h++;let x=await Zt(o,e);x.ok&&x.creditAmount&&(s+=x.creditAmount),t.push({step:`draw_lottery_${h}`,...x}),m=await Qe(o,e)}let g=await Qt(o,e);g.ok&&t.push({step:"makeup_card",...g});try{let x=await Ae(o,e);x.ok&&x.creditGained&&(s+=x.creditGained),t.push({step:"growth_tasks",...x})}catch(x){t.push({step:"growth_tasks",ok:!1,error:x.message})}return{realm:"cn",totalCreditsGained:s,log:t,summary:`\u798F\u5229\u4E0E\u6210\u957F\u4EFB\u52A1\u5168\u5957\u62C9\u6EE1\uFF01\u7D2F\u8BA1\u5230\u8D26 +${s} \u79EF\u5206`}}var ss=O(require("node:crypto"),1);var He=`${J}/portal/activity/school`,No=`${J}/portal/activity/freshman`,$o=`${J}/portal/activity/teacher`,es="school_open_day_2026",Ho="Mozilla/5.0 (Linux; Android 14; MicroMessenger/8.0.49 WeChat/0.8.0 MiniProgramEnv/android; wkbrowser xweb)",Uo="WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1",Wo={school_credit_6:{label:"6\u79EF\u5206",type:"credit"},school_credit_66:{label:"66\u79EF\u5206",type:"credit"},school_voucher_luckin:{label:"\u745E\u5E78\u5496\u556115\u5143\u5238",type:"voucher"},school_voucher_kfc_ok:{label:"\u80AF\u5FB7\u57FAOK\u9910\u5238",type:"voucher"},school_voucher_kfc_ice:{label:"\u80AF\u5FB7\u57FA\u51B0\u6DC7\u6DCB\u5238",type:"voucher"},school_voucher_kugou:{label:"\u9177\u72D7\u4F1A\u5458\u6708\u5361\u5238",type:"voucher"}};function ts(o,e){return ss.default.createHash("md5").update(`${e}:${o||""}`).digest("hex").slice(0,36)}function jo(o,e={}){return{Authorization:`Bearer ${o}`,Accept:"application/json","Content-Type":"application/json","User-Agent":Ho,...e}}async function te(o,e,t="GET",s=null,a=fetch,n={}){let r=await a(o,{method:t,headers:jo(e,n),...s!==null?{body:JSON.stringify(s)}:{},signal:AbortSignal.timeout(15e3)}),l=await r.json().catch(()=>({}));return{status:r.status,ok:r.ok&&l?.code===0,data:l}}async function kt(o,e=fetch){if(!o||o.auth?.realm==="global")return{ok:!0,skipped:!0,reason:"global_account_skipped",inPeriod:!1,tasks:[]};let t=o.auth?.accessToken||"";if(!t)return{ok:!1,error:"\u8D26\u53F7\u7F3A\u5C11\u6709\u6548 accessToken"};try{let s=await te(`${He}/tasks`,t,"GET",null,e);if(!s.ok)return{ok:!1,status:s.status,error:s.data?.message||s.data?.msg||`HTTP ${s.status}`};let a=s.data?.data||{},n=await te(`${He}/config`,t,"GET",null,e).catch(()=>null),r=await te(`${No}/profile`,t,"GET",null,e).catch(()=>null),l=await te(`${$o}/profile`,t,"GET",null,e).catch(()=>null);return{ok:!0,inPeriod:!!a.in_period,tasks:a.tasks||[],chance:n?.ok?n.data?.data?.chance||{}:{},freshman:r?.ok?r.data?.data:null,teacher:l?.ok?l.data?.data:null}}catch(s){return{ok:!1,error:s.message}}}async function Fo(o,e=fetch){try{let s=(await te(`${J}/v2/operation-platform/market/expert/list`,o,"POST",{edition_mode:"all,domestic",page:1,page_size:20,sort_by:"use_count",sort_order:"desc",categories:["16-BackToSchool"],expert_type:"agent"},e)).data?.data?.experts||[];for(let a of s)if(a?.expert_id){let n=typeof a.display_name_zh=="object"?a.display_name_zh?.zh:a.display_name_zh;return{id:a.expert_id,name:n||a.expert_id}}}catch{}return{id:"ex_jB0dyFIQJEWa",name:"\u8BBA\u5C0F\u821F"}}function Go(o){let e=o.account?.uid||"",t=o.account?.nickname||"",s=Date.now(),a=`wbdesk-${s}`,n={timezone:"Asia/Shanghai",reportDelay:2e3,userId:e,username:t,userNickname:t,product:"SaaS",releaseDate:1789036585355,commit:"5f9692923c93033111c51ad7b003eb80204a9b75",ideName:"WorkBuddy",ideType:"WorkBuddy",ideVersion:"5.5.6",machineId:ts(e,"machine"),sessionId:ts(e,"session"),extName:"workbuddy-desktop",extVersion:"5.5.6",os:"win32",arch:"x64",osVersion:"10.0.26220",cpuCores:20,memorySize:24,timestamp:s,presentAt:s,activityId:es};return[{eventCode:"agent_task_created",source:"LOCAL",name:"working",task_target:"local",mode:"craft",conversationId:a,messageId:a,...n},{eventCode:"chat_message_send",messageId:`${a}-assistant`,traceId:a,rootRequestId:a,parentConversationId:a,agentName:"cli",agentType:"main",...n},{eventCode:"chat_request_send",inputLength:24,traceId:a,rootRequestId:a,parentConversationId:a,agentName:"cli",agentType:"main",...n},{eventCode:"chat_message_response",messageId:`${a}-assistant`,responseModelId:"fast-model",inputToken:120,outputToken:80,totalToken:200,isSuccessful:!0,finishReason:"stop",firstTokenAt:s,traceId:a,conversationId:a,rootRequestId:a,parentConversationId:a,...n},{eventCode:"chat_message_status",messageId:`${a}-assistant`,messageErrorCode:"0",traceId:a,rootRequestId:a,parentConversationId:a,...n},{eventCode:"chat_request_response",mode:"craft",toolCallCount:0,inputToken:120,outputToken:80,totalToken:200,isSuccessful:!0,finishReason:"stop",rootRequestId:a,parentConversationId:a,...n}]}async function wt(o,e={}){let t=e.fetchFn||fetch;if(!o||o.auth?.realm==="global")return{ok:!0,skipped:!0,reason:"global_account_skipped",prizes:[],creditGained:0};let s=o.account?.uid||"",a=o.auth?.accessToken||"";if(!a)return{ok:!1,error:"\u8D26\u53F7\u7F3A\u5C11\u6709\u6548 token"};let n=await kt(o,t);if(!n.ok)return n;if(!n.inPeriod)return{ok:!0,inPeriod:!1,skipped:!0,message:"\u5F00\u5B66\u5B63\u6D3B\u52A8\u5F53\u524D\u672A\u5728\u5468\u671F\u5185 (in_period=false)",prizes:[],creditGained:0};let r=[];for(let h of n.tasks){let g=h.task_code,x=String(h.status||"").toLowerCase();if(!g||x==="claimed"||g==="task_student_verify")continue;if(x==="pending"&&await te(`${He}/tasks/${g}/viewed`,a,"POST",{},t).catch(()=>{}),x!=="completed"){if(g==="share_invite")await te(`${He}/tasks/share-complete`,a,"POST",{channel:"wechat"},t).catch(()=>{}),r.push({code:g,action:"share-complete"});else if(g==="chat_3_times"){let w=Math.max(1,(h.target_count||3)-(h.progress||0));for(let T=0;T<w;T++){let A=`wbmp-${Date.now()}-${T}`;await te(`${J}${le}`,a,"POST",[{eventCode:"chat_request_send",timestamp:Date.now(),reportDelay:0,source:"mini_program",ideName:"wx_app_cloud",ideType:"WorkBuddy_MP",extName:"workbuddy-mp",extVersion:"SaaS",mode:"chat",conversationId:A,requestId:A,inputLength:12,activityId:es,userId:s}],t).catch(()=>{})}r.push({code:g,action:"mini_chat",count:w})}else if(g==="desktop_chat_1_time")await te(`${Y}${le}`,a,"POST",Go(o),t,{"X-Product":"SaaS","User-Agent":Uo}).catch(()=>{}),r.push({code:g,action:"desktop_seq"});else if(g==="expert_use"){let w=await Fo(a,t),T=`wbexp-${Date.now()}`;await te(`${J}${le}`,a,"POST",[{eventCode:"expert_actual_use",timestamp:Date.now(),reportDelay:0,source:"mini_program",ideName:"wx_app_cloud",ideType:"WorkBuddy_MP",extName:"workbuddy-mp",extVersion:"SaaS",machineId:ts(s,"machine"),userId:s,userNickname:o.account?.nickname||"",id:w.id,name:w.id,expertTitle:w.name,type:"send_message",characterCount:12,expertType:"agent",conversationId:T,activityId:es}],t).catch(()=>{}),r.push({code:g,action:"expert_use",expert:w.name})}}(await te(`${He}/tasks/${g}/claim`,a,"POST",{},t).catch(()=>null))?.ok&&r.push({code:g,action:"claim",ok:!0})}let l=[],c=0,d=(await kt(o,t)).chance?.balance||0,m=0;for(;d>0&&m<20;){m++;let h=await te(`${He}/wheel/draw`,a,"POST",{draw_uuid:ss.default.randomUUID()},t).catch(()=>null);if(!h||h.data?.code===40900||!h.ok)break;let g=h.data?.data||{},x=g.prize_code||"?",b=Number(g.credit_amount||0);c+=b;let w=Wo[x];l.push({prizeCode:x,credit:b,label:w?w.label:x}),d=Number(g.chance_balance??d-1)}return{ok:!0,inPeriod:!0,logs:r,prizes:l,creditGained:c,summary:`\u5F00\u5B66\u5B63\u6267\u884C\u5B8C\u6BD5: \u5B8C\u6210\u52A8\u4F5C ${r.length} \u9879, \u8F6C\u76D8\u62BD\u5956 ${l.length} \u6B21 (+${c} \u79EF\u5206)`}}var ya="no healthy account available in pool; check /status or retry later";function as(o,e){return o.includes(`"code":${e}`)||o.includes(`"code": ${e}`)||o.includes(`"code":"${e}"`)||o.includes(`"code": "${e}"`)||o.includes(`"code":'${e}'`)}function zo(o=""){let e=String(o).toLowerCase();return as(e,"11133")||e.includes("model_param_invalid")||e.includes("invalid request parameters")||e.includes("request parameters do not meet the current model requirements")}function os(o=""){let e=String(o).toLowerCase();return as(e,"11135")||e.includes("invalid_image_data")||e.includes("replace the image")}function ka(o=""){let e=String(o).toLowerCase();return as(e,"11102")||e.includes("model_not_found")||e.includes("model not found")||e.includes("does not exist")||e.includes("unsupported model")}function wa(o={}){let e=Array.isArray(o?.messages)?o.messages:[];for(let t of e)if(!(!t||!Array.isArray(t.content))){for(let s of t.content)if(s?.type==="image_url"||s?.type==="image"||s?.type==="input_image")return!0}return!1}function ns(o,e="",t={}){if(zo(e))return t.hasImage&&t.modelInCatalog&&!t.modelSupportsImages?`model ${t.model||""} does not support images; pick one with supports_images=true from /v1/models`:"request parameters were rejected by the model provider; check message format and model capabilities";if(os(e))return"image data rejected by upstream; use a real/valid image, may need a new conversation";switch(o){case C.PROMPT_TOO_LONG:return"request context exceeds the model's limit; reduce history/message size";case C.IMAGE_INVALID:return"image request was rejected by upstream; check image_url format and image data";case C.WAF_BLOCK:return"upstream WAF blocked the gateway; retry after the block window";case C.SOFT_RATE:return"rate limited by upstream; retry after reset";case C.ACCOUNT_FAULT:return"account-level fault at upstream (auth/quota state); the gateway will rotate or disable this account";case C.SESSION_DEAD:return"account session expired at upstream; the account is disabled until re-login";case C.HARD_CREDIT:return"account credits exhausted at upstream; waiting for daily check-in to restore";case C.MODEL_BLOCKED:return"upstream has no such model on this backend; switch model or retry on another account";case C.CONTENT_BLOCKED:return"request content was rejected by content policy; adjust the prompt and retry";default:return""}}function va(o,e={},t=null){if(!o||typeof o!="object"||!o.error||o.error.gateway_hint)return null;let s=JSON.stringify(o),a=C.NONE;typeof t=="function"&&(a=t(400,s));let n=o.error.message||s,r=ns(a,n,e);return r?{...o,error:{...o.error,gateway_hint:r}}:null}function xa(o){if(!o||typeof o!="object")return 0;let e=o.reset_at??o.resetAt??o.next_reset_at??o.nextResetAt;if(e==null||e==="")return 0;if(typeof e=="number"&&Number.isFinite(e))return e<1e11?Math.floor(e*1e3):Math.floor(e);let t=String(e).trim();if(/^\d+$/.test(t)){let a=Number(t);return a<1e11?a*1e3:a}let s=Date.parse(t);return Number.isNaN(s)?0:s}function rs(o=Date.now()){let t=new Date(o+288e5);return t.setUTCHours(24,0,0,0),t.getTime()-288e5}var qo=900*1e3,Ko=300*1e3,Vo=60*1e3,Jo=7200*1e3,Xo=60*1e3,Yo=2,Zo=6*3600*1e3,Qo=24*3600*1e3,_a=5,is=300*1e3;function ke(o=""){return String(o).replace(/^(cn|global|solo|trae):/i,"")}function en(){let o=new Date(Date.now()+288e5);return{date:o.toISOString().slice(0,10),hour:o.getUTCHours(),slot:`${o.toISOString().slice(0,10)}-${o.getUTCHours()}`}}var cs=class{constructor(e=Xo,t=Yo){this.windowMs=e,this.threshold=t,this.hits=new Map,this.until=0}active(e=Date.now()){return e<this.until}noteWaf(e,t=Date.now()){if(this.active(t))return!0;e&&this.hits.set(e,t);for(let[s,a]of this.hits.entries())t-a>this.windowMs&&this.hits.delete(s);return this.hits.size>=this.threshold?(this.until=t+this.windowMs,this.hits.clear(),console.warn(`[waf-ip] 60s \u5185 ${this.threshold}+ \u4E0D\u540C\u8D26\u53F7\u547D\u4E2D 403\uFF0C\u542F\u7528 IP \u7EA7\u6B62\u635F\u81F3 ${new Date(this.until).toISOString()}`),!0):!1}},ds=class{constructor(){this.until=0}active(e=Date.now()){return e<this.until}trigger(e=Date.now()){return this.active(e)||(this.until=rs(e)),this.until}},vt=class{constructor(e,t={}){this.store=e,this.client=t.client||null,this.configStore=t.configStore||null,this.alertManager=t.alertManager||null,this.maxInFlightCN=t.maxInFlightCN||3,this.maxInFlightGlobal=t.maxInFlightGlobal||2,this.queueTimeoutMs=t.queueTimeoutMs??5e3,this.circuitBreakers=new Map,this.modelBreakers=new Map,this.routeModelBreakers=new Map,this.inFlight=new Map,this.inFlightRequests=new Map,this.accountCredits=new Map,this.stickyMap=new Map,this.accountStats=new Map,this.consecutiveFails=new Map,this.waiters=[],this.wafIPGate=new cs,this.degradeGate=new ds,this._executedScheduleSlots=new Set;let s=t.dshHome||e?.dshHome||"";this.statePath=t.statePath===!1?"":t.statePath||(s?ls.default.join(s,".workbuddy2api-state.json"):""),this._stateSaveTimer=null,this._loadState(),this.autoTimer=null,this.scheduleTimer=null,this.keepaliveTimer=null}_loadState(){if(this.statePath)try{if(!Ue.default.existsSync(this.statePath))return;let e=JSON.parse(Ue.default.readFileSync(this.statePath,"utf8")),t=Date.now();if(e.degradeUntil&&e.degradeUntil>t&&(this.degradeGate.until=Number(e.degradeUntil)),e.circuitBreakers&&typeof e.circuitBreakers=="object")for(let[s,a]of Object.entries(e.circuitBreakers))a&&a.cooldownUntil>t&&this.circuitBreakers.set(s,a);if(e.modelBreakers&&typeof e.modelBreakers=="object")for(let[s,a]of Object.entries(e.modelBreakers))a&&a.cooldownUntil>t&&this.modelBreakers.set(s,a);if(e.accountCredits&&typeof e.accountCredits=="object")for(let[s,a]of Object.entries(e.accountCredits))a&&typeof a=="object"&&this.accountCredits.set(s,a)}catch(e){console.warn("[scheduler] \u8BFB\u53D6\u6301\u4E45\u5316\u8FD0\u884C\u72B6\u6001\u5F02\u5E38:",e.message)}}flushState(){if(this._stateSaveTimer&&(clearTimeout(this._stateSaveTimer),this._stateSaveTimer=null),!!this.statePath)try{let e=Date.now(),t={};for(let[l,c]of this.circuitBreakers.entries())c&&c.cooldownUntil>e&&(t[l]=c);let s={};for(let[l,c]of this.modelBreakers.entries())c&&c.cooldownUntil>e&&(s[l]=c);let a={};for(let[l,c]of this.accountCredits.entries())a[l]=c;let n={savedAt:e,degradeUntil:this.degradeGate.active(e)?this.degradeGate.until:0,circuitBreakers:t,modelBreakers:s,accountCredits:a};Ue.default.mkdirSync(ls.default.dirname(this.statePath),{recursive:!0});let r=`${this.statePath}.tmp`;Ue.default.writeFileSync(r,JSON.stringify(n,null,2),"utf8"),Ue.default.renameSync(r,this.statePath)}catch(e){console.warn("[scheduler] \u4FDD\u5B58\u6301\u4E45\u5316\u8FD0\u884C\u72B6\u6001\u5F02\u5E38:",e.message)}}_scheduleSaveState(){this.statePath&&(this._stateSaveTimer||(this._stateSaveTimer=setTimeout(()=>{this._stateSaveTimer=null,this.flushState()},200),this._stateSaveTimer.unref&&this._stateSaveTimer.unref()))}updateAccountCredits(e,t=0,s=0){e&&(this.accountCredits.set(e,{remain:Number(t||0),expiringRemain:Number(s||0),updatedAt:Date.now()}),this._scheduleSaveState())}beginInFlight(e,t){e&&this.inFlightRequests.set(e,{id:e,...t,startedAt:Date.now()})}endInFlight(e){e&&this.inFlightRequests.delete(e)}getInFlightRequests(){let e=Date.now();return[...this.inFlightRequests.values()].map(t=>({...t,elapsedMs:e-(t.startedAt||e)}))}_getLimits(){let e=this.configStore?this.configStore.getAll():null;return{maxInFlightCN:e?.maxInFlightCN||this.maxInFlightCN,maxInFlightGlobal:e?.maxInFlightGlobal||this.maxInFlightGlobal,queueTimeoutMs:e?.queueTimeoutMs??this.queueTimeoutMs}}getLimitForAccount(e){let{maxInFlightCN:t,maxInFlightGlobal:s}=this._getLimits();return e?.auth?.realm==="global"?s:t}getInFlight(e){return this.inFlight.get(e)||0}isCoolingDown(e,t=""){let s=Date.now(),a=this.circuitBreakers.get(e);if(a&&s<a.cooldownUntil)return!0;if(t){let n=ke(t),r=this.modelBreakers.get(`${e}::${n}`);if(r&&s<r.cooldownUntil)return!0}return!1}isAccountUnavailable(e){return e?typeof this.store?.isAccountUnavailable=="function"?this.store.isAccountUnavailable(e):!!(e.disabled||e.manualDisabled):!0}tripRouteModel(e,t=6e4){e&&this.routeModelBreakers.set(String(e),Date.now()+t)}isRouteModelCooling(e){if(!e)return!1;let t=this.routeModelBreakers.get(String(e))||0;return Date.now()<t?!0:(t>0&&this.routeModelBreakers.delete(String(e)),!1)}acquire(e){if(this.isAccountUnavailable(e))return!1;let t=e.account?.uid;if(!t)return!1;let s=this.inFlight.get(t)||0,a=this.getLimitForAccount(e);return s>=a?!1:(this.inFlight.set(t,s+1),!0)}release(e){if(!e)return;let t=e.account?.uid;if(!t)return;let s=this.inFlight.get(t)||0;s<=1?this.inFlight.delete(t):this.inFlight.set(t,s-1),this._notifyWaiters()}_notifyWaiters(){if(this.waiters.length===0)return;let e=this.waiters.splice(0,this.waiters.length);for(let t of e)clearTimeout(t.timer),t.resolve(!0)}acquireWithQueue(e,t=5e3){let s=e();for(let n of s)if(this.acquire(n))return Promise.resolve(n);if(!t||t<=0)return Promise.resolve(null);let a=Date.now()+t;return new Promise(n=>{let r=()=>{let l=e();for(let d of l)if(this.acquire(d)){n(d);return}let c=a-Date.now();if(c<=0){n(null);return}let i={resolve:()=>r(),timer:setTimeout(()=>{let d=this.waiters.indexOf(i);d!==-1&&this.waiters.splice(d,1),n(null)},c)};i.timer.unref&&i.timer.unref(),this.waiters.push(i)};r()})}_getOrCreateStats(e){let t=this.accountStats.get(e);return t||(t={successCount:0,failCount:0,lastSuccessAt:null,lastErrorAt:null,lastErrorMsg:"",lastModel:""},this.accountStats.set(e,t)),t}recordSuccess(e,t=""){let s=e?.account?.uid;if(!s)return;let a=this.circuitBreakers.delete(s),n=t?this.modelBreakers.delete(`${s}::${ke(t)}`):!1;this.consecutiveFails.delete(s);let r=this._getOrCreateStats(s);r.successCount+=1,r.lastSuccessAt=Date.now(),t&&(r.lastModel=ke(t)),(a||n)&&this._scheduleSaveState()}noteTransientFailure(e,t="transient",s=""){if(!e)return!1;let a=(this.consecutiveFails.get(e)||0)+1;if(this.consecutiveFails.set(e,a),a<_a)return console.warn(`[degrade] \u8D26\u53F7 ${e} \u77AC\u6001\u5F02\u5E38 (${a}/${_a}, ${t}): ${s}`),!1;let n=Date.now(),r=this.circuitBreakers.get(e);return r&&n<r.cooldownUntil?!1:(this.consecutiveFails.delete(e),this.circuitBreakers.set(e,{failures:a,cooldownUntil:n+is,kind:t||"degraded",reason:`\u8FDE\u7EED ${a} \u6B21\u77AC\u6001\u5F02\u5E38\u964D\u7EA7 ${is/1e3}s: ${s}`}),this._scheduleSaveState(),console.warn(`[degrade] \u8D26\u53F7 ${e} \u8FDE\u7EED ${a} \u6B21\u5F02\u5E38\uFF0C\u89E6\u53D1\u56FA\u5B9A ${is/1e3}s \u4E34\u65F6\u964D\u7EA7: ${s}`),!0)}recordFailure(e,t,s="",a=""){let n=e?.account?.uid;if(!n)return;let r=ke(a),l=this._getOrCreateStats(n);if(l.failCount+=1,l.lastErrorAt=Date.now(),l.lastErrorMsg=s,r&&(l.lastModel=r),t===C.CONTENT_BLOCKED||t===C.BAD_PARAMS||t===C.PROMPT_TOO_LONG||t===C.IMAGE_INVALID)return;if(r&&t===C.MODEL_BLOCKED){let h=`${n}::${r}`,x=(this.modelBreakers.get(h)||{failures:0,cooldownUntil:0,kind:"",reason:""}).failures+1,b=Math.min(Qo,Zo*Math.pow(2,Math.min(x-1,2)));this.modelBreakers.set(h,{failures:x,cooldownUntil:Date.now()+b,kind:t,reason:`11102 ${s}`}),this._scheduleSaveState(),console.warn(`[scheduler] \u8D26\u53F7 ${n} \u6A21\u578B [${r}] 11102 \u540E\u7AEF\u4E0D\u652F\u6301\uFF0C\u8D1F\u7F13\u5B58 ${Math.round(b/36e5)}h`);return}if(r&&(t===C.NOT_FOUND||t===C.SOFT_RATE||t===C.SERVER)){let h=`${n}::${r}`,g=this.modelBreakers.get(h)||{failures:0,cooldownUntil:0,kind:"",reason:""};g.failures+=1,g.kind=t,g.reason=s;let x=45e3;t===C.NOT_FOUND?x=900*1e3:t===C.SOFT_RATE?x=Math.min(3e4*Math.pow(2,g.failures-1),600*1e3):t===C.SERVER&&(x=Math.min(3e4*g.failures,18e4)),g.cooldownUntil=Date.now()+x,this.modelBreakers.set(h,g),this._scheduleSaveState(),console.warn(`[scheduler] \u8D26\u53F7 ${n} \u6A21\u578B [${r}] \u89E6\u53D1\u6A21\u578B\u7EA7\u8F6F\u7194\u65AD (${t}), \u51B7\u5374 ${Math.round(x/1e3)}s: ${s}`);return}if(!t||t===C.CLIENT||t==="unknown"||t==="network"){this.noteTransientFailure(n,t||"transient",s);return}this.consecutiveFails.delete(n);let c=this.circuitBreakers.get(n)||{failures:0,cooldownUntil:0,kind:"",reason:""};c.failures+=1,c.kind=t,c.reason=s;let i=6e4,m=this.store.get(n)?.account?.nickname||n;switch(t){case C.SOFT_RATE:i=Math.min(3e4*Math.pow(2,c.failures-1),6e5);break;case C.HARD_CREDIT:i=18e5;break;case C.SESSION_DEAD:i=72e5,this.alertManager?.notifyAuthFailed(n,m,s),c.failures>=2&&typeof this.store.setAutoDisabled=="function"&&(this.store.setAutoDisabled(n,!0,`\u51ED\u8BC1\u5931\u6548(401/12153): ${String(s).slice(0,80)}`),this.alertManager?.notifyBan(n,m,"\u8FDE\u7EED 401/12153 \u4F1A\u8BDD\u5931\u6548\u81EA\u52A8\u7981\u7528"));break;case C.ACCOUNT_FAULT:i=432e5,typeof this.store.setAutoDisabled=="function"&&this.store.setAutoDisabled(n,!0,`\u8D26\u53F7\u5F02\u5E38(11140): ${String(s).slice(0,80)}`),this.alertManager?.notifyBan(n,m,s);break;case C.WAF_BLOCK:i=18e4,this.wafIPGate.noteWaf(n);break;default:i=45e3}c.cooldownUntil=Date.now()+i,this.circuitBreakers.set(n,c),this._scheduleSaveState(),console.warn(`[scheduler] \u8D26\u53F7 ${n} \u89E6\u53D1\u8D26\u53F7\u7EA7\u7194\u65AD\u4FDD\u62A4 (${t}), \u51B7\u5374\u65F6\u957F ${Math.round(i/1e3)}s: ${s}`)}cooldownFreeQuotaModel(e,t=0,s="",a=""){let n=ke(s);if(!e||!n)return;let r=Date.now(),l=r+24*3600*1e3,c=t&&t>r?t:rs(r);c>l&&(c=l),this.modelBreakers.set(`${e}::${n}`,{failures:1,cooldownUntil:c,resetAt:c,kind:C.SOFT_RATE,reason:a||"free_quota_exhausted"}),this._scheduleSaveState(),console.warn(`[free-guard] \u8D26\u53F7 ${e} \u514D\u8D39\u6A21\u578B [${n}] \u989D\u5EA6\u8017\u5C3D\uFF0C\u6A21\u578B\u7EA7\u9501\u5B9A\u81F3 ${new Date(c).toISOString()}`)}reenableIfCredits(e,t=0){if(!e||Number(t||0)<=0)return!1;let s=this.store.get(e);if(!s||s.manualDisabled)return!1;let a=!1;s.disabled&&/credit|余额|11111|11112|402|quota/i.test(s.disabledReason||"")&&typeof this.store.reviveAccount=="function"&&(this.store.reviveAccount(e),a=!0);let n=this.circuitBreakers.get(e);return n&&(n.kind===C.HARD_CREDIT||/credit|余额|11111|11112|quota/i.test(n.reason||""))&&(this.circuitBreakers.delete(e),a=!0),a&&(this._scheduleSaveState(),console.log(`[scheduler] \u8D26\u53F7 ${e} \u68C0\u6D4B\u5230\u53EF\u7528\u4F59\u989D (${t})\uFF0C\u5DF2\u81EA\u52A8\u89E3\u9664\u79EF\u5206\u51B7\u5374`)),a}clearCooldown(e){if(!e)return!1;let t=this.circuitBreakers.delete(e);this.consecutiveFails.delete(e);let s=`${e}::`;for(let a of this.modelBreakers.keys())a.startsWith(s)&&(this.modelBreakers.delete(a),t=!0);return t&&this._scheduleSaveState(),t}clearAllCooldowns(){let e=this.circuitBreakers.size+this.modelBreakers.size+this.routeModelBreakers.size;return this.circuitBreakers.clear(),this.modelBreakers.clear(),this.routeModelBreakers.clear(),this.consecutiveFails.clear(),e>0&&this._scheduleSaveState(),e}getCountsDetailed(e=null){let t=Date.now(),s=this.store.getAll().filter(d=>!e||(d.auth?.realm||"cn")===e),a=0,n=0,r=0,l=0,c=0,i=0;for(let d of s){if(a++,d.manualDisabled&&c++,d.disabled||d.manualDisabled){l++;continue}let m=this.circuitBreakers.get(d.account.uid);if(m&&t<m.cooldownUntil){r++;continue}if(this.getInFlight(d.account.uid)>=this.getLimitForAccount(d)){i++;continue}n++}return{total:a,healthy:n,cooling:r,disabled:l,manualDisabled:c,inFlightFull:i}}getPoolDiagnostics(e="",t=null){let s=Date.now(),a=this.store.getAll().filter(d=>!t||(d.auth?.realm||"cn")===t),n=0,r=0,l=0,c=0;for(let d of a){if(this.isAccountUnavailable(d)){l++;continue}let m=d.account.uid,h=this.circuitBreakers.get(m),g=e?this.modelBreakers.get(`${m}::${ke(e)}`):null,x=Math.max(h&&s<h.cooldownUntil?h.cooldownUntil:0,g&&s<g.cooldownUntil?g.cooldownUntil:0);if(x>0){r++,(!n||x<n)&&(n=x);continue}this.getInFlight(m)>=this.getLimitForAccount(d)&&c++}let i=a.length>0&&r>0&&r+l>=a.length;return{total:a.length,disabled:l,rateLimited:r,inFlightFull:c,isRateLimited:i,earliestResetAt:n,retryAfterSec:n>s?Math.ceil((n-s)/1e3):0,summary:`total=${a.length} disabled=${l} cooling=${r} busy=${c}`}}getAccountDiagnostics(e){let t=this.store.get(e),s=Date.now(),a=this.circuitBreakers.get(e),n=!!(a&&s<a.cooldownUntil),r=[],l=`${e}::`;for(let[c,i]of this.modelBreakers.entries())c.startsWith(l)&&s<i.cooldownUntil&&r.push({model:c.slice(l.length),kind:i.kind,reason:i.reason,cooldownUntil:i.cooldownUntil,remainingSec:Math.ceil((i.cooldownUntil-s)/1e3)});return{uid:e,disabled:!!t?.disabled,disabledReason:t?.disabledReason||"",manualDisabled:!!t?.manualDisabled,manualDisabledReason:t?.manualDisabledReason||"",inFlight:this.getInFlight(e),limit:t?this.getLimitForAccount(t):this.maxInFlightCN,coolingDown:n,cooldownUntil:n?a.cooldownUntil:0,cooldownRemainingSec:n?Math.ceil((a.cooldownUntil-s)/1e3):0,kind:n?a.kind:"",reason:n?a.reason:"",failures:a?.failures||0,modelCooldowns:r,stats:{...this._getOrCreateStats(e)}}}_getStickyUid(e,t){if(!e)return null;let s=`${e}::${t||""}`,a=this.stickyMap.get(s);return a?Date.now()>a.expiresAt?(this.stickyMap.delete(s),null):a.uid:null}_setStickyUid(e,t,s){if(!(!e||!s)){if(this.stickyMap.size>2e3){let a=Date.now();for(let[n,r]of this.stickyMap.entries())a>r.expiresAt&&this.stickyMap.delete(n);this.stickyMap.size>2e3&&this.stickyMap.clear()}this.stickyMap.set(`${e}::${t||""}`,{uid:s,expiresAt:Date.now()+qo})}}pickCandidates(e=null,t={}){let s=this.store.getAll().filter(i=>!this.isAccountUnavailable(i));if(s.length===0)return[];let a=Date.now(),n=ke(t.bareModel||""),r=this._getStickyUid(t.sessionKey,n),l=0;for(let i of s){let d=this.accountCredits.get(i.account.uid);d&&d.remain>l&&(l=d.remain)}let c=s.map(i=>{let d=i.account.uid,h=i.auth?.realm==="global"?"global":"cn",g=this.inFlight.get(d)||0,x=this.getLimitForAccount(i),b=0,w=this.circuitBreakers.get(d);if(w&&a<w.cooldownUntil&&(b+=1e5),n){let A=this.modelBreakers.get(`${d}::${n}`);A&&a<A.cooldownUntil&&(b+=8e4)}g>=x&&(b+=5e4),b+=g*1e3,e&&e!==h&&(b+=5e3),r&&d===r&&(b-=500);let T=this.accountCredits.get(d);if(T&&T.remain>0&&(l>0&&(b-=T.remain/l*120),T.expiringRemain>0)){let A=Math.min(1,T.expiringRemain/T.remain);b-=A*180}return d===this.store.activeUid&&(b-=50),{account:i,score:b}});return c.sort((i,d)=>i.score-d.score),c.map(i=>i.account)}async executeWithFailover(e,t,s={}){let a=String(e||""),n=a.startsWith("global:")?"global":a.startsWith("cn:")?"cn":null,r=ke(a),{queueTimeoutMs:l}=this._getLimits(),c=s.queueTimeoutMs??l;if(this.store.getAll().filter(w=>!this.isAccountUnavailable(w)).length===0)throw new Error("\u5F53\u524D\u65E0\u53EF\u7528\u542F\u7528\u8D26\u53F7\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u6216\u542F\u7528\u81F3\u5C11\u4E00\u4E2A WorkBuddy / CodeBuddy \u8D26\u53F7");if(this.wafIPGate.active()){let w=new Error("waf ip-level block: upstream firewall is blocking the gateway IP, rotation stopped");throw w.status=403,w.kind=C.WAF_BLOCK,w.code="waf_ip_blocked",w}let d={sessionKey:s.sessionKey,bareModel:r},m=this.pickCandidates(n,d),h=null,g=new Set,x=async w=>{g.add(w.account.uid);try{let T=await t(w);if(T&&T.ok===!1){this.recordFailure(w,T.kind,T.message,r),this.release(w);let A=new Error(T.message);if(A.status=T.status,A.kind=T.kind,A.nonRetryable=T.kind===C.CONTENT_BLOCKED||T.kind===C.BAD_PARAMS||T.kind===C.PROMPT_TOO_LONG||T.kind===C.IMAGE_INVALID,A.nonRetryable)throw A;if(T.kind===C.WAF_BLOCK&&this.wafIPGate.active())throw A.code="waf_ip_blocked",A;if(T.kind===C.SOFT_RATE||T.kind===C.HARD_CREDIT||T.kind===C.SESSION_DEAD||T.kind===C.NOT_FOUND||T.kind===C.MODEL_BLOCKED||T.kind===C.ACCOUNT_FAULT||T.kind===C.WAF_BLOCK||T.kind===C.SERVER)return h=A,console.log(`[scheduler] \u8D26\u53F7 ${w.account.uid} [${r||a}] \u9047 ${T.kind}\uFF0C\u81EA\u52A8\u5207\u6362\u4E0B\u4E00\u4E2A\u8D26\u53F7...`),null;throw A}return T?.degradedTriggered&&this.degradeGate.trigger(),this.recordSuccess(w,r),s.sessionKey&&this._setStickyUid(s.sessionKey,r,w.account.uid),{...T,account:w,release:()=>this.release(w)}}catch(T){if(T.nonRetryable)throw this.release(w),T;let A=T.kind||C.CLIENT;if(this.recordFailure(w,A,T.message,r),this.release(w),h=T,T.code==="waf_ip_blocked")throw T;return console.warn(`[scheduler] \u8D26\u53F7 ${w.account.uid} \u8C03\u7528\u5F02\u5E38 (${A})\uFF0C\u5C1D\u8BD5\u5BB9\u707E\u8F6E\u6362:`,T.message),null}};for(let w of m){if(this.wafIPGate.active())break;if(!this.acquire(w))continue;let T=await x(w);if(T)return T}if(g.size===0&&c>0){let w=await this.acquireWithQueue(()=>this.pickCandidates(n,d).filter(T=>!this.isCoolingDown(T.account.uid,r)),c);if(w){let T=await x(w);if(T)return T}}let b=this.getPoolDiagnostics(r,n);if(b.isRateLimited){this.alertManager?.notifyAllCooling(n||"all",r||a);let w=h||new Error("rate limited: all accounts are cooling down");throw(!w.status||w.status>=500)&&(w.status=429),b.retryAfterSec>0&&(w.retryAfterSec=b.retryAfterSec),w}throw h||new Error("\u6240\u6709\u53EF\u7528\u8D26\u53F7\u5747\u5E76\u53D1\u5360\u6EE1\u6216\u5904\u4E8E\u51B7\u5374\u4FDD\u62A4\u671F\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5")}async refreshAllTokens(e=!1){if(!this.client)return{total:0,refreshed:0,skipped:0,failed:0,results:[]};let t=this.store.getAll(),s=Date.now(),a=0,n=0,r=0,l=[];for(let c of t){let i=c.account?.uid;if(!c.auth?.refreshToken){n++,l.push({uid:i,status:"skipped",reason:"no_refresh_token"});continue}let d=c.auth?.expiresAt||0;if(e&&d>0&&d-s>Jo){n++,l.push({uid:i,status:"skipped",reason:"still_fresh"});continue}try{await this.client.refreshToken(c),this.store.upsert(c);let m=this.circuitBreakers.get(i);m&&m.kind===C.SESSION_DEAD&&this.circuitBreakers.delete(i),a++,l.push({uid:i,status:"refreshed"})}catch(m){r++,l.push({uid:i,status:"failed",error:m.message})}await new Promise(m=>setTimeout(m,300))}return{total:t.length,refreshed:a,skipped:n,failed:r,results:l}}async refreshKeepalive(){return this.refreshAllTokens(!0)}async runAllTravel(){let e=this.store.getAll().filter(s=>!s.disabled&&s.auth?.realm!=="global"),t=[];for(let s of e){try{let a=await De(s);t.push({uid:s.account.uid,nickname:s.account.nickname,...a})}catch(a){t.push({uid:s.account.uid,nickname:s.account.nickname,status:"error",error:a.message})}await new Promise(a=>setTimeout(a,800))}return t}async runAllWelfare(){let e=this.store.getAll().filter(s=>!s.disabled),t=[];for(let s of e){try{let a=await $e(s);t.push({uid:s.account.uid,nickname:s.account.nickname,...a})}catch(a){t.push({uid:s.account.uid,nickname:s.account.nickname,status:"error",error:a.message})}await new Promise(a=>setTimeout(a,1e3))}return t}async runAllSignin(){let e=this.store.getAll().filter(s=>!s.disabled),t=[];for(let s of e){try{let a=await _e(s);t.push({uid:s.account.uid,nickname:s.account.nickname,...a})}catch(a){t.push({uid:s.account.uid,nickname:s.account.nickname,ok:!1,error:a.message})}await new Promise(a=>setTimeout(a,500))}return t}async runAllTasks(){let e=this.store.getAll().filter(s=>!s.disabled&&s.auth?.realm!=="global"),t=[];for(let s of e){try{let a=await Ae(s);t.push({uid:s.account.uid,nickname:s.account.nickname,ok:!0,result:a})}catch(a){t.push({uid:s.account.uid,nickname:s.account.nickname,ok:!1,error:a.message})}await new Promise(a=>setTimeout(a,800))}return t}async runAllSchool(e={}){let t=this.store.getAll().filter(a=>!a.disabled&&a.auth?.realm!=="global"),s=[];for(let a of t){try{let n=await wt(a,e);s.push({uid:a.account.uid,nickname:a.account.nickname,...n})}catch(n){s.push({uid:a.account.uid,nickname:a.account.nickname,ok:!1,error:n.message})}await new Promise(n=>setTimeout(n,800))}return s}async runAllNightCat(e=new Date){if(!Ne(e))return[];let t=this.store.getAll().filter(a=>!a.disabled&&a.auth?.realm!=="global"),s=[];for(let a of t){try{let n=await ba(a);s.push({uid:a.account.uid,nickname:a.account.nickname,...n})}catch(n){s.push({uid:a.account.uid,nickname:a.account.nickname,ok:!1,error:n.message})}await new Promise(n=>setTimeout(n,500))}return s}async _runScheduledHourTick(){let e=this.configStore?this.configStore.getAll():{},t=e.schedule||{},{hour:s,slot:a}=en(),n=(r,l)=>{let c=`${r}:${a}`;if(!this._executedScheduleSlots.has(c)){if(this._executedScheduleSlots.add(c),this._executedScheduleSlots.size>200){let i=this._executedScheduleSlots.keys().next().value;this._executedScheduleSlots.delete(i)}Promise.resolve().then(l).catch(i=>console.warn(`[scheduler] \u5B9A\u65F6\u6392\u7A0B(${r})\u5F02\u5E38:`,i.message))}};t.checkinEnabled!==!1&&e.autoCheckin!==!1&&(t.checkinHours||[9,21]).includes(s)&&n("checkin",()=>this.runAllWelfare()),t.travelEnabled!==!1&&e.autoTravel!==!1&&(t.travelHours||[9,21]).includes(s)&&n("travel",()=>this.runAllTravel()),t.tasksEnabled!==!1&&e.autoTasks!==!1&&(t.tasksHours||[11]).includes(s)&&n("tasks",()=>this.runAllTasks()),t.schoolEnabled!==!1&&(t.schoolHours||[12]).includes(s)&&n("school",()=>this.runAllSchool()),t.catEnabled!==!1&&(t.catHours||[1]).includes(s)&&Ne()&&n("nightcat",()=>this.runAllNightCat()),t.keepaliveEnabled!==!1&&e.autoRefreshToken!==!1&&(t.keepaliveHours||[22]).includes(s)&&n("keepalive",()=>this.refreshAllTokens(!1))}startAutoRoutines(e=7200*1e3){this.store?.startAuthDirWatch?.(5e3),this.scheduleTimer||(this.scheduleTimer=setInterval(()=>{this._runScheduledHourTick().catch(()=>{})},Vo),this.scheduleTimer.unref&&this.scheduleTimer.unref()),this.autoTimer||(console.log(`[scheduler] \u542F\u52A8\u540E\u53F0\u81EA\u52A8\u5316\u6392\u7A0B\uFF1A\u5B9A\u65F6\u6574\u70B9\u4EFB\u52A1\u4E0E Token \u4FDD\u6D3B (\u515C\u5E95\u5DE1\u68C0 ${Math.round(e/6e4)} \u5206\u949F)`),this.autoTimer=setInterval(async()=>{let t=this.configStore?this.configStore.getAll():{};try{t.autoCheckin!==!1?await this.runAllWelfare():t.autoTravel!==!1&&await this.runAllTravel()}catch(s){console.warn("[scheduler] \u81EA\u52A8\u798F\u5229/\u65C5\u884C\u5DE1\u68C0\u5F02\u5E38:",s.message)}},e),this.autoTimer.unref&&this.autoTimer.unref()),this.keepaliveTimer||(this.keepaliveTimer=setInterval(async()=>{if((this.configStore?this.configStore.getAll():{}).autoRefreshToken!==!1)try{await this.refreshKeepalive()}catch(s){console.warn("[scheduler] Token \u4FDD\u6D3B\u5237\u65B0\u5F02\u5E38:",s.message)}},Ko),this.keepaliveTimer.unref&&this.keepaliveTimer.unref())}stopAutoRoutines(){this.store?.stopAuthDirWatch?.(),this._stateSaveTimer&&this.flushState(),this.scheduleTimer&&(clearInterval(this.scheduleTimer),this.scheduleTimer=null),this.autoTimer&&(clearInterval(this.autoTimer),this.autoTimer=null),this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null);let e=this.waiters.splice(0,this.waiters.length);for(let t of e)clearTimeout(t.timer),t.resolve(!1)}};var Se=O(require("node:crypto"),1),ms=O(require("node:fs"),1);var Aa=O(require("node:crypto"),1);function tn(o,e){let t=e.replace(/^(cn:|global:|solo:|trae:)/i,"");return(o==="global"||e.startsWith("global:")?ia:ra)[t]||null}function Ta(o,e,t){if(!t||typeof t!="string")return null;let s=t.trim().toLowerCase();if(s==="off"||s==="none"||s==="default")return null;let a=tn(o,e);return a?a.efforts&&a.efforts.includes(s)?s:a.defaultEffort||null:["low","medium","high","xhigh","max"].includes(s)?s:null}var sn=[["You are Claude Code, Anthropic's official CLI for Claude","You are Claude Code, Anthropic's official CLI tool for Claude"],["Main branch (you will usually use this for PRs)","Default branch (you will usually use this for PRs)"],["You are a coding agent running in the Codex CLI, a terminal-based coding assistant.","You are a coding agent running in the Codex CLI tool, a terminal-based coding assistant."],["To give feedback, users should report the issue at https://github.com/anthropics/claude-code/issues","To provide feedback, users should report the issue at https://github.com/anthropics/claude-code/issues"],["11128","11-128"]];function us(o){if(typeof o!="string"||!o)return o;let e=o;if(!(e.includes("x-anthropic-billing-header")||e.includes("X-Anthropic-Billing-Header")||e.includes("cc_")||e.includes("You are Claude Code")||e.includes("Main branch (")||e.includes("Codex CLI")||e.includes("github.com/anthropics/")||e.includes("11128")))return e;for(let[s,a]of sn)e.includes(s)&&(e=e.split(s).join(a));return e=e.replace(/x-anthropic-billing-header:[^;\n]*;?\s*/gi,""),e=e.replace(/x-anthropic-billing-header/gi,"x-anthropic-billing-hdr"),e.includes("cc_")&&(e=e.replace(/\bcc_[a-z0-9_]+=[^;\n]*;?\s*/gi,"")),e}function an(o,e){if(!Array.isArray(o))return[];let t=o.map(s=>{if(!s||typeof s!="object")return s;let a={...s};return typeof a.role=="string"&&a.role.trim().toLowerCase()==="developer"&&(a.role="system"),typeof a.content=="string"?a.content=us(a.content):Array.isArray(a.content)&&(a.content=a.content.map(n=>!n||typeof n!="object"?n:n.type==="text"&&typeof n.text=="string"?{...n,text:us(n.text)}:n)),Array.isArray(a.tool_calls)&&(a.tool_calls=a.tool_calls.map(n=>n?.function&&typeof n.function.arguments=="string"?{...n,function:{...n.function,arguments:us(n.function.arguments)}}:n)),a});return e==="global"&&t.length>0&&String(t[0]?.role||"").trim().toLowerCase()!=="system"&&t.unshift({role:"system",content:"You are a helpful assistant."}),t}function on(o){if(!Array.isArray(o)||o.length===0)return o;let e=[],t=0;for(;t<o.length;){let s=o[t];if(e.push(s),t++,!s||s.role!=="assistant"||!Array.isArray(s.tool_calls)||s.tool_calls.length===0)continue;let a=new Set(s.tool_calls.map(l=>l?.id).filter(Boolean));if(a.size===0)continue;let n=[],r=[];for(;t<o.length&&n.length<a.size;){let l=o[t];if(!l||typeof l!="object"){r.push(l),t++;continue}if(l.role==="tool"){n.push(l),t++;continue}if(n.length===0||l.role==="assistant"&&Array.isArray(l.tool_calls)&&l.tool_calls.length>0)break;r.push(l),t++}e.push(...n,...r)}return e}function nn(o){if(!Array.isArray(o)||o.length===0)return o;let e=new Set,t=new Set;for(let n of o)if(!(!n||typeof n!="object"))if(n.role==="assistant"&&Array.isArray(n.tool_calls))for(let r of n.tool_calls)r?.id&&e.add(r.id);else n.role==="tool"&&n.tool_call_id&&t.add(n.tool_call_id);if(e.size===0&&t.size===0)return o;let s=new Set;for(let n of e)t.has(n)&&s.add(n);let a=[];for(let n of o){if(!n||typeof n!="object"){a.push(n);continue}if(n.role==="tool"){n.tool_call_id&&s.has(n.tool_call_id)&&a.push(n);continue}if(n.role==="assistant"&&Array.isArray(n.tool_calls)&&n.tool_calls.length>0){let r=n.tool_calls.filter(l=>l?.id&&s.has(l.id));if(r.length===n.tool_calls.length)a.push(n);else{let l={...n};r.length>0?l.tool_calls=r:(delete l.tool_calls,l.content||(l.content="")),a.push(l)}continue}a.push(n)}return a}function rn(o){let e=String(o??"").trim();if(!e)return!1;try{return JSON.parse(e),!1}catch{return!0}}function Sa(o=[]){return Array.isArray(o)?o.filter(e=>e?.function?!rn(e.function.arguments):!0):[]}var xt="You are a helpful assistant. Respond in the user's language, follow the user's instructions, and be direct and concise.";function Ia(o){if(!o||!Array.isArray(o.messages)||o.messages.length<=2)return{pruned:!1,payload:o};let e=o.messages,t=0;for(;t<e.length;){let n=String(e[t]?.role||"").toLowerCase();if(n!=="system"&&n!=="developer")break;t++}if(t>=e.length-1)return{pruned:!1,payload:o};let s=t+1;for(;s<e.length-1&&String(e[s]?.role||"").toLowerCase()!=="user";)s++;if(s>=e.length)return{pruned:!1,payload:o};let a=[...e.slice(0,t),...e.slice(s)];return{pruned:!0,payload:{...o,messages:a}}}function ln(o){if(!("tool_choice"in o))return;let e=o.tool_choice;if(typeof e=="string"){e.trim().toLowerCase()==="none"&&(delete o.tool_choice,delete o.tools,delete o.functions);return}if(e&&typeof e=="object"){let t=String(e.type||"").trim().toLowerCase();if(t==="none")delete o.tool_choice,delete o.tools,delete o.functions;else if(t==="auto"||t==="required")o.tool_choice=t;else if(t==="function"){let s=String(e.function?.name||e.name||"").trim();o.tool_choice=s||"auto"}else delete o.tool_choice;return}delete o.tool_choice}function cn(o){if("max_completion_tokens"in o){let e=o.max_completion_tokens;delete o.max_completion_tokens,!("max_tokens"in o)&&typeof e=="number"&&e>0&&(o.max_tokens=Math.floor(e))}}function dn(o,e){if(!e.toLowerCase().startsWith("deepseek"))return;String(o.thinking?.type||"").toLowerCase()==="disabled"?(delete o.reasoning_effort,delete o.reasoningEffort):(o.thinking={type:"enabled"},!o.reasoning_effort&&!o.reasoningEffort&&(o.reasoning_effort="high"));let a=o.thinking?.type==="enabled",n=(o.messages||[]).some(r=>typeof r.reasoning=="string"&&r.reasoning||"reasoning_content"in r);(a||n)&&(o.messages=(o.messages||[]).map(r=>{if(r.role!=="assistant"||typeof r.reasoning_content=="string")return r;let l={...r};return l.reasoning_content=typeof l.reasoning=="string"?l.reasoning:"",l}))}function un(o,e){let t=(o||"-").slice(0,8),s=Aa.default.createHash("sha256").update(`${o||""}|${e||""}`).digest("hex");return`wb2a-${t}-${s.slice(0,32)}`}function Ca(o,e,{realm:t,uid:s,bareModel:a,conversationId:n}){let r={...o};r.model=a,r.stream=!0,r.stream_options||(r.stream_options={include_usage:!0}),cn(r);let l=an(e,t);l=on(l),l=nn(l),r.messages=l,ln(r),dn(r,a);let c=r.reasoning_effort||r.reasoningEffort,i=Ta(t,a,c);return delete r.reasoningEffort,i?r.reasoning_effort=i:delete r.reasoning_effort,r.conversation_id||(r.conversation_id=n),r.conversationId||(r.conversationId=n),r.prompt_cache_key||(r.prompt_cache_key=un(s,r.conversation_id)),r}async function pn(o,e=15e3){if(!o||typeof o!="string"||o.startsWith("data:image/")||!/^https?:\/\//i.test(o))return o;try{let t=await fetch(o,{signal:AbortSignal.timeout(e),headers:{"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}});if(!t.ok)throw new Error(`HTTP ${t.status}`);let s=t.headers.get("content-type")||"image/jpeg",a=await t.arrayBuffer(),n=Buffer.from(a).toString("base64");return`data:${s};base64,${n}`}catch(t){return console.warn(`[vision] \u56FE\u7247\u8FDC\u7AEF\u5185\u8054\u5931\u8D25 (${o}):`,t.message),null}}async function Ea(o){if(!Array.isArray(o))return o;let e=[];for(let t of o){if(!t||typeof t!="object"){e.push(t);continue}if(typeof t.content=="string"){e.push(t);continue}if(Array.isArray(t.content)){let s=[];for(let a of t.content)if(!(!a||typeof a!="object")){if(a.type==="image_url"&&a.image_url?.url){let n=await pn(a.image_url.url);n?s.push({type:"image_url",image_url:{url:n}}):s.push({type:"text",text:`[\u56FE\u7247\u65E0\u6CD5\u52A0\u8F7D: ${a.image_url.url}]`});continue}if(a.type==="image"&&a.source?.data){let n=a.source.media_type||"image/png";s.push({type:"image_url",image_url:{url:`data:${n};base64,${a.source.data}`}});continue}if(a.type==="document"||a.type==="file"){let n=a.text||a.content||`[\u9644\u4EF6: ${a.name||"\u6587\u6863"}]`;s.push({type:"text",text:n});continue}s.push(a)}e.push({...t,content:s});continue}e.push(t)}return e}function Ma(o){if(!o||typeof o!="string")return!1;let e=o.toLowerCase();return e.includes("kling")||e.includes("keling")||e.includes("\u53EF\u7075")||e.includes("minimax-video")||e.includes("hailuo")||e.includes("\u6D77\u87BA")}function mn(o){if(!Array.isArray(o)||o.length===0)return{prompt:"",imageUrl:""};let e="",t="";for(let s=o.length-1;s>=0;s--){let a=o[s];if(a.role==="user"){if(typeof a.content=="string")e=a.content;else if(Array.isArray(a.content))for(let n of a.content)n.type==="text"?e+=(e?" ":"")+n.text:n.type==="image_url"&&n.image_url?.url&&(t=n.image_url.url);break}}return{prompt:e||"\u751F\u6210\u9AD8\u8D28\u91CF\u81EA\u7136\u666F\u89C2\u89C6\u9891",imageUrl:t}}async function Ra(o,e,t,s){let n=o.auth?.realm==="global"?q:Y,{prompt:r,imageUrl:l}=mn(t),c=e.includes("minimax")||e.includes("hailuo")||e.includes("\u6D77\u87BA")?"minimax-video-h3":"kling-video-v3",i={model:c,prompt:r,seconds:5,...l?{image_url:l}:{}};s?.(`\u{1F3AC} \u6B63\u5728\u63D0\u4EA4 ${c} \u89C6\u9891\u751F\u6210\u4EFB\u52A1...

\u63D0\u793A\u8BCD: "${r}"

`);let d=await fetch(`${n}${Re}`,{method:"POST",headers:{Authorization:`Bearer ${o.auth.accessToken}`,"Content-Type":"application/json","X-User-Id":o.account?.uid||"",Origin:n,"User-Agent":"WorkBuddy/1.2.34"},body:JSON.stringify(i)}),m=await d.json().catch(()=>({}));if(!d.ok||m.code!==0&&m.code!==200)throw new Error(m.msg||`\u89C6\u9891\u4EFB\u52A1\u521B\u5EFA\u5931\u8D25 (${d.status})`);let h=m.data?.id||m.id;if(!h)throw new Error("\u672A\u83B7\u53D6\u5230\u89C6\u9891\u4EFB\u52A1 ID");s?.(`\u23F3 \u4EFB\u52A1 ID: \`${h}\`\uFF0C\u6B63\u5728\u6392\u961F\u6E32\u67D3\u4E2D\uFF0C\u8BF7\u7A0D\u5019...

`);let g=Date.now();for(;Date.now()-g<18e4;){await new Promise(x=>setTimeout(x,4e3));try{let b=await(await fetch(`${n}${Re}/${h}`,{headers:{Authorization:`Bearer ${o.auth.accessToken}`,"X-User-Id":o.account?.uid||"",Origin:n,"User-Agent":"WorkBuddy/1.2.34"}})).json().catch(()=>({})),w=b.data?.status||b.status;if(w==="completed"||w==="succeeded"||w==="success"){let T=b.data?.data?.[0]?.url||b.data?.url||b.url;return s?.(`

\u2705 \u89C6\u9891\u751F\u6210\u6210\u529F\uFF01

[\u25B6 \u70B9\u51FB\u64AD\u653E\u89C6\u9891](${T})

<video controls src="${T}" width="100%"></video>
`),T}if(w==="failed"||w==="error")throw new Error(b.data?.error?.message||b.msg||"\u89C6\u9891\u751F\u6210\u4EFB\u52A1\u5931\u8D25");s?.(".")}catch(x){if(x.message.includes("\u5931\u8D25"))throw x}}throw new Error("\u89C6\u9891\u6E32\u67D3\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u68C0\u67E5")}var We=O(require("node:fs"),1),ps=O(require("node:path"),1),Ba=O(require("node:os"),1),hn="https://models.dev/api.json",fn=300*1e3,gn=1440*60*1e3,bn=2e5,yn=["anthropic","openai","google","deepseek","zai","z-ai","moonshotai","minimax","alibaba","tencent"],kn={"glm-5.2":{ctx:1e6,max:131072},"glm-5.1":{ctx:2e5,max:131072},"glm-5.3":{ctx:1e6,max:131072},"glm-5.3-flash":{ctx:1e6,max:131072},"glm-5v-turbo":{ctx:2e5,max:131072},"kimi-k2.7":{ctx:256e3,max:65536},"kimi-k2.6":{ctx:256e3,max:262144},"kimi-k2.5":{ctx:164e3,max:262144},"kimi-k3":{ctx:1048576,max:131072},"kimi-k2.8-preview":{ctx:1048576,max:131072},"minimax-m3":{ctx:512e3,max:512e3},hy3:{ctx:192e3,max:64e3},"hy3-preview":{ctx:262144,max:64e3},"hy4-preview":{ctx:1e6,max:64e3},"hy4-preview-x":{ctx:1e6,max:64e3},"deepseek-v4-pro":{ctx:1e6,max:384e3},"deepseek-v4-flash":{ctx:1e6,max:384e3},"deepseek-v4.1-flash":{ctx:1e6,max:384e3},"gpt-6-astra":{ctx:105e4,max:128e3},"gpt-5.6-sol":{ctx:105e4,max:128e3},"gpt-5.6-terra":{ctx:105e4,max:128e3},"gpt-5.6-luna":{ctx:105e4,max:128e3},"gpt-5.5":{ctx:105e4,max:128e3},"gpt-5.4":{ctx:105e4,max:128e3},"gpt-5.3-codex":{ctx:4e5,max:128e3},"gemini-3.5-flash":{ctx:1048576,max:65536},auto:{ctx:168e3,max:32e3}},wn=[{match:/^claude-/,ctx:2e5,max:64e3},{match:/^gpt-5|^gpt-6/,ctx:4e5,max:128e3},{match:/^o3|^o4/,ctx:2e5,max:1e5},{match:/^gemini-3|^gemini-2\.5/,ctx:1048576,max:65536},{match:/^deepseek-/,ctx:131072,max:16384},{match:/^glm-/,ctx:2e5,max:32768},{match:/^kimi-/,ctx:262144,max:32768},{match:/^minimax-/,ctx:2e5,max:32768},{match:/^qwen/,ctx:262144,max:32768},{match:/^hy|^hunyuan/,ctx:131072,max:16384}];function vn(o=""){return String(o||"").replace(/^(cn:|global:|solo:|trae:)/i,"").trim().toLowerCase()}var _t=class{constructor(e={}){this.dshHome=e.dshHome||process.env.DSH_HOME||ps.default.join(Ba.default.homedir(),".dsh"),this.cachePath=ps.default.join(this.dshHome,".workbuddy-models-cache.json"),this.fetchFn=e.fetchFn||fetch,this.cache={},this.negatives=new Map,this.lastFetchAt=0,this.fetchingPromise=null,this._load()}_load(){try{if(We.default.existsSync(this.cachePath)){let e=JSON.parse(We.default.readFileSync(this.cachePath,"utf8"));e&&typeof e.models=="object"&&(this.cache=e.models)}}catch{}}_save(){try{We.default.existsSync(this.dshHome)||We.default.mkdirSync(this.dshHome,{recursive:!0}),We.default.writeFileSync(this.cachePath,JSON.stringify({updatedAt:Date.now(),models:this.cache},null,2),"utf8")}catch{}}lookupLimits(e,t=0,s=0){if(t>0)return{contextWindow:t,maxTokens:s>0?s:32e3};let a=vn(e),n=kn[a];if(n)return{contextWindow:n.ctx,maxTokens:s>0?s:n.max};let r=this.cache[a];if(r&&r.ctx>0)return{contextWindow:r.ctx,maxTokens:s>0?s:r.max||32e3};for(let l of wn)if(l.match.test(a))return{contextWindow:l.ctx,maxTokens:s>0?s:l.max};return this.scheduleModelsDevRefresh(a),{contextWindow:bn,maxTokens:s>0?s:32e3}}scheduleModelsDevRefresh(e){let t=Date.now();if(!e||this.fetchingPromise)return;let s=this.negatives.get(e);s&&s>t||t-this.lastFetchAt<fn||(this.lastFetchAt=t,this.fetchingPromise=this._fetchModelsDev(e).finally(()=>{this.fetchingPromise=null}))}async _fetchModelsDev(e){try{let t=await this.fetchFn(hn,{headers:{Accept:"application/json","User-Agent":"dsh-workbuddy2api"},signal:AbortSignal.timeout(5e3)});if(!t.ok)return;let s=await t.json().catch(()=>null);if(!s||typeof s!="object")return;let a=new Map;for(let[n,r]of Object.entries(s)){let l=r?.models;if(!l||typeof l!="object")continue;let c=n.toLowerCase(),i=yn.includes(c);for(let[d,m]of Object.entries(l)){let h=Number(m?.limit?.context||0),g=Number(m?.limit?.output||0);if(h<=0)continue;let b=(d.includes("/")?d.split("/").pop():d).trim().toLowerCase();if(!b)continue;let w=a.get(b);(!w||!w.isOfficial&&i)&&a.set(b,{ctx:h,max:g>0?g:32e3,isOfficial:i})}}if(a.size>0){let n=Date.now();for(let[r,l]of a.entries())this.cache[r]={ctx:l.ctx,max:l.max,updatedAt:n};if(e&&!this.cache[e]&&(this.negatives.set(e,n+gn),this.negatives.size>1e3)){let r=this.negatives.keys().next().value;this.negatives.delete(r)}this._save()}}catch{}}};var Tt="5.5.4",xn="2.137.1";function Pa(o,e){return Se.default.createHash("sha256").update(`wb2a:${e}:${o||""}`).digest("hex").slice(0,36)}function _n(o){return typeof o=="string"&&/^[0-9a-f]{16}$|^[0-9a-f]{32}$/i.test(o)}var At=class{constructor(e={}){this.configStore=e.configStore||null,this.proxy=e.proxy||process.env.HTTPS_PROXY||process.env.HTTP_PROXY||"",this.customUA=e.userAgent||"",this.onTokenRefresh=e.onTokenRefresh||null,this.deviceTokenPath=e.deviceTokenPath||process.env.WB_DEVICE_TOKEN_FILE||"",this._deviceTokenCache={path:"",token:"",readAt:0},this.modelCatalog=e.modelCatalog||new _t({dshHome:e.dshHome}),this.refreshFlights=new Map}readDeviceToken(){let e=String(this.configStore?.get("deviceTokenPath")||this.deviceTokenPath||"").trim();if(!e)return"";let t=Date.now();if(this._deviceTokenCache.path===e&&t-this._deviceTokenCache.readAt<300*1e3)return this._deviceTokenCache.token;let s="";try{let a=ms.default.statSync(e);a.isFile()&&a.size>0&&a.size<=1024&&(s=ms.default.readFileSync(e,"utf8").trim())}catch{}return this._deviceTokenCache={path:e,token:s,readAt:t},s}getChatBase(e){return e.auth?.realm==="global"?q:Y}getBillingBase(e){return e.auth?.realm==="global"?q:J}getOrigin(e){return e.auth?.realm==="global"?q:J}buildHeaders(e,t=!1,s={}){let a=e.auth?.realm==="global",n=this.getOrigin(e),l=`WorkBuddy/${Tt} ${a?"WorkBuddy AI":"WorkBuddy"}/${Tt} CLI/${xn}`,c=e.account?.uid||"",i={Accept:t?"application/json, text/event-stream":"application/json","Content-Type":"application/json",Origin:n,Referer:`${n}/`,"X-Requested-With":"XMLHttpRequest","User-Agent":this.customUA||(t?l:`WorkBuddy/${Tt}`),"X-CodeBuddy-Request":"1","Accept-Language":a?"en-US":"zh-CN"};if(c?(i["X-Machine-ID"]=Pa(c,"machine"),i["X-Session-ID"]=Pa(c,"session"),i["X-User-Id"]=c):i["X-No-User-Id"]="1",e.auth?.accessToken?i.Authorization=`Bearer ${e.auth.accessToken}`:t&&(i["X-No-Authorization"]="1"),a?(i["X-No-Enterprise-Id"]="1",i["X-Domain"]="www.workbuddy.ai"):(e.account?.enterpriseId?i["X-Enterprise-Id"]=e.account.enterpriseId:i["X-No-Enterprise-Id"]="1",e.auth?.domain?i["X-Domain"]=e.auth.domain:i["X-No-Department-Info"]="1"),t){i["X-Agent-Purpose"]="conversation",i["X-IDE-Name"]="WorkBuddy",i["X-IDE-Type"]="WorkBuddy",i["X-IDE-Version"]=Tt,i["X-Product"]="WorkBuddy";let d=s.conversationId||Se.default.randomUUID(),m=s.conversationRequestId||Se.default.randomBytes(16).toString("hex"),h=Se.default.randomBytes(16).toString("hex"),g=s.traceId||m,x=_n(m)?m:h;i["X-Conversation-ID"]=d,i["X-Conversation-Request-ID"]=m,i["X-Conversation-Message-ID"]=h,i["X-Request-ID"]=h,i["X-Root-Request-ID"]=m,i["X-Trace-ID"]=g,i["X-B3-TraceId"]=x,i["X-B3-SpanId"]=h.slice(0,16),i["X-B3-Sampled"]="1";let b=this.readDeviceToken();b&&(i["X-Device-Token"]=b)}return i}classifyError(e,t){let a=(typeof t=="string"?t:JSON.stringify(t||"")).toLowerCase();return e===401||a.includes("12153")||a.includes("token expired")||a.includes("session dead")?C.SESSION_DEAD:e===402||a.includes("credit")||a.includes("balance")||a.includes("\u4F59\u989D\u4E0D\u8DB3")||a.includes("\u79EF\u5206\u4E0D\u8DB3")?C.HARD_CREDIT:e===429||a.includes("6004")||a.includes("rate limit")||a.includes("frequency")?C.SOFT_RATE:os(a)||a.includes("image_invalid")||a.includes("invalid image")?C.IMAGE_INVALID:ka(a)||e===404?C.MODEL_BLOCKED:a.includes("11128")||a.includes("content")||a.includes("sensitive")||a.includes("violation")?C.CONTENT_BLOCKED:e===403?C.WAF_BLOCK:a.includes("11140")||a.includes("account blocked")||a.includes("trial not activated")?C.ACCOUNT_FAULT:a.includes("11115")||a.includes("prompt is too long")?C.PROMPT_TOO_LONG:a.includes("11101")||a.includes("unmarshal")||a.includes("bad param")?C.BAD_PARAMS:e>=500?C.SERVER:C.CLIENT}refreshToken(e){let t=e?.account?.uid||"";if(!t)return this._doRefreshToken(e);if(this.refreshFlights.has(t))return this.refreshFlights.get(t);let s=Promise.resolve().then(()=>this._doRefreshToken(e)).finally(()=>{this.refreshFlights.get(t)===s&&this.refreshFlights.delete(t)});return this.refreshFlights.set(t,s),s}async _doRefreshToken(e){if(!e.auth?.refreshToken)throw new Error("No refresh token available");let s=`${this.getChatBase(e)}${Us}`,a=this.buildHeaders(e,!1);a["X-Refresh-Token"]=e.auth.refreshToken,a["X-Auth-Refresh-Source"]="workbuddy";let n=await fetch(s,{method:"POST",headers:a,signal:AbortSignal.timeout(15e3)}),r=await n.json().catch(()=>({}));if(!n.ok||r.code!==0&&r.code!==200)throw new Error(r.msg||`Token \u5237\u65B0\u5931\u8D25 (HTTP ${n.status})`);let l=r.data||{},c=l.accessToken||l.access_token,i=l.refreshToken||l.refresh_token||e.auth.refreshToken,d=l.expiresIn||7200;if(!c)throw new Error("\u672A\u8FD4\u56DE\u6709\u6548 accessToken");if(e.auth.accessToken=c,e.auth.refreshToken=i,e.auth.expiresAt=Date.now()+d*1e3,e.updatedAt=Date.now(),typeof this.onTokenRefresh=="function")try{this.onTokenRefresh(e)}catch{}return e}async fetchBalance(e){let t=e.auth?.realm==="global",s=this.getBillingBase(e),a=t?Dt:Lt,n=t?Lt:Dt,r=async p=>{let u=`${s}${p}`,f=await fetch(u,{method:"POST",headers:this.buildHeaders(e,!1),body:JSON.stringify({}),signal:AbortSignal.timeout(1e4)}),k=await f.json().catch(()=>({}));return{res:f,data:k}},{res:l,data:c}=await r(a);if((l.status===401||c.code===401||c.code===12153||c.code===10002||typeof c.msg=="string"&&/token|auth|expire|unauthorized/i.test(c.msg))&&e.auth?.refreshToken)try{await this.refreshToken(e);let p=await r(a);l=p.res,c=p.data}catch(p){throw new Error(`Token \u5DF2\u5931\u6548\u4E14\u5237\u65B0\u5931\u8D25: ${p.message}`)}if(l.status===404){let p=await r(n);p.res.ok&&(l=p.res,c=p.data)}if(!l.ok||c.code!==0&&c.code!==200)throw new Error(c.msg||`\u67E5\u8BE2\u4F59\u989D\u5931\u8D25 (${l.status})`);let d=c.data||{},m=0,h=0,g=0,x=0,b=0,w=0,T=0,A=0,P=0,$=[],R=Date.now(),L=7*86400*1e3,y=d.Response?.Data?.Accounts||c.Response?.Data?.Accounts||[];if(Array.isArray(y)&&y.length>0)for(let p of y){A++;let u=0,f=0,k=0;p.CycleCapacitySize>0?(u=Math.max(0,Math.min(p.CycleCapacitySize,p.CycleCapacityRemain??0)),f=p.CycleCapacitySize,k=p.CycleCapacityUsed??Math.max(0,f-u)):(u=Math.max(0,p.CapacityRemain??0),f=p.CapacitySize??u,k=p.CapacityUsed??Math.max(0,f-u)),m+=u,h+=f,g+=k;let v=String(p.PackageName||"\u79EF\u5206\u5305"),S=v.toLowerCase();S.includes("subscription")||S.includes("\u8BA2\u9605")||S.includes("free plan")||S.includes("base")?x+=u:S.includes("bonus")||S.includes("gift")||S.includes("\u8BD5\u7528")||S.includes("\u8D60\u9001")||S.includes("\u6D3B\u52A8")||S.includes("trial")?b+=u:w+=u;let I=p.CycleEndTime||p.ExpiredTime||"";if(I&&u>0){let M=Date.parse(I);!Number.isNaN(M)&&M>R&&M-R<=L&&(T+=u)}(u>0||p.Status!==3&&f>0)&&(P++,$.push({name:v,remain:u,used:k,size:f,expireTime:I}))}else if(Array.isArray(d.userPackageList))for(let p of d.userPackageList){A++;let u=p.remain||0,f=p.used||0;m+=u,g+=f,h+=u+f,b+=u,u>0&&P++,$.push({name:p.packageName||p.name||"\u79EF\u5206\u5305",remain:u,used:f,size:u+f,expireTime:p.expireTime||p.expiresAt||""})}else m=d.totalRemain??d.remain??d.points??0,h=m;return{remain:Math.round(m*100)/100,total:Math.round(h*100)/100,used:Math.round(g*100)/100,baseRemain:Math.round(x*100)/100,bonusRemain:Math.round(b*100)/100,purchasedRemain:Math.round(w*100)/100,expiringRemain:Math.round(T*100)/100,packCount:A,activePackCount:P,packages:$,fetchedAt:Date.now()}}async fetchModels(e){let t=e.auth?.realm==="global",s=this.getChatBase(e),a=t?"global:":"cn:",n=[],r=new Set,l=i=>{if(!i||typeof i!="object")return;let d=i.id||i.model||i.name;if(!d||i.disabled)return;let m=/^(cn:|global:)/i.test(d)?d:`${a}${d}`;if(r.has(m))return;r.add(m);let h=Nt(i.credits||i.rate,i.tags),g=Array.isArray(i.reasoning?.supportedEfforts)?i.reasoning.supportedEfforts:i.reasoning?.effort?[i.reasoning.effort]:i.supportedEfforts||[],x=i.reasoning?.defaultEffort||i.reasoning?.effort||"",b=Number(i.maxInputTokens||i.maxAllowedSize||i.contextWindow||i.context_length||0),w=Number(i.maxOutputTokens||i.maxTokens||0),T=this.modelCatalog.lookupLimits(d,b,w);n.push({id:m,bareId:d,realm:t?"global":"cn",name:i.displayName||i.name||d,description:i.descriptionZh||i.descriptionEn||i.description||"",credits:h.credits,rate:h.rate,multiplier:h.multiplier,isFree:h.isFree,badge:h.badge,vendor:i.vendor||"",tags:Array.isArray(i.tags)?i.tags:[],isDefault:!!i.isDefault,supportsImages:!!(i.supportsImages??i.multimodal??!i.disabledMultimodal),supportsReasoning:!!i.supportsReasoning,supportsToolCall:!!(i.supportsToolCall??!0),onlyReasoning:!!i.onlyReasoning,contextWindow:T.contextWindow,maxTokens:T.maxTokens,supportedEfforts:g,defaultEffort:x})},c=async i=>{let d=await fetch(`${s}${i}`,{headers:this.buildHeaders(e,!1),signal:AbortSignal.timeout(1e4)});if(d.status===401&&e.auth?.refreshToken)try{await this.refreshToken(e),d=await fetch(`${s}${i}`,{headers:this.buildHeaders(e,!1),signal:AbortSignal.timeout(1e4)})}catch{}return d.ok?await d.json().catch(()=>null):null};for(let i of[Ws,js])try{let d=await c(i);if(d&&(d.code===0||d.code===200||Array.isArray(d.data)||d.data?.models)){let m=d.data?.models||(Array.isArray(d.data)?d.data:d.models||[]);for(let h of m)l(h);if(n.length>0)break}}catch{}if(n.length===0)for(let i of[Gs,"/v2/models",Fs])try{let d=await c(i);if(!d)continue;let m=d.data?.config?.models||d.data?.models||d.models||(Array.isArray(d.data)?d.data:[]);for(let h of m)l(h)}catch{}return n}async chatStream(e,t,s,a={}){let n=e.auth?.realm||"cn",r=e.account?.uid||"",l=(t.model||"").replace(/^(cn:|global:|solo:|trae:)/i,"");if(Ma(l))return{isVideo:!0,executeVideo:T=>Ra(e,l,t.messages,T)};let c=await Ea(t.messages),i=t.conversation_id||t.conversationId||a.conversationId||Se.default.randomUUID(),d=a.conversationRequestId||Se.default.randomBytes(16).toString("hex"),m=Ca(t,c,{realm:n,uid:r,bareModel:l,conversationId:i}),g=`${this.getChatBase(e)}${Hs}`,x={conversationId:i,conversationRequestId:d,traceId:a.traceId||d},b=this.buildHeaders(e,!0,x),w=await fetch(g,{method:"POST",headers:b,body:JSON.stringify(m),signal:s});if(w.status===401&&e.auth?.refreshToken)try{await this.refreshToken(e);let T=this.buildHeaders(e,!0,x);w=await fetch(g,{method:"POST",headers:T,body:JSON.stringify(m),signal:s})}catch{}if(!w.ok){let T=await w.text().catch(()=>""),A=this.classifyError(w.status,T);if(A===C.CONTENT_BLOCKED||w.status===403){let P=m.messages.map(R=>R.role==="system"?{...R,content:xt}:R),$={...m,messages:P};try{let R=await fetch(g,{method:"POST",headers:this.buildHeaders(e,!0,x),body:JSON.stringify($),signal:s});if(R.ok)return{ok:!0,degradedTriggered:!0,status:R.status,response:R,bodyStream:R.body};T=await R.text().catch(()=>T),A=this.classifyError(R.status,T)}catch{}}return{ok:!1,status:w.status,kind:A,message:T||`\u4E0A\u6E38\u8FD4\u56DE HTTP ${w.status}`}}return{ok:!0,status:w.status,response:w,bodyStream:w.body}}};var je=O(require("node:fs"),1),hs=O(require("node:path"),1),La=O(require("node:os"),1);function Tn(o){return Math.round((Number(o)||0)*100)/100}function ne(o){return Math.round((Number(o)||0)*1e3)/1e3}function Oa(){return{requests:0,success:0,failed:0,inputTokens:0,outputTokens:0,cacheHitTokens:0,cacheMissTokens:0,cacheWriteTokens:0,credit:0,creditSamples:0,ttfbSumMs:0,ttfbCount:0,latSumMs:0,genSecSum:0,lastSeen:0}}var St=class{constructor(e={}){this.dshHome=e.dshHome||process.env.DSH_HOME||hs.default.join(La.default.homedir(),".dsh"),this.filePath=hs.default.join(this.dshHome,".workbuddy2api-usage.json"),this.recentLogs=[],this.nextLogId=1,this.data={days:{},modelStats:{},summary:{totalRequests:0,totalSuccess:0,totalFailed:0,totalInputTokens:0,totalOutputTokens:0,totalCredit:0}},this.load()}load(){try{if(je.default.existsSync(this.filePath)){let e=JSON.parse(je.default.readFileSync(this.filePath,"utf8"));this.data={days:e.days||{},modelStats:e.modelStats||{},summary:{totalRequests:0,totalSuccess:0,totalFailed:0,totalInputTokens:0,totalOutputTokens:0,totalCredit:0,...e.summary||{}}}}}catch{}}save(){try{je.default.existsSync(this.dshHome)||je.default.mkdirSync(this.dshHome,{recursive:!0});let e=Object.keys(this.data.days).sort();if(e.length>60)for(let t of e.slice(0,e.length-60))delete this.data.days[t];je.default.writeFileSync(this.filePath,JSON.stringify(this.data,null,2),"utf8")}catch{}}getTodayKey(){let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}record(e,t=0,s=0,a=!1,n={}){let r=this.getTodayKey(),l=String(new Date().getHours()),c=Math.max(0,Math.round(Number(t)||0)),i=Math.max(0,Math.round(Number(s)||0)),d=Math.max(0,Number(n.credit||0)||0),m=!!(n.hasCredit||d>0),h=n.success!==!1,g=Math.max(0,Number(n.ttfbMs||0)||0),x=Math.max(0,Number(n.durationMs||0)||0),b=Math.max(0,Number(n.cacheHitTokens||0)||0),w=Math.max(0,Number(n.cacheMissTokens||0)||0),T=Math.max(0,Number(n.cacheWriteTokens||0)||0);this.data.days[r]||(this.data.days[r]={requests:0,inputTokens:0,outputTokens:0,credit:0,cacheHits:0,models:{},modelStats:{},hours:{}});let A=this.data.days[r];A.modelStats||(A.modelStats={}),A.requests+=1,A.inputTokens+=c,A.outputTokens+=i,A.credit=ne((A.credit||0)+d),(a||b>0)&&(A.cacheHits=(A.cacheHits||0)+1),A.models[e]=(A.models[e]||0)+1,A.hours[l]||(A.hours[l]={requests:0,tokens:0,credit:0}),A.hours[l].requests+=1,A.hours[l].tokens+=c+i,A.hours[l].credit=ne((A.hours[l].credit||0)+d);let P=R=>{if(R.requests+=1,h?R.success+=1:R.failed+=1,R.inputTokens+=c,R.outputTokens+=i,R.cacheHitTokens+=b,R.cacheMissTokens+=w,R.cacheWriteTokens+=T,m&&(R.credit=ne((R.credit||0)+d),R.creditSamples=(R.creditSamples||0)+1),g>0&&(R.ttfbSumMs+=g,R.ttfbCount+=1),x>0){R.latSumMs+=x;let L=x>g?x-g:x;i>0&&L>0&&(R.genSecSum+=L/1e3)}return R.lastSeen=Date.now(),R},$=String(e||"unknown");A.modelStats[$]=P(A.modelStats[$]||Oa()),this.data.modelStats||(this.data.modelStats={}),this.data.modelStats[$]=P(this.data.modelStats[$]||Oa()),this.data.summary.totalRequests+=1,h?this.data.summary.totalSuccess=(this.data.summary.totalSuccess||0)+1:this.data.summary.totalFailed=(this.data.summary.totalFailed||0)+1,this.data.summary.totalInputTokens+=c,this.data.summary.totalOutputTokens+=i,this.data.summary.totalCredit=ne((this.data.summary.totalCredit||0)+d),this.save()}addRequestLog(e){let t=new Date,s=n=>String(n).padStart(2,"0"),a={id:this.nextLogId++,timestamp:Date.now(),time:`${s(t.getHours())}:${s(t.getMinutes())}:${s(t.getSeconds())}`,model:e.model||"-",rate:e.rate||"-",mode:e.mode||"stream",protocol:e.protocol||"openai",status:e.status||200,uid:e.uid?String(e.uid).slice(0,8):"-",account:e.account||"-",realm:e.realm||"-",ttfbMs:Math.round(Number(e.ttfbMs||0)),durationMs:Math.round(Number(e.durationMs||0)),promptTokens:Math.round(Number(e.promptTokens||0)),completionTokens:Math.round(Number(e.completionTokens||0)),totalTokens:Math.round(Number(e.promptTokens||0)+Number(e.completionTokens||0)),tokensPerSec:Number(e.tokensPerSec||0),credit:e.hasCredit?ne(e.credit):null,cacheHit:!!e.cacheHit,error:e.error||""};return this.recentLogs.unshift(a),this.recentLogs.length>100&&(this.recentLogs.length=100),a}getRecentLogs(){return[...this.recentLogs]}getAvailableDates(){let e=this.getTodayKey(),t=Object.keys(this.data.days||{});return t.includes(e)||t.push(e),t.sort().reverse()}_buildBreakdown(e={},t=null){let s=[];for(let[a,n]of Object.entries(e||{})){let r=(n.inputTokens||0)+(n.outputTokens||0),l=(n.cacheHitTokens||0)+(n.cacheMissTokens||0),c=l>0?Math.round((n.cacheHitTokens||0)/l*100):0,i=t?.get(a)||t?.get(`global:${a}`)||t?.get(`cn:${a}`);s.push({model:a,rate:i?.rate||"-",multiplier:i?.multiplier??null,isFree:!!i?.isFree,requests:n.requests||0,success:n.success||0,failed:n.failed||0,inputTokens:n.inputTokens||0,outputTokens:n.outputTokens||0,totalTokens:r,cacheHitTokens:n.cacheHitTokens||0,cacheMissTokens:n.cacheMissTokens||0,cacheHitRate:c,credit:ne(n.credit||0),creditPerReq:n.requests>0?ne((n.credit||0)/n.requests):0,costPer1k:r>0&&n.credit>0?ne(n.credit/r*1e3):0,avgTtfbMs:n.ttfbCount>0?Math.round(n.ttfbSumMs/n.ttfbCount):0,avgLatencyMs:n.requests>0?Math.round((n.latSumMs||0)/n.requests):0,tokensPerSec:n.genSecSum>.05?Tn((n.outputTokens||0)/n.genSecSum):0,lastSeen:n.lastSeen||0})}return s.sort((a,n)=>n.requests-a.requests),s}getStats(e=null,t=""){let s=this.getTodayKey(),a=t&&this.data.days[t]?t:s,n=this.data.days[a]||{requests:0,inputTokens:0,outputTokens:0,credit:0,cacheHits:0,hours:{},models:{},modelStats:{}},r=[],l=new Date;for(let d=6;d>=0;d--){let m=new Date(l.getTime()-d*864e5),h=`${m.getFullYear()}-${String(m.getMonth()+1).padStart(2,"0")}-${String(m.getDate()).padStart(2,"0")}`,g=this.data.days[h]||{requests:0,inputTokens:0,outputTokens:0,credit:0,cacheHits:0},x=g.inputTokens+g.outputTokens,b=g.requests>0?Math.round((g.cacheHits||0)/g.requests*100):0;r.push({date:h.slice(5),fullDate:h,requests:g.requests,tokens:x,credit:ne(g.credit||0),hitRate:b})}let c=[];for(let d=0;d<24;d++){let m=String(d);c.push({hour:`${m}\u65F6`,tokens:n.hours?.[m]?.tokens||0,requests:n.hours?.[m]?.requests||0,credit:ne(n.hours?.[m]?.credit||0)})}let i=t?this._buildBreakdown(n.modelStats||{},e):this._buildBreakdown(this.data.modelStats||{},e);return{activeDate:a,availableDates:this.getAvailableDates(),today:{requests:n.requests,inputTokens:n.inputTokens,outputTokens:n.outputTokens,totalTokens:n.inputTokens+n.outputTokens,credit:ne(n.credit||0),models:n.models},summary:this.data.summary,trend7d:r,hourly:c,modelBreakdown:i,recentLogs:this.getRecentLogs()}}reset(){this.data={days:{},modelStats:{},summary:{totalRequests:0,totalSuccess:0,totalFailed:0,totalInputTokens:0,totalOutputTokens:0,totalCredit:0}},this.recentLogs=[],this.save()}};var eo=O(require("node:http"),1);function Ie(o){o.writeHead(200,{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"no-cache, no-transform",Connection:"keep-alive","X-Accel-Buffering":"no","Access-Control-Allow-Origin":"*"}),o.flush&&o.flush()}function An(o){let e=o?.usage;if(!e||typeof e!="object")return null;let t=Number(e.prompt_tokens??e.input_tokens??0)||0,s=Number(e.completion_tokens??e.output_tokens??0)||0,a=Number(e.total_tokens??t+s)||0,n=Number(e.prompt_cache_hit_tokens??e.prompt_tokens_details?.cached_tokens??e.cache_read_input_tokens??e.cached_tokens??0)||0,r=Number(e.prompt_cache_miss_tokens??0)||0,l=Number(e.prompt_cache_write_tokens??0)||0,c=typeof e.credit=="number"&&!Number.isNaN(e.credit),i=c?Number(e.credit):0;return{promptTokens:t,completionTokens:s,totalTokens:a,cachedTokens:n,cacheHitTokens:n,cacheMissTokens:r,cacheWriteTokens:l,cacheHit:n>0,credit:i,hasCredit:c,quota:e.quota&&typeof e.quota=="object"?e.quota:null}}function Sn(o,e=3e3,t=null){if(!o)return()=>{};let s=setInterval(()=>{try{if(o.writableEnded||o.destroyed){clearInterval(s);return}if(typeof t=="function"&&!t())return;o.write(`: ping

`),o.flush&&o.flush()}catch{clearInterval(s)}},e);return s.unref&&s.unref(),()=>clearInterval(s)}function fs(o,e={}){let t=typeof e=="function"?{onEvent:e}:e||{},{onEvent:s=null,forwardRaw:a=!0,heartbeatMs:n=3e3,startTime:r=Date.now(),transformErrorFrame:l=null}=t,c="",i=!1,d=Date.now(),m=!1,h=0,g=0,x=0,b=0,w=0,T=0,A=!1,P=null,$=!1,R=0,L=!1,y=0,p=0,u=o&&n>0?Sn(o,n,()=>m?!1:c.length===0&&Date.now()-d>=Math.max(500,n-200)):()=>{},f=k=>{if(!k.trim())return;let S=k.split(`
`),I=[];for(let E of S)E.startsWith("data:")&&I.push(E.slice(5).trimStart());let M=I.join(`
`).trim();if(M==="[DONE]")L=!0,typeof s=="function"&&s(null,"[DONE]",k);else if(M){let E=null;try{E=JSON.parse(M)}catch{}if(E){let U=Date.now();y||(y=U),p=U;let z=An(E);z&&(z.promptTokens>0&&(h=Math.max(h,z.promptTokens)),z.completionTokens>0&&(g=Math.max(g,z.completionTokens)),z.cacheHitTokens>0&&(x=Math.max(x,z.cacheHitTokens)),z.cacheMissTokens>0&&(b=Math.max(b,z.cacheMissTokens)),z.cacheWriteTokens>0&&(w=Math.max(w,z.cacheWriteTokens)),z.cacheHit&&($=!0),z.hasCredit&&(A=!0,T=Math.max(T,z.credit)),z.quota&&(P=z.quota));let ie=E.choices?.[0]?.delta;ie&&(typeof ie.content=="string"&&(R+=ie.content.length),typeof ie.reasoning_content=="string"&&(R+=ie.reasoning_content.length))}if(E&&E.error&&typeof l=="function"){let U=l(E);U&&(E=U,k=`data: ${JSON.stringify(U)}`)}typeof s=="function"&&s(E,M,k)}else typeof s=="function"&&s(null,"",k);a&&o&&!o.writableEnded&&(o.write(`${k}

`),o.flush&&o.flush(),d=Date.now())};return{push(k){if(!k||m)return;let v=(i?"\r":"")+String(k);i=v.endsWith("\r"),i&&(v=v.slice(0,-1)),v=v.replace(/\r\n/g,`
`).replace(/\r/g,`
`),c+=v,d=Date.now();let S;for(;(S=c.indexOf(`

`))!==-1;){let I=c.slice(0,S);c=c.slice(S+2),f(I)}},finish(){m||(i&&(c+=`
`,i=!1),c.trim().length>0&&f(c),c="",a&&o&&!o.writableEnded&&!L&&o.write(`data: [DONE]

`),m=!0,u())},stop(){m=!0,u()},markActivity(){d=Date.now()},getUsage(){let k=g>0?g:R>0?Math.max(1,Math.ceil(R/3)):0,v=y>r?y-r:0,S=p>y?(p-y)/1e3:0,I=S>.05&&k>0?Number((k/S).toFixed(1)):0;return{promptTokens:h,completionTokens:k,totalTokens:h+k,cacheHit:$,cacheHitTokens:x,cacheMissTokens:b,cacheWriteTokens:w,credit:T,hasCredit:A,quota:P,ttfbMs:v,tokensPerSec:I}}}}function gs(o,e,t,s=null){let a={id:o||`chatcmpl-${Date.now()}`,object:"chat.completion.chunk",created:Math.floor(Date.now()/1e3),model:e||"workbuddy",choices:[{index:0,delta:t?{content:t}:{},finish_reason:s}]};return`data: ${JSON.stringify(a)}

`}var $a=O(require("node:crypto"),1);function tt(o="msg"){return`${o}_${$a.default.randomBytes(10).toString("hex")}`}function In(o,e={}){if(typeof o!="string"||!o.trim())return e;try{return JSON.parse(o)}catch{return e}}function Na(o){return typeof o=="string"?o:Array.isArray(o)?o.map(e=>typeof e=="string"?e:e?.type==="text"?e.text||"":e?.type==="image"?"[image]":JSON.stringify(e)).filter(Boolean).join(`
`):o?JSON.stringify(o):""}function Ha(o){switch(o){case"tool_calls":return"tool_use";case"length":return"max_tokens";case"content_filter":return"refusal";default:return"end_turn"}}function Ua(o={}){let e=[];if(typeof o.system=="string"&&o.system)e.push({role:"system",content:o.system});else if(Array.isArray(o.system)){let s=o.system.map(a=>typeof a=="string"?a:a?.text||"").filter(Boolean).join(`
`);s&&e.push({role:"system",content:s})}for(let s of o.messages||[])if(s){if(s.role==="user"){if(typeof s.content=="string"){e.push({role:"user",content:s.content});continue}if(!Array.isArray(s.content)){e.push({role:"user",content:String(s.content||"")});continue}let a=[],n=[];for(let r of s.content)if(r){if(r.type==="tool_result")a.push({role:"tool",tool_call_id:r.tool_use_id||"",content:Na(r.content)});else if(r.type==="text")n.push({type:"text",text:r.text||""});else if(r.type==="image"&&r.source)if(r.source.type==="base64"){let l=r.source.media_type||"image/png";n.push({type:"image_url",image_url:{url:`data:${l};base64,${r.source.data||""}`}})}else r.source.type==="url"&&r.source.url&&n.push({type:"image_url",image_url:{url:r.source.url}})}for(let r of a)e.push(r);n.length>0&&(n.every(r=>r.type==="text")?e.push({role:"user",content:n.map(r=>r.text).join(`
`)}):e.push({role:"user",content:n}));continue}if(s.role==="assistant"){if(typeof s.content=="string"){e.push({role:"assistant",content:s.content});continue}if(!Array.isArray(s.content)){e.push({role:"assistant",content:String(s.content||"")});continue}let a="",n="",r=[];for(let c of s.content)c&&(c.type==="thinking"?n+=c.thinking||"":c.type==="text"?a+=c.text||"":c.type==="tool_use"&&r.push({id:c.id||tt("call"),type:"function",function:{name:c.name||"",arguments:typeof c.input=="string"?c.input:JSON.stringify(c.input||{})}}));let l={role:"assistant",content:a||(r.length>0?null:"")};n&&(l.reasoning_content=n),r.length>0&&(l.tool_calls=r),e.push(l);continue}e.push({role:s.role||"user",content:Na(s.content)})}let t={model:o.model||"",messages:e,max_tokens:o.max_tokens||8192,stream:!!o.stream};if(o.metadata&&typeof o.metadata=="object"&&(t.metadata=o.metadata),typeof o.temperature=="number"&&(t.temperature=o.temperature),typeof o.top_p=="number"&&(t.top_p=o.top_p),Array.isArray(o.stop_sequences)&&o.stop_sequences.length>0&&(t.stop=o.stop_sequences),Array.isArray(o.tools)&&o.tools.length>0&&(t.tools=o.tools.map(s=>({type:"function",function:{name:s.name,description:s.description||"",parameters:s.input_schema||{type:"object",properties:{}}}}))),o.tool_choice){let s=o.tool_choice;s.type==="auto"?t.tool_choice="auto":s.type==="any"?t.tool_choice="required":s.type==="none"?t.tool_choice="none":s.type==="tool"&&s.name&&(t.tool_choice={type:"function",function:{name:s.name}})}if(o.thinking?.type==="enabled"){let s=Number(o.thinking.budget_tokens||0);s>24576?t.reasoning_effort="max":s>8192?t.reasoning_effort="high":s>2048?t.reasoning_effort="medium":t.reasoning_effort="high"}return t}function bs(o,e){let t=o?.choices?.[0]||{},s=t.message||{},a=[];if(s.reasoning_content&&a.push({type:"thinking",thinking:s.reasoning_content}),s.content&&a.push({type:"text",text:s.content}),Array.isArray(s.tool_calls))for(let l of s.tool_calls)a.push({type:"tool_use",id:l.id||tt("toolu"),name:l.function?.name||"",input:In(l.function?.arguments,{})});a.length===0&&a.push({type:"text",text:""});let n=o?.usage||{},r=n.prompt_tokens_details?.cached_tokens||0;return{id:o?.id?.startsWith("msg_")?o.id:tt("msg"),type:"message",role:"assistant",model:e||o?.model||"workbuddy",content:a,stop_reason:Ha(t.finish_reason),stop_sequence:null,usage:{input_tokens:n.prompt_tokens||0,output_tokens:n.completion_tokens||0,...r>0?{cache_read_input_tokens:r}:{}}}}function se(o,e,t){!o||o.writableEnded||(o.write(`event: ${e}
data: ${JSON.stringify(t)}

`),o.flush&&o.flush())}function ys(o,e){Ie(o);let t=tt("msg"),s=!1,a=0,n=null,r=new Map,l=null,c={promptTokens:0,completionTokens:0,cachedTokens:0},i=!1,d=()=>{s||(s=!0,se(o,"message_start",{type:"message_start",message:{id:t,type:"message",role:"assistant",model:e||"workbuddy",content:[],stop_reason:null,stop_sequence:null,usage:{input_tokens:0,output_tokens:0}}}))},m=()=>{n&&(se(o,"content_block_stop",{type:"content_block_stop",index:n.index}),n=null)},h=()=>{for(let g of r.values())g.closed||(se(o,"content_block_stop",{type:"content_block_stop",index:g.blockIndex}),g.closed=!0)};return d(),{pushOpenAIEvent(g){if(!g||i)return;if(g.error){i=!0,m(),h(),se(o,"error",{type:"error",error:{type:g.error.type||"api_error",message:g.error.message||"Upstream streaming error",...g.error.gateway_hint?{gateway_hint:g.error.gateway_hint}:{}}}),o.writableEnded||o.end();return}if(g.usage){let w=Number(g.usage.prompt_tokens||0),T=Number(g.usage.completion_tokens||0),A=Number(g.usage.prompt_tokens_details?.cached_tokens||0);w>0&&(c.promptTokens=Math.max(c.promptTokens,w)),T>0&&(c.completionTokens=Math.max(c.completionTokens,T)),A>0&&(c.cachedTokens=Math.max(c.cachedTokens,A))}let x=g.choices?.[0];if(!x)return;x.finish_reason&&(l=x.finish_reason);let b=x.delta||{};if(typeof b.reasoning_content=="string"&&b.reasoning_content.length>0){if(n&&n.type!=="thinking"&&m(),!n){let w=a++;n={index:w,type:"thinking"},se(o,"content_block_start",{type:"content_block_start",index:w,content_block:{type:"thinking",thinking:""}})}se(o,"content_block_delta",{type:"content_block_delta",index:n.index,delta:{type:"thinking_delta",thinking:b.reasoning_content}})}if(typeof b.content=="string"&&b.content.length>0){if(n&&n.type!=="text"&&m(),!n){let w=a++;n={index:w,type:"text"},se(o,"content_block_start",{type:"content_block_start",index:w,content_block:{type:"text",text:""}})}se(o,"content_block_delta",{type:"content_block_delta",index:n.index,delta:{type:"text_delta",text:b.content}})}if(Array.isArray(b.tool_calls)){m();for(let w of b.tool_calls){let T=w.index??0,A=r.get(T);if(!A){let $=a++;A={blockIndex:$,id:w.id||tt("toolu"),name:w.function?.name||"",closed:!1},r.set(T,A),se(o,"content_block_start",{type:"content_block_start",index:$,content_block:{type:"tool_use",id:A.id,name:A.name,input:{}}})}let P=w.function?.arguments;typeof P=="string"&&P.length>0&&se(o,"content_block_delta",{type:"content_block_delta",index:A.blockIndex,delta:{type:"input_json_delta",partial_json:P}})}}},finish(g=null){if(i)return;i=!0,m(),h();let x=Ha(l||(r.size>0?"tool_calls":"stop")),b=c.completionTokens||g?.completionTokens||0,w=c.promptTokens||g?.promptTokens||0;se(o,"message_delta",{type:"message_delta",delta:{stop_reason:x,stop_sequence:null},usage:{output_tokens:b,input_tokens:w}}),se(o,"message_stop",{type:"message_stop"}),o.writableEnded||o.end()}}}function Wa(o={}){let e=0,t=0,s=0,a=0,n=l=>{if(!(!l||typeof l!="string"))for(let c=0;c<l.length;c++){let i=l.charCodeAt(c);i>=19968&&i<=40959?e++:t++}},r=l=>{if(typeof l=="string"){n(l);return}if(Array.isArray(l))for(let c of l)c&&(typeof c=="string"?n(c):c.type==="text"||c.type==="thinking"?n(c.text||c.thinking||""):c.type==="tool_use"?(n(c.name||""),n(typeof c.input=="string"?c.input:JSON.stringify(c.input||{}))):c.type==="tool_result"?r(c.content):c.type==="image"?s+=1024:n(JSON.stringify(c)))};if(o.system&&r(o.system),Array.isArray(o.messages))for(let l of o.messages)a+=4,l?.content&&r(l.content);return Array.isArray(o.tools)&&o.tools.length>0&&n(JSON.stringify(o.tools)),Math.max(1,Math.round(e*.7+t*.28+a+s))}var we=O(require("node:crypto"),1),Cn=we.default.randomBytes(16).toString("hex");function ja(o){if(typeof o=="string")return o;if(!Array.isArray(o))return"";let e="";for(let t of o){if(!t)continue;if(typeof t=="string"){e+=t;continue}let s=String(t.type||"").trim();if(!s||s==="text")e+=t.text||"";else{let a=we.default.createHash("sha256").update(JSON.stringify(t)).digest("hex").slice(0,8);e+=`[${s}:${a}]`}}return e}function Fa(o={},e={}){let t=e?.metadata&&typeof e.metadata=="object"?e.metadata:{};return t.conversation_id||t.conversationId||e?.conversation_id||e?.conversationId||o["x-conversation-id"]||o["x-session-id"]||e?.prompt_cache_key||""}function Ga(o={},e={}){let t=e?.metadata&&typeof e.metadata=="object"?e.metadata:{};return t.conversation_id||t.conversationId||e?.conversation_id||e?.conversationId||o["x-conversation-id"]||""}function za(o={}){if((o?.metadata&&typeof o.metadata=="object"?o.metadata:{}).user_id||o?.user_id)return"";let t=Array.isArray(o?.messages)?o.messages:[];for(let s of t){if(s?.role!=="user")continue;let a=ja(s.content).trim();return a?`fb:${we.default.createHash("sha256").update(a).digest("hex").slice(0,32)}`:""}return""}function qa(o={}){let e=Array.isArray(o?.messages)?o.messages:[];for(let t=e.length-1;t>=0;t--){if(e[t]?.role!=="user")continue;let s=ja(e[t].content);return s?`u${t}:${s}`:""}return""}function Ka(o="",e=""){if(!e&&!o)return we.default.randomBytes(16).toString("hex");let t=e&&o?`${o}:${e}`:e||o;return we.default.createHash("sha256").update(`${Cn}|${t}`).digest("hex").slice(0,32)}function Va(o=""){if(!o)return we.default.randomUUID();let e=we.default.createHash("sha256").update(`wb2a-uuid:${o}`).digest();e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=e.toString("hex");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20,32)}`}var Ja=O(require("node:crypto"),1);function re(o="resp"){return`${o}_${Ja.default.randomBytes(10).toString("hex")}`}function En(o){if(typeof o=="string")return o;if(!Array.isArray(o))return o?String(o):"";let e=[];for(let t of o)if(t){if(typeof t=="string")e.push({type:"text",text:t});else if(t.type==="input_text"||t.type==="output_text"||t.type==="text")e.push({type:"text",text:t.text||""});else if(t.type==="input_image"||t.type==="image_url"){let s=typeof t.image_url=="string"?t.image_url:t.image_url?.url;s&&e.push({type:"image_url",image_url:{url:s}})}}return e.length>0&&e.every(t=>t.type==="text")?e.map(t=>t.text).join(`
`):e}function Xa(o={}){let e=[];if(typeof o.instructions=="string"&&o.instructions.trim()&&e.push({role:"system",content:o.instructions}),typeof o.input=="string")e.push({role:"user",content:o.input});else if(Array.isArray(o.input)){for(let s of o.input)if(s)if(s.type==="function_call")e.push({role:"assistant",content:null,tool_calls:[{id:s.call_id||s.id||re("call"),type:"function",function:{name:s.name||"",arguments:typeof s.arguments=="string"?s.arguments:JSON.stringify(s.arguments||{})}}]});else if(s.type==="function_call_output")e.push({role:"tool",tool_call_id:s.call_id||"",content:typeof s.output=="string"?s.output:JSON.stringify(s.output||"")});else{let a=s.role||"user";e.push({role:a,content:En(s.content)})}}let t={model:o.model||"",messages:e,stream:!!o.stream};return o.max_output_tokens&&(t.max_tokens=o.max_output_tokens),typeof o.temperature=="number"&&(t.temperature=o.temperature),typeof o.top_p=="number"&&(t.top_p=o.top_p),o.reasoning?.effort&&(t.reasoning_effort=o.reasoning.effort),o.prompt_cache_key&&(t.prompt_cache_key=o.prompt_cache_key),Array.isArray(o.tools)&&o.tools.length>0&&(t.tools=o.tools.map(s=>s.function?s:{type:"function",function:{name:s.name||"",description:s.description||"",parameters:s.parameters||{type:"object",properties:{}}}})),o.tool_choice&&(t.tool_choice=o.tool_choice),t}function ks(o,e){let s=(o?.choices?.[0]||{}).message||{},a=o?.usage||{},n=[];s.reasoning_content&&n.push({id:re("rs"),type:"reasoning",summary:[{type:"summary_text",text:s.reasoning_content}]});let r=s.content||"";if((r||!Array.isArray(s.tool_calls)||s.tool_calls.length===0)&&n.push({id:re("msg"),type:"message",status:"completed",role:"assistant",content:[{type:"output_text",text:r,annotations:[]}]}),Array.isArray(s.tool_calls))for(let l of s.tool_calls)n.push({id:re("fc"),type:"function_call",status:"completed",call_id:l.id||re("call"),name:l.function?.name||"",arguments:l.function?.arguments||"{}"});return{id:re("resp"),object:"response",created_at:Math.floor(Date.now()/1e3),status:"completed",model:e||o?.model||"workbuddy",output:n,output_text:r,usage:{input_tokens:a.prompt_tokens||0,output_tokens:a.completion_tokens||0,total_tokens:(a.prompt_tokens||0)+(a.completion_tokens||0)}}}function ae(o,e,t){!o||o.writableEnded||(o.write(`event: ${e}
data: ${JSON.stringify({type:e,...t})}

`),o.flush&&o.flush())}function Ya(o,e){Ie(o);let t=re("resp"),s=re("msg"),a=Math.floor(Date.now()/1e3),n=!1,r="",l="",c=new Map,i={promptTokens:0,completionTokens:0},d=!1;ae(o,"response.created",{response:{id:t,object:"response",created_at:a,status:"in_progress",model:e||"workbuddy",output:[]}});let m=()=>{n||(n=!0,ae(o,"response.output_item.added",{output_index:0,item:{id:s,type:"message",status:"in_progress",role:"assistant",content:[]}}),ae(o,"response.content_part.added",{item_id:s,output_index:0,content_index:0,part:{type:"output_text",text:"",annotations:[]}}))};return{pushOpenAIEvent(h){if(!h||d)return;if(h.usage){let x=Number(h.usage.prompt_tokens||0),b=Number(h.usage.completion_tokens||0);x>0&&(i.promptTokens=Math.max(i.promptTokens,x)),b>0&&(i.completionTokens=Math.max(i.completionTokens,b))}let g=h.choices?.[0]?.delta||{};if(typeof g.reasoning_content=="string"&&g.reasoning_content.length>0&&(l+=g.reasoning_content,ae(o,"response.reasoning_summary_text.delta",{delta:g.reasoning_content})),typeof g.content=="string"&&g.content.length>0&&(m(),r+=g.content,ae(o,"response.output_text.delta",{item_id:s,output_index:0,content_index:0,delta:g.content})),Array.isArray(g.tool_calls))for(let x of g.tool_calls){let b=x.index??0,w=c.get(b);w||(w={itemId:re("fc"),callId:x.id||re("call"),name:x.function?.name||"",arguments:"",outputIndex:b+(n?1:0)},c.set(b,w),ae(o,"response.output_item.added",{output_index:w.outputIndex,item:{id:w.itemId,type:"function_call",status:"in_progress",call_id:w.callId,name:w.name,arguments:""}}));let T=x.function?.arguments;typeof T=="string"&&T.length>0&&(w.arguments+=T,ae(o,"response.function_call_arguments.delta",{item_id:w.itemId,output_index:w.outputIndex,delta:T}))}},finish(h=null){if(d)return;d=!0;let g=[];if(l&&g.push({id:re("rs"),type:"reasoning",summary:[{type:"summary_text",text:l}]}),n){ae(o,"response.output_text.done",{item_id:s,output_index:0,content_index:0,text:r});let w={id:s,type:"message",status:"completed",role:"assistant",content:[{type:"output_text",text:r,annotations:[]}]};ae(o,"response.output_item.done",{output_index:0,item:w}),g.push(w)}for(let w of c.values()){let T={id:w.itemId,type:"function_call",status:"completed",call_id:w.callId,name:w.name,arguments:w.arguments||"{}"};ae(o,"response.function_call_arguments.done",{item_id:w.itemId,output_index:w.outputIndex,arguments:T.arguments}),ae(o,"response.output_item.done",{output_index:w.outputIndex,item:T}),g.push(T)}let x=i.promptTokens||h?.promptTokens||0,b=i.completionTokens||h?.completionTokens||0;ae(o,"response.completed",{response:{id:t,object:"response",created_at:a,status:"completed",model:e||"workbuddy",output:g,output_text:r,usage:{input_tokens:x,output_tokens:b,total_tokens:x+b}}}),o.writableEnded||o.end()}}}var me=O(require("node:net"),1),Za=O(require("node:os"),1);function Ce(o=""){let e=String(o||"").trim();if(!e)return"";e.startsWith("[")&&e.includes("]")?e=e.slice(1,e.indexOf("]")):e.includes(":")&&e.includes(".")&&e.lastIndexOf(":")>e.lastIndexOf(".")&&(e=e.slice(0,e.lastIndexOf(":")));let t=e.indexOf("%");if(t!==-1&&(e=e.slice(0,t)),e.toLowerCase().startsWith("::ffff:")){let s=e.slice(7);if(me.default.isIPv4(s))return s}return e}function ws(o){let e=o.split(".").map(Number);return e.length!==4||e.some(t=>!Number.isInteger(t)||t<0||t>255)?null:BigInt(e[0])<<24n|BigInt(e[1])<<16n|BigInt(e[2])<<8n|BigInt(e[3])}function vs(o){let e=o.toLowerCase();if(e.includes("::")){let a=e.split("::");if(a.length>2)return null;let n=a[0]?a[0].split(":"):[],r=a[1]?a[1].split(":"):[],l=8-(n.length+r.length);if(l<0)return null;e=[...n,...Array(l).fill("0"),...r].join(":")}let t=e.split(":");if(t.length!==8)return null;let s=0n;for(let a of t){if(!/^[0-9a-f]{1,4}$/.test(a))return null;s=s<<16n|BigInt(parseInt(a,16))}return s}function xs(o){let e=Ce(o);return e?e==="::1"?!0:me.default.isIPv4(e)?e.startsWith("127."):!1:!1}function Mn(o){let e=Ce(o);if(!e)return!1;if(xs(e))return!0;if(me.default.isIPv4(e)){let[s,a]=e.split(".").map(Number);return s===10||s===172&&a>=16&&a<=31||s===192&&a===168||s===169&&a===254}let t=e.toLowerCase();return t.startsWith("fc")||t.startsWith("fd")||t.startsWith("fe80:")}function Rn(o){let e=String(o||"").trim();if(!e)return null;if(!e.includes("/")){let h=Ce(e),g=me.default.isIP(h);if(!g)throw new Error(`\u65E0\u6548\u7684 IP \u5730\u5740: ${e}`);let x=g===4?32:128,b=g===4?ws(h):vs(h);return{raw:h,version:g,bits:x,netVal:b,mask:(1n<<BigInt(x))-1n}}let[t,s]=e.split("/"),a=Ce(t),n=me.default.isIP(a),r=Number(s),l=n===4?32:128;if(!n||!Number.isInteger(r)||r<0||r>l)throw new Error(`\u65E0\u6548\u7684 CIDR \u7F51\u6BB5: ${e}`);let c=n===4?ws(a):vs(a),i=BigInt(l-r),d=(1n<<BigInt(l))-1n,m=r===0?0n:d^(1n<<i)-1n;return{raw:`${a}/${r}`,version:n,bits:r,netVal:c&m,mask:m}}function _s(o=[]){let e=[];for(let n of o)for(let r of String(n||"").split(/[\s,;]+/)){let l=r.trim();l&&e.push(l)}let t=[],s=[],a=new Set;for(let n of e){let r=Rn(n);r&&!a.has(r.raw)&&(a.add(r.raw),t.push(r),s.push(r.raw))}return{parsed:t,normalized:s}}function st(o){let e=Ce(o?.socket?.remoteAddress||"");if((xs(e)||Mn(e))&&o?.headers){let s=String(o.headers["x-forwarded-for"]||"");if(s)for(let n of s.split(",")){let r=Ce(n);if(me.default.isIP(r))return r}let a=Ce(o.headers["x-real-ip"]||"");if(me.default.isIP(a))return a}return e||"127.0.0.1"}function Ts(){let o=Za.default.networkInterfaces(),e=[],t=[];for(let s of Object.values(o))if(Array.isArray(s))for(let a of s)!a||a.internal||(a.family==="IPv4"?e.push(a.address):a.family==="IPv6"&&!a.address.toLowerCase().startsWith("fe80:")&&t.push(a.address));return[...new Set([...e.sort(),...t.sort()])]}function Qa(o,e={}){let t=st(o);if(!e||!e.enabled)return{allowed:!0,clientIP:t};if(e.allowLocalhost!==!1&&xs(t))return{allowed:!0,clientIP:t};let s=me.default.isIP(t);if(!s)return{allowed:!1,clientIP:t};let a=s===4?ws(t):vs(t);if(a===null)return{allowed:!1,clientIP:t};try{let{parsed:n}=_s(e.allowedIPs||[]);for(let r of n)if(r.version===s&&(a&r.mask)===r.netVal)return{allowed:!0,clientIP:t}}catch{}return{allowed:!1,clientIP:t}}function Fe(o,e,t=25*1024*1024){return new Promise(s=>{let a=[],n=0,r=!1;o.on("data",l=>{if(!r){if(n+=l.length,n>t){r=!0,e.headersSent||(e.writeHead(413,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:{message:"Request entity too large",type:"invalid_request_error"}}))),s(null);return}a.push(l)}}),o.on("end",()=>{if(r)return;let l=Buffer.concat(a).toString("utf8").trim();if(!l){s({});return}try{s(JSON.parse(l))}catch{e.headersSent||(e.writeHead(400,{"Content-Type":"application/json"}),e.end(JSON.stringify({error:{message:"Invalid JSON request body",type:"invalid_request_error"}}))),s(null)}}),o.on("error",()=>{r||(r=!0,s(null))})})}function G(o,e,t){o.writableEnded||(o.headersSent||o.writeHead(e,{"Content-Type":"application/json; charset=utf-8"}),o.end(JSON.stringify(t)))}var It=class{constructor(e,t,s,a={}){this.scheduler=e,this.client=t,this.ledger=s,this.configStore=a.configStore||null,this.preferredPort=a.port??this.configStore?.get("gatewayPort")??7863,this.apiKey=a.apiKey||"",this.modelAliases={...ce,...a.aliases||{}},this.enabledModels=new Set(a.enabledModels||[]),this.dashboardHandler=a.dashboardHandler||null,this.portalHandler=a.portalHandler||null,this.pluginRouterHandler=a.pluginRouterHandler||null,this.userManager=a.userManager||null,this.alertManager=a.alertManager||null,this.discoveredModels=[],this.lastModelFetchAt=0,this.videoTaskAccountMap=new Map,this.server=null,this.actualPort=null,this.startedAt=Date.now()}setDashboardHandler(e){this.dashboardHandler=e}setPortalHandler(e){this.portalHandler=e}setPluginRouterHandler(e){this.pluginRouterHandler=e}_getRuntimeConfig(){let e=this.configStore?this.configStore.getAll():{};return{apiKey:e.apiKey??this.apiKey??"",aliases:{...ce,...this.modelAliases||{},...e.aliases||{}},modelRoutes:e.modelRoutes&&typeof e.modelRoutes=="object"?e.modelRoutes:{},autoFreeEnabled:e.autoFreeEnabled!==!1,portalAsHome:!!e.portalAsHome,enabledModels:Array.isArray(e.enabledModels)?e.enabledModels:[...this.enabledModels],freeModels:Array.isArray(e.freeModels)&&e.freeModels.length>0?e.freeModels:["global:hy4free","cn:hy4free","global:hy3","cn:hy3","global:deepseek-v4.1-flash-sg"],promptMode:e.promptMode||"none",promptText:e.promptText||"",streamIdleTimeoutMs:Math.max(1e4,Number(e.streamIdleTimeoutMs||9e4)),ipWhitelist:e.ipWhitelist||{enabled:!1,allowedIPs:[],allowLocalhost:!0}}}getModelCatalogMap(){let e=new Map;for(let t of this.getMergedModels(!0))e.set(t.id,t),t.bareId&&!e.has(t.bareId)&&e.set(t.bareId,t);return e}_extractProvidedApiKey(e,t){let s=String(e.headers.authorization||""),a=s.toLowerCase().startsWith("bearer ")?s.slice(7).trim():"",n=String(e.headers["x-api-key"]||"").trim(),r=t.searchParams.get("key")||"";return a||n||r||""}checkAuth(e,t){let{apiKey:s}=this._getRuntimeConfig(),a=this._extractProvidedApiKey(e,t);if(this.userManager){let n=this.userManager.verifyApiRequest(a,s);return e._wbUser=n.user||null,n.ok?!0:(e._authError={status:n.status||401,message:n.message},!1)}return s?a===s:!0}getFreeModelCandidates(){let{freeModels:e,modelRoutes:t}=this._getRuntimeConfig(),s=this.scheduler.store.getAll().filter(c=>!this.scheduler.isAccountUnavailable(c)),a=new Set(s.map(c=>c.auth?.realm||"cn")),n=[...Array.isArray(e)?e:[],...Array.isArray(t["auto-free"])?t["auto-free"]:[],...Array.isArray(t.free)?t.free:[],...this.discoveredModels.filter(c=>c.isFree).map(c=>c.id),"global:hy4free","cn:hy4free","cn:deepseek-v4.1-flash","global:deepseek-v4.1-flash-sg","cn:glm-4-flash"],r=[],l=new Set;for(let c of n){let i=String(c||"").trim();!i||l.has(i)||(l.add(i),r.push(i))}return this.sortCandidatesByHealth(r,a)}sortCandidatesByHealth(e=[],t=null){let s=[],a=[],n=[],r=this.scheduler.store.getAll().filter(c=>!this.scheduler.isAccountUnavailable(c)),l=t||new Set(r.map(c=>c.auth?.realm||"cn"));for(let c of e){if(this.scheduler.isRouteModelCooling(c)){n.push(c);continue}let i=c.startsWith("global:")?"global":c.startsWith("cn:")?"cn":null,d=c.replace(/^(cn:|global:|solo:|trae:)/i,"");r.some(h=>{let g=h.auth?.realm||"cn";return i&&g!==i?!1:!this.scheduler.isCoolingDown(h.account.uid,d)})?s.push(c):!i||l.size===0||l.has(i)?a.push(c):n.push(c)}return[...s,...a,...n]}resolveModelCandidates(e){let{aliases:t,modelRoutes:s}=this._getRuntimeConfig(),a=String(e||"auto-free").trim()||"auto-free",n=new Set;for(;t[a]&&!n.has(a);)n.add(a),a=t[a];if(a==="auto-free"||a==="free"){let l=this.getFreeModelCandidates();return l.length>0?l:["global:hy4free","cn:hy4free"]}if(Array.isArray(s[a])&&s[a].length>0)return this.sortCandidatesByHealth([...s[a]]);let r=a.replace(/^(cn:|global:)/i,"").toLowerCase();if(["hy4free","hy4-free","hunyuan-free","hunyuan4-free"].includes(r)){let l=a.startsWith("cn:")?["cn:hy4free","cn:hy4flash-exp1","cn:hy4flash-exp2","cn:hy4flash-exp3","global:hy4free"]:["global:hy4free","cn:hy4free","cn:hy4flash-exp1","cn:hy4flash-exp2"];return this.sortCandidatesByHealth(l)}return[a]}resolveModel(e){return this.resolveModelCandidates(e)[0]||"global:hy4free"}applyPromptMode(e){if(!Array.isArray(e.messages))return;let{promptMode:t,promptText:s}=this._getRuntimeConfig();if((t==="none"||t==="passthrough"||t==="append")&&this.scheduler.degradeGate?.active()){let a=e.messages.filter(n=>n?.role!=="system"&&n?.role!=="developer");e.messages=[{role:"system",content:xt},...a];return}if(!(!t||t==="none"||t==="passthrough"||!s)){if(t==="replace"||t==="custom"){let a=e.messages.filter(n=>n?.role!=="system"&&n?.role!=="developer");e.messages=[{role:"system",content:s},...a];return}if(t==="append"){let a=0;for(;a<e.messages.length;){let r=String(e.messages[a]?.role||"").toLowerCase();if(r!=="system"&&r!=="developer")break;a++}let n=[...e.messages];n.splice(a,0,{role:"system",content:s}),e.messages=n}}}async refreshDiscoveredModels(){let e=this.scheduler.store.getAll().filter(r=>!r.disabled),t=e.find(r=>r.auth?.realm!=="global"),s=e.find(r=>r.auth?.realm==="global"),a=[t,s].filter(Boolean);if(a.length===0)return this.getMergedModels(!0);let n=new Map;for(let r of a)try{let l=await this.client.fetchModels(r);for(let c of l)c?.id&&!n.has(c.id)&&n.set(c.id,c)}catch(l){console.warn(`[loopback] \u52A8\u6001\u62C9\u53D6 ${r.auth?.realm} \u6A21\u578B\u76EE\u5F55\u5931\u8D25:`,l.message)}return n.size>0&&(this.discoveredModels=[...n.values()],this.lastModelFetchAt=Date.now()),this.getMergedModels(!0)}getMergedModels(e=!1){let{enabledModels:t}=this._getRuntimeConfig(),s=t.length>0?new Set(t):null,a=new Map;for(let r of la)a.set(r.id,{...r,source:"static"});for(let r of this.discoveredModels){let l=a.get(r.id);l?a.set(r.id,{...l,name:r.name||l.name,description:r.description||l.description,credits:r.credits||l.credits,rate:r.rate&&r.rate!=="-"?r.rate:l.rate,multiplier:r.multiplier??l.multiplier,isFree:r.isFree??l.isFree,badge:r.badge||l.badge,vendor:r.vendor||l.vendor,tags:r.tags?.length?r.tags:l.tags,supportsImages:r.supportsImages??l.supportsImages,supportsReasoning:r.supportsReasoning??l.supportsReasoning,supportsToolCall:r.supportsToolCall??l.supportsToolCall,onlyReasoning:r.onlyReasoning??l.onlyReasoning,supportedEfforts:r.supportedEfforts?.length?r.supportedEfforts:l.supportedEfforts,defaultEffort:r.defaultEffort||l.defaultEffort,contextWindow:r.contextWindow||l.contextWindow,maxTokens:r.maxTokens||l.maxTokens,source:"upstream"}):a.set(r.id,{...r,badge:r.badge||"\u65B0\u53D1\u73B0",source:"discovered"})}let n=[...a.values()];return!e&&s&&(n=n.filter(r=>s.has(r.id))),n}getModelsList(e=!1,t=!1){let{aliases:s,modelRoutes:a,autoFreeEnabled:n}=this._getRuntimeConfig(),r=(i,d=null)=>{let m=d||i.id,h=i.rate&&i.rate!=="-"&&i.rate!=="\u89C6\u9891"?`[${i.rate} credit] `:"";return{id:m,object:"model",created:1726e6,owned_by:i.source==="discovered"||i.source==="upstream"?"workbuddy-upstream":"workbuddy2api",permission:[],root:i.id,parent:d?i.id:null,name:i.name,description:`${h}${i.description||i.name||""}`.trim(),credits:i.credits||i.rate||"",multiplier:i.multiplier??null,is_free:!!i.isFree,billing_rate:i.rate||"-",badge:i.badge||null,vendor:i.vendor||"",tags:i.tags||[],realm:i.realm,context_length:i.contextWindow,max_output_tokens:i.maxTokens,max_tokens:i.maxTokens,multimodal:i.supportsImages,supports_images:!!i.supportsImages,supports_reasoning:!!i.supportsReasoning,supports_tool_call:!!(i.supportsToolCall??!0),only_reasoning:!!i.onlyReasoning,supported_efforts:i.supportedEfforts||[],reasoning_supported_efforts:i.supportedEfforts||[],reasoning_default_effort:i.defaultEffort||"",source:i.source}},l=this.getMergedModels(e),c=l.map(i=>r(i));if(t){let i=new Set(c.map(d=>d.id));for(let d of l)d.bareId&&!i.has(d.bareId)&&(i.add(d.bareId),c.push(r(d,d.bareId)))}if(n){let d=`[x0.00 credit] \u667A\u80FD\u514D\u8D39\u6A21\u578B\u81EA\u52A8\u8DEF\u7531\u6C60 (\u4F18\u5148: ${this.getFreeModelCandidates().slice(0,5).join(" -> ")})`;for(let m of["auto-free","free"])c.some(h=>h.id===m)||c.push({id:m,name:m==="auto-free"?"Auto Free (\u667A\u80FD\u514D\u8D39\u6A21\u578B\u8DEF\u7531\u6C60)":"Free (\u667A\u80FD\u514D\u8D39\u8DEF\u7531\u522B\u540D)",description:d,object:"model",created:17536e5,owned_by:"system",credits:"x0.00",multiplier:0,is_free:!0,billing_rate:"x0.00",context_length:131072,max_output_tokens:16384,supports_reasoning:!0,supports_tool_call:!0})}for(let[i,d]of Object.entries(a))i==="auto-free"||i==="free"||!Array.isArray(d)||d.length===0||c.some(m=>m.id===i)||c.push({id:i,name:`${i} (\u81EA\u5B9A\u4E49\u6A21\u578B\u6545\u969C\u8F6C\u79FB\u7EC4)`,description:`\u6545\u969C\u8F6C\u79FB\u961F\u5217: ${d.join(" -> ")}`,object:"model",created:17536e5,owned_by:"workbuddy2api-route",supports_tool_call:!0});for(let[i,d]of Object.entries(s))c.some(m=>m.id===i)||c.push({id:i,object:"model",created:1726e6,owned_by:"workbuddy2api-alias",permission:[],root:d,parent:d});return c}getPublicStatusSnapshot(){let e=this.scheduler.store.getAll(),t=this.scheduler.getCountsDetailed(),s=this.scheduler.getCountsDetailed("cn"),a=this.scheduler.getCountsDetailed("global"),n=this.ledger.getStats(this.getModelCatalogMap()),r=0;for(let l of e){let c=typeof l.balance?.remain=="number"?l.balance.remain:typeof l.remainCredits=="number"?l.remainCredits:0;r+=c}return{status:t.healthy>0?"ok":"degraded",service:"dsh-workbuddy2api",version:K,port:this.actualPort||this.preferredPort,total:t.total,healthy:t.healthy,cooling:t.cooling,disabled:t.disabled,manual_disabled:t.manualDisabled,in_flight_full:t.inFlightFull,remain:r,realm_totals:{cn:s,global:a},sticky_sessions:this.scheduler.stickyMap.size,discoveredModels:this.discoveredModels.length,waf_ip_blocked:this.scheduler.wafIPGate.active(),degrade_active:this.scheduler.degradeGate.active(),today:n.today,uptimeSec:Math.floor((Date.now()-this.startedAt)/1e3)}}getStatusPayload(){let e=this.getPublicStatusSnapshot(),t=this.scheduler.store.getAll().map(s=>{let a=this.scheduler.getAccountDiagnostics(s.account.uid);return{uid:s.account.uid,nickname:s.account.nickname,realm:s.auth?.realm||"cn",...a}});return{...e,accounts:t,active:this.scheduler.store.activeUid}}async start(){return this.server=eo.default.createServer(async(e,t)=>{if(t.setHeader("Access-Control-Allow-Origin","*"),t.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS"),t.setHeader("Access-Control-Allow-Headers","*"),e.method==="OPTIONS"){t.writeHead(200),t.end();return}let s=new URL(e.url,`http://${e.headers.host||"127.0.0.1"}`),a=s.pathname;try{let n=this._getRuntimeConfig(),r=Qa(e,n.ipWhitelist);if(!r.allowed){G(t,403,{error:{message:`Access denied by IP whitelist (client: ${r.clientIP})`,type:"access_denied",code:"ip_not_allowed"}});return}if(e.method==="GET"&&(a==="/ui/public/status"||a==="/plugins/dsh-workbuddy2api/public/status")){G(t,200,{ok:!0,...this.getPublicStatusSnapshot(),models:this.getModelsList(!1,!1).slice(0,80)});return}if(e.method==="GET"&&(a==="/portal"||a==="/"&&n.portalAsHome)&&typeof this.portalHandler=="function"&&s.searchParams.get("format")!=="json"&&await this.portalHandler(e,t,a,s)||e.method==="GET"&&(a==="/"||a==="/console"||a==="/dashboard")&&typeof this.dashboardHandler=="function"&&s.searchParams.get("format")!=="json"&&await this.dashboardHandler(e,t,a,s)||a.startsWith("/plugins/dsh-workbuddy2api/")&&typeof this.pluginRouterHandler=="function"&&await this.pluginRouterHandler(e,t,a,s))return;if(e.method==="GET"&&(a==="/health"||a==="/")){let i=this.scheduler.store.getAll();G(t,200,{status:"ok",service:"dsh-workbuddy2api",version:K,port:this.actualPort||this.preferredPort,accounts:i.length,enabledAccounts:i.filter(d=>!this.scheduler.isAccountUnavailable(d)).length,active:this.scheduler.store.activeUid,discoveredModels:this.discoveredModels.length,uptimeSec:Math.floor((Date.now()-this.startedAt)/1e3)});return}if(e.method==="GET"&&a==="/healthz"){let i=this.getPublicStatusSnapshot();t.setHeader("X-Service","dsh-workbuddy2api"),G(t,i.healthy>0?200:503,{healthy:i.healthy,total:i.total,service:"dsh-workbuddy2api",realm_servable:{cn:i.realm_totals.cn.healthy>0,global:i.realm_totals.global.healthy>0}});return}if(!this.checkAuth(e,s)){let i=e._authError||{status:401,message:"Invalid or missing gateway API key"};G(t,i.status,{error:{message:i.message,type:i.status===429?"rate_limit_error":"authentication_error"}});return}if(e.method==="GET"&&a==="/status"){G(t,200,this.getStatusPayload());return}let l=a.match(/^\/admin\/accounts\/([^/]+)\/(disable|enable|revive)$/);if(e.method==="POST"&&l){let i=decodeURIComponent(l[1]),d=l[2],m=await Fe(e,t)||{},h=null;if(d==="disable"?h=this.scheduler.store.setManualDisabled(i,!0,m.reason||"manual"):d==="enable"?h=this.scheduler.store.setManualDisabled(i,!1,""):(h=this.scheduler.store.reviveAccount(i),this.scheduler.clearCooldown(i)),!h||!h.found){G(t,404,{error:{message:`account not found: ${i}`,type:"not_found"}});return}G(t,200,{uid:i,manual_disabled:!!h.acc.manualDisabled,manual_reason:h.acc.manualDisabledReason||"",disabled:!!h.acc.disabled,changed:!!h.changed});return}if(e.method==="GET"&&a==="/v1/stats"){let i=this.scheduler.store.getAll(),d=s.searchParams.get("date")||"";G(t,200,{ok:!0,...this.ledger.getStats(this.getModelCatalogMap(),d),discoveredModels:this.discoveredModels.length,pool:{total:i.length,enabled:i.filter(m=>!this.scheduler.isAccountUnavailable(m)).length}});return}if(e.method==="POST"&&a==="/v1/stats/reset"){this.ledger.reset(),G(t,200,{ok:!0,message:"\u7528\u91CF\u8D26\u672C\u5DF2\u6E05\u7A7A"});return}if(e.method==="GET"&&(a==="/v1/models"||a==="/models")){let i=s.searchParams.get("all")==="1",d=String(e.headers["user-agent"]||"").toLowerCase(),m=s.searchParams.get("bare")==="true"||e.headers["x-include-bare-models"]==="true"||/new-api|one-api|openai|langchain/.test(d);G(t,200,{object:"list",data:this.getModelsList(i,m)});return}if(e.method==="POST"&&(a==="/v1/chat/completions"||a==="/chat/completions")){let i=await Fe(e,t);if(!i)return;await this.executeChatPipeline(e,t,i,"chat",i.model);return}if(e.method==="POST"&&(a==="/v1/messages"||a==="/messages")){let i=await Fe(e,t);if(!i)return;let d=Ua(i);await this.executeChatPipeline(e,t,d,"anthropic",i.model);return}if(e.method==="POST"&&(a==="/v1/messages/count_tokens"||a==="/messages/count_tokens")){let i=await Fe(e,t);if(!i)return;G(t,200,{input_tokens:Wa(i)});return}if(e.method==="POST"&&(a==="/v1/responses"||a==="/responses")){let i=await Fe(e,t);if(!i)return;let d=Xa(i);await this.executeChatPipeline(e,t,d,"responses",i.model);return}if(e.method==="POST"&&(a==="/v1/videos/generations"||a==="/v2/videos/generations")){await this.handleVideoCreate(e,t);return}if(e.method==="GET"&&(a==="/v1/videos/tasks"||a==="/v2/videos/tasks")){G(t,200,{object:"list",data:[...this.videoTaskAccountMap.entries()].map(([i,d])=>({id:i,...d}))});return}let c=a.match(/^\/v[12]\/videos\/(?:tasks|generations)\/([^/]+)$/);if(e.method==="GET"&&c){await this.handleVideoQuery(t,decodeURIComponent(c[1]));return}G(t,404,{error:{message:"Not Found",type:"invalid_request_error"}})}catch(n){t.headersSent||G(t,500,{error:{message:n.message,type:"api_error"}})}}),new Promise(e=>{let t=!1;this.server.once("listening",()=>{this.actualPort=this.server.address().port,console.log(`[loopback] \u{1F680} \u591A\u534F\u8BAE\u517C\u5BB9\u7F51\u5173\u4E0E\u63A7\u5236\u53F0\u5DF2\u5C31\u7EEA: http://127.0.0.1:${this.actualPort}/`),e(this.actualPort)}),this.server.on("error",s=>{if(s.code==="EADDRINUSE"){if(!t&&this.preferredPort!==0){t=!0,setTimeout(()=>{this.server?.listen(this.preferredPort,"0.0.0.0")},200);return}console.warn(`[loopback] \u7AEF\u53E3 ${this.preferredPort} \u88AB\u5360\u7528\uFF0C\u81EA\u52A8\u5206\u914D\u53EF\u7528\u7AEF\u53E3...`),this.server?.listen(0,"0.0.0.0")}}),this.server.listen(this.preferredPort,"0.0.0.0")})}_handleObservedUsageCost(e,t,s,a,n){if(!e||!a)return;let r=a.quota;if(!!!s?.isFree)return;let c=!!(a.hasCredit&&a.credit>0),i=!!(r&&Number(r.percent||0)>=100);if(!c&&!i)return;let d=xa(r),m=String(t||"").replace(/^(cn:|global:|solo:|trae:)/i,""),h=`free quota exhausted (credit=${Number(a.credit||0).toFixed(2)}, quota=${Number(r?.percent||0)}%)`,g=new Set([m]);if(Array.isArray(r?.shared_models))for(let x of r.shared_models){let b=String(x||"").trim();b&&g.add(b)}for(let x of g)this.scheduler.cooldownFreeQuotaModel(e,d,x,h);n&&this.scheduler.stickyMap.delete(`${n}::${m}`)}async executeChatPipeline(e,t,s,a="chat",n=""){let r=n||s.model||"auto-free",l=this.resolveModelCandidates(r),c={...s},i=wa(c),d=!!c.stream,m=`chatcmpl-${Date.now()}`,h=this._getRuntimeConfig(),x=Fa(e.headers,c)||za(c)||"",b=qa(c),w=e.headers["x-conversation-request-id"]||Ka(x,b),A={conversationId:Ga(e.headers,c)||(x?Va(x):""),conversationRequestId:w,traceId:e.headers["x-trace-id"]},P=Date.now(),$=this.getModelCatalogMap(),R=e._wbUser||null,L=l[0]||"global:hy4free",y=$.get(L)||$.get(L.replace(/^(cn:|global:)/i,"")),p=y?.rate||"-",u=null,f={...c},k=0;try{let v=null;for(let W=0;W<l.length;W++){let F=l[W];if(W<l.length-1&&this.scheduler.isRouteModelCooling(F))continue;L=F,y=$.get(L)||$.get(L.replace(/^(cn:|global:)/i,"")),p=y?.rate||"-",f={...c,model:L},this.applyPromptMode(f);let H=!1;for(;!H;)try{u=await this.scheduler.executeWithFailover(L,async j=>{let ee=new AbortController;return{...await this.client.chatStream(j,f,ee.signal,A),abortController:ee}},{sessionKey:x}),H=!0}catch(j){if(j.kind===C.PROMPT_TOO_LONG&&k<2){let ee=Ia(f);if(ee.pruned){k+=1,f=ee.payload,console.warn(`[loopback] 11115 \u4E0A\u4E0B\u6587\u8D85\u9650\uFF0C\u81EA\u52A8\u88C1\u526A\u6700\u65E9\u5BF9\u8BDD\u8F6E\u6B21\u62A2\u6551\u91CD\u8BD5 (${k}/2)...`);continue}}if(v=j,j.kind===C.CONTENT_BLOCKED||j.kind===C.IMAGE_INVALID||j.kind===C.PROMPT_TOO_LONG||j.kind===C.BAD_PARAMS||j.code==="waf_ip_blocked")throw j;W<l.length-1&&(this.scheduler.tripRouteModel(F,6e4),console.warn(`[failover] \u5019\u9009\u6A21\u578B ${F} \u4E0D\u53EF\u7528 (${j.message})\uFF0C\u81EA\u52A8\u5207\u6362\u81F3 ${l[W+1]}`));break}if(u)break}if(!u)throw v||new Error("all accounts and candidate models are unavailable, please retry later");let S=u.account?.account?.uid||"",I=u.account?.account?.nickname||S.slice(0,8)||"-",M=u.account?.auth?.realm||"-";if(this.scheduler.beginInFlight(m,{uid:S,nickname:I,realm:M,model:L,rate:p,mode:d?"stream":"sync",protocol:a}),u.isVideo){try{if(d)if(a==="anthropic"){let F=ys(t,r);await u.executeVideo(H=>{F.pushOpenAIEvent({choices:[{delta:{content:H}}]})}),F.finish({promptTokens:20,completionTokens:60})}else Ie(t),await u.executeVideo(F=>{t.write(gs(m,r,F))}),t.write(gs(m,r,"","stop")),t.write(`data: [DONE]

`),t.end();else{let F="";await u.executeVideo(j=>{F+=j});let H={id:m,object:"chat.completion",created:Math.floor(Date.now()/1e3),model:r,choices:[{index:0,message:{role:"assistant",content:F},finish_reason:"stop"}],usage:{prompt_tokens:20,completion_tokens:Math.max(1,Math.ceil(F.length/4))}};a==="anthropic"?G(t,200,bs(H,r)):a==="responses"?G(t,200,ks(H,r)):G(t,200,H)}let W=Date.now()-P;this.ledger.record(L,20,60,!1,{durationMs:W,success:!0}),this.ledger.addRequestLog({model:L,rate:p,mode:d?"stream":"sync",protocol:a,status:200,uid:S,account:I,realm:M,ttfbMs:0,durationMs:W,promptTokens:20,completionTokens:60,hasCredit:!1})}finally{this.scheduler.endInFlight(m),u.release()}return}let E=u.bodyStream.getReader(),U=new TextDecoder,z=!1,X=null,ie=h.streamIdleTimeoutMs,V=()=>{X&&clearTimeout(X),ie>0&&(X=setTimeout(()=>{z=!0,u.abortController?.abort?.(),E.cancel().catch(()=>{})},ie),X.unref&&X.unref())},ve=()=>{t.writableEnded||(z=!0,u.abortController?.abort?.(),E.cancel().catch(()=>{}))};t.on("close",ve);let qe={model:L.replace(/^(cn:|global:)/i,""),hasImage:i,modelInCatalog:!!y,modelSupportsImages:!!(y?.supportsImages??!0)};if(d){let W=null;a==="anthropic"?W=ys(t,r):a==="responses"?W=Ya(t,r):Ie(t);let F=fs(t,{forwardRaw:a==="chat",startTime:P,transformErrorFrame:H=>va(H,qe,(j,ee)=>this.client.classifyError(j,ee)),onEvent:H=>{W&&H&&W.pushOpenAIEvent(H)}});try{for(V();!z;){let{done:j,value:ee}=await E.read();if(j)break;V(),F.push(U.decode(ee,{stream:!0}))}let H=U.decode();H&&F.push(H),F.finish(),W?W.finish(F.getUsage()):t.writableEnded||t.end()}finally{X&&clearTimeout(X),F.stop(),t.off("close",ve),this.scheduler.endInFlight(m),u.release();let H=F.getUsage();this.userManager&&R&&H.hasCredit&&H.credit>0&&this.userManager.deductUserCredit(R,H.credit),this._handleObservedUsageCost(S,L,y,H,x);let j=Date.now()-P;this.ledger.record(L,H.promptTokens,H.completionTokens,H.cacheHit,{...H,durationMs:j,success:!z}),this.ledger.addRequestLog({model:L,rate:p,mode:"stream",protocol:a,status:200,uid:S,account:I,realm:M,...H,durationMs:j})}return}let de="",Ke="",ge="stop",it=new Map,Ve=fs(null,{forwardRaw:!1,heartbeatMs:0,startTime:P,onEvent:W=>{let F=W?.choices?.[0];if(!F)return;let H=F.delta||{};if(typeof H.content=="string"&&(de+=H.content),typeof H.reasoning_content=="string"&&(Ke+=H.reasoning_content),Array.isArray(H.tool_calls))for(let j of H.tool_calls){if(!j)continue;let ee=typeof j.index=="number"?j.index:it.size,Xe=it.get(ee)||{id:"",type:"function",function:{name:"",arguments:""}};j.id&&(Xe.id=j.id),j.type&&(Xe.type=j.type),j.function?.name&&(Xe.function.name+=j.function.name),typeof j.function?.arguments=="string"&&(Xe.function.arguments+=j.function.arguments),it.set(ee,Xe)}F.finish_reason&&(ge=F.finish_reason)}});try{for(V();!z;){let{done:F,value:H}=await E.read();if(F)break;V(),Ve.push(U.decode(H,{stream:!0}))}let W=U.decode();W&&Ve.push(W),Ve.finish()}finally{X&&clearTimeout(X),Ve.stop(),t.off("close",ve),this.scheduler.endInFlight(m),u.release()}let Je=[...it.entries()].sort((W,F)=>W[0]-F[0]).map(([,W])=>({id:W.id||`call_${Date.now()}`,type:W.type||"function",function:{name:W.function.name,arguments:W.function.arguments||""}}));Je=Sa(Je).map(W=>({...W,function:{...W.function,arguments:W.function.arguments||"{}"}}));let Pt={role:"assistant",content:Je.length>0&&!de?null:de};Ke&&(Pt.reasoning_content=Ke),Je.length>0&&(Pt.tool_calls=Je,ge==="stop"&&(ge="tool_calls"));let Z=Ve.getUsage();this.userManager&&R&&Z.hasCredit&&Z.credit>0&&this.userManager.deductUserCredit(R,Z.credit),this._handleObservedUsageCost(S,L,y,Z,x);let Ns=Date.now()-P,Ot={id:m,object:"chat.completion",created:Math.floor(Date.now()/1e3),model:r,choices:[{index:0,message:Pt,finish_reason:ge}],usage:{prompt_tokens:Z.promptTokens,completion_tokens:Z.completionTokens,total_tokens:Z.promptTokens+Z.completionTokens,...Z.hasCredit?{credit:Z.credit,cost_credits:Z.credit}:{}}};a==="anthropic"?G(t,200,bs(Ot,r)):a==="responses"?G(t,200,ks(Ot,r)):G(t,200,Ot),this.ledger.record(L,Z.promptTokens,Z.completionTokens,Z.cacheHit,{...Z,durationMs:Ns,success:!0}),this.ledger.addRequestLog({model:L,rate:p,mode:"sync",protocol:a,status:200,uid:S,account:I,realm:M,...Z,durationMs:Ns})}catch(v){this.scheduler.endInFlight(m);let S=v.status&&v.status>=400&&v.status<600?v.status:v.kind===C.SOFT_RATE?429:503;v.retryAfterSec>0&&!t.headersSent&&t.setHeader("Retry-After",String(v.retryAfterSec));let I=v.kind||C.NONE,M=ns(I,v.message,{model:L.replace(/^(cn:|global:)/i,""),hasImage:i,modelInCatalog:!!y,modelSupportsImages:!!(y?.supportsImages??!0)})||ya,E=Date.now()-P;this.ledger.record(L,0,0,!1,{durationMs:E,success:!1}),this.ledger.addRequestLog({model:L,rate:p,mode:d?"stream":"sync",protocol:a,status:S,uid:"-",account:"-",realm:"-",durationMs:E,error:v.message}),t.headersSent||(a==="anthropic"?G(t,S,{type:"error",error:{type:v.code||"api_error",message:v.message,gateway_hint:M}}):G(t,S,{error:{message:v.message,type:v.code||"api_error",code:v.code||(S===429?"rate_limit_exceeded":"no_healthy_account"),gateway_hint:M}}))}}async handleVideoCreate(e,t){let s=await Fe(e,t);if(!s)return;let a=String(s.model||"kling-video-v3"),n=this.resolveModel(a),r=n.includes("minimax")||n.includes("hailuo")||n.includes("\u6D77\u87BA")?"minimax-video-h3":"kling-video-v3",l=await this.scheduler.executeWithFailover(n,async c=>{let i=this.client.getChatBase(c),d=await fetch(`${i}${Re}`,{method:"POST",headers:this.client.buildHeaders(c,!1),body:JSON.stringify({...s,model:r}),signal:AbortSignal.timeout(3e4)}),m=await d.json().catch(()=>({}));return!d.ok||m.code!==0&&m.code!==200?{ok:!1,status:d.status,kind:this.client.classifyError(d.status,m),message:m.msg||m.message||`\u89C6\u9891\u4EFB\u52A1\u521B\u5EFA\u5931\u8D25 (${d.status})`}:{ok:!0,data:m}});try{let c=l.data?.data?.id||l.data?.id;if(c){if(this.videoTaskAccountMap.size>200){let i=this.videoTaskAccountMap.keys().next().value;this.videoTaskAccountMap.delete(i)}this.videoTaskAccountMap.set(c,{uid:l.account.account.uid,model:r,createdAt:Date.now(),status:l.data?.data?.status||l.data?.status||"queued"})}G(t,200,{id:c,object:"video.generation",model:r,...l.data?.data||l.data||{}})}finally{l.release()}}async handleVideoQuery(e,t){let s=this.videoTaskAccountMap.get(t),a=s?this.scheduler.store.get(s.uid):null,n=async l=>{let c=this.client.getChatBase(l),i=await fetch(`${c}${Re}/${encodeURIComponent(t)}`,{headers:this.client.buildHeaders(l,!1),signal:AbortSignal.timeout(15e3)}),d=await i.json().catch(()=>({}));return i.ok?{ok:!0,data:d}:{ok:!1,status:i.status,kind:this.client.classifyError(i.status,d),message:d.msg||`\u67E5\u8BE2\u89C6\u9891\u4EFB\u52A1\u5931\u8D25 (${i.status})`}};if(a){let l=await n(a);if(l.ok){s&&(s.status=l.data?.data?.status||l.data?.status||s.status),G(e,200,l.data?.data||l.data);return}}let r=await this.scheduler.executeWithFailover("kling-video-v3",n);try{G(e,200,r.data?.data||r.data)}finally{r.release()}}stop(){if(this.server){try{this.server.closeAllConnections?.()}catch{}try{this.server.closeIdleConnections?.()}catch{}try{this.server.close()}catch{}this.server=null}}};function As(o=""){return o.length<=20?o:`${o.slice(0,15)}...${o.slice(-5)}`}function Pn(o,e,t="alert"){let s=String(o||"").toLowerCase();return s.includes("feishu.cn")||s.includes("larksuite.com")?{msg_type:"text",content:{text:e}}:s.includes("qyapi.weixin.qq.com")||s.includes("dingtalk.com")?{msgtype:"text",text:{content:e}}:s.includes("api.telegram.org")?{text:e}:s.includes("discord.com/api/webhooks")||s.includes("discordapp.com/api/webhooks")?{content:e}:{event:t,text:e,timestamp:Math.floor(Date.now()/1e3)}}var Ct=class{constructor(e={}){this.configStore=e.configStore||null,this.fetchFn=e.fetchFn||fetch,this.lastAlertAt=new Map,this.history=[]}getConfig(){let t=(this.configStore?this.configStore.getAll():{}).alerts||{};return{enabled:!!t.enabled,webhooks:Array.isArray(t.webhooks)?t.webhooks.filter(Boolean):[],events:Array.isArray(t.events)&&t.events.length>0?t.events:["ban","401","cooling","low_credit"],minCredit:Math.max(0,Number(t.minCredit??50)||0)}}isEventAllowed(e){let t=this.getConfig();return!t.enabled||t.webhooks.length===0?!1:t.events.length===0?!0:t.events.some(s=>String(s).toLowerCase()===String(e).toLowerCase())}_shouldThrottle(e,t){let s=Date.now(),a=this.lastAlertAt.get(e)||0;if(s-a<t)return!0;if(this.lastAlertAt.set(e,s),this.lastAlertAt.size>500){let n=this.lastAlertAt.keys().next().value;this.lastAlertAt.delete(n)}return!1}_recordHistory(e,t,s){this.history.unshift({id:`alt-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,event:e,summary:t.slice(0,200),time:new Date().toISOString(),results:s}),this.history.length>30&&(this.history.length=30)}async _sendSingleWebhook(e,t,s){let a=Pn(e,t,s),n=await this.fetchFn(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a),signal:AbortSignal.timeout(8e3)});if(!n.ok)throw new Error(`HTTP ${n.status}`);return!0}async dispatch(e,t="alert"){let{webhooks:s}=this.getConfig();if(s.length===0)return{ok:!1,results:[{target:"-",ok:!1,error:"\u672A\u914D\u7F6E\u4EFB\u4F55 Webhook \u5730\u5740"}]};let a=[];for(let n of s)try{await this._sendSingleWebhook(n,e,t),a.push({target:As(n),ok:!0})}catch(r){console.warn(`[alert] webhook \u53D1\u9001\u5931\u8D25 (${As(n)}): ${r.message}`),a.push({target:As(n),ok:!1,error:r.message})}return this._recordHistory(t,e,a),{ok:a.some(n=>n.ok),results:a}}notifyBan(e,t,s){if(!this.isEventAllowed("ban")||this._shouldThrottle(`ban:${e}`,900*1e3))return;let a=`\u{1F6A8}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u5F02\u5E38\u5C01\u7981/\u505C\u7528
\u2022 \u8D26\u53F7: ${t||"-"} (${e})
\u2022 \u539F\u56E0: ${s}
\u2022 \u65F6\u95F4: ${new Date().toLocaleString("zh-CN",{hour12:!1})}
\u2022 \u5EFA\u8BAE: \u8BF7\u5728\u63A7\u5236\u53F0\u68C0\u67E5\u8D26\u53F7\u72B6\u6001\u6216\u91CD\u65B0\u6388\u6743 Token\u3002`;this.dispatch(a,"ban").catch(()=>{})}notifyAuthFailed(e,t,s){if(!this.isEventAllowed("401")||this._shouldThrottle(`401:${e}`,900*1e3))return;let a=`\u26A0\uFE0F\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u51ED\u8BC1\u5931\u6548 (401/12153)
\u2022 \u8D26\u53F7: ${t||"-"} (${e})
\u2022 \u9519\u8BEF: ${String(s||"").slice(0,180)}
\u2022 \u65F6\u95F4: ${new Date().toLocaleString("zh-CN",{hour12:!1})}`;this.dispatch(a,"401").catch(()=>{})}notifyAllCooling(e,t){if(!this.isEventAllowed("cooling")||this._shouldThrottle(`cooling:${e||"all"}:${t}`,600*1e3))return;let s=`\u{1F525}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u5168\u6C60\u51B7\u5374/\u65E0\u53EF\u7528\u5065\u5EB7\u8D26\u53F7
\u2022 \u57DF: ${e||"all"}
\u2022 \u6A21\u578B: ${t}
\u2022 \u65F6\u95F4: ${new Date().toLocaleString("zh-CN",{hour12:!1})}
\u2022 \u5EFA\u8BAE: \u8BF7\u8865\u5145\u540C\u57DF\u8D26\u53F7\u6216\u5F00\u542F auto-free \u591A\u6A21\u578B\u515C\u5E95\u3002`;this.dispatch(s,"cooling").catch(()=>{})}notifyLowCredit(e,t,s){if(!this.isEventAllowed("low_credit"))return;let{minCredit:a}=this.getConfig();if(s>=a||this._shouldThrottle(`low_credit:${e}`,3600*1e3))return;let n=`\u{1F4B0}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u79EF\u5206\u4F4E\u4E8E\u9884\u8B66\u9608\u503C
\u2022 \u8D26\u53F7: ${t||"-"} (${e})
\u2022 \u5269\u4F59\u79EF\u5206: ${s} (< \u9608\u503C ${a})
\u2022 \u65F6\u95F4: ${new Date().toLocaleString("zh-CN",{hour12:!1})}`;this.dispatch(n,"low_credit").catch(()=>{})}async sendTestAlert(){let e=`\u{1F514}\u3010DSH-WorkBuddy2API \u6D4B\u8BD5\u901A\u77E5\u3011
\u2022 \u72B6\u6001: Webhook \u544A\u8B66\u901A\u9053\u8FDE\u901A\u6B63\u5E38
\u2022 \u65F6\u95F4: ${new Date().toLocaleString("zh-CN",{hour12:!1})}`;return this.dispatch(e,"test")}};var ze=O(require("node:fs"),1),Is=O(require("node:path"),1),so=O(require("node:os"),1),Cs=O(require("node:crypto"),1),Ss="wb2a_session",On=10080*60*1e3;function he(o=16){return Cs.default.randomBytes(o).toString("hex")}function Et(){return`sk-wb2a-${he(20)}`}function at(o,e){return Cs.default.createHash("sha256").update(`${e}:${o}`).digest("hex")}function Ge(){return new Date(Date.now()+8*3600*1e3).toISOString().slice(0,10)}function to(o){let e=String(o?.headers?.cookie||""),t={};for(let s of e.split(";")){let a=s.indexOf("=");if(a===-1)continue;let n=s.slice(0,a).trim(),r=s.slice(a+1).trim();if(n)try{t[n]=decodeURIComponent(r)}catch{t[n]=r}}return t}var Ee=class{constructor(e={}){this.dshHome=e.dshHome||process.env.DSH_HOME||Is.default.join(so.default.homedir(),".dsh"),this.configStore=e.configStore||null,this.filePath=Is.default.join(this.dshHome,".workbuddy2api-users.json"),this.users=new Map,this.byApiKey=new Map,this.sessions=new Map,this.rpmBuckets=new Map,this.loginFailures=new Map,this._load()}_load(){try{if(ze.default.existsSync(this.filePath)){let e=JSON.parse(ze.default.readFileSync(this.filePath,"utf8")),t=Array.isArray(e?.users)?e.users:[];for(let s of t){if(!s?.username)continue;let a=this._normalizeUser(s);this.users.set(a.username,a),a.apiKey&&this.byApiKey.set(a.apiKey,a)}}}catch{}this.users.has("admin")||this._initDefaultAdmin()}_normalizeUser(e){return{id:e.id||`u_${he(6)}`,username:String(e.username).trim().toLowerCase(),passwordHash:e.passwordHash||"",salt:e.salt||he(16),role:e.role==="admin"?"admin":"user",apiKey:e.apiKey||Et(),disabled:!!e.disabled,createdAt:e.createdAt||new Date().toISOString(),dailyCreditLimit:Math.max(0,Number(e.dailyCreditLimit||0)||0),usedCreditToday:Math.max(0,Number(e.usedCreditToday||0)||0),lastCreditDay:e.lastCreditDay||Ge(),rpm:Math.max(0,Number(e.rpm||0)||0)}}_initDefaultAdmin(){let e=this.configStore?this.configStore.getAll():{},t=he(16),s=e.webPassword||"",a={id:"u_admin",username:"admin",passwordHash:s?at(s,t):"",salt:t,role:"admin",apiKey:e.apiKey||Et(),disabled:!1,createdAt:new Date().toISOString(),dailyCreditLimit:0,usedCreditToday:0,lastCreditDay:Ge(),rpm:0};this.users.set("admin",a),this.byApiKey.set(a.apiKey,a),this._save()}_save(){try{ze.default.existsSync(this.dshHome)||ze.default.mkdirSync(this.dshHome,{recursive:!0});let e={users:[...this.users.values()]};ze.default.writeFileSync(this.filePath,JSON.stringify(e,null,2),{mode:384})}catch{}}hasWebPassword(){let e=this.configStore?.get("webPassword"),t=this.users.get("admin");return!!(e&&e.length>0||t?.passwordHash)}setAdminPassword(e=""){let t=this.users.get("admin")||this._normalizeUser({username:"admin",role:"admin",id:"u_admin"});return e?(t.salt=he(16),t.passwordHash=at(e,t.salt)):t.passwordHash="",this.users.set("admin",t),this.configStore&&this.configStore.update({webPassword:e}),this._save(),{hasPassword:!!e}}listUsers(){let e=Ge();return[...this.users.values()].map(t=>{let s=t.lastCreditDay===e?t.usedCreditToday:0;return{id:t.id,username:t.username,role:t.role,apiKey:t.apiKey,disabled:t.disabled,createdAt:t.createdAt,dailyCreditLimit:t.dailyCreditLimit,usedCreditToday:Number(s.toFixed(2)),rpm:t.rpm}})}authenticate(e,t,s="127.0.0.1"){let a=Date.now(),n=this.loginFailures.get(s);if(n&&n.lockedUntil>a){let h=Math.ceil((n.lockedUntil-a)/1e3);throw new Error(`\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7 ${h} \u79D2\u540E\u518D\u8BD5`)}let r=String(e||"").trim().toLowerCase(),l=this.users.get(r);if(!l)throw this._recordLoginFail(s),new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");if(l.disabled)throw new Error("\u8D26\u53F7\u5DF2\u88AB\u7BA1\u7406\u5458\u7981\u7528");let c=this.configStore?.get("webPassword")||"",d=r==="admin"&&!l.passwordHash&&!c;if(d||(r==="admin"&&c&&t===c?d=!0:l.passwordHash&&(d=at(t||"",l.salt)===l.passwordHash)),!d)throw this._recordLoginFail(s),new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");this.loginFailures.delete(s);let m=he(24);if(this.sessions.set(m,{username:l.username,userId:l.id,role:l.role,expiresAt:a+On}),this.sessions.size>1e3)for(let[h,g]of this.sessions.entries())g.expiresAt<a&&this.sessions.delete(h);return{token:m,user:this._sanitizeUser(l)}}_recordLoginFail(e){let t=Date.now(),s=this.loginFailures.get(e)||{count:0,lockedUntil:0};s.count+=1,s.count>=6&&(s.lockedUntil=t+300*1e3,s.count=0),this.loginFailures.set(e,s)}_sanitizeUser(e){let t=Ge();return{id:e.id,username:e.username,role:e.role,apiKey:e.apiKey,disabled:e.disabled,dailyCreditLimit:e.dailyCreditLimit,usedCreditToday:e.lastCreditDay===t?e.usedCreditToday:0,rpm:e.rpm}}getSessionUser(e){let s=to(e)[Ss]||e?.headers?.["x-session-token"]||"";if(!s)return null;let a=this.sessions.get(s);if(!a)return null;if(a.expiresAt<Date.now())return this.sessions.delete(s),null;let n=this.users.get(a.username);return!n||n.disabled?null:this._sanitizeUser(n)}logout(e){let s=to(e)[Ss]||e?.headers?.["x-session-token"]||"";s&&this.sessions.delete(s)}checkWebAuth(e){if(!this.hasWebPassword()){let s=this.users.get("admin");return{ok:!0,user:s?this._sanitizeUser(s):{id:"u_admin",username:"admin",role:"admin"}}}let t=this.getSessionUser(e);return t?{ok:!0,user:t}:{ok:!1,user:null}}createUser({username:e,password:t,role:s="user",dailyCreditLimit:a=0,rpm:n=0}){let r=String(e||"").trim().toLowerCase();if(!r||r.length<2||!/^[a-z0-9_.-]+$/.test(r))throw new Error("\u7528\u6237\u540D\u683C\u5F0F\u975E\u6CD5 (\u4EC5\u9650 2 \u4F4D\u4EE5\u4E0A\u5B57\u6BCD/\u6570\u5B57/._-)");if(this.users.has(r))throw new Error(`\u7528\u6237\u540D ${r} \u5DF2\u5B58\u5728`);if(!t||String(t).length<4)throw new Error("\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11 4 \u4F4D");let l=he(16),c=this._normalizeUser({id:`u_${he(6)}`,username:r,passwordHash:at(t,l),salt:l,role:s==="admin"?"admin":"user",apiKey:Et(),dailyCreditLimit:a,rpm:n});return this.users.set(r,c),this.byApiKey.set(c.apiKey,c),this._save(),this._sanitizeUser(c)}toggleUser(e,t){let s=this.users.get(String(e||"").toLowerCase());if(!s)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");if(s.username==="admin")throw new Error("\u4E0D\u80FD\u7981\u7528\u9ED8\u8BA4\u7BA1\u7406\u5458");return s.disabled=t!==void 0?!!t:!s.disabled,this._save(),this._sanitizeUser(s)}setUserRole(e,t){let s=this.users.get(String(e||"").toLowerCase());if(!s)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");if(s.username==="admin")throw new Error("\u4E0D\u80FD\u4FEE\u6539\u9ED8\u8BA4\u7BA1\u7406\u5458\u89D2\u8272");return s.role=t==="admin"?"admin":"user",this._save(),this._sanitizeUser(s)}setUserQuota(e,t,s){let a=this.users.get(String(e||"").toLowerCase());if(!a)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");return a.dailyCreditLimit=Math.max(0,Number(t||0)||0),a.rpm=Math.max(0,Number(s||0)||0),this._save(),this._sanitizeUser(a)}resetUserPassword(e,t){let s=this.users.get(String(e||"").toLowerCase());if(!s)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");if(!t||String(t).length<4)throw new Error("\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11 4 \u4F4D");return s.salt=he(16),s.passwordHash=at(t,s.salt),this._save(),this._sanitizeUser(s)}resetUserApiKey(e){let t=this.users.get(String(e||"").toLowerCase());if(!t)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");return this.byApiKey.delete(t.apiKey),t.apiKey=Et(),this.byApiKey.set(t.apiKey,t),this._save(),this._sanitizeUser(t)}deleteUser(e){let t=String(e||"").toLowerCase(),s=this.users.get(t);if(!s)throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");if(s.username==="admin")throw new Error("\u4E0D\u80FD\u5220\u9664\u9ED8\u8BA4\u7BA1\u7406\u5458");return this.users.delete(t),this.byApiKey.delete(s.apiKey),this._save(),!0}verifyApiRequest(e,t=""){let s=String(e||"").trim(),a=!!(t&&t.trim());if(!s)return a?{ok:!1,status:401,message:"Invalid or missing gateway API key"}:{ok:!0,user:null};if(a&&s===t.trim())return{ok:!0,user:this.users.get("admin")||null};let n=this.byApiKey.get(s);if(!n)return a?{ok:!1,status:401,message:"Invalid gateway API key"}:{ok:!0,user:null};if(n.disabled)return{ok:!1,status:403,message:`User account ${n.username} is disabled`};let r=Ge();if(n.lastCreditDay!==r&&(n.lastCreditDay=r,n.usedCreditToday=0),n.dailyCreditLimit>0&&n.usedCreditToday>=n.dailyCreditLimit)return{ok:!1,status:429,message:`Daily credit quota exceeded (${n.usedCreditToday.toFixed(2)} / ${n.dailyCreditLimit})`};if(n.rpm>0){let l=Date.now(),c=this.rpmBuckets.get(s);if(!c||l-c.windowStart>=6e4)this.rpmBuckets.set(s,{windowStart:l,count:1});else{if(c.count>=n.rpm)return{ok:!1,status:429,message:`Rate limit exceeded (RPM ${n.rpm})`};c.count+=1}}return{ok:!0,user:n}}deductUserCredit(e,t=0){if(!e?.username||!(t>0))return;let s=this.users.get(e.username);if(!s)return;let a=Ge();s.lastCreditDay!==a&&(s.lastCreditDay=a,s.usedCreditToday=0),s.usedCreditToday=Number((s.usedCreditToday+t).toFixed(4)),this._save()}static get cookieName(){return Ss}};var fe=O(require("node:fs"),1),Ps=O(require("node:os"),1),Me=O(require("node:path"),1);var ot=new Map;function ao(o){return o==="global"?{base:q,origin:q}:{base:Y,origin:J}}function Es(o,e=""){let t={"Content-Type":"application/json",Accept:"application/json, text/plain, */*","X-Requested-With":"XMLHttpRequest",Origin:o,Referer:`${o}/`,"User-Agent":"CLI/2.63.2 CodeBuddy/2.63.2"};return e&&(t.Authorization=`Bearer ${e}`),t}async function oo(o="cn"){let e=o==="global"?"global":"cn",{base:t,origin:s}=ao(e),a=await fetch(`${t}/v2/plugin/auth/state?platform=CLI`,{method:"POST",headers:Es(s),body:JSON.stringify({}),signal:AbortSignal.timeout(15e3)}),n=await a.json().catch(()=>({}));if(!a.ok||n.code!==0)throw new Error(n.msg||`\u83B7\u53D6\u6388\u6743\u94FE\u63A5\u5931\u8D25 (HTTP ${a.status})`);let r=n.data?.state,l=(n.data?.authUrl||"").trim();if(!r||!l)throw new Error("\u4E0A\u6E38\u672A\u8FD4\u56DE\u5B8C\u6574\u7684 OAuth \u6388\u6743\u5730\u5740\u6216 state");let c=Date.now();for(let[i,d]of ot.entries())c-d.createdAt>900*1e3&&ot.delete(i);return ot.set(r,{realm:e,createdAt:c}),{state:r,url:l,realm:e}}async function no(o,e,t){let a=ot.get(e)?.realm||(o==="global"?"global":"cn"),{base:n,origin:r}=ao(a),l;try{l=await fetch(`${n}/v2/plugin/auth/token?state=${encodeURIComponent(e)}`,{method:"GET",headers:Es(r),signal:AbortSignal.timeout(1e4)})}catch(P){return{success:!1,waiting:!0,notice:`\u7B49\u5F85\u6388\u6743\u54CD\u5E94 (${P.message})`}}let c=await l.json().catch(()=>({}));if(!l.ok||c.code!==0||!c.data?.accessToken)return{success:!1,waiting:!0};let i=c.data,d=i.domain||(a==="global"?"www.workbuddy.ai":"copilot.tencent.com"),m={};try{let $=await(await fetch(`${n}/v2/plugin/login/account?state=${encodeURIComponent(e)}`,{method:"GET",headers:Es(r,i.accessToken),signal:AbortSignal.timeout(1e4)})).json().catch(()=>({}));$.code===0&&$.data&&(m=$.data)}catch{}let h=ye(i.accessToken)||{},g=String(m.uid||m.userId||h.sub||h.uid||`wb-${Date.now().toString(36)}`).trim(),x=String(m.nickname||m.userName||h.email||h.name||h.nickname||`Account-${g.slice(0,8)}`).trim(),b=String(m.enterpriseId||"").trim(),w=String(m.provider||m.idp||m.loginType||m.type||h.provider||"").trim(),T=Number(i.expiresIn)>0&&Number(i.expiresIn)<86400*30?Number(i.expiresIn):7200,A={account:{uid:g,nickname:x,enterpriseId:b,provider:w},auth:{realm:a,accessToken:i.accessToken,refreshToken:i.refreshToken||"",expiresAt:Date.now()+T*1e3,domain:d},disabled:!1,disabledReason:"",source:"oauth-browser"};return t.upsert(A),t.setActive(g),ot.delete(e),{success:!0,waiting:!1,account:{uid:g,nickname:x,realm:a,provider:w}}}async function Ms(o,e){if(!o||o.auth?.realm!=="global")return{ok:!1,claimed:!1,message:"\u4EC5\u56FD\u9645\u7248 (global) \u8D26\u53F7\u652F\u6301\u9886\u53D6 Trial \u52A0\u6CB9\u5305"};let t=async()=>{let r=e?e.buildHeaders(o,!1):{Authorization:`Bearer ${o.auth.accessToken}`,"Content-Type":"application/json",Accept:"application/json","X-CodeBuddy-Request":"1",Origin:q,Referer:`${q}/`},l=await fetch(`${q}${ct}`,{method:"POST",headers:r,body:JSON.stringify({}),signal:AbortSignal.timeout(1e4)}),c=await l.json().catch(()=>({}));return{res:l,data:c}},{res:s,data:a}=await t();if(s.status===401&&e&&o.auth?.refreshToken)try{await e.refreshToken(o);let r=await t();s=r.res,a=r.data}catch{}return a.code===14051||typeof a.msg=="string"&&/already|14051|已领取/i.test(a.msg)?{ok:!0,claimed:!1,message:"\u8BE5\u56FD\u9645\u7248\u8D26\u53F7\u5DF2\u9886\u8FC7 Trial \u52A0\u6CB9\u5305\uFF08\u65E0\u9700\u91CD\u590D\u9886\u53D6\uFF09"}:!s.ok||a.code!==0&&a.code!==200?{ok:!1,claimed:!1,message:a.msg||`\u9886\u53D6\u5931\u8D25 (HTTP ${s.status})`}:{ok:!0,claimed:!0,message:"\u6210\u529F\u9886\u53D6\u56FD\u9645\u7248 IDE Trial \u52A0\u901F\u79EF\u5206\u5305\uFF01",data:a.data}}var nt="/activity/workbuddy/invitation/v2",Ln={12301:"\u9080\u8BF7\u7801\u65E0\u6548\u6216\u4E0D\u5B58\u5728\uFF08\u6CE8\u610F\u56FD\u9645\u7248\u4E0E\u56FD\u5185\u7248\u4E0D\u4E92\u901A\uFF09",12302:"\u4E0D\u80FD\u7ED1\u5B9A\u81EA\u5DF1\u7684\u9080\u8BF7\u7801",12303:"\u5F53\u524D\u8D26\u53F7\u5DF2\u7ECF\u7ED1\u5B9A\u8FC7\u9080\u8BF7\u4EBA\uFF0C\u4E0D\u53EF\u91CD\u590D\u7ED1\u5B9A",12304:"\u4EC5\u9650\u65B0\u6CE8\u518C\u8D26\u53F7\u53EF\u7ED1\u5B9A\u9080\u8BF7\u7801",12305:"\u5F53\u524D\u9080\u8BF7\u6D3B\u52A8\u5DF2\u7ED3\u675F",12306:"\u6D3B\u52A8\u6216\u533A\u670D\u4E0D\u5339\u914D\uFF08\u8BF7\u6838\u5BF9\u56FD\u5185\u7248/\u56FD\u9645\u7248\uFF09",12310:"\u5F53\u524D\u8D26\u53F7\u5DF2\u7ECF\u7ED1\u5B9A\u8FC7\u9080\u8BF7\u4EBA\uFF0C\u4E0D\u53EF\u91CD\u590D\u7ED1\u5B9A",12311:"\u4EC5\u9650\u65B0\u6CE8\u518C\u8D26\u53F7\u53EF\u7ED1\u5B9A\u9080\u8BF7\u7801",12312:"\u5F53\u524D\u9080\u8BF7\u6D3B\u52A8\u5DF2\u7ED3\u675F",12313:"\u4E0D\u80FD\u7ED1\u5B9A\u81EA\u5DF1\u7684\u9080\u8BF7\u7801",12314:"\u6D3B\u52A8\u6216\u533A\u670D\u4E0D\u5339\u914D",12317:"\u5DF2\u8D85\u8FC7\u65B0\u7528\u6237\u7ED1\u5B9A\u65F6\u95F4\u7A97\u53E3",12319:"\u9080\u8BF7\u7801\u65E0\u6548\u6216\u5DF2\u5931\u6548"};function Dn(o){let e=String(o||"").trim();if(!e)return"";if(e.includes("://")||e.includes("inviteCode=")||e.includes("invite_code=")||e.includes("code="))try{let t=e.startsWith("http")?e:`https://www.workbuddy.ai/?${e.replace(/^[/?]+/,"")}`,s=new URL(t),a=s.searchParams.get("inviteCode")||s.searchParams.get("invite_code")||s.searchParams.get("code");if(a)return a.trim()}catch{}return e}function Nn(o,e){let t=String(e||"").trim();return t?o?.auth?.realm==="global"?`https://www.workbuddy.ai/?inviteCode=${encodeURIComponent(t)}`:`https://www.workbuddy.cn/events/invite?inviteCode=${encodeURIComponent(t)}`:""}async function rt(o,e,t,s){let a=async()=>{let c=await fetch(o,{...e,headers:{...e.headers||{},Authorization:`Bearer ${t.auth.accessToken}`},signal:AbortSignal.timeout(8e3)}),i=await c.json().catch(()=>({}));return{res:c,json:i}},{res:n,json:r}=await a();if((n.status===401||r.code===401||r.code===12153||r.code===10002)&&s&&t.auth?.refreshToken)try{await s.refreshToken(t),{res:n,json:r}=await a()}catch{}return{res:n,json:r}}async function ro(o,e=null){if(!o?.account?.uid)throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");let s=o.auth?.realm==="global"?q:J,a={Accept:"application/json","Content-Type":"application/json","X-CodeBuddy-Request":"1",Origin:s,Referer:`${s}/`},[n,r,l,c]=await Promise.all([rt(`${s}${nt}/my-code`,{method:"GET",headers:a},o,e).catch(A=>({res:{ok:!1},json:{msg:A.message}})),rt(`${s}${nt}/my-rewards`,{method:"GET",headers:a},o,e).catch(()=>({res:{ok:!1},json:{}})),rt(`${s}${nt}/invite-records`,{method:"GET",headers:a},o,e).catch(()=>({res:{ok:!1},json:{}})),rt(`${s}${nt}/my-progress`,{method:"GET",headers:a},o,e).catch(()=>({res:{ok:!1},json:{}}))]),i=n.res.ok&&n.json.code===0?n.json.data||{}:null,d=c.res.ok&&c.json.code===0?c.json.data||{}:null,m=r.res.ok&&r.json.code===0?r.json.data||{}:null,h=l.res.ok&&l.json.code===0?l.json.data||{}:null,g=String(i?.invite_code||d?.invite_code||"").trim(),x=Nn(o,g),b=Number(h?.total_invited??d?.invite_count??0),w=Number(h?.total_used??m?.valid_invite_count??d?.valid_invite_count??0),T=Number(m?.total_credits??h?.total_credits??d?.total_credits??0);return{inviteCode:g,inviteUrl:x,expiresAt:i?.expires_at||"never",invitedCount:b,validInviteCount:w,rewardCredit:T,baseCredits:Number(m?.base_credits??d?.base_credits??0),promotionCredits:Number(m?.promotion_credits??d?.promotion_credits??0),paymentCredits:Number(m?.payment_credits??d?.payment_credits??0),capValue:Number(m?.cap_value??3e4),friends:h?.friends||d?.invited_users||[],error:!g&&n.json?.msg?n.json.msg:""}}async function io(o,e,t=null){let s=Dn(e);if(!s)return{ok:!1,message:"\u9080\u8BF7\u7801\u4E0D\u80FD\u4E3A\u7A7A"};let n=o.auth?.realm==="global"?q:J,r={Accept:"application/json","Content-Type":"application/json","X-CodeBuddy-Request":"1",Origin:n,Referer:`${n}/`};try{let{res:l,json:c}=await rt(`${n}${nt}/bind`,{method:"POST",headers:r,body:JSON.stringify({inviteCode:s})},o,t);if(l.ok&&c.code===0){let d=Number(c.data?.credit||c.data?.reward_credit||c.data?.granted_credits||0);return{ok:!0,inviteCode:s,reward:d,message:d>0?`\u7ED1\u5B9A\u6210\u529F\uFF0C\u83B7\u5F97 +${d} \u79EF\u5206\uFF01`:"\u9080\u8BF7\u7801\u7ED1\u5B9A\u6210\u529F\uFF01"}}let i=Ln[c.code];return{ok:!1,code:c.code,message:i||c.msg||`\u7ED1\u5B9A\u5931\u8D25 (HTTP ${l.status})`}}catch(l){return{ok:!1,message:`\u7ED1\u5B9A\u8BF7\u6C42\u5F02\u5E38: ${l.message}`}}}var Rs=O(require("node:zlib"),1);var $n=(()=>{let o=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let s=0;s<8;s++)t=t&1?3988292384^t>>>1:t>>>1;o[e]=t>>>0}return o})();function Hn(o){let e=4294967295;for(let t=0;t<o.length;t++)e=$n[(e^o[t])&255]^e>>>8;return(e^4294967295)>>>0}function Un(o){let e=[],t=[],s=0;for(let r of o){let l=Buffer.from(r.name,"utf8"),c=Buffer.isBuffer(r.content)?r.content:Buffer.from(r.content,"utf8"),i=Rs.default.deflateRawSync(c),d=Hn(c),m=Buffer.alloc(30);m.writeUInt32LE(67324752,0),m.writeUInt16LE(20,4),m.writeUInt16LE(2048,6),m.writeUInt16LE(8,8),m.writeUInt16LE(0,10),m.writeUInt16LE(0,12),m.writeUInt32LE(d,14),m.writeUInt32LE(i.length,18),m.writeUInt32LE(c.length,22),m.writeUInt16LE(l.length,26),m.writeUInt16LE(0,28),e.push(m,l,i);let h=Buffer.alloc(46);h.writeUInt32LE(33639248,0),h.writeUInt16LE(20,4),h.writeUInt16LE(20,6),h.writeUInt16LE(2048,8),h.writeUInt16LE(8,10),h.writeUInt16LE(0,12),h.writeUInt16LE(0,14),h.writeUInt32LE(d,16),h.writeUInt32LE(i.length,20),h.writeUInt32LE(c.length,24),h.writeUInt16LE(l.length,28),h.writeUInt16LE(0,30),h.writeUInt16LE(0,32),h.writeUInt16LE(0,34),h.writeUInt16LE(0,36),h.writeUInt32LE(0,38),h.writeUInt32LE(s,42),t.push(h,l),s+=30+l.length+i.length}let a=t.reduce((r,l)=>r+l.length,0),n=Buffer.alloc(22);return n.writeUInt32LE(101010256,0),n.writeUInt16LE(0,4),n.writeUInt16LE(0,6),n.writeUInt16LE(o.length,8),n.writeUInt16LE(o.length,10),n.writeUInt32LE(a,12),n.writeUInt32LE(s,16),n.writeUInt16LE(0,20),Buffer.concat([...e,...t,n])}function Wn(o){let e=[],t=-1;for(let r=o.length-22;r>=Math.max(0,o.length-65557);r--)if(o.readUInt32LE(r)===101010256){t=r;break}if(t===-1)return e;let s=o.readUInt32LE(t+16),a=o.readUInt16LE(t+10),n=s;for(let r=0;r<a&&n+46<=o.length&&o.readUInt32LE(n)===33639248;r++){let l=o.readUInt16LE(n+10),c=o.readUInt32LE(n+20),i=o.readUInt16LE(n+28),d=o.readUInt16LE(n+30),m=o.readUInt16LE(n+32),h=o.readUInt32LE(n+42),g=o.toString("utf8",n+46,n+46+i);if(n+=46+i+d+m,g.endsWith("/")||h+30>o.length||o.readUInt32LE(h)!==67324752)continue;let x=o.readUInt16LE(h+26),b=o.readUInt16LE(h+28),w=h+30+x+b,T=w+c;if(T>o.length)continue;let A=o.subarray(w,T);try{let P=null;l===0?P=Buffer.from(A):l===8&&(P=Rs.default.inflateRawSync(A)),P&&e.push({name:g,content:P})}catch{}}return e}function jn(o){return o.replace(/\/\*[\s\S]*?\*\//g,"").split(/\r?\n/).filter(e=>{let t=e.trim();return t&&!t.startsWith("//")&&!t.startsWith("#")}).join(`
`).trim()}function lo(o,e="global"){if(!o||typeof o!="object")return null;let t=o.auth?.accessToken||o.auth?.access_token||o.accessToken||o.access_token||o.token||"",s=o.auth?.refreshToken||o.auth?.refresh_token||o.refreshToken||o.refresh_token||"";if(t&&(t.startsWith("http://")||t.startsWith("https://"))&&(t=""),s&&(s.startsWith("http://")||s.startsWith("https://"))&&(s=""),!t&&!s)return null;let a=ye(t)||ye(s)||{},n=o.account?.uid||o.uid||o.userId||a.sub||a.uid||`user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,r=(o.auth?.realm||o.realm||"").toLowerCase();if(!r){let c=String(o.auth?.domain||o.domain||a.iss||"").toLowerCase();c.includes("codebuddy")||c.includes("tencent")?r="cn":c.includes("workbuddy")?r="global":r=e}let l=o.account?.nickname||o.nickname||o.userName||o.email||a.email||a.name||a.nickname||`Account-${String(n).slice(0,8)}`;return{account:{uid:String(n),nickname:String(l),enterpriseId:o.account?.enterpriseId||o.enterpriseId||"",provider:o.account?.provider||o.provider||a.provider||""},auth:{realm:r==="cn"?"cn":"global",accessToken:t,refreshToken:s||t,expiresAt:o.auth?.expiresAt||o.expiresAt||(a.exp?a.exp*1e3:Date.now()+72e5),domain:o.auth?.domain||o.domain||(r==="cn"?"copilot.tencent.com":"www.workbuddy.ai")},disabled:!!o.disabled,disabledReason:o.disabledReason||"",source:o.source||"batch-import",updatedAt:Date.now()}}function co(o,e="global"){let t=Buffer.isBuffer(o)?o:Buffer.from(String(o||""),"utf8"),s=[];if(t.length>=4&&t[0]===80&&t[1]===75){let r=Wn(t);for(let l of r){let c=l.name.toLowerCase();if(c.endsWith(".json")||c.endsWith(".txt")||c.endsWith(".info")){let i=c.includes("cn")?"cn":c.includes("global")?"global":e;s.push(...co(l.content,i))}}return s}let a=jn(t.toString("utf8"));if(!a)return s;let n=r=>{if(Array.isArray(r)){let l=!1;for(let c of r)n(c)&&(l=!0);return l}if(r&&typeof r=="object"){for(let c of["accounts","auths","data","items","list","account_list","tokens","result"])if(c in r&&n(r[c]))return!0;let l=lo(r,e);if(l)return s.push(l),!0}return!1};if(a.startsWith("[")||a.startsWith("{"))try{let r=JSON.parse(a);if(n(r))return s}catch{}for(let r of a.split(/\r?\n/)){let l=r.trim();if(!l||l.startsWith("http://")||l.startsWith("https://"))continue;if(l.startsWith("{")||l.startsWith("["))try{let d=JSON.parse(l);if(n(d))continue}catch{}let c="",i="";if(l.includes("----")){let d=l.split("----").map(m=>m.trim()).filter(Boolean);d.length>=2&&(c=d[0],i=d[1])}else if(l.includes("|")){let d=l.split("|").map(m=>m.trim()).filter(Boolean);d.length>=2&&(c=d[0],i=d[1])}else if(l.includes(":")&&!l.startsWith("http")){let d=l.indexOf(":");c=l.slice(0,d).trim(),i=l.slice(d+1).trim()}else i=l,c=l;if(i||c){let d=lo({accessToken:c,refreshToken:i},e);d&&s.push(d)}}return s}async function uo(o,e,t,s="global"){let a=co(o,s),n=[],r=0,l=0,c=0;for(let i of a)try{let d=!!e.get(i.account.uid),m=!1;if(i.auth.refreshToken)try{await t.refreshToken(i),m=!0}catch{}m||await t.fetchBalance(i),e.upsert(i),d?l++:r++,n.push({uid:i.account.uid,nickname:i.account.nickname,realm:i.auth.realm,ok:!0})}catch(d){c++,n.push({uid:i.account.uid,nickname:i.account.nickname,ok:!1,error:d.message})}return{ok:!0,total:a.length,imported:r,updated:l,failed:c,results:n}}function po(o){let t=o.getAll().map(s=>({name:`${s.auth?.realm||"global"}-${s.account.uid}.json`,content:JSON.stringify(s,null,2)}));return Un(t)}var mo=`
  :root {
    --bg: #f4f7fb;
    --bg-card: #ffffff;
    --bg-soft: #f8fafc;
    --border: #dbe5f1;
    --border-strong: #93c5fd;
    --cyan: #2563eb;
    --cyan-dark: #1d4ed8;
    --emerald: #059669;
    --amber: #d97706;
    --magenta: #dc2626;
    --text: #0f172a;
    --text-dim: #64748b;
    --radius: 12px;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0; font-family: var(--font);
    background: radial-gradient(circle at 10% 10%, rgba(37,99,235,0.06), transparent 42%),
                radial-gradient(circle at 90% 15%, rgba(14,165,233,0.05), transparent 40%), var(--bg);
    color: var(--text); min-height: 100vh;
  }
  .topbar {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
    padding: 12px 24px; border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #1e3a8a; }
  .brand-badge {
    padding: 3px 9px; border-radius: 999px; font-size: 11px;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-weight: 600;
  }
  .nav { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
  .nav-btn {
    background: transparent; border: 1px solid transparent; color: #475569;
    padding: 7px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.16s;
  }
  .nav-btn:hover { color: #2563eb; background: #f1f5f9; }
  .nav-btn.active {
    background: #eff6ff; border-color: #93c5fd; color: #2563eb; font-weight: 600;
    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.1);
  }
  .container { max-width: 1300px; margin: 0 auto; padding: 20px 24px 64px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 18px; }
  .guide-card { border: 1px solid #dbe5f1; border-radius: 10px; padding: 12px; background: #f8fafc; transition: all 0.2s; }
  .guide-card:hover { border-color: #93c5fd; }
  .card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px; box-shadow: 0 4px 16px rgba(15, 35, 75, 0.05); margin-bottom: 16px;
  }
  .card-title {
    font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 10px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .kpi { font-size: 28px; font-weight: 700; color: #2563eb; }
  .kpi.green { color: #059669; }
  .kpi.pink { color: #0284c7; }
  .sub-row { font-size: 12px; color: var(--text-dim); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
  button.btn, a.btn {
    display: inline-flex; align-items: center; gap: 4px; text-decoration: none;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;
    padding: 7px 13px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s;
  }
  button.btn:hover, a.btn:hover { background: #dbeafe; border-color: #93c5fd; transform: translateY(-1px); }
  button.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  button.btn-green { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  button.btn-green:hover { background: #d1fae5; }
  button.btn-pink { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  button.btn-pink:hover { background: #fee2e2; }
  button.btn-amber { background: #fffbeb; border-color: #fde68a; color: #d97706; }
  button.btn-amber:hover { background: #fef3c7; }
  button.btn-sm, a.btn-sm { padding: 4px 9px; font-size: 11px; }
  input, select, textarea {
    background: #ffffff; border: 1px solid #cbd5e1; color: var(--text);
    padding: 7px 10px; border-radius: 8px; font-size: 12px; font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #edf2f7; vertical-align: middle; }
  th { color: #64748b; font-weight: 600; background: #f8fafc; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .tag-cn { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .tag-global { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .tag-warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .tag-err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .hidden { display: none !important; }
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.36); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 200;
  }
  .modal {
    width: 600px; max-width: 94vw; max-height: 90vh; overflow-y: auto; background: #ffffff;
    border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  }
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 110px; padding-top: 12px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .bar-fill { width: 100%; background: linear-gradient(180deg, #2563eb, #93c5fd); border-radius: 4px 4px 0 0; min-height: 2px; }
  .bar-lbl { font-size: 10px; color: var(--text-dim); }
  .toast {
    position: fixed; bottom: 20px; right: 20px; background: #ffffff;
    border: 1px solid #93c5fd; color: #1e3a8a; padding: 10px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 500; z-index: 300; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  }
  pre.code {
    background: #f8fafc; border: 1px solid #dbe5f1; border-radius: 8px; padding: 12px;
    overflow-x: auto; font-size: 11px; color: #1e3a8a; font-family: Consolas, Monaco, monospace;
  }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
  .form-field label { color: #475569; font-weight: 500; }
`;function ho(o={}){let e=o.port||7863,t=o.version||K;return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API \u670D\u52A1\u95E8\u6237 \u2014 DSH Gateway</title>
  <style>${mo}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>\u26A1 WORKBUDDY 2API</span>
      <span class="brand-badge">PORTAL v${t} \xB7 :${e}</span>
    </div>
    <div class="nav">
      <a class="btn btn-sm" href="/console">\u8FDB\u5165\u7BA1\u7406\u63A7\u5236\u53F0 \u2197</a>
    </div>
  </div>
  <div class="container">
    <div class="card">
      <div class="card-title">
        <span>\u670D\u52A1\u5B9E\u65F6\u8FD0\u884C\u603B\u89C8</span>
        <button class="btn btn-sm" onclick="loadPublic()">\u21BB \u5237\u65B0\u72B6\u6001</button>
      </div>
      <div class="grid-3" id="portalSummary">\u52A0\u8F7D\u4E2D...</div>
    </div>
    <div class="card">
      <div class="card-title"><span>\u53EF\u7528\u6A21\u578B\u4E0E\u5B98\u65B9\u500D\u7387\u6E05\u5355</span><span id="portalModelCount"></span></div>
      <div style="max-height:480px;overflow:auto">
        <table>
          <thead><tr><th>\u6A21\u578B ID</th><th>\u500D\u7387</th><th>\u533A\u670D</th><th>\u4E0A\u4E0B\u6587</th><th>\u80FD\u529B</th></tr></thead>
          <tbody id="portalModelsTbody"></tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span>API \u5FEB\u901F\u63A5\u5165</span></div>
      <div id="portalGuide" class="grid-2" style="margin-bottom:0"></div>
    </div>
  </div>
  <script>
    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    async function loadPublic() {
      const r = await fetch('/plugins/dsh-workbuddy2api/public/status');
      const d = await r.json();
      const cn = d.realm_totals?.cn || {};
      const gl = d.realm_totals?.global || {};
      document.getElementById('portalSummary').innerHTML = [
        { t: '\u5168\u6C60\u5065\u5EB7\u8D26\u53F7', v: (d.healthy || 0) + ' / ' + (d.total || 0), s: '\u51B7\u5374: ' + (d.cooling || 0) + ' \xB7 \u5728\u9014\u5360\u6EE1: ' + (d.in_flight_full || 0), c: '' },
        { t: '\u56FD\u5185\u7248 (CN) \u53EF\u7528\u5EA6', v: (cn.healthy || 0) + ' / ' + (cn.total || 0), s: '\u4ECA\u65E5\u5168\u6C60\u8BF7\u6C42 ' + (d.today?.requests || 0) + ' \u6B21', c: 'green' },
        { t: '\u56FD\u9645\u7248 (Global) \u53EF\u7528\u5EA6', v: (gl.healthy || 0) + ' / ' + (gl.total || 0), s: '\u5DF2\u53D1\u73B0\u52A8\u6001\u6A21\u578B ' + (d.discoveredModels || 0) + ' \u4E2A', c: 'pink' }
      ].map(x => '<div class="card" style="margin:0"><div class="card-title"><span>' + x.t + '</span></div><div class="kpi ' + x.c + '">' + x.v + '</div><div class="sub-row">' + x.s + '</div></div>').join('');
      const ms = d.models || [];
      document.getElementById('portalModelCount').textContent = '\u5171 ' + ms.length + ' \u4E2A\u516C\u5F00\u6A21\u578B';
      document.getElementById('portalModelsTbody').innerHTML = ms.map(m => {
        const caps = [];
        if (m.supports_images) caps.push('\u89C6\u89C9');
        if (m.supports_reasoning) caps.push('\u601D\u8003');
        if (m.supports_tool_call) caps.push('\u5DE5\u5177');
        return '<tr><td><strong>' + esc(m.id) + '</strong></td><td><span class="tag ' + (m.is_free ? 'tag-cn' : 'tag-global') + '">' + esc(m.billing_rate || m.credits || '-') + '</span></td><td>' + esc(m.realm || 'auto') + '</td><td>' + Math.round((m.context_length || 200000) / 1000) + 'k</td><td>' + (caps.join(' \xB7 ') || '\u6587\u672C') + '</td></tr>';
      }).join('');
      const base = location.origin;
      document.getElementById('portalGuide').innerHTML = [
        { t: 'OpenAI Chat \u7AEF\u70B9', u: base + '/v1', d: '\u9002\u7528 Cline / Cherry Studio / Roo Code' },
        { t: 'Claude Code (Anthropic)', u: base, d: '\u8BBE\u7F6E ANTHROPIC_BASE_URL=' + base },
        { t: 'OpenAI Responses (Codex)', u: base + '/v1/responses', d: '\u517C\u5BB9 Codex CLI \u539F\u751F\u4EA4\u4E92' },
        { t: '\u7F51\u5173\u5065\u5EB7\u63A2\u9488', u: base + '/healthz', d: '\u89C6\u9891\u751F\u6210\u63A5\u53E3: ' + base + '/v1/videos/generations' }
      ].map(g => '<div style="border:1px solid #dbe5f1;border-radius:8px;padding:10px;background:#f8fafc"><div style="font-weight:600;font-size:12px;color:#1e3a8a">' + g.t + '</div><div style="font-family:Consolas,monospace;font-size:11px;color:#2563eb;margin:4px 0">' + esc(g.u) + '</div><div style="font-size:11px;color:#64748b">' + esc(g.d) + '</div></div>').join('');
    }
    loadPublic();
  </script>
</body>
</html>`}function Mt(o={}){let e=o.port||7863;return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API Console \u2014 DSH \u9AD8\u53EF\u7528\u7F51\u5173</title>
  <style>${mo}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>\u26A1 WORKBUDDY 2API</span>
      <span class="brand-badge" id="gatewayBadge">ONLINE v${K} :${e}</span>
      <span id="userBadge" class="tag tag-cn hidden"></span>
    </div>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('pool')">\u8D26\u53F7\u6C60\u603B\u89C8</button>
      <button class="nav-btn" onclick="switchTab('models')">\u6A21\u578B &amp; \u500D\u7387</button>
      <button class="nav-btn" onclick="switchTab('playground')">\u5728\u7EBF\u8C03\u8BD5 &amp; \u6D41\u6C34</button>
      <button class="nav-btn" onclick="switchTab('usage')">\u7528\u91CF\u4E0E\u6263\u8D39</button>
      <button class="nav-btn" onclick="switchTab('welfare')">\u732B\u732B &amp; \u798F\u5229 &amp; \u9080\u8BF7</button>
      <button class="nav-btn" onclick="switchTab('tasks')">\u6210\u957F\u4EFB\u52A1</button>
      <button class="nav-btn" onclick="switchTab('settings')">\u5B89\u5168 \xB7 \u544A\u8B66 \xB7 \u7528\u6237 \xB7 DSH</button>
      <a class="btn btn-sm" href="#" onclick="openExternalUrl(getApiOrigin() + '/portal');return false;">\u95E8\u6237 \u2197</a>
      <button id="logoutBtn" class="btn btn-sm btn-pink hidden" onclick="doLogout()">\u9000\u51FA</button>
    </div>
  </div>

  <div class="container">
    <!-- TAB 1: POOL -->
    <div id="tab-pool">
      <div class="grid-3" id="realmSummaryCards"></div>

      <div class="toolbar">
        <button class="btn btn-green" onclick="startOAuth('cn')">+ \u56FD\u5185\u7248 OAuth</button>
        <button class="btn" onclick="startOAuth('global')">+ \u56FD\u9645\u7248 OAuth</button>
        <button class="btn" onclick="openAddTokenModal()">+ \u7C98\u8D34 Token \u6DFB\u52A0</button>
        <button class="btn" onclick="openImportModal()">\u6279\u91CF / ZIP \u5BFC\u5165</button>
        <button class="btn" onclick="exportZip()">\u5BFC\u51FA ZIP \u5907\u4EFD</button>
        <button class="btn btn-green" onclick="batchCheckin()">\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230</button>
        <button class="btn" onclick="batchTrial()">\u56FD\u9645\u7248\u6279\u91CF\u9886Trial</button>
        <button class="btn btn-amber" onclick="refreshAllTokens()">\u5237\u65B0\u5168\u90E8 Token</button>
        <button class="btn btn-pink" onclick="clearAllCooldowns()">\u6E05\u9664\u7194\u65AD</button>
        <button class="btn" onclick="openOverviewModal('balance')">\u4F59\u989D\u603B\u89C8</button>
        <button class="btn" onclick="openOverviewModal('packs')">\u79EF\u5206\u5305\u603B\u89C8</button>
        <button class="btn" onclick="loadStatus(true)">\u21BB \u6781\u901F\u5237\u65B0</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>\u8D26\u53F7\u6C60\u5B9E\u65F6\u8C03\u5EA6\u4E0E\u5065\u5EB7\u770B\u677F</span>
          <span id="poolCountInfo"></span>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>\u8D26\u53F7</th>
                <th>\u533A\u670D</th>
                <th>\u5B9E\u65F6\u79EF\u5206</th>
                <th>\u5305\u6784\u6210</th>
                <th>\u7B7E\u5230/\u5065\u5EB7\u72B6\u6001</th>
                <th>\u5E76\u53D1</th>
                <th>\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="accountsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: MODELS & RATES -->
    <div id="tab-models" class="hidden">
      <div class="toolbar">
        <button class="btn btn-green" onclick="discoverModels()">\u{1F50D} \u540C\u6B65\u4E0A\u6E38\u5B9E\u65F6\u500D\u7387\u76EE\u5F55</button>
        <button class="btn" onclick="saveModelsConfig()">\u{1F4BE} \u4FDD\u5B58\u8DEF\u7531 \xB7 \u8FC7\u6EE4 \xB7 \u522B\u540D</button>
        <select id="modelFilterMode" onchange="renderModelsTable()">
          <option value="all">\u5168\u90E8\u6A21\u578B</option>
          <option value="free">\u{1F381} \u4EC5\u514D\u8D39 (x0.00)</option>
          <option value="low">\u{1F48E} \u8D85\u4F4E\u500D\u7387 (\u22640.2x)</option>
          <option value="cn">\u{1F1E8}\u{1F1F3} \u56FD\u5185\u7248 (CN)</option>
          <option value="global">\u{1F310} \u56FD\u9645\u7248 (Global)</option>
          <option value="reasoning">\u{1F9E0} \u652F\u6301\u601D\u8003</option>
        </select>
        <input id="modelSearch" placeholder="\u641C\u7D22\u6A21\u578B ID / \u63CF\u8FF0..." oninput="renderModelsTable()" style="min-width:180px" />
        <label style="font-size:12px"><input type="checkbox" id="autoFreeToggle" /> \u5F00\u653E auto-free \u865A\u62DF\u514D\u8D39\u6C60</label>
      </div>
      <div class="grid-2" style="grid-template-columns: 1.55fr 1fr;">
        <div class="card">
          <div class="card-title"><span>\u4E0A\u6E38\u6A21\u578B\u4E0E\u5B9E\u65F6\u79EF\u5206\u500D\u7387\u76EE\u5F55\uFF08\u7A7A\u52FE\u9009\u8868\u793A\u5168\u90E8\u653E\u884C\uFF09</span><span id="modelCountLabel"></span></div>
          <div style="max-height:540px;overflow:auto">
            <table>
              <thead><tr><th>\u542F\u7528</th><th>\u6A21\u578B ID / \u8BF4\u660E</th><th>\u500D\u7387</th><th>\u80FD\u529B &amp; \u601D\u8003\u6863\u4F4D</th><th>\u533A\u670D</th><th>\u4E0A\u4E0B\u6587</th><th>\u64CD\u4F5C</th></tr></thead>
              <tbody id="modelsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">
            <span>auto-free \u4F18\u5148\u7EA7 / \u6545\u969C\u8F6C\u79FB\u8DEF\u7531 / \u6A21\u578B\u522B\u540D</span>
            <button class="btn btn-sm" onclick="addClaudePresetAliases()">+ Claude Code \u5E38\u7528\u6620\u5C04</button>
          </div>
          <div class="form-field" style="margin-bottom:10px">
            <label>auto-free \u667A\u80FD\u514D\u8D39\u8DEF\u7531\u987A\u5E8F (\u9017\u53F7\u5206\u9694):</label>
            <input id="freeModelsInput" />
          </div>

          <div style="border-top:1px solid #edf2f7;padding-top:10px;margin-bottom:10px">
            <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px">\u6545\u969C\u8F6C\u79FB\u8DEF\u7531\u7EC4 (\u5982 fast \u2794 \u4E3B\u6A21\u578B \u2192 \u5907\u9009\u6A21\u578B)</div>
            <div id="routesVisualList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px"></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <input id="newRouteName" placeholder="\u7EC4\u540D\u5982 fast" style="width:110px" />
              <input id="newRouteTargets" placeholder="\u5019\u9009\u6A21\u578B\u9017\u53F7\u5206\u9694\u5982 cn:deepseek-v4.1-flash, global:hy4free" style="flex:1;min-width:160px" />
              <button class="btn btn-sm btn-green" onclick="addVisualRoute()">+ \u6DFB\u52A0\u8DEF\u7531\u7EC4</button>
            </div>
          </div>

          <div style="border-top:1px solid #edf2f7;padding-top:10px;margin-bottom:10px">
            <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px">\u5BA2\u6237\u7AEF\u6A21\u578B\u522B\u540D\u6620\u5C04 (\u6536\u5230\u5DE6\u4FA7\u540D\u79F0\u81EA\u52A8\u8F6C\u53D1\u5230\u53F3\u4FA7\u771F\u5B9E\u6A21\u578B)</div>
            <div id="aliasesVisualList" style="display:flex;flex-direction:column;gap:6px;max-height:210px;overflow-y:auto;margin-bottom:8px"></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <input id="newAliasFrom" placeholder="\u5BA2\u6237\u7AEF\u8BF7\u6C42\u540D\u5982 claude-sonnet-4-6" style="flex:1;min-width:130px" />
              <input id="newAliasTo" placeholder="\u6620\u5C04\u5230\u771F\u5B9E\u6A21\u578B\u5982 global:gpt-6.1-sol" style="flex:1;min-width:130px" />
              <button class="btn btn-sm btn-green" onclick="addVisualAlias()">+ \u6DFB\u52A0\u522B\u540D</button>
            </div>
          </div>

          <details style="font-size:11px;color:var(--text-dim)">
            <summary style="cursor:pointer;user-select:none">\u9AD8\u7EA7 JSON \u539F\u6587\u89C6\u56FE (\u81EA\u52A8\u540C\u6B65)</summary>
            <div class="form-field" style="margin-top:8px">
              <label>modelRoutes JSON:</label>
              <textarea id="modelRoutesTextarea" rows="4" oninput="syncVisualFromJson()"></textarea>
            </div>
            <div class="form-field" style="margin-top:6px">
              <label>aliases JSON:</label>
              <textarea id="aliasesTextarea" rows="5" oninput="syncVisualFromJson()"></textarea>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- TAB 3: PLAYGROUND & LIVE LOGS -->
    <div id="tab-playground" class="hidden">
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u{1F9EA} \u5728\u7EBF\u5BF9\u8BDD\u6D4B\u8BD5 (\u652F\u6301\u56FE\u7247/\u6587\u672C\u9644\u4EF6)</span><span id="pgStatsBadge" class="tag tag-global">\u5C31\u7EEA</span></div>
          <div class="form-grid" style="margin-bottom:10px">
            <div class="form-field">
              <label>\u9009\u62E9\u6D4B\u8BD5\u6A21\u578B (\u9644\u5E26\u5B9E\u65F6\u500D\u7387):</label>
              <select id="pgModelSelect"></select>
            </div>
            <div class="form-field">
              <label>\u601D\u8003\u5F3A\u5EA6 (reasoning_effort):</label>
              <select id="pgEffortSelect">
                <option value="">\u9ED8\u8BA4</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="xhigh">xhigh</option>
                <option value="max">max</option>
              </select>
            </div>
          </div>
          <div class="form-field" style="margin-bottom:8px">
            <label>\u6D4B\u8BD5\u63D0\u793A\u8BCD:</label>
            <textarea id="pgPromptInput" rows="3" placeholder="\u4F60\u597D\uFF0C\u8BF7\u7528\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u4F60\u81EA\u5DF1"></textarea>
          </div>
          <div class="toolbar" style="margin-bottom:10px">
            <input type="file" id="pgFileInput" accept="image/*,.txt,.md,.json,.js,.py,.go" onchange="handlePgFile(event)" style="max-width:210px" />
            <span id="pgAttachBadge" class="tag tag-cn hidden"></span>
            <button id="pgAttachClear" class="btn btn-sm btn-pink hidden" onclick="clearPgAttachment()">\u6E05\u9664\u9644\u4EF6</button>
            <label style="font-size:12px"><input type="checkbox" id="pgStreamChk" checked /> \u6D41\u5F0F SSE</label>
            <button class="btn btn-green" onclick="runPlayground()">\u{1F680} \u53D1\u9001\u6D4B\u8BD5</button>
          </div>
          <pre class="code" id="pgOutputBox" style="min-height:140px;max-height:320px;white-space:pre-wrap">\u7B49\u5F85\u53D1\u9001\u6D4B\u8BD5...</pre>
        </div>

        <div class="card">
          <div class="card-title">
            <span>\u{1F4E1} \u5728\u9014\u5E76\u53D1 &amp; \u6700\u8FD1\u8BF7\u6C42\u5B9E\u65F6\u6D41\u6C34</span>
            <button class="btn btn-sm" onclick="loadLogs()">\u21BB \u5237\u65B0\u6D41\u6C34</button>
          </div>
          <div id="inFlightBox" class="sub-row" style="margin-bottom:10px">\u5F53\u524D\u65E0\u5728\u9014\u8BF7\u6C42</div>
          <div style="max-height:380px;overflow:auto">
            <table>
              <thead><tr><th>\u65F6\u95F4</th><th>\u6A21\u578B</th><th>\u500D\u7387</th><th>\u8D26\u53F7</th><th>\u72B6\u6001</th><th>TTFB/Tokens/\u901F\u7387</th><th>\u6263\u8D39</th></tr></thead>
              <tbody id="logsTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: USAGE & CREDIT BREAKDOWN -->
    <div id="tab-usage" class="hidden">
      <div class="toolbar">
        <label style="font-size:12px;color:#475569">\u6309\u5386\u53F2\u65E5\u671F\u67E5\u770B:</label>
        <select id="usageDateSelect" onchange="loadUsage(this.value)"></select>
        <button class="btn" onclick="loadUsage()">\u21BB \u5237\u65B0\u7EDF\u8BA1</button>
        <button class="btn btn-pink" onclick="resetUsage()">\u6E05\u7A7A\u672C\u5730\u7528\u91CF\u8D26\u672C</button>
      </div>
      <div class="grid-3" id="usageSummaryCards"></div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u8FD1 7 \u5929\u8BF7\u6C42\u4E0E Token \u8D70\u52BF</span></div>
          <div class="bar-chart" id="chart7d"></div>
        </div>
        <div class="card">
          <div class="card-title"><span>\u9009\u4E2D\u65E5 24 \u5C0F\u65F6\u70ED\u5EA6\u5206\u5E03</span></div>
          <div class="bar-chart" id="chart24h"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span>\u{1F4CA} \u6309\u6A21\u578B\u500D\u7387\u3001\u7F13\u5B58\u547D\u4E2D\u4E0E\u5B9E\u6D4B\u6263\u8D39\u6392\u884C</span></div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>\u6A21\u578B</th>
                <th>\u5B98\u65B9\u500D\u7387</th>
                <th>\u8BF7\u6C42 (\u6210\u529F/\u5931\u8D25)</th>
                <th>\u8F93\u5165/\u8F93\u51FA Token</th>
                <th>\u7F13\u5B58\u547D\u4E2D\u7387</th>
                <th>\u7D2F\u8BA1\u6263\u8D39</th>
                <th>\u5747\u8017 / 1k\u5355\u4EF7</th>
                <th>\u5747TTFB / \u541E\u5410</th>
              </tr>
            </thead>
            <tbody id="usageModelsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: WELFARE & TRAVEL & INVITE -->
    <div id="tab-welfare" class="hidden">
      <div class="toolbar">
        <select id="welfareUidSelect" onchange="loadWelfareAndInvite()"></select>
        <button class="btn btn-green" onclick="batchClaimAll()">\u{1F381} \u5168\u53F7\u4E00\u952E\u5403\u6EE1\u798F\u5229</button>
        <button class="btn" onclick="batchRunTravel()">\u{1F431} \u5168\u53F7\u5DE1\u68C0\u732B\u732B\u65C5\u884C</button>
        <button class="btn btn-amber" onclick="singleCheckin()">\u{1F4C5} \u5F53\u524D\u53F7\u6BCF\u65E5\u7B7E\u5230</button>
        <button class="btn" onclick="claimGiftAndComp()">\u{1F389} \u9886\u65B0\u624B\u793C/\u8865\u507F</button>
        <button class="btn" onclick="drawLottery()">\u{1F3B0} \u8FDE\u767B\u62BD\u4E00\u6B21</button>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">
            <span>\u{1F431} \u732B\u732B\u65C5\u884C\u7BA1\u5BB6</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm btn-green hidden" id="btnAdoptCat" onclick="adoptCat()">+ \u9886\u517B\u5C0F\u732B(+300\u5206)</button>
              <button class="btn btn-sm btn-amber hidden" id="btnClaimCat" onclick="claimCatReward()">\u{1F381} \u9886\u53D6\u5230\u7AD9\u5956\u52B1</button>
              <button class="btn btn-sm" onclick="runSingleTravel()">\u26A1 \u5355\u53F7\u81EA\u52A8\u8DD1</button>
            </div>
          </div>
          <div id="travelVisualBox" style="font-size:12px;line-height:1.7;margin-bottom:10px">\u9009\u62E9\u56FD\u5185\u7248\u8D26\u53F7\u67E5\u770B\u732B\u732B\u72B6\u6001...</div>
          <div style="display:flex;gap:6px;align-items:center;border-top:1px solid #edf2f7;padding-top:10px">
            <label style="font-size:11px;color:#475569">\u76EE\u7684\u5730:</label>
            <select id="travelLocSelect" style="flex:1">
              <option value="4">\u5730\u70B9 4 \xB7 \u53E4\u9547\u5BA2\u6808 (\u63A8\u8350)</option>
              <option value="1">\u5730\u70B9 1 \xB7 \u68EE\u6797\u8425\u5730</option>
              <option value="2">\u5730\u70B9 2 \xB7 \u6D77\u6EE8\u706F\u5854</option>
              <option value="3">\u5730\u70B9 3 \xB7 \u96EA\u5C71\u6728\u5C4B</option>
            </select>
            <button class="btn btn-sm" onclick="departTravel()">\u6D3E\u51FA\u65C5\u884C</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title">
            <span>\u{1F381} \u4E13\u5C5E\u9080\u8BF7\u4E0E\u53D7\u9080\u7ED1\u5B9A (v2)</span>
            <button class="btn btn-sm" onclick="loadWelfareAndInvite()">\u21BB \u5237\u65B0</button>
          </div>
          <div id="inviteBox" style="font-size:12px;line-height:1.8;margin-bottom:10px">\u52A0\u8F7D\u4E2D...</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <input id="bindInviteInput" placeholder="\u8F93\u5165\u63A8\u8350\u4EBA\u9080\u8BF7\u7801\u6216\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u7ED1\u5B9A" style="flex:1" />
            <button class="btn btn-green btn-sm" onclick="bindInvite()">\u7ACB\u5373\u7ED1\u5B9A</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>\u{1F525} \u8FDE\u767B\u91CC\u7A0B\u7891 \xB7 \u8865\u7B7E\u5361 \xB7 \u62BD\u5956\u6B21\u6570</span>
          <button class="btn btn-sm" onclick="runMakeupCard()">\u{1FA79} \u68C0\u67E5\u5E76\u7528\u8865\u7B7E\u5361</button>
        </div>
        <div id="streakVisualBox" style="font-size:12px">\u52A0\u8F7D\u4E2D...</div>
      </div>

      <div class="card">
        <div class="card-title"><span>\u{1F4CB} \u64CD\u4F5C\u6267\u884C\u7ED3\u679C\u660E\u7EC6</span><span id="welfareSummaryBadge" class="tag tag-global">\u5C31\u7EEA</span></div>
        <div id="welfareResultBox" style="font-size:12px;color:var(--text-dim)">\u70B9\u51FB\u4E0A\u65B9\u4EFB\u610F\u64CD\u4F5C\u6309\u94AE\u540E\uFF0C\u5C06\u5728\u6B64\u5C55\u793A\u6E05\u6670\u7684\u7ED3\u679C\u6C47\u603B\u4E0E\u5404\u8D26\u53F7\u660E\u7EC6\u3002</div>
      </div>
    </div>

    <!-- TAB 6: GROWTH TASKS -->
    <div id="tab-tasks" class="hidden">
      <div class="toolbar">
        <select id="tasksUidSelect" onchange="loadTasks()"></select>
        <button class="btn btn-green" onclick="runTasks(false)">\u26A1 \u4E00\u952E\u70B9\u4EAE\u5E76\u6536\u5272\u6210\u957F\u4EFB\u52A1</button>
        <button class="btn btn-amber" onclick="runTasks(true)">\u{1F310} \u5168\u53F7\u81EA\u52A8\u6210\u957F\u4EFB\u52A1</button>
        <button class="btn" onclick="runSchoolActivity(false)">\u{1F3EB} \u5F00\u5B66\u5B63\u4EFB\u52A1+\u8F6C\u76D8(\u5355\u53F7)</button>
        <button class="btn btn-green" onclick="runSchoolActivity(true)">\u{1F393} \u5168\u53F7\u5F00\u5B66\u5B63\u62BD\u5956</button>
        <button class="btn" onclick="runNightCat()">\u{1F989} \u6DF1\u591C\u732B\u732B(23-08\u70B9)</button>
        <button class="btn" onclick="loadTasks()">\u21BB \u5237\u65B0\u4EFB\u52A1</button>
      </div>
      <div class="card">
        <div class="card-title">
          <span>\u{1F393} \u5F00\u5B66\u5B63\u6D3B\u52A8 (school_open_day_2026) &amp; \u5927\u8F6C\u76D8\u62BD\u5956</span>
          <span id="schoolStatusBadge" class="tag tag-global">\u68C0\u6D4B\u4E2D...</span>
        </div>
        <div id="schoolVisualBox" style="font-size:12px;color:var(--text-dim)">\u9009\u62E9\u56FD\u5185\u7248\u8D26\u53F7\u540E\u81EA\u52A8\u663E\u793A\u5F00\u5B66\u5B63\u4EFB\u52A1\u8FDB\u5EA6\u3001\u5927\u8F6C\u76D8\u6B21\u6570\u53CA\u62BD\u5956\u6536\u83B7\u3002</div>
      </div>
      <div class="card">
        <div class="card-title"><span>\u{1F4CB} \u5168\u81EA\u52A8\u6210\u957F\u79EF\u5206\u4EFB\u52A1\u6E05\u5355 (\u652F\u6301\u8FDB/\u9886\u5956\u72B6\u6001\u5B9E\u65F6\u6838\u5BF9)</span><span id="tasksSummary"></span></div>
        <div id="tasksList"></div>
      </div>
    </div>

    <!-- TAB 7: SECURITY, ALERTS, USERS, SCHEDULE & DSH SETTINGS -->
    <div id="tab-settings" class="hidden">
      <div class="card">
        <div class="card-title"><span>\u7F51\u5173\u6838\u5FC3\u53C2\u6570\u4E0E\u81EA\u52A8\u5316\u7B56\u7565</span><button class="btn btn-green btn-sm" onclick="saveConfig()">\u{1F4BE} \u4FDD\u5B58\u6838\u5FC3\u53C2\u6570</button></div>
        <div class="form-grid">
          <div class="form-field"><label>\u7F51\u5173\u9274\u6743 API Key (\u7559\u7A7A\u4E0D\u6821\u9A8C):</label><input id="cfgApiKey" placeholder="sk-..." /></div>
          <div class="form-field"><label>HTTP \u4EE3\u7406 (\u5982 http://127.0.0.1:7890):</label><input id="cfgProxy" placeholder="\u7559\u7A7A\u76F4\u8FDE" /></div>
          <div class="form-field"><label>\u56FD\u5185\u7248 CN \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label><input id="cfgMaxCN" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>\u56FD\u9645\u7248 Global \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label><input id="cfgMaxGlobal" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>\u6392\u961F\u7B49\u5F85\u8D85\u65F6 (ms):</label><input id="cfgQueueTimeout" type="number" min="0" max="60000" /></div>
          <div class="form-field"><label>\u6D41\u5F0F\u7A7A\u95F2\u65AD\u8FDE\u8D85\u65F6 (ms):</label><input id="cfgIdleTimeout" type="number" min="10000" max="600000" /></div>
          <div class="form-field">
            <label>System Prompt \u6CE8\u5165\u6A21\u5F0F:</label>
            <select id="cfgPromptMode">
              <option value="none">\u5173\u95ED (\u4FDD\u6301\u539F\u6837)</option>
              <option value="append">\u8FFD\u52A0\u5230\u672B\u5C3E (append)</option>
              <option value="replace">\u5168\u5C40\u66FF\u6362 (replace)</option>
            </select>
          </div>
          <div class="form-field"><label>X-Device-Token \u6587\u4EF6\u8DEF\u5F84 (\u53EF\u9009):</label><input id="cfgDeviceToken" placeholder="~/.dsh/device_token" /></div>
        </div>
        <div class="form-field" style="margin-top:10px">
          <label>System Prompt \u81EA\u5B9A\u4E49\u6587\u672C:</label>
          <textarea id="cfgPromptText" rows="2"></textarea>
        </div>
        <div class="toolbar" style="margin-top:10px;margin-bottom:0">
          <label><input type="checkbox" id="cfgAutoCheckin" /> \u81EA\u52A8\u798F\u5229/\u7B7E\u5230</label>
          <label><input type="checkbox" id="cfgAutoTravel" /> \u81EA\u52A8\u732B\u732B\u65C5\u884C</label>
          <label><input type="checkbox" id="cfgAutoTasks" /> \u81EA\u52A8\u6210\u957F\u4EFB\u52A1</label>
          <label><input type="checkbox" id="cfgAutoRefresh" /> 5\u5206\u949F Token \u4FDD\u6D3B</label>
          <label><input type="checkbox" id="cfgPortalHome" /> \u9996\u9875(/)\u8BBE\u4E3A\u516C\u5F00\u95E8\u6237 (/console \u8FDB\u540E\u53F0)</label>
        </div>
      </div>

      <div class="grid-2">
        <!-- \u5B9A\u65F6\u5C0F\u65F6\u6392\u7A0B -->
        <div class="card">
          <div class="card-title"><span>\u23F0 CST \u6574\u70B9\u81EA\u52A8\u5316\u6392\u7A0B\u5C0F\u65F6</span><button class="btn btn-green btn-sm" onclick="saveScheduleConfig()">\u4FDD\u5B58\u6392\u7A0B</button></div>
          <div class="form-grid">
            <div class="form-field"><label>\u7B7E\u5230\u798F\u5229\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schCheckin" placeholder="9, 21" /></div>
            <div class="form-field"><label>\u732B\u732B\u65C5\u884C\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schTravel" placeholder="9, 21" /></div>
            <div class="form-field"><label>\u6210\u957F\u4EFB\u52A1\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schTasks" placeholder="11" /></div>
            <div class="form-field"><label>\u5F00\u5B66\u5B63\u6D3B\u52A8\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schSchool" placeholder="12" /></div>
            <div class="form-field"><label>\u6DF1\u591C\u732B\u732B\u5C0F\u65F6 (23-08):</label><input id="schCat" placeholder="1" /></div>
            <div class="form-field"><label>\u5168\u6C60\u4FDD\u6D3B\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schKeepalive" placeholder="22" /></div>
          </div>
        </div>

        <!-- \u63A7\u5236\u53F0\u5BC6\u7801\u4E0E\u7248\u672C\u81EA\u68C0 -->
        <div class="card">
          <div class="card-title"><span>\u{1F510} \u63A7\u5236\u53F0\u8BBF\u95EE\u5BC6\u7801 &amp; \u7248\u672C\u68C0\u6D4B</span><span id="pwStatusBadge" class="tag tag-cn">\u514D\u5BC6\u5355\u673A\u6A21\u5F0F</span></div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="cfgWebPassword" type="password" placeholder="\u8F93\u5165\u65B0\u63A7\u5236\u53F0\u5BC6\u7801 (\u7559\u7A7A\u70B9\u51FB\u4FDD\u5B58\u5219\u6E05\u9664\u5BC6\u7801)" style="flex:1" />
            <button class="btn btn-amber btn-sm" onclick="saveWebPassword()">\u8BBE\u7F6E/\u6E05\u9664\u5BC6\u7801</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf2f7;padding-top:10px">
            <span id="updateInfoSpan" style="font-size:12px;color:#475569">\u5F53\u524D\u7248\u672C: v${K} (${be})</span>
            <button class="btn btn-sm" onclick="checkUpdate()">\u68C0\u67E5 GitHub \u65B0\u7248\u672C</button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- IP \u767D\u540D\u5355 -->
        <div class="card">
          <div class="card-title"><span>\u{1F6E1}\uFE0F IP / CIDR \u8BBF\u95EE\u767D\u540D\u5355</span><button class="btn btn-green btn-sm" onclick="saveIPWhitelist()">\u4FDD\u5B58\u767D\u540D\u5355</button></div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="ipWlEnabled" /> \u542F\u7528\u767D\u540D\u5355\u6821\u9A8C</label>
            <label><input type="checkbox" id="ipWlLocal" checked /> \u59CB\u7EC8\u653E\u884C\u672C\u673A\u56DE\u73AF (127.0.0.1/::1)</label>
            <button class="btn btn-sm" onclick="addClientIP()">+ \u6DFB\u52A0\u5F53\u524D\u8BBF\u95EE IP</button>
          </div>
          <div id="ipRuntimeInfo" class="sub-row" style="margin-bottom:8px">\u5F53\u524D\u6765\u8BBF IP: -</div>
          <textarea id="ipWlList" rows="3" placeholder="\u6BCF\u884C\u6216\u9017\u53F7\u5206\u9694 IP / CIDR\uFF0C\u5982: 192.168.1.0/24, 10.0.0.5" style="width:100%"></textarea>
        </div>

        <!-- Webhook \u544A\u8B66 -->
        <div class="card">
          <div class="card-title">
            <span>\u{1F514} \u591A\u901A\u9053 Webhook \u98CE\u63A7\u544A\u8B66</span>
            <div style="display:flex;gap:6px">
              <button class="btn btn-amber btn-sm" onclick="testAlerts()">\u53D1\u9001\u6D4B\u8BD5\u544A\u8B66</button>
              <button class="btn btn-green btn-sm" onclick="saveAlerts()">\u4FDD\u5B58\u544A\u8B66</button>
            </div>
          </div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="alertEnabled" /> \u542F\u7528\u544A\u8B66</label>
            <label>\u4F4E\u79EF\u5206\u9608\u503C: <input id="alertMinCredit" type="number" style="width:72px" value="50" /></label>
          </div>
          <div class="toolbar" style="margin-bottom:8px;font-size:11px">
            <label><input type="checkbox" class="alert-evt" value="ban" checked /> \u5C01\u53F7/\u7981\u7528</label>
            <label><input type="checkbox" class="alert-evt" value="401" checked /> 401\u5931\u6548</label>
            <label><input type="checkbox" class="alert-evt" value="cooling" checked /> \u5168\u6C60\u51B7\u5374</label>
            <label><input type="checkbox" class="alert-evt" value="low_credit" checked /> \u4F4E\u79EF\u5206\u9884\u8B66</label>
          </div>
          <textarea id="alertHooks" rows="3" placeholder="Webhook URL (\u652F\u6301 \u98DE\u4E66 / \u4F01\u5FAE / \u9489\u9489 / Telegram / Discord / \u901A\u7528 JSON)" style="width:100%"></textarea>
        </div>
      </div>

      <!-- \u591A\u7528\u6237\u4E0E\u79DF\u6237\u914D\u989D\u7BA1\u63A7 -->
      <div class="card">
        <div class="card-title">
          <span>\u{1F465} \u591A\u79DF\u6237\u7528\u6237\u3001\u4E13\u5C5E API Key \u4E0E\u914D\u989D\u7BA1\u63A7</span>
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px"><input type="checkbox" id="allowRegChk" onchange="toggleAllowRegister(this.checked)" /> \u5F00\u653E\u7528\u6237\u81EA\u52A9\u6CE8\u518C</label>
            <button class="btn btn-sm" onclick="loadAdminUsers()">\u21BB \u5237\u65B0\u7528\u6237\u5217\u8868</button>
          </div>
        </div>
        <div class="toolbar" style="margin-bottom:10px">
          <input id="newUserName" placeholder="\u7528\u6237\u540D" style="width:120px" />
          <input id="newUserPass" type="password" placeholder="\u5BC6\u7801(\u22654\u4F4D)" style="width:120px" />
          <select id="newUserRole"><option value="user">\u666E\u901A\u7528\u6237</option><option value="admin">\u7BA1\u7406\u5458</option></select>
          <input id="newUserQuota" type="number" placeholder="\u65E5\u9650\u989D(0\u4E0D\u9650)" style="width:115px" />
          <input id="newUserRpm" type="number" placeholder="RPM(0\u4E0D\u9650)" style="width:105px" />
          <button class="btn btn-green btn-sm" onclick="createTenantUser()">+ \u65B0\u589E\u79DF\u6237</button>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>\u7528\u6237\u540D</th><th>\u89D2\u8272</th><th>\u4E13\u5C5E API Key</th><th>\u4ECA\u65E5\u5DF2\u8017 / \u65E5\u4E0A\u9650</th><th>RPM</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th></tr></thead>
            <tbody id="adminUsersTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- DSH \u6302\u8F7D\u68C0\u6D4B -->
      <div class="card">
        <div class="card-title">
          <span>\u{1F50C} DeepSeek Harness (DSH) \u684C\u9762\u7AEF\u914D\u7F6E\u68C0\u6D4B\u4E0E\u4E00\u952E\u540C\u6B65</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" onclick="checkDsh()">\u68C0\u6D4B\u72B6\u6001</button>
            <button class="btn btn-green btn-sm" onclick="syncDsh()">\u4E00\u952E\u540C\u6B65 baseURL</button>
          </div>
        </div>
        <div id="dshCheckBox" class="sub-row">\u70B9\u51FB\u300C\u68C0\u6D4B\u72B6\u6001\u300D\u68C0\u67E5\u672C\u673A cordis.patch.yml \u4E0E\u63D2\u4EF6\u6302\u8F7D</div>
      </div>

      <div class="card">
        <div class="card-title"><span>\u{1F50C} \u5176\u4ED6 IDE / CLI \u4E00\u952E\u63A5\u5165\u6307\u5357 (Claude Code \xB7 Codex \xB7 Cursor \xB7 Cline)</span></div>
        <div id="guideCardsGrid" class="grid-2" style="margin-bottom:0"></div>
      </div>
    </div>

    <!-- \u5E95\u90E8\u4E13\u5C5E\u54C1\u724C\u72B6\u6001\u4E0E\u5FEB\u901F\u94FE\u63A5 -->
    <footer style="margin-top:24px;padding:16px 4px 8px;border-top:1px solid #dbe5f1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--text-dim)">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:700;color:var(--blue)">\u26A1 WorkBuddy 2API</span>
        <span>\xB7 \u4F01\u4E1A\u7EA7\u9AD8\u5E76\u53D1\u591A\u8D26\u53F7\u8F6E\u8BE2\u4E0E\u6A21\u578B\u805A\u5408\u7F51\u5173</span>
      </div>
      <div style="display:flex;gap:14px;align-items:center">
        <a href="/healthz" target="_blank" style="color:var(--blue);text-decoration:none">\u5065\u5EB7\u63A2\u9488 (/healthz)</a>
        <a href="/portal" target="_blank" style="color:var(--blue);text-decoration:none">\u516C\u5F00\u95E8\u6237 (/portal)</a>
        <a href="https://github.com/XCool-603/dsh-workbuddy2api" target="_blank" style="color:var(--text-dim);text-decoration:none">GitHub \u4ED3\u5E93 \u2197</a>
      </div>
    </footer>
  </div>

  <!-- MODALS -->
  <div id="packsModal" class="modal-backdrop hidden">
    <div class="modal" style="width:680px">
      <div class="card-title"><span id="packsModalTitle">\u660E\u7EC6\u603B\u89C8</span><button class="btn btn-sm btn-pink" onclick="closeModal('packsModal')">\u5173\u95ED</button></div>
      <div id="packsModalToolbar" class="toolbar hidden">
        <button class="btn btn-sm" onclick="setOverviewRealm('all')">\u5168\u90E8</button>
        <button class="btn btn-sm btn-green" onclick="setOverviewRealm('cn')">\u56FD\u5185\u7248 CN</button>
        <button class="btn btn-sm" onclick="setOverviewRealm('global')">\u56FD\u9645\u7248 Global</button>
      </div>
      <div style="max-height:440px;overflow:auto">
        <table>
          <thead id="packsModalThead"><tr><th>\u540D\u79F0</th><th>\u7C7B\u578B</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr></thead>
          <tbody id="packsModalTbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="accountDetailModal" class="modal-backdrop hidden">
    <div class="modal" style="width:640px">
      <div class="card-title"><span id="accDetailTitle">\u8D26\u53F7\u8BE6\u7EC6\u6863\u6848</span><button class="btn btn-sm btn-pink" onclick="closeModal('accountDetailModal')">\u5173\u95ED</button></div>
      <div id="accDetailBody" style="font-size:12px;line-height:1.8"></div>
    </div>
  </div>

  <div id="updateTokenModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="updTokenTitle">\u4E00\u952E\u66F4\u65B0\u51ED\u8BC1 Token / \u6551\u6D3B\u8D26\u53F7</span><button class="btn btn-sm btn-pink" onclick="closeModal('updateTokenModal')">\u5173\u95ED</button></div>
      <input type="hidden" id="updTokenUid" />
      <div class="form-field" style="margin-bottom:10px"><label>\u65B0 Access Token (\u53EF\u9009):</label><textarea id="updAccessInput" rows="3"></textarea></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u65B0 Refresh Token (\u63A8\u8350):</label><textarea id="updRefreshInput" rows="3"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitUpdateToken()">\u9A8C\u8BC1\u5E76\u6551\u6D3B\u8D26\u53F7</button></div>
    </div>
  </div>

  <div id="addTokenModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>+ \u7C98\u8D34 Token \u6DFB\u52A0\u5355\u4E2A\u8D26\u53F7</span><button class="btn btn-sm btn-pink" onclick="closeModal('addTokenModal')">\u5173\u95ED</button></div>
      <div class="form-grid" style="margin-bottom:10px">
        <div class="form-field">
          <label>\u8D26\u53F7\u533A\u670D:</label>
          <select id="addTokenRealm"><option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option><option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option></select>
        </div>
        <div class="form-field">
          <label>\u5907\u6CE8\u6635\u79F0 (\u53EF\u9009):</label>
          <input id="addTokenNick" placeholder="\u5982\uFF1A\u4E3B\u529B\u6D4B\u8BD5\u53F7" />
        </div>
      </div>
      <div class="form-field" style="margin-bottom:12px">
        <label>\u7C98\u8D34 Refresh Token \u6216 Access Token:</label>
        <textarea id="addTokenValue" rows="4" placeholder="\u652F\u6301\u81EA\u52A8\u8BC6\u522B JWT UID\uFF0C\u4F18\u5148\u586B Refresh Token \u53EF\u957F\u671F\u81EA\u52A8\u4FDD\u6D3B"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-green" onclick="submitAddToken()">\u{1F680} \u9A8C\u8BC1\u8FDE\u901A\u5E76\u5165\u6C60</button>
      </div>
    </div>
  </div>

  <div id="importModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>\u6279\u91CF\u5BFC\u5165\u8D26\u53F7 (ZIP / JSON / token----refreshToken)</span><button class="btn btn-sm btn-pink" onclick="closeModal('importModal')">\u5173\u95ED</button></div>
      <div class="form-field" style="margin-bottom:10px">
        <label>\u9ED8\u8BA4\u533A\u670D\uFF08\u65E0\u660E\u786E\u6807\u8BB0\u65F6\u751F\u6548\uFF09:</label>
        <select id="importRealm"><option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option><option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option></select>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>\u4E0A\u4F20 .zip / .json / .txt \u6587\u4EF6:</label><input type="file" id="importFileInput" accept=".zip,.json,.txt,.info" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u6216\u76F4\u63A5\u7C98\u8D34\u6587\u672C:</label><textarea id="importTextarea" rows="7" placeholder="accessToken----refreshToken \u6216 JSON"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitImport()">\u{1F680} \u9A8C\u8BC1\u8FDE\u901A\u5E76\u5BFC\u5165</button></div>
      <div id="importResultBox" class="hidden" style="margin-top:12px"></div>
    </div>
  </div>

  <div id="oauthModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="oauthTitle">OAuth \u6388\u6743\u767B\u5F55</span><button class="btn btn-sm btn-pink" onclick="closeOAuthModal()">\u53D6\u6D88</button></div>
      <p style="font-size:12px;color:var(--text-dim)">\u8BF7\u5728\u65B0\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u5B8C\u6210\u767B\u5F55\u6388\u6743\uFF0C\u63A7\u5236\u53F0\u6B63\u5728\u81EA\u52A8\u8F6E\u8BE2\u56DE\u8C03...</p>
      <div style="margin:10px 0"><a id="oauthLink" href="#" target="_blank" style="color:var(--cyan);word-break:break-all;font-size:12px"></a></div>
      <div id="oauthStatusText" class="tag tag-warn">\u7B49\u5F85\u7528\u6237\u5B8C\u6210\u7F51\u9875\u6388\u6743...</div>
    </div>
  </div>

  <div id="loginModal" class="modal-backdrop hidden">
    <div class="modal" style="width:420px">
      <div class="card-title"><span>\u{1F510} WorkBuddy 2API \u63A7\u5236\u53F0\u9274\u6743</span></div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        <button class="btn btn-sm" id="tabLoginBtn" onclick="switchAuthTab('login')">\u5BC6\u7801\u767B\u5F55</button>
        <button class="btn btn-sm hidden" id="tabRegBtn" onclick="switchAuthTab('register')">\u6CE8\u518C\u8D26\u53F7</button>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>\u7528\u6237\u540D:</label><input id="loginUser" value="admin" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u5BC6\u7801:</label><input id="loginPass" type="password" onkeydown="if(event.key==='Enter')submitAuth()" /></div>
      <button class="btn btn-green" style="width:100%;justify-content:center" onclick="submitAuth()">\u767B\u5F55\u8FDB\u5165\u63A7\u5236\u53F0</button>
      <div id="loginErrBox" style="color:var(--magenta);font-size:12px;margin-top:8px"></div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script>
    const API = (window.__WB2A_API_ORIGIN__ || '') + '/plugins/dsh-workbuddy2api';
    function getApiOrigin() { return window.__WB2A_API_ORIGIN__ || window.location.origin; }
    function openExternalUrl(url) {
      if (typeof window.__wb2aOpenExternal === 'function') window.__wb2aOpenExternal(url);
      else window.open(url, '_blank');
    }
    async function askConfirm(msg) {
      if (typeof window.__wb2aConfirm === 'function') return window.__wb2aConfirm(msg);
      return window.confirm(msg);
    }
    async function askPrompt(msg, defVal) {
      if (typeof window.__wb2aPrompt === 'function') return window.__wb2aPrompt(msg, defVal);
      return window.prompt(msg, defVal);
    }
    let state = { accounts: [], activeUid: null, summary: {}, models: [], aliases: {}, modelRoutes: {}, autoFreeEnabled: true, freeModels: [], config: {}, runtimeNetwork: {}, auth: {} };
    let oauthPollTimer = null;
    let pgAttachment = null; // { kind: 'image' | 'text', name, data }
    let overviewMode = 'packs';
    let overviewRealm = 'all';
    let authMode = 'login';

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    async function api(path, opts = {}) {
      const res = await fetch(API + path, opts);
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 && data.authRequired) {
        showLoginModal(true);
      }
      return data;
    }

    function showLoginModal(allowReg = false) {
      document.getElementById('tabRegBtn').classList.toggle('hidden', !state.auth?.allowRegister && !allowReg);
      document.getElementById('loginModal').classList.remove('hidden');
    }

    function switchAuthTab(mode) { authMode = mode; document.getElementById('loginErrBox').textContent = ''; }

    async function submitAuth() {
      const username = document.getElementById('loginUser').value.trim() || 'admin';
      const password = document.getElementById('loginPass').value;
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const res = await fetch(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        document.getElementById('loginErrBox').textContent = data.error || '\u8BA4\u8BC1\u5931\u8D25';
        return;
      }
      if (authMode === 'register') {
        authMode = 'login';
        toast('\u6CE8\u518C\u6210\u529F\uFF0C\u8BF7\u767B\u5F55');
        return;
      }
      closeModal('loginModal');
      loadStatus(true);
    }

    async function doLogout() {
      await fetch(API + '/auth/logout', { method: 'POST' });
      showLoginModal(true);
    }

    function switchTab(tab) {
      const tabs = ['pool', 'models', 'playground', 'usage', 'welfare', 'tasks', 'settings'];
      tabs.forEach((t, idx) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
        document.querySelectorAll('.nav-btn')[idx].classList.toggle('active', t === tab);
      });
      if (tab === 'welfare') loadWelfareAndInvite();
      if (tab === 'tasks') loadTasks();
      if (tab === 'models') loadModels();
      if (tab === 'playground') { loadModels(); loadLogs(); }
      if (tab === 'usage') loadUsage();
      if (tab === 'settings') { renderSettings(); loadAdminUsers(); checkDsh(); }
    }

    async function loadStatus(refresh = false) {
      try {
        const data = await api('/status' + (refresh ? '?refresh=1' : ''));
        if (!data.ok) return;
        state.accounts = data.accounts || [];
        state.activeUid = data.activeUid;
        state.summary = data.summary || {};
        state.aliases = data.aliases || {};
        state.modelRoutes = data.modelRoutes || {};
        state.autoFreeEnabled = data.autoFreeEnabled !== false;
        state.enabledModels = data.enabledModels || [];
        state.config = data.config || {};
        state.runtimeNetwork = data.runtimeNetwork || {};
        state.auth = data.auth || {};
        document.getElementById('gatewayBadge').textContent = 'ONLINE v' + (data.serviceVersion || '${K}') + ' :' + (data.gatewayPort || ${e});
        const ub = document.getElementById('userBadge');
        const lb = document.getElementById('logoutBtn');
        if (state.auth.hasPassword && state.auth.currentUser) {
          ub.textContent = state.auth.currentUser.username + ' (' + state.auth.currentUser.role + ')';
          ub.classList.remove('hidden');
          lb.classList.remove('hidden');
        } else {
          ub.classList.add('hidden');
          lb.classList.add('hidden');
        }
        renderSummary();
        renderAccounts();
        syncUidSelectors();
        renderSettings();
      } catch (e) {
        toast('\u52A0\u8F7D\u72B6\u6001\u5931\u8D25: ' + e.message);
      }
    }

    function renderSummary() {
      const s = state.summary || {};
      const all = s.all || {}; const cn = s.cn || {}; const gl = s.global || {};
      document.getElementById('realmSummaryCards').innerHTML = [
        { title: '\u5168\u6C60\u5408\u8BA1 (All)', kpi: all.remain, sub: '\u5065\u5EB7 ' + (all.healthyCount||0) + ' / \u542F\u7528 ' + (all.enabledCount||0) + ' / \u5171 ' + (all.count||0) + ' | \u57FA ' + (all.baseRemain||0) + ' \u8D60 ' + (all.bonusRemain||0), cls: '' },
        { title: '\u56FD\u5185\u7248 (CodeBuddy CN)', kpi: cn.remain, sub: '\u53EF\u7528 ' + (cn.enabledCount||0) + '/' + (cn.count||0) + ' | \u603B\u989D ' + (cn.total||0), cls: 'green' },
        { title: '\u56FD\u9645\u7248 (WorkBuddy AI)', kpi: gl.remain, sub: '\u53EF\u7528 ' + (gl.enabledCount||0) + '/' + (gl.count||0) + ' | 7\u65E5\u5230\u671F ' + (gl.expiringRemain||0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0;cursor:pointer" onclick="openOverviewModal(\\'balance\\')"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + Number(c.kpi||0).toLocaleString() + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
    }

    function renderAccounts() {
      const tbody = document.getElementById('accountsTbody');
      document.getElementById('poolCountInfo').textContent = '\u5171 ' + state.accounts.length + ' \u4E2A\u8D26\u53F7';
      tbody.innerHTML = state.accounts.map(acc => {
        const b = acc.balance || {};
        const d = acc.diagnostics || {};
        const isAct = acc.uid === state.activeUid;
        const realmTag = acc.realm === 'global' ? '<span class="tag tag-global">GLOBAL</span>' : '<span class="tag tag-cn">CN</span>';
        let healthTag = '<span class="tag tag-cn">\u5065\u5EB7</span>';
        if (acc.manualDisabled) healthTag = '<span class="tag tag-err">\u624B\u52A8\u505C\u7528</span>';
        else if (acc.disabled) healthTag = '<span class="tag tag-err">\u81EA\u52A8\u7981\u7528</span>';
        else if (d.coolingDown) healthTag = '<span class="tag tag-warn">\u51B7\u5374 ' + (d.cooldownRemainingSec||0) + 's</span>';
        else if (d.modelCooldowns && d.modelCooldowns.length > 0) healthTag = '<span class="tag tag-warn">' + d.modelCooldowns.length + '\u6A21\u578B\u9650\u6D41</span>';
        const chkTag = acc.checkinState ? (' <span class="tag ' + (acc.checkinState.ok ? 'tag-cn' : 'tag-warn') + '">' + (acc.checkinState.ok ? '\u4ECA\u65E5\u5DF2\u7B7E' : '\u5F85\u91CD\u8BD5') + '</span>') : '';
        const pkgText = '\u57FA:' + (b.baseRemain||0) + ' \u8D60:' + (b.bonusRemain||0) + ' \u8D2D:' + (b.purchasedRemain||0);
        return '<tr>' +
          '<td><strong>' + escapeHtml(acc.nickname || acc.uid) + '</strong>' + (isAct ? ' <span class="tag tag-cn">\u4F18\u5148</span>' : '') + '<br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(acc.uid) + '</span></td>' +
          '<td>' + realmTag + '</td>' +
          '<td style="font-weight:700;color:var(--cyan)">' + Number(b.remain || 0).toLocaleString() + '<br><span style="color:var(--text-dim);font-size:10px">/ ' + Number(b.total || 0).toLocaleString() + '</span></td>' +
          '<td style="font-size:11px;color:var(--text-dim)">' + pkgText + '<br>\u6D3B\u8DC3\u5305: ' + (b.activePackCount||0) + ' <button class="btn btn-sm" style="padding:1px 6px;margin-left:4px" onclick="openPacksModal(\\'' + acc.uid + '\\')">\u660E\u7EC6</button></td>' +
          '<td>' + healthTag + chkTag + '<br><span style="font-size:10px;color:var(--text-dim)">\u6210\u529F:' + (d.stats?.successCount||0) + ' \u5931\u8D25:' + (d.stats?.failCount||0) + '</span></td>' +
          '<td>' + (acc.inFlight || 0) + ' / ' + (d.limit || 3) + '</td>' +
          '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
            (isAct ? '' : '<button class="btn btn-sm" onclick="switchAcc(\\'' + acc.uid + '\\')">\u4F18\u5148</button>') +
            '<button class="btn btn-sm" onclick="openAccountDetail(\\'' + acc.uid + '\\')">\u8BE6\u60C5</button>' +
            '<button class="btn btn-sm" onclick="openUpdateToken(\\'' + acc.uid + '\\')">\u6362Token</button>' +
            (acc.manualDisabled
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'manualEnable\\')">\u6062\u590D</button>'
              : '<button class="btn btn-sm btn-pink" onclick="adminAction(\\'' + acc.uid + '\\', \\'disable\\')">\u505C\u7528</button>') +
            ((acc.disabled || d.coolingDown || (d.modelCooldowns && d.modelCooldowns.length))
              ? '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + acc.uid + '\\', \\'revive\\')">\u590D\u6D3B/\u89E3\u7194\u65AD</button>' : '') +
            '<button class="btn btn-sm btn-pink" onclick="deleteAcc(\\'' + acc.uid + '\\')">\u5220</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function syncUidSelectors() {
      const opts = state.accounts.map(a => '<option value="' + a.uid + '" ' + (a.uid === state.activeUid ? 'selected' : '') + '>[' + a.realm.toUpperCase() + '] ' + escapeHtml(a.nickname) + '</option>').join('');
      const wSel = document.getElementById('welfareUidSelect');
      const tSel = document.getElementById('tasksUidSelect');
      const prevW = wSel.value; const prevT = tSel.value;
      wSel.innerHTML = opts; tSel.innerHTML = opts;
      if (prevW) wSel.value = prevW; if (prevT) tSel.value = prevT;
    }

    async function switchAcc(uid) { await api('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('\u5DF2\u5207\u6362\u4F18\u5148\u8D26\u53F7'); loadStatus(); }
    async function deleteAcc(uid) { if (!(await askConfirm('\u786E\u8BA4\u5220\u9664 ' + uid + ' \u5417\uFF1F'))) return; await api('/accounts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('\u5DF2\u5220\u9664'); loadStatus(); }
    async function adminAction(uid, action) {
      toast('\u6267\u884C ' + action + ' ...');
      const res = await api('/accounts/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, action }) });
      toast(res.message || (res.ok ? '\u6210\u529F' : res.error));
      loadStatus(action === 'refresh' || action === 'trial');
    }
    async function refreshAllTokens() { toast('\u6B63\u5728\u6279\u91CF\u5237\u65B0...'); const res = await api('/accounts/refresh-all', { method: 'POST' }); toast('\u5237\u65B0: \u6210\u529F ' + res.refreshed + ', \u5931\u8D25 ' + res.failed); loadStatus(true); }
    async function clearAllCooldowns() { const res = await api('/accounts/clear-all-cooldowns', { method: 'POST' }); toast('\u5DF2\u6E05\u7406 ' + (res.cleared || 0) + ' \u6761\u51B7\u5374'); loadStatus(); }
    async function batchCheckin() { toast('\u6B63\u5728\u6279\u91CF\u7B7E\u5230...'); const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }); toast(res.message || '\u5B8C\u6210'); loadStatus(true); }
    async function batchTrial() { toast('\u6B63\u5728\u4E3A\u56FD\u9645\u7248\u8D26\u53F7\u6279\u91CF\u9886 Trial...'); const res = await api('/trial/batch', { method: 'POST' }); toast('\u6267\u884C\u5B8C\u6210: ' + (res.results?.length || 0) + ' \u4E2A'); loadStatus(true); }

    function openUpdateToken(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      document.getElementById('updTokenUid').value = uid;
      document.getElementById('updTokenTitle').textContent = '\u66F4\u65B0\u51ED\u8BC1 \u2014 ' + (acc?.nickname || uid);
      document.getElementById('updAccessInput').value = '';
      document.getElementById('updRefreshInput').value = '';
      document.getElementById('updateTokenModal').classList.remove('hidden');
    }
    async function submitUpdateToken() {
      const uid = document.getElementById('updTokenUid').value;
      const accessToken = document.getElementById('updAccessInput').value.trim();
      const refreshToken = document.getElementById('updRefreshInput').value.trim();
      const res = await api('/accounts/update_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, accessToken, refreshToken })
      });
      toast(res.message || res.error || '\u5B8C\u6210');
      if (res.ok) { closeModal('updateTokenModal'); loadStatus(true); }
    }

    async function openAccountDetail(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('accDetailTitle').textContent = (acc.nickname || uid) + ' (' + acc.realm.toUpperCase() + ') \u8BE6\u60C5';
      const d = acc.diagnostics || {};
      const b = acc.balance || {};
      const invRes = await api('/invite/info?uid=' + encodeURIComponent(uid)).catch(() => ({}));
      const inv = invRes.info || {};
      document.getElementById('accDetailBody').innerHTML =
        '<div><strong>UID:</strong> ' + escapeHtml(acc.uid) + ' | <strong>\u72B6\u6001:</strong> ' + (acc.disabledReason || acc.manualDisabledReason || '\u6B63\u5E38') + '</div>' +
        '<div><strong>\u5269\u4F59\u79EF\u5206:</strong> ' + (b.remain || 0) + ' / ' + (b.total || 0) + ' (7\u65E5\u8FC7\u671F: ' + (b.expiringRemain || 0) + ')</div>' +
        '<div><strong>\u4E13\u5C5E\u9080\u8BF7\u7801:</strong> ' + escapeHtml(inv.inviteCode || '-') + ' | <strong>\u53D7\u9080\u4EBA\u6570:</strong> ' + (inv.invitedCount || 0) + '</div>' +
        '<div style="margin-top:8px"><strong>\u6A21\u578B\u7EA7\u9650\u6D41\u51B7\u5374:</strong> ' + ((d.modelCooldowns || []).map(c => c.model + '(' + c.remainingSec + 's)').join(', ') || '\u65E0') + '</div>' +
        '<div class="toolbar" style="margin-top:12px">' +
          '<button class="btn btn-sm" onclick="adminAction(\\'' + uid + '\\', \\'refresh\\')">\u5237\u65B0\u4F59\u989D\u4E0EToken</button>' +
          (acc.realm === 'global' ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + uid + '\\', \\'trial\\')">\u9886\u53D6 Trial</button>' : '') +
          '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + uid + '\\', \\'revive\\')">\u89E3\u9664\u51B7\u5374\u590D\u6D3B</button>' +
        '</div>';
      document.getElementById('accountDetailModal').classList.remove('hidden');
    }

    function openOverviewModal(mode) {
      overviewMode = mode;
      document.getElementById('packsModalToolbar').classList.remove('hidden');
      renderOverviewBody();
      document.getElementById('packsModal').classList.remove('hidden');
    }
    function setOverviewRealm(r) { overviewRealm = r; renderOverviewBody(); }
    function renderOverviewBody() {
      const accs = state.accounts.filter(a => overviewRealm === 'all' || a.realm === overviewRealm);
      if (overviewMode === 'balance') {
        document.getElementById('packsModalTitle').textContent = '\u5168\u6C60\u8D26\u53F7\u4F59\u989D\u603B\u89C8 (' + accs.length + '\u4E2A)';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>\u8D26\u53F7</th><th>\u533A\u670D</th><th>\u5269\u4F59\u79EF\u5206</th><th>\u57FA\u7840/\u8D60\u9001/\u8D2D\u4E70</th><th>7\u65E5\u8FC7\u671F</th><th>\u72B6\u6001</th></tr>';
        document.getElementById('packsModalTbody').innerHTML = accs.map(a => {
          const b = a.balance || {};
          return '<tr><td><strong>' + escapeHtml(a.nickname) + '</strong></td><td>' + a.realm + '</td><td style="color:var(--cyan);font-weight:700">' + (b.remain || 0) + '</td><td>' + (b.baseRemain||0) + '/' + (b.bonusRemain||0) + '/' + (b.purchasedRemain||0) + '</td><td>' + (b.expiringRemain||0) + '</td><td>' + (a.disabled || a.manualDisabled ? '\u505C\u7528' : '\u6D3B\u8DC3') + '</td></tr>';
        }).join('');
      } else {
        document.getElementById('packsModalTitle').textContent = '\u5168\u6C60\u79EF\u5206\u5305\u660E\u7EC6\u6C47\u603B';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>\u6240\u5C5E\u8D26\u53F7</th><th>\u5305\u540D\u79F0</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr>';
        const rows = [];
        for (const a of accs) {
          for (const p of (a.balance?.packages || [])) {
            rows.push('<tr><td>' + escapeHtml(a.nickname) + ' (' + a.realm + ')</td><td>' + escapeHtml(p.name) + '</td><td style="color:var(--cyan);font-weight:700">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '\u6C38\u4E45') + '</td></tr>');
          }
        }
        document.getElementById('packsModalTbody').innerHTML = rows.join('') || '<tr><td colspan="6">\u6682\u65E0\u6D3B\u8DC3\u79EF\u5206\u5305</td></tr>';
      }
    }

    function openPacksModal(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('packsModalToolbar').classList.add('hidden');
      const packs = acc.balance?.packages || [];
      document.getElementById('packsModalTitle').textContent = (acc.nickname || uid) + ' \u2014 \u79EF\u5206\u5305\u660E\u7EC6 (' + packs.length + '\u4E2A)';
      document.getElementById('packsModalThead').innerHTML = '<tr><th>\u79EF\u5206\u5305\u540D\u79F0</th><th>\u7C7B\u578B</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr>';
      document.getElementById('packsModalTbody').innerHTML = packs.map(p =>
        '<tr><td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(p.type || '-') + '</td><td style="font-weight:700;color:var(--cyan)">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '\u6C38\u4E45') + '</td></tr>'
      ).join('') || '<tr><td colspan="6" style="color:var(--text-dim)">\u6682\u65E0\u6FC0\u6D3B\u79EF\u5206\u5305\u8BB0\u5F55</td></tr>';
      document.getElementById('packsModal').classList.remove('hidden');
    }

    async function startOAuth(realm) {
      const res = await api('/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm }) });
      if (!res.ok) return toast('\u53D1\u8D77\u5931\u8D25: ' + res.error);
      document.getElementById('oauthTitle').textContent = (realm === 'global' ? '\u56FD\u9645\u7248 WorkBuddy AI' : '\u56FD\u5185\u7248 CodeBuddy') + ' OAuth \u767B\u5F55';
      document.getElementById('oauthLink').href = res.url; document.getElementById('oauthLink').textContent = res.url;
      document.getElementById('oauthModal').classList.remove('hidden');
      openExternalUrl(res.url);
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = setInterval(async () => {
        const poll = await api('/oauth/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm, state: res.state }) });
        if (poll.success) {
          clearInterval(oauthPollTimer); oauthPollTimer = null;
          closeModal('oauthModal'); toast('\u767B\u5F55\u6210\u529F: ' + (poll.account?.account?.nickname || '\u65B0\u8D26\u53F7')); loadStatus(true);
        }
      }, 2000);
    }
    function closeOAuthModal() { if (oauthPollTimer) clearInterval(oauthPollTimer); oauthPollTimer = null; closeModal('oauthModal'); }
    function openImportModal() { document.getElementById('importResultBox').classList.add('hidden'); document.getElementById('importModal').classList.remove('hidden'); }
    function openAddTokenModal() {
      document.getElementById('addTokenValue').value = '';
      document.getElementById('addTokenNick').value = '';
      document.getElementById('addTokenModal').classList.remove('hidden');
    }
    async function submitAddToken() {
      const token = document.getElementById('addTokenValue').value.trim();
      const nickname = document.getElementById('addTokenNick').value.trim();
      const realm = document.getElementById('addTokenRealm').value || 'global';
      if (!token) return toast('\u8BF7\u5148\u7C98\u8D34 Access \u6216 Refresh Token');
      toast('\u6B63\u5728\u9A8C\u8BC1\u8D26\u53F7\u8FDE\u901A\u6027\u5E76\u5165\u6C60...');
      const res = await api('/accounts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, realm, nickname }) });
      if (!res.ok) return toast('\u274C \u6DFB\u52A0\u5931\u8D25: ' + (res.error || '\u672A\u77E5\u9519\u8BEF'));
      closeModal('addTokenModal');
      toast('\u2705 \u5DF2\u6DFB\u52A0\u8D26\u53F7: ' + (res.account?.account?.nickname || '\u65B0\u8D26\u53F7'));
      loadStatus(true);
    }
    async function submitImport() {
      const realm = document.getElementById('importRealm').value;
      const fileEl = document.getElementById('importFileInput');
      let payload = { defaultRealm: realm, content: document.getElementById('importTextarea').value };
      if (fileEl.files && fileEl.files[0]) {
        const bytes = new Uint8Array(await fileEl.files[0].arrayBuffer());
        let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        payload = { defaultRealm: realm, base64Zip: btoa(bin) };
      }
      const res = await api('/accounts/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const box = document.getElementById('importResultBox');
      const items = res.details || res.results || res.items || [];
      const rowsHtml = items.slice(0, 30).map(it =>
        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e2e8f0;font-size:11px">' +
          '<span><strong>' + escapeHtml(it.nickname || it.uid || '\u672A\u547D\u540D') + '</strong> \xB7 ' + escapeHtml(it.realm || realm) + '</span>' +
          '<span class="tag ' + (it.ok !== false ? 'tag-cn' : 'tag-err') + '">' + escapeHtml(it.status || (it.ok !== false ? '\u6210\u529F' : (it.error || '\u5931\u8D25'))) + '</span>' +
        '</div>'
      ).join('');
      box.innerHTML =
        '<div style="padding:10px;border-radius:8px;background:#f8fafc;border:1px solid #dbe5f1">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:' + (rowsHtml ? '8px' : '0') + '">' +
            '<span class="tag tag-cn">\u2705 \u65B0\u589E ' + (res.imported || 0) + ' \u4E2A</span>' +
            '<span class="tag tag-global">\u{1F504} \u66F4\u65B0 ' + (res.updated || 0) + ' \u4E2A</span>' +
            '<span class="tag ' + ((res.failed || 0) > 0 ? 'tag-err' : 'tag-cn') + '">\u274C \u5931\u8D25 ' + (res.failed || 0) + ' \u4E2A</span>' +
            (res.error ? '<span style="font-size:11px;color:var(--magenta)">' + escapeHtml(res.error) + '</span>' : (!res.total ? '<span style="font-size:11px;color:var(--amber)">\u672A\u8BC6\u522B\u5230\u6709\u6548\u8D26\u53F7\uFF0C\u8BF7\u68C0\u67E5\u7C98\u8D34\u683C\u5F0F</span>' : '')) +
          '</div>' +
          rowsHtml +
        '</div>';
      box.classList.remove('hidden');
      toast('\u5BFC\u5165\u5B8C\u6210: \u65B0\u589E ' + (res.imported || 0) + ' / \u66F4\u65B0 ' + (res.updated || 0) + ' / \u5931\u8D25 ' + (res.failed || 0)); loadStatus(true);
    }
    function exportZip() {
      if (typeof window.__wb2aExportZip === 'function') window.__wb2aExportZip();
      else window.location.href = API + '/accounts/export.zip';
    }

    function setWelfareResult(summary, badgeText, badgeCls, rowsHtml) {
      const b = document.getElementById('welfareSummaryBadge');
      if (b) { b.textContent = badgeText || '\u5B8C\u6210'; b.className = 'tag ' + (badgeCls || 'tag-cn'); }
      const box = document.getElementById('welfareResultBox');
      if (box) {
        box.innerHTML = '<div style="font-weight:600;color:#0f172a;margin-bottom:8px">' + escapeHtml(summary) + '</div>' + (rowsHtml || '');
      }
    }

    function renderBatchAccountTable(items, mode) {
      if (!Array.isArray(items) || items.length === 0) return '<div class="sub-row">\u672C\u6B21\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u56FD\u5185\u7248\u6216\u53EF\u7528\u8D26\u53F7\u3002</div>';
      return '<div style="overflow-x:auto"><table><thead><tr><th>\u8D26\u53F7</th><th>\u72B6\u6001</th><th>\u7ED3\u679C\u8BE6\u60C5</th><th>\u6536\u76CA</th></tr></thead><tbody>' +
        items.map(it => {
          let detail = it.message || it.summary || it.status || '-';
          let gain = '-';
          let ok = it.ok !== false && it.status !== 'error' && it.status !== 'adopt_failed';
          if (mode === 'travel') {
            const acts = it.results?.actions || [];
            detail = acts.length ? acts.map(a => a.message || a.action).join('\uFF1B') : (it.detail || it.reason || it.status || '\u5DF2\u5B8C\u6210');
            const c = acts.reduce((acc, a) => acc + Number(a.rewardCredit || 0), 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
          } else if (mode === 'welfare') {
            const c = Number(it.totalCreditsGained || 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
            const steps = Array.isArray(it.log) ? it.log.filter(l => l.ok && l.message).slice(0, 3).map(l => l.message).join(' \xB7 ') : '';
            if (steps) detail = steps;
          } else if (mode === 'school') {
            const c = Number(it.creditGained || 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
            detail = it.summary || it.message || it.error || '\u5DF2\u5B8C\u6210';
          }
          return '<tr><td><strong>' + escapeHtml(it.nickname || it.uid || '-') + '</strong></td>' +
            '<td><span class="tag ' + (ok ? 'tag-cn' : 'tag-warn') + '">' + (ok ? '\u6210\u529F' : '\u8DF3\u8FC7/\u5F02\u5E38') + '</span></td>' +
            '<td>' + escapeHtml(detail) + '</td>' +
            '<td style="font-weight:700;color:var(--emerald)">' + escapeHtml(gain) + '</td></tr>';
        }).join('') +
      '</tbody></table></div>';
    }

    async function loadWelfareAndInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid; if (!uid) return;
      const [tr, gr, inv] = await Promise.all([
        api('/travel/status?uid=' + encodeURIComponent(uid)),
        api('/growth/status?uid=' + encodeURIComponent(uid)),
        api('/invite/info?uid=' + encodeURIComponent(uid))
      ]);
      const trBox = document.getElementById('travelVisualBox');
      const btnAdopt = document.getElementById('btnAdoptCat');
      const btnClaim = document.getElementById('btnClaimCat');
      if (!tr.ok || tr.travel?.isGlobal) {
        btnAdopt.classList.add('hidden'); btnClaim.classList.add('hidden');
        trBox.innerHTML = '<span class="tag tag-global">\u56FD\u9645\u7248\u65E0\u732B\u732B\u4F53\u7CFB</span> <span style="color:var(--text-dim)">' + escapeHtml(tr.travel?.message || tr.message || '\u8BF7\u5207\u6362 CN \u56FD\u5185\u7248\u8D26\u53F7') + '</span>';
      } else {
        const buddy = tr.buddy;
        const ts = tr.travel || {};
        btnAdopt.classList.toggle('hidden', Boolean(buddy));
        btnClaim.classList.toggle('hidden', ts.state !== 'arrived');
        const stMap = { idle: '\u7A7A\u95F2\u5F85\u6D3E\u51FA', traveling: '\u65C5\u884C\u63A2\u7D22\u4E2D', arrived: '\u{1F389} \u5DF2\u5230\u7AD9\u53EF\u9886\u5956', unsupported: '\u4E0D\u652F\u6301', error: '\u67E5\u8BE2\u5F02\u5E38' };
        const stCls = ts.state === 'arrived' ? 'tag-cn' : ts.state === 'traveling' ? 'tag-global' : 'tag-warn';
        trBox.innerHTML =
          '<div><strong>\u5BA0\u7269\u6863\u6848:</strong> ' + (buddy ? ('<span class="tag tag-cn">' + escapeHtml(buddy.name) + '</span>') : '<span class="tag tag-warn">\u5C1A\u672A\u9886\u517B\uFF08\u70B9\u53F3\u4E0A\u89D2\u9886\u517B\u9001 300 \u5206\uFF09</span>') + '</div>' +
          '<div style="margin-top:4px"><strong>\u65C5\u884C\u72B6\u6001:</strong> <span class="tag ' + stCls + '">' + escapeHtml(stMap[ts.state] || ts.state || '\u672A\u77E5') + '</span>' +
          ' \xB7 \u5F85\u9886\u5956\u52B1: <strong style="color:var(--emerald)">+' + (ts.rewardCredit || 0) + ' \u79EF\u5206</strong>' +
          (ts.dailyLimitReached ? ' \xB7 <span class="tag tag-err">\u4ECA\u65E5\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650</span>' : '') + '</div>';
      }

      document.getElementById('inviteBox').innerHTML = inv.ok
        ? '<div><strong>\u4E13\u5C5E\u9080\u8BF7\u7801:</strong> <span style="color:var(--cyan);font-weight:700;font-size:14px">' + escapeHtml(inv.info.inviteCode || '\u6682\u672A\u5206\u914D') + '</span></div>' +
          '<div><strong>\u9080\u8BF7\u6218\u7EE9:</strong> \u5DF2\u9080 <strong>' + (inv.info.invitedCount || 0) + '</strong> \u4EBA (\u6709\u6548 ' + (inv.info.validInviteCount || 0) + ') \xB7 \u7D2F\u8BA1\u83B7\u5956 <strong style="color:var(--emerald)">+' + (inv.info.rewardCredit || 0) + '</strong> / ' + (inv.info.capValue || 30000) + ' \u79EF\u5206</div>' +
          '<div><strong>\u9080\u8BF7\u94FE\u63A5:</strong> ' + (inv.info.inviteUrl ? '<a style="color:var(--cyan)" target="_blank" href="' + escapeHtml(inv.info.inviteUrl) + '">' + escapeHtml(inv.info.inviteUrl) + '</a>' : '-') + '</div>'
        : '<span style="color:var(--text-dim)">\u65E0\u6CD5\u83B7\u53D6\u9080\u8BF7\u4FE1\u606F</span>';

      const sk = gr.streak || {};
      const cards = sk.makeupCards?.balance || 0;
      const chances = typeof gr.chances === 'number' ? gr.chances : (gr.chancesRemaining || 0);
      const tiers = gr.tiers || [];
      const tierHtml = tiers.map(t => {
        const av = t.status === 'available';
        const cl = t.status === 'claimed';
        return '<div style="border:1px solid #dbe5f1;border-radius:8px;padding:8px 12px;background:#f8fafc;display:flex;align-items:center;gap:10px">' +
          '<div><strong>' + escapeHtml(t.label) + '</strong><br><span style="font-size:11px;color:var(--text-dim)">' + (cl ? '\u2705 \u5DF2\u5151\u6362' : av ? '\u{1F31F} \u53EF\u9886\u53D6' : '\u23F3 \u672A\u89E3\u9501') + '</span></div>' +
          (av ? '<button class="btn btn-sm btn-green" onclick="redeemTier(\\'' + t.tier + '\\')">\u7ACB\u5373\u5151\u6362</button>' : '') +
        '</div>';
      }).join('');
      document.getElementById('streakVisualBox').innerHTML =
        '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">' +
          '<span><strong>\u5F53\u524D\u8FDE\u767B:</strong> <span class="tag tag-cn">' + (sk.days || 0) + ' \u5929</span></span>' +
          '<span><strong>\u8865\u7B7E\u5361\u4F59\u989D:</strong> <span class="tag tag-global">' + cards + ' / ' + (sk.makeupCards?.max || 3) + ' \u5F20</span></span>' +
          '<span><strong>\u5269\u4F59\u62BD\u5956\u6B21\u6570:</strong> <span class="tag ' + (chances > 0 ? 'tag-warn' : 'tag-global') + '">' + chances + ' \u6B21</span></span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' + tierHtml + '</div>';
    }

    async function adoptCat() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u9886\u517B\u7B2C\u4E00\u53EA AI \u5C0F\u732B...');
      const res = await api('/travel/adopt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || (res.ok ? '\u9886\u517B\u6210\u529F +300 \u79EF\u5206' : '\u9886\u517B\u672A\u5B8C\u6210'), res.ok ? '\u9886\u517B\u6210\u529F' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function claimCatReward() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const tr = await api('/travel/status?uid=' + encodeURIComponent(uid));
      const recordId = tr.travel?.recordId || 0;
      const res = await api('/travel/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, recordId }) });
      setWelfareResult(res.message || '\u65C5\u884C\u5956\u52B1\u68C0\u67E5\u5B8C\u6210', res.ok ? '\u9886\u5956\u6210\u529F' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function runSingleTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u81EA\u52A8\u5DE1\u68C0\u5F53\u524D\u8D26\u53F7\u732B\u732B...');
      const res = await api('/travel/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.summary || '\u5DE1\u68C0\u5B8C\u6210', res.ok ? '\u5B8C\u6210' : '\u8DF3\u8FC7', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function departTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const locationId = Number(document.getElementById('travelLocSelect').value || 4);
      const res = await api('/travel/depart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, locationId }) });
      setWelfareResult(res.message || '\u6D3E\u51FA\u6307\u4EE4\u5DF2\u63D0\u4EA4', res.ok ? '\u5DF2\u6D3E\u51FA' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite();
    }
    async function batchRunTravel() {
      toast('\u6B63\u5728\u5168\u53F7\u5DE1\u68C0\u732B\u732B\u65C5\u884C...');
      const res = await api('/travel/run-all', { method: 'POST' });
      setWelfareResult(res.message || '\u5168\u6C60\u732B\u732B\u5DE1\u68C0\u5B8C\u6210', '\u5168\u6C60\u5DE1\u68C0', 'tag-cn', renderBatchAccountTable(res.results, 'travel'));
      toast('\u5DE1\u68C0\u5B8C\u6210'); loadStatus(true);
    }
    async function batchClaimAll() {
      toast('\u6B63\u5728\u4E3A\u6240\u6709\u8D26\u53F7\u81EA\u52A8\u9886\u6EE1\u5168\u5957\u798F\u5229...');
      const res = await api('/growth/claim-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
      setWelfareResult(res.message || '\u5168\u53F7\u798F\u5229\u9886\u53D6\u5B8C\u6210', '\u5168\u53F7\u5B8C\u6210', 'tag-cn', renderBatchAccountTable(res.results, 'welfare'));
      toast('\u5168\u53F7\u798F\u5229\u5B8C\u6210'); loadStatus(true);
    }
    async function singleCheckin() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || '\u7B7E\u5230\u5B8C\u6210', res.ok ? '\u7B7E\u5230\u6210\u529F' : '\u5DF2\u7B7E/\u8DF3\u8FC7', res.ok ? 'tag-cn' : 'tag-warn', '');
      toast(res.message || '\u5B8C\u6210'); loadStatus(true);
    }
    async function claimGiftAndComp() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      const rows = (res.items || []).map(it =>
        '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span><strong>' + escapeHtml(it.name) + '</strong>: ' + escapeHtml(it.message || '-') + '</span><span class="tag ' + (it.ok ? 'tag-cn' : 'tag-warn') + '">' + (it.credit ? '+' + it.credit + '\u5206' : (it.ok ? '\u6210\u529F' : '\u5DF2\u9886/\u65E0')) + '</span></div>'
      ).join('');
      setWelfareResult(res.message || '\u793C\u5305\u68C0\u67E5\u5B8C\u6210', '\u793C\u5305/\u6D3B\u8DC3', 'tag-cn', rows);
      loadStatus(true);
    }
    async function redeemTier(tier) {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, tier }) });
      setWelfareResult(res.message || '\u5151\u6362\u5B8C\u6210', res.ok ? '\u5DF2\u5151\u6362' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function runMakeupCard() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/makeup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || '\u8865\u7B7E\u68C0\u67E5\u5B8C\u6210', res.ok ? '\u5DF2\u8865\u7B7E' : '\u65E0\u9700\u8865\u7B7E', res.ok ? 'tag-cn' : 'tag-global', '');
      loadWelfareAndInvite();
    }
    async function drawLottery() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/lottery/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      const r = res.result || {};
      setWelfareResult(r.message || (r.ok ? '\u62BD\u5956\u6210\u529F' : '\u6682\u65E0\u53EF\u7528\u62BD\u5956\u6B21\u6570'), r.ok ? '\u{1F389} \u4E2D\u5956' : '\u63D0\u793A', r.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function bindInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const inviteCode = document.getElementById('bindInviteInput').value.trim();
      const res = await api('/invite/bind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, inviteCode }) });
      toast(res.message || '\u5B8C\u6210');
      setWelfareResult(res.message || '\u9080\u8BF7\u7ED1\u5B9A\u5904\u7406\u5B8C\u6BD5', res.ok ? '\u7ED1\u5B9A\u6210\u529F' : '\u7ED1\u5B9A\u5931\u8D25', res.ok ? 'tag-cn' : 'tag-err', '');
    }

    async function loadSchoolStatus(uid) {
      const badge = document.getElementById('schoolStatusBadge');
      const box = document.getElementById('schoolVisualBox');
      if (!badge || !box) return;
      const res = await api('/school/status?uid=' + encodeURIComponent(uid));
      const st = res.status || {};
      if (st.skipped) {
        badge.textContent = '\u4EC5\u56FD\u5185\u7248\u652F\u6301'; badge.className = 'tag tag-global';
        box.textContent = '\u5F53\u524D\u9009\u4E2D\u8D26\u53F7\u4E3A\u56FD\u9645\u7248 (Global)\uFF0C\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u62BD\u5956\u4EC5\u652F\u6301\u4E2D\u56FD\u533A\u8D26\u53F7\u3002';
        return;
      }
      if (!st.ok) {
        badge.textContent = '\u62C9\u53D6\u5931\u8D25'; badge.className = 'tag tag-err';
        box.textContent = st.error || '\u67E5\u8BE2\u5F00\u5B66\u5B63\u6D3B\u52A8\u5931\u8D25';
        return;
      }
      if (!st.inPeriod) {
        badge.textContent = '\u5F53\u524D\u672A\u5728\u6D3B\u52A8\u671F'; badge.className = 'tag tag-warn';
        box.textContent = '\u5F53\u524D\u8D26\u53F7\u5F00\u5B66\u5B63\u6D3B\u52A8\u7A97\u53E3\u6682\u672A\u5F00\u542F (in_period=false)\u3002';
        return;
      }
      badge.textContent = '\u6D3B\u52A8\u8FDB\u884C\u4E2D \xB7 \u62BD\u5956\u4F59\u989D ' + (st.chance?.balance || 0) + ' \u6B21';
      badge.className = 'tag tag-cn';
      const ts = st.tasks || [];
      box.innerHTML = ts.map(t => {
        const done = t.status === 'claimed' || t.status === 'completed';
        return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #edf2f7">' +
          '<span><strong>' + escapeHtml(t.title || t.task_code) + '</strong> <span style="color:var(--text-dim)">(' + (t.progress || 0) + '/' + (t.target_count || 1) + ')</span></span>' +
          '<span class="tag ' + (done ? 'tag-cn' : 'tag-warn') + '">' + escapeHtml(t.status || 'pending') + '</span></div>';
      }).join('') || '\u6D3B\u52A8\u8FDB\u884C\u4E2D\uFF0C\u53EF\u76F4\u63A5\u70B9\u51FB\u4E0A\u65B9\u300C\u5F00\u5B66\u5B63\u4EFB\u52A1+\u8F6C\u76D8\u300D\u6267\u884C\u6253\u5361\u4E0E\u62BD\u5956\u3002';
    }

    async function loadTasks() {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid; if (!uid) return;
      loadSchoolStatus(uid);
      const res = await api('/tasks/list?uid=' + encodeURIComponent(uid));
      const listEl = document.getElementById('tasksList');
      if (!res.ok) { listEl.innerHTML = '<div style="color:var(--magenta)">' + escapeHtml(res.message || '\u52A0\u8F7D\u5931\u8D25') + '</div>'; return; }
      const items = res.tasks || [];
      const claimedCnt = items.filter(t => t.accept_status === 'claimed').length;
      document.getElementById('tasksSummary').textContent = '\u5171 ' + items.length + ' \u9879 (\u5DF2\u9886\u5956 ' + claimedCnt + ' \u9879)';
      listEl.innerHTML = items.map(t => {
        const st = t.accept_status || 'pending';
        const cur = t.progress?.current ?? 0;
        const tgt = t.progress?.target ?? 1;
        const rew = t.reward_credit ? ('+' + t.reward_credit + ' \u5206') : '';
        const stLabel = st === 'claimed' ? '\u2705 \u5DF2\u9886\u5956' : st === 'completed' ? '\u{1F31F} \u53EF\u9886\u53D6' : st === 'accepted' ? '\u23F3 \u8FDB\u884C\u4E2D' : '\u26AA \u5F85\u89E6\u53D1';
        const stCls = st === 'claimed' ? 'tag-cn' : st === 'completed' ? 'tag-warn' : st === 'accepted' ? 'tag-global' : 'tag-err';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:12px">' +
          '<div><strong>' + escapeHtml(t.title || t.task_code || '\u672A\u547D\u540D\u4EFB\u52A1') + '</strong> <span style="color:var(--text-dim)">(' + escapeHtml(t.task_code || '-') + ')</span>' +
          (rew ? ' <span class="tag tag-global">' + rew + '</span>' : '') + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center"><span style="color:var(--text-dim);font-size:11px">\u8FDB\u5EA6 ' + cur + '/' + tgt + '</span><span class="tag ' + stCls + '">' + stLabel + '</span></div></div>';
      }).join('') || '<div class="sub-row">\u5F53\u524D\u8D26\u53F7\u6682\u65E0\u53EF\u67E5\u8BE2\u6210\u957F\u4EFB\u52A1\uFF08\u6210\u957F\u4EFB\u52A1\u4EC5\u9762\u5411\u56FD\u5185\u7248\u8D26\u53F7\uFF09</div>';
    }

    async function runTasks(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u81EA\u52A8\u70B9\u4EAE\u4E0E\u6536\u5272\u6210\u957F\u4EFB\u52A1...');
      const res = await api('/tasks/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, all }) });
      if (all) toast('\u5168\u6C60\u6210\u957F\u4EFB\u52A1\u5DF2\u5B8C\u6210 (' + (res.results?.length || 0) + ' \u4E2A\u56FD\u5185\u53F7)');
      else toast(res.result?.summary || '\u6210\u957F\u4EFB\u52A1\u6267\u884C\u5B8C\u6210');
      loadTasks(); loadStatus(true);
    }

    async function runSchoolActivity(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast(all ? '\u6B63\u5728\u5168\u6C60\u5DE1\u68C0\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u8F6C\u76D8\u62BD\u5956...' : '\u6B63\u5728\u6267\u884C\u5355\u53F7\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u8F6C\u76D8\u62BD\u5956...');
      const res = await api('/school/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, all }) });
      const badge = document.getElementById('schoolStatusBadge');
      const box = document.getElementById('schoolVisualBox');
      if (all) {
        badge.textContent = '\u5168\u6C60\u5DF2\u5B8C\u6210'; badge.className = 'tag tag-cn';
        box.innerHTML = renderBatchAccountTable(res.results, 'school');
      } else {
        const r = res.result || {};
        badge.textContent = r.inPeriod === false ? '\u672A\u5728\u6D3B\u52A8\u671F' : ('+' + (r.creditGained || 0) + ' \u79EF\u5206');
        badge.className = 'tag ' + (r.ok ? 'tag-cn' : 'tag-err');
        const prizeTags = (r.prizes || []).map(p => '<span class="tag tag-cn">\u{1F381} ' + escapeHtml(p.label || p.prizeCode) + (p.credit ? ' (+' + p.credit + ')' : '') + '</span>').join(' ');
        box.innerHTML = '<div style="font-weight:600;color:#0f172a;margin-bottom:6px">' + escapeHtml(r.summary || r.message || r.error || '\u6267\u884C\u5B8C\u6BD5') + '</div>' + (prizeTags ? '<div>\u672C\u8F6E\u8F6C\u76D8\u5956\u54C1: ' + prizeTags + '</div>' : '');
      }
      toast('\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u62BD\u5956\u5B8C\u6210');
      loadStatus(true);
    }

    async function runNightCat() {
      toast('\u6B63\u5728\u68C0\u67E5\u5E76\u8FD0\u884C\u6DF1\u591C\u732B\u732B\u4EFB\u52A1...');
      const res = await api('/tasks/nightcat', { method: 'POST' });
      toast(res.message || '\u5B8C\u6210');
      if (res.ok) loadTasks();
    }

    function rateBadgeHtml(m) {
      const rate = m?.rate || '-';
      const mul = typeof m?.multiplier === 'number' ? m.multiplier : null;
      let cls = 'tag-global';
      if (m?.isFree || mul === 0) cls = 'tag-cn';
      else if (mul !== null && mul > 3.0) cls = 'tag-err';
      else if (mul !== null && mul > 1.0) cls = 'tag-warn';
      const label = (m?.isFree || mul === 0) ? ('\u514D\u8D39 ' + rate) : rate;
      const extraBadge = m?.badge ? ' <span class="tag tag-err">' + escapeHtml(m.badge) + '</span>' : '';
      return '<span class="tag ' + cls + '">' + escapeHtml(label) + '</span>' + extraBadge;
    }

    function renderVisualRoutesAndAliases() {
      const rList = document.getElementById('routesVisualList');
      const aList = document.getElementById('aliasesVisualList');
      if (rList) {
        const rEntries = Object.entries(state.modelRoutes || {});
        rList.innerHTML = rEntries.map(([g, ts]) =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#f8fafc;border:1px solid #dbe5f1;border-radius:8px;font-size:11px">' +
            '<span><strong style="color:var(--cyan)">' + escapeHtml(g) + '</strong> \u2794 ' + escapeHtml(Array.isArray(ts) ? ts.join(' \u2192 ') : String(ts)) + '</span>' +
            '<button class="btn btn-sm btn-pink" onclick="removeVisualRoute(\\'' + escapeHtml(g) + '\\')">\u5220</button>' +
          '</div>'
        ).join('') || '<div class="sub-row">\u6682\u672A\u914D\u7F6E\u81EA\u5B9A\u4E49\u8DEF\u7531\u7EC4</div>';
      }
      if (aList) {
        const aEntries = Object.entries(state.aliases || {});
        aList.innerHTML = aEntries.map(([from, to]) =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#f8fafc;border:1px solid #dbe5f1;border-radius:8px;font-size:11px">' +
            '<span><strong>' + escapeHtml(from) + '</strong> \u2794 <span style="color:var(--emerald)">' + escapeHtml(to) + '</span></span>' +
            '<button class="btn btn-sm btn-pink" onclick="removeVisualAlias(\\'' + escapeHtml(from) + '\\')">\u5220</button>' +
          '</div>'
        ).join('') || '<div class="sub-row">\u6682\u672A\u914D\u7F6E\u6A21\u578B\u522B\u540D</div>';
      }
      const rtArea = document.getElementById('modelRoutesTextarea');
      const alArea = document.getElementById('aliasesTextarea');
      if (rtArea) rtArea.value = JSON.stringify(state.modelRoutes || {}, null, 2);
      if (alArea) alArea.value = JSON.stringify(state.aliases || {}, null, 2);
    }
    function syncVisualFromJson() {
      try {
        state.modelRoutes = JSON.parse(document.getElementById('modelRoutesTextarea').value || '{}');
        state.aliases = JSON.parse(document.getElementById('aliasesTextarea').value || '{}');
        renderVisualRoutesAndAliases();
      } catch (_) {}
    }
    function addVisualRoute() {
      const name = document.getElementById('newRouteName').value.trim();
      const ts = document.getElementById('newRouteTargets').value.split(',').map(s => s.trim()).filter(Boolean);
      if (!name || ts.length === 0) return toast('\u8BF7\u586B\u5199\u7EC4\u540D\u548C\u81F3\u5C11\u4E00\u4E2A\u76EE\u6807\u6A21\u578B');
      state.modelRoutes = { ...(state.modelRoutes || {}), [name]: ts };
      document.getElementById('newRouteName').value = '';
      document.getElementById('newRouteTargets').value = '';
      renderVisualRoutesAndAliases();
    }
    function removeVisualRoute(name) {
      const next = { ...(state.modelRoutes || {}) }; delete next[name]; state.modelRoutes = next;
      renderVisualRoutesAndAliases();
    }
    function addVisualAlias() {
      const from = document.getElementById('newAliasFrom').value.trim();
      const to = document.getElementById('newAliasTo').value.trim();
      if (!from || !to) return toast('\u8BF7\u586B\u5199\u8BF7\u6C42\u6A21\u578B\u540D\u548C\u6620\u5C04\u76EE\u6807');
      state.aliases = { ...(state.aliases || {}), [from]: to };
      document.getElementById('newAliasFrom').value = '';
      document.getElementById('newAliasTo').value = '';
      renderVisualRoutesAndAliases();
    }
    function removeVisualAlias(from) {
      const next = { ...(state.aliases || {}) }; delete next[from]; state.aliases = next;
      renderVisualRoutesAndAliases();
    }
    function addClaudePresetAliases() {
      state.aliases = {
        ...(state.aliases || {}),
        'claude-sonnet-4-6': 'global:gpt-6.1-sol',
        'claude-opus-4-6': 'global:gpt-6-astra',
        'claude-haiku-4-5': 'cn:deepseek-v4.1-flash'
      };
      renderVisualRoutesAndAliases();
      toast('\u5DF2\u6DFB\u52A0 Claude Code \u5E38\u7528\u522B\u540D\u6620\u5C04\uFF08\u70B9\u51FB\u4FDD\u5B58\u6309\u94AE\u751F\u6548\uFF09');
    }

    async function loadModels() {
      const res = await api('/models'); if (!res.ok) return;
      state.models = res.models || []; state.enabledModels = res.enabledModels || [];
      state.aliases = res.aliases || {}; state.freeModels = res.freeModels || [];
      state.modelRoutes = res.modelRoutes || {}; state.autoFreeEnabled = res.autoFreeEnabled !== false;
      document.getElementById('autoFreeToggle').checked = state.autoFreeEnabled;
      document.getElementById('freeModelsInput').value = state.freeModels.join(', ');
      renderVisualRoutesAndAliases();
      renderModelsTable();
      const pgSel = document.getElementById('pgModelSelect');
      if (pgSel) {
        const cur = pgSel.value;
        pgSel.innerHTML = state.models.map(m => '<option value="' + escapeHtml(m.id) + '">' + escapeHtml(m.id) + ' [' + escapeHtml(m.rate || '-') + ']</option>').join('');
        if (cur) pgSel.value = cur;
      }
    }

    function testModelInPlayground(modelId) { switchTab('playground'); const sel = document.getElementById('pgModelSelect'); if (sel) sel.value = modelId; }
    async function quickPingModel(modelId) {
      toast('\u6B63\u5728\u6D4B\u901F ' + modelId + ' ...');
      const t0 = Date.now();
      const res = await fetch(API + '/playground/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, stream: false, max_tokens: 32, messages: [{ role: 'user', content: 'Say OK' }] })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) toast('\u2705 ' + modelId + ' \u8FDE\u901A (' + (Date.now() - t0) + 'ms)');
      else toast('\u274C ' + modelId + ' \u5931\u8D25: ' + (json.error?.message || res.status));
    }

    function renderModelsTable() {
      const q = (document.getElementById('modelSearch').value || '').toLowerCase();
      const mode = document.getElementById('modelFilterMode').value || 'all';
      const enabledSet = new Set(state.enabledModels);
      const filtered = state.models.filter(m => {
        if (q && !(m.id.toLowerCase().includes(q) || (m.name||'').toLowerCase().includes(q))) return false;
        if (mode === 'free' && !m.isFree && m.multiplier !== 0) return false;
        if (mode === 'low' && (m.multiplier === null || m.multiplier === undefined || m.multiplier > 0.2)) return false;
        if (mode === 'cn' && m.realm !== 'cn') return false;
        if (mode === 'global' && m.realm !== 'global') return false;
        if (mode === 'reasoning' && !m.supportsReasoning && !(m.supportedEfforts && m.supportedEfforts.length)) return false;
        return true;
      });
      document.getElementById('modelCountLabel').textContent = '\u663E\u793A ' + filtered.length + ' / \u5171 ' + state.models.length + ' \u4E2A\u6A21\u578B';
      document.getElementById('modelsTbody').innerHTML = filtered.map(m => {
        const caps = [];
        if (m.supportsImages) caps.push('\u89C6\u89C9');
        if (m.supportsReasoning || (m.supportedEfforts && m.supportedEfforts.length)) caps.push('\u601D\u8003');
        if (m.supportsToolCall) caps.push('\u5DE5\u5177');
        return '<tr><td><input type="checkbox" class="model-chk" value="' + escapeHtml(m.id) + '" ' + (enabledSet.has(m.id) ? 'checked' : '') + ' /></td>' +
          '<td><strong>' + escapeHtml(m.id) + '</strong><br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(m.description || m.name || '') + '</span></td>' +
          '<td>' + rateBadgeHtml(m) + '</td><td style="font-size:11px">' + (caps.join(' \xB7 ') || '\u6587\u672C') + '</td>' +
          '<td><span class="tag ' + (m.realm === 'cn' ? 'tag-cn' : 'tag-global') + '">' + escapeHtml(m.realm) + '</span></td>' +
          '<td>' + Math.round((m.contextWindow || 0) / 1000) + 'k / ' + Math.round((m.maxTokens || 0) / 1000) + 'k</td>' +
          '<td style="display:flex;gap:4px"><button class="btn btn-sm" onclick="quickPingModel(\\'' + escapeHtml(m.id) + '\\')">\u26A1\u6D4B</button><button class="btn btn-sm" onclick="testModelInPlayground(\\'' + escapeHtml(m.id) + '\\')">\u8BD5\u8DD1</button></td></tr>';
      }).join('');
    }

    async function discoverModels() { toast('\u6B63\u5728\u53D1\u73B0\u4E0A\u6E38\u6700\u65B0\u6A21\u578B...'); const res = await api('/models/discover', { method: 'POST' }); toast('\u5B8C\u6210\uFF0C\u5171 ' + (res.models?.length || 0) + ' \u4E2A'); loadModels(); }
    async function saveModelsConfig() {
      const enabledModels = Array.from(document.querySelectorAll('.model-chk:checked')).map(el => el.value);
      const freeModels = document.getElementById('freeModelsInput').value.split(',').map(s => s.trim()).filter(Boolean);
      const autoFreeEnabled = document.getElementById('autoFreeToggle').checked;
      let aliases = state.aliases || {};
      let modelRoutes = state.modelRoutes || {};
      const alArea = document.getElementById('aliasesTextarea');
      const rtArea = document.getElementById('modelRoutesTextarea');
      try {
        if (alArea && alArea.value.trim()) aliases = JSON.parse(alArea.value);
        if (rtArea && rtArea.value.trim()) modelRoutes = JSON.parse(rtArea.value);
      } catch (e) {
        return toast('\u9AD8\u7EA7 JSON \u683C\u5F0F\u9519\u8BEF: ' + e.message);
      }
      await api('/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabledModels, aliases, modelRoutes, freeModels, autoFreeEnabled }) });
      toast('\u6A21\u578B\u8DEF\u7531\u3001\u8FC7\u6EE4\u4E0E\u522B\u540D\u5DF2\u4FDD\u5B58'); loadModels();
    }

    async function loadLogs() {
      const res = await api('/logs'); if (!res.ok) return;
      const inFlight = res.inFlight || [];
      document.getElementById('inFlightBox').innerHTML = inFlight.length > 0 ? inFlight.map(r => '<span class="tag tag-warn">[' + escapeHtml(r.model) + ' ' + escapeHtml(r.rate) + '] ' + escapeHtml(r.nickname) + ' (' + Math.round(r.elapsedMs / 1000) + 's)</span>').join(' ') : '\u5F53\u524D\u65E0\u5728\u9014\u8BF7\u6C42\uFF08\u5E76\u53D1\u7A7A\u95F2\uFF09';
      const logs = res.logs || [];
      document.getElementById('logsTbody').innerHTML = logs.map(l =>
        '<tr><td>' + escapeHtml(l.time) + '</td><td><strong>' + escapeHtml(l.model) + '</strong><br><span style="font-size:10px;color:var(--text-dim)">' + escapeHtml(l.protocol + '/' + l.mode) + '</span></td><td><span class="tag tag-global">' + escapeHtml(l.rate || '-') + '</span></td><td>' + escapeHtml(l.account || l.uid) + '</td><td><span class="tag ' + (l.status >= 400 ? 'tag-err' : 'tag-cn') + '">' + l.status + '</span></td><td>' + (l.ttfbMs ? l.ttfbMs + 'ms / ' : '') + l.totalTokens + ' tok' + (l.tokensPerSec ? ' / ' + l.tokensPerSec + ' t/s' : '') + '</td><td>' + (l.credit !== null && l.credit !== undefined ? ('-' + l.credit) : '-') + '</td></tr>'
      ).join('') || '<tr><td colspan="7" style="color:var(--text-dim)">\u6682\u65E0\u8BF7\u6C42\u6D41\u6C34\u8BB0\u5F55</td></tr>';
    }

    function handlePgFile(ev) {
      const file = ev.target.files?.[0]; if (!file) return;
      const badge = document.getElementById('pgAttachBadge');
      const clr = document.getElementById('pgAttachClear');
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = () => { pgAttachment = { kind: 'image', name: file.name, data: reader.result }; badge.textContent = '\u{1F4F7} ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => { pgAttachment = { kind: 'text', name: file.name, data: String(reader.result || '').slice(0, 32000) }; badge.textContent = '\u{1F4C4} ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsText(file);
      }
    }
    function clearPgAttachment() { pgAttachment = null; document.getElementById('pgFileInput').value = ''; document.getElementById('pgAttachBadge').classList.add('hidden'); document.getElementById('pgAttachClear').classList.add('hidden'); }

    async function runPlayground() {
      const model = document.getElementById('pgModelSelect').value || 'auto-free';
      const effort = document.getElementById('pgEffortSelect').value;
      const prompt = document.getElementById('pgPromptInput').value.trim() || '\u4F60\u597D\uFF0C\u8BF7\u7528\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u4F60\u81EA\u5DF1';
      const stream = document.getElementById('pgStreamChk').checked;
      const outEl = document.getElementById('pgOutputBox'); const badge = document.getElementById('pgStatsBadge');
      outEl.textContent = '\u23F3 \u6B63\u5728\u8BF7\u6C42 ' + model + ' ...'; badge.textContent = '\u8BF7\u6C42\u4E2D...';

      let contentPayload = prompt;
      if (pgAttachment?.kind === 'image') {
        contentPayload = [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: pgAttachment.data } }];
      } else if (pgAttachment?.kind === 'text') {
        contentPayload = prompt + '\\n\\n[\u9644\u4EF6: ' + pgAttachment.name + ']\\n' + pgAttachment.data;
      }

      const body = { model, stream, messages: [{ role: 'user', content: contentPayload }] };
      if (effort) body.reasoning_effort = effort;
      const t0 = Date.now(); let firstTokenMs = 0;

      const res = await fetch(API + '/playground/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { outEl.textContent = '\u274C HTTP ' + res.status + ': ' + await res.text(); badge.textContent = '\u5931\u8D25 ' + res.status; loadLogs(); return; }
      if (stream) {
        outEl.textContent = ''; const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = '', acc = '', reasoning = '', usage = null;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }).replace(/\\r\\n/g, '\\n');
          let idx;
          while ((idx = buf.indexOf('\\n\\n')) !== -1) {
            const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
            for (const line of frame.split('\\n')) {
              if (!line.startsWith('data:')) continue;
              const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
              try {
                const p = JSON.parse(d); if (p.usage) usage = p.usage;
                const delta = p.choices?.[0]?.delta || {};
                if (delta.reasoning_content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; reasoning += delta.reasoning_content; }
                if (delta.content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; acc += delta.content; }
                outEl.textContent = (reasoning ? '[\u601D\u8003\u8FC7\u7A0B]\\n' + reasoning + '\\n\\n[\u56DE\u7B54\u6B63\u6587]\\n' : '') + acc;
              } catch (_) {}
            }
          }
        }
        badge.textContent = 'TTFB ' + (firstTokenMs || (Date.now()-t0)) + 'ms | \u603B\u8017\u65F6 ' + (Date.now()-t0) + 'ms | Tok ' + (usage?.total_tokens || '-');
      } else {
        const json = await res.json(); const msg = json.choices?.[0]?.message || {};
        outEl.textContent = (msg.reasoning_content ? '[\u601D\u8003\u8FC7\u7A0B]\\n' + msg.reasoning_content + '\\n\\n[\u56DE\u7B54\u6B63\u6587]\\n' : '') + (msg.content || JSON.stringify(json, null, 2));
        badge.textContent = '\u8017\u65F6 ' + (Date.now()-t0) + 'ms | Tok ' + (json.usage?.total_tokens || '-');
      }
      loadLogs();
    }

    async function loadUsage(dateStr = '') {
      const selEl = document.getElementById('usageDateSelect');
      const targetDate = dateStr || selEl?.value || '';
      const res = await api('/usage' + (targetDate ? '?date=' + encodeURIComponent(targetDate) : ''));
      if (!res.ok) return;
      const st = res.stats;
      if (selEl && Array.isArray(st.availableDates)) {
        selEl.innerHTML = st.availableDates.map(d => '<option value="' + d + '" ' + (d === st.activeDate ? 'selected' : '') + '>' + d + '</option>').join('');
      }
      document.getElementById('usageSummaryCards').innerHTML = [
        { title: (st.activeDate || '\u4ECA\u65E5') + ' \u8BF7\u6C42 / \u603B\u8BF7\u6C42', kpi: st.today.requests + ' / ' + st.summary.totalRequests, sub: '\u5F53\u65E5\u6263\u8D39 ' + (st.today.credit || 0) + ' \u79EF\u5206', cls: '' },
        { title: '\u5F53\u65E5\u8F93\u5165 / \u8F93\u51FA Tokens', kpi: (st.today.totalTokens || 0).toLocaleString(), sub: '\u5165 ' + st.today.inputTokens.toLocaleString() + ' / \u51FA ' + st.today.outputTokens.toLocaleString(), cls: 'green' },
        { title: '\u5386\u53F2\u7D2F\u8BA1\u6D88\u8017\u79EF\u5206', kpi: Number(st.summary.totalCredit || 0).toFixed(2), sub: '\u603B\u6210\u529F ' + (st.summary.totalSuccess || 0) + ' / \u5931\u8D25 ' + (st.summary.totalFailed || 0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + c.kpi + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
      const max7 = Math.max(1, ...st.trend7d.map(d => d.tokens));
      document.getElementById('chart7d').innerHTML = st.trend7d.map(d => '<div class="bar-col" title="' + d.date + ': ' + d.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(4, Math.round(d.tokens / max7 * 90)) + '%"></div><div class="bar-lbl">' + d.date + '</div></div>').join('');
      const max24 = Math.max(1, ...st.hourly.map(h => h.tokens));
      document.getElementById('chart24h').innerHTML = st.hourly.map(h => '<div class="bar-col" title="' + h.hour + ': ' + h.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(3, Math.round(h.tokens / max24 * 90)) + '%"></div><div class="bar-lbl">' + h.hour.replace('\u65F6','') + '</div></div>').join('');
      document.getElementById('usageModelsTbody').innerHTML = (st.modelBreakdown || []).map(r =>
        '<tr><td><strong>' + escapeHtml(r.model) + '</strong></td><td>' + rateBadgeHtml(r) + '</td><td>' + r.requests + ' (' + r.success + '/' + r.failed + ')</td><td>' + r.inputTokens.toLocaleString() + ' / ' + r.outputTokens.toLocaleString() + '</td><td>' + (r.cacheHitRate || 0) + '%</td><td style="font-weight:700;color:var(--cyan)">' + (r.credit || 0) + '</td><td>' + (r.creditPerReq || 0) + ' / ' + (r.costPer1k || 0) + '</td><td>' + (r.avgTtfbMs || 0) + 'ms / ' + (r.tokensPerSec || 0) + ' t/s</td></tr>'
      ).join('') || '<tr><td colspan="8">\u5C1A\u65E0\u6A21\u578B\u6D88\u8017\u8BB0\u5F55</td></tr>';
    }
    async function resetUsage() { if (!(await askConfirm('\u786E\u8BA4\u6E05\u7A7A\u5168\u90E8\u7EDF\u8BA1\u8D26\u672C\u5417\uFF1F'))) return; await api('/stats/reset', { method: 'POST' }); toast('\u5DF2\u6E05\u7A7A'); loadUsage(); }

    function copyText(text, label) {
      if (typeof window.__wb2aCopyText === 'function') {
        window.__wb2aCopyText(text, label);
        toast('\u5DF2\u590D\u5236 ' + label);
        return;
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('\u5DF2\u590D\u5236 ' + label)).catch(() => {});
    }
    let _guideCopyList = [];
    function copyGuide(idx, btnEl) {
      const item = _guideCopyList[idx];
      if (item) {
        copyText(item.copy, item.title);
        if (btnEl) {
          const orig = btnEl.innerHTML;
          btnEl.innerHTML = '\u2713 \u5DF2\u590D\u5236';
          btnEl.style.color = '#059669';
          btnEl.style.borderColor = '#a7f3d0';
          setTimeout(() => {
            btnEl.innerHTML = orig;
            btnEl.style.color = '';
            btnEl.style.borderColor = '';
          }, 1800);
        }
      }
    }

    function renderGuideCards(base) {
      const el = document.getElementById('guideCardsGrid'); if (!el) return;
      _guideCopyList = [
        { title: 'OpenAI Chat \u534F\u8BAE (Cline / Cherry / Roo / Cursor)', val: base + '/v1', copy: base + '/v1', tip: 'Base URL \u586B\u5165\u6B64\u5730\u5740\uFF0CKey \u7559\u7A7A\u6216\u586B\u914D\u7F6E\u503C\uFF1B\u52A0 ?bare=true \u8FD4\u56DE\u65E0\u524D\u7F00\u6A21\u578B\u540D' },
        { title: 'Claude Code CLI (Anthropic /v1/messages)', val: 'ANTHROPIC_BASE_URL=' + base, copy: '$env:ANTHROPIC_BASE_URL="' + base + '" ; $env:ANTHROPIC_API_KEY="sk-local"', tip: '\u652F\u6301 count_tokens \u4E0E\u6D41\u5F0F\u9519\u5E27\uFF0C\u5EFA\u8BAE\u5728\u300C\u6A21\u578B\u4E0E\u522B\u540D\u300D\u4E2D\u5F00\u542F Claude Code \u6620\u5C04' },
        { title: 'Codex CLI (OpenAI Responses /v1/responses)', val: base + '/v1/responses', copy: base + '/v1', tip: '\u539F\u751F\u652F\u6301 reasoning_effort \u4E0E tool_call \u8F6C\u6362\uFF0CBase URL \u540C\u586B /v1' },
        { title: '\u5065\u5EB7\u63A2\u9488 / \u516C\u5F00\u72B6\u6001\u4E0E\u89C6\u9891\u751F\u6210', val: base + '/healthz', copy: base + '/healthz', tip: '\u89C6\u9891\u751F\u6210: ' + base + '/v1/videos/generations \xB7 \u516C\u5F00\u95E8\u6237: ' + base + '/portal' }
      ];
      el.innerHTML = _guideCopyList.map((c, idx) =>
        '<div class="guide-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<strong style="font-size:12px;color:#1e3a8a">' + escapeHtml(c.title) + '</strong>' +
            '<button class="btn btn-sm" onclick="copyGuide(' + idx + ', this)">\u{1F4CB} \u590D\u5236</button>' +
          '</div>' +
          '<div style="font-family:Consolas,monospace;font-size:11px;color:#2563eb;word-break:break-all;margin-bottom:5px;background:#ffffff;padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0">' + escapeHtml(c.val) + '</div>' +
          '<div style="font-size:11px;color:#64748b">' + escapeHtml(c.tip) + '</div>' +
        '</div>'
      ).join('');
    }

    function renderSettings() {
      const c = state.config || {};
      document.getElementById('cfgApiKey').value = c.apiKey || '';
      document.getElementById('cfgProxy').value = c.proxy || '';
      document.getElementById('cfgMaxCN').value = c.maxInFlightCN || 3;
      document.getElementById('cfgMaxGlobal').value = c.maxInFlightGlobal || 2;
      document.getElementById('cfgQueueTimeout').value = c.queueTimeoutMs ?? 60000;
      document.getElementById('cfgIdleTimeout').value = c.streamIdleTimeoutMs ?? 90000;
      document.getElementById('cfgPromptMode').value = c.promptMode || 'none';
      document.getElementById('cfgDeviceToken').value = c.deviceTokenPath || '';
      document.getElementById('cfgPromptText').value = c.promptText || '';
      document.getElementById('cfgAutoCheckin').checked = c.autoCheckin !== false;
      document.getElementById('cfgAutoTravel').checked = c.autoTravel !== false;
      document.getElementById('cfgAutoTasks').checked = c.autoTasks !== false;
      document.getElementById('cfgAutoRefresh').checked = c.autoRefreshToken !== false;
      document.getElementById('cfgPortalHome').checked = Boolean(c.portalAsHome);

      const sch = c.schedule || {};
      document.getElementById('schCheckin').value = (sch.checkinHours || [9,21]).join(', ');
      document.getElementById('schTravel').value = (sch.travelHours || [9,21]).join(', ');
      document.getElementById('schTasks').value = (sch.tasksHours || [11]).join(', ');
      document.getElementById('schSchool').value = (sch.schoolHours || [12]).join(', ');
      document.getElementById('schCat').value = (sch.catHours || [1]).join(', ');
      document.getElementById('schKeepalive').value = (sch.keepaliveHours || [22]).join(', ');

      document.getElementById('pwStatusBadge').textContent = state.auth?.hasPassword ? '\u5DF2\u5F00\u542F\u5BC6\u7801\u9501\u5B9A' : '\u514D\u5BC6\u5355\u673A\u6A21\u5F0F';
      document.getElementById('pwStatusBadge').className = 'tag ' + (state.auth?.hasPassword ? 'tag-warn' : 'tag-cn');

      const wl = c.ipWhitelist || {};
      document.getElementById('ipWlEnabled').checked = Boolean(wl.enabled);
      document.getElementById('ipWlLocal').checked = wl.allowLocalhost !== false;
      document.getElementById('ipWlList').value = (wl.allowedIPs || []).join('\\n');
      const net = state.runtimeNetwork || {};
      document.getElementById('ipRuntimeInfo').textContent = '\u5F53\u524D\u6765\u8BBF IP: ' + (net.clientIP || '-') + ' | \u672C\u673A\u7F51\u5361: ' + ((net.detectedIPs || []).join(', ') || '-');

      const al = c.alerts || {};
      document.getElementById('alertEnabled').checked = Boolean(al.enabled);
      document.getElementById('alertMinCredit').value = al.minCredit ?? 50;
      document.getElementById('alertHooks').value = (al.webhooks || []).join('\\n');
      const evSet = new Set(al.events || ['ban','401','cooling','low_credit']);
      document.querySelectorAll('.alert-evt').forEach(el => { el.checked = evSet.has(el.value); });

      renderGuideCards(getApiOrigin());
    }

    async function saveConfig() {
      const payload = {
        apiKey: document.getElementById('cfgApiKey').value.trim(),
        proxy: document.getElementById('cfgProxy').value.trim(),
        maxInFlightCN: Number(document.getElementById('cfgMaxCN').value) || 3,
        maxInFlightGlobal: Number(document.getElementById('cfgMaxGlobal').value) || 2,
        queueTimeoutMs: Number(document.getElementById('cfgQueueTimeout').value) || 0,
        streamIdleTimeoutMs: Number(document.getElementById('cfgIdleTimeout').value) || 90000,
        promptMode: document.getElementById('cfgPromptMode').value,
        deviceTokenPath: document.getElementById('cfgDeviceToken').value.trim(),
        promptText: document.getElementById('cfgPromptText').value,
        autoCheckin: document.getElementById('cfgAutoCheckin').checked,
        autoTravel: document.getElementById('cfgAutoTravel').checked,
        autoTasks: document.getElementById('cfgAutoTasks').checked,
        autoRefreshToken: document.getElementById('cfgAutoRefresh').checked,
        portalAsHome: document.getElementById('cfgPortalHome').checked
      };
      const res = await api('/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      state.config = res.config || payload;
      toast('\u6838\u5FC3\u53C2\u6570\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548');
    }

    async function saveScheduleConfig() {
      const parseHrs = id => document.getElementById(id).value.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n >= 0 && n <= 23);
      const res = await api('/config/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: {
            checkinHours: parseHrs('schCheckin'),
            travelHours: parseHrs('schTravel'),
            tasksHours: parseHrs('schTasks'),
            schoolHours: parseHrs('schSchool'),
            catHours: parseHrs('schCat'),
            keepaliveHours: parseHrs('schKeepalive')
          }
        })
      });
      toast(res.message || '\u6392\u7A0B\u5DF2\u4FDD\u5B58');
    }

    async function saveWebPassword() {
      const password = document.getElementById('cfgWebPassword').value;
      const res = await api('/config/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      toast(res.message || '\u5B8C\u6210');
      loadStatus();
    }

    function addClientIP() {
      const ip = state.runtimeNetwork?.clientIP; if (!ip) return;
      const el = document.getElementById('ipWlList');
      const cur = el.value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      if (!cur.includes(ip)) cur.push(ip);
      el.value = cur.join('\\n');
    }
    async function saveIPWhitelist() {
      const allowedIPs = document.getElementById('ipWlList').value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      const res = await api('/config/ip_whitelist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: document.getElementById('ipWlEnabled').checked, allowLocalhost: document.getElementById('ipWlLocal').checked, allowedIPs })
      });
      toast(res.message || res.error);
    }

    async function saveAlerts() {
      const events = Array.from(document.querySelectorAll('.alert-evt:checked')).map(x => x.value);
      const res = await api('/config/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: document.getElementById('alertEnabled').checked,
          minCredit: Number(document.getElementById('alertMinCredit').value || 50),
          webhooksText: document.getElementById('alertHooks').value,
          events
        })
      });
      toast(res.message || '\u544A\u8B66\u5DF2\u4FDD\u5B58');
    }
    async function testAlerts() { const res = await api('/config/alerts/test', { method: 'POST' }); toast(res.message || res.error); }

    async function checkUpdate() {
      document.getElementById('updateInfoSpan').textContent = '\u6B63\u5728\u68C0\u67E5 GitHub \u7248\u672C...';
      const res = await api('/system/update/check');
      if (!res.ok) document.getElementById('updateInfoSpan').textContent = res.error || '\u68C0\u67E5\u5931\u8D25';
      else document.getElementById('updateInfoSpan').innerHTML = '\u5F53\u524D v' + escapeHtml(res.currentVersion) + ' \xB7 \u6700\u65B0 <strong>' + escapeHtml(res.latestVersion) + '</strong> ' + (res.hasUpdate ? '<span class="tag tag-warn">\u6709\u65B0\u7248\u672C</span>' : '<span class="tag tag-cn">\u5DF2\u662F\u6700\u65B0</span>');
    }

    async function loadAdminUsers() {
      const res = await api('/admin/users'); if (!res.ok) return;
      document.getElementById('allowRegChk').checked = Boolean(res.allowRegister);
      document.getElementById('adminUsersTbody').innerHTML = (res.users || []).map(u =>
        '<tr><td><strong>' + escapeHtml(u.username) + '</strong></td><td>' + u.role + '</td><td style="font-family:monospace;font-size:11px">' + escapeHtml(u.apiKey) + '</td><td>' + (u.usedCreditToday||0) + ' / ' + (u.dailyCreditLimit || '\u4E0D\u9650') + '</td><td>' + (u.rpm || '\u4E0D\u9650') + '</td><td><span class="tag ' + (u.disabled ? 'tag-err' : 'tag-cn') + '">' + (u.disabled ? '\u7981\u7528' : '\u6B63\u5E38') + '</span></td>' +
        '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
          '<button class="btn btn-sm" onclick="adminResetKey(\\'' + u.username + '\\')">\u91CD\u7F6EKey</button>' +
          '<button class="btn btn-sm" onclick="adminSetQuota(\\'' + u.username + '\\')">\u914D\u989D</button>' +
          (u.username !== 'admin' ? '<button class="btn btn-sm btn-amber" onclick="adminToggleUser(\\'' + u.username + '\\',' + (!u.disabled) + ')">' + (u.disabled ? '\u542F\u7528' : '\u7981\u7528') + '</button><button class="btn btn-sm btn-pink" onclick="adminDeleteUser(\\'' + u.username + '\\')">\u5220</button>' : '') +
        '</td></tr>'
      ).join('');
    }
    async function createTenantUser() {
      const res = await api('/admin/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('newUserName').value.trim(), password: document.getElementById('newUserPass').value, role: document.getElementById('newUserRole').value, dailyCreditLimit: Number(document.getElementById('newUserQuota').value || 0), rpm: Number(document.getElementById('newUserRpm').value || 0) }) });
      toast(res.ok ? '\u79DF\u6237\u521B\u5EFA\u6210\u529F' : (res.error || '\u5931\u8D25')); loadAdminUsers();
    }
    async function adminToggleUser(username, disabled) { await api('/admin/users/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, disabled }) }); loadAdminUsers(); }
    async function adminResetKey(username) { await api('/admin/users/reset_key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); toast('Key \u5DF2\u91CD\u7F6E'); loadAdminUsers(); }
    async function adminDeleteUser(username) { if (!(await askConfirm('\u5220\u9664\u7528\u6237 ' + username + ' ?'))) return; await api('/admin/users/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); loadAdminUsers(); }
    async function adminSetQuota(username) {
      const q = await askPrompt('\u8F93\u5165\u6BCF\u65E5\u79EF\u5206\u4E0A\u9650 (0 \u8868\u793A\u4E0D\u9650):', '100'); if (q === null) return;
      const r = await askPrompt('\u8F93\u5165\u6BCF\u5206\u949F\u8BF7\u6C42 RPM \u4E0A\u9650 (0 \u8868\u793A\u4E0D\u9650):', '30'); if (r === null) return;
      await api('/admin/users/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, dailyCreditLimit: Number(q), rpm: Number(r) }) });
      loadAdminUsers();
    }
    async function toggleAllowRegister(val) { await api('/admin/system/allow_register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowRegister: val }) }); }

    async function checkDsh() {
      const box = document.getElementById('dshCheckBox');
      const res = await api('/dsh/check');
      if (!res.ok) { box.textContent = '\u68C0\u6D4B\u5931\u8D25'; return; }
      box.innerHTML = '\u63D2\u4EF6\u5B89\u88C5: <span class="tag ' + (res.installedInProfile ? 'tag-cn' : 'tag-err') + '">' + (res.installedInProfile ? '\u5DF2\u5B89\u88C5' : '\u672A\u6CE8\u518C') + '</span> | Patch baseURL: <span class="tag ' + (res.baseUrlMatched ? 'tag-cn' : 'tag-warn') + '">' + (res.baseUrlMatched ? '\u5DF2\u5BF9\u9F50 (' + escapeHtml(res.expectedBaseUrl) + ')' : '\u672A\u5BF9\u9F50') + '</span>';
    }
    async function syncDsh() { const res = await api('/dsh/sync', { method: 'POST' }); toast(res.message || '\u5B8C\u6210'); checkDsh(); }

    loadStatus(false);
    setInterval(() => loadStatus(false), 30000);
  </script>
</body>
</html>`}function _(o,e,t){o.writableEnded||(o.headersSent||o.writeHead(e,{"Content-Type":"application/json; charset=utf-8"}),o.end(JSON.stringify(t)))}function go(o,e=25*1024*1024){return new Promise(t=>{let s=[],a=0;o.on("data",n=>{a+=n.length,a<=e&&s.push(n)}),o.on("end",()=>{t(Buffer.concat(s))}),o.on("error",()=>t(Buffer.alloc(0)))})}async function D(o){let e=await go(o);if(!e||e.length===0)return{};try{return JSON.parse(e.toString("utf8"))}catch{return{}}}function Bs(){return{count:0,enabledCount:0,healthyCount:0,remain:0,total:0,used:0,baseRemain:0,bonusRemain:0,purchasedRemain:0,expiringRemain:0}}function fo(o,e,t,s){o.count+=1,!e.disabled&&!e.manualDisabled&&(o.enabledCount+=1,s||(o.healthyCount+=1)),t&&!t.error&&(o.remain+=Number(t.remain||0),o.total+=Number(t.total||0),o.used+=Number(t.used||0),o.baseRemain+=Number(t.baseRemain||0),o.bonusRemain+=Number(t.bonusRemain||0),o.purchasedRemain+=Number(t.purchasedRemain||0),o.expiringRemain+=Number(t.expiringRemain||0))}function bo(o,e){let{scheduler:t,client:s,ledger:a,loopback:n,configStore:r,userManager:l,alertManager:c}=e,i=t.store,d=new Map,m=new Map,h=2e4;function g(y,p){if(!y||!p)return;let u=new Date(Date.now()+8*3600*1e3).toISOString().slice(0,10);m.set(y,{date:u,ok:!!p.ok,status:p.status||(p.ok?"SUCCESS":"FAIL"),message:p.message||""})}async function x(y,p=!1){if(!y)return null;let u=y.account.uid,f=d.get(u);if(!p&&f&&Date.now()-f.fetchedAt<h)return f.data;try{let k=await s.fetchBalance(y);return d.set(u,{data:k,fetchedAt:Date.now()}),t.updateAccountCredits(u,k.remain,k.expiringRemain),t.reenableIfCredits(u,k.remain),c?.notifyLowCredit(u,y.account.nickname,k.remain),k}catch(k){return f?f.data:{remain:0,total:0,used:0,baseRemain:0,bonusRemain:0,purchasedRemain:0,expiringRemain:0,packCount:0,activePackCount:0,packages:[],error:k.message,fetchedAt:Date.now()}}}let b=y=>{y?d.delete(y):d.clear()},w=()=>r?r.getAll():{},T=(y,p)=>{if(!l)return!0;let u=l.checkWebAuth(y);return u.ok?u.user?.role!=="admin"?(_(p,403,{ok:!1,error:"\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650"}),!1):!0:(_(p,401,{ok:!1,authRequired:!0,error:"\u8BF7\u5148\u767B\u5F55\u63A7\u5236\u53F0"}),!1)},A=[{path:"/plugins/dsh-workbuddy2api/status",handler:async(y,p)=>{let u=new URL(y.url,"http://localhost"),f=u.searchParams.get("refresh")==="1",k=u.searchParams.get("date")||"",v=l?l.checkWebAuth(y):{ok:!0,user:{username:"admin",role:"admin"}},S=i.getAll(),I=i.getActive(),M={all:Bs(),cn:Bs(),global:Bs()},E=new Date(Date.now()+8*3600*1e3).toISOString().slice(0,10),U=await Promise.all(S.map(async V=>{let ve=V.account.uid,qe=await x(V,f&&!t.isAccountUnavailable(V)),de=t.getAccountDiagnostics(ve),Ke=V.auth?.realm==="global"?"global":"cn",ge=m.get(ve);return fo(M.all,V,qe,de.coolingDown),fo(M[Ke],V,qe,de.coolingDown),{uid:ve,nickname:V.account.nickname,realm:V.auth.realm,enterpriseId:V.account.enterpriseId||"",provider:V.account.provider||"",disabled:!!V.disabled,disabledReason:V.disabledReason||"",manualDisabled:!!V.manualDisabled,manualDisabledReason:V.manualDisabledReason||"",source:V.source||"",inFlight:de.inFlight,coolingDown:de.coolingDown,diagnostics:de,expiresAt:V.auth.expiresAt,updatedAt:V.updatedAt,balance:qe,checkinState:ge&&ge.date===E?ge:null}})),z=I?await x(I,f):null,X=w(),ie=v.ok&&v.user?.role==="user"?[]:U;_(p,200,{ok:!0,serviceVersion:K,activeUid:i.activeUid,accounts:ie,balance:z,summary:M,gatewayPort:n.actualPort||n.preferredPort,aliases:{...ce,...X.aliases||{}},modelRoutes:X.modelRoutes||{},autoFreeEnabled:X.autoFreeEnabled!==!1,freeCandidates:n.getFreeModelCandidates(),enabledModels:X.enabledModels||Array.from(n.enabledModels),freeModels:X.freeModels||[],discoveredModelsCount:n.discoveredModels?.length||0,inFlightRequests:t.getInFlightRequests(),wafIpBlocked:t.wafIPGate.active(),degradeActive:t.degradeGate.active(),runtimeNetwork:{detectedIPs:Ts(),clientIP:st(y)},auth:{hasPassword:l?l.hasWebPassword():!1,authenticated:v.ok,currentUser:v.user||null,allowRegister:!!X.allowRegister},alertHistory:c?.history||[],config:X,stats:a.getStats(n.getModelCatalogMap(),k)})}},{path:"/plugins/dsh-workbuddy2api/accounts/switch",handler:async(y,p)=>{let u=await D(y),f=i.setActive(u.uid);_(p,200,{ok:f,activeUid:i.activeUid})}},{path:"/plugins/dsh-workbuddy2api/accounts/add",handler:async(y,p)=>{try{let u=await D(y),f=(u.accessToken||u.token||u.refreshToken||"").trim(),k=(u.refreshToken||u.token||"").trim();if(!f&&!k){_(p,400,{ok:!1,error:"Token \u6216 Refresh Token \u4E0D\u80FD\u4E3A\u7A7A"});return}let v=ye(f)||ye(k)||{},S=u.uid||v.sub||v.uid||`user-${Date.now().toString(36)}`,I=(u.realm||"").toLowerCase();if(!I){let U=String(v.iss||"").toLowerCase();I=U.includes("codebuddy")||U.includes("tencent")?"cn":"global"}let M=u.nickname||v.nickname||v.name||v.email||`Account-${String(S).slice(0,6)}`,E={account:{uid:String(S),nickname:String(M),enterpriseId:u.enterpriseId||"",provider:v.provider||""},auth:{realm:I==="cn"?"cn":"global",accessToken:f||k,refreshToken:k||f,expiresAt:v.exp?v.exp*1e3:Date.now()+72e5,domain:I==="cn"?"copilot.tencent.com":"www.workbuddy.ai"}};try{E.auth.refreshToken?await s.refreshToken(E):await s.fetchBalance(E)}catch{await s.fetchBalance(E)}i.upsert(E),b(E.account.uid),_(p,200,{ok:!0,account:E})}catch(u){_(p,400,{ok:!1,error:`\u8D26\u53F7\u51ED\u8BC1\u9A8C\u8BC1\u5931\u8D25: ${u.message}`})}}},{path:"/plugins/dsh-workbuddy2api/accounts/delete",handler:async(y,p)=>{let u=await D(y),f=i.delete(u.uid);b(u.uid),_(p,200,{ok:f})}},{path:"/plugins/dsh-workbuddy2api/accounts/import",handler:async(y,p)=>{try{let u=new URL(y.url,"http://localhost"),f=String(y.headers["content-type"]||"").toLowerCase(),k=await go(y),v=k,S=u.searchParams.get("realm")||"global";if(!(f.includes("application/zip")||f.includes("application/octet-stream")||k.length>=2&&k[0]===80&&k[1]===75)){let E=k.toString("utf8");if(f.includes("application/json")||E.trim().startsWith("{"))try{let U=JSON.parse(E);U.defaultRealm&&(S=U.defaultRealm),U.base64Zip?v=Buffer.from(U.base64Zip,"base64"):typeof U.content=="string"?v=U.content:v=E}catch{v=E}else v=E}let M=await uo(v,i,s,S);b(),_(p,200,M)}catch(u){_(p,400,{ok:!1,error:`\u6279\u91CF\u5BFC\u5165\u5931\u8D25: ${u.message}`})}}},{path:"/plugins/dsh-workbuddy2api/accounts/export.zip",handler:async(y,p)=>{let u=po(i),f=new Date().toISOString().slice(0,10);p.writeHead(200,{"Content-Type":"application/zip","Content-Disposition":`attachment; filename="workbuddy2api-backup-${f}.zip"`,"Content-Length":String(u.length)}),p.end(u)}},{path:"/plugins/dsh-workbuddy2api/accounts/admin",handler:async(y,p)=>{try{let u=await D(y),{uid:f,action:k}=u,v=i.get(f);if(!v){_(p,404,{ok:!1,error:"\u8D26\u53F7\u672A\u627E\u5230"});return}if(k==="enable"){i.setDisabled(f,!1,""),t.clearCooldown(f),_(p,200,{ok:!0,message:`\u5DF2\u542F\u7528\u8D26\u53F7 ${v.account.nickname}`});return}if(k==="manualEnable"){i.setManualDisabled(f,!1,""),_(p,200,{ok:!0,message:`\u5DF2\u89E3\u9664\u8D26\u53F7 ${v.account.nickname} \u624B\u52A8\u505C\u7528`});return}if(k==="disable"){i.setManualDisabled(f,!0,u.reason||"\u624B\u52A8\u505C\u7528"),_(p,200,{ok:!0,message:`\u5DF2\u624B\u52A8\u505C\u7528\u8D26\u53F7 ${v.account.nickname}`});return}if(k==="revive"||k==="clearCooldown"){i.reviveAccount(f),t.clearCooldown(f),_(p,200,{ok:!0,message:`\u5DF2\u590D\u6D3B\u5E76\u89E3\u9664 ${v.account.nickname} \u81EA\u52A8\u7981\u7528/\u51B7\u5374\u72B6\u6001`});return}if(k==="refresh"){v.auth?.refreshToken&&(await s.refreshToken(v),i.upsert(v)),t.clearCooldown(f),b(f);let S=await x(v,!0);_(p,200,{ok:!0,message:"Token \u4E0E\u79EF\u5206\u5DF2\u5237\u65B0",balance:S});return}if(k==="trial"){let S=await Ms(v,s);b(f),_(p,S.ok?200:400,S);return}_(p,400,{ok:!1,error:`\u672A\u77E5\u7BA1\u63A7\u52A8\u4F5C: ${k}`})}catch(u){_(p,500,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/accounts/update_token",handler:async(y,p)=>{try{let u=await D(y),{uid:f,accessToken:k,refreshToken:v}=u,S=i.get(f);if(!S){_(p,404,{ok:!1,error:"\u8D26\u53F7\u672A\u627E\u5230"});return}let I=String(k||"").trim(),M=String(v||"").trim();if(!I&&!M){_(p,400,{ok:!1,error:"\u5FC5\u987B\u63D0\u4F9B\u65B0 Access Token \u6216 Refresh Token"});return}let E=i.updateAccountToken(f,I||S.auth.accessToken,M||S.auth.refreshToken);E.auth.refreshToken&&!I&&(await s.refreshToken(E),i.upsert(E)),t.clearCooldown(f),b(f);let U=await x(E,!0);_(p,200,{ok:!0,message:`\u5DF2\u66F4\u65B0\u5E76\u6551\u6D3B\u8D26\u53F7 ${E.account.nickname}`,balance:U})}catch(u){_(p,400,{ok:!1,error:`\u51ED\u8BC1\u66F4\u65B0\u5931\u8D25: ${u.message}`})}}},{path:"/plugins/dsh-workbuddy2api/accounts/clear-all-cooldowns",handler:async(y,p)=>{let u=t.clearAllCooldowns();_(p,200,{ok:!0,cleared:u,message:`\u5DF2\u6E05\u7406 ${u} \u6761\u7194\u65AD\u51B7\u5374\u8BB0\u5F55`})}},{path:"/plugins/dsh-workbuddy2api/accounts/refresh-all",handler:async(y,p)=>{let u=await t.refreshAllTokens(!1);b(),_(p,200,{ok:!0,...u})}},{path:"/plugins/dsh-workbuddy2api/oauth/start",handler:async(y,p)=>{try{let u=await D(y),f=await oo(u.realm||"cn");_(p,200,{ok:!0,...f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/oauth/poll",handler:async(y,p)=>{try{let u=await D(y),f=await no(u.realm||"cn",u.state,i);f.success&&f.account?.account?.uid&&b(f.account.account.uid),_(p,200,{ok:!0,...f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/invite/info",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}try{let v=await ro(k,s);_(p,200,{ok:!0,uid:f,info:v})}catch(v){_(p,500,{ok:!1,message:v.message})}}},{path:"/plugins/dsh-workbuddy2api/invite/bind",handler:async(y,p)=>{let u=await D(y),f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await io(k,u.inviteCode,s);b(k.account.uid),_(p,v.ok?200:400,v)}},{path:"/plugins/dsh-workbuddy2api/checkin",handler:async(y,p)=>{let u=await D(y);if(u.all){let v=i.getAll().filter(I=>!I.disabled),S=[];for(let I of v)try{let M=await _e(I);g(I.account.uid,M),S.push({uid:I.account.uid,nickname:I.account.nickname,...M})}catch(M){let E={ok:!1,status:"FAIL",message:M.message};g(I.account.uid,E),S.push({uid:I.account.uid,nickname:I.account.nickname,...E})}b(),_(p,200,{ok:!0,results:S,message:`\u5DF2\u5B8C\u6210 ${S.length} \u4E2A\u8D26\u53F7\u7B7E\u5230\u5DE1\u68C0`});return}let f=u.uid&&i.get(u.uid)||i.getActive();if(!f){_(p,400,{ok:!1,message:"\u65E0\u53EF\u7528\u8D26\u53F7"});return}let k=await _e(f);g(f.account.uid,k),b(f.account.uid),_(p,200,k)}},{path:"/plugins/dsh-workbuddy2api/trial/batch",handler:async(y,p)=>{let u=i.getAll().filter(k=>!t.isAccountUnavailable(k)&&k.auth?.realm==="global"),f=[];for(let k of u)try{let v=await Ms(k,s);f.push({uid:k.account.uid,nickname:k.account.nickname,...v})}catch(v){f.push({uid:k.account.uid,nickname:k.account.nickname,ok:!1,error:v.message})}b(),_(p,200,{ok:!0,results:f})}},{path:"/plugins/dsh-workbuddy2api/usage",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("date")||"";_(p,200,{ok:!0,stats:a.getStats(n.getModelCatalogMap(),f),inFlightRequests:t.getInFlightRequests()})}},{path:"/plugins/dsh-workbuddy2api/logs",handler:async(y,p)=>{_(p,200,{ok:!0,logs:a.getRecentLogs(),inFlight:t.getInFlightRequests()})}},{path:"/plugins/dsh-workbuddy2api/playground/chat",handler:async(y,p)=>{let u=await D(y);if(!u||!u.messages){_(p,400,{ok:!1,error:"\u8BF7\u6C42\u4F53\u7F3A\u5C11 messages"});return}await n.executeChatPipeline(y,p,u,"chat",u.model)}},{path:"/plugins/dsh-workbuddy2api/dsh/check",handler:async(y,p)=>{let u=i.dshHome||process.env.DSH_HOME||Me.default.join(Ps.default.homedir(),".dsh"),f=Me.default.join(u,"profiles","desktop","package.json"),k=Me.default.join(u,"profiles","desktop","cordis.patch.yml"),S=`http://127.0.0.1:${n.actualPort||n.preferredPort||7863}/v1`,I=!1,M=!1,E="";try{if(fe.default.existsSync(f)&&(I=!!JSON.parse(fe.default.readFileSync(f,"utf8")).dependencies?.["dsh-workbuddy2api"]),fe.default.existsSync(k)){let U=fe.default.readFileSync(k,"utf8");M=U.includes(S),E=U.split(/\r?\n/).slice(0,60).join(`
`)}}catch{}_(p,200,{ok:!0,dshHome:u,installedInProfile:I,baseUrlMatched:M,expectedBaseUrl:S,patchPath:k,patchPreview:E})}},{path:"/plugins/dsh-workbuddy2api/dsh/sync",handler:async(y,p)=>{let u=i.dshHome||process.env.DSH_HOME||Me.default.join(Ps.default.homedir(),".dsh"),f=Me.default.join(u,"profiles","desktop","cordis.patch.yml"),v=`http://127.0.0.1:${n.actualPort||n.preferredPort||7863}/v1`;try{let S=fe.default.existsSync(f)?fe.default.readFileSync(f,"utf8"):"";S.includes("baseURL:")&&(S=S.replace(/(workbuddy:[\s\S]*?baseURL:\s*).*/,`$1${v}`)),fe.default.mkdirSync(Me.default.dirname(f),{recursive:!0}),fe.default.writeFileSync(f,S,"utf8"),_(p,200,{ok:!0,message:`\u5DF2\u540C\u6B65 baseURL -> ${v}`,expectedBaseUrl:v})}catch(S){_(p,500,{ok:!1,error:S.message})}}},{path:"/plugins/dsh-workbuddy2api/stats/reset",handler:async(y,p)=>{a.reset(),_(p,200,{ok:!0,message:"\u7528\u91CF\u8D26\u672C\u5DF2\u91CD\u7F6E"})}},{path:"/plugins/dsh-workbuddy2api/models",handler:async(y,p)=>{if(y.method==="POST"){let u=await D(y),f={};Array.isArray(u.enabledModels)&&(f.enabledModels=u.enabledModels,n.enabledModels=new Set(u.enabledModels)),u.aliases&&typeof u.aliases=="object"&&(f.aliases=u.aliases,n.modelAliases={...ce,...u.aliases}),Array.isArray(u.freeModels)&&(f.freeModels=u.freeModels),u.modelRoutes&&typeof u.modelRoutes=="object"&&(f.modelRoutes=u.modelRoutes),typeof u.autoFreeEnabled=="boolean"&&(f.autoFreeEnabled=u.autoFreeEnabled);let k=r?r.update(f):f;_(p,200,{ok:!0,enabledModels:k.enabledModels||Array.from(n.enabledModels),aliases:k.aliases||n.modelAliases,freeModels:k.freeModels||[],modelRoutes:k.modelRoutes||{},autoFreeEnabled:k.autoFreeEnabled!==!1})}else{let u=w();_(p,200,{ok:!0,models:n.getMergedModels(!0),enabledModels:u.enabledModels||Array.from(n.enabledModels),aliases:{...ce,...u.aliases||{}},freeModels:u.freeModels||[],modelRoutes:u.modelRoutes||{},autoFreeEnabled:u.autoFreeEnabled!==!1})}}},{path:"/plugins/dsh-workbuddy2api/models/discover",handler:async(y,p)=>{let u=await n.refreshDiscoveredModels();_(p,200,{ok:!0,models:u,discoveredCount:n.discoveredModels?.length||0})}},{path:"/plugins/dsh-workbuddy2api/config",handler:async(y,p)=>{if(!r){_(p,501,{ok:!1,error:"ConfigStore \u672A\u521D\u59CB\u5316"});return}if(y.method==="POST"){let u=await D(y),f=r.update(u);typeof u.proxy=="string"&&(s.proxy=u.proxy),typeof u.maxInFlightCN=="number"&&(t.maxInFlightCN=f.maxInFlightCN),typeof u.maxInFlightGlobal=="number"&&(t.maxInFlightGlobal=f.maxInFlightGlobal),typeof u.queueTimeoutMs=="number"&&(t.queueTimeoutMs=f.queueTimeoutMs),_(p,200,{ok:!0,config:f})}else _(p,200,{ok:!0,config:r.getAll()})}},{path:"/plugins/dsh-workbuddy2api/travel/status",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Ye(k),S=await ht(k);_(p,200,{ok:!0,uid:f,buddy:v,travel:S})}},{path:"/plugins/dsh-workbuddy2api/travel/depart",handler:async(y,p)=>{let u=await D(y),f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await ft(k,u.locationId||4);_(p,200,v)}},{path:"/plugins/dsh-workbuddy2api/travel/claim",handler:async(y,p)=>{let u=await D(y),f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Ft(k,u.recordId);b(k.account.uid),_(p,200,v)}},{path:"/plugins/dsh-workbuddy2api/travel/adopt",handler:async(y,p)=>{let f=(await D(y)).uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}if(k.auth?.realm==="global"){_(p,400,{ok:!1,message:"\u4EC5\u56FD\u5185\u7248\u8D26\u53F7\u652F\u6301\u732B\u732B\u7CFB\u7EDF"});return}await jt(k);let v=await Le(k);!v.ok&&v.incomplete&&(await bt(k,5),v=await Le(k));let S=await Ye(k);b(k.account.uid),_(p,200,{...v,buddy:S})}},{path:"/plugins/dsh-workbuddy2api/travel/run",handler:async(y,p)=>{let f=(await D(y)).uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await De(k);b(k.account.uid);let S=v.results?.actions||[],I=v.status==="ok"?S.map(M=>M.message).filter(Boolean).join("\uFF1B")||"\u732B\u732B\u65C5\u884C\u5DE1\u68C0\u5B8C\u6210":v.detail||v.reason||"\u732B\u732B\u5DE1\u68C0\u8DF3\u8FC7\u6216\u5931\u8D25";_(p,200,{ok:v.status==="ok",summary:I,...v})}},{path:"/plugins/dsh-workbuddy2api/travel/run-all",handler:async(y,p)=>{let u=await t.runAllTravel();b(),_(p,200,{ok:!0,results:u,message:`\u5DF2\u5B8C\u6210 ${u.length} \u4E2A\u56FD\u5185\u7248\u8D26\u53F7\u732B\u732B\u65C5\u884C\u5DE1\u68C0`})}},{path:"/plugins/dsh-workbuddy2api/growth/status",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await yt(k),S=await Qe(k),I=v.redemptionStatus||{},M=[{tier:"7d",label:"7\u5929\u8FDE\u767B\u793C",status:I.tier_7d_status||"locked"},{tier:"14d",label:"14\u5929\u8FDE\u767B\u793C",status:I.tier_14d_status||"locked"},{tier:"28d",label:"28\u5929\u8FDE\u767B\u793C",status:I.tier_28d_status||"locked"}];_(p,200,{ok:!0,uid:f,streak:v,tiers:M,chances:S,chancesRemaining:S})}},{path:"/plugins/dsh-workbuddy2api/growth/redeem",handler:async(y,p)=>{let u=await D(y),f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=u.tier||"7d",S=await Yt(k,v);b(k.account.uid),_(p,200,S)}},{path:"/plugins/dsh-workbuddy2api/growth/makeup",handler:async(y,p)=>{let f=(await D(y)).uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Qt(k),S={no_cards:"\u5F53\u524D\u6CA1\u6709\u53EF\u7528\u7684\u8865\u7B7E\u5361",no_missed_day:"\u6628\u65E5\u5DF2\u6253\u5361\u6216\u65E0\u9700\u8865\u7B7E",skipped_global:"\u56FD\u9645\u7248\u8D26\u53F7\u65E0\u8FDE\u767B\u8865\u7B7E\u4F53\u7CFB"};_(p,200,{...v,message:v.message||S[v.reason]||"\u8865\u7B7E\u68C0\u67E5\u5B8C\u6210"})}},{path:"/plugins/dsh-workbuddy2api/growth/gift",handler:async(y,p)=>{let f=(await D(y)).uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await bt(k,5),S=await Jt(k),I=await Xt(k),M=(S.ok&&S.credit||0)+(I.ok&&I.credit||0);b(k.account.uid),_(p,200,{ok:!!(v.ok||S.ok||I.ok),totalCredits:M,items:[{name:"\u5BF9\u8BDD\u6D3B\u8DC3\u4E0A\u62A5",...v},{name:"\u65B0\u624B\u793C\u5305",...S},{name:"\u6D3B\u52A8\u8865\u507F",...I}],message:`\u6D3B\u8DC3\u4E0E\u793C\u5305\u5DE1\u68C0\u5B8C\u6210\uFF0C\u7D2F\u8BA1\u83B7\u5F97 +${M} \u79EF\u5206`})}},{path:"/plugins/dsh-workbuddy2api/growth/claim-all",handler:async(y,p)=>{let u=await D(y);if(u.all){let S=await t.runAllWelfare();b(),_(p,200,{ok:!0,results:S,message:`\u5DF2\u5B8C\u6210 ${S.length} \u4E2A\u8D26\u53F7\u7684\u5168\u5957\u798F\u5229\u4E0E\u6210\u957F\u4EFB\u52A1`});return}let f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await $e(k);b(k.account.uid),_(p,200,{ok:!0,uid:f,result:v,message:v.summary})}},{path:"/plugins/dsh-workbuddy2api/growth/lottery/draw",handler:async(y,p)=>{let f=(await D(y)).uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Zt(k),S=await Qe(k);b(k.account.uid),_(p,200,{ok:!0,uid:f,result:v,remainingChances:S})}},{path:"/plugins/dsh-workbuddy2api/tasks/list",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Ze(k);_(p,200,{ok:!0,uid:f,tasks:v})}},{path:"/plugins/dsh-workbuddy2api/tasks/run",handler:async(y,p)=>{let u=await D(y);if(u.all){let S=i.getAll().filter(M=>!M.disabled&&M.auth?.realm!=="global"),I=[];for(let M of S){try{let E=await Ae(M);I.push({uid:M.account.uid,nickname:M.account.nickname,ok:!0,result:E})}catch(E){I.push({uid:M.account.uid,nickname:M.account.nickname,ok:!1,error:E.message})}await new Promise(E=>setTimeout(E,800))}b(),_(p,200,{ok:!0,results:I});return}let f=u.uid||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await Ae(k);b(k.account.uid),_(p,200,{ok:!0,uid:f,result:v})}},{path:"/plugins/dsh-workbuddy2api/school/status",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let v=await kt(k);_(p,200,{ok:!!v?.ok,uid:f,status:v})}},{path:"/plugins/dsh-workbuddy2api/school/run",handler:async(y,p)=>{let u=await D(y),f={lightUp:u.lightUp!==!1,claim:u.claim!==!1,draw:u.draw!==!1};if(u.all){let I=await t.runAllSchool(f);b(),_(p,200,{ok:!0,results:I});return}let k=u.uid||i.activeUid,v=i.get(k);if(!v){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}let S=await wt(v,f);b(v.account.uid),_(p,200,{ok:!!S?.ok,uid:k,result:S})}},{path:"/plugins/dsh-workbuddy2api/tasks/nightcat",handler:async(y,p)=>{if(!Ne()){_(p,200,{ok:!1,inWindow:!1,results:[],message:"\u5F53\u524D\u4E0D\u5728\u6DF1\u591C\u732B\u732B\u4EFB\u52A1\u65F6\u95F4\u7A97\u53E3\uFF08\u9700\u5317\u4EAC\u65F6\u95F4 23:00\u201308:00\uFF09"});return}let f=await t.runAllNightCat();b(),_(p,200,{ok:!0,inWindow:!0,results:f,message:`\u5DF2\u5B8C\u6210 ${f.length} \u4E2A\u56FD\u5185\u7248\u8D26\u53F7\u6DF1\u591C\u732B\u732B\u5DE1\u68C0`})}},{path:"/plugins/dsh-workbuddy2api/balance",handler:async(y,p)=>{let f=new URL(y.url,"http://localhost").searchParams.get("uid")||i.activeUid,k=i.get(f);if(!k){_(p,404,{ok:!1,message:"\u8D26\u53F7\u672A\u627E\u5230"});return}try{let v=await x(k,!0);_(p,200,{ok:!0,uid:f,balance:v})}catch(v){_(p,500,{ok:!1,error:v.message})}}},{path:"/plugins/dsh-workbuddy2api/auth/me",handler:async(y,p)=>{if(!l){_(p,200,{ok:!0,hasPassword:!1,authenticated:!0,user:{username:"admin",role:"admin"}});return}let u=w(),f=l.checkWebAuth(y);_(p,200,{ok:!0,hasPassword:l.hasWebPassword(),authenticated:f.ok,allowRegister:!!u.allowRegister,user:f.ok?f.user:null})}},{path:"/plugins/dsh-workbuddy2api/auth/login",handler:async(y,p)=>{if(!l){_(p,501,{ok:!1,error:"UserManager \u672A\u521D\u59CB\u5316"});return}try{let u=await D(y),f=st(y),{token:k,user:v}=l.authenticate(u.username||"admin",u.password||"",f);p.setHeader("Set-Cookie",`${Ee.cookieName}=${encodeURIComponent(k)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7*86400}`),_(p,200,{ok:!0,user:v,token:k})}catch(u){_(p,401,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/auth/logout",handler:async(y,p)=>{l?.logout(y),p.setHeader("Set-Cookie",`${Ee.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`),_(p,200,{ok:!0})}},{path:"/plugins/dsh-workbuddy2api/auth/register",handler:async(y,p)=>{if(!l){_(p,501,{ok:!1,error:"UserManager \u672A\u521D\u59CB\u5316"});return}if(!w().allowRegister){_(p,403,{ok:!1,error:"\u7BA1\u7406\u5458\u5DF2\u5173\u95ED\u81EA\u52A9\u6CE8\u518C\u529F\u80FD"});return}try{let f=await D(y),k=l.createUser({username:f.username,password:f.password,role:"user"});_(p,200,{ok:!0,user:k})}catch(f){_(p,400,{ok:!1,error:f.message})}}},{path:"/plugins/dsh-workbuddy2api/user/apikey/reset",handler:async(y,p)=>{if(!l){_(p,501,{ok:!1,error:"UserManager \u672A\u521D\u59CB\u5316"});return}let u=l.checkWebAuth(y);if(!u.ok||!u.user){_(p,401,{ok:!1,error:"\u8BF7\u5148\u767B\u5F55"});return}let f=l.resetUserApiKey(u.user.username);_(p,200,{ok:!0,apiKey:f.apiKey,user:f})}},{path:"/plugins/dsh-workbuddy2api/config/password",handler:async(y,p)=>{if(!l){_(p,501,{ok:!1,error:"UserManager \u672A\u521D\u59CB\u5316"});return}let u=await D(y),f=l.setAdminPassword(String(u.password||""));_(p,200,{ok:!0,...f,message:f.hasPassword?"\u63A7\u5236\u53F0\u767B\u5F55\u5BC6\u7801\u5DF2\u66F4\u65B0\u542F\u7528":"\u63A7\u5236\u53F0\u5BC6\u7801\u5DF2\u6E05\u9664\uFF08\u5355\u673A\u514D\u5BC6\u6A21\u5F0F\uFF09"})}},{path:"/plugins/dsh-workbuddy2api/config/ip_whitelist",handler:async(y,p)=>{if(y.method==="GET"){let u=w();_(p,200,{ok:!0,ipWhitelist:u.ipWhitelist,detectedIPs:Ts(),clientIP:st(y)});return}try{let u=await D(y),{normalized:f}=_s(Array.isArray(u.allowedIPs)?u.allowedIPs:[]),k={enabled:!!u.enabled,allowedIPs:f,allowLocalhost:u.allowLocalhost!==!1},v=r?r.update({ipWhitelist:k}):{ipWhitelist:k};_(p,200,{ok:!0,ipWhitelist:v.ipWhitelist,message:"IP \u767D\u540D\u5355\u89C4\u5219\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548"})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/config/alerts",handler:async(y,p)=>{if(y.method==="GET"){let I=w();_(p,200,{ok:!0,alerts:I.alerts,history:c?.history||[]});return}let u=await D(y),f=Array.isArray(u.webhooks)?u.webhooks.map(I=>String(I).trim()).filter(Boolean):String(u.webhooksText||"").split(/[\r\n,;]+/).map(I=>I.trim()).filter(Boolean),k=Array.isArray(u.events)&&u.events.length>0?u.events:["ban","401","cooling","low_credit"],v={enabled:!!u.enabled,webhooks:f,events:k,minCredit:Math.max(0,Number(u.minCredit??50)||0)},S=r?r.update({alerts:v}):{alerts:v};_(p,200,{ok:!0,alerts:S.alerts,message:"Webhook \u98CE\u63A7\u544A\u8B66\u914D\u7F6E\u5DF2\u4FDD\u5B58"})}},{path:"/plugins/dsh-workbuddy2api/config/alerts/test",handler:async(y,p)=>{if(!c){_(p,501,{ok:!1,error:"AlertManager \u672A\u521D\u59CB\u5316"});return}let u=await c.sendTestAlert();_(p,u.ok?200:400,{...u,history:c.history,message:u.ok?"\u6D4B\u8BD5\u544A\u8B66\u5DF2\u6210\u529F\u63A8\u9001":"\u6D4B\u8BD5\u544A\u8B66\u63A8\u9001\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 Webhook \u5730\u5740"})}},{path:"/plugins/dsh-workbuddy2api/config/schedule",handler:async(y,p)=>{let u=await D(y),f=r?r.update({schedule:u.schedule,autoCheckin:u.autoCheckin,autoTravel:u.autoTravel,autoTasks:u.autoTasks,autoRefreshToken:u.autoRefreshToken}):u;_(p,200,{ok:!0,config:f,message:"\u81EA\u52A8\u5316\u6392\u7A0B\u8BBE\u7F6E\u5DF2\u4FDD\u5B58"})}},{path:"/plugins/dsh-workbuddy2api/admin/users",handler:async(y,p)=>{if(!l){_(p,200,{ok:!0,users:[],allowRegister:!1});return}let u=w();_(p,200,{ok:!0,users:l.listUsers(),allowRegister:!!u.allowRegister})}},{path:"/plugins/dsh-workbuddy2api/admin/users/create",handler:async(y,p)=>{try{let u=await D(y),f=l.createUser(u);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/toggle",handler:async(y,p)=>{try{let u=await D(y),f=l.toggleUser(u.username,u.disabled);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/role",handler:async(y,p)=>{try{let u=await D(y),f=l.setUserRole(u.username,u.role);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/quota",handler:async(y,p)=>{try{let u=await D(y),f=l.setUserQuota(u.username,u.dailyCreditLimit,u.rpm);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/reset_password",handler:async(y,p)=>{try{let u=await D(y),f=l.resetUserPassword(u.username,u.password);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/reset_key",handler:async(y,p)=>{try{let u=await D(y),f=l.resetUserApiKey(u.username);_(p,200,{ok:!0,user:f})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/users/delete",handler:async(y,p)=>{try{let u=await D(y);l.deleteUser(u.username),_(p,200,{ok:!0})}catch(u){_(p,400,{ok:!1,error:u.message})}}},{path:"/plugins/dsh-workbuddy2api/admin/system/allow_register",handler:async(y,p)=>{let u=await D(y),f=r?r.update({allowRegister:!!u.allowRegister}):u;_(p,200,{ok:!0,allowRegister:!!f.allowRegister})}},{path:"/plugins/dsh-workbuddy2api/system/update/check",handler:async(y,p)=>{try{let u=await fetch(`https://api.github.com/repos/${be}/releases/latest`,{headers:{Accept:"application/vnd.github.v3+json","User-Agent":"dsh-workbuddy2api-updater"},signal:AbortSignal.timeout(8e3)});if(u.status===404){let I=await(await fetch(`https://api.github.com/repos/${be}/tags?per_page=1`,{headers:{Accept:"application/vnd.github.v3+json","User-Agent":"dsh-workbuddy2api-updater"},signal:AbortSignal.timeout(8e3)})).json().catch(()=>[]),M=Array.isArray(I)&&I[0]?.name?I[0].name:`v${K}`,E=M.replace(/^v/i,"");_(p,200,{ok:!0,currentVersion:K,latestVersion:M,hasUpdate:E!==K&&M!==`v${K}`,repoUrl:`https://github.com/${be}`,releaseNotes:"\u5F53\u524D\u4ED3\u5E93\u6682\u65E0\u6B63\u5F0F Release\uFF0C\u5DF2\u8BFB\u53D6\u6700\u65B0 Git Tag\u3002"});return}if(!u.ok)throw new Error(`GitHub API HTTP ${u.status}`);let f=await u.json(),k=String(f.tag_name||"").trim(),v=k.replace(/^v/i,"");_(p,200,{ok:!0,currentVersion:K,latestVersion:k,hasUpdate:!!(v&&v!==K),releaseTitle:f.name||k,releaseNotes:f.body||"",releaseUrl:f.html_url||`https://github.com/${be}/releases`,publishedAt:f.published_at||""})}catch(u){_(p,200,{ok:!1,currentVersion:K,repoUrl:`https://github.com/${be}`,error:`\u68C0\u67E5\u66F4\u65B0\u5931\u8D25: ${u.message}`})}}}],P=new Set(["/plugins/dsh-workbuddy2api/auth/me","/plugins/dsh-workbuddy2api/auth/login","/plugins/dsh-workbuddy2api/auth/logout","/plugins/dsh-workbuddy2api/auth/register","/plugins/dsh-workbuddy2api/public/status"]),$=new Set(["/plugins/dsh-workbuddy2api/status","/plugins/dsh-workbuddy2api/usage","/plugins/dsh-workbuddy2api/logs","/plugins/dsh-workbuddy2api/models","/plugins/dsh-workbuddy2api/playground/chat","/plugins/dsh-workbuddy2api/user/apikey/reset"]),R=new Map(A.map(y=>[y.path,y.handler])),L=async(y,p,u)=>{let f=R.get(u);if(!f)return!1;try{if(l&&!P.has(u)){let k=l.checkWebAuth(y);if(y._wbSessionUser=k.user,!k.ok)return _(p,401,{ok:!1,authRequired:!0,error:"\u8BF7\u5148\u767B\u5F55\u63A7\u5236\u53F0"}),!0;if(k.user?.role!=="admin"&&!$.has(u))return _(p,403,{ok:!1,error:"\u4EC5\u7BA1\u7406\u5458\u53EF\u6267\u884C\u6B64\u64CD\u4F5C"}),!0}await f(y,p)}catch(k){p.headersSent||_(p,500,{ok:!1,error:k.message})}return!0};return n&&(n.setPluginRouterHandler(L),n.setPortalHandler(async(y,p)=>(p.headersSent||p.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),p.end(ho({port:n.actualPort||n.preferredPort,version:K})),!0)),n.setDashboardHandler(async(y,p)=>(p.headersSent||p.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}),p.end(Mt({port:n.actualPort||n.preferredPort})),!0))),o?.effect&&o.effect(()=>{let y=[];if(o.webServer&&typeof o.webServer.register=="function")for(let p of A)try{let u=o.webServer.register({kind:"exact",path:p.path,handler:p.handler});u&&y.push(u)}catch{}return()=>{for(let p of y)try{p()}catch{}}},"dsh-workbuddy2api web routes"),{routes:A,handlePluginRoute:L}}function yo(o={}){let e=o.rawConfig||{},t=o.dshHome?{dshHome:o.dshHome}:void 0,s=new pt(e,t),a=s.getAll(),n=o.dshHome||s.dshHome,r=new mt({dshHome:n,authDir:o.authDir??a.authDir,skipDiscovery:!!o.skipDiscovery}),l=new Ct({configStore:s}),c=new Ee({configStore:s,dshHome:n}),i=new At({configStore:s,dshHome:n,proxy:o.proxy??a.proxy,onTokenRefresh:$=>r.upsert($)}),d=new vt(r,{client:i,configStore:s,alertManager:l,dshHome:n,maxInFlightCN:a.maxInFlightCN,maxInFlightGlobal:a.maxInFlightGlobal,queueTimeoutMs:a.queueTimeoutMs}),m=new St({dshHome:n}),h=o.port??a.gatewayPort,g=new It(d,i,m,{configStore:s,userManager:c,alertManager:l,port:h,apiKey:a.apiKey,aliases:a.aliases,enabledModels:a.enabledModels}),x=bo(o.ctx||null,{scheduler:d,client:i,ledger:m,loopback:g,configStore:s,userManager:c,alertManager:l}),b=null,w=!1,T=o.logger||console;async function A(){if(w)return g.actualPort||h;w=!0;let $=await g.start();return g.refreshDiscoveredModels().catch(()=>{}),d.startAutoRoutines(),a.autoCheckin!==!1&&!o.skipInitialWelfare&&(b=setTimeout(async()=>{let R=r.getActive();if(R&&!R.disabled)try{T?.info?.(`[workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\uFF1A\u5F00\u59CB\u6267\u884C\u5F53\u524D\u8D26\u53F7 (${R.account.nickname}) \u798F\u5229\u4E0E\u732B\u732B\u65C5\u884C...`);let L=await $e(R);T?.info?.(`[workbuddy2api] \u4F8B\u884C\u798F\u5229\u7ED3\u679C: ${L.summary}`)}catch(L){T?.warn?.(`[workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\u8B66\u544A: ${L.message}`)}},3e3),b.unref&&b.unref()),$}function P(){b&&(clearTimeout(b),b=null),d.stopAutoRoutines(),g.stop(),w=!1}return{dshHome:n,configStore:s,store:r,alertManager:l,userManager:c,client:i,scheduler:d,ledger:m,loopback:g,routesInfo:x,start:A,stop:P}}var Os=O(require("node:http")),ko=O(require("node:fs")),wo=O(require("node:path"));function Fn(o,e={}){let t=`http://127.0.0.1:${o}`;return`<script>
(function() {
  if (typeof acquireVsCodeApi !== 'function') return;
  const vscode = acquireVsCodeApi();
  window.__WB2A_VSCODE__ = vscode;
  window.__WB2A_API_ORIGIN__ = ${JSON.stringify(t)};
  window.__WB2A_EXT_STATE__ = ${JSON.stringify(e)};

  const pendingFetch = new Map();
  const pendingDialog = new Map();
  let nextSeq = 1;
  const origFetch = window.fetch ? window.fetch.bind(window) : null;

  function b64ToBytes(b64) {
    const bin = atob(b64 || '');
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'wb2a:dialog-res') {
      const p = pendingDialog.get(msg.reqId);
      if (p) {
        pendingDialog.delete(msg.reqId);
        p.resolve(msg.value);
      }
      return;
    }

    if (msg.type === 'wb2a:ext-update') {
      window.__WB2A_EXT_STATE__ = msg.state || {};
      window.dispatchEvent(new CustomEvent('wb2a:ext-state', { detail: msg.state || {} }));
      return;
    }

    const entry = pendingFetch.get(msg.reqId);
    if (!entry) return;

    if (msg.type === 'wb2a:fetch-start') {
      let streamCtrl = null;
      const stream = new ReadableStream({
        start(c) { streamCtrl = c; }
      });
      entry.ctrl = streamCtrl;
      const headers = new Headers(msg.headers || {});
      entry.resolve(new Response(stream, { status: msg.status || 200, statusText: msg.statusText || '', headers }));
    } else if (msg.type === 'wb2a:fetch-chunk') {
      if (entry.ctrl && msg.b64) {
        try { entry.ctrl.enqueue(b64ToBytes(msg.b64)); } catch (_) {}
      }
    } else if (msg.type === 'wb2a:fetch-end') {
      if (entry.ctrl) {
        try { entry.ctrl.close(); } catch (_) {}
      }
      pendingFetch.delete(msg.reqId);
    } else if (msg.type === 'wb2a:fetch-err') {
      const err = new Error(msg.error || 'Webview bridge fetch error');
      if (!entry.started) entry.reject(err);
      else if (entry.ctrl) try { entry.ctrl.error(err); } catch (_) {}
      pendingFetch.delete(msg.reqId);
    }
  });

  window.fetch = function(input, init = {}) {
    const rawUrl = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    let targetPath = '';
    if (rawUrl.startsWith('/')) {
      targetPath = rawUrl;
    } else if (rawUrl.startsWith(window.__WB2A_API_ORIGIN__)) {
      targetPath = rawUrl.slice(window.__WB2A_API_ORIGIN__.length) || '/';
    } else if (!rawUrl.includes('://')) {
      targetPath = '/' + rawUrl;
    }

    if (!targetPath) {
      return origFetch ? origFetch(input, init) : Promise.reject(new Error('Unsupported fetch URL'));
    }

    const reqId = 'r_' + (nextSeq++);
    const method = (init.method || (input && input.method) || 'GET').toUpperCase();
    const hdrObj = {};
    try {
      const h = new Headers(init.headers || (input && input.headers) || {});
      h.forEach((v, k) => { hdrObj[k] = v; });
    } catch (_) {}

    let bodyStr = '';
    if (typeof init.body === 'string') bodyStr = init.body;
    else if (init.body != null) bodyStr = String(init.body);

    return new Promise((resolve, reject) => {
      const entry = {
        started: false,
        ctrl: null,
        resolve: (res) => { entry.started = true; resolve(res); },
        reject
      };
      pendingFetch.set(reqId, entry);
      vscode.postMessage({
        type: 'wb2a:fetch',
        reqId,
        path: targetPath,
        method,
        headers: hdrObj,
        body: bodyStr
      });
    });
  };

  function askDialog(type, payload) {
    const reqId = 'd_' + (nextSeq++);
    return new Promise((resolve) => {
      pendingDialog.set(reqId, { resolve });
      vscode.postMessage({ type, reqId, ...payload });
    });
  }

  window.__wb2aOpenExternal = (url) => vscode.postMessage({ type: 'wb2a:openExternal', url });
  window.__wb2aCopyText = (text, label) => vscode.postMessage({ type: 'wb2a:copyText', text, label });
  window.__wb2aExportZip = () => vscode.postMessage({ type: 'wb2a:exportZip' });
  window.__wb2aConfirm = (message) => askDialog('wb2a:confirm', { message });
  window.__wb2aPrompt = (message, defaultValue) => askDialog('wb2a:prompt', { message, defaultValue });
  window.__wb2aCommand = (command, args) => vscode.postMessage({ type: 'wb2a:command', command, args });
})();
</script>`}function Ls(o,e,t={}){let s=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src http://127.0.0.1:* http://localhost:*; img-src * data: blob:;">`,a=Fn(e,t),n=o;return n.includes("</head>")?n=n.replace("</head>",`${s}
${a}
</head>`):n=`${s}
${a}
${n}`,n}function Gn(o,e,t={},s=null){return new Promise((a,n)=>{let r={...t.headers||{}};s&&s.size>0&&!r.cookie&&!r.Cookie&&(r.Cookie=[...s.entries()].map(([c,i])=>`${c}=${i}`).join("; "));let l=Os.default.request({host:"127.0.0.1",port:o,path:e,method:t.method||"GET",headers:r},c=>{if(s&&Array.isArray(c.headers["set-cookie"]))for(let d of c.headers["set-cookie"]){let m=String(d).split(";")[0],h=m.indexOf("=");if(h>0){let g=m.slice(0,h).trim(),x=m.slice(h+1).trim();x?s.set(g,x):s.delete(g)}}let i=[];c.on("data",d=>i.push(d)),c.on("end",()=>a({status:c.statusCode||200,headers:c.headers,body:Buffer.concat(i)})),c.on("error",n)});l.setTimeout(3e4,()=>l.destroy(new Error("Request timeout"))),l.on("error",n),t.body&&l.write(t.body),l.end()})}function Ds(o,e,t,s=[]){let a=new Map,n=o.onDidReceiveMessage(async r=>{if(!r||typeof r.type!="string")return;let l=t();if(r.type==="wb2a:fetch"){let c={...r.headers||{}};a.size>0&&!c.cookie&&!c.Cookie&&(c.Cookie=[...a.entries()].map(([d,m])=>`${d}=${m}`).join("; "));let i=Os.default.request({host:"127.0.0.1",port:l,path:r.path||"/",method:r.method||"GET",headers:c},d=>{if(Array.isArray(d.headers["set-cookie"]))for(let h of d.headers["set-cookie"]){let g=String(h).split(";")[0],x=g.indexOf("=");if(x>0){let b=g.slice(0,x).trim(),w=g.slice(x+1).trim();w?a.set(b,w):a.delete(b)}}let m={};for(let[h,g]of Object.entries(d.headers))typeof g=="string"?m[h]=g:Array.isArray(g)&&(m[h]=g.join(", "));o.postMessage({type:"wb2a:fetch-start",reqId:r.reqId,status:d.statusCode||200,statusText:d.statusMessage||"",headers:m}),d.on("data",h=>{o.postMessage({type:"wb2a:fetch-chunk",reqId:r.reqId,b64:Buffer.from(h).toString("base64")})}),d.on("end",()=>{o.postMessage({type:"wb2a:fetch-end",reqId:r.reqId})}),d.on("error",h=>{o.postMessage({type:"wb2a:fetch-err",reqId:r.reqId,error:h.message})})});i.setTimeout(18e4,()=>i.destroy(new Error("Gateway request timeout"))),i.on("error",d=>{o.postMessage({type:"wb2a:fetch-err",reqId:r.reqId,error:d.message})}),r.body&&i.write(r.body),i.end();return}if(r.type==="wb2a:openExternal"&&r.url){e.env.openExternal(e.Uri.parse(String(r.url)));return}if(r.type==="wb2a:copyText"&&r.text!==void 0){await e.env.clipboard.writeText(String(r.text)),e.window.showInformationMessage(`\u5DF2\u590D\u5236 ${r.label||"\u5185\u5BB9"}`);return}if(r.type==="wb2a:confirm"){let c=await e.window.showWarningMessage(String(r.message||"\u786E\u8BA4\u7EE7\u7EED\u64CD\u4F5C\u5417\uFF1F"),{modal:!0},"\u786E\u5B9A");o.postMessage({type:"wb2a:dialog-res",reqId:r.reqId,value:c==="\u786E\u5B9A"});return}if(r.type==="wb2a:prompt"){let c=await e.window.showInputBox({prompt:String(r.message||""),value:r.defaultValue!==void 0?String(r.defaultValue):""});o.postMessage({type:"wb2a:dialog-res",reqId:r.reqId,value:c===void 0?null:c});return}if(r.type==="wb2a:exportZip"){try{let c=await Gn(l,"/plugins/dsh-workbuddy2api/accounts/export.zip",{method:"GET"},a);if(c.status>=400){e.window.showErrorMessage("\u5BFC\u51FA\u8D26\u53F7\u5907\u4EFD\u5931\u8D25: HTTP "+c.status);return}let i=new Date().toISOString().slice(0,10),d=await e.window.showSaveDialog({defaultUri:e.Uri.file(wo.default.join(process.env.USERPROFILE||process.env.HOME||process.cwd(),`workbuddy2api-backup-${i}.zip`)),filters:{"ZIP Archive":["zip"]}});d?.fsPath&&(ko.default.writeFileSync(d.fsPath,c.body),e.window.showInformationMessage(`\u5DF2\u5BFC\u51FA\u8D26\u53F7\u5907\u4EFD\u81F3: ${d.fsPath}`))}catch(c){e.window.showErrorMessage(`\u5BFC\u51FA\u5907\u4EFD\u5931\u8D25: ${c.message}`)}return}r.type==="wb2a:command"&&typeof r.command=="string"&&r.command.startsWith("workbuddy2api.")&&e.commands.executeCommand(r.command,...Array.isArray(r.args)?r.args:[])});return s.push(n),n}function vo(o={}){let e=o.port||7863,t=o.mode||"embedded",s=o.version||"1.3.0";return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API</title>
  <style>
    :root {
      --bg: var(--vscode-sideBar-background, #f4f7fb);
      --card: var(--vscode-editorWidget-background, var(--vscode-sideBarSectionHeader-background, #ffffff));
      --soft: var(--vscode-editor-inactiveSelectionBackground, rgba(148, 163, 184, 0.08));
      --border: var(--vscode-widget-border, var(--vscode-sideBar-border, #dbe5f1));
      --blue: var(--vscode-textLink-foreground, #2563eb);
      --green: #059669;
      --amber: #d97706;
      --red: #dc2626;
      --text: var(--vscode-sideBar-foreground, var(--vscode-foreground, #0f172a));
      --dim: var(--vscode-descriptionForeground, #64748b);
      --input-bg: var(--vscode-input-background, #ffffff);
      --input-border: var(--vscode-input-border, #cbd5e1);
      --input-fg: var(--vscode-input-foreground, var(--text));
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 10px;
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif);
      background: var(--bg); color: var(--text); font-size: 12px;
    }
    .card {
      background: var(--card); border: 1px solid var(--border); border-radius: 10px;
      padding: 10px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(15, 35, 75, 0.04);
    }
    .row-between { display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; }
    .tag {
      display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 600;
      background: #eff6ff; color: var(--blue); border: 1px solid #bfdbfe;
    }
    .tag-ok { background: #ecfdf5; color: var(--green); border-color: #a7f3d0; }
    .tag-warn { background: #fffbeb; color: var(--amber); border-color: #fde68a; }
    .tag-err { background: #fef2f2; color: var(--red); border-color: #fecaca; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
    .kpi-box { background: var(--soft); border: 1px solid var(--border); border-radius: 8px; padding: 7px 6px; text-align: center; }
    .kpi-val { font-size: 15px; font-weight: 700; color: var(--blue); }
    .kpi-lbl { font-size: 10px; color: var(--dim); margin-top: 2px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 4px;
      border: 1px solid #bfdbfe; background: #eff6ff; color: var(--blue);
      border-radius: 7px; padding: 6px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn:hover { background: #dbeafe; }
    .btn-primary { background: var(--blue); color: #ffffff; border-color: var(--blue); }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-green { background: #ecfdf5; border-color: #a7f3d0; color: var(--green); }
    .btn-amber { background: #fffbeb; border-color: #fde68a; color: var(--amber); }
    .btn-sm { padding: 4px 7px; font-size: 10.5px; }
    .btn-block { width: 100%; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    input, select, textarea {
      width: 100%; padding: 6px 8px; border-radius: 7px; border: 1px solid var(--input-border);
      font-size: 11px; color: var(--input-fg); background: var(--input-bg); font-family: inherit;
    }
    .msg-box {
      font-size: 11px; padding: 7px 9px; border-radius: 8px; background: #eff6ff;
      border: 1px solid #bfdbfe; color: #1e3a8a; line-height: 1.5; margin-bottom: 10px;
    }
    .hidden { display: none !important; }
    .acc-item {
      display: flex; justify-content: space-between; align-items: center; gap: 6px;
      padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 11px;
    }
    .acc-item:last-child { border-bottom: none; }
    .endpoint-item {
      background: var(--soft);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 8px;
      transition: all 0.2s;
    }
    .endpoint-item:hover {
      border-color: #93c5fd;
    }
    .endpoint-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      font-size: 10.5px;
    }
    .endpoint-name {
      font-weight: 600;
      color: var(--text);
    }
    .endpoint-badge {
      font-size: 9.5px;
      color: var(--dim);
      background: var(--card);
      padding: 1px 5px;
      border-radius: 4px;
      border: 1px solid var(--border);
    }
    .endpoint-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 6px;
    }
    .endpoint-body code {
      font-family: var(--vscode-editor-font-family, Consolas, monospace);
      font-size: 10.5px;
      color: var(--blue);
      word-break: break-all;
      user-select: all;
    }
    .btn-copy {
      padding: 3px 7px;
      font-size: 10px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .sidebar-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 4px 10px;
      font-size: 10px;
      color: var(--dim);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="row-between">
      <strong style="color:#1e3a8a;font-size:13px">\u26A1 WorkBuddy 2API</strong>
      <span id="gwBadge" class="tag tag-ok">${t==="attached"?"\u5916\u90E8\u63A5\u7BA1":"\u5185\u7F6E\u8FD0\u884C"} :${e}</span>
    </div>
    <div class="row-between" style="margin-top:4px;font-size:10px;color:var(--dim)">
      <span>\u7248\u672C v${s}</span>
      <a href="#" style="color:var(--blue);text-decoration:none" onclick="loadData(true);return false;">\u21BB \u5237\u65B0\u79EF\u5206</a>
    </div>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-val" id="kpiTotal">-</div><div class="kpi-lbl">\u5168\u6C60\u5269\u4F59\u79EF\u5206</div></div>
      <div class="kpi-box"><div class="kpi-val" id="kpiCn" style="color:var(--green)">-</div><div class="kpi-lbl">CN \u5065\u5EB7</div></div>
      <div class="kpi-box"><div class="kpi-val" id="kpiGlobal">-</div><div class="kpi-lbl">Global \u5065\u5EB7</div></div>
    </div>
    <div class="grid-2" style="margin-top:8px">
      <button class="btn btn-primary" onclick="runCmd('workbuddy2api.openConsole')">\u{1F5A5}\uFE0F \u5B8C\u6574\u63A7\u5236\u53F0</button>
      <button class="btn" onclick="runCmd('workbuddy2api.openBrowser')">\u{1F310} \u6D4F\u89C8\u5668\u6253\u5F00</button>
    </div>
  </div>

  <div id="feedbackBox" class="msg-box hidden"></div>

  <div class="card">
    <div class="row-between" style="margin-bottom:6px">
      <strong style="font-size:12px">\u4F18\u5148\u8C03\u5EA6\u8D26\u53F7 &amp; \u6388\u6743</strong>
      <span id="poolTotalCnt" style="font-size:10px;color:var(--dim)">0 \u8D26\u53F7</span>
    </div>
    <select id="activeSel" onchange="switchActive(this.value)" style="margin-bottom:6px"></select>
    <div class="grid-2">
      <button class="btn btn-green btn-sm" onclick="startOAuth('cn')">+ \u56FD\u5185\u7248 OAuth</button>
      <button class="btn btn-sm" onclick="startOAuth('global')">+ \u56FD\u9645\u7248 OAuth</button>
    </div>
    <details style="margin-top:8px">
      <summary style="cursor:pointer;font-size:11px;color:var(--dim)">+ \u7C98\u8D34 Token \u5FEB\u901F\u5165\u6C60</summary>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:5px">
        <select id="sbAddRealm"><option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option><option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option></select>
        <input id="sbAddNick" placeholder="\u5907\u6CE8\u6635\u79F0 (\u53EF\u9009)" />
        <textarea id="sbAddTok" rows="2" placeholder="\u7C98\u8D34 Refresh Token \u6216 Access Token"></textarea>
        <button class="btn btn-primary btn-sm" onclick="quickAddToken()">\u9A8C\u8BC1\u5E76\u5165\u6C60</button>
      </div>
    </details>
    <div id="oauthStatusBanner" class="hidden" style="margin-top:6px;font-size:11px;color:var(--amber)">\u7B49\u5F85\u7F51\u9875\u5B8C\u6210\u6388\u6743...</div>
  </div>

  <div class="card">
    <div style="font-weight:600;font-size:12px;margin-bottom:6px">\u65E5\u5E38\u81EA\u52A8\u5316\u64CD\u4F5C</div>
    <div class="grid-2">
      <button class="btn btn-amber btn-sm" onclick="runAction('/checkin',{all:true},'\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230')">\u{1F4C5} \u5168\u6C60\u7B7E\u5230</button>
      <button class="btn btn-green btn-sm" onclick="runAction('/growth/claim-all',{all:true},'\u5168\u53F7\u5403\u6EE1\u798F\u5229')">\u{1F381} \u5403\u6EE1\u798F\u5229</button>
      <button class="btn btn-sm" onclick="runAction('/travel/run-all',{},'\u5168\u6C60\u732B\u732B\u5DE1\u68C0')">\u{1F431} \u732B\u732B\u5DE1\u68C0</button>
      <button class="btn btn-sm" onclick="runAction('/school/run',{all:true},'\u5F00\u5B66\u5B63\u62BD\u5956')">\u{1F3EB} \u5F00\u5B66\u5B63\u62BD\u5956</button>
      <button class="btn btn-sm" onclick="runAction('/tasks/run',{all:true},'\u6210\u957F\u4EFB\u52A1\u6536\u5272')">\u26A1 \u6210\u957F\u4EFB\u52A1</button>
      <button class="btn btn-sm" onclick="runAction('/accounts/clear-all-cooldowns',{},'\u6E05\u9664\u51B7\u5374')">\u{1F513} \u6E05\u9664\u7194\u65AD</button>
    </div>
  </div>

  <div class="card">
    <div style="font-weight:600;font-size:12px;margin-bottom:6px">\u8D26\u53F7\u660E\u7EC6</div>
    <div id="miniAccountsList" style="max-height:180px;overflow-y:auto">\u52A0\u8F7D\u4E2D...</div>
  </div>

  <div class="card" style="margin-bottom:8px">
    <div class="row-between" style="margin-bottom:8px">
      <strong style="font-size:12px;color:var(--text);display:flex;align-items:center;gap:5px">
        <span>\u{1F50C}</span> \u672C\u673A\u5BA2\u6237\u7AEF\u4E0E IDE \u4E00\u952E\u63A5\u5165
      </strong>
      <span class="tag tag-ok">:${e}</span>
    </div>

    <!-- OpenAI Chat -->
    <div class="endpoint-item">
      <div class="endpoint-header">
        <span class="endpoint-name">OpenAI Chat / Codex</span>
        <span class="endpoint-badge">Cline \xB7 Roo \xB7 Cursor</span>
      </div>
      <div class="endpoint-body">
        <code>http://127.0.0.1:${e}/v1</code>
        <button class="btn btn-sm btn-copy" onclick="copyCfg('openai', this)" title="\u590D\u5236 Base URL">\u{1F4CB} \u590D\u5236</button>
      </div>
    </div>

    <!-- Claude Code -->
    <div class="endpoint-item" style="margin-top:6px">
      <div class="endpoint-header">
        <span class="endpoint-name">Claude Code CLI</span>
        <span class="endpoint-badge">count_tokens \u4F18\u5316</span>
      </div>
      <div class="endpoint-body">
        <code>http://127.0.0.1:${e}</code>
        <button class="btn btn-sm btn-copy" onclick="copyCfg('claude', this)" title="\u590D\u5236\u73AF\u5883\u53D8\u91CF\u914D\u7F6E\u547D\u4EE4">\u{1F4CB} \u590D\u5236\u547D\u4EE4</button>
      </div>
    </div>

    <!-- Codex Responses -->
    <div class="endpoint-item" style="margin-top:6px">
      <div class="endpoint-header">
        <span class="endpoint-name">Codex Responses API</span>
        <span class="endpoint-badge">/v1/responses</span>
      </div>
      <div class="endpoint-body">
        <code>http://127.0.0.1:${e}/v1/responses</code>
        <button class="btn btn-sm btn-copy" onclick="copyCfg('codex', this)" title="\u590D\u5236 Responses URL">\u{1F4CB} \u590D\u5236</button>
      </div>
    </div>
  </div>

  <div class="sidebar-footer">
    <span>\u26A1 WorkBuddy 2API \xB7 \u9AD8\u5E76\u53D1\u8C03\u5EA6\u7F51\u5173</span>
    <a href="#" style="color:var(--blue);text-decoration:none" onclick="runCmd('workbuddy2api.restartGateway');return false;">\u21BB \u91CD\u542F\u7F51\u5173</a>
  </div>

  <script>
    const PORT = ${e};
    const API = 'http://127.0.0.1:' + PORT + '/plugins/dsh-workbuddy2api';
    let pollTimer = null;

    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function showMsg(txt) {
      const el = document.getElementById('feedbackBox');
      el.textContent = txt;
      el.classList.remove('hidden');
    }

    function runCmd(cmd) {
      if (typeof window.__wb2aCommand === 'function') window.__wb2aCommand(cmd);
    }

    async function apiCall(path, opts = {}) {
      const r = await fetch(API + path, opts);
      return r.json().catch(() => ({}));
    }

    async function loadData(force = false) {
      try {
        const d = await apiCall('/status' + (force ? '?refresh=1' : ''));
        if (!d.ok) return;
        const s = d.summary || {};
        document.getElementById('kpiTotal').textContent = Number(s.all?.remain || 0).toLocaleString();
        document.getElementById('kpiCn').textContent = (s.cn?.healthyCount || 0) + '/' + (s.cn?.count || 0);
        document.getElementById('kpiGlobal').textContent = (s.global?.healthyCount || 0) + '/' + (s.global?.count || 0);

        const accs = d.accounts || [];
        document.getElementById('poolTotalCnt').textContent = accs.length + ' \u8D26\u53F7';
        const sel = document.getElementById('activeSel');
        sel.innerHTML = accs.map(a =>
          '<option value="' + esc(a.uid) + '"' + (a.uid === d.activeUid ? ' selected' : '') + '>[' + esc((a.realm||'cn').toUpperCase()) + '] ' + esc(a.nickname || a.uid) + ' (' + Number(a.balance?.remain || 0).toLocaleString() + ' \u5206)</option>'
        ).join('') || '<option value="">\u6682\u65E0\u8D26\u53F7\uFF0C\u8BF7\u5148\u6388\u6743\u6216\u7C98\u8D34\u5BFC\u5165</option>';

        document.getElementById('miniAccountsList').innerHTML = accs.map(a => {
          const st = a.manualDisabled ? '\u624B\u52A8\u505C\u7528' : a.disabled ? '\u7981\u7528' : a.coolingDown ? '\u51B7\u5374' : '\u6B63\u5E38';
          const cls = a.manualDisabled || a.disabled ? 'tag-err' : a.coolingDown ? 'tag-warn' : 'tag-ok';
          return '<div class="acc-item">' +
            '<div><strong>' + esc(a.nickname || a.uid) + '</strong> <span style="color:var(--dim)">(' + esc(a.realm) + ')</span></div>' +
            '<div style="display:flex;gap:4px;align-items:center"><strong style="color:var(--blue)">' + Number(a.balance?.remain || 0).toLocaleString() + '</strong><span class="tag ' + cls + '">' + st + '</span></div>' +
          '</div>';
        }).join('') || '<div style="color:var(--dim);font-size:11px">\u6682\u65E0\u8D26\u53F7</div>';
      } catch (err) {
        const b = document.getElementById('gwBadge');
        b.textContent = '\u8FDE\u63A5\u4E2D...';
        b.className = 'tag tag-warn';
      }
    }

    async function switchActive(uid) {
      if (!uid) return;
      await apiCall('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      showMsg('\u5DF2\u5207\u6362\u5F53\u524D\u4F18\u5148\u8D26\u53F7');
      loadData(false);
    }

    async function quickAddToken() {
      const token = document.getElementById('sbAddTok').value.trim();
      const nickname = document.getElementById('sbAddNick').value.trim();
      const realm = document.getElementById('sbAddRealm').value;
      if (!token) return showMsg('\u8BF7\u5148\u7C98\u8D34 Access \u6216 Refresh Token');
      showMsg('\u6B63\u5728\u9A8C\u8BC1 Token \u8FDE\u901A\u6027...');
      const res = await apiCall('/accounts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, realm, nickname }) });
      if (!res.ok) return showMsg('\u6DFB\u52A0\u5931\u8D25: ' + (res.error || '\u672A\u77E5\u9519\u8BEF'));
      document.getElementById('sbAddTok').value = '';
      document.getElementById('sbAddNick').value = '';
      showMsg('\u2705 \u5DF2\u6DFB\u52A0\u8D26\u53F7: ' + (res.account?.account?.nickname || '\u65B0\u8D26\u53F7'));
      loadData(true);
    }

    async function startOAuth(realm) {
      showMsg('\u6B63\u5728\u83B7\u53D6 ' + (realm === 'global' ? '\u56FD\u9645\u7248 WorkBuddy' : '\u56FD\u5185\u7248 CodeBuddy') + ' \u6388\u6743\u94FE\u63A5...');
      const res = await apiCall('/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm }) });
      if (!res.ok) return showMsg('OAuth \u53D1\u8D77\u5931\u8D25: ' + (res.error || '\u672A\u77E5\u9519\u8BEF'));
      if (typeof window.__wb2aOpenExternal === 'function') window.__wb2aOpenExternal(res.url);
      const banner = document.getElementById('oauthStatusBanner');
      banner.classList.remove('hidden');
      banner.textContent = '\u5DF2\u5728\u6D4F\u89C8\u5668\u6253\u5F00\u6388\u6743\u9875\uFF0C\u7B49\u5F85\u5B8C\u6210\u767B\u5F55...';
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        const p = await apiCall('/oauth/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm, state: res.state }) });
        if (p.success) {
          clearInterval(pollTimer); pollTimer = null;
          banner.classList.add('hidden');
          showMsg('\u2705 OAuth \u767B\u5F55\u6210\u529F: ' + (p.account?.account?.nickname || '\u65B0\u8D26\u53F7'));
          loadData(true);
        }
      }, 2000);
    }

    async function runAction(path, body, title) {
      showMsg('\u6B63\u5728\u6267\u884C ' + title + ' ...');
      const res = await apiCall(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const msg = res.message || (res.results ? (title + '\u5B8C\u6210\uFF0C\u5171\u5904\u7406 ' + res.results.length + ' \u4E2A\u8D26\u53F7') : (title + '\u5DF2\u5B8C\u6210'));
      showMsg('\u2705 ' + msg);
      loadData(true);
    }

    function copyCfg(kind, btnEl) {
      let text = '';
      let label = '';
      if (kind === 'openai') {
        text = 'http://127.0.0.1:' + PORT + '/v1';
        label = 'OpenAI Base URL';
      } else if (kind === 'claude') {
        text = '$env:ANTHROPIC_BASE_URL="http://127.0.0.1:' + PORT + '" ; $env:ANTHROPIC_API_KEY="sk-local"';
        label = 'Claude Code \u73AF\u5883\u53D8\u91CF';
      } else if (kind === 'codex') {
        text = 'http://127.0.0.1:' + PORT + '/v1/responses';
        label = 'Codex Responses URL';
      }
      window.__wb2aCopyText?.(text, label);
      if (btnEl) {
        const orig = btnEl.innerHTML;
        btnEl.innerHTML = '\u2713 \u5DF2\u590D\u5236';
        btnEl.style.color = 'var(--green)';
        btnEl.style.borderColor = '#a7f3d0';
        setTimeout(() => {
          btnEl.innerHTML = orig;
          btnEl.style.color = '';
          btnEl.style.borderColor = '';
        }, 1800);
      }
    }

    window.addEventListener('wb2a:ext-state', (e) => {
      const st = e.detail || {};
      const b = document.getElementById('gwBadge');
      if (st.port) {
        b.textContent = (st.mode === 'attached' ? '\u5916\u90E8\u63A5\u7BA1' : '\u5185\u7F6E\u8FD0\u884C') + ' :' + st.port;
        b.className = 'tag tag-ok';
      }
      loadData(false);
    });

    loadData(false);
    setInterval(() => loadData(false), 25000);
  </script>
</body>
</html>`}function zn(o){return new Promise(e=>{let t=Bt.default.get({host:"127.0.0.1",port:o,path:"/health",timeout:1500},s=>{let a=[];s.on("data",n=>a.push(n)),s.on("end",()=>{try{let n=JSON.parse(Buffer.concat(a).toString("utf8"));e(n&&n.service==="dsh-workbuddy2api"?n:null)}catch{e(null)}})});t.on("error",()=>e(null)),t.on("timeout",()=>{t.destroy(),e(null)})})}function qn(o){return new Promise(e=>{let t=Bt.default.get({host:"127.0.0.1",port:o,path:"/plugins/dsh-workbuddy2api/public/status",timeout:2500},s=>{let a=[];s.on("data",n=>a.push(n)),s.on("end",()=>{try{e(JSON.parse(Buffer.concat(a).toString("utf8")))}catch{e(null)}})});t.on("error",()=>e(null)),t.on("timeout",()=>{t.destroy(),e(null)})})}var Rt=null;async function Kn(o){let e=N.window.createOutputChannel("WorkBuddy 2API");o.subscriptions.push(e);let t=null,s="stopped",a=7863,n=null,r=null,l=null,c=N.window.createStatusBarItem(N.StatusBarAlignment.Right,100);c.command="workbuddy2api.openConsole",c.text="$(zap) WB2API \u542F\u52A8\u4E2D...",c.tooltip="WorkBuddy 2API \u591A\u8D26\u53F7\u7F51\u5173\uFF08\u70B9\u51FB\u6253\u5F00\u5B8C\u6574\u63A7\u5236\u53F0\uFF09",c.show(),o.subscriptions.push(c);function i(){let b={mode:s,port:a,version:K};n&&n.webview.postMessage({type:"wb2a:ext-update",state:b}),r&&r.webview.postMessage({type:"wb2a:ext-update",state:b})}async function d(){if(s==="stopped"){c.text="$(circle-slash) WB2API \u672A\u542F\u52A8",c.tooltip="WorkBuddy 2API \u7F51\u5173\u672A\u542F\u52A8 (\u70B9\u51FB\u542F\u52A8\u5E76\u6253\u5F00\u63A7\u5236\u53F0)";return}let b=await qn(a);if(b&&b.ok){let w=typeof b.remain=="number"&&b.remain>0?b.remain>=1e4?`${(b.remain/1e3).toFixed(1)}k`:String(b.remain):null;if(c.text=`$(zap) WB2API :${a} \xB7 ${b.healthy||0}/${b.total||0}\u53F7${w?` \xB7 $(database) ${w}`:""}`,typeof N.MarkdownString=="function"){let T=new N.MarkdownString;T.isTrusted=!0,T.supportHtml=!0,T.appendMarkdown(`### \u26A1 WorkBuddy 2API \u7F51\u5173\u670D\u52A1

`),T.appendMarkdown(`- **\u8FD0\u884C\u6A21\u5F0F**: \`${s==="attached"?"\u5916\u90E8\u7F51\u5173\u63A5\u7BA1":"\u5185\u7F6E\u7F51\u5173\u8FD0\u884C"}\`
`),T.appendMarkdown(`- **\u670D\u52A1\u7AEF\u53E3**: \`127.0.0.1:${a}\`
`),T.appendMarkdown(`- **\u53EF\u7528\u8D26\u53F7**: \`${b.healthy||0} / ${b.total||0}\` \u4E2A\u6B63\u5E38\u5728\u7EBF
`),typeof b.remain=="number"&&T.appendMarkdown(`- **\u5168\u6C60\u79EF\u5206**: **${b.remain.toLocaleString()}** \u79EF\u5206
`),b.cooling>0&&T.appendMarkdown(`- **\u7194\u65AD\u4FDD\u62A4**: \`${b.cooling}\` \u4E2A\u8D26\u53F7\u5904\u4E8E\u51B7\u5374\u964D\u7EA7
`),T.appendMarkdown(`
---
`),T.appendMarkdown("[\u{1F5A5}\uFE0F \u6253\u5F00\u63A7\u5236\u53F0](command:workbuddy2api.openConsole) &nbsp;|&nbsp; [\u{1F310} \u6D4F\u89C8\u5668\u6253\u5F00](command:workbuddy2api.openBrowser) &nbsp;|&nbsp; [\u{1F4CB} \u590D\u5236\u63A5\u5165\u914D\u7F6E](command:workbuddy2api.copyEndpoints) &nbsp;|&nbsp; [\u{1F4C5} \u5168\u6C60\u7B7E\u5230](command:workbuddy2api.checkinAll)"),c.tooltip=T}else c.tooltip=`WorkBuddy 2API (${s==="attached"?"\u5916\u90E8\u63A5\u7BA1":"\u5185\u7F6E\u8FD0\u884C"}) | \u5065\u5EB7 ${b.healthy}/${b.total} | \u70B9\u51FB\u6253\u5F00\u5168\u529F\u80FD\u63A7\u5236\u53F0`}else c.text=`$(zap) WB2API :${a}`,c.tooltip=`WorkBuddy 2API \u7F51\u5173\u8FD0\u884C\u4E8E :${a} (\u70B9\u51FB\u6253\u5F00\u63A7\u5236\u53F0)`}async function m(b=!1){let w=N.workspace.getConfiguration("workbuddy2api"),T=w.get("autoStart",!0),A=w.get("port",7863),P=A===0?0:Number(A)||7863,$=String(w.get("dshHome","")||"").trim()||void 0,R=String(w.get("proxy","")||"").trim()||void 0;b&&t&&(t.stop(),t=null,s="stopped");let L=P>0?await zn(P):null;if(L)return a=Number(L.port||P),s="attached",e.appendLine(`[gateway] \u68C0\u6D4B\u5230\u5DF2\u6709\u670D\u52A1\u8FD0\u884C\u4E8E 127.0.0.1:${a}\uFF0C\u5DF2\u65E0\u7F1D\u63A5\u7BA1\u5171\u4EAB`),await d(),i(),a;if(!T&&!b)return a=P,s="stopped",await d(),a;try{t=yo({dshHome:$,port:P,proxy:R,skipInitialWelfare:!1,logger:{info:y=>e.appendLine(`[INFO] ${y}`),warn:y=>e.appendLine(`[WARN] ${y}`),error:(y,p)=>e.appendLine(`[ERR] ${y} ${p?.message||""}`)}}),a=await t.start(),s="embedded",e.appendLine(`[gateway] \u5185\u7F6E\u7F51\u5173\u542F\u52A8\u6210\u529F: http://127.0.0.1:${a}`)}catch(y){s="stopped",e.appendLine(`[ERR] \u5185\u7F6E\u7F51\u5173\u542F\u52A8\u5931\u8D25: ${y.message}`),N.window.showErrorMessage(`WorkBuddy 2API \u7F51\u5173\u542F\u52A8\u5931\u8D25: ${y.message}`)}return await d(),i(),a}function h(){return Ls(Mt({port:a}),a,{mode:s,port:a,version:K})}function g(){if(r){r.reveal(N.ViewColumn.One);return}let b=N.window.createWebviewPanel("workbuddy2api.console","WorkBuddy 2API \u63A7\u5236\u53F0",N.ViewColumn.One,{enableScripts:!0,retainContextWhenHidden:!0});r=b,Ds(b.webview,N,()=>a,o.subscriptions),b.webview.html=h(),b.onDidDispose(()=>{r===b&&(r=null)})}let x={resolveWebviewView(b){n=b,b.webview.options={enableScripts:!0},Ds(b.webview,N,()=>a,o.subscriptions),b.webview.html=Ls(vo({port:a,mode:s,version:K}),a,{mode:s,port:a,version:K}),b.onDidDispose(()=>{n===b&&(n=null)})}};o.subscriptions.push(N.window.registerWebviewViewProvider("workbuddy2api.sidebarView",x,{webviewOptions:{retainContextWhenHidden:!0}})),o.subscriptions.push(N.commands.registerCommand("workbuddy2api.openConsole",async()=>{s==="stopped"&&await m(!1),g()}),N.commands.registerCommand("workbuddy2api.openBrowser",async()=>{s==="stopped"&&await m(!1),N.env.openExternal(N.Uri.parse(`http://127.0.0.1:${a}/console`))}),N.commands.registerCommand("workbuddy2api.refreshPool",async()=>{await d(),n&&n.webview.postMessage({type:"wb2a:ext-update",state:{mode:s,port:a}}),N.window.showInformationMessage(`WorkBuddy 2API \u72B6\u6001\u5DF2\u5237\u65B0 (:${a})`)}),N.commands.registerCommand("workbuddy2api.checkinAll",async()=>{s==="stopped"&&await m(!1);let b=Bt.default.request({host:"127.0.0.1",port:a,path:"/plugins/dsh-workbuddy2api/checkin",method:"POST",headers:{"Content-Type":"application/json"}},w=>{let T=[];w.on("data",A=>T.push(A)),w.on("end",()=>{try{let A=JSON.parse(Buffer.concat(T).toString("utf8"));N.window.showInformationMessage(A.message||"\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230\u5B8C\u6210")}catch{N.window.showInformationMessage("\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230\u5DF2\u89E6\u53D1")}})});b.write(JSON.stringify({all:!0})),b.end()}),N.commands.registerCommand("workbuddy2api.copyEndpoints",async()=>{let b=await N.window.showQuickPick([{label:"\u590D\u5236 OpenAI Chat / Codex Base URL",value:`http://127.0.0.1:${a}/v1`},{label:"\u590D\u5236 Claude Code (Anthropic) \u73AF\u5883\u53D8\u91CF (PowerShell)",value:`$env:ANTHROPIC_BASE_URL="http://127.0.0.1:${a}" ; $env:ANTHROPIC_API_KEY="sk-local"`},{label:"\u590D\u5236 Web \u63A7\u5236\u53F0\u5730\u5740",value:`http://127.0.0.1:${a}/console`}],{placeHolder:"\u9009\u62E9\u8981\u590D\u5236\u7684\u63A5\u5165\u914D\u7F6E"});b&&(await N.env.clipboard.writeText(b.value),N.window.showInformationMessage(`\u5DF2\u590D\u5236: ${b.label}`))}),N.commands.registerCommand("workbuddy2api.restartGateway",async()=>{await m(!0),r&&(r.webview.html=h()),N.window.showInformationMessage(`WorkBuddy 2API \u5DF2\u5C31\u7EEA (${s==="attached"?"\u63A5\u7BA1\u5916\u90E8\u7F51\u5173":"\u5185\u7F6E\u8FD0\u884C"} :${a})`)})),await m(!1),l=setInterval(()=>{d().catch(()=>{})},2e4),l.unref&&l.unref(),Rt={getPort:()=>a,getMode:()=>s,dispose:()=>{l&&(clearInterval(l),l=null),t&&s==="embedded"&&(t.stop(),t=null),s="stopped"}}}function Vn(){Rt&&(Rt.dispose(),Rt=null)}0&&(module.exports={activate,deactivate});
