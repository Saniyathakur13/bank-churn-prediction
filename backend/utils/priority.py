def get_retention_priority(row, risk_score):
    """
    Assign retention priority based on churn risk + business value.
    """

    credit_limit = row.get('Credit_Limit', 0)
    total_trans_amt = row.get('Total_Trans_Amt', 0)
    relationship_count = row.get('Total_Relationship_Count', 0)

    # Business value score (simple weighted logic)
    value_score = 0

    if credit_limit > 15000:
        value_score += 30
    elif credit_limit > 8000:
        value_score += 20
    else:
        value_score += 10

    if total_trans_amt > 8000:
        value_score += 30
    elif total_trans_amt > 4000:
        value_score += 20
    else:
        value_score += 10

    if relationship_count >= 5:
        value_score += 20
    elif relationship_count >= 3:
        value_score += 10
    else:
        value_score += 5

    # Final priority logic
    if risk_score >= 75 and value_score >= 60:
        return "Critical"
    elif risk_score >= 75:
        return "High"
    elif risk_score >= 40 and value_score >= 60:
        return "High"
    elif risk_score >= 40:
        return "Medium"
    else:
        return "Low"