window.__ModuleLoader__.load({ id: "dsh-workbuddy2api", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react4 = __toESM(require("react"), 1);

// src/client/components/SettingsCard.jsx
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
function uint8ToBase64(bytes) {
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
function SettingsCard({ t }) {
  const [tab, setTab] = (0, import_react.useState)("accounts");
  const [status, setStatus] = (0, import_react.useState)(null);
  const [usage, setUsage] = (0, import_react.useState)(null);
  const [modelsData, setModelsData] = (0, import_react.useState)({ models: [], enabledModels: [], aliases: {}, freeModels: [] });
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [actionMsg, setActionMsg] = (0, import_react.useState)("");
  const [newToken, setNewToken] = (0, import_react.useState)("");
  const [newRealm, setNewRealm] = (0, import_react.useState)("global");
  const [newNickname, setNewNickname] = (0, import_react.useState)("");
  const [importOpen, setImportOpen] = (0, import_react.useState)(false);
  const [importRealm, setImportRealm] = (0, import_react.useState)("global");
  const [importContent, setImportContent] = (0, import_react.useState)("");
  const [importFileBuf, setImportFileBuf] = (0, import_react.useState)(null);
  const [importResult, setImportResult] = (0, import_react.useState)(null);
  const [oauthModal, setOauthModal] = (0, import_react.useState)(null);
  const oauthTimerRef = (0, import_react.useRef)(null);
  const [selectedUid, setSelectedUid] = (0, import_react.useState)("");
  const [travelData, setTravelData] = (0, import_react.useState)(null);
  const [growthData, setGrowthData] = (0, import_react.useState)(null);
  const [inviteInfo, setInviteInfo] = (0, import_react.useState)(null);
  const [bindCodeInput, setBindCodeInput] = (0, import_react.useState)("");
  const [tasksList, setTasksList] = (0, import_react.useState)([]);
  const [activityLogs, setActivityLogs] = (0, import_react.useState)([]);
  const [modelSearch, setModelSearch] = (0, import_react.useState)("");
  const [modelFilter, setModelFilter] = (0, import_react.useState)("all");
  const [aliasesDraft, setAliasesDraft] = (0, import_react.useState)("{}");
  const [modelRoutesDraft, setModelRoutesDraft] = (0, import_react.useState)("{}");
  const [autoFreeDraft, setAutoFreeDraft] = (0, import_react.useState)(true);
  const [freeModelsDraft, setFreeModelsDraft] = (0, import_react.useState)("global:hy4free, cn:hy4free");
  const [packsModalAcc, setPacksModalAcc] = (0, import_react.useState)(null);
  const [updTokenModal, setUpdTokenModal] = (0, import_react.useState)(null);
  const [liveLogs, setLiveLogs] = (0, import_react.useState)([]);
  const [inFlightList, setInFlightList] = (0, import_react.useState)([]);
  const [pgModel, setPgModel] = (0, import_react.useState)("auto-free");
  const [pgEffort, setPgEffort] = (0, import_react.useState)("");
  const [pgPrompt, setPgPrompt] = (0, import_react.useState)("\u4F60\u597D\uFF0C\u8BF7\u7528\u4E00\u53E5\u8BDD\u81EA\u6211\u4ECB\u7ECD");
  const [pgAttach, setPgAttach] = (0, import_react.useState)(null);
  const [pgOutput, setPgOutput] = (0, import_react.useState)("\u7B49\u5F85\u53D1\u9001\u6D4B\u8BD5\u8BF7\u6C42...");
  const [pgMetrics, setPgMetrics] = (0, import_react.useState)("");
  const [pgRunning, setPgRunning] = (0, import_react.useState)(false);
  const [dshInfo, setDshInfo] = (0, import_react.useState)(null);
  const [usageDate, setUsageDate] = (0, import_react.useState)("");
  const [updateInfo, setUpdateInfo] = (0, import_react.useState)(null);
  const [cfgDraft, setCfgDraft] = (0, import_react.useState)({
    apiKey: "",
    proxy: "",
    maxInFlightCN: 3,
    maxInFlightGlobal: 2,
    queueTimeoutMs: 6e4,
    streamIdleTimeoutMs: 9e4,
    deviceTokenPath: "",
    portalAsHome: false,
    promptMode: "none",
    promptText: "",
    autoCheckin: true,
    autoTravel: true,
    autoTasks: true,
    autoRefreshToken: true
  });
  const [webPasswordDraft, setWebPasswordDraft] = (0, import_react.useState)("");
  const [ipWlDraft, setIpWlDraft] = (0, import_react.useState)({ enabled: false, allowLocalhost: true, text: "" });
  const [alertsDraft, setAlertsDraft] = (0, import_react.useState)({ enabled: false, minCredit: 50, webhooksText: "", events: ["ban", "401", "cooling", "low_credit"] });
  const [schedDraft, setSchedDraft] = (0, import_react.useState)({ checkin: "9, 21", travel: "9, 21", tasks: "11", school: "12", cat: "1", keepalive: "22" });
  const [usersList, setUsersList] = (0, import_react.useState)([]);
  const [newUserDraft, setNewUserDraft] = (0, import_react.useState)({ username: "", password: "", role: "user", dailyCreditLimit: 0, rpm: 0 });
  const notifyBalanceUpdate = () => {
    try {
      window.dispatchEvent(new CustomEvent("wb2a:refresh-balance"));
    } catch (_) {
    }
  };
  const appendLog = (msg) => {
    setActivityLogs((prev) => [`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);
  };
  const fetchStatus = async (refresh = false) => {
    try {
      const res = await fetch(`/plugins/dsh-workbuddy2api/status${refresh ? "?refresh=1" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (!selectedUid && data.activeUid) {
          setSelectedUid(data.activeUid);
        }
        if (data.config) {
          setCfgDraft((prev) => ({ ...prev, ...data.config }));
          const wl = data.config.ipWhitelist || {};
          setIpWlDraft({ enabled: Boolean(wl.enabled), allowLocalhost: wl.allowLocalhost !== false, text: (wl.allowedIPs || []).join("\n") });
          const al = data.config.alerts || {};
          setAlertsDraft({
            enabled: Boolean(al.enabled),
            minCredit: al.minCredit ?? 50,
            webhooksText: (al.webhooks || []).join("\n"),
            events: al.events || ["ban", "401", "cooling", "low_credit"]
          });
          const sch = data.config.schedule || {};
          setSchedDraft({
            checkin: (sch.checkinHours || [9, 21]).join(", "),
            travel: (sch.travelHours || [9, 21]).join(", "),
            tasks: (sch.tasksHours || [11]).join(", "),
            school: (sch.schoolHours || [12]).join(", "),
            cat: (sch.catHours || [1]).join(", "),
            keepalive: (sch.keepaliveHours || [22]).join(", ")
          });
        }
      }
    } catch (_) {
    }
  };
  const fetchAdminUsers = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/admin/users");
      if (res.ok) {
        const d = await res.json();
        setUsersList(d.users || []);
      }
    } catch (_) {
    }
  };
  const fetchModels = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/models");
      if (res.ok) {
        const data = await res.json();
        setModelsData(data);
        setAliasesDraft(JSON.stringify(data.aliases || {}, null, 2));
        setModelRoutesDraft(JSON.stringify(data.modelRoutes || {}, null, 2));
        setAutoFreeDraft(data.autoFreeEnabled !== false);
        setFreeModelsDraft((data.freeModels || ["global:hy4free", "cn:hy4free"]).join(", "));
      }
    } catch (_) {
    }
  };
  const fetchUsage = async (dateVal = usageDate) => {
    try {
      const res = await fetch(`/plugins/dsh-workbuddy2api/usage${dateVal ? `?date=${encodeURIComponent(dateVal)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data.stats);
      }
    } catch (_) {
    }
  };
  const fetchActivityPanel = async (uid) => {
    const target = uid || selectedUid || status?.activeUid;
    if (!target) return;
    try {
      const [trRes, grRes, invRes] = await Promise.all([
        fetch(`/plugins/dsh-workbuddy2api/travel/status?uid=${encodeURIComponent(target)}`),
        fetch(`/plugins/dsh-workbuddy2api/growth/status?uid=${encodeURIComponent(target)}`),
        fetch(`/plugins/dsh-workbuddy2api/invite/info?uid=${encodeURIComponent(target)}`)
      ]);
      if (trRes.ok) setTravelData(await trRes.json());
      if (grRes.ok) setGrowthData(await grRes.json());
      if (invRes.ok) {
        const invJson = await invRes.json();
        setInviteInfo(invJson.info || null);
      }
    } catch (_) {
    }
  };
  const fetchTasksPanel = async (uid) => {
    const target = uid || selectedUid || status?.activeUid;
    if (!target) return;
    try {
      const res = await fetch(`/plugins/dsh-workbuddy2api/tasks/list?uid=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setTasksList(data.tasks || []);
      }
    } catch (_) {
    }
  };
  (0, import_react.useEffect)(() => {
    fetchStatus(false);
    fetchUsage();
    fetchModels();
    return () => {
      if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
    };
  }, []);
  const fetchLogs = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/logs");
      if (res.ok) {
        const data = await res.json();
        setLiveLogs(data.logs || []);
        setInFlightList(data.inFlight || []);
      }
    } catch (_) {
    }
  };
  const fetchDshCheck = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/dsh/check");
      if (res.ok) setDshInfo(await res.json());
    } catch (_) {
    }
  };
  const handlePgFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith("image/")) {
      reader.onload = () => setPgAttach({ kind: "image", name: file.name, data: reader.result });
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => setPgAttach({ kind: "text", name: file.name, data: String(reader.result || "").slice(0, 32e3) });
      reader.readAsText(file);
    }
  };
  const handleRunPlayground = async () => {
    setPgRunning(true);
    setPgOutput(`\u23F3 \u6B63\u5728\u8BF7\u6C42 ${pgModel} ...`);
    setPgMetrics("\u8BF7\u6C42\u4E2D...");
    const t0 = Date.now();
    try {
      const promptText = pgPrompt.trim() || "\u4F60\u597D";
      let contentPayload = promptText;
      if (pgAttach?.kind === "image") {
        contentPayload = [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: pgAttach.data } }
        ];
      } else if (pgAttach?.kind === "text") {
        contentPayload = `${promptText}

[\u9644\u4EF6 ${pgAttach.name}]
${pgAttach.data}`;
      }
      const payload = {
        model: pgModel || "auto-free",
        stream: false,
        messages: [{ role: "user", content: contentPayload }]
      };
      if (pgEffort) payload.reasoning_effort = pgEffort;
      const res = await fetch("/plugins/dsh-workbuddy2api/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        setPgOutput(`\u274C HTTP ${res.status}: ${json.error?.message || JSON.stringify(json)}`);
        setPgMetrics(`\u5931\u8D25 (${res.status})`);
      } else {
        const msg = json.choices?.[0]?.message || {};
        const u = json.usage || {};
        setPgOutput(
          `${msg.reasoning_content ? `[\u601D\u8003\u8FC7\u7A0B]
${msg.reasoning_content}

[\u56DE\u7B54\u6B63\u6587]
` : ""}${msg.content || JSON.stringify(json, null, 2)}`
        );
        const cr = u.credit !== void 0 ? ` \xB7 \u6263\u8D39 ${u.credit}` : "";
        setPgMetrics(`\u8017\u65F6 ${Date.now() - t0}ms \xB7 Tokens ${u.total_tokens || "-"}${cr}`);
      }
      fetchLogs();
      fetchUsage();
    } catch (e) {
      setPgOutput(`\u274C \u8BF7\u6C42\u5F02\u5E38: ${e.message}`);
      setPgMetrics("\u5F02\u5E38");
    } finally {
      setPgRunning(false);
    }
  };
  (0, import_react.useEffect)(() => {
    if (tab === "activity") fetchActivityPanel();
    if (tab === "tasks") fetchTasksPanel();
    if (tab === "models") fetchModels();
    if (tab === "playground") {
      fetchModels();
      fetchLogs();
    }
    if (tab === "usage") fetchUsage();
    if (tab === "settings") {
      fetchDshCheck();
      fetchAdminUsers();
    }
  }, [tab, selectedUid]);
  const handleAddAccount = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/accounts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: newToken.trim(), realm: newRealm, nickname: newNickname.trim() })
      });
      const data = await res.json();
      setActionMsg(data.ok ? `\u2705 \u8D26\u53F7\u6DFB\u52A0\u6210\u529F: ${data.account?.account?.nickname}` : `\u274C ${data.error}`);
      if (data.ok) {
        setNewToken("");
        setNewNickname("");
        await fetchStatus(true);
        notifyBalanceUpdate();
      }
    } catch (e) {
      setActionMsg(`\u274C \u6DFB\u52A0\u5F02\u5E38: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleAdminAction = async (uid, action) => {
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/accounts/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action })
      });
      const data = await res.json();
      setActionMsg(data.message ? `\u26A1 ${data.message}` : data.error || "\u64CD\u4F5C\u5B8C\u6210");
      await fetchStatus(action === "refresh" || action === "trial");
      notifyBalanceUpdate();
    } catch (e) {
      setActionMsg(`\u274C \u64CD\u4F5C\u5931\u8D25: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleStartOAuth = async (realm) => {
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/oauth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realm })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "\u53D1\u8D77 OAuth \u5931\u8D25");
      setOauthModal({ realm, state: data.state, url: data.url, notice: "\u5DF2\u6253\u5F00\u6D4F\u89C8\u5668\u6388\u6743\u9875\uFF0C\u7B49\u5F85\u56DE\u8C03\u786E\u8BA4..." });
      try {
        window.open(data.url, "_blank");
      } catch (_) {
      }
      if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
      oauthTimerRef.current = setInterval(async () => {
        try {
          const pRes = await fetch("/plugins/dsh-workbuddy2api/oauth/poll", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ realm, state: data.state })
          });
          const pData = await pRes.json();
          if (pData.success) {
            clearInterval(oauthTimerRef.current);
            oauthTimerRef.current = null;
            setOauthModal(null);
            setActionMsg(`\u{1F389} OAuth \u767B\u5F55\u6210\u529F: ${pData.account?.account?.nickname || "\u65B0\u8D26\u53F7"}`);
            await fetchStatus(true);
            notifyBalanceUpdate();
          } else if (pData.notice) {
            setOauthModal((prev) => prev ? { ...prev, notice: pData.notice } : prev);
          }
        } catch (_) {
        }
      }, 2e3);
    } catch (e) {
      setActionMsg(`\u274C OAuth \u53D1\u8D77\u5931\u8D25: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImportFileBuf(null);
      return;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    setImportFileBuf(buf);
  };
  const handleSubmitImport = async () => {
    setLoading(true);
    setImportResult(null);
    try {
      const payload = importFileBuf ? { defaultRealm: importRealm, base64Zip: uint8ToBase64(importFileBuf) } : { defaultRealm: importRealm, content: importContent };
      const res = await fetch("/plugins/dsh-workbuddy2api/accounts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setImportResult(data);
      setActionMsg(`\u{1F4E5} \u5BFC\u5165\u5B8C\u6210: \u65B0\u589E ${data.imported || 0} / \u66F4\u65B0 ${data.updated || 0} / \u5931\u8D25 ${data.failed || 0}`);
      await fetchStatus(true);
      notifyBalanceUpdate();
    } catch (e) {
      setActionMsg(`\u274C \u6279\u91CF\u5BFC\u5165\u5931\u8D25: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleModel = (modelId) => {
    const current = new Set(modelsData.enabledModels || []);
    if (current.has(modelId)) current.delete(modelId);
    else current.add(modelId);
    setModelsData((prev) => ({ ...prev, enabledModels: Array.from(current) }));
  };
  const handleSaveModels = async () => {
    let parsedAliases;
    let parsedRoutes;
    try {
      parsedAliases = JSON.parse(aliasesDraft);
      parsedRoutes = JSON.parse(modelRoutesDraft || "{}");
    } catch (e) {
      setActionMsg(`\u274C JSON \u683C\u5F0F\u9519\u8BEF: ${e.message}`);
      return;
    }
    const freeModels = freeModelsDraft.split(",").map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabledModels: modelsData.enabledModels || [],
          aliases: parsedAliases,
          modelRoutes: parsedRoutes,
          autoFreeEnabled: autoFreeDraft,
          freeModels
        })
      });
      const data = await res.json();
      setActionMsg(data.ok ? "\u2705 \u6A21\u578B\u8DEF\u7531\u7EC4\u3001\u8FC7\u6EE4\u4E0E\u522B\u540D\u914D\u7F6E\u5DF2\u4FDD\u5B58" : `\u274C \u4FDD\u5B58\u5931\u8D25`);
      await fetchModels();
    } finally {
      setLoading(false);
    }
  };
  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfgDraft)
      });
      const data = await res.json();
      setActionMsg(data.ok ? "\u2705 \u7F51\u5173\u8FD0\u884C\u53C2\u6570\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548" : `\u274C ${data.error}`);
      await fetchStatus(false);
    } finally {
      setLoading(false);
    }
  };
  const accounts = status?.accounts || [];
  const summary = status?.summary || {};
  const port = status?.gatewayPort || 7863;
  const gatewayUrl = `http://127.0.0.1:${port}/v1`;
  const consoleUrl = `http://127.0.0.1:${port}/console`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u26A1 WorkBuddy 2API \u5168\u529F\u80FD\u7F51\u5173\u63A7\u5236\u53F0" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge wb2a-badge-success", children: [
          "\u5728\u7EBF :",
          port
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: consoleUrl,
            target: "_blank",
            rel: "noreferrer",
            className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
            style: { textDecoration: "none" },
            children: "\u6253\u5F00\u72EC\u7ACB Console \u2197"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-sm", onClick: () => fetchStatus(true), disabled: loading, children: "\u21BB \u5B9E\u65F6\u5237\u65B0" })
      ] })
    ] }),
    actionMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        style: {
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          fontSize: 12,
          color: "#1e40af"
        },
        children: actionMsg
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-tabs", style: { flexWrap: "wrap" }, children: [
      ["accounts", "\u603B\u89C8\u4E0E\u8D26\u53F7\u6C60"],
      ["models", "\u6A21\u578B\u4E0E\u500D\u7387"],
      ["playground", "\u5728\u7EBF\u8C03\u8BD5\u4E0E\u6D41\u6C34"],
      ["usage", "\u7528\u91CF\u4E0E\u6263\u8D39"],
      ["activity", "\u732B\u732B\u65C5\u884C\u4E0E\u798F\u5229"],
      ["tasks", "\u6210\u957F\u4EFB\u52A1\u5F15\u64CE"],
      ["settings", "\u7F51\u5173\u8BBE\u7F6E\u4E0E\u63A5\u5165"]
    ].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        className: `wb2a-tab-btn ${tab === key ? "active" : ""}`,
        onClick: () => setTab(key),
        children: label
      },
      key
    )) }),
    tab === "accounts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-summary-grid", children: [
        ["\u5168\u6C60\u5408\u8BA1 (All)", summary.all, "#2563eb"],
        ["\u56FD\u5185\u7248 (CodeBuddy CN)", summary.cn, "#059669"],
        ["\u56FD\u9645\u7248 (WorkBuddy AI)", summary.global, "#0284c7"]
      ].map(([title, s = {}, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#64748b" }, children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 22, fontWeight: 700, color, margin: "4px 0" }, children: Number(s.remain || 0).toLocaleString() }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 10, color: "#64748b" }, children: [
          "\u53EF\u7528 ",
          s.enabledCount || 0,
          "/",
          s.count || 0,
          " \xB7 \u57FA ",
          s.baseRemain || 0,
          " \xB7 \u8D60 ",
          s.bonusRemain || 0,
          " \xB7 \u8D2D ",
          s.purchasedRemain || 0
        ] })
      ] }, title)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success wb2a-btn-sm", onClick: () => handleStartOAuth("cn"), disabled: loading, children: "+ \u56FD\u5185\u7248 OAuth \u767B\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-sm", onClick: () => handleStartOAuth("global"), disabled: loading, children: "+ \u56FD\u9645\u7248 OAuth \u767B\u5F55" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => {
          setImportResult(null);
          setImportOpen(true);
        }, children: "\u6279\u91CF / ZIP \u5BFC\u5165" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "a",
          {
            href: "/plugins/dsh-workbuddy2api/accounts/export.zip",
            className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
            style: { textDecoration: "none" },
            children: "\u5BFC\u51FA ZIP \u5907\u4EFD"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const r = await fetch("/plugins/dsh-workbuddy2api/accounts/refresh-all", { method: "POST" });
                const d = await r.json();
                setActionMsg(`\u{1F504} \u5168\u6C60 Token \u5237\u65B0: \u6210\u529F ${d.refreshed} / \u8DF3\u8FC7 ${d.skipped} / \u5931\u8D25 ${d.failed}`);
                await fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u5168\u6C60\u5237\u65B0 Token"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              const r = await fetch("/plugins/dsh-workbuddy2api/accounts/clear-all-cooldowns", { method: "POST" });
              const d = await r.json();
              setActionMsg(`\u26A1 ${d.message}`);
              await fetchStatus(false);
            },
            children: "\u4E00\u952E\u6E05\u9664\u5168\u90E8\u7194\u65AD"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              const r = await fetch("/plugins/dsh-workbuddy2api/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true })
              });
              const d = await r.json();
              setActionMsg(`\u{1F4C5} ${d.message || "\u6279\u91CF\u7B7E\u5230\u5B8C\u6210"}`);
              await fetchStatus(true);
              notifyBalanceUpdate();
            },
            children: "\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              const r = await fetch("/plugins/dsh-workbuddy2api/trial/batch", { method: "POST" });
              const d = await r.json();
              setActionMsg(`\u{1F381} \u56FD\u9645\u7248\u6279\u91CF Trial \u6267\u884C\u5B8C\u6210 (${d.results?.length || 0})`);
              await fetchStatus(true);
              notifyBalanceUpdate();
            },
            children: "\u6279\u91CF\u9886Trial"
          }
        )
      ] }),
      accounts.map((acc) => {
        const isAct = acc.uid === status?.activeUid;
        const bal = acc.balance || {};
        const diag = acc.diagnostics || {};
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `wb2a-account-item ${isAct ? "active" : ""}`, style: { flexWrap: "wrap", gap: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { minWidth: 220, flex: 1 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: acc.nickname || acc.uid.slice(0, 10) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", children: acc.realm }),
              isAct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge wb2a-badge-success", children: "\u5F53\u524D\u4F18\u5148" }),
              acc.manualDisabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", style: { color: "#dc2626", background: "#fef2f2", borderColor: "#fecaca" }, children: "\u624B\u52A8\u505C\u7528" }),
              !acc.manualDisabled && acc.disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", style: { color: "#dc2626", background: "#fef2f2", borderColor: "#fecaca" }, children: "\u81EA\u52A8\u7981\u7528" }),
              !acc.disabled && !acc.manualDisabled && diag.coolingDown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge wb2a-badge-warn", children: [
                "\u7194\u65AD ",
                diag.cooldownRemainingSec,
                "s"
              ] }),
              diag.modelCooldowns?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge wb2a-badge-warn", children: [
                diag.modelCooldowns.length,
                "\u6A21\u578B\u51B7\u5374"
              ] }),
              acc.checkinState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wb2a-badge ${acc.checkinState.ok ? "wb2a-badge-success" : "wb2a-badge-warn"}`, children: acc.checkinState.ok ? "\u4ECA\u65E5\u5DF2\u7B7E" : "\u5F85\u91CD\u8BD5" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: "#475569", marginTop: 4 }, children: [
              "\u5B9E\u65F6\u79EF\u5206: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#2563eb" }, children: Number(bal.remain || 0).toLocaleString() }),
              " / ",
              Number(bal.total || 0).toLocaleString(),
              " \xB7 ",
              "\u57FA:",
              bal.baseRemain || 0,
              " \u8D60:",
              bal.bonusRemain || 0,
              " \u8D2D:",
              bal.purchasedRemain || 0,
              " \xB7 ",
              "\u5E76\u53D1: ",
              acc.inFlight || 0,
              "/",
              diag.limit || 3,
              " \xB7 ",
              "\u6210\u529F/\u5931\u8D25: ",
              diag.stats?.successCount || 0,
              "/",
              diag.stats?.failCount || 0
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" }, children: [
            !isAct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-sm",
                onClick: async () => {
                  await fetch("/plugins/dsh-workbuddy2api/accounts/switch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: acc.uid })
                  });
                  fetchStatus(false);
                  notifyBalanceUpdate();
                },
                children: "\u8BBE\u4F18\u5148"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => setPacksModalAcc(acc), children: [
              "\u5305\u660E\u7EC6(",
              bal.activePackCount || 0,
              ")"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
                onClick: () => setUpdTokenModal({ uid: acc.uid, nickname: acc.nickname, accessToken: "", refreshToken: "" }),
                children: "\u6362Token"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => handleAdminAction(acc.uid, "refresh"), children: "\u5237\u65B0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: `wb2a-btn wb2a-btn-sm ${acc.manualDisabled ? "wb2a-btn-success" : "wb2a-btn-danger"}`,
                onClick: () => handleAdminAction(acc.uid, acc.manualDisabled ? "manualEnable" : "disable"),
                children: acc.manualDisabled ? "\u6062\u590D" : "\u505C\u7528"
              }
            ),
            (acc.disabled || diag.coolingDown || diag.modelCooldowns?.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm", onClick: () => handleAdminAction(acc.uid, "revive"), children: "\u590D\u6D3B" }),
            acc.realm === "global" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success wb2a-btn-sm", onClick: () => handleAdminAction(acc.uid, "trial"), children: "\u9886Trial" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm",
                onClick: async () => {
                  await fetch("/plugins/dsh-workbuddy2api/accounts/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: acc.uid })
                  });
                  fetchStatus(false);
                  notifyBalanceUpdate();
                },
                children: "\u5220\u9664"
              }
            )
          ] })
        ] }, acc.uid);
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#475569", marginBottom: 6 }, children: "\u5355\u6761\u51ED\u8BC1\u5FEB\u901F\u5165\u6C60\uFF08\u652F\u6301 Access / Refresh Token \u81EA\u52A8\u89E3\u6790\uFF09:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              style: { flex: 2, minWidth: 180 },
              placeholder: "\u7C98\u8D34 Refresh Token \u6216 Access Token",
              value: newToken,
              onChange: (e) => setNewToken(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              style: { flex: 1, minWidth: 100 },
              placeholder: "\u5907\u6CE8\u6635\u79F0 (\u53EF\u9009)",
              value: newNickname,
              onChange: (e) => setNewNickname(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "wb2a-input", style: { width: 110 }, value: newRealm, onChange: (e) => setNewRealm(e.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "global", children: "Global" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cn", children: "CN" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn", onClick: handleAddAccount, disabled: loading, children: "+ \u6DFB\u52A0" })
        ] })
      ] })
    ] }),
    tab === "activity" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "select",
          {
            className: "wb2a-input",
            style: { width: 220 },
            value: selectedUid || status?.activeUid || "",
            onChange: (e) => setSelectedUid(e.target.value),
            children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: a.uid, children: [
              "[",
              a.realm.toUpperCase(),
              "] ",
              a.nickname || a.uid
            ] }, a.uid))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/growth/claim-all", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ all: true })
                });
                const data = await res.json();
                appendLog(`\u5168\u53F7\u5403\u6EE1\u798F\u5229\u5B8C\u6210: ${JSON.stringify(data.results?.length || 0)} \u4E2A\u8D26\u53F7`);
                fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u5168\u53F7\u4E00\u952E\u5403\u6EE1\u798F\u5229"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-sm",
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/travel/run-all", { method: "POST" });
                const data = await res.json();
                appendLog(`\u5168\u6C60\u732B\u732B\u5DE1\u68C0\u5B8C\u6210 (${data.results?.length || 0} \u4E2A\u56FD\u5185\u8D26\u53F7)`);
                fetchActivityPanel();
              } finally {
                setLoading(false);
              }
            },
            children: "\u5168\u6C60\u5DE1\u68C0\u732B\u732B\u65C5\u884C"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm",
            onClick: async () => {
              const res = await fetch("/plugins/dsh-workbuddy2api/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true })
              });
              const d = await res.json();
              appendLog(d.message || "\u5168\u6C60\u7B7E\u5230\u5B8C\u6210");
              fetchStatus(true);
              notifyBalanceUpdate();
            },
            children: "\u5168\u53F7\u6BCF\u65E5\u7B7E\u5230"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 13 }, children: "\u{1F431} \u732B\u732B\u65C5\u884C\u7BA1\u5BB6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-sm",
                onClick: async () => {
                  const res = await fetch("/plugins/dsh-workbuddy2api/travel/depart", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                  });
                  const d = await res.json();
                  appendLog(`\u732B\u732B\u51FA\u53D1\u7ED3\u679C: ${JSON.stringify(d)}`);
                  fetchActivityPanel();
                },
                children: "\u6D3E\u51FA\u65C5\u884C"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#475569" }, children: [
            "\u5BA0\u7269: ",
            travelData?.buddy?.name || "\u672A\u9886\u517B/\u4EC5CN\u652F\u6301",
            " \xB7 \u72B6\u6001: ",
            travelData?.travel?.state || "-",
            " \xB7 \u5F85\u9886\u5956\u52B1: ",
            travelData?.travel?.reward_credit || 0
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 13 }, children: "\u{1F3B0} \u8FDE\u767B\u798F\u5229\u4E0E\u62BD\u5956" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
                onClick: async () => {
                  const res = await fetch("/plugins/dsh-workbuddy2api/growth/lottery/draw", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                  });
                  const d = await res.json();
                  appendLog(`\u62BD\u5956\u7ED3\u679C: ${JSON.stringify(d.result)}`);
                  fetchActivityPanel();
                  notifyBalanceUpdate();
                },
                children: "\u62BD\u4E00\u6B21\u5956"
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#475569" }, children: [
            "\u8FDE\u767B\u5929\u6570: ",
            growthData?.streak?.streak_days ?? growthData?.streak?.days ?? "-",
            " \xB7 \u62BD\u5956\u6B21\u6570: ",
            growthData?.chances?.remaining ?? growthData?.chances?.chances ?? 0
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 6 }, children: "\u{1F381} \u5B98\u65B9\u4E13\u5C5E\u9080\u8BF7\u4E2D\u5FC3" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#475569", marginBottom: 8, lineHeight: 1.7 }, children: [
          "\u9080\u8BF7\u7801: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#2563eb" }, children: inviteInfo?.inviteCode || "\u6682\u672A\u5206\u914D" }),
          " \xB7 ",
          "\u5DF2\u9080\u8BF7: ",
          inviteInfo?.invitedCount || 0,
          " \u4EBA (\u6709\u6548 ",
          inviteInfo?.validInviteCount || 0,
          ")",
          " \xB7 ",
          "\u7D2F\u8BA1\u5956\u52B1: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { style: { color: "#059669" }, children: [
            "+",
            inviteInfo?.rewardCredit || 0
          ] }),
          " \u79EF\u5206",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          "\u4E13\u5C5E\u94FE\u63A5:",
          " ",
          inviteInfo?.inviteUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: inviteInfo.inviteUrl, target: "_blank", rel: "noreferrer", style: { color: "#2563eb", fontWeight: 500 }, children: inviteInfo.inviteUrl }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "-" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              placeholder: "\u7C98\u8D34\u63A8\u8350\u4EBA\u9080\u8BF7\u7801\u6216\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u8FDB\u884C\u7ED1\u5B9A...",
              value: bindCodeInput,
              onChange: (e) => setBindCodeInput(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
              onClick: async () => {
                const res = await fetch("/plugins/dsh-workbuddy2api/invite/bind", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ uid: selectedUid || status?.activeUid, inviteCode: bindCodeInput })
                });
                const d = await res.json();
                appendLog(`\u9080\u8BF7\u7ED1\u5B9A: ${d.message || JSON.stringify(d)}`);
                setActionMsg(`${d.ok ? "\u2705" : "\u274C"} ${d.message || "\u7ED1\u5B9A\u8BF7\u6C42\u5DF2\u6267\u884C"}`);
                fetchStatus(true);
              },
              children: "\u7ACB\u5373\u7ED1\u5B9A"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "wb2a-code", style: { maxHeight: 160 }, children: activityLogs.join("\n") || "\u6682\u65E0\u6D3B\u52A8\u65E5\u5FD7" })
    ] }),
    tab === "tasks" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "select",
          {
            className: "wb2a-input",
            style: { width: 220 },
            value: selectedUid || status?.activeUid || "",
            onChange: (e) => setSelectedUid(e.target.value),
            children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: a.uid, children: [
              "[",
              a.realm.toUpperCase(),
              "] ",
              a.nickname || a.uid
            ] }, a.uid))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/tasks/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                });
                const d = await res.json();
                setActionMsg(`\u2705 ${d.result?.summary || "\u6210\u957F\u4EFB\u52A1\u5DF2\u5168\u90E8\u81EA\u52A8\u89E6\u53D1\u4E0E\u6536\u5272"}`);
                await fetchTasksPanel();
                await fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u4E00\u952E\u5168\u81EA\u52A8\u70B9\u4EAE\u6536\u5272 (\u5355\u53F7)"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/tasks/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ all: true })
                });
                const d = await res.json();
                setActionMsg(`\u2705 \u5DF2\u6279\u91CF\u8DD1\u5B8C ${d.results?.length || 0} \u4E2A\u56FD\u5185\u8D26\u53F7\u5168\u5957\u6210\u957F\u4EFB\u52A1`);
                await fetchTasksPanel();
                await fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u5168\u91CF\u56FD\u5185\u53F7\u81EA\u52A8\u8DD1\u4EFB\u52A1"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/school/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                });
                const d = await res.json();
                const r = d.result || {};
                setActionMsg(`\u{1F3EB} ${r.summary || `\u5F00\u5B66\u5B63: \u5B8C\u6210 ${r.logs?.length || 0} \u6B65, \u62BD\u5956 ${r.prizes?.length || 0} \u6B21 (+${r.creditGained || 0} \u5206)`}`);
                await fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u{1F3EB} \u5F00\u5B66\u5B63\u6D3B\u52A8+\u62BD\u5956"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/school/run", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ all: true })
                });
                const d = await res.json();
                setActionMsg(`\u{1F393} \u5168\u53F7\u5F00\u5B66\u5B63\u5DF2\u5B8C\u6210 (${d.results?.length || 0} \u8D26\u53F7)`);
                await fetchStatus(true);
                notifyBalanceUpdate();
              } finally {
                setLoading(false);
              }
            },
            children: "\u{1F393} \u5168\u53F7\u5F00\u5B66\u5B63\u62BD\u5956"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => fetchTasksPanel(), children: "\u21BB \u5237\u65B0\u6E05\u5355" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxHeight: 360, overflowY: "auto" }, children: [
        tasksList.map((task, idx) => {
          const st = task.accept_status || (task.claimed ? "claimed" : task.completed ? "completed" : "pending");
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-account-item", style: { padding: "8px 12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, fontWeight: 600 }, children: task.title || task.name || task.task_code }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 10, color: "#64748b" }, children: [
                task.task_code || task.code,
                " \xB7 \u5956\u52B1 +",
                task.reward_credit || 0
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wb2a-badge ${st === "claimed" ? "wb2a-badge-success" : st === "completed" ? "wb2a-badge-warn" : ""}`, children: st === "claimed" ? "\u5DF2\u9886\u5956" : st === "completed" ? "\u5F85\u9886\u53D6" : st === "accepted" ? "\u8FDB\u884C\u4E2D" : "\u672A\u5F00\u59CB" })
          ] }, task.task_code || task.code || idx);
        }),
        tasksList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#64748b", padding: 12 }, children: "\u5F53\u524D\u9009\u4E2D\u8D26\u53F7\u6682\u65E0\u8FD4\u56DE\u4EFB\u52A1\u6761\u76EE\uFF08\u6210\u957F\u4EFB\u52A1\u4E3B\u8981\u9762\u5411 CN \u56FD\u5185\u7248\u8D26\u53F7\uFF09" })
      ] })
    ] }),
    tab === "models" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
            disabled: loading,
            onClick: async () => {
              setLoading(true);
              try {
                const res = await fetch("/plugins/dsh-workbuddy2api/models/discover", { method: "POST" });
                const d = await res.json();
                setActionMsg(`\u{1F50D} \u5B9E\u65F6\u500D\u7387\u76EE\u5F55\u540C\u6B65\u5B8C\u6210\uFF0C\u603B\u8BA1 ${d.models?.length || 0} \u4E2A\u6A21\u578B`);
                await fetchModels();
              } finally {
                setLoading(false);
              }
            },
            children: "\u{1F50D} \u540C\u6B65\u4E0A\u6E38\u5B9E\u65F6\u500D\u7387\u76EE\u5F55"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-sm", onClick: handleSaveModels, disabled: loading, children: "\u{1F4BE} \u4FDD\u5B58\u542F\u7528\u8FC7\u6EE4\u4E0E\u522B\u540D" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "select",
          {
            className: "wb2a-input",
            style: { width: 150 },
            value: modelFilter,
            onChange: (e) => setModelFilter(e.target.value),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "all", children: "\u5168\u90E8\u6A21\u578B" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "free", children: "\u{1F381} \u4EC5\u514D\u8D39 (x0.00)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "low", children: "\u{1F48E} \u8D85\u7701 (\u22640.2x)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cn", children: "\u56FD\u5185\u7248 (CN)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "global", children: "\u56FD\u9645\u7248 (Global)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "reasoning", children: "\u652F\u6301\u601D\u8003" })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "wb2a-input",
            style: { width: 170 },
            placeholder: "\u641C\u7D22\u6A21\u578B ID / \u8BF4\u660E...",
            value: modelSearch,
            onChange: (e) => setModelSearch(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxHeight: 380, overflowY: "auto", border: "1px solid #dbe5f1", borderRadius: 8, padding: 8, background: "#f8fafc" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 6 }, children: "\u6A21\u578B\u5217\u8868\u4E0E\u771F\u5B9E\u500D\u7387\uFF08\u7A7A\u52FE\u9009\u4EE3\u8868\u5168\u90E8\u653E\u884C\uFF0C\u70B9\u51FB\u8BD5\u8DD1\u53EF\u9A8C\u8BC1\u8FDE\u901A\u4E0E\u6263\u8D39\uFF09:" }),
          (modelsData.models || []).filter((m) => {
            const q = modelSearch.toLowerCase();
            if (q && !(m.id.toLowerCase().includes(q) || (m.name || "").toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q))) return false;
            if (modelFilter === "free" && !m.isFree && m.multiplier !== 0) return false;
            if (modelFilter === "low" && (m.multiplier === null || m.multiplier === void 0 || m.multiplier > 0.2)) return false;
            if (modelFilter === "cn" && m.realm !== "cn") return false;
            if (modelFilter === "global" && m.realm !== "global") return false;
            if (modelFilter === "reasoning" && !m.supportsReasoning && !m.supportedEfforts?.length) return false;
            return true;
          }).map((m) => {
            const isFree = m.isFree || m.multiplier === 0;
            const isHigh = typeof m.multiplier === "number" && m.multiplier > 1;
            const badgeCls = isFree ? "wb2a-badge-success" : isHigh ? "wb2a-badge-warn" : "";
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 6px",
                  borderBottom: "1px solid #e2e8f0",
                  fontSize: 12,
                  gap: 6
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { cursor: "pointer", flex: 1 }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "input",
                      {
                        type: "checkbox",
                        checked: (modelsData.enabledModels || []).includes(m.id),
                        onChange: () => handleToggleModel(m.id),
                        style: { marginRight: 6 }
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: m.id }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wb2a-badge ${badgeCls}`, style: { marginLeft: 5 }, children: isFree ? `\u514D\u8D39 ${m.rate || "x0.00"}` : m.rate || "-" }),
                    m.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge wb2a-badge-warn", style: { marginLeft: 4 }, children: m.badge }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 10, color: "#64748b", marginLeft: 20 }, children: [
                      m.realm,
                      " \xB7 ",
                      Math.round((m.contextWindow || 0) / 1e3),
                      "k",
                      m.supportsImages ? " \xB7 \u89C6\u89C9" : "",
                      m.supportsReasoning || m.supportedEfforts?.length ? " \xB7 \u601D\u8003" : "",
                      m.supportedEfforts?.length ? ` [${m.supportedEfforts.join("/")}]` : ""
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
                      onClick: () => {
                        setPgModel(m.id);
                        setTab("playground");
                      },
                      children: "\u8BD5\u8DD1"
                    }
                  )
                ]
              },
              m.id
            );
          })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "block", fontSize: 11, color: "#475569", marginBottom: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: autoFreeDraft,
                onChange: (e) => setAutoFreeDraft(e.target.checked)
              }
            ),
            " ",
            "\u5F00\u653E ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "auto-free" }),
            " \u514D\u8D39\u591A\u6A21\u578B\u515C\u5E95\u6C60"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "auto-free \u667A\u80FD\u514D\u8D39\u8DEF\u7531\u987A\u5E8F (\u9017\u53F7\u5206\u9694):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              style: { marginBottom: 8 },
              value: freeModelsDraft,
              onChange: (e) => setFreeModelsDraft(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u81EA\u5B9A\u4E49\u6545\u969C\u8F6C\u79FB\u8DEF\u7531\u7EC4 modelRoutes (JSON):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "textarea",
            {
              className: "wb2a-input",
              rows: 4,
              style: { fontFamily: "monospace", marginBottom: 8 },
              value: modelRoutesDraft,
              onChange: (e) => setModelRoutesDraft(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u5BA2\u6237\u7AEF\u6A21\u578B\u522B\u540D\u6620\u5C04\u8868 (JSON):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "textarea",
            {
              className: "wb2a-input",
              rows: 7,
              value: aliasesDraft,
              onChange: (e) => setAliasesDraft(e.target.value),
              style: { fontFamily: "monospace" }
            }
          )
        ] })
      ] })
    ] }),
    tab === "playground" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 13 }, children: "\u{1F9EA} \u5728\u7EBF\u5BF9\u8BDD\u6D4B\u8BD5 Playground (\u652F\u6301\u56FE/\u6587\u9644\u4EF6)" }),
          pgMetrics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", children: pgMetrics })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 6, marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { className: "wb2a-input", value: pgModel, onChange: (e) => setPgModel(e.target.value), children: (modelsData.models || []).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: m.id, children: [
            m.id,
            " [",
            m.rate || "-",
            "]"
          ] }, m.id)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "wb2a-input", value: pgEffort, onChange: (e) => setPgEffort(e.target.value), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: "\u601D\u8003\u6863\u4F4D: \u9ED8\u8BA4" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "low", children: "low" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "medium", children: "medium" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "high", children: "high" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "xhigh", children: "xhigh" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "max", children: "max" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 3,
            style: { marginBottom: 8 },
            value: pgPrompt,
            onChange: (e) => setPgPrompt(e.target.value),
            placeholder: "\u8F93\u5165\u6D4B\u8BD5\u63D0\u793A\u8BCD..."
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", style: { marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*,.txt,.md,.json,.js,.py", onChange: handlePgFileChange, style: { fontSize: 11, maxWidth: 180 } }),
          pgAttach && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm", onClick: () => setPgAttach(null), children: [
            "\u6E05\u9664(",
            pgAttach.name,
            ")"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success wb2a-btn-sm", onClick: handleRunPlayground, disabled: pgRunning, children: pgRunning ? "\u23F3 \u8BF7\u6C42\u6267\u884C\u4E2D..." : "\u{1F680} \u53D1\u9001\u6D4B\u8BD5" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "wb2a-code", style: { minHeight: 110, maxHeight: 220 }, children: pgOutput })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 13 }, children: "\u{1F4E1} \u5728\u9014\u5E76\u53D1 & \u5B9E\u65F6\u8BF7\u6C42\u6D41\u6C34" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: fetchLogs, children: "\u21BB \u5237\u65B0" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 8 }, children: inFlightList.length > 0 ? inFlightList.map((r) => `[${r.model} ${r.rate}] ${r.nickname}`).join(" \xB7 ") : "\u5F53\u524D\u65E0\u5728\u9014\u8BF7\u6C42" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxHeight: 290, overflowY: "auto" }, children: [
          liveLogs.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { padding: "5px 0", borderBottom: "1px solid #e2e8f0", fontSize: 11 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: l.model }),
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", children: l.rate || "-" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wb2a-badge ${l.status >= 400 ? "wb2a-badge-warn" : "wb2a-badge-success"}`, children: l.status })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: "#64748b", marginTop: 2 }, children: [
              l.time,
              " \xB7 ",
              l.account,
              " \xB7 ",
              l.totalTokens,
              " tok \xB7 ",
              l.ttfbMs ? `${l.ttfbMs}ms` : `${l.durationMs}ms`,
              l.tokensPerSec ? ` \xB7 ${l.tokensPerSec} t/s` : "",
              l.credit !== null && l.credit !== void 0 ? ` \xB7 \u6263\u8D39 -${l.credit}` : ""
            ] })
          ] }, l.id)),
          liveLogs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#64748b" }, children: "\u6682\u65E0\u8BF7\u6C42\u6D41\u6C34\u8BB0\u5F55" })
        ] })
      ] })
    ] }) }),
    tab === "usage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-grid-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-value", children: [
            usage?.today?.requests || 0,
            " / ",
            usage?.summary?.totalRequests || 0
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5 / \u5386\u53F2\u8BF7\u6C42" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: Number(usage?.today?.inputTokens || 0).toLocaleString() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5\u8F93\u5165 Tokens" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: Number(usage?.today?.outputTokens || 0).toLocaleString() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5\u8F93\u51FA Tokens" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: Number(usage?.summary?.totalCredit || 0).toFixed(2) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u7D2F\u8BA1\u5B9E\u6D4B\u6D88\u8017\u79EF\u5206" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11, color: "#475569" }, children: "\u6309\u65E5\u671F\u67E5\u770B:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "select",
          {
            className: "wb2a-input",
            style: { width: 130 },
            value: usageDate || usage?.activeDate || "",
            onChange: (e) => {
              setUsageDate(e.target.value);
              fetchUsage(e.target.value);
            },
            children: (usage?.availableDates || []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: d, children: d }, d))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => fetchUsage(usageDate), children: "\u21BB \u5237\u65B0\u7EDF\u8BA1" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm",
            onClick: async () => {
              await fetch("/plugins/dsh-workbuddy2api/stats/reset", { method: "POST" });
              setActionMsg("\u{1F9F9} \u672C\u5730\u7528\u91CF\u8D26\u672C\u5DF2\u6E05\u96F6");
              fetchUsage();
            },
            children: "\u6E05\u7A7A\u8D26\u672C"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#475569", marginBottom: 6 }, children: "\u6309\u6A21\u578B\u500D\u7387\u4E0E\u5B9E\u6D4B\u6263\u8D39\u660E\u7EC6:" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxHeight: 200, overflowY: "auto", border: "1px solid #dbe5f1", borderRadius: 8, marginBottom: 12, background: "#f8fafc" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { style: { background: "#eff6ff", color: "#475569", textAlign: "left" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u6A21\u578B" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u500D\u7387" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u8BF7\u6C42" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "Tokens" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u547D\u4E2D\u7387" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u6263\u8D39" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u541E\u5410" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
          (usage?.modelBreakdown || []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { style: { borderBottom: "1px solid #e2e8f0" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: r.model }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", children: r.rate || "-" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: r.requests }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: r.totalTokens.toLocaleString() }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { style: { padding: 6 }, children: [
              r.cacheHitRate,
              "%"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6, color: "#2563eb", fontWeight: 700 }, children: r.credit }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { style: { padding: 6 }, children: [
              r.tokensPerSec || 0,
              " t/s"
            ] })
          ] }, r.model)),
          (!usage?.modelBreakdown || usage.modelBreakdown.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: "7", style: { padding: 10, color: "#64748b" }, children: "\u6682\u65E0\u5206\u6A21\u578B\u8C03\u7528\u6570\u636E" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#475569", marginBottom: 6 }, children: "\u8FD1 7 \u5929\u8BF7\u6C42\u4E0E Token \u6D88\u8017\u660E\u7EC6:" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }, children: (usage?.trend7d || []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", style: { padding: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: d.date }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 13, fontWeight: 700, color: "#2563eb", margin: "3px 0" }, children: [
          d.requests,
          " \u6B21"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 10, color: "#64748b" }, children: [
          Number(d.tokens || 0).toLocaleString(),
          " tok"
        ] })
      ] }, d.date)) })
    ] }),
    tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u7F51\u5173 API Key (\u7559\u7A7A\u514D\u9274\u6743):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              value: cfgDraft.apiKey || "",
              onChange: (e) => setCfgDraft({ ...cfgDraft, apiKey: e.target.value }),
              placeholder: "sk-workbuddy-..."
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u4E0A\u6E38 HTTP \u4EE3\u7406 (\u7559\u7A7A\u76F4\u8FDE):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              value: cfgDraft.proxy || "",
              onChange: (e) => setCfgDraft({ ...cfgDraft, proxy: e.target.value }),
              placeholder: "http://127.0.0.1:7890"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u56FD\u5185\u7248 CN \u5355\u53F7\u6700\u5927\u5E76\u53D1:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "number",
              className: "wb2a-input",
              value: cfgDraft.maxInFlightCN || 3,
              onChange: (e) => setCfgDraft({ ...cfgDraft, maxInFlightCN: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u56FD\u9645\u7248 Global \u5355\u53F7\u6700\u5927\u5E76\u53D1:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "number",
              className: "wb2a-input",
              value: cfgDraft.maxInFlightGlobal || 2,
              onChange: (e) => setCfgDraft({ ...cfgDraft, maxInFlightGlobal: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u5E76\u53D1\u961F\u5217\u7B49\u5F85\u8D85\u65F6 (ms):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "number",
              className: "wb2a-input",
              value: cfgDraft.queueTimeoutMs ?? 6e4,
              onChange: (e) => setCfgDraft({ ...cfgDraft, queueTimeoutMs: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u6D41\u5F0F\u7A7A\u95F2\u65AD\u8FDE\u8D85\u65F6 (ms):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "number",
              className: "wb2a-input",
              value: cfgDraft.streamIdleTimeoutMs ?? 9e4,
              onChange: (e) => setCfgDraft({ ...cfgDraft, streamIdleTimeoutMs: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "X-Device-Token \u6587\u4EF6\u8DEF\u5F84 (\u53EF\u9009):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              placeholder: "~/.dsh/device_token",
              value: cfgDraft.deviceTokenPath || "",
              onChange: (e) => setCfgDraft({ ...cfgDraft, deviceTokenPath: e.target.value })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "System Prompt \u6CE8\u5165\u6A21\u5F0F:" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "wb2a-input",
              value: cfgDraft.promptMode || "none",
              onChange: (e) => setCfgDraft({ ...cfgDraft, promptMode: e.target.value }),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "none", children: "\u5173\u95ED (\u4FDD\u6301\u8BF7\u6C42\u539F\u6837)" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "append", children: "\u8FFD\u52A0\u672B\u5C3E (append)" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "replace", children: "\u5168\u5C40\u66FF\u6362 (replace)" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u81EA\u5B9A\u4E49 System Prompt \u6587\u672C:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 3,
            value: cfgDraft.promptText || "",
            onChange: (e) => setCfgDraft({ ...cfgDraft, promptText: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", style: { justifyContent: "space-between" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: cfgDraft.autoCheckin !== false,
                onChange: (e) => setCfgDraft({ ...cfgDraft, autoCheckin: e.target.checked })
              }
            ),
            " ",
            "\u81EA\u52A8\u798F\u5229\u5DE1\u68C0"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: cfgDraft.autoTravel !== false,
                onChange: (e) => setCfgDraft({ ...cfgDraft, autoTravel: e.target.checked })
              }
            ),
            " ",
            "\u81EA\u52A8\u732B\u732B\u65C5\u884C"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: cfgDraft.autoTasks !== false,
                onChange: (e) => setCfgDraft({ ...cfgDraft, autoTasks: e.target.checked })
              }
            ),
            " ",
            "\u81EA\u52A8\u6210\u957F\u4EFB\u52A1"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: cfgDraft.autoRefreshToken !== false,
                onChange: (e) => setCfgDraft({ ...cfgDraft, autoRefreshToken: e.target.checked })
              }
            ),
            " ",
            "5\u5206\u949FToken\u4FDD\u6D3B"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: Boolean(cfgDraft.portalAsHome),
                onChange: (e) => setCfgDraft({ ...cfgDraft, portalAsHome: e.target.checked })
              }
            ),
            " ",
            "\u9996\u9875(/)\u8BBE\u4E3A\u516C\u5F00\u95E8\u6237"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success", onClick: handleSaveConfig, disabled: loading, children: "\u{1F4BE} \u4FDD\u5B58\u7F51\u5173\u914D\u7F6E" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 12 }, children: "\u{1F6E1}\uFE0F \u5B89\u5168\u8BBF\u95EE\u3001\u5BC6\u7801\u9501\u5B9A\u4E0E IP \u767D\u540D\u5355" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `wb2a-badge ${status?.auth?.hasPassword ? "wb2a-badge-warn" : "wb2a-badge-success"}`, children: status?.auth?.hasPassword ? "\u63A7\u5236\u53F0\u5DF2\u8BBE\u5BC6" : "\u5355\u673A\u514D\u5BC6\u6A21\u5F0F" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "password",
              className: "wb2a-input",
              placeholder: "\u8F93\u5165\u63A7\u5236\u53F0\u65B0\u5BC6\u7801 (\u7559\u7A7A\u4FDD\u5B58\u5219\u6E05\u9664)",
              value: webPasswordDraft,
              onChange: (e) => setWebPasswordDraft(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm",
              onClick: async () => {
                const r = await fetch("/plugins/dsh-workbuddy2api/config/password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ password: webPasswordDraft })
                });
                const d = await r.json();
                setActionMsg(`\u{1F510} ${d.message || "\u5B8C\u6210"}`);
                fetchStatus(false);
              },
              children: "\u8BBE\u5BC6/\u6E05\u5BC6"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 10, alignItems: "center", fontSize: 11, marginBottom: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: ipWlDraft.enabled,
                onChange: (e) => setIpWlDraft({ ...ipWlDraft, enabled: e.target.checked })
              }
            ),
            " ",
            "\u542F\u7528 IP/CIDR \u767D\u540D\u5355"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: ipWlDraft.allowLocalhost,
                onChange: (e) => setIpWlDraft({ ...ipWlDraft, allowLocalhost: e.target.checked })
              }
            ),
            " ",
            "\u653E\u884C\u672C\u673A\u56DE\u73AF"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
              onClick: async () => {
                const allowedIPs = ipWlDraft.text.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
                const r = await fetch("/plugins/dsh-workbuddy2api/config/ip_whitelist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ enabled: ipWlDraft.enabled, allowLocalhost: ipWlDraft.allowLocalhost, allowedIPs })
                });
                const d = await r.json();
                setActionMsg(d.ok ? `\u{1F6E1}\uFE0F ${d.message}` : `\u274C ${d.error}`);
              },
              children: "\u4FDD\u5B58\u767D\u540D\u5355"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 2,
            placeholder: "\u6BCF\u884C\u6216\u9017\u53F7\u5206\u9694\u5141\u8BB8\u8BBF\u95EE\u7684 IP / CIDR\uFF0C\u5982 192.168.1.0/24",
            value: ipWlDraft.text,
            onChange: (e) => setIpWlDraft({ ...ipWlDraft, text: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 12 }, children: "\u{1F514} Webhook \u98CE\u63A7\u544A\u8B66 & \u23F0 CST \u6574\u70B9\u6392\u7A0B" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm",
                onClick: async () => {
                  const r = await fetch("/plugins/dsh-workbuddy2api/config/alerts/test", { method: "POST" });
                  const d = await r.json();
                  setActionMsg(d.ok ? `\u{1F514} ${d.message}` : `\u274C ${d.error}`);
                },
                children: "\u53D1\u6D4B\u8BD5\u544A\u8B66"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
                onClick: async () => {
                  const r = await fetch("/plugins/dsh-workbuddy2api/config/alerts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      enabled: alertsDraft.enabled,
                      minCredit: Number(alertsDraft.minCredit || 50),
                      webhooksText: alertsDraft.webhooksText,
                      events: alertsDraft.events
                    })
                  });
                  const d = await r.json();
                  setActionMsg(`\u{1F514} ${d.message || "\u544A\u8B66\u5DF2\u4FDD\u5B58"}`);
                },
                children: "\u4FDD\u5B58\u544A\u8B66"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 10, fontSize: 11, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                checked: alertsDraft.enabled,
                onChange: (e) => setAlertsDraft({ ...alertsDraft, enabled: e.target.checked })
              }
            ),
            " ",
            "\u5F00\u542F Webhook \u544A\u8B66 (\u98DE\u4E66/\u4F01\u5FAE/\u9489\u9489/Telegram/Discord)"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
            "\u4F4E\u79EF\u5206\u9884\u8B66\u9608\u503C:",
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "number",
                className: "wb2a-input",
                style: { width: 70, display: "inline-block" },
                value: alertsDraft.minCredit,
                onChange: (e) => setAlertsDraft({ ...alertsDraft, minCredit: Number(e.target.value) })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 2,
            style: { marginBottom: 8 },
            placeholder: "Webhook URL (\u6362\u884C\u5206\u9694\u591A\u4E2A\u5730\u5740)",
            value: alertsDraft.webhooksText,
            onChange: (e) => setAlertsDraft({ ...alertsDraft, webhooksText: e.target.value })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 1fr) auto", gap: 6, alignItems: "end" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u7B7E\u5230\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.checkin, onChange: (e) => setSchedDraft({ ...schedDraft, checkin: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u732B\u732B\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.travel, onChange: (e) => setSchedDraft({ ...schedDraft, travel: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u4EFB\u52A1\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.tasks, onChange: (e) => setSchedDraft({ ...schedDraft, tasks: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u5F00\u5B66\u5B63\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.school, onChange: (e) => setSchedDraft({ ...schedDraft, school: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u591C\u732B\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.cat, onChange: (e) => setSchedDraft({ ...schedDraft, cat: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: "\u4FDD\u6D3B\u5C0F\u65F6" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", value: schedDraft.keepalive, onChange: (e) => setSchedDraft({ ...schedDraft, keepalive: e.target.value }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-sm",
              onClick: async () => {
                const p = (s) => s.split(",").map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 23);
                await fetch("/plugins/dsh-workbuddy2api/config/schedule", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    schedule: {
                      checkinHours: p(schedDraft.checkin),
                      travelHours: p(schedDraft.travel),
                      tasksHours: p(schedDraft.tasks),
                      schoolHours: p(schedDraft.school),
                      catHours: p(schedDraft.cat),
                      keepaliveHours: p(schedDraft.keepalive)
                    }
                  })
                });
                setActionMsg("\u23F0 CST \u81EA\u52A8\u6392\u7A0B\u5C0F\u65F6\u5DF2\u4FDD\u5B58");
              },
              children: "\u4FDD\u5B58\u6392\u7A0B"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { style: { fontSize: 12 }, children: [
            "\u{1F465} \u591A\u79DF\u6237 Key \u4E0E\u7248\u672C\u66F4\u65B0\u68C0\u67E5 (",
            usersList.length,
            " \u7528\u6237)"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm",
              onClick: async () => {
                const r = await fetch("/plugins/dsh-workbuddy2api/system/update/check");
                const d = await r.json();
                setUpdateInfo(d);
                setActionMsg(d.ok ? `\u{1F504} \u5F53\u524D v${d.currentVersion} / \u6700\u65B0 ${d.latestVersion}` : `\u274C ${d.error}`);
              },
              children: "\u68C0\u67E5 GitHub \u65B0\u7248\u672C"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", style: { width: 100 }, placeholder: "\u65B0\u7528\u6237\u540D", value: newUserDraft.username, onChange: (e) => setNewUserDraft({ ...newUserDraft, username: e.target.value }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", style: { width: 100 }, type: "password", placeholder: "\u5BC6\u7801", value: newUserDraft.password, onChange: (e) => setNewUserDraft({ ...newUserDraft, password: e.target.value }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", style: { width: 85 }, type: "number", placeholder: "\u65E5\u9650\u989D", value: newUserDraft.dailyCreditLimit, onChange: (e) => setNewUserDraft({ ...newUserDraft, dailyCreditLimit: Number(e.target.value) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "wb2a-input", style: { width: 70 }, type: "number", placeholder: "RPM", value: newUserDraft.rpm, onChange: (e) => setNewUserDraft({ ...newUserDraft, rpm: Number(e.target.value) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
              onClick: async () => {
                const r = await fetch("/plugins/dsh-workbuddy2api/admin/users/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newUserDraft)
                });
                const d = await r.json();
                setActionMsg(d.ok ? `\u{1F464} \u5DF2\u521B\u5EFA\u79DF\u6237 ${d.user?.username} (${d.user?.apiKey})` : `\u274C ${d.error}`);
                fetchAdminUsers();
              },
              children: "+ \u6DFB\u52A0\u79DF\u6237"
            }
          )
        ] }),
        updateInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: [
          "\u5F53\u524D v",
          updateInfo.currentVersion,
          " \xB7 \u6700\u65B0 ",
          updateInfo.latestVersion || "-",
          " ",
          updateInfo.hasUpdate ? "\u26A0\uFE0F \u6709\u65B0\u7248\u672C\u53EF\u7528" : "\u2705 \u5DF2\u662F\u6700\u65B0"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { fontSize: 12 }, children: "\u{1F50C} DeepSeek Harness (DSH) \u6302\u8F7D\u81EA\u68C0\u4E0E\u540C\u6B65" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: fetchDshCheck, children: "\u68C0\u6D4B" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "wb2a-btn wb2a-btn-success wb2a-btn-sm",
                onClick: async () => {
                  const res = await fetch("/plugins/dsh-workbuddy2api/dsh/sync", { method: "POST" });
                  const d = await res.json();
                  setActionMsg(d.message || "\u5DF2\u540C\u6B65 DSH \u914D\u7F6E");
                  fetchDshCheck();
                },
                children: "\u540C\u6B65 baseURL"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: "#475569" }, children: [
          "Profile \u6CE8\u518C: ",
          dshInfo?.installedInProfile ? "\u2705 \u5DF2\u5B89\u88C5" : "\u26AA \u672A\u68C0\u6D4B",
          " \xB7 Patch \u5BF9\u9F50: ",
          dshInfo?.baseUrlMatched ? `\u2705 ${dshInfo.expectedBaseUrl}` : "\u26A0\uFE0F \u672A\u5BF9\u9F50"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "wb2a-code", children: `OpenAI Chat Base URL : ${gatewayUrl}
Anthropic Messages   : http://127.0.0.1:${port}/v1/messages
OpenAI Responses     : http://127.0.0.1:${port}/v1/responses
Video Generations    : http://127.0.0.1:${port}/v1/videos/generations
Web Console / Portal : ${consoleUrl} | http://127.0.0.1:${port}/portal` })
    ] }),
    updTokenModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-modal-backdrop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-modal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
          "\u66F4\u65B0\u51ED\u8BC1 / \u6551\u6D3B\u8D26\u53F7 \u2014 ",
          updTokenModal.nickname || updTokenModal.uid
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm", onClick: () => setUpdTokenModal(null), children: "\u5173\u95ED" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u65B0 Access Token (\u53EF\u9009):" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 2,
            value: updTokenModal.accessToken,
            onChange: (e) => setUpdTokenModal({ ...updTokenModal, accessToken: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u65B0 Refresh Token (\u63A8\u8350):" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 3,
            value: updTokenModal.refreshToken,
            onChange: (e) => setUpdTokenModal({ ...updTokenModal, refreshToken: e.target.value })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          className: "wb2a-btn wb2a-btn-success",
          onClick: async () => {
            const res = await fetch("/plugins/dsh-workbuddy2api/accounts/update_token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updTokenModal)
            });
            const d = await res.json();
            setActionMsg(d.ok ? `\u{1F504} ${d.message}` : `\u274C ${d.error}`);
            if (d.ok) {
              setUpdTokenModal(null);
              fetchStatus(true);
              notifyBalanceUpdate();
            }
          },
          children: "\u9A8C\u8BC1\u5E76\u7ACB\u5373\u6551\u6D3B\u8D26\u53F7"
        }
      )
    ] }) }),
    oauthModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-modal-backdrop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-modal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
          oauthModal.realm === "global" ? "\u56FD\u9645\u7248 WorkBuddy AI" : "\u56FD\u5185\u7248 CodeBuddy",
          " OAuth \u6388\u6743\u767B\u5F55"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm",
            onClick: () => {
              if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
              setOauthModal(null);
            },
            children: "\u53D6\u6D88"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontSize: 12, color: "#475569" }, children: "\u82E5\u6D4F\u89C8\u5668\u672A\u81EA\u52A8\u5F39\u51FA\u6388\u6743\u9875\u9762\uFF0C\u8BF7\u70B9\u51FB\u4E0B\u65B9\u94FE\u63A5\u5B8C\u6210\u767B\u5F55\uFF0C\u7CFB\u7EDF\u6B63\u5728\u81EA\u52A8\u8F6E\u8BE2\u72B6\u6001\uFF1A" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { margin: "8px 0", wordBreak: "break-all", fontSize: 11 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: oauthModal.url, target: "_blank", rel: "noreferrer", style: { color: "#2563eb", fontWeight: 500 }, children: oauthModal.url }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-badge wb2a-badge-warn", children: oauthModal.notice })
    ] }) }),
    importOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-modal-backdrop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-modal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u6279\u91CF / ZIP \u8D26\u53F7\u5BFC\u5165" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm", onClick: () => setImportOpen(false), children: "\u5173\u95ED" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u9ED8\u8BA4\u533A\u670D:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "wb2a-input", value: importRealm, onChange: (e) => setImportRealm(e.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "global", children: "\u56FD\u9645\u7248 (Global / workbuddy.ai)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cn", children: "\u56FD\u5185\u7248 (CN / codebuddy.cn)" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u9009\u62E9 .zip \u5907\u4EFD\u5305 / .json / .txt \u6587\u4EF6:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: ".zip,.json,.txt,.info", onChange: handleImportFileChange })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#475569", marginBottom: 4 }, children: "\u6216\u76F4\u63A5\u7C98\u8D34\u6587\u672C\uFF08\u652F\u6301 JSON / \u6CE8\u91CA / access----refresh\uFF09:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "textarea",
          {
            className: "wb2a-input",
            rows: 6,
            value: importContent,
            onChange: (e) => setImportContent(e.target.value),
            placeholder: "accessToken----refreshToken"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success", onClick: handleSubmitImport, disabled: loading, children: "\u{1F680} \u5F00\u59CB\u9A8C\u8BC1\u5E76\u6279\u91CF\u5165\u6C60" }),
      importResult && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "wb2a-code", style: { marginTop: 10, maxHeight: 160 }, children: JSON.stringify(importResult, null, 2) })
    ] }) }),
    packsModalAcc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-modal-backdrop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-modal", style: { width: 600 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
          packsModalAcc.nickname || packsModalAcc.uid,
          " \u2014 \u79EF\u5206\u5305\u660E\u7EC6"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm", onClick: () => setPacksModalAcc(null), children: "\u5173\u95ED" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxHeight: 340, overflowY: "auto" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { style: { background: "#eff6ff", color: "#475569", textAlign: "left" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u540D\u79F0" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u4F59\u91CF" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u603B\u91CF" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u5DF2\u7528" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { style: { padding: 6 }, children: "\u5230\u671F\u65F6\u95F4" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
          (packsModalAcc.balance?.packages || []).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { style: { borderBottom: "1px solid #e2e8f0" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: p.name }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6, color: "#2563eb", fontWeight: 700 }, children: p.remain }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: p.total }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6 }, children: p.used }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { style: { padding: 6, color: "#64748b" }, children: p.expireTime || "\u6C38\u4E45" })
          ] }, i)),
          (!packsModalAcc.balance?.packages || packsModalAcc.balance.packages.length === 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { colSpan: "5", style: { padding: 10, color: "#64748b" }, children: "\u6682\u65E0\u6D3B\u8DC3\u79EF\u5206\u5305\u660E\u7EC6" }) })
        ] })
      ] }) })
    ] }) })
  ] });
}

