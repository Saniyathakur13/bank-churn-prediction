import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CustomerDetailPanel from "./CustomerDetailPanel";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#9122c5", "#eab308", "#ef4444"];

const AdvancedResults = ({ data }: any) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  
  // ================= NEW: State for WhatsApp message =================
  const [whatsappMessage, setWhatsappMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const perPage = 10;

  if (!data || data.length === 0) return null;

  const get = (r: any, k: string) => r[k] || "";
  const normalize = (v: any) => String(v || "").toLowerCase();

  const total = data.length;

  const high = data.filter(r => normalize(get(r, "Risk_Level")) === "high").length;
  const medium = data.filter(r => normalize(get(r, "Risk_Level")) === "medium").length;
  const low = data.filter(r => normalize(get(r, "Risk_Level")) === "low").length;

  const churn = data.filter(r => normalize(get(r, "Prediction")) === "churn").length;
  const retained = total - churn;

  // ================= SMART SEGMENTATION =================
  const segmentMap: any = {
    "High Value": 0,
    "At Risk": 0,
    "Low Activity": 0,
    "Standard": 0
  };

  data.forEach((r: any) => {
    const risk = normalize(get(r, "Risk_Level"));
    const inactivity = Number(get(r, "Months_Inactive") || 0);
    const trans = Number(get(r, "Total_Trans_Ct") || 0);
    const clv = Number(get(r, "Customer_Lifetime_Value") || 0);

    if (risk === "high") segmentMap["At Risk"]++;
    else if (clv > 100000) segmentMap["High Value"]++;
    else if (inactivity >= 3 || trans < 30) segmentMap["Low Activity"]++;
    else segmentMap["Standard"]++;
  });

  const segmentData = Object.keys(segmentMap).map(k => ({
    name: k,
    value: segmentMap[k],
    percent: ((segmentMap[k] / total) * 100).toFixed(1)
  }));

  // ================= PRIORITY =================
  const priorityMap: any = { High: 0, Medium: 0, Low: 0 };

  data.forEach((r: any) => {
    const risk = normalize(get(r, "Risk_Level"));
    const loss = Number(get(r, "Estimated_Loss_Risk") || 0);

    if (risk === "high" && loss > 500) priorityMap["High"]++;
    else if (risk === "medium") priorityMap["Medium"]++;
    else priorityMap["Low"]++;
  });

  const priorityData = Object.keys(priorityMap).map(k => ({
    name: k,
    value: priorityMap[k],
    percent: ((priorityMap[k] / total) * 100).toFixed(1)
  }));

  // ================= NEW FEATURE 1: Churn Countdown Timer =================
  const getChurnCountdown = (customer: any) => {
    const inactivity = Number(get(customer, "Months_Inactive") || 0);
    const riskScore = Number(get(customer, "Risk_Score") || 0);
    
    if (riskScore >= 80) return { days: 7, urgency: "Critical", color: "red" };
    if (inactivity >= 6) return { days: 15, urgency: "Very High", color: "orange" };
    if (inactivity >= 3) return { days: 30, urgency: "High", color: "orange" };
    if (riskScore >= 60) return { days: 45, urgency: "Medium", color: "yellow" };
    return { days: 90, urgency: "Low", color: "green" };
  };

  // ================= NEW FEATURE 2: Retention Budget Allocator =================
  const calculateRetentionBudget = (customer: any) => {
    const estimatedLoss = Number(get(customer, "Estimated_Loss_Risk") || 0);
    const riskScore = Number(get(customer, "Risk_Score") || 0);
    
    let budgetPercentage = 0.3; // Default 30%
    if (riskScore > 80) budgetPercentage = 0.5; // High risk: spend 50%
    if (riskScore < 30) budgetPercentage = 0.1; // Low risk: spend 10%
    
    const suggestedBudget = Math.round(estimatedLoss * budgetPercentage);
    const recommendedAction = suggestedBudget > 10000 ? "Premium Offer" : 
                              suggestedBudget > 5000 ? "Cashback Offer" : "SMS Campaign";
    
    return { suggestedBudget, recommendedAction, budgetPercentage: Math.round(budgetPercentage * 100) };
  };

  // ================= NEW FEATURE 3: WhatsApp Message Generator =================
  const generateWhatsAppMessage = (customer: any) => {
    const customerId = get(customer, "CLIENTNUM");
    const riskLevel = get(customer, "Risk_Level");
    const segment = get(customer, "Customer_Segment");
    const budget = calculateRetentionBudget(customer);
    
    let message = "";
    
    if (riskLevel === "high") {
      message = `🚨 *URGENT: Bank Retention Alert* 🚨\n\nDear Customer [${customerId}],\n\nWe have noticed your account activity has decreased significantly. As a valued customer, we don't want to lose you!\n\n✨ *Exclusive Offer Just For You:*\n• ₹${budget.suggestedBudget.toLocaleString()} cashback on your next transaction\n• Free upgrade to Premium Banking for 3 months\n• Dedicated relationship manager\n\n⏰ *Offer expires in 7 days*\n\nReply YES to claim this offer. We value your relationship! ❤️`;
    } else if (segment === "Low Activity") {
      message = `📱 *We Miss You!* 📱\n\nDear Customer [${customerId}],\n\nYou haven't used your card in a while. Here's a special welcome back offer:\n\n🎁 *₹${budget.suggestedBudget.toLocaleString()} cashback* on your next transaction of ₹1000+\n\nUse code: WELCOMEBACK\n\nValid for 15 days. We can't wait to serve you again! 😊`;
    } else if (segment === "High Value") {
      message = `👑 *Premium Customer Exclusive* 👑\n\nDear Valued Customer [${customerId}],\n\nYou are one of our most valued customers. As a token of appreciation:\n\n🎟️ *Complimentary Airport Lounge Access* - 2 passes\n💰 *₹${budget.suggestedBudget.toLocaleString()} Reward Points* added to your account\n📞 *Priority Customer Care* - Dedicated hotline\n\nYour loyalty means the world to us! 🌟`;
    } else {
      message = `💝 *Special Offer Just For You* 💝\n\nDear Customer [${customerId}],\n\nWe value your relationship with us. Here's a special gift:\n\n🎁 *₹${budget.suggestedBudget.toLocaleString()} cashback* on your next transaction\n⭐ Double reward points for next 30 days\n\nUse code: THANKYOU30\n\nThank you for being with us! 🙏`;
    }
    
    return message;
  };
  
  const handleGenerateWhatsApp = (customer: any) => {
    const message = generateWhatsAppMessage(customer);
    setWhatsappMessage(message);
    setCopied(false);
    // Auto hide after 5 seconds
    setTimeout(() => setWhatsappMessage(null), 5000);
  };
  
  const copyToClipboard = () => {
    if (whatsappMessage) {
      navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ================= NEW FEATURE: AI Churn Risk Forecast =================
  const forecastData = data.map((customer: any) => {
    const currentRisk = Number(get(customer, "Risk_Score") || 0);
    const inactivity = Number(get(customer, "Months_Inactive") || 0);
    const transCount = Number(get(customer, "Total_Trans_Ct") || 0);
    const utilization = Number(get(customer, "Utilization_Ratio") || 0);
    
    let forecast1 = currentRisk;
    let forecast2 = currentRisk;
    let forecast3 = currentRisk;
    let trend = "stable";
    
    if (inactivity > 3) {
      forecast1 = Math.min(100, currentRisk + 5);
      forecast2 = Math.min(100, currentRisk + 12);
      forecast3 = Math.min(100, currentRisk + 20);
      trend = "increasing";
    } else if (transCount < 20) {
      forecast1 = Math.min(100, currentRisk + 3);
      forecast2 = Math.min(100, currentRisk + 8);
      forecast3 = Math.min(100, currentRisk + 15);
      trend = "increasing";
    } else if (utilization < 20) {
      forecast1 = Math.min(100, currentRisk + 2);
      forecast2 = Math.min(100, currentRisk + 6);
      forecast3 = Math.min(100, currentRisk + 10);
      trend = "slightly increasing";
    } else if (currentRisk < 30) {
      forecast1 = Math.max(0, currentRisk - 2);
      forecast2 = Math.max(0, currentRisk - 5);
      forecast3 = Math.max(0, currentRisk - 8);
      trend = "decreasing";
    }
    
    return {
      customerId: get(customer, "CLIENTNUM"),
      currentRisk,
      forecastMonth1: Math.round(forecast1),
      forecastMonth2: Math.round(forecast2),
      forecastMonth3: Math.round(forecast3),
      trend,
      countdown: getChurnCountdown(customer),
      budget: calculateRetentionBudget(customer)
    };
  });
  
  const topForecastCustomers = [...forecastData]
    .sort((a, b) => b.forecastMonth3 - a.forecastMonth3)
    .slice(0, 5);
  
  const avgForecast = {
    month1: Math.round(forecastData.reduce((sum, f) => sum + f.forecastMonth1, 0) / total),
    month2: Math.round(forecastData.reduce((sum, f) => sum + f.forecastMonth2, 0) / total),
    month3: Math.round(forecastData.reduce((sum, f) => sum + f.forecastMonth3, 0) / total)
  };
  
  const increasingRiskCount = forecastData.filter(f => f.trend === "increasing").length;
  const increasingRiskPercent = ((increasingRiskCount / total) * 100).toFixed(1);
  
  // Total potential savings from retention budget allocator
  const totalPotentialSavings = forecastData.reduce((sum, f) => sum + f.budget.suggestedBudget, 0);

  // ================= KPIs =================
  const avgRisk = data.reduce((sum: number, r: any) => sum + Number(get(r, "Risk_Score") || 0), 0) / total;
  const highPercent = ((high / total) * 100).toFixed(1);
  const engagement = data.reduce((sum: number, r: any) => sum + Number(get(r, "Total_Trans_Ct") || 0), 0) / total;

  // ================= FILTER =================
  let filtered = data.filter((r: any) =>
    String(get(r, "CLIENTNUM")).includes(search)
  );

  if (riskFilter !== "all") {
    filtered = filtered.filter(
      r => normalize(get(r, "Risk_Level")) === riskFilter
    );
  }

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const getRiskColor = (level: string) => {
    if (level === "high") return "bg-red-100 text-red-700 font-semibold";
    if (level === "medium") return "bg-yellow-100 text-yellow-700 font-semibold";
    return "bg-green-100 text-green-700 font-semibold";
  };
  
  const getTrendIcon = (trend: string) => {
    if (trend === "increasing") return "📈";
    if (trend === "slightly increasing") return "📈";
    if (trend === "decreasing") return "📉";
    return "➡️";
  };
  
  const getTrendColor = (trend: string) => {
    if (trend === "increasing") return "text-red-600";
    if (trend === "slightly increasing") return "text-orange-500";
    if (trend === "decreasing") return "text-green-600";
    return "text-gray-500";
  };
  
  const getUrgencyColor = (urgency: string) => {
    if (urgency === "Critical") return "bg-red-600 text-white";
    if (urgency === "Very High") return "bg-orange-500 text-white";
    if (urgency === "High") return "bg-orange-300 text-black";
    if (urgency === "Medium") return "bg-yellow-200 text-black";
    return "bg-green-200 text-black";
  };

  const renderLabel = ({ name, percent }: any) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="space-y-6 mt-6">

      {/* WhatsApp Message Popup */}
      {whatsappMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white rounded-lg shadow-xl border-l-4 border-green-500 w-96 max-w-full">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-green-600">📱 WhatsApp Message Ready</h4>
              <button onClick={() => setWhatsappMessage(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap max-h-64 overflow-auto">
              {whatsappMessage}
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              {copied ? "✅ Copied!" : "📋 Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Avg Risk Score</p>
            <p className="text-2xl font-bold">{avgRisk.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">High Risk %</p>
            <p className="text-2xl font-bold text-red-600">{highPercent}%</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Avg Transactions</p>
            <p className="text-2xl font-bold text-purple-600">{engagement.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Retained</p>
            <p className="text-2xl font-bold text-green-600">{retained}</p>
          </CardContent>
        </Card>
        {/* NEW KPI: Potential Savings */}
        <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">💰 Potential Savings</p>
            <p className="text-2xl font-bold text-indigo-700">₹{totalPotentialSavings.toLocaleString()}</p>
            <p className="text-xs text-gray-400">If retention actions applied</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW FEATURE SECTION: Churn Countdown + Retention Budget + WhatsApp */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Feature 1: Churn Countdown Timer Card */}
        <Card className="shadow-md border-t-4 border-t-red-500">
          <CardContent className="p-4">
            <h3 className="text-md font-bold mb-3">⏰ Churn Countdown Timer</h3>
            <p className="text-xs text-gray-500 mb-3">Days left before customer churns (if no action)</p>
            <div className="space-y-2 max-h-64 overflow-auto">
              {forecastData.slice(0, 5).map((cust, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{cust.customerId}</span>
                  <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getUrgencyColor(cust.countdown.urgency)}`}>
                      {cust.countdown.days} days
                    </span>
                  </div>
                  <span className={`text-xs font-semibold ${cust.countdown.color === "red" ? "text-red-600" : "text-orange-500"}`}>
                    {cust.countdown.urgency}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">⚠️ Critical: 7 days or less remaining</p>
          </CardContent>
        </Card>

        {/* Feature 2: Retention Budget Allocator Card */}
        <Card className="shadow-md border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <h3 className="text-md font-bold mb-3">💰 Retention Budget Allocator</h3>
            <p className="text-xs text-gray-500 mb-3">Suggested spend to save each customer</p>
            <div className="space-y-2 max-h-64 overflow-auto">
              {forecastData.slice(0, 5).map((cust, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{cust.customerId}</span>
                  <span className="font-bold text-green-600">₹{cust.budget.suggestedBudget.toLocaleString()}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full">
                    {cust.budget.budgetPercentage}% of loss
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-xs font-semibold">💡 Rule: Spend 30-50% of estimated loss</p>
              <p className="text-xs text-gray-500">High risk = higher budget (50%) | Low risk = lower budget (10%)</p>
            </div>
          </CardContent>
        </Card>

        {/* Feature 3: WhatsApp Message Generator Card */}
        <Card className="shadow-md border-t-4 border-t-green-500">
          <CardContent className="p-4">
            <h3 className="text-md font-bold mb-3">📱 WhatsApp Message Generator</h3>
            <p className="text-xs text-gray-500 mb-3">Ready-to-send retention messages</p>
            <div className="space-y-2 max-h-64 overflow-auto">
              {forecastData.slice(0, 5).map((cust, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-sm">{cust.customerId}</span>
                  <button
                    onClick={() => {
                      const customer = data.find((c: any) => get(c, "CLIENTNUM") === cust.customerId);
                      handleGenerateWhatsApp(customer);
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                  >
                    📤 Generate
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">Click Generate → Copy message → Send on WhatsApp</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW FEATURE: AI Churn Risk Forecast Section */}
      <Card className="shadow-md border-t-4 border-t-indigo-500">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-indigo-700">🔮 AI Churn Risk Forecast</h3>
              <p className="text-xs text-gray-500">Predicts churn probability trend for next 3 months</p>
            </div>
            <div className="bg-indigo-100 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-indigo-700">⚠️ {increasingRiskPercent}% customers show increasing risk trend</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Average Risk Forecast (All Customers)</p>
              <div className="flex items-end gap-4 h-40">
                <div className="flex-1 text-center">
                  <div className="bg-indigo-200 rounded-t-lg mx-auto" style={{ height: `${avgForecast.month1 * 1.5}px`, width: "60px" }}>
                    <div className="bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${avgForecast.month1 * 1.5}px`, width: "60px" }}></div>
                  </div>
                  <p className="text-sm font-bold mt-2">{avgForecast.month1}</p>
                  <p className="text-xs text-gray-500">Month 1</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-orange-200 rounded-t-lg mx-auto" style={{ height: `${avgForecast.month2 * 1.5}px`, width: "60px" }}>
                    <div className="bg-orange-500 rounded-t-lg transition-all" style={{ height: `${avgForecast.month2 * 1.5}px`, width: "60px" }}></div>
                  </div>
                  <p className="text-sm font-bold mt-2">{avgForecast.month2}</p>
                  <p className="text-xs text-gray-500">Month 2</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="bg-red-200 rounded-t-lg mx-auto" style={{ height: `${avgForecast.month3 * 1.5}px`, width: "60px" }}>
                    <div className="bg-red-500 rounded-t-lg transition-all" style={{ height: `${avgForecast.month3 * 1.5}px`, width: "60px" }}></div>
                  </div>
                  <p className="text-sm font-bold mt-2">{avgForecast.month3}</p>
                  <p className="text-xs text-gray-500">Month 3</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Top 5 High-Risk Forecasts</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Customer ID</th>
                    <th className="p-2 text-center">Current</th>
                    <th className="p-2 text-center">Month 3</th>
                    <th className="p-2 text-left">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topForecastCustomers.map((cust, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 font-mono text-sm">{cust.customerId}</td>
                      <td className="p-2 text-center">{cust.currentRisk}</td>
                      <td className="p-2 text-center font-bold text-red-600">{cust.forecastMonth3}</td>
                      <td className={`p-2 ${getTrendColor(cust.trend)}`}>
                        {getTrendIcon(cust.trend)} {cust.trend}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            <span className="font-semibold">🔍 How it works:</span> Forecast based on current risk score + inactivity months + transaction frequency. Customers with &gt;3 months inactivity show +20% risk increase in 3 months.
          </div>
        </CardContent>
      </Card>

      {/* CHARTS - Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-md font-semibold mb-3">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Low", value: low },
                    { name: "Medium", value: medium },
                    { name: "High", value: high }
                  ]}
                  dataKey="value"
                  label={renderLabel}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {[low, medium, high].map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-md font-semibold mb-3">Churn vs Retained</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Churn", value: churn },
                    { name: "Retained", value: retained }
                  ]}
                  dataKey="value"
                  label={renderLabel}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  <Cell fill="#210a34" />
                  <Cell fill="#c52269" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SEGMENT TABLE */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-md font-semibold mb-3">📊 Customer Segmentation Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 text-left font-semibold">Segment</th>
                  <th className="p-3 text-center font-semibold">Customers</th>
                  <th className="p-3 text-center font-semibold">Percentage</th>
                  <th className="p-3 text-left font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {segmentData.map((s: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-center">{s.value}</td>
                    <td className="p-3 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {s.percent}%
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {s.name === "High Value" && "💰 High revenue & loyal customers"}
                      {s.name === "At Risk" && "⚠️ High probability of churning"}
                      {s.name === "Low Activity" && "📉 Inactive or low transaction users"}
                      {s.name === "Standard" && "📌 Normal behavior pattern"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* PRIORITY TABLE */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-md font-semibold mb-3">🎯 Retention Priority Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 text-left font-semibold">Priority Level</th>
                  <th className="p-3 text-center font-semibold">Customers</th>
                  <th className="p-3 text-center font-semibold">Percentage</th>
                  <th className="p-3 text-left font-semibold">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {priorityData.map((p: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        p.name === "High" ? "bg-red-100 text-red-700" :
                        p.name === "Medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {p.name}
                      </span>
                    </td>
                    <td className="p-3 text-center">{p.value}</td>
                    <td className="p-3 text-center">
                      <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                        {p.percent}%
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {p.name === "High" && "🚨 Immediate relationship manager contact + loyalty offer"}
                      {p.name === "Medium" && "📧 Targeted email campaign + personalized offers"}
                      {p.name === "Low" && "✅ Monitor only - no immediate action needed"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FILTER CONTROLS */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          placeholder="🔍 Search by Customer ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          {["all", "high", "medium", "low"].map(l => (
            <button
              key={l}
              onClick={() => { setRiskFilter(l); setPage(1); }}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-all ${
                riskFilter === l 
                  ? "bg-indigo-600 text-white" 
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN RESULTS TABLE */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <h3 className="text-md font-semibold mb-3">📋 Customer Risk Assessment Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 text-left font-semibold">Customer ID</th>
                  <th className="p-3 text-center font-semibold">Risk Level</th>
                  <th className="p-3 text-left font-semibold">Segment</th>
                  <th className="p-3 text-center font-semibold">Priority</th>
                  <th className="p-3 text-right font-semibold">Est. Loss (₹)</th>
                  <th className="p-3 text-center font-semibold">WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r: any, i: number) => {
                  const risk = normalize(get(r, "Risk_Level"));
                  const riskLevel = get(r, "Risk_Level");
                  const riskLevelDisplay = riskLevel ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : "Unknown";
                  
                  return (
                    <tr 
                      key={i} 
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono text-sm font-medium" onClick={() => setSelectedCustomer(r)}>{get(r, "CLIENTNUM")}</td>
                      <td className="p-3 text-center" onClick={() => setSelectedCustomer(r)}>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(risk)}`}>
                          {riskLevelDisplay}
                        </span>
                      </td>
                      <td className="p-3" onClick={() => setSelectedCustomer(r)}>{get(r, "Customer_Segment") || "—"}</td>
                      <td className="p-3 text-center" onClick={() => setSelectedCustomer(r)}>
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">
                          {get(r, "Retention_Priority") || "—"}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold" onClick={() => setSelectedCustomer(r)}>
                        ₹{Number(get(r, "Estimated_Loss_Risk") || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateWhatsApp(r);
                          }}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                        >
                          📤 Send
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-5 pt-3 border-t">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                page === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                page === totalPages 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Next →
            </button>
          </div>
        </CardContent>
      </Card>

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedCustomer(null)} />
          <CustomerDetailPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        </>
      )}
    </div>
  );
};
// Add this inside your AdvancedResults.tsx or main dashboard component
<button
  onClick={() => {
    localStorage.removeItem("isLoggedIn");
    window.location.reload(); // Or use a state callback
  }}
  className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg text-sm z-50"
>
  Logout
</button>

export default AdvancedResults;