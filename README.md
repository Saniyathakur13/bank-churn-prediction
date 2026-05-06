
# 🏦 Bank Customer Churn Prediction Web App

This is an **end-to-end web application** that predicts whether a bank customer is likely to churn (leave the bank) based on their profile and transaction history.
It combines a **Flask backend** (machine learning model) and a **React frontend** (user interface).

---

## 🚀 Features

* Upload a `.csv` file with customer data.
* Backend runs a **trained Voting/ExtraTreesClassifier model** to predict churn.
* Results are displayed in a dynamic React table.
* Download predictions as a `.csv` with an extra **Prediction** column.
* Example input/output files included for testing.


* Frontend → app.py → preprocessing → encoder/scaler → model → prediction → back to frontend
---

## 📦 Tech Stack

* **Backend:** Python, Flask, scikit-learn, imbalanced-learn
* **Frontend:** React, TailwindCSS
* **ML Model:** ExtraTreesClassifier (with SMOTE & preprocessing pipeline)

---

## 🔧 Prerequisites

* **Python** 3.8+
* **Node.js** 16+
* **npm** 8+

---

## ⚙️ Setup Instructions

### 1️⃣ Backend (Flask + ML Model)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

Backend will run on 👉 `http://localhost:5000`

---

### 2️⃣ Frontend (React UI)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will run on 👉 `http://localhost:3000`

---

## 🖥️ Usage

1. Open `http://localhost:3000` in your browser.
2. Upload a `.csv` file with customer data (see **example\_input.csv** for format).
3. View predictions in the table.
4. Optionally, download the results as a `.csv` (with `Prediction` column).

---

## 📂 Project Structure

```
BANK-CHURN-PREDICTION/
│
├── backend/
│   ├── app.py               # Flask API server
│   ├── preprocess.py        # Preprocessing logic
│   ├── save_model.py        # Model training script
│   ├── model.pkl            # Trained ML model
│   ├── example_input.csv    # Sample input
│   ├── example_output.csv   # Sample predictions
│   ├── output_predictions.csv
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   └── ResultsTable.jsx
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   ├── output.css
│   │   └── styles.css
│   ├── public/index.html
│   ├── package.json
│   └── tailwind.config.js
│
├── input/credit-card-customers/BankChurners.csv
├── README.md
└── .gitignore
```

---

## 📊 Example Files

* `example_input.csv` → Example input format.
* `example_output.csv` → Example predictions file.
* `output_predictions.csv` → Sample generated results.

---
## Screenshots
<img width="1917" height="960" alt="bank1" src="https://github.com/user-attachments/assets/fa8e7712-e929-45dd-b1bf-98bf018173ea" />
<img width="1897" height="923" alt="bank6" src="https://github.com/user-attachments/assets/e89af665-f1dc-428d-b6d2-b2b97e13637f" />
<img width="1895" height="677" alt="image" src="https://github.com/user-attachments/assets/3ee3b7e2-7d05-4ba7-a046-3248a24a17b9" />
<img width="1892" height="693" alt="image" src="https://github.com/user-attachments/assets/80ff28b7-0951-4f66-a7d1-90b93aedb5a9" />
<img width="1900" height="920" alt="image" src="https://github.com/user-attachments/assets/3306a8df-d8d8-4193-9a01-2e2253abdef0" />
<img width="1831" height="543" alt="image" src="https://github.com/user-attachments/assets/0bb81faa-96c2-4730-a4bc-fee8c8728504" />
<img width="1893" height="571" alt="image" src="https://github.com/user-attachments/assets/899dba05-dbeb-43ef-9407-bb0268628636" />
<img width="1776" height="481" alt="image" src="https://github.com/user-attachments/assets/9544c892-34e3-4a7d-84a4-dd51fe17ad52" />
<img width="1888" height="815" alt="image" src="https://github.com/user-attachments/assets/521929f3-f22a-40aa-a324-89c54fe034e7" />
<img width="1880" height="913" alt="image" src="https://github.com/user-attachments/assets/2159b51a-2a58-473a-8f8e-bbb648c74a87" />
<img width="496" height="784" alt="image" src="https://github.com/user-attachments/assets/e560f90e-dc96-49dd-9fb2-9e0795a91285" />
<img width="1890" height="955" alt="image" src="https://github.com/user-attachments/assets/0ba7afc3-51c5-47d9-9ad4-bef9d7682292" />



## 📝 Notes

* The **backend expects CSV files** with columns matching `example_input.csv`.
* The **model is pre-trained** and saved as `model.pkl`.
* Frontend supports **CSV upload & download** for easy workflow.


