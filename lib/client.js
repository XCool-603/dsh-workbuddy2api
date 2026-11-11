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
  const [aliasesDraft, setAliasesDraft] = (0, import_react.useState)("{}");
  const [freeModelsDraft, setFreeModelsDraft] = (0, import_react.useState)("global:deepseek-v4.1-flash, cn:hy4free");
  const [cfgDraft, setCfgDraft] = (0, import_react.useState)({
    apiKey: "",
    proxy: "",
    maxInFlightCN: 3,
    maxInFlightGlobal: 2,
    queueTimeoutMs: 5e3,
    promptMode: "none",
    promptText: "",
    autoCheckin: true,
    autoTravel: true,
    autoRefreshToken: true
  });
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
        }
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
        setFreeModelsDraft((data.freeModels || ["global:deepseek-v4.1-flash", "cn:hy4free"]).join(", "));
      }
    } catch (_) {
    }
  };
  const fetchUsage = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/usage");
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
  (0, import_react.useEffect)(() => {
    if (tab === "activity") fetchActivityPanel();
    if (tab === "tasks") fetchTasksPanel();
    if (tab === "models") fetchModels();
    if (tab === "usage") fetchUsage();
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
    try {
      parsedAliases = JSON.parse(aliasesDraft);
    } catch (e) {
      setActionMsg(`\u274C \u522B\u540D JSON \u683C\u5F0F\u9519\u8BEF: ${e.message}`);
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
          freeModels
        })
      });
      const data = await res.json();
      setActionMsg(data.ok ? "\u2705 \u6A21\u578B\u542F\u7528\u89C4\u5219\u4E0E\u522B\u540D\u914D\u7F6E\u5DF2\u4FDD\u5B58" : `\u274C \u4FDD\u5B58\u5931\u8D25`);
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
          padding: "7px 11px",
          borderRadius: 6,
          background: "rgba(56,189,248,0.1)",
          border: "1px solid rgba(56,189,248,0.3)",
          fontSize: 12,
          color: "#bae6fd"
        },
        children: actionMsg
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-tabs", style: { flexWrap: "wrap" }, children: [
      ["accounts", "\u603B\u89C8\u4E0E\u8D26\u53F7\u6C60"],
      ["activity", "\u732B\u732B\u65C5\u884C\u4E0E\u798F\u5229"],
      ["tasks", "\u6210\u957F\u4EFB\u52A1\u5F15\u64CE"],
      ["models", "\u6A21\u578B\u4E0E\u522B\u540D"],
      ["usage", "\u79EF\u5206\u4E0E\u7528\u91CF"],
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
        ["\u5168\u6C60\u5408\u8BA1 (All)", summary.all, "#38bdf8"],
        ["\u56FD\u5185\u7248 (CodeBuddy CN)", summary.cn, "#4ade80"],
        ["\u56FD\u9645\u7248 (WorkBuddy AI)", summary.global, "#c084fc"]
      ].map(([title, s = {}, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8" }, children: title }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 20, fontWeight: 700, color, margin: "4px 0" }, children: Number(s.remain || 0).toLocaleString() }),
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
              acc.disabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", style: { color: "#f87171", borderColor: "#f87171" }, children: "\u5DF2\u505C\u7528" }),
              !acc.disabled && diag.coolingDown && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge wb2a-badge-warn", children: [
                "\u7194\u65AD ",
                diag.cooldownRemainingSec,
                "s"
              ] }),
              diag.modelCooldowns?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge wb2a-badge-warn", children: [
                diag.modelCooldowns.length,
                "\u6A21\u578B\u51B7\u5374"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: [
              "\u5B9E\u65F6\u79EF\u5206: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#38bdf8" }, children: Number(bal.remain || 0).toLocaleString() }),
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: () => handleAdminAction(acc.uid, "refresh"), children: "\u5237\u65B0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: `wb2a-btn wb2a-btn-sm ${acc.disabled ? "wb2a-btn-success" : "wb2a-btn-danger"}`,
                onClick: () => handleAdminAction(acc.uid, acc.disabled ? "enable" : "disable"),
                children: acc.disabled ? "\u542F\u7528" : "\u505C\u7528"
              }
            ),
            (diag.coolingDown || diag.modelCooldowns?.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-warn wb2a-btn-sm", onClick: () => handleAdminAction(acc.uid, "revive"), children: "\u89E3\u7194\u65AD" }),
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid #2a324b" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 6 }, children: "\u5355\u6761\u51ED\u8BC1\u5FEB\u901F\u5165\u6C60\uFF08\u652F\u6301 Access / Refresh Token \u81EA\u52A8\u89E3\u6790\uFF09:" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#94a3b8" }, children: [
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#94a3b8" }, children: [
            "\u8FDE\u767B\u5929\u6570: ",
            growthData?.streak?.streak_days ?? growthData?.streak?.days ?? "-",
            " \xB7 \u62BD\u5956\u6B21\u6570: ",
            growthData?.chances?.remaining ?? growthData?.chances?.chances ?? 0
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-realm-card", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 6 }, children: "\u{1F381} \u5B98\u65B9\u4E13\u5C5E\u9080\u8BF7\u4E2D\u5FC3" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 8, lineHeight: 1.7 }, children: [
          "\u9080\u8BF7\u7801: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#38bdf8" }, children: inviteInfo?.inviteCode || "\u6682\u672A\u5206\u914D" }),
          " \xB7 ",
          "\u5DF2\u9080\u8BF7: ",
          inviteInfo?.invitedCount || 0,
          " \u4EBA (\u6709\u6548 ",
          inviteInfo?.validInviteCount || 0,
          ")",
          " \xB7 ",
          "\u7D2F\u8BA1\u5956\u52B1: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { style: { color: "#4ade80" }, children: [
            "+",
            inviteInfo?.rewardCredit || 0
          ] }),
          " \u79EF\u5206",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
          "\u4E13\u5C5E\u94FE\u63A5:",
          " ",
          inviteInfo?.inviteUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: inviteInfo.inviteUrl, target: "_blank", rel: "noreferrer", style: { color: "#4ade80" }, children: inviteInfo.inviteUrl }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "-" })
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
        tasksList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#94a3b8", padding: 12 }, children: "\u5F53\u524D\u9009\u4E2D\u8D26\u53F7\u6682\u65E0\u8FD4\u56DE\u4EFB\u52A1\u6761\u76EE\uFF08\u6210\u957F\u4EFB\u52A1\u4E3B\u8981\u9762\u5411 CN \u56FD\u5185\u7248\u8D26\u53F7\uFF09" })
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
                setActionMsg(`\u{1F50D} \u6A21\u578B\u76EE\u5F55\u540C\u6B65\u6210\u529F\uFF0C\u603B\u8BA1 ${d.models?.length || 0} \u4E2A\u53EF\u7528\u6A21\u578B`);
                await fetchModels();
              } finally {
                setLoading(false);
              }
            },
            children: "\u{1F50D} \u4ECE\u4E0A\u6E38\u52A8\u6001\u53D1\u73B0\u6700\u65B0\u6A21\u578B"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-sm", onClick: handleSaveModels, disabled: loading, children: "\u{1F4BE} \u4FDD\u5B58\u6A21\u578B\u8FC7\u6EE4\u4E0E\u522B\u540D" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "wb2a-input",
            style: { width: 180 },
            placeholder: "\u7B5B\u9009\u6A21\u578B ID...",
            value: modelSearch,
            onChange: (e) => setModelSearch(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxHeight: 340, overflowY: "auto", border: "1px solid #2a324b", borderRadius: 8, padding: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 6 }, children: "\u542F\u7528\u6A21\u578B\u52FE\u9009\uFF08\u5168\u4E0D\u52FE\u9009\u4EE3\u8868\u9ED8\u8BA4\u5168\u90E8\u653E\u884C\uFF09:" }),
          (modelsData.models || []).filter((m) => !modelSearch || m.id.toLowerCase().includes(modelSearch.toLowerCase())).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "label",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 6px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontSize: 12,
                cursor: "pointer"
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
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
                  m.source === "discovered" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge", style: { marginLeft: 4 }, children: "\u52A8\u6001" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 10, color: "#64748b" }, children: [
                  m.realm,
                  " \xB7 ",
                  m.rate || "-"
                ] })
              ]
            },
            m.id
          ))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "auto-free \u667A\u80FD\u514D\u8D39\u8DEF\u7531\u987A\u5E8F (\u9017\u53F7\u5206\u9694):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              style: { marginBottom: 10 },
              value: freeModelsDraft,
              onChange: (e) => setFreeModelsDraft(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u5BA2\u6237\u7AEF\u6A21\u578B\u522B\u540D\u6620\u5C04\u8868 (JSON):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "textarea",
            {
              className: "wb2a-input",
              rows: 12,
              value: aliasesDraft,
              onChange: (e) => setAliasesDraft(e.target.value),
              style: { fontFamily: "monospace" }
            }
          )
        ] })
      ] })
    ] }),
    tab === "usage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-grid-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: usage?.today?.requests || 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5\u8BF7\u6C42" })
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: usage?.summary?.totalRequests || 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5386\u53F2\u603B\u8BF7\u6C42" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary wb2a-btn-sm", onClick: fetchUsage, children: "\u21BB \u5237\u65B0\u7EDF\u8BA1" }),
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 6 }, children: "\u8FD1 7 \u5929\u8BF7\u6C42\u4E0E Token \u6D88\u8017\u660E\u7EC6:" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }, children: (usage?.trend7d || []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", style: { padding: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 10, color: "#64748b" }, children: d.date }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 13, fontWeight: 700, color: "#38bdf8", margin: "3px 0" }, children: [
          d.requests,
          " \u6B21"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 10, color: "#94a3b8" }, children: [
          Number(d.tokens || 0).toLocaleString(),
          " tok"
        ] })
      ] }, d.date)) })
    ] }),
    tab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u7F51\u5173 API Key (\u7559\u7A7A\u514D\u9274\u6743):" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u4E0A\u6E38 HTTP \u4EE3\u7406 (\u7559\u7A7A\u76F4\u8FDE):" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u56FD\u5185\u7248 CN \u5355\u53F7\u6700\u5927\u5E76\u53D1:" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u56FD\u9645\u7248 Global \u5355\u53F7\u6700\u5927\u5E76\u53D1:" }),
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u5E76\u53D1\u961F\u5217\u7B49\u5F85\u8D85\u65F6 (ms):" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "number",
              className: "wb2a-input",
              value: cfgDraft.queueTimeoutMs ?? 5e3,
              onChange: (e) => setCfgDraft({ ...cfgDraft, queueTimeoutMs: Number(e.target.value) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "System Prompt \u6CE8\u5165\u6A21\u5F0F:" }),
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u81EA\u5B9A\u4E49 System Prompt \u6587\u672C:" }),
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
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 12, fontSize: 12 }, children: [
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
                checked: cfgDraft.autoRefreshToken !== false,
                onChange: (e) => setCfgDraft({ ...cfgDraft, autoRefreshToken: e.target.checked })
              }
            ),
            " ",
            "5\u5206\u949FToken\u4FDD\u6D3B"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-success", onClick: handleSaveConfig, disabled: loading, children: "\u{1F4BE} \u4FDD\u5B58\u7F51\u5173\u914D\u7F6E" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "wb2a-code", children: `OpenAI Chat Base URL : ${gatewayUrl}