// src/client/components/ComposerDock.jsx
var import_react2 = __toESM(require("react"), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
function ComposerDock() {
  const [balance, setBalance] = (0, import_react2.useState)(null);
  const [summary, setSummary] = (0, import_react2.useState)(null);
  const [activeAccount, setActiveAccount] = (0, import_react2.useState)(null);
  const [gatewayPort, setGatewayPort] = (0, import_react2.useState)(7863);
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const timerRef = (0, import_react2.useRef)(null);
  const fetchStatus = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/plugins/dsh-workbuddy2api/status${forceRefresh ? "?refresh=1" : ""}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setSummary(data.summary || null);
        if (data.gatewayPort) setGatewayPort(data.gatewayPort);
        const active = data.accounts?.find((a) => a.uid === data.activeUid);
        setActiveAccount(active);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };
  (0, import_react2.useEffect)(() => {
    fetchStatus(false);
    const handleFocus = () => fetchStatus(false);
    const handleCustomUpdate = () => fetchStatus(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("wb2a:refresh-balance", handleCustomUpdate);
    timerRef.current = setInterval(() => fetchStatus(false), 12e3);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("wb2a:refresh-balance", handleCustomUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  const formattedRemain = typeof balance?.remain === "number" ? balance.remain.toLocaleString() : balance?.remain ?? "\u5C31\u7EEA";
  const poolTotal = typeof summary?.all?.remain === "number" ? summary.all.remain.toLocaleString() : null;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "wb2a-dock-line", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\u26A1 WorkBuddy 2API" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\xB7" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
      "\u5B9E\u65F6\u79EF\u5206:",
      " ",
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "strong",
        {
          style: {
            color: "#2563eb",
            fontWeight: 700
          },
          title: balance?.packages?.length ? `\u5DF2\u6302\u8F7D ${balance.packages.length} \u4E2A\u79EF\u5206\u5305` : "",
          children: formattedRemain
        }
      ),
      poolTotal && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: "#64748b", marginLeft: 4 }, children: [
        "(\u5168\u6C60 ",
        poolTotal,
        ")"
      ] })
    ] }),
    activeAccount && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\xB7" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: "#334155" }, children: [
        activeAccount.nickname || activeAccount.uid.slice(0, 8),
        " (",
        activeAccount.realm,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "button",
      {
        style: {
          background: "transparent",
          border: "none",
          color: loading ? "#2563eb" : "#64748b",
          cursor: "pointer",
          fontSize: 12,
          padding: "0 2px",
          display: "inline-flex",
          alignItems: "center",
          transition: "transform 0.3s ease",
          transform: loading ? "rotate(180deg)" : "none"
        },
        onClick: () => fetchStatus(true),
        disabled: loading,
        title: "\u7ACB\u5373\u4ECE\u4E0A\u6E38\u5237\u65B0\u5168\u6C60\u6700\u65B0\u79EF\u5206",
        children: "\u27F3"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "a",
      {
        href: `http://127.0.0.1:${gatewayPort}/console`,
        target: "_blank",
        rel: "noreferrer",
        style: {
          color: "#2563eb",
          textDecoration: "none",
          fontSize: 11,
          fontWeight: 600,
          marginLeft: 2
        },
        title: "\u6253\u5F00\u72EC\u7ACB\u767D\u84DD Web \u63A7\u5236\u53F0",
        children: "\u63A7\u5236\u53F0\u2197"
      }
    )
  ] });
}

