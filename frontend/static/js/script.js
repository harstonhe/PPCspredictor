document.addEventListener("DOMContentLoaded", function() {
    // 获取所有需要的DOM元素
    const sliders = document.querySelectorAll('input[type="range"]');
    const smokingSelect = document.getElementById('smoking');
    const calculateBtn = document.getElementById('calculate');
    const resetBtn = document.getElementById('reset');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const riskMarker = document.getElementById('risk-marker');
    const riskPercentage = document.getElementById('risk-percentage');
    const riskCategory = document.getElementById('risk-category');
    const clinicalInterpretation = document.getElementById('clinical-interpretation');
    
    // 添加滑块值更新事件
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}_value`);
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
    });
    
    // 标签页切换功能
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            // 添加当前标签活动状态
            this.classList.add('active');
            document.getElementById(tabId).classList.remove('hidden');
            
            // 如果是模型系数标签页，加载特征重要性图表
            if (tabId === 'model-coefficients') {
                loadFeatureImportanceChart();
            }
            
            // 如果是模型性能标签页，加载ROC曲线图表
            if (tabId === 'model-performance') {
                loadROCCurveChart();
            }
        });
    });
    
    // 重置按钮功能
    resetBtn.addEventListener('click', function() {
        // 重置所有滑块到默认值
        document.getElementById('pre_inr').value = '1.0';
        document.getElementById('pre_inr_value').textContent = '1.0';
        
        document.getElementById('pre_ast').value = '25';
        document.getElementById('pre_ast_value').textContent = '25';
        
        document.getElementById('op_time').value = '120';
        document.getElementById('op_time_value').textContent = '120';
        
        document.getElementById('post_rf').value = '300';
        document.getElementById('post_rf_value').textContent = '300';
        
        document.getElementById('blood_loss').value = '200';
        document.getElementById('blood_loss_value').textContent = '200';
        
        document.getElementById('post_wbc').value = '7.5';
        document.getElementById('post_wbc_value').textContent = '7.5';
        
        // 重置吸烟状态
        smokingSelect.value = '0';
        
        // 重置风险显示
        riskPercentage.textContent = '--.--%';
        riskCategory.textContent = 'Pending';
        riskCategory.className = 'category';
        riskMarker.style.left = '0';
        clinicalInterpretation.textContent = 'Enter patient parameters and calculate to see the risk assessment.';
    });
    
    // 计算风险按钮功能
    calculateBtn.addEventListener('click', function() {
        // 收集所有参数值
        const parameters = {
            pre_inr: parseFloat(document.getElementById('pre_inr').value),
            pre_ast: parseFloat(document.getElementById('pre_ast').value),
            op_time: parseFloat(document.getElementById('op_time').value),
            post_rf: parseFloat(document.getElementById('post_rf').value),
            blood_loss: parseFloat(document.getElementById('blood_loss').value),
            post_wbc: parseFloat(document.getElementById('post_wbc').value),
            smoking: parseInt(smokingSelect.value)
        };
        
        // 这里应该是发送API请求到后端进行实际预测
        // 现在我们使用模拟数据来演示界面功能
        
        // 计算风险分数 (模拟计算)
        // 在实际应用中，这会从后端API获取
        let riskScore = calculateMockRiskScore(parameters);
        
        // 更新界面显示
        updateRiskDisplay(riskScore);
    });
    
    // 模拟风险计算 (在实际应用中会被API调用替代)
    function calculateMockRiskScore(params) {
        // 这只是一个简单的模拟函数，用于演示界面
        // 实际应用中，这部分由RF模型计算得出
        
        // 为每个参数分配权重 (这些权重是瞎编的，仅用于演示)
        const weights = {
            pre_inr: 0.15,
            pre_ast: 0.2,
            op_time: 0.25,
            post_rf: -0.15,
            blood_loss: 0.2,
            post_wbc: 0.15,
            smoking: 0.1
        };
        
        // 计算归一化值
        const normalized = {
            pre_inr: (params.pre_inr - 0.5) / 2.5,  // 归一化到0-1范围
            pre_ast: (params.pre_ast - 10) / 190,
            op_time: (params.op_time - 30) / 570,
            post_rf: 1 - (params.post_rf - 100) / 400,  // 反向，值越高风险越低
            blood_loss: params.blood_loss / 2000,
            post_wbc: (params.post_wbc - 3) / 17,
            smoking: params.smoking
        };
        
        // 计算加权总分
        let score = 0;
        for (const [key, value] of Object.entries(normalized)) {
            score += value * weights[key];
        }
        
        // 将分数限制在0到1之间
        score = Math.max(0, Math.min(1, score));
        
        // 加入一点随机变化让演示更有趣
        score = score * 0.8 + Math.random() * 0.2;
        
        return score;
    }
    
    // 更新风险显示
    function updateRiskDisplay(score) {
        // 更新百分比显示
        const percentage = (score * 100).toFixed(1);
        riskPercentage.textContent = `${percentage}%`;
        
        // 更新标记位置
        riskMarker.style.left = `${score * 100}%`;
        
        // 更新风险类别
        riskCategory.className = 'category';
        if (score < 0.3) {
            riskCategory.textContent = 'Low Risk';
            riskCategory.classList.add('low-risk');
            clinicalInterpretation.textContent = 'The patient has a low risk of PPCs. Routine postoperative care is recommended.';
        } else if (score < 0.6) {
            riskCategory.textContent = 'Moderate Risk';
            riskCategory.classList.add('moderate-risk');
            clinicalInterpretation.textContent = 'The patient has a moderate risk of PPCs. Consider monitoring and follow-up if symptoms persist.';
        } else {
            riskCategory.textContent = 'High Risk';
            riskCategory.classList.add('high-risk');
            clinicalInterpretation.textContent = 'The patient has a high risk of PPCs. Close monitoring and preventive measures are strongly recommended.';
        }
    }
    
    // 加载特征重要性图表
    function loadFeatureImportanceChart() {
        const ctx = document.getElementById('feature-importance-chart').getContext('2d');
        
        // 清除现有图表
        if (window.featureChart) {
            window.featureChart.destroy();
        }
        
        // 模型特征重要性数据 (示例数据，实际应用中应从后端获取)
        const featureData = {
            labels: [
                'Operative time',
                'Blood loss',
                'Pre-AST',
                'Pre-INR',
                'Post-WBC',
                'Post-R/F Ratio', 
                'Smoking'
            ],
            datasets: [{
                label: 'Feature Importance',
                data: [0.28, 0.22, 0.18, 0.12, 0.10, 0.07, 0.03],
                backgroundColor: 'rgba(66, 133, 244, 0.7)',
                borderColor: 'rgba(66, 133, 244, 1)',
                borderWidth: 1
            }]
        };
        
        // 创建图表
        window.featureChart = new Chart(ctx, {
            type: 'bar',
            data: featureData,
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Importance Score'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Random Forest Feature Importance'
                    }
                }
            }
        });
    }
    
    // 加载ROC曲线图表
    function loadROCCurveChart() {
        const ctx = document.getElementById('roc-curve-chart').getContext('2d');
        
        // 清除现有图表
        if (window.rocChart) {
            window.rocChart.destroy();
        }
        
        // ROC曲线数据 (示例数据，实际应用中应从后端获取)
        const rocData = {
            labels: ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'],
            datasets: [
                {
                    label: 'Random Forest (AUC = 0.82)',
                    data: [0, 0.20, 0.35, 0.48, 0.59, 0.68, 0.75, 0.82, 0.89, 0.95, 1.0],
                    borderColor: 'rgba(66, 133, 244, 1)',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Reference Line',
                    data: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
                    borderColor: 'rgba(200, 200, 200, 1)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        };
        
        // 创建图表
        window.rocChart = new Chart(ctx, {
            type: 'line',
            data: rocData,
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'False Positive Rate'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'True Positive Rate'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Receiver Operating Characteristic (ROC) Curve'
                    }
                }
            }
        });
    }
});
