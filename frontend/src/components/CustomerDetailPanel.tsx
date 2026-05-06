import React from "react";

const CustomerDetailPanel = ({ customer, onClose }: any) => {
  if (!customer) return null;

  const formatINR = (val: any) =>
    Number(val || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  const getRiskColor = (level: string) => {
    if (level === "High") return "bg-red-100 text-red-600";
    if (level === "Medium") return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  // 🔥 FALLBACK ACTION ENGINE (VERY IMPORTANT)
  const generateActions = () => {
    const actions = [];

    if (customer.Months_Inactive >= 3)
      actions.push("📞 Immediate relationship manager call");

    if (customer.Total_Trans_Ct < 30)
      actions.push("💳 Offer cashback on transactions");

    if (customer.Avg_Utilization_Ratio < 0.2)
      actions.push("🎁 Introduce reward-based usage incentives");

    if (customer.Risk_Level === "High")
      actions.push("🚨 Provide fee waiver / limit increase");

    return actions.length > 0 ? actions : ["Maintain engagement"];
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[430px] bg-white shadow-2xl p-6 overflow-y-auto z-50">

      {/* HEADER */}
      <div className="flex justify-between mb-5">
        <h2 className="text-xl font-bold">
          AI Retention Advisor
        </h2>
        <button onClick={onClose}>✕</button>
      </div>

      {/* BASIC */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <p><b>ID:</b> {customer.CLIENTNUM}</p>
        <p><b>Age:</b> {customer.Age}</p>
        <p><b>Segment:</b> {customer.Customer_Segment}</p>
      </div>

      {/* RISK */}
      <div className="mb-4">
        <span className={`px-3 py-1 rounded ${getRiskColor(customer.Risk_Level)}`}>
          {customer.Risk_Level}
        </span>
        <p>Risk Score: {customer.Risk_Score}</p>
        <p>Churn Probability: {(customer.Churn_Probability * 100).toFixed(1)}%</p>
      </div>

      {/* WHY CHURN */}
      <div className="bg-red-50 p-4 rounded mb-4">
        <h3 className="font-semibold">⚠️ Why Customer is Churning</h3>
        <ul className="text-red-600 mt-2">
          <li>• {customer.Top_Reason_1 || "Low engagement"}</li>
          <li>• {customer.Top_Reason_2 || "Reduced activity"}</li>
          <li>• {customer.Top_Reason_3 || "Service dissatisfaction"}</li>
        </ul>
      </div>

      {/* ACTION PLAN */}
      <div className="bg-blue-50 p-4 rounded mb-4">
        <h3 className="font-semibold">📌 Recommended Actions</h3>
        <ul className="mt-2 text-blue-700">
          {generateActions().map((a, i) => (
            <li key={i}>• {a}</li>
          ))}
        </ul>
      </div>

      {/* IMPACT */}
      <div className="bg-green-50 p-4 rounded mb-4">
        <h3 className="font-semibold">📈 Expected Impact</h3>
        <p>Current Risk: {customer.Risk_Score}</p>
        <p>Potential Reduction: 15–30%</p>
        <p className="text-green-600 font-bold">
          Possible Savings: {formatINR(customer.Estimated_Loss_Risk * 0.3)}
        </p>
      </div>

      {/* VALUE */}
      <div className="bg-purple-50 p-4 rounded mb-4">
        <p>Customer Value (CLV): {formatINR(customer.Customer_Lifetime_Value)}</p>
        <p>Estimated Loss: {formatINR(customer.Estimated_Loss_Risk)}</p>
      </div>

      {/* PRIORITY */}
      <div className="bg-orange-50 p-3 rounded">
        <b>Retention Priority:</b> {customer.Retention_Priority || customer.Risk_Level}
      </div>

    </div>
  );
};

export default CustomerDetailPanel;