Anthropic Messages   : http://127.0.0.1:${port}/v1/messages
OpenAI Responses     : http://127.0.0.1:${port}/v1/responses
Video Generations    : http://127.0.0.1:${port}/v1/videos/generations
Cyberpunk Web Console: ${consoleUrl}` })
    ] }),
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { fontSize: 12, color: "#94a3b8" }, children: "\u82E5\u6D4F\u89C8\u5668\u672A\u81EA\u52A8\u5F39\u51FA\u6388\u6743\u9875\u9762\uFF0C\u8BF7\u70B9\u51FB\u4E0B\u65B9\u94FE\u63A5\u5B8C\u6210\u767B\u5F55\uFF0C\u7CFB\u7EDF\u6B63\u5728\u81EA\u52A8\u8F6E\u8BE2\u72B6\u6001\uFF1A" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { margin: "8px 0", wordBreak: "break-all", fontSize: 11 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: oauthModal.url, target: "_blank", rel: "noreferrer", style: { color: "#38bdf8" }, children: oauthModal.url }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-badge wb2a-badge-warn", children: oauthModal.notice })
    ] }) }),
    importOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-modal-backdrop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-modal", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u6279\u91CF / ZIP \u8D26\u53F7\u5BFC\u5165" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-danger wb2a-btn-sm", onClick: () => setImportOpen(false), children: "\u5173\u95ED" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u9ED8\u8BA4\u533A\u670D:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { className: "wb2a-input", value: importRealm, onChange: (e) => setImportRealm(e.target.value), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "global", children: "\u56FD\u9645\u7248 (Global / workbuddy.ai)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cn", children: "\u56FD\u5185\u7248 (CN / codebuddy.cn)" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 8 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u9009\u62E9 .zip \u5907\u4EFD\u5305 / .json / .txt \u6587\u4EF6:" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: ".zip,.json,.txt,.info", onChange: handleImportFileChange })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 4 }, children: "\u6216\u76F4\u63A5\u7C98\u8D34\u6587\u672C\uFF08\u652F\u6301 JSON / \u6CE8\u91CA / access----refresh\uFF09:" }),
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
            color: "#38bdf8",
            fontWeight: 700,
            textShadow: "0 0 6px rgba(56,189,248,0.3)"
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
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: "#cbd5e1" }, children: [
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
          color: loading ? "#38bdf8" : "#94a3b8",
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
          color: "#38bdf8",
          textDecoration: "none",
          fontSize: 11,
          marginLeft: 2
        },
        title: "\u6253\u5F00\u72EC\u7ACB Cyberpunk Web \u63A7\u5236\u53F0",
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
var styles_default = '/**\n * styles.css - DSH WorkBuddy2API \u73B0\u4EE3\u5316\u6781\u5BA2\u5361\u7247\u6837\u5F0F\n */\n\n.wb2a-card {\n  font-family: var(--dsh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);\n  color: var(--dsh-color-fg, #e2e8f0);\n  background: var(--dsh-color-bg-card, #131722);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 10px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\n\n.wb2a-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--dsh-color-border, #2a324b);\n  padding-bottom: 12px;\n  margin-bottom: 14px;\n}\n\n.wb2a-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #38bdf8;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.wb2a-badge {\n  font-size: 11px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: rgba(56, 189, 248, 0.15);\n  color: #38bdf8;\n  border: 1px solid rgba(56, 189, 248, 0.3);\n}\n\n.wb2a-badge-success {\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.3);\n}\n\n.wb2a-badge-warn {\n  background: rgba(234, 179, 8, 0.15);\n  color: #facc15;\n  border: 1px solid rgba(234, 179, 8, 0.3);\n}\n\n.wb2a-tabs {\n  display: flex;\n  gap: 8px;\n  border-bottom: 1px solid var(--dsh-color-border, #2a324b);\n  margin-bottom: 16px;\n}\n\n.wb2a-tab-btn {\n  background: transparent;\n  border: none;\n  padding: 8px 14px;\n  font-size: 13px;\n  color: var(--dsh-color-fg-muted, #94a3b8);\n  cursor: pointer;\n  border-bottom: 2px solid transparent;\n  transition: all 0.2s;\n}\n\n.wb2a-tab-btn:hover {\n  color: #38bdf8;\n}\n\n.wb2a-tab-btn.active {\n  color: #38bdf8;\n  border-bottom-color: #38bdf8;\n  font-weight: 600;\n}\n\n.wb2a-account-item {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 8px;\n  padding: 12px;\n  margin-bottom: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.wb2a-account-item.active {\n  border-color: #38bdf8;\n  background: rgba(56, 189, 248, 0.04);\n}\n\n.wb2a-btn {\n  background: #0284c7;\n  color: #ffffff;\n  border: none;\n  border-radius: 6px;\n  padding: 6px 12px;\n  font-size: 12px;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n\n.wb2a-btn:hover {\n  background: #0369a1;\n}\n\n.wb2a-btn-secondary {\n  background: rgba(255, 255, 255, 0.08);\n  color: #cbd5e1;\n}\n\n.wb2a-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.15);\n}\n\n.wb2a-btn-danger {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.4);\n}\n\n.wb2a-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.3);\n}\n\n.wb2a-input {\n  background: rgba(0, 0, 0, 0.3);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 6px;\n  padding: 6px 10px;\n  color: #f1f5f9;\n  font-size: 12px;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.wb2a-grid-stats {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 10px;\n  margin-bottom: 16px;\n}\n\n.wb2a-stat-box {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 8px;\n  padding: 10px;\n  text-align: center;\n}\n\n.wb2a-stat-value {\n  font-size: 18px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.wb2a-stat-label {\n  font-size: 11px;\n  color: #94a3b8;\n  margin-top: 4px;\n}\n\n.wb2a-dock-line {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11px;\n  color: #94a3b8;\n  padding: 4px 8px;\n  background: rgba(0, 0, 0, 0.25);\n  border-radius: 4px;\n  border: 1px solid rgba(255, 255, 255, 0.05);\n}\n\n.wb2a-summary-grid {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 10px;\n  margin-bottom: 14px;\n}\n\n.wb2a-realm-card {\n  background: rgba(15, 23, 42, 0.72);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 8px;\n  padding: 12px;\n}\n\n.wb2a-btn-success {\n  background: rgba(34, 197, 94, 0.22);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.45);\n}\n\n.wb2a-btn-success:hover {\n  background: rgba(34, 197, 94, 0.34);\n}\n\n.wb2a-btn-warn {\n  background: rgba(234, 179, 8, 0.2);\n  color: #facc15;\n  border: 1px solid rgba(234, 179, 8, 0.4);\n}\n\n.wb2a-btn-warn:hover {\n  background: rgba(234, 179, 8, 0.32);\n}\n\n.wb2a-btn-sm {\n  padding: 4px 8px;\n  font-size: 11px;\n}\n\n.wb2a-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin-bottom: 12px;\n  align-items: center;\n}\n\n.wb2a-modal-backdrop {\n  position: fixed;\n  inset: 0;\n  background: rgba(2, 6, 23, 0.78);\n  backdrop-filter: blur(4px);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  z-index: 9999;\n}\n\n.wb2a-modal {\n  width: 520px;\n  max-width: 92vw;\n  background: #0f172a;\n  border: 1px solid #38bdf8;\n  border-radius: 10px;\n  padding: 16px;\n  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.65);\n}\n\n.wb2a-code {\n  background: rgba(2, 6, 23, 0.85);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 6px;\n  padding: 10px;\n  font-size: 11px;\n  color: #a5f3fc;\n  overflow-x: auto;\n  white-space: pre-wrap;\n  word-break: break-all;\n}\n';

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
