document.addEventListener("DOMContentLoaded", function() {
    // ��ȡ������Ҫ��DOMԪ��
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
    
    // ��ӻ���ֵ�����¼�
    sliders.forEach(slider => {
        const valueDisplay = document.getElementById(`${slider.id}_value`);
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
    });
    
    // ��ǩҳ�л�����
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // �Ƴ����л״̬
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            // ��ӵ�ǰ��ǩ�״̬
            this.classList.add('active');
            document.getElementById(tabId).classList.remove('hidden');
            
            // �����ģ��ϵ����ǩҳ������������Ҫ��ͼ��
            if (tabId === 'model-coefficients') {
                loadFeatureImportanceChart();
            }
            
            // �����ģ�����ܱ�ǩҳ������ROC����ͼ��
            if (tabId === 'model-performance') {
                loadROCCurveChart();
            }
        });
    });
    
    // ���ð�ť����
    resetBtn.addEventListener('click', function() {
        // �������л��鵽Ĭ��ֵ
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
        
        // ��������״̬
        smokingSelect.value = '0';
        
        // ���÷�����ʾ
        riskPercentage.textContent = '--.--%';
        riskCategory.textContent = 'Pending';
        riskCategory.className = 'category';
        riskMarker.style.left = '0';
        clinicalInterpretation.textContent = 'Enter patient parameters and calculate to see the risk assessment.';
    });
    
    // ������հ�ť����
    calculateBtn.addEventListener('click', function() {
        // �ռ����в���ֵ
        const parameters = {
            pre_inr: parseFloat(document.getElementById('pre_inr').value),
            pre_ast: parseFloat(document.getElementById('pre_ast').value),
            op_time: parseFloat(document.getElementById('op_time').value),
            post_rf: parseFloat(document.getElementById('post_rf').value),
            blood_loss: parseFloat(document.getElementById('blood_loss').value),
            post_wbc: parseFloat(document.getElementById('post_wbc').value),
            smoking: parseInt(smokingSelect.value)
        };
        
        // ����Ӧ���Ƿ���API���󵽺�˽���ʵ��Ԥ��
        // ��������ʹ��ģ����������ʾ���湦��
        
        // ������շ��� (ģ�����)
        // ��ʵ��Ӧ���У����Ӻ��API��ȡ
        let riskScore = calculateMockRiskScore(parameters);
        
        // ���½�����ʾ
        updateRiskDisplay(riskScore);
    });
    
    // ģ����ռ��� (��ʵ��Ӧ���лᱻAPI�������)
    function calculateMockRiskScore(params) {
        // ��ֻ��һ���򵥵�ģ�⺯����������ʾ����
        // ʵ��Ӧ���У��ⲿ����RFģ�ͼ���ó�
        
        // Ϊÿ����������Ȩ�� (��ЩȨ����Ϲ��ģ���������ʾ)
        const weights = {
            pre_inr: 0.15,
            pre_ast: 0.2,
            op_time: 0.25,
            post_rf: -0.15,
            blood_loss: 0.2,
            post_wbc: 0.15,
            smoking: 0.1
        };
        
        // �����һ��ֵ
        const normalized = {
            pre_inr: (params.pre_inr - 0.5) / 2.5,  // ��һ����0-1��Χ
            pre_ast: (params.pre_ast - 10) / 190,
            op_time: (params.op_time - 30) / 570,
            post_rf: 1 - (params.post_rf - 100) / 400,  // ����ֵԽ�߷���Խ��
            blood_loss: params.blood_loss / 2000,
            post_wbc: (params.post_wbc - 3) / 17,
            smoking: params.smoking
        };
        
        // �����Ȩ�ܷ�
        let score = 0;
        for (const [key, value] of Object.entries(normalized)) {
            score += value * weights[key];
        }
        
        // ������������0��1֮��
        score = Math.max(0, Math.min(1, score));
        
        // ����һ������仯����ʾ����Ȥ
        score = score * 0.8 + Math.random() * 0.2;
        
        return score;
    }
    
    // ���·�����ʾ
    function updateRiskDisplay(score) {
        // ���°ٷֱ���ʾ
        const percentage = (score * 100).toFixed(1);
        riskPercentage.textContent = `${percentage}%`;
        
        // ���±��λ��
        riskMarker.style.left = `${score * 100}%`;
        
        // ���·������
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
    
    // ����������Ҫ��ͼ��
    function loadFeatureImportanceChart() {
        const ctx = document.getElementById('feature-importance-chart').getContext('2d');
        
        // �������ͼ��
        if (window.featureChart) {
            window.featureChart.destroy();
        }
        
        // ģ��������Ҫ������ (ʾ�����ݣ�ʵ��Ӧ����Ӧ�Ӻ�˻�ȡ)
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
        
        // ����ͼ��
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
    
    // ����ROC����ͼ��
    function loadROCCurveChart() {
        const ctx = document.getElementById('roc-curve-chart').getContext('2d');
        
        // �������ͼ��
        if (window.rocChart) {
            window.rocChart.destroy();
        }
        
        // ROC�������� (ʾ�����ݣ�ʵ��Ӧ����Ӧ�Ӻ�˻�ȡ)
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
        
        // ����ͼ��
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
