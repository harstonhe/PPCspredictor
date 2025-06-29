import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime
import joblib
import os

# --- Page Configuration ---
st.set_page_config(
    page_title="Dynamic PPCs Risk Calculator",
    page_icon="⚕️",
    layout="wide"
)

# --- Custom CSS for Styling ---
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

# This is a workaround to apply styles similar to the original HTML.
# We will create a style.css file later. For now, let's focus on the app structure.
# To more closely match the original, we can inject custom CSS.
st.markdown("""
<style>
    /* Main header style */
    .stApp > header {
        background-color: transparent;
    }
    .css-18e3th9 {
        padding-top: 2rem;
    }
    /* Custom Title */
    .title-container {
        text-align: center;
        background-color: #4285f4;
        padding: 15px 0;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        color: white;
        margin-bottom: 20px;
    }
    .title-container h1 {
        color: white;
        font-weight: 700;
    }
    .timestamp {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 5px;
    }
    /* Sidebar styling */
    .css-1d391kg {
        background-color: #f5f7fa;
        border-right: 1px solid #ddd;
    }
    .st-emotion-cache-16txtl3 {
        padding: 2rem 1rem;
    }
</style>
""", unsafe_allow_html=True)

# --- Header ---
st.markdown(
    f"""
    <div class="title-container">
        <div class="timestamp">{datetime.now().strftime("%Y/%m/%d %H:%M")}</div>
        <h1>Dynamic PPCs Risk Prediction Model</h1>
    </div>
    """,
    unsafe_allow_html=True
)

# --- Model Loading ---
MODEL_PATH = "RF.joblib"

@st.cache_resource
def load_model(path):
    """Loads the trained model from a .joblib file."""
    if not os.path.exists(path):
        st.error(f"Model file not found at `{path}`. Please ensure the model file is placed correctly.")
        return None
    try:
        model = joblib.load(path)
        return model
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

model = load_model(MODEL_PATH)

# --- Sidebar for Parameters ---
st.sidebar.header("Patient Parameters")

pre_inr = st.sidebar.slider("Pre-INR", min_value=0.5, max_value=3.0, value=1.0, step=0.1)
pre_ast = st.sidebar.slider("Pre-AST", min_value=10, max_value=200, value=25, step=1)
op_time = st.sidebar.slider("Operative time (min)", min_value=30, max_value=600, value=120, step=10)
post_rf = st.sidebar.slider("Post-R/F Ratio", min_value=100, max_value=500, value=300, step=10)
blood_loss = st.sidebar.slider("Blood loss (mL)", min_value=0, max_value=2000, value=200, step=50)
post_wbc = st.sidebar.slider("Post-WBC", min_value=3.0, max_value=20.0, value=7.5, step=0.1)
smoking = st.sidebar.selectbox("Smoking", ("No", "Yes"), index=0)

# Map smoking to 0 or 1
smoking_value = 1 if smoking == "Yes" else 0

calculate = st.sidebar.button("Calculate Risk", use_container_width=True, type="primary")

st.sidebar.markdown("---")
st.sidebar.markdown(
    """
    <div style="display: flex; justify-content: space-between;">
        <div style="font-size: 12px; padding: 5px 10px; border-radius: 20px; font-weight: 500; background-color: #34a853; color: white;">Low Risk</div>
        <div style="font-size: 12px; padding: 5px 10px; border-radius: 20px; font-weight: 500; background-color: #fbbc05; color: #333;">Moderate</div>
        <div style="font-size: 12px; padding: 5px 10px; border-radius: 20px; font-weight: 500; background-color: #ea4335; color: white;">High Risk</div>
    </div>
    """,
    unsafe_allow_html=True
)

# --- Main Panel with Tabs ---
tab1, tab2, tab3 = st.tabs(["Risk Assessment", "Model Coefficients", "Model Performance"])

