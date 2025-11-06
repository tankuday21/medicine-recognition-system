class ReportAnalysisService {
  constructor() {
    this.healthMetrics = this.initializeHealthMetrics();
    console.log('📊 Report Analysis Service initialized');
  }

  // Initialize health metrics patterns and normal ranges
  initializeHealthMetrics() {
    return {
      // Blood Chemistry
      glucose: {
        patterns: [/glucose[:\s]+(\d+(?:\.\d+)?)\s*mg\/dl/i, /blood\s+sugar[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 70, max: 100 },
        unit: 'mg/dL',
        category: 'Blood Chemistry'
      },
      cholesterol: {
        patterns: [/total\s+cholesterol[:\s]+(\d+(?:\.\d+)?)\s*mg\/dl/i, /cholesterol[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 0, max: 200 },
        unit: 'mg/dL',
        category: 'Lipid Panel'
      },
      hdl: {
        patterns: [/hdl\s+cholesterol[:\s]+(\d+(?:\.\d+)?)/i, /hdl[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 40, max: 999 }, // >40 for men, >50 for women
        unit: 'mg/dL',
        category: 'Lipid Panel'
      },
      ldl: {
        patterns: [/ldl\s+cholesterol[:\s]+(\d+(?:\.\d+)?)/i, /ldl[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 0, max: 100 },
        unit: 'mg/dL',
        category: 'Lipid Panel'
      },
      triglycerides: {
        patterns: [/triglycerides[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 0, max: 150 },
        unit: 'mg/dL',
        category: 'Lipid Panel'
      },
      
      // Blood Count
      hemoglobin: {
        patterns: [/hemoglobin[:\s]+(\d+(?:\.\d+)?)\s*g\/dl/i, /hgb[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 12.0, max: 18.0 },
        unit: 'g/dL',
        category: 'Complete Blood Count'
      },
      hematocrit: {
        patterns: [/hematocrit[:\s]+(\d+(?:\.\d+)?)\s*%/i, /hct[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 36.0, max: 52.0 },
        unit: '%',
        category: 'Complete Blood Count'
      },
      wbc: {
        patterns: [/white\s+blood\s+cells[:\s]+(\d+(?:\.\d+)?)/i, /wbc[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 4.5, max: 11.0 },
        unit: 'K/uL',
        category: 'Complete Blood Count'
      },
      rbc: {
        patterns: [/red\s+blood\s+cells[:\s]+(\d+(?:\.\d+)?)/i, /rbc[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 4.7, max: 6.1 },
        unit: 'M/uL',
        category: 'Complete Blood Count'
      },
      platelets: {
        patterns: [/platelets[:\s]+(\d+(?:\.\d+)?)/i, /plt[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 150, max: 450 },
        unit: 'K/uL',
        category: 'Complete Blood Count'
      },

      // Kidney Function
      creatinine: {
        patterns: [/creatinine[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 0.7, max: 1.3 },
        unit: 'mg/dL',
        category: 'Kidney Function'
      },
      bun: {
        patterns: [/bun[:\s]+(\d+(?:\.\d+)?)/i, /blood\s+urea\s+nitrogen[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 7, max: 20 },
        unit: 'mg/dL',
        category: 'Kidney Function'
      },

      // Liver Function
      alt: {
        patterns: [/alt[:\s]+(\d+(?:\.\d+)?)/i, /alanine\s+aminotransferase[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 7, max: 56 },
        unit: 'U/L',
        category: 'Liver Function'
      },
      ast: {
        patterns: [/ast[:\s]+(\d+(?:\.\d+)?)/i, /aspartate\s+aminotransferase[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 10, max: 40 },
        unit: 'U/L',
        category: 'Liver Function'
      },
      bilirubin: {
        patterns: [/total\s+bilirubin[:\s]+(\d+(?:\.\d+)?)/i, /bilirubin[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 0.3, max: 1.2 },
        unit: 'mg/dL',
        category: 'Liver Function'
      },

      // Electrolytes
      sodium: {
        patterns: [/sodium[:\s]+(\d+(?:\.\d+)?)/i, /na[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 136, max: 145 },
        unit: 'mEq/L',
        category: 'Electrolytes'
      },
      potassium: {
        patterns: [/potassium[:\s]+(\d+(?:\.\d+)?)/i, /k[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 3.5, max: 5.1 },
        unit: 'mEq/L',
        category: 'Electrolytes'
      },
      chloride: {
        patterns: [/chloride[:\s]+(\d+(?:\.\d+)?)/i, /cl[:\s]+(\d+(?:\.\d+)?)/i],
        normalRange: { min: 98, max: 107 },
        unit: 'mEq/L',
        category: 'Electrolytes'
      }
    };
  }

  // Main analysis function
  async analyzeReport(extractedText, reportMetadata = {}) {
    try {
      console.log('📊 Analyzing medical report...');

      const extractedMetrics = this.extractHealthMetrics(extractedText);
      const abnormalFlags = this.detectAbnormalValues(extractedMetrics);
      const summary = this.generateSummary(extractedMetrics, abnormalFlags);
      const recommendations = this.generateRecommendations(abnormalFlags);

      return {
        success: true,
        analysis: {
          extractedMetrics,
          abnormalFlags,
          summary,
          recommendations,
          metadata: {
            ...reportMetadata,
            analysisDate: new Date().toISOString(),
            totalMetricsFound: extractedMetrics.length,
            abnormalCount: abnormalFlags.length
          }
        }
      };
    } catch (error) {
      console.error('Report analysis error:', error);
      return {
        success: false,
        message: 'Failed to analyze report',
        error: error.message
      };
    }
  }

  // Extract health metrics from text
  extractHealthMetrics(text) {
    const extractedMetrics = [];
    const cleanText = text.toLowerCase();

    Object.entries(this.healthMetrics).forEach(([metricName, metricConfig]) => {
      metricConfig.patterns.forEach(pattern => {
        const match = cleanText.match(pattern);
        if (match && match[1]) {
          const value = parseFloat(match[1]);
          if (!isNaN(value)) {
            extractedMetrics.push({
              name: metricName,
              displayName: this.getDisplayName(metricName),
              value: value,
              unit: metricConfig.unit,
              category: metricConfig.category,
              normalRange: metricConfig.normalRange,
              isNormal: this.isValueNormal(value, metricConfig.normalRange),
              extractedFrom: match[0]
            });
          }
        }
      });
    });

    return extractedMetrics;
  }

  // Check if value is within normal range
  isValueNormal(value, normalRange) {
    return value >= normalRange.min && value <= normalRange.max;
  }

  // Detect abnormal values
  detectAbnormalValues(extractedMetrics) {
    return extractedMetrics
      .filter(metric => !metric.isNormal)
      .map(metric => ({
        ...metric,
        severity: this.calculateSeverity(metric.value, metric.normalRange),
        deviation: this.calculateDeviation(metric.value, metric.normalRange)
      }));
  }

  // Calculate severity of abnormal value
  calculateSeverity(value, normalRange) {
    const { min, max } = normalRange;
    const range = max - min;
    
    if (value < min) {
      const deviation = (min - value) / range;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'high';
      return 'moderate';
    } else if (value > max) {
      const deviation = (value - max) / range;
      if (deviation > 0.5) return 'critical';
      if (deviation > 0.2) return 'high';
      return 'moderate';
    }
    
    return 'normal';
  }

  // Calculate percentage deviation from normal range
  calculateDeviation(value, normalRange) {
    const { min, max } = normalRange;
    
    if (value < min) {
      return -((min - value) / min * 100);
    } else if (value > max) {
      return ((value - max) / max * 100);
    }
    
    return 0;
  }

  // Generate analysis summary
  generateSummary(extractedMetrics, abnormalFlags) {
    const totalMetrics = extractedMetrics.length;
    const normalMetrics = extractedMetrics.filter(m => m.isNormal).length;
    const abnormalMetrics = abnormalFlags.length;

    const categories = [...new Set(extractedMetrics.map(m => m.category))];
    
    return {
      totalMetrics,
      normalMetrics,
      abnormalMetrics,
      overallStatus: abnormalMetrics === 0 ? 'normal' : 
                    abnormalFlags.some(f => f.severity === 'critical') ? 'critical' :
                    abnormalFlags.some(f => f.severity === 'high') ? 'attention_needed' : 'minor_concerns',
      categoriesAnalyzed: categories,
      completeness: this.assessCompleteness(extractedMetrics)
    };
  }

  // Assess completeness of the report
  assessCompleteness(extractedMetrics) {
    const expectedCategories = ['Blood Chemistry', 'Complete Blood Count', 'Lipid Panel'];
    const foundCategories = [...new Set(extractedMetrics.map(m => m.category))];
    const completeness = (foundCategories.length / expectedCategories.length) * 100;
    
    return {
      percentage: Math.round(completeness),
      foundCategories,
      missingCategories: expectedCategories.filter(cat => !foundCategories.includes(cat))
    };
  }

  // Generate recommendations based on abnormal values
  generateRecommendations(abnormalFlags) {
    const recommendations = [];

    abnormalFlags.forEach(flag => {
      const recommendation = this.getRecommendationForMetric(flag);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    });

    // Add general recommendations
    if (abnormalFlags.length > 0) {
      recommendations.push({
        type: 'general',
        priority: 'high',
        title: 'Consult Healthcare Provider',
        description: 'Discuss these results with your healthcare provider for proper interpretation and next steps.',
        category: 'Medical Consultation'
      });
    }

    return recommendations;
  }

  // Get specific recommendation for a metric
  getRecommendationForMetric(flag) {
    const recommendations = {
      glucose: {
        high: {
          title: 'Elevated Blood Glucose',
          description: 'Consider dietary modifications, regular exercise, and monitoring carbohydrate intake.',
          category: 'Lifestyle'
        }
      },
      cholesterol: {
        high: {
          title: 'High Cholesterol',
          description: 'Adopt a heart-healthy diet low in saturated fats and consider regular cardiovascular exercise.',
          category: 'Cardiovascular Health'
        }
      },
      ldl: {
        high: {
          title: 'Elevated LDL Cholesterol',
          description: 'Reduce intake of saturated and trans fats. Increase fiber-rich foods and consider statins if recommended.',
          category: 'Cardiovascular Health'
        }
      },
      triglycerides: {
        high: {
          title: 'High Triglycerides',
          description: 'Limit sugar and refined carbohydrates. Increase omega-3 fatty acids and maintain healthy weight.',
          category: 'Cardiovascular Health'
        }
      }
    };

    const metricRec = recommendations[flag.name];
    if (metricRec) {
      const severityRec = flag.value > flag.normalRange.max ? metricRec.high : metricRec.low;
      if (severityRec) {
        return {
          type: 'specific',
          priority: flag.severity,
          metric: flag.displayName,
          ...severityRec
        };
      }
    }

    return null;
  }

  // Get display name for metric
  getDisplayName(metricName) {
    const displayNames = {
      glucose: 'Blood Glucose',
      cholesterol: 'Total Cholesterol',
      hdl: 'HDL Cholesterol',
      ldl: 'LDL Cholesterol',
      triglycerides: 'Triglycerides',
      hemoglobin: 'Hemoglobin',
      hematocrit: 'Hematocrit',
      wbc: 'White Blood Cells',
      rbc: 'Red Blood Cells',
      platelets: 'Platelets',
      creatinine: 'Creatinine',
      bun: 'Blood Urea Nitrogen',
      alt: 'ALT (Liver Enzyme)',
      ast: 'AST (Liver Enzyme)',
      bilirubin: 'Total Bilirubin',
      sodium: 'Sodium',
      potassium: 'Potassium',
      chloride: 'Chloride'
    };

    return displayNames[metricName] || metricName.charAt(0).toUpperCase() + metricName.slice(1);
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      supportedMetrics: Object.keys(this.healthMetrics).length,
      categories: [...new Set(Object.values(this.healthMetrics).map(m => m.category))]
    };
  }
}

// Create singleton instance
const reportAnalysisService = new ReportAnalysisService();

module.exports = reportAnalysisService;