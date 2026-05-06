def get_top_reasons(row):
    """
    Generate top churn reasons based on customer behavior.
    Returns exactly 3 reasons.
    """

    reasons = []

    # Inactivity
    if row.get('Months_Inactive', 0) >= 3:
        reasons.append("High inactivity in recent months")

    # Low transactions
    if row.get('Total_Trans_Ct', 999) < 45:
        reasons.append("Low transaction count")

    # Low transaction amount
    if row.get('Total_Trans_Amt', 999999) < 3000:
        reasons.append("Low transaction amount")

    # High credit utilization
    if row.get('Avg_Utilization_Ratio', 0) > 0.6:
        reasons.append("High credit utilization ratio")

    # High revolving balance
    if row.get('Total_Revolving_Bal', 0) > 1500:
        reasons.append("High revolving balance")

    # Too many contact attempts
    if row.get('Contacts_Count', 0) >= 4:
        reasons.append("Frequent customer service contacts")

    # Low relationship count
    if row.get('Total_Relationship_Count', 99) <= 2:
        reasons.append("Low product relationship with bank")

    # Fallback reasons if not enough detected
    fallback_reasons = [
        "Moderate behavioral churn indicators detected",
        "Customer engagement pattern suggests possible churn risk",
        "Transaction and account activity require attention"
    ]

    for reason in fallback_reasons:
        if len(reasons) < 3:
            reasons.append(reason)

    # Ensure exactly 3 reasons
    reasons = reasons[:3]

    return reasons