// src/client/components/SidebarPanel.jsx
var import_react3 = __toESM(require("react"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
function SidebarPanel({ close }) {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { padding: 16, height: "100%", overflowY: "auto" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { style: { margin: 0, color: "#38bdf8" }, children: "WorkBuddy 2API \u63A7\u5236\u53F0" }),
      close && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "button",
        {
          onClick: close,
          style: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16 },
          children: "\u2715"
        }
      )
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(SettingsCard, {})
  ] });
}
function SidebarGlyph() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 }, title: "WorkBuddy 2API", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { fontSize: 15 }, children: "\u26A1" }) });
}

// src/client/styles.css
var styles_default = '/**\n * styles.css - DSH WorkBuddy2API \u6E05\u723D\u767D\u84DD\u5546\u52A1\u5361\u7247\u6837\u5F0F\n */\n\n.wb2a-card {\n  font-family: var(--dsh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);\n  color: #0f172a;\n  background: #ffffff;\n  border: 1px solid #dbe5f1;\n  border-radius: 12px;\n  padding: 18px;\n  margin-bottom: 16px;\n  box-shadow: 0 4px 16px rgba(15, 35, 75, 0.05);\n}\n\n.wb2a-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid #e2e8f0;\n  padding-bottom: 12px;\n  margin-bottom: 14px;\n}\n\n.wb2a-title {\n  font-size: 16px;\n  font-weight: 700;\n  color: #1d4ed8;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.wb2a-badge {\n  font-size: 11px;\n  padding: 2px 9px;\n  border-radius: 999px;\n  background: #eff6ff;\n  color: #2563eb;\n  border: 1px solid #bfdbfe;\n  font-weight: 600;\n}\n\n.wb2a-badge-success {\n  background: #ecfdf5;\n  color: #059669;\n  border: 1px solid #a7f3d0;\n}\n\n.wb2a-badge-warn {\n  background: #fffbeb;\n  color: #d97706;\n  border: 1px solid #fde68a;\n}\n\n.wb2a-tabs {\n  display: flex;\n  gap: 6px;\n  border-bottom: 1px solid #e2e8f0;\n  margin-bottom: 16px;\n}\n\n.wb2a-tab-btn {\n  background: transparent;\n  border: none;\n  padding: 8px 14px;\n  font-size: 13px;\n  color: #64748b;\n  cursor: pointer;\n  border-bottom: 2px solid transparent;\n  transition: all 0.2s;\n  font-weight: 500;\n}\n\n.wb2a-tab-btn:hover {\n  color: #2563eb;\n  background: #f8fafc;\n  border-radius: 6px 6px 0 0;\n}\n\n.wb2a-tab-btn.active {\n  color: #2563eb;\n  border-bottom-color: #2563eb;\n  font-weight: 600;\n}\n\n.wb2a-account-item {\n  background: #f8fafc;\n  border: 1px solid #e2e8f0;\n  border-radius: 8px;\n  padding: 12px;\n  margin-bottom: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.wb2a-account-item.active {\n  border-color: #93c5fd;\n  background: #eff6ff;\n}\n\n.wb2a-btn {\n  background: #2563eb;\n  color: #ffffff;\n  border: 1px solid #1d4ed8;\n  border-radius: 6px;\n  padding: 6px 12px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n\n.wb2a-btn:hover {\n  background: #1d4ed8;\n}\n\n.wb2a-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.wb2a-btn-secondary {\n  background: #f8fafc;\n  color: #334155;\n  border: 1px solid #cbd5e1;\n}\n\n.wb2a-btn-secondary:hover {\n  background: #eff6ff;\n  color: #2563eb;\n  border-color: #93c5fd;\n}\n\n.wb2a-btn-danger {\n  background: #fef2f2;\n  color: #dc2626;\n  border: 1px solid #fecaca;\n}\n\n.wb2a-btn-danger:hover {\n  background: #fee2e2;\n}\n\n.wb2a-input {\n  background: #ffffff;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n  padding: 6px 10px;\n  color: #0f172a;\n  font-size: 12px;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.wb2a-input:focus {\n  outline: none;\n  border-color: #2563eb;\n  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14);\n}\n\n.wb2a-grid-stats {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 10px;\n  margin-bottom: 16px;\n}\n\n.wb2a-stat-box {\n  background: #f8fafc;\n  border: 1px solid #dbe5f1;\n  border-radius: 8px;\n  padding: 10px;\n  text-align: center;\n}\n\n.wb2a-stat-value {\n  font-size: 18px;\n  font-weight: 700;\n  color: #2563eb;\n}\n\n.wb2a-stat-label {\n  font-size: 11px;\n  color: #64748b;\n  margin-top: 4px;\n}\n\n.wb2a-dock-line {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11px;\n  color: #334155;\n  padding: 4px 10px;\n  background: #f8fafc;\n  border-radius: 6px;\n  border: 1px solid #dbe5f1;\n}\n\n.wb2a-summary-grid {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 10px;\n  margin-bottom: 14px;\n}\n\n.wb2a-realm-card {\n  background: #f8fafc;\n  border: 1px solid #dbe5f1;\n  border-radius: 8px;\n  padding: 12px;\n}\n\n.wb2a-btn-success {\n  background: #ecfdf5;\n  color: #059669;\n  border: 1px solid #a7f3d0;\n}\n\n.wb2a-btn-success:hover {\n  background: #d1fae5;\n}\n\n.wb2a-btn-warn {\n  background: #fffbeb;\n  color: #d97706;\n  border: 1px solid #fde68a;\n}\n\n.wb2a-btn-warn:hover {\n  background: #fef3c7;\n}\n\n.wb2a-btn-sm {\n  padding: 4px 9px;\n  font-size: 11px;\n}\n\n.wb2a-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 12px;\n  align-items: center;\n}\n\n.wb2a-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(15, 23, 42, 0.35);\n  backdrop-filter: blur(4px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 9999;\n}\n\n.wb2a-modal {\n  width: 520px;\n  max-width: 92vw;\n  background: #ffffff;\n  color: #0f172a;\n  border: 1px solid #bfdbfe;\n  border-radius: 12px;\n  padding: 18px;\n  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);\n}\n\n.wb2a-code {\n  background: #f8fafc;\n  border: 1px solid #dbe5f1;\n  border-radius: 8px;\n  padding: 10px;\n  font-size: 11px;\n  color: #1e3a8a;\n  overflow-x: auto;\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n';

