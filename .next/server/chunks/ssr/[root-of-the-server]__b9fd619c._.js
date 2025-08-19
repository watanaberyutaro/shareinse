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
"[project]/app/(protected)/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/(protected)/loading.tsx [app-rsc] (ecmascript)"));
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
    // 全社のアサインデータを取得
    const { data: allAssignments } = await supabase.from('assignments').select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name, department_id),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name, department_id)
    `).eq('work_month', currentMonth);
    // 全社の売上・利益を計算
    let companyStats = {
        totalSales: 0,
        totalProfit: 0,
        totalAssignments: 0,
        grossMarginRate: 0
    };
    // 部署ごとの売上・利益を集計するためのマップ
    const departmentStats = new Map();
    if (allAssignments) {
        allAssignments.forEach((assignment)=>{
            const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
            const sales = assignment.daily_rate * workDays;
            const cost = assignment.cost_rate * workDays;
            const profit = sales - cost;
            // 全社統計
            companyStats.totalSales += sales;
            companyStats.totalProfit += profit;
            companyStats.totalAssignments++;
            // 部署ごとの集計
            // 案件担当者と人材担当者が同じ部署の場合は100%、異なる部署の場合は50%ずつ
            const projectDeptId = assignment.project_manager?.department_id;
            const staffDeptId = assignment.staff_manager?.department_id;
            if (projectDeptId && staffDeptId && projectDeptId === staffDeptId) {
                // 同じ部署の場合：売上・利益100%を加算
                if (!departmentStats.has(projectDeptId)) {
                    departmentStats.set(projectDeptId, {
                        id: projectDeptId,
                        sales: 0,
                        profit: 0,
                        assignmentCount: 0
                    });
                }
                const dept = departmentStats.get(projectDeptId);
                dept.sales += sales;
                dept.profit += profit;
                dept.assignmentCount++;
            } else {
                // 異なる部署の場合：それぞれ50%ずつ
                if (projectDeptId) {
                    if (!departmentStats.has(projectDeptId)) {
                        departmentStats.set(projectDeptId, {
                            id: projectDeptId,
                            sales: 0,
                            profit: 0,
                            assignmentCount: 0
                        });
                    }
                    const dept = departmentStats.get(projectDeptId);
                    dept.sales += sales * 0.5;
                    dept.profit += profit * 0.5;
                    dept.assignmentCount++;
                }
                if (staffDeptId && staffDeptId !== projectDeptId) {
                    if (!departmentStats.has(staffDeptId)) {
                        departmentStats.set(staffDeptId, {
                            id: staffDeptId,
                            sales: 0,
                            profit: 0,
                            assignmentCount: 0
                        });
                    }
                    const dept = departmentStats.get(staffDeptId);
                    dept.sales += sales * 0.5;
                    dept.profit += profit * 0.5;
                    dept.assignmentCount++;
                }
            }
        });
        companyStats.grossMarginRate = companyStats.totalSales > 0 ? Math.round(companyStats.totalProfit / companyStats.totalSales * 100) : 0;
    }
    // 部署情報を取得して部署統計と結合
    const { data: departments } = await supabase.from('departments').select('*').order('name');
    const departmentData = departments?.map((dept)=>({
            id: dept.id,
            name: dept.name,
            sales: departmentStats.get(dept.id)?.sales || 0,
            profit: departmentStats.get(dept.id)?.profit || 0,
            assignmentCount: departmentStats.get(dept.id)?.assignmentCount || 0,
            grossMarginRate: departmentStats.get(dept.id)?.sales > 0 ? Math.round(departmentStats.get(dept.id).profit / departmentStats.get(dept.id).sales * 100) : 0
        })) || [];
    // 最近のアサインを取得（全社）
    const { data: recentAssignments } = await supabase.from('assignments').select(`
      *,
      project_manager:profiles!assignments_project_manager_id_fkey(display_name),
      staff_manager:profiles!assignments_staff_manager_id_fkey(display_name)
    `).order('created_at', {
        ascending: false
    }).limit(10);
    // 過去6ヶ月の月次データを取得（全社）
    const monthlyData = [];
    for(let i = 5; i >= 0; i--){
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() - i);
        const targetMonth = targetDate.toISOString().slice(0, 7) + '-01';
        const { data: monthAssignments } = await supabase.from('assignments').select('*').eq('work_month', targetMonth);
        let monthSales = 0;
        let monthProfit = 0;
        if (monthAssignments) {
            monthAssignments.forEach((assignment)=>{
                const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
                const sales = assignment.daily_rate * workDays;
                const cost = assignment.cost_rate * workDays;
                const profit = sales - cost;
                monthSales += sales;
                monthProfit += profit;
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
    // 個人の実績も取得（比較用）
    const { data: userAssignments } = await supabase.from('assignments').select('*').eq('work_month', currentMonth).or(`project_manager_id.eq.${user.id},staff_manager_id.eq.${user.id}`);
    let personalStats = {
        totalSales: 0,
        totalProfit: 0,
        assignmentCount: 0
    };
    if (userAssignments) {
        userAssignments.forEach((assignment)=>{
            const workDays = assignment.project_type === 'continuous' ? assignment.work_days || 0 : assignment.work_dates?.length || 0;
            const sales = assignment.daily_rate * workDays;
            const cost = assignment.cost_rate * workDays;
            const profit = sales - cost;
            const isProjectManager = assignment.project_manager_id === user.id;
            const isStaffManager = assignment.staff_manager_id === user.id;
            if (isProjectManager && isStaffManager) {
                personalStats.totalSales += sales;
                personalStats.totalProfit += profit;
                personalStats.assignmentCount++;
            } else if (isProjectManager || isStaffManager) {
                personalStats.totalSales += sales * 0.5;
                personalStats.totalProfit += profit * 0.5;
                personalStats.assignmentCount++;
            }
        });
    }
    // 目標データを取得
    const { data: targets } = await supabase.from('targets').select('*').eq('target_month', currentMonth);
    // 全社目標
    const companyTarget = targets?.find((t)=>t.target_type === 'company') || {
        sales_target: 0,
        profit_target: 0,
        assignment_target: 0
    };
    // 部署別目標
    const departmentTargets = new Map();
    targets?.filter((t)=>t.target_type === 'department').forEach((target)=>{
        departmentTargets.set(target.target_id, {
            sales_target: target.sales_target || 0,
            profit_target: target.profit_target || 0,
            assignment_target: target.assignment_target || 0
        });
    });
    // 個人目標
    const personalTarget = targets?.find((t)=>t.target_type === 'individual' && t.target_id === user.id) || {
        sales_target: 0,
        profit_target: 0,
        assignment_target: 0
    };
    // 部署データに目標を追加
    const departmentDataWithTargets = departmentData.map((dept)=>({
            ...dept,
            salesTarget: departmentTargets.get(dept.id)?.sales_target || 0,
            profitTarget: departmentTargets.get(dept.id)?.profit_target || 0,
            assignmentTarget: departmentTargets.get(dept.id)?.assignment_target || 0,
            salesAchievement: departmentTargets.get(dept.id)?.sales_target > 0 ? Math.round(dept.sales / departmentTargets.get(dept.id).sales_target * 100) : 0,
            profitAchievement: departmentTargets.get(dept.id)?.profit_target > 0 ? Math.round(dept.profit / departmentTargets.get(dept.id).profit_target * 100) : 0,
            assignmentAchievement: departmentTargets.get(dept.id)?.assignment_target > 0 ? Math.round(dept.assignmentCount / departmentTargets.get(dept.id).assignment_target * 100) : 0
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$protected$292f$dashboard$2f$DashboardClient$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        profile: profile,
        companyStats: companyStats,
        companyTarget: companyTarget,
        departmentData: departmentDataWithTargets,
        personalStats: personalStats,
        personalTarget: personalTarget,
        recentAssignments: recentAssignments || [],
        monthlyData: monthlyData
    }, void 0, false, {
        fileName: "[project]/app/(protected)/dashboard/page.tsx",
        lineNumber: 272,
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

//# sourceMappingURL=%5Broot-of-the-server%5D__b9fd619c._.js.map