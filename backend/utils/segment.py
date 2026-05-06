def get_customer_segment(row, risk_level):
    """
    Classify customer into business-friendly segments.
    """

    credit_limit = row.get('Credit_Limit', 0)
    total_trans_amt = row.get('Total_Trans_Amt', 0)
    total_trans_ct = row.get('Total_Trans_Ct', 0)
    months_inactive = row.get('Months_Inactive', 0)
    relationship_count = row.get('Total_Relationship_Count', 0)

    # High-value risky customer
    if risk_level == "High" and credit_limit > 10000:
        return "High-Value Risk Customer"

    # Silent but risky
    if risk_level == "High" and months_inactive >= 3 and total_trans_ct < 45:
        return "Silent Risk Customer"

    # Low activity customer
    if months_inactive >= 3 or total_trans_ct < 40:
        return "Low Activity Customer"

    # Loyal active customer
    if risk_level == "Low" and total_trans_amt > 4000 and relationship_count >= 4:
        return "Loyal Customer"

    # Default
    return "Standard Customer"