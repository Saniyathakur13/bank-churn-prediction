import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const DemoInstructions = () => {
  const [activeTab, setActiveTab] = useState("instructions");

  // Preview of your CSV (first few lines)
  const sampleCSVPreview = `customer_id,age,gender,marital_status,income_category,credit_limit,card_category,total_transaction_amount,total_transaction_count,months_inactive,months_active,utilization_ratio,relationship_count,contacts_count
CUST001,34,Male,Married,₹40L-₹60L,500000,Platinum,425000,45,0,12,85.0,6,1
CUST002,28,Female,Single,₹20L-₹40L,250000,Gold,150000,28,2,10,60.0,4,2
CUST003,45,Male,Married,₹60L-₹80L,800000,Platinum,720000,62,0,12,90.0,7,0`;

  // Function to download your own CSV file
  const downloadSampleCSV = () => {
    const link = document.createElement("a");
    link.href = "/sample_data.csv";
    link.download = "sample_data.csv";
    link.click();
  };

  return (
    <section className="py-16 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground dark:text-foreground mb-3">
            📋 How to Use ChurnPredict
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to get AI-powered churn predictions for your bank customers
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("instructions")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "instructions"
                ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            📖 Instructions
          </button>
          <button
            onClick={() => setActiveTab("sample")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "sample"
                ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            📄 Sample CSV
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "features"
                ? "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground dark:bg-secondary dark:text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            ✨ Features
          </button>
        </div>

        {/* Instructions Tab */}
        {activeTab === "instructions" && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">1️⃣</span>
                </div>
                <h3 className="font-bold text-lg text-foreground dark:text-foreground mb-2">Prepare Your CSV</h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                  Export customer data from your banking system in CSV format with required columns
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">2️⃣</span>
                </div>
                <h3 className="font-bold text-lg text-foreground dark:text-foreground mb-2">Upload File</h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                  Click the upload button and select your CSV file. We'll validate it automatically
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">3️⃣</span>
                </div>
                <h3 className="font-bold text-lg text-foreground dark:text-foreground mb-2">Get Insights</h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                  View predictions, risk scores, segments, and recommendations instantly
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sample CSV Tab */}
        {activeTab === "sample" && (
          <Card className="shadow-lg bg-card dark:bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h3 className="font-bold text-lg text-foreground dark:text-foreground">📄 Sample CSV Format</h3>
                <button
                  onClick={downloadSampleCSV}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  ⬇️ Download Sample CSV
                </button>
              </div>
              <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                  {sampleCSVPreview}
                </pre>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ <span className="font-semibold">Required Columns:</span> customer_id, age, gender, credit_limit, total_transaction_amount, months_inactive, utilization_ratio
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">🔮</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">Churn Prediction</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">ML model predicts which customers are likely to leave</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">📊</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">Risk Scoring (0-100)</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Each customer gets a risk score and level (Low/Medium/High)</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">🎯</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">Customer Segmentation</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">6 segments: High Value, At Risk, Low Activity, Standard, etc.</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">💡</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">Smart Recommendations</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Automated retention strategies for each customer</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">💰</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">Financial Loss Estimation</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Calculate potential revenue loss per customer</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow bg-card dark:bg-card">
              <CardContent className="p-5">
                <div className="text-2xl mb-3">🔄</div>
                <h3 className="font-bold text-foreground dark:text-foreground mb-2">What-If Simulation</h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Test retention strategies before implementing</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default DemoInstructions;