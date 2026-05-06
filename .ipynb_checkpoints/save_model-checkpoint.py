import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from imblearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import ExtraTreesClassifier
import joblib

# -----------------------------
# Load and preprocess data
# -----------------------------
data = pd.read_csv('input/credit-card-customers/BankChurners.csv')

# Rename columns
old_names = data.columns
new_names = [
    'Clientnum', 'Attrition', 'Age', 'Gender', 'Dependent_count', 'Education',
    'Marital_Status', 'Income', 'Card_Category', 'Months_on_book',
    'Total_Relationship_Count', 'Months_Inactive', 'Contacts_Count',
    'Credit_Limit', 'Total_Revolving_Bal', 'Avg_Open_To_Buy',
    'Total_Amt_Chng_Q4_Q1', 'Total_Trans_Amt', 'Total_Trans_Ct',
    'Total_Ct_Chng_Q4_Q1', 'Avg_Utilization_Ratio', 'Naive_Bayes_1',
    'Naive_Bayes_2'
]
data.rename(columns=dict(zip(old_names, new_names)), inplace=True)

# Select relevant features (drop Clientnum, Naive_Bayes cols, Avg_Open_To_Buy)
features = [
    'Age', 'Gender', 'Dependent_count', 'Education', 'Marital_Status', 'Income',
    'Card_Category', 'Months_on_book', 'Total_Relationship_Count',
    'Months_Inactive', 'Contacts_Count', 'Credit_Limit', 'Total_Revolving_Bal',
    'Total_Amt_Chng_Q4_Q1', 'Total_Trans_Amt', 'Total_Trans_Ct',
    'Total_Ct_Chng_Q4_Q1', 'Avg_Utilization_Ratio', 'Attrition'
]
data = data[features]

# Split X and y
X = data.drop(columns=['Attrition'])
y = data['Attrition'].map({'Existing Customer': 0, 'Attrited Customer': 1})

# Define categorical and numerical columns
categorical_cols = ['Gender', 'Education', 'Marital_Status', 'Income', 'Card_Category']
numerical_cols = [
    'Age', 'Dependent_count', 'Months_on_book', 'Total_Relationship_Count',
    'Months_Inactive', 'Contacts_Count', 'Credit_Limit', 'Total_Revolving_Bal',
    'Total_Amt_Chng_Q4_Q1', 'Total_Trans_Amt', 'Total_Trans_Ct',
    'Total_Ct_Chng_Q4_Q1', 'Avg_Utilization_Ratio'
]

# -----------------------------
# Preprocessing: OneHotEncoder + StandardScaler
# -----------------------------
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ]
)

# -----------------------------
# Build pipeline
# -----------------------------
pipeline = Pipeline([
    ('preprocessing', preprocessor),
    ('smote', SMOTE(random_state=0)),
    ('classifier', ExtraTreesClassifier(n_estimators=305, random_state=42))
])

# Fit pipeline
pipeline.fit(X, y)

# -----------------------------
# Save trained model
# -----------------------------
joblib.dump(pipeline, 'backend/model.pkl')

# -----------------------------
# Save example input/output
# -----------------------------
example_input = X.head(5)
example_input.to_csv('backend/example_input.csv', index=False)

example_output = example_input.copy()
example_output['Prediction'] = [
    'Not Churn' if pred == 0 else 'Churn'
    for pred in pipeline.predict(example_input)
]
example_output.to_csv('backend/example_output.csv', index=False)

print("✅ Model training complete. Model and examples saved in backend/")
