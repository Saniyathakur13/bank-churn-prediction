def apply_retention_simulation(row):
    """
    Simulate positive customer engagement changes.
    Returns a modified copy of the customer row.
    """
    simulated = row.copy()

    # Reduce inactivity if possible
    if 'Months_Inactive' in simulated:
        simulated['Months_Inactive'] = max(0, simulated['Months_Inactive'] - 1)

    # Reduce contact issues if possible
    if 'Contacts_Count' in simulated:
        simulated['Contacts_Count'] = max(0, simulated['Contacts_Count'] - 1)

    # Improve transaction count
    if 'Total_Trans_Ct' in simulated:
        simulated['Total_Trans_Ct'] = simulated['Total_Trans_Ct'] + 10

    # Improve transaction amount
    if 'Total_Trans_Amt' in simulated:
        simulated['Total_Trans_Amt'] = simulated['Total_Trans_Amt'] + 500

    # Improve card usage slightly
    if 'Avg_Utilization_Ratio' in simulated:
        simulated['Avg_Utilization_Ratio'] = min(1.0, simulated['Avg_Utilization_Ratio'] + 0.05)

    return simulated