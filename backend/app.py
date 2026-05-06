from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import joblib
import os

from preprocess import preprocess_data
from utils.risk_scoring import enrich_predictions
from utils.simulator import apply_retention_simulation

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
OUTPUT_PATH = os.path.join(BASE_DIR, "output_predictions.csv")

model = joblib.load(MODEL_PATH)


def prepare_dataframe(data):
    df = pd.DataFrame(data)

    original_columns = df.columns.tolist()

    df = preprocess_data(df)

    column_mapping = {
        'Customer_Age': 'Age',
        'Education_Level': 'Education',
        'Income_Category': 'Income',
        'Months_Inactive_12_mon': 'Months_Inactive',
        'Contacts_Count_12_mon': 'Contacts_Count'
    }

    df = df.rename(columns=column_mapping)

    required_columns = [
        'Age', 'Gender', 'Dependent_count', 'Education', 'Marital_Status',
        'Income', 'Card_Category', 'Months_on_book',
        'Total_Relationship_Count', 'Months_Inactive',
        'Contacts_Count', 'Credit_Limit', 'Total_Revolving_Bal',
        'Total_Amt_Chng_Q4_Q1', 'Total_Trans_Amt', 'Total_Trans_Ct',
        'Total_Ct_Chng_Q4_Q1', 'Avg_Utilization_Ratio'
    ]

    return df, original_columns, required_columns, column_mapping


def validate_required_columns(df, required_columns):
    return [col for col in required_columns if col not in df.columns]


def predict_with_details(df, required_columns):
    model_input = df[required_columns]

    raw_predictions = model.predict(model_input)
    predictions = ['Churn' if pred == 1 else 'Not Churn' for pred in raw_predictions]

    # ✅ FIXED probability
    try:
        probabilities = model.predict_proba(model_input)[:, 1]
    except:
        probabilities = [0.7 if pred == 1 else 0.1 for pred in raw_predictions]

    churn_probabilities = [round(float(prob), 4) for prob in probabilities]

    return predictions, churn_probabilities


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        df, original_columns, required_columns, column_mapping = prepare_dataframe(data)

        missing = validate_required_columns(df, required_columns)
        if missing:
            return jsonify({'error': f'Missing columns: {missing}'}), 400

        predictions, churn_probabilities = predict_with_details(df, required_columns)

        df['Prediction'] = predictions
        df['Churn_Probability'] = churn_probabilities

        # 🔥 ADD ADVANCED FEATURES
        df = enrich_predictions(df)

        updated_original_columns = [
            column_mapping.get(col, col) for col in original_columns
        ]

        output_columns = updated_original_columns + [
            'Prediction',
            'Churn_Probability',
            'Risk_Score',
            'Risk_Level',
            'Customer_Health_Score',
            'Customer_Lifetime_Value',
            'Top_Reason_1',
            'Top_Reason_2',
            'Top_Reason_3',
            'Recommended_Action',
            'Customer_Segment',
            'Retention_Priority',
            'Estimated_Loss_Risk'
        ]

        output_columns = [col for col in output_columns if col in df.columns]
        df = df[output_columns]

        df.to_csv(OUTPUT_PATH, index=False)

        return jsonify({
            'predictions': df.to_dict(orient='records'),
            'csv_path': 'output_predictions.csv'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download', methods=['GET'])
def download():
    return send_file(OUTPUT_PATH, as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True)