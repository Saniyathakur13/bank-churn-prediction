def get_recommendation(row, risk_level):
    """
    Generate retention recommendation based on risk level and behavior.
    """

    months_inactive = row.get('Months_Inactive', 0)
    trans_count = row.get('Total_Trans_Ct', 0)
    trans_amt = row.get('Total_Trans_Amt', 0)
    utilization = row.get('Avg_Utilization_Ratio', 0)
    contacts = row.get('Contacts_Count', 0)
    credit_limit = row.get('Credit_Limit', 0)

    # High risk rules
    if risk_level == "High":
        if months_inactive >= 3 and trans_count < 45:
            return "Launch re-engagement campaign with cashback or reward incentives"
        elif utilization > 0.6:
            return "Offer credit counseling and personalized card usage benefits"
        elif contacts >= 4:
            return "Assign relationship manager to resolve service concerns quickly"
        elif credit_limit > 10000:
            return "Provide premium retention offer for high-value customer"
        else:
            return "Initiate priority retention outreach with personalized offer"

    # Medium risk rules
    if risk_level == "Medium":
        if trans_amt < 3000:
            return "Send targeted spending offers to improve transaction activity"
        elif months_inactive >= 2:
            return "Run engagement reminders and limited-time loyalty rewards"
        else:
            return "Monitor customer behavior and provide personalized promotions"

    # Low risk rules
    return "Maintain regular engagement through loyalty benefits and periodic offers"