// src/client/index.jsx
var STYLE_ID = "dsh-workbuddy2api-styles";
function ensureStyles() {
  if (typeof document === "undefined") return;
  let styleEl = document.getElementById(STYLE_ID);
  if (styleEl) {
    if (styleEl.textContent !== styles_default) styleEl.textContent = styles_default;
    return;
  }
  styleEl = document.createElement("style");
  styleEl.id = STYLE_ID;
  styleEl.setAttribute("data-plugin", "dsh-workbuddy2api");
  styleEl.textContent = styles_default;
  document.head.appendChild(styleEl);
}
var name = "dsh-workbuddy2api-client";
var inject = ["slots"];
function apply(ctx) {
  ensureStyles();
  const slots = ctx?.slots;
  if (!slots?.inject) {
    console.warn("[workbuddy2api] \u5BA2\u6237\u7AEF\u7F3A\u5C11 slots \u670D\u52A1\uFF0C\u8DF3\u8FC7\u6302\u8F7D");
    return;
  }
  const namespace = "settings.workbuddy2api";
  const label = "WorkBuddy 2API";
  const disposers = [];
  const safeRegister = (slotName, factory) => {
    try {
      const dispose = slots.inject(slotName, factory);
      if (dispose) disposers.push(dispose);
    } catch (err) {
      console.warn(`[workbuddy2api] \u6302\u8F7D\u63D2\u69FD ${slotName} \u8DF3\u8FC7:`, err?.message || err);
    }
  };
  safeRegister(
    "settings.plugins.tab",
    () => slots.register(
      {
        name: "settings.plugins.tab",
        id: "workbuddy2api",
        order: 15,
        label: () => label,
        locale: namespace
      },
      SettingsCard
    )
  );
  safeRegister(
    "settings.section",
    () => slots.register(
      {
        name: "settings.section",
        id: "workbuddy2api",
        order: 25,
        label: () => label,
        locale: namespace
      },
      SettingsCard
    )
  );
  safeRegister(
    "conversation.composer.dock",
    () => slots.register(
      {
        name: "conversation.composer.dock",
        id: "workbuddy2api-dock",
        order: 10,
        locale: namespace
      },
      ComposerDock
    )
  );
  safeRegister(
    "plugins.bundle.config",
    () => slots.register(
      {
        name: "plugins.bundle.config",
        key: "dsh-workbuddy2api",
        locale: namespace
      },
      SettingsCard
    )
  );
  safeRegister(
    "sidebar.panellist",
    () => slots.register(
      {
        name: "sidebar.panellist",
        id: "workbuddy2api-sidebar",
        order: 15,
        label: () => label,
        locale: namespace
      },
      SidebarGlyph
    )
  );
  safeRegister(
    "main",
    () => slots.register(
      {
        name: "main",
        key: "workbuddy2api-sidebar",
        locale: namespace,
        inject: () => ({
          close: () => ctx.get?.("layout")?.selectPanel?.(null) ?? ctx.layout?.selectPanel?.(null)
        })
      },
      SidebarPanel
    )
  );
  ctx.effect?.(() => () => {
    for (const d of disposers.reverse()) {
      try {
        d?.();
      } catch (_) {
      }
    }
    if (typeof document !== "undefined") {
      document.getElementById(STYLE_ID)?.remove();
    }
  }, "workbuddy2api.client");
}
return module.exports; } });
