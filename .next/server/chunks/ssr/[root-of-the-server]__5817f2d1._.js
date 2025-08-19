module.exports = {

"[project]/.next-internal/server/app/(protected)/dashboard/page/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/loading.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/(protected)/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(protected)/layout.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/punycode [external] (punycode, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/lib/supabase/server.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "createClient": ()=>createClient
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://dlscdnfyofqyhyhylotn.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsc2NkbmZ5b2ZxeWh5aHlsb3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTYzMDAsImV4cCI6MjA3MDg5MjMwMH0.5kWJr0bOzzRPZgfS4p3-gPDxc4HSf5TwfObSchQz8C4"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // サーバーコンポーネントでは cookie の設定が失敗する場合がある
                }
            }
        }
    });
}
}),
"[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/(protected)/dashboard/DashboardClient.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/(protected)/dashboard/DashboardClient.tsx <module evaluation>", "default");
}),
"[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/app/(protected)/dashboard/DashboardClient.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/app/(protected)/dashboard/DashboardClient.tsx", "default");
}),
"[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/(protected)/dashboard/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>DashboardPage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/(protected)/dashboard/DashboardClient.tsx [app-rsc] (ecmascript)");
;
;
;
;
async function DashboardPage() {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])('/login');
    }
    // ユーザープロファイルを取得
    const { data: profile } = await supabase.from('profiles').select('*, departments(name)').eq('id', user.id).single();
    // 当月のデータを取得
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7) + '-01';
    // アサインデータから個人の売上を集計
    const { data: userAssignments } = await supabase.from('assignments').select('*').eq('work_month', currentMonth).or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`);
    // 個人の売上・利益を計算
    let salesData = {
        total_sales: 0,
        total_profit: 0,
        project_profit: 0,
        staff_profit: 0,
        assignment_count: 0,
        gross_margin_rate: 0
    };
    if (userAssignments) {
        userAssignments.forEach((assignment)=>{
            const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
            const sales = assignment.daily_rate * workDays;
            const cost = assignment.cost_rate * workDays;
            const profit = sales - cost;
            const isProjectManager = assignment.project_manager_id === user.id;
            const isStaffManager = assignment.staff_manager_id === user.id;
            // 売上の配分計算
            if (isProjectManager && isStaffManager) {
                // 両方担当の場合: 売上100%、利益100%
                salesData.total_sales += sales;
                salesData.project_profit += profit * 0.5;
                salesData.staff_profit += profit * 0.5;
                salesData.assignment_count++;
            } else if (isProjectManager) {
                // 案件担当者のみ: 売上50%、利益50%
                salesData.total_sales += sales * 0.5;
                salesData.project_profit += profit * 0.5;
                salesData.assignment_count++;
            } else if (isStaffManager) {
                // 人材担当者のみ: 売上50%、利益50%
                salesData.total_sales += sales * 0.5;
                salesData.staff_profit += profit * 0.5;
                salesData.assignment_count++;
            }
        });
        salesData.total_profit = salesData.project_profit + salesData.staff_profit;
        salesData.gross_margin_rate = salesData.total_sales > 0 ? Math.round(salesData.total_profit / salesData.total_sales * 100) : 0;
    }
    // 全社データ（管理者・隊長のみ）
    let companyData = null;
    if (profile?.role === 'admin' || profile?.role === 'leader') {
        const { data: allAssignments } = await supabase.from('assignments').select('*').eq('work_month', currentMonth);
        if (allAssignments) {
            let totalSales = 0;
            let totalCost = 0;
            allAssignments.forEach((assignment)=>{
                const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
                totalSales += assignment.daily_rate * workDays;
                totalCost += assignment.cost_rate * workDays;
            });
            companyData = {
                totalSales,
                totalProfit: totalSales - totalCost,
                totalAssignments: allAssignments.length
            };
        }
    }
    // 最近のアサインを取得
    const { data: recentAssignments } = await supabase.from('assignments').select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name)
    `).or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`).order('created_at', {
        ascending: false
    }).limit(5);
    // 過去6ヶ月の月次データを取得
    const monthlyData = [];
    for(let i = 5; i >= 0; i--){
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - i);
        const targetMonth = targetDate.toISOString().slice(0, 7) + '-01';
        const { data: monthAssignments } = await supabase.from('assignments').select('*').eq('work_month', targetMonth).or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`);
        let monthSales = 0;
        let monthProfit = 0;
        if (monthAssignments) {
            monthAssignments.forEach((assignment)=>{
                const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
                const sales = assignment.daily_rate * workDays;
                const cost = assignment.cost_rate * workDays;
                const profit = sales - cost;
                const isProjectManager = assignment.project_manager_id === user.id;
                const isStaffManager = assignment.staff_manager_id === user.id;
                // 売上と利益の配分計算
                if (isProjectManager && isStaffManager) {
                    // 両方担当: 売上100%、利益100%
                    monthSales += sales;
                    monthProfit += profit;
                } else if (isProjectManager) {
                    // 案件担当のみ: 売上50%、利益50%
                    monthSales += sales * 0.5;
                    monthProfit += profit * 0.5;
                } else if (isStaffManager) {
                    // 人材担当のみ: 売上50%、利益50%
                    monthSales += sales * 0.5;
                    monthProfit += profit * 0.5;
                }
            });
        }
        monthlyData.push({
            month: targetDate.toLocaleDateString('ja-JP', {
                month: 'long'
            }).replace('月', '月'),
            sales: monthSales,
            profit: monthProfit
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        profile: profile,
        salesData: salesData,
        companyData: companyData,
        recentAssignments: recentAssignments || [],
        monthlyData: monthlyData
    }, void 0, false, {
        fileName: "[project]/app/(protected)/dashboard/page.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/(protected)/dashboard/page.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(protected)/dashboard/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__5817f2d1._.js.map