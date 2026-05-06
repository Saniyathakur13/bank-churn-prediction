import joblib
import pandas as pd

# Load model only once when backend starts
model = joblib.load("model.pkl")


def predict_batch(processed_df):
    """
    Returns:
    - predictions
    - churn probabilities
    """
    predictions = model.predict(processed_df)

    # Probability of class 1 (churn)
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(processed_df)[:, 1]
    else:
        # fallback if model doesn't support predict_proba
        probabilities = [0.0] * len(predictions)

    return predictions, probabilities