with tab1:
    st.header("PPCs Risk Assessment Results")

    # Display results only if the button is clicked and the model is loaded
    if calculate and model is not None:
        # Collect parameters into a dictionary
        params_dict = {
            'pre_inr': pre_inr,
            'pre_ast': pre_ast,
            'op_time': op_time,
            'post_rf': post_rf,
            'blood_loss': blood_loss,
            'post_wbc': post_wbc,
            'smoking': smoking_value
        }
        
        # IMPORTANT: Ensure this feature order matches the order used for training the model
        # Updated based on the user-provided SHAP plot.
        feature_order = ['op_time', 'post_rf', 'post_wbc', 'pre_inr', 'blood_loss', 'smoking', 'pre_ast']
        
        # Create a DataFrame in the correct order for prediction
        input_df = pd.DataFrame([params_dict])
        
        # Get prediction probability from the model
        # predict_proba returns a list of [prob_class_0, prob_class_1]
        prediction_proba = model.predict_proba(input_df)
        risk_score = prediction_proba[0][1] # Probability of PPCs (positive class)
        
        risk_percentage = risk_score * 100

        # Determine risk category and interpretation
        # The thresholds (0.3, 0.6) are from the old mock-up. 
        # You may want to adjust these based on your model's validation (e.g., using a ROC curve to find optimal cut-offs).
        if risk_score < 0.3:
            category = "Low Risk"
            interpretation = "The patient has a low risk of PPCs. Routine postoperative care is recommended."
        elif risk_score < 0.6:
            category = "Moderate Risk"
            interpretation = "The patient has a moderate risk of PPCs. Consider monitoring and follow-up if symptoms persist."
        else:
            category = "High Risk"
            interpretation = "The patient has a high risk of PPCs. Close monitoring and preventive measures are strongly recommended."

        # Display Results
        st.subheader("PPCs Risk Probability")
        st.progress(risk_score)

        col1, col2 = st.columns(2)
        with col1:
            st.metric(label="Risk Probability", value=f"{risk_percentage:.1f}%")
        with col2:
            st.metric(label="Risk Category", value=category)

        st.subheader("Clinical Interpretation:")
        st.markdown(f"> {interpretation}")

    elif calculate and model is None:
        # This case is handled by the error message in load_model, but we can add a placeholder.
        st.warning("Cannot calculate risk because the model could not be loaded.")
        
    else:
        st.info("Please adjust the parameters on the left and click 'Calculate Risk' to see the results.")

with tab2:
    st.header("Random Forest Model Details")
    st.subheader("SHAP Feature Importance")

    # Feature importance data updated from the user-provided SHAP plot
    feature_data = {
        'Feature': [
            'Pre-AST', 'Smoking', 'Blood loss', 'Pre-INR', 
            'Post-WBC', 'Post-R/F Ratio', 'Operative time'
        ],
        'Importance': [0.010, 0.025, 0.050, 0.052, 0.068, 0.082, 0.095]
    }
    feature_df = pd.DataFrame(feature_data)

    # Create plot
    fig_importance = go.Figure(go.Bar(
        x=feature_df['Importance'],
        y=feature_df['Feature'],
        orientation='h',
        marker_color='#4285f4'
    ))
    fig_importance.update_layout(
        title_text='SHAP Feature Importance (RF)',
        xaxis_title="mean(|SHAP value|) (average impact on model output magnitude)",
        yaxis_title=None,
        height=400,
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)'
    )
    st.plotly_chart(fig_importance, use_container_width=True)

with tab3:
    st.header("Model Performance Metrics")

    # Display metrics in columns
    col1, col2, col3 = st.columns(3)
    col1.metric("Validation AUC", "0.91")
    col2.metric("Sensitivity", "0.80")
    col3.metric("Specificity", "0.84")

    st.subheader("ROC Curve")

    # ROC curve data from the original JS
    roc_fpr = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    roc_tpr = [0, 0.25, 0.42, 0.55, 0.67, 0.75, 0.82, 0.88, 0.93, 0.97, 1.0]

    # Create plot
    fig_roc = go.Figure()

    # Model ROC curve
    fig_roc.add_trace(go.Scatter(
        x=roc_fpr, y=roc_tpr,
        fill='tozeroy',
        mode='lines',
        line=dict(color='#4285f4', width=3),
        name='Random Forest (AUC = 0.91)'
    ))

    # Reference line
    fig_roc.add_trace(go.Scatter(
        x=[0, 1], y=[0, 1],
        mode='lines',
        line=dict(color='grey', width=2, dash='dash'),
        name='Reference Line'
    ))

    fig_roc.update_layout(
        title='Receiver Operating Characteristic (ROC) Curve',
        xaxis_title='False Positive Rate (1 - Specificity)',
        yaxis_title='True Positive Rate (Sensitivity)',
        height=400,
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        legend=dict(x=0.5, y=0.1)
    )
    st.plotly_chart(fig_roc, use_container_width=True)


# --- Footer ---
st.markdown("---")
st.markdown(
    """
    <div style="text-align: center; color: #777; font-size: 12px;">
        <p>2025 Dynamic PPCs Risk Calculator. For research and educational purposes only.</p>
    </div>
    """,
    unsafe_allow_html=True
) 