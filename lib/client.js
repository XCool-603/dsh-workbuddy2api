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
function SettingsCard({ t }) {
  const [tab, setTab] = (0, import_react.useState)("accounts");
  const [status, setStatus] = (0, import_react.useState)(null);
  const [usage, setUsage] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(false);
  const [newToken, setNewToken] = (0, import_react.useState)("");
  const [newRealm, setNewRealm] = (0, import_react.useState)("global");
  const [newNickname, setNewNickname] = (0, import_react.useState)("");
  const [travelData, setTravelData] = (0, import_react.useState)(null);
  const [growthData, setGrowthData] = (0, import_react.useState)(null);
  const [tasksList, setTasksList] = (0, import_react.useState)([]);
  const [activityLogs, setActivityLogs] = (0, import_react.useState)([]);
  const [actionMsg, setActionMsg] = (0, import_react.useState)("");
  const notifyBalanceUpdate = () => {
    try {
      window.dispatchEvent(new CustomEvent("wb2a:refresh-balance"));
    } catch (_) {
    }
  };
  const fetchStatus = async () => {
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
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
  const fetchActivity = async () => {
    try {
      const [tRes, gRes, taskRes] = await Promise.all([
        fetch("/plugins/dsh-workbuddy2api/travel/status"),
        fetch("/plugins/dsh-workbuddy2api/growth/status"),
        fetch("/plugins/dsh-workbuddy2api/tasks/list")
      ]);
      if (tRes.ok) {
        const td = await tRes.json();
        setTravelData(td);
      }
      if (gRes.ok) {
        const gd = await gRes.json();
        setGrowthData(gd);
      }
      if (taskRes.ok) {
        const kd = await taskRes.json();
        setTasksList(kd.tasks || []);
      }
    } catch (_) {
    }
  };
  (0, import_react.useEffect)(() => {
    fetchStatus();
    fetchUsage();
    fetchActivity();
    const onFocus = () => {
      fetchStatus();
      fetchActivity();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("wb2a:refresh-balance", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("wb2a:refresh-balance", onFocus);
    };
  }, []);
  const handleSwitchAccount = async (uid) => {
    setLoading(true);
    await fetch("/plugins/dsh-workbuddy2api/accounts/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid })
    });
    notifyBalanceUpdate();
    await fetchStatus();
    await fetchActivity();
    setLoading(false);
  };
  const handleAddAccount = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/accounts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: newToken.trim(),
          realm: newRealm,
          nickname: newNickname.trim() || void 0
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "\u6DFB\u52A0\u8D26\u53F7\u5931\u8D25");
      } else {
        setNewToken("");
        setNewNickname("");
        await fetchStatus();
      }
    } catch (e) {
      alert(`\u7F51\u7EDC\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const handleDeleteAccount = async (uid) => {
    if (!confirm(`\u786E\u5B9A\u8981\u79FB\u9664\u8D26\u53F7 ${uid} \u5417\uFF1F`)) return;
    await fetch("/plugins/dsh-workbuddy2api/accounts/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid })
    });
    await fetchStatus();
  };
  const handleDepartTravel = async (locationId = 4) => {
    setLoading(true);
    setActionMsg("\u6B63\u5728\u6D3E\u51FA\u732B\u732B\u65C5\u884C...");
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/travel/depart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId })
      });
      const data = await res.json();
      setActionMsg(data.message || (data.ok ? "\u6D3E\u51FA\u6210\u529F" : "\u6D3E\u51FA\u5931\u8D25"));
      await fetchActivity();
    } catch (e) {
      setActionMsg(`\u6D3E\u51FA\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const handleClaimTravel = async (recordId) => {
    setLoading(true);
    setActionMsg("\u6B63\u5728\u9886\u53D6\u732B\u732B\u65C5\u884C\u5956\u52B1...");
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/travel/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId })
      });
      const data = await res.json();
      setActionMsg(data.message || (data.ok ? "\u9886\u53D6\u6210\u529F" : "\u9886\u53D6\u5931\u8D25"));
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`\u9886\u53D6\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const handleDrawLottery = async () => {
    setLoading(true);
    setActionMsg("\u6B63\u5728\u6267\u884C\u62BD\u5956...");
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/growth/lottery/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.result?.ok) {
        setActionMsg(`\u{1F389} ${data.result.message} (\u5269\u4F59 ${data.remainingChances} \u6B21)`);
      } else {
        setActionMsg(data.result?.message || "\u62BD\u5956\u5B8C\u6210");
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`\u62BD\u5956\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const handleClaimAllWelfare = async (all = false) => {
    setLoading(true);
    setActionMsg(all ? "\u6B63\u5728\u4E3A\u8D26\u53F7\u6C60\u6240\u6709\u8D26\u53F7\u6279\u91CF\u62C9\u6EE1\u5168\u5957\u798F\u5229..." : "\u6B63\u5728\u4E3A\u5F53\u524D\u8D26\u53F7\u6267\u884C\u5168\u5957\u6D3B\u52A8\u4E0E\u6210\u957F\u4EFB\u52A1\u81EA\u52A8\u5316...");
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/growth/claim-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all })
      });
      const data = await res.json();
      if (data.ok) {
        if (all) {
          setActionMsg(`\u2705 \u5168\u6C60\u6279\u91CF\u62C9\u6EE1\u5B8C\u6210\uFF01\u5171\u5DE1\u68C0 ${data.results?.length || 0} \u4E2A\u8D26\u53F7`);
        } else {
          setActionMsg(data.result?.summary || "\u798F\u5229\u4E0E\u6210\u957F\u4EFB\u52A1\u5DF2\u5168\u90E8\u5B8C\u6210");
          setActivityLogs(data.result?.log || []);
        }
      } else {
        setActionMsg(data.message || "\u6267\u884C\u5F02\u5E38");
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`\u6267\u884C\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const handleRunAllTasks = async () => {
    setLoading(true);
    setActionMsg("\u26A1 \u6B63\u5728\u81EA\u52A8\u5206\u6790\u3001\u6A21\u62DF\u4E0A\u62A5\u5E76\u6536\u5272\u6240\u6709\u6210\u957F\u4EFB\u52A1...");
    try {
      const res = await fetch("/plugins/dsh-workbuddy2api/tasks/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.ok && data.result) {
        setActionMsg(data.result.summary || "\u6210\u957F\u4EFB\u52A1\u6536\u5272\u5B8C\u6210");
        setActivityLogs(data.result.logs || []);
      } else {
        setActionMsg(data.message || "\u6210\u957F\u4EFB\u52A1\u6536\u5272\u5B8C\u6210");
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`\u6210\u957F\u4EFB\u52A1\u6267\u884C\u5F02\u5E38: ${e.message}`);
    }
    setLoading(false);
  };
  const buddy = travelData?.buddy;
  const travel = travelData?.travel || {};
  const streak = growthData?.streak || {};
  const chances = growthData?.chances ?? 0;
  const claimedCount = tasksList.filter((t2) => t2.accept_status === "claimed").length;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-card", children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u26A1 WorkBuddy 2API \u7F51\u5173\u4E2D\u67A2" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge wb2a-badge-success", children: "\u5DF2\u8FDE\u63A5" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#94a3b8" }, children: [
        "\u7F51\u5173\u7AEF\u53E3: ",
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#38bdf8" }, children: status?.gatewayPort || 7863 })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-tabs", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: `wb2a-tab-btn ${tab === "accounts" ? "active" : ""}`, onClick: () => setTab("accounts"), children: [
        "\u8D26\u53F7\u6C60 (",
        status?.accounts?.length || 0,
        ")"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `wb2a-tab-btn ${tab === "activity" ? "active" : ""}`, onClick: () => {
        setTab("activity");
        fetchActivity();
      }, children: "\u{1F431} \u732B\u732B\u65C5\u884C\u4E0E\u6D3B\u52A8\u798F\u5229" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `wb2a-tab-btn ${tab === "models" ? "active" : ""}`, onClick: () => setTab("models"), children: "\u6A21\u578B\u4E0E\u522B\u540D" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `wb2a-tab-btn ${tab === "usage" ? "active" : ""}`, onClick: () => {
        setTab("usage");
        fetchUsage();
      }, children: "\u79EF\u5206\u4E0E\u7528\u91CF" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `wb2a-tab-btn ${tab === "gateway" ? "active" : ""}`, onClick: () => setTab("gateway"), children: "\u7F51\u5173\u8BBE\u7F6E" })
    ] }),
    tab === "accounts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 13, color: "#cbd5e1" }, children: "\u591A\u8D26\u53F7\u8C03\u5EA6\u6C60 (\u652F\u6301\u56FD\u9645\u7248/\u56FD\u5185\u7248\u81EA\u52A8\u8F6E\u8F6C\u4E0E\u6545\u969C\u81EA\u6108)" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary", onClick: fetchStatus, children: "\u5237\u65B0\u72B6\u6001" })
      ] }),
      status?.accounts?.map((acc) => {
        const isActive = acc.uid === status.activeUid;
        const balRemain = acc.balance?.remain;
        const balText = typeof balRemain === "number" ? `${balRemain.toLocaleString()} \u79EF\u5206` : balRemain ?? "\u8BA1\u7B97\u4E2D...";
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `wb2a-account-item ${isActive ? "active" : ""}`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontWeight: 600, color: isActive ? "#38bdf8" : "#f1f5f9", fontSize: 13, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: acc.nickname || acc.uid }),
              isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge wb2a-badge-success", children: "\u5F53\u524D\u4E3B\u8D26\u53F7" }),
              acc.coolingDown && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wb2a-badge wb2a-badge-warn", children: "\u51B7\u5374\u7194\u65AD\u4E2D" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wb2a-badge", style: { background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "1px solid rgba(56, 189, 248, 0.25)" }, children: [
                "\u26A1 ",
                balText
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 }, children: [
              "UID: ",
              acc.uid,
              " \xB7 \u7248\u672C: ",
              acc.realm === "global" ? "\u56FD\u9645\u7248 (workbuddy.ai)" : "\u56FD\u5185\u7248 (codebuddy.cn)",
              " \xB7 \u5728\u9014\u5E76\u53D1: ",
              acc.inFlight
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 6 }, children: [
            !isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn", onClick: () => handleSwitchAccount(acc.uid), disabled: loading, children: "\u8BBE\u4E3A\u4E3B\u53F7" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-danger", onClick: () => handleDeleteAccount(acc.uid), children: "\u79FB\u9664" })
          ] })
        ] }, acc.uid);
      }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 16, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px dashed #2a324b" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: "#38bdf8", marginBottom: 8 }, children: "+ \u7C98\u8D34 Token \u6DFB\u52A0\u8D26\u53F7" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              placeholder: "\u7C98\u8D34 refreshToken \u6216\u5B8C\u6574 JSON \u51ED\u8BC1",
              value: newToken,
              onChange: (e) => setNewToken(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "select",
            {
              className: "wb2a-input",
              style: { width: 120 },
              value: newRealm,
              onChange: (e) => setNewRealm(e.target.value),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "global", children: "\u56FD\u9645\u7248" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cn", children: "\u56FD\u5185\u7248" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "wb2a-input",
              placeholder: "\u8D26\u53F7\u5907\u6CE8\u522B\u540D (\u53EF\u9009)",
              value: newNickname,
              onChange: (e) => setNewNickname(e.target.value)
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn", onClick: handleAddAccount, disabled: loading || !newToken.trim(), children: loading ? "\u6B63\u5728\u9A8C\u8BC1..." : "\u9A8C\u8BC1\u5E76\u52A0\u5165\u6C60" })
        ] })
      ] })
    ] }),
    tab === "activity" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { background: "rgba(255, 255, 255, 0.03)", border: "1px solid #2a324b", borderRadius: 8, padding: 14, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: "#38bdf8" }, children: "\u{1F431} \u732B\u732B\u65C5\u884C\u7BA1\u5BB6 (Cat Travel)" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wb2a-btn wb2a-btn-secondary", style: { fontSize: 11 }, onClick: fetchActivity, children: "\u5237\u65B0\u72B6\u6001" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", style: { fontSize: 15, color: "#f1f5f9" }, children: buddy ? buddy.name : "\u672A\u9886\u517B" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5C0F\u732B\u6863\u6848 (\u9996\u6B21\u9886\u517B+300\u5206)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", style: { fontSize: 15 }, children: travel.state === "arrived" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#4ade80" }, children: "\u5DF2\u5230\u7AD9 (\u5F85\u9886\u5956)" }) : travel.state === "traveling" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#38bdf8" }, children: "\u65C5\u884C\u4E2D..." }) : travel.dailyLimitReached ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#94a3b8" }, children: "\u4ECA\u65E5\u5DF2\u6EE1" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#facc15" }, children: "\u7A7A\u95F2\u4E2D" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u65C5\u884C\u72B6\u6001" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", style: { fontSize: 15, color: "#4ade80" }, children: travel.rewardCredit ? `+${travel.rewardCredit} \u79EF\u5206` : "0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5230\u7AD9\u5F85\u9886\u79EF\u5206" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn",
              onClick: () => handleDepartTravel(4),
              disabled: loading || travel.state === "traveling" || travel.dailyLimitReached,
              children: "\u{1F680} \u6D3E\u51FA\u732B\u732B\u65C5\u884C (\u53E4\u9547\u5BA2\u6808)"
            }
          ),
          travel.state === "arrived" && travel.recordId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              className: "wb2a-btn",
              style: { background: "#16a34a" },
              onClick: () => handleClaimTravel(travel.recordId),
              disabled: loading,
              children: [
                "\u{1F381} \u9886\u53D6\u5230\u7AD9\u5956\u52B1 (+",
                travel.rewardCredit,
                " \u5206)"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { background: "rgba(255, 255, 255, 0.03)", border: "1px solid #2a324b", borderRadius: 8, padding: 14, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: "#facc15", marginBottom: 10 }, children: "\u{1F31F} \u8FDE\u767B\u91CC\u7A0B\u7891\u4E0E\u62BD\u5956\u4E2D\u5FC3" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-value", children: [
              streak.days || 0,
              " \u5929"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u8FDE\u7EED\u767B\u5F55\u5929\u6570" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-value", children: [
              streak.makeupCards?.balance || 0,
              " \u5F20"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u53EF\u7528\u8865\u7B7E\u5361 (\u9632\u65AD\u6863)" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-value", style: { color: "#facc15" }, children: [
              chances,
              " \u6B21"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5F53\u524D\u62BD\u5956\u6B21\u6570\u4F59\u989D" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: 8 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-secondary",
            onClick: handleDrawLottery,
            disabled: loading || chances <= 0,
            children: [
              "\u{1F3B0} \u8FDE\u767B\u62BD\u5956 (",
              chances,
              " \u6B21\u53EF\u7528)"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { background: "rgba(255, 255, 255, 0.03)", border: "1px solid #2a324b", borderRadius: 8, padding: 14, marginBottom: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 14, fontWeight: 600, color: "#a78bfa" }, children: [
              "\u{1F4CB} \u5B98\u65B9\u6210\u957F\u4EFB\u52A1\u5168\u81EA\u52A8\u6536\u5272 (",
              claimedCount,
              "/",
              tasksList.length,
              " \u5DF2\u6536\u5272)"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, color: "#94a3b8", marginLeft: 8 }, children: "\u8986\u76D6\u6A21\u677F\u4F7F\u7528\u3001\u4E13\u5BB6\u56E2\u961F\u3001\u8F7B\u91CF\u4E91\u3001\u521B\u5EFA\u753B\u5E03\u3001\u684C\u9762\u5BF9\u8BDD\u3001\u8D44\u6599\u5E93\u4F53\u9A8C\u7B49\u5168\u90E8\u52A0\u5206\u9879" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn",
              style: { background: "#7c3aed", padding: "6px 14px" },
              onClick: handleRunAllTasks,
              disabled: loading,
              children: "\u26A1 \u4E00\u952E\u81EA\u52A8\u5B8C\u6210\u6240\u6709\u4EFB\u52A1\u5E76\u9886\u79EF\u5206"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxHeight: 180, overflowY: "auto", background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: 8 }, children: tasksList.map((t2) => {
          const isClaimed = t2.accept_status === "claimed";
          const isCompleted = t2.accept_status === "completed";
          const cur = t2.progress?.current ?? 0;
          const tgt = t2.progress?.target ?? 1;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.03)" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: isClaimed ? "#4ade80" : isCompleted ? "#38bdf8" : "#facc15" }, children: isClaimed ? "\u25CF" : "\u25CB" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: isClaimed ? "#94a3b8" : "#f1f5f9" }, children: t2.title })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 10, alignItems: "center" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#64748b", fontSize: 11 }, children: [
                cur,
                "/",
                tgt
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: isClaimed ? "#4ade80" : "#facc15", fontSize: 11 }, children: isClaimed ? "\u5DF2\u5230\u8D26" : `+${t2.reward_credit || 100}\u5206` })
            ] })
          ] }, t2.task_code);
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { background: "rgba(56, 189, 248, 0.05)", border: "1px solid rgba(56, 189, 248, 0.25)", borderRadius: 8, padding: 14 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 14, fontWeight: 600, color: "#38bdf8", marginBottom: 6 }, children: "\u2728 \u4E00\u952E\u81EA\u52A8\u5316\u798F\u5229\u5F15\u64CE" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 }, children: [
          "\u6309\u987A\u5E8F\u4E32\u8054\u6267\u884C\uFF1A\u5BF9\u8BDD\u6D3B\u8DC35\u8FDE\u53D1 + \u6BCF\u65E5\u7B7E\u5230 + \u65B0\u624B\u793C\u5305 + \u6D3B\u52A8\u8865\u507F + \u9886\u517B\u7B2C\u4E00\u53EA\u732B\uFF08\u9001300\u79EF\u5206\uFF09+ \u6D3E\u51FA\u732B\u732B/\u5230\u7AD9\u9886\u5956 + \u8FDE\u767B\u5404\u6863\u4F4D\u91CC\u7A0B\u7891\u5151\u6362 + \u81EA\u52A8\u62BD\u5B8C\u6240\u6709\u62BD\u5956\u673A\u4F1A + \u8865\u7B7E\u5361\u68C0\u67E5 + ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "\u6210\u957F\u4EFB\u52A1\u5168\u81EA\u52A8\u70B9\u4EAE\u4E0E\u6536\u5272" }),
          "\u3002"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: 10 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn",
              style: { padding: "8px 18px", fontWeight: 600 },
              onClick: () => handleClaimAllWelfare(false),
              disabled: loading,
              children: "\u{1F31F} \u5F53\u524D\u4E3B\u53F7\u4E00\u952E\u5403\u6EE1\u798F\u5229"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "button",
            {
              className: "wb2a-btn wb2a-btn-secondary",
              style: { padding: "8px 18px" },
              onClick: () => handleClaimAllWelfare(true),
              disabled: loading,
              children: "\u{1F310} \u5168\u6C60\u8D26\u53F7\u6279\u91CF\u5DE1\u68C0\u62C9\u6EE1"
            }
          )
        ] }),
        actionMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { marginTop: 12, padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 6, fontSize: 13, color: "#38bdf8" }, children: actionMsg }),
        activityLogs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 10, background: "rgba(0,0,0,0.4)", borderRadius: 6, padding: 10, maxHeight: 150, overflowY: "auto", fontSize: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontWeight: 600, color: "#94a3b8", marginBottom: 4 }, children: "\u6267\u884C\u6D41\u6C34\u65E5\u5FD7:" }),
          activityLogs.map((log, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { color: log.ok ? "#4ade80" : "#cbd5e1", padding: "2px 0" }, children: [
            "\u2022 [",
            log.step,
            "]: ",
            log.title || log.message || (log.ok ? "\u5B8C\u6210" : JSON.stringify(log))
          ] }, idx))
        ] })
      ] })
    ] }),
    tab === "models" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, color: "#cbd5e1", marginBottom: 8 }, children: "\u5E38\u7528\u7B2C\u4E09\u65B9\u5BA2\u6237\u7AEF\u6A21\u578B\u522B\u540D\u6620\u5C04 (Cursor / Dify / NextChat)" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 6, marginBottom: 12 }, children: Object.entries(status?.aliases || {}).map(([alias, target]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { style: { color: "#38bdf8" }, children: alias }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#94a3b8" }, children: "\u2192" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { style: { color: "#4ade80" }, children: target })
      ] }, alias)) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: "#94a3b8" }, children: "\u63D0\u793A\uFF1A\u6240\u6709\u4E0A\u6E38\u6A21\u578B\u5747\u652F\u6301\u63A8\u7406\u601D\u8003\u6863\u4F4D\u81EA\u52A8\u5F52\u4E00\u5316\uFF08\u907F\u514D 11150 \u9519\u8BEF\uFF09\uFF0C\u5E76\u652F\u6301\u89C6\u9891\u5927\u6A21\u578B\uFF08\u53EF\u7075 3.0 / \u6D77\u87BA H3\uFF09\u76F4\u51FA\uFF01" })
    ] }),
    tab === "usage" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 13, color: "#cbd5e1" }, children: "\u5B9E\u65F6\u79EF\u5206\u8BA1\u91CF\u4E0E\u672C\u5730 Token \u8D26\u672C" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "wb2a-btn wb2a-btn-secondary",
            style: { fontSize: 11 },
            onClick: () => {
              fetchStatus();
              fetchUsage();
            },
            disabled: loading,
            children: "\u{1F504} \u7ACB\u5373\u6838\u5BF9\u4E0A\u6E38\u79EF\u5206"
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-grid-stats", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: usage?.today?.totalTokens || 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5\u603B\u6D88\u8017 Tokens" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: usage?.today?.requests || 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u4ECA\u65E5\u8BF7\u6C42\u6B21\u6570" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", style: { color: "#38bdf8" }, children: typeof status?.balance?.remain === "number" ? status.balance.remain.toLocaleString() : status?.balance?.remain || "\u6B63\u5E38" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5F53\u524D\u4E3B\u53F7\u5B9E\u65F6\u53EF\u7528\u79EF\u5206" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb2a-stat-box", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-value", children: usage?.summary?.totalRequests || 0 }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb2a-stat-label", children: "\u5386\u53F2\u7D2F\u8BA1\u8BF7\u6C42\u6570" })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }, children: "\u8FD1 7 \u5929\u8C03\u7528\u8D70\u52BF\u4E0E\u7F13\u5B58\u547D\u4E2D\u7387" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 6, marginBottom: 14 }, children: usage?.trend7d?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#94a3b8" }, children: d.date }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#38bdf8" }, children: [
          d.tokens,
          " Tokens (",
          d.requests,
          " \u6B21)"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#4ade80" }, children: [
          "\u7F13\u5B58\u547D\u4E2D: ",
          d.hitRate,
          "%"
        ] })
      ] }, d.date)) }),
      status?.balance?.packages?.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }, children: [
          "\u5F53\u524D\u6709\u6548\u79EF\u5206\u6743\u76CA\u5305\u6E05\u5355 (\u5171 ",
          status.balance.packages.length,
          " \u4E2A)"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { maxHeight: 200, overflowY: "auto", background: "rgba(0,0,0,0.25)", padding: 8, borderRadius: 6 }, children: status.balance.packages.map((p, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "5px 4px", borderBottom: "1px solid rgba(255,255,255,0.03)" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#f1f5f9", fontWeight: 500 }, children: p.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#64748b", fontSize: 10 }, children: [
              "\u5230\u671F\u65F6\u95F4: ",
              p.expireTime || "\u957F\u671F\u6709\u6548"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { textAlign: "right" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#38bdf8", fontWeight: 600 }, children: p.remain }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { color: "#94a3b8", fontSize: 11 }, children: [
              " / ",
              p.size || p.remain + p.used
            ] })
          ] })
        ] }, idx)) })
      ] })
    ] }),
    tab === "gateway" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 13, color: "#e2e8f0", marginBottom: 8, fontWeight: 600 }, children: "\u672C\u5730 OpenAI \u517C\u5BB9\u7F51\u5173\u4FE1\u606F" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { background: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 6, fontSize: 12 }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "API Base URL:" }),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { style: { color: "#38bdf8" }, children: [
            "http://127.0.0.1:",
            status?.gatewayPort || 7863,
            "/v1"
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 6 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "API Key:" }),
          " ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { style: { color: "#94a3b8" }, children: "\u968F\u610F\u586B\u5199\uFF08\u6216\u7559\u7A7A\uFF09" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: "#64748b", fontSize: 11, marginTop: 8 }, children: "\u53EF\u5728 Cursor\u3001Cherry Studio\u3001Dify \u7B49\u4EFB\u4F55\u5916\u90E8\u5DE5\u5177\u4E2D\u76F4\u63A5\u914D\u7F6E\u4E0A\u8FF0 Base URL\uFF0C\u4EAB\u53D7\u4E0E DSH \u5B8C\u5168\u4E00\u81F4\u7684\u9AD8\u53EF\u7528\u8D26\u53F7\u6C60\u8C03\u5EA6\uFF01" })
      ] })
    ] })
  ] });
}

// src/client/components/ComposerDock.jsx
var import_react2 = __toESM(require("react"), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
function ComposerDock() {
  const [balance, setBalance] = (0, import_react2.useState)(null);
  const [activeAccount, setActiveAccount] = (0, import_react2.useState)(null);
  const [loading, setLoading] = (0, import_react2.useState)(false);
  const timerRef = (0, import_react2.useRef)(null);
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/plugins/dsh-workbuddy2api/status");
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        const active = data.accounts?.find((a) => a.uid === data.activeUid);
        setActiveAccount(active);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };
  (0, import_react2.useEffect)(() => {
    fetchStatus();
    const handleFocus = () => {
      fetchStatus();
    };
    window.addEventListener("focus", handleFocus);
    const handleCustomUpdate = () => {
      fetchStatus();
    };
    window.addEventListener("wb2a:refresh-balance", handleCustomUpdate);
    timerRef.current = setInterval(fetchStatus, 12e3);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("wb2a:refresh-balance", handleCustomUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  const formattedRemain = typeof balance?.remain === "number" ? balance.remain.toLocaleString() : balance?.remain ?? "\u5C31\u7EEA";
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
      )
    ] }),
    activeAccount && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "\xB7" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { color: "#cbd5e1" }, children: [
        "\u8D26\u53F7: ",
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
        onClick: fetchStatus,
        disabled: loading,
        title: "\u7ACB\u5373\u4ECE\u4E0A\u6E38\u5237\u65B0\u6700\u65B0\u79EF\u5206",
        children: "\u21BB"
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
var styles_default = '/**\n * styles.css - DSH WorkBuddy2API \u73B0\u4EE3\u5316\u6781\u5BA2\u5361\u7247\u6837\u5F0F\n */\n\n.wb2a-card {\n  font-family: var(--dsh-font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);\n  color: var(--dsh-color-fg, #e2e8f0);\n  background: var(--dsh-color-bg-card, #131722);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 10px;\n  padding: 16px;\n  margin-bottom: 16px;\n}\n\n.wb2a-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-bottom: 1px solid var(--dsh-color-border, #2a324b);\n  padding-bottom: 12px;\n  margin-bottom: 14px;\n}\n\n.wb2a-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: #38bdf8;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.wb2a-badge {\n  font-size: 11px;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: rgba(56, 189, 248, 0.15);\n  color: #38bdf8;\n  border: 1px solid rgba(56, 189, 248, 0.3);\n}\n\n.wb2a-badge-success {\n  background: rgba(34, 197, 94, 0.15);\n  color: #4ade80;\n  border: 1px solid rgba(34, 197, 94, 0.3);\n}\n\n.wb2a-badge-warn {\n  background: rgba(234, 179, 8, 0.15);\n  color: #facc15;\n  border: 1px solid rgba(234, 179, 8, 0.3);\n}\n\n.wb2a-tabs {\n  display: flex;\n  gap: 8px;\n  border-bottom: 1px solid var(--dsh-color-border, #2a324b);\n  margin-bottom: 16px;\n}\n\n.wb2a-tab-btn {\n  background: transparent;\n  border: none;\n  padding: 8px 14px;\n  font-size: 13px;\n  color: var(--dsh-color-fg-muted, #94a3b8);\n  cursor: pointer;\n  border-bottom: 2px solid transparent;\n  transition: all 0.2s;\n}\n\n.wb2a-tab-btn:hover {\n  color: #38bdf8;\n}\n\n.wb2a-tab-btn.active {\n  color: #38bdf8;\n  border-bottom-color: #38bdf8;\n  font-weight: 600;\n}\n\n.wb2a-account-item {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 8px;\n  padding: 12px;\n  margin-bottom: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\n\n.wb2a-account-item.active {\n  border-color: #38bdf8;\n  background: rgba(56, 189, 248, 0.04);\n}\n\n.wb2a-btn {\n  background: #0284c7;\n  color: #ffffff;\n  border: none;\n  border-radius: 6px;\n  padding: 6px 12px;\n  font-size: 12px;\n  cursor: pointer;\n  transition: background 0.2s;\n}\n\n.wb2a-btn:hover {\n  background: #0369a1;\n}\n\n.wb2a-btn-secondary {\n  background: rgba(255, 255, 255, 0.08);\n  color: #cbd5e1;\n}\n\n.wb2a-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.15);\n}\n\n.wb2a-btn-danger {\n  background: rgba(239, 68, 68, 0.2);\n  color: #f87171;\n  border: 1px solid rgba(239, 68, 68, 0.4);\n}\n\n.wb2a-btn-danger:hover {\n  background: rgba(239, 68, 68, 0.3);\n}\n\n.wb2a-input {\n  background: rgba(0, 0, 0, 0.3);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 6px;\n  padding: 6px 10px;\n  color: #f1f5f9;\n  font-size: 12px;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.wb2a-grid-stats {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  gap: 10px;\n  margin-bottom: 16px;\n}\n\n.wb2a-stat-box {\n  background: rgba(255, 255, 255, 0.03);\n  border: 1px solid var(--dsh-color-border, #2a324b);\n  border-radius: 8px;\n  padding: 10px;\n  text-align: center;\n}\n\n.wb2a-stat-value {\n  font-size: 18px;\n  font-weight: 700;\n  color: #38bdf8;\n}\n\n.wb2a-stat-label {\n  font-size: 11px;\n  color: #94a3b8;\n  margin-top: 4px;\n}\n\n.wb2a-dock-line {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11px;\n  color: #94a3b8;\n  padding: 4px 8px;\n  background: rgba(0, 0, 0, 0.25);\n  border-radius: 4px;\n  border: 1px solid rgba(255, 255, 255, 0.05);\n}\n';

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
