from flask import Flask, render_template, request, jsonify
import os
import sys
import numpy as np

# 创建Flask应用
app = Flask(__name__, 
    static_folder=os.path.join(os.path.dirname(__file__), "static"),
    template_folder=os.path.join(os.path.dirname(__file__), "templates")
)

# 特征名称
FEATURES = [
    "Pre-INR",
    "Pre-AST",
    "Operative time",
    "Post-R/F Ratio",
    "Blood loss",
    "Post-WBC",
    "Smoking"
]

# 路由定义
@app.route("/")
@app.route("/PPCspredictor")
@app.route("/PPCspredictor.html")
def index():
    return render_template("PPCspredictor.html")

@app.route("/predict", methods=["POST"])
def predict():
    """
    接收前端传来的参数，使用随机森林模型预测PPCs风险
    """
    try:
        # 从请求中获取数据
        data = request.get_json()
        
        # 构建输入数据
        X = np.array([
            data.get("pre_inr", 1.0),            # Pre-INR
            data.get("pre_ast", 25),             # Pre-AST
            data.get("op_time", 120),            # Operative time
            data.get("post_rf", 300),            # Post-R/F Ratio
            data.get("blood_loss", 200),         # Blood loss
            data.get("post_wbc", 7.5),           # Post-WBC
            data.get("smoking", 0)               # Smoking
        ]).reshape(1, -1)
        
        # 计算风险分数 (模拟计算)
        risk_probability = calculate_mock_risk(X)
        
        # 确定风险类别
        if risk_probability < 0.3:
            risk_category = "Low Risk"
            clinical_interpretation = "The patient has a low risk of PPCs. Routine postoperative care is recommended."
        elif risk_probability < 0.6:
            risk_category = "Moderate Risk"
            clinical_interpretation = "The patient has a moderate risk of PPCs. Consider monitoring and follow-up if symptoms persist."
        else:
            risk_category = "High Risk"
            clinical_interpretation = "The patient has a high risk of PPCs. Close monitoring and preventive measures are strongly recommended."
        
        # 构建响应
        response = {
            "success": True,
            "risk_probability": risk_probability,
            "risk_category": risk_category,
            "clinical_interpretation": clinical_interpretation
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def calculate_mock_risk(X):
    """
    模拟计算风险概率 (使用合理权重)
    """
    weights = np.array([0.15, 0.20, 0.25, -0.15, 0.20, 0.15, 0.10])
    
    # 归一化值
    X_norm = np.array([
        (X[0, 0] - 0.5) / 2.5,      # Pre-INR
        (X[0, 1] - 10) / 190,       # Pre-AST
        (X[0, 2] - 30) / 570,       # Operative time
        1 - (X[0, 3] - 100) / 400,  # Post-R/F Ratio (反转)
        X[0, 4] / 2000,             # Blood loss
        (X[0, 5] - 3) / 17,         # Post-WBC
        X[0, 6]                     # Smoking
    ])
    
    # 计算得分
    score = np.sum(X_norm * weights)
    
    # 限制在0-1范围内
    score = max(0, min(1, score))
    
    return score

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8050))
    print(f"启动PPCs风险预测模型前端服务，端口: {port}...")
    app.run(debug=False, host="0.0.0.0", port=port)
