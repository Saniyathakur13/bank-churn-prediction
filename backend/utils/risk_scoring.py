import pandas as pd


def safe_float(value, default=0):
    try:
        return float(value)
    except:
        return default


# =====================
# RISK SCORE
# =====================
def calculate_risk_score(row):
    prob = safe_float(row.get("Churn_Probability", 0))
    inactive = safe_float(row.get("Months_Inactive", 0))
    trans = safe_float(row.get("Total_Trans_Ct", 0))

    score = prob * 50

    if inactive >= 4:
        score += 20
    elif inactive >= 2:
        score += 10

    if trans < 20:
        score += 20
    elif trans < 50:
        score += 10

    return min(100, round(score, 2))


def assign_risk_level(score):
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    return "Low"


# =====================
# HEALTH SCORE
# =====================
def calculate_health_score(row):
    return 100 - safe_float(row.get("Risk_Score", 0))


# =====================
# CLV
# =====================
def calculate_clv(row):
    amt = safe_float(row.get("Total_Trans_Amt", 0))
    return round(amt * 1.5, 2)


# =====================
# LOSS
# =====================
def calculate_loss(row):
    prob = safe_float(row.get("Churn_Probability", 0))
    amt = safe_float(row.get("Total_Trans_Amt", 0))
    return round(prob * amt, 2)


# =====================
# MAIN FUNCTION
# =====================
def enrich_predictions(df):

    df["Risk_Score"] = df.apply(calculate_risk_score, axis=1)
    df["Risk_Level"] = df["Risk_Score"].apply(assign_risk_level)

    df["Customer_Health_Score"] = df.apply(calculate_health_score, axis=1)
    df["Customer_Lifetime_Value"] = df.apply(calculate_clv, axis=1)
    df["Estimated_Loss_Risk"] = df.apply(calculate_loss, axis=1)

    df["Top_Reason_1"] = "Low activity"
    df["Top_Reason_2"] = "Low transactions"
    df["Top_Reason_3"] = "Customer disengagement"

    df["Recommended_Action"] = "Run retention campaign"

    df["Customer_Segment"] = "At-Risk Customer"
    df["Retention_Priority"] = df["Risk_Level"]

    return df