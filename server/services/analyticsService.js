const { User, Reminder, HealthMetrics, Report } = require('../models');
const mongoose = require('mongoose');

class AnalyticsService {
  constructor() {
    console.log('📊 Analytics Service initialized');
  }

  // Get comprehensive health dashboard data
  async getHealthDashboard(userId, timeframe = '30d') {
    try {
      console.log(`📊 Generating health dashboard for user: ${userId}`);

      const [adherenceData, healthTrends, reportSummary, medicationInsights] = await Promise.all([
        this.getAdherenceAnalytics(userId, timeframe),
        this.getHealthTrends(userId, timeframe),
        this.getReportSummary(userId, timeframe),
        this.getMedicationInsights(userId, timeframe)
      ]);

      const overallScore = this.calculateHealthScore({
        adherence: adherenceData.success ? adherenceData.data : null,
        trends: healthTrends.success ? healthTrends.data : null,
        reports: reportSummary.success ? reportSummary.data : null
      });

      return {
        success: true,
        data: {
          timeframe,
          generatedAt: new Date().toISOString(),
          overallHealthScore: overallScore,
          adherenceAnalytics: adherenceData.success ? adherenceData.data : null,
          healthTrends: healthTrends.success ? healthTrends.data : null,
          reportSummary: reportSummary.success ? reportSummary.data : null,
          medicationInsights: medicationInsights.success ? medicationInsights.data : null,
          recommendations: this.generateRecommendations({
            adherence: adherenceData.success ? adherenceData.data : null,
            trends: healthTrends.success ? healthTrends.data : null,
            reports: reportSummary.success ? reportSummary.data : null
          })
        }
      };

    } catch (error) {
      console.error('Health dashboard error:', error);
      return {
        success: false,
        message: 'Failed to generate health dashboard'
      };
    }
  }

  // Get medication adherence analytics
  async getAdherenceAnalytics(userId, timeframe) {
    try {
      const dateRange = this.getDateRange(timeframe);
      
      const reminders = await Reminder.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      });

      if (reminders.length === 0) {
        return {
          success: true,
          data: {
            totalReminders: 0,
            adherencePercentage: 0,
            streakDays: 0,
            missedDoses: 0,
            onTimePercentage: 0,
            dailyAdherence: [],
            medicationBreakdown: []
          }
        };
      }

      let totalScheduled = 0;
      let totalTaken = 0;
      let totalMissed = 0;
      let onTimeDoses = 0;
      const dailyData = new Map();
      const medicationData = new Map();

      reminders.forEach(reminder => {
        const relevantLogs = reminder.adherenceLog.filter(log => {
          const logDate = new Date(log.scheduledTime);
          return logDate >= dateRange.start && logDate <= dateRange.end;
        });

        relevantLogs.forEach(log => {
          totalScheduled++;
          
          const dayKey = new Date(log.scheduledTime).toISOString().split('T')[0];
          if (!dailyData.has(dayKey)) {
            dailyData.set(dayKey, { scheduled: 0, taken: 0, missed: 0 });
          }
          
          const dayData = dailyData.get(dayKey);
          dayData.scheduled++;

          if (!medicationData.has(reminder.medicineName)) {
            medicationData.set(reminder.medicineName, { scheduled: 0, taken: 0, missed: 0 });
          }
          
          const medData = medicationData.get(reminder.medicineName);
          medData.scheduled++;

          if (log.status === 'taken') {
            totalTaken++;
            dayData.taken++;
            medData.taken++;
            
            // Check if taken on time (within 30 minutes of scheduled time)
            const scheduledTime = new Date(log.scheduledTime);
            const takenTime = new Date(log.takenTime);
            const timeDiff = Math.abs(takenTime - scheduledTime) / (1000 * 60); // minutes
            
            if (timeDiff <= 30) {
              onTimeDoses++;
            }
          } else if (log.status === 'missed') {
            totalMissed++;
            dayData.missed++;
            medData.missed++;
          }
        });
      });

      const adherencePercentage = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;
      const onTimePercentage = totalTaken > 0 ? Math.round((onTimeDoses / totalTaken) * 100) : 0;
      
      // Calculate streak
      const streakDays = this.calculateAdherenceStreak(dailyData, dateRange);

      // Convert maps to arrays for response
      const dailyAdherence = Array.from(dailyData.entries()).map(([date, data]) => ({
        date,
        ...data,
        adherenceRate: data.scheduled > 0 ? Math.round((data.taken / data.scheduled) * 100) : 0
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      const medicationBreakdown = Array.from(medicationData.entries()).map(([name, data]) => ({
        medicineName: name,
        ...data,
        adherenceRate: data.scheduled > 0 ? Math.round((data.taken / data.scheduled) * 100) : 0
      })).sort((a, b) => b.adherenceRate - a.adherenceRate);

      return {
        success: true,
        data: {
          totalReminders: reminders.length,
          totalScheduled,
          totalTaken,
          totalMissed,
          adherencePercentage,
          onTimePercentage,
          streakDays,
          dailyAdherence,
          medicationBreakdown
        }
      };

    } catch (error) {
      console.error('Adherence analytics error:', error);
      return {
        success: false,
        message: 'Failed to get adherence analytics'
      };
    }
  }

  // Get health trends from reports and metrics
  async getHealthTrends(userId, timeframe) {
    try {
      const dateRange = this.getDateRange(timeframe);
      
      const healthMetrics = await HealthMetrics.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }).sort({ createdAt: 1 });

      if (healthMetrics.length === 0) {
        return {
          success: true,
          data: {
            totalReports: 0,
            trends: [],
            abnormalTrends: [],
            improvementAreas: []
          }
        };
      }

      const metricTrends = new Map();
      const abnormalTrends = [];

      healthMetrics.forEach(report => {
        report.metrics.forEach(metric => {
          if (!metricTrends.has(metric.name)) {
            metricTrends.set(metric.name, {
              name: metric.name,
              unit: metric.unit,
              category: metric.category,
              normalRange: metric.normalRange,
              values: []
            });
          }

          const trend = metricTrends.get(metric.name);
          trend.values.push({
            value: metric.value,
            date: report.createdAt,
            isNormal: metric.isNormal
          });

          if (!metric.isNormal) {
            abnormalTrends.push({
              metricName: metric.name,
              value: metric.value,
              normalRange: metric.normalRange,
              date: report.createdAt,
              severity: this.calculateAbnormalSeverity(metric.value, metric.normalRange)
            });
          }
        });
      });

      // Calculate trends and improvements
      const trends = Array.from(metricTrends.values()).map(trend => {
        const trendAnalysis = this.analyzeTrend(trend.values);
        return {
          ...trend,
          ...trendAnalysis,
          latestValue: trend.values[trend.values.length - 1]
        };
      });

      const improvementAreas = this.identifyImprovementAreas(trends, abnormalTrends);

      return {
        success: true,
        data: {
          totalReports: healthMetrics.length,
          trends,
          abnormalTrends: abnormalTrends.slice(-10), // Last 10 abnormal readings
          improvementAreas
        }
      };

    } catch (error) {
      console.error('Health trends error:', error);
      return {
        success: false,
        message: 'Failed to get health trends'
      };
    }
  }

  // Get report summary
  async getReportSummary(userId, timeframe) {
    try {
      const dateRange = this.getDateRange(timeframe);
      
      const reports = await Report.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      }).populate('healthMetrics');

      const summary = {
        totalReports: reports.length,
        processedReports: reports.filter(r => r.processingStatus === 'processed').length,
        failedReports: reports.filter(r => r.processingStatus === 'failed').length,
        averageConfidence: 0,
        reportTypes: new Map(),
        recentReports: []
      };

      if (reports.length > 0) {
        const confidenceSum = reports
          .filter(r => r.confidence)
          .reduce((sum, r) => sum + r.confidence, 0);
        
        const confidenceCount = reports.filter(r => r.confidence).length;
        summary.averageConfidence = confidenceCount > 0 ? 
          Math.round((confidenceSum / confidenceCount) * 100) : 0;

        // Categorize reports
        reports.forEach(report => {
          const type = report.reportType || 'general';
          summary.reportTypes.set(type, (summary.reportTypes.get(type) || 0) + 1);
        });

        // Get recent reports
        summary.recentReports = reports
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(report => ({
            id: report._id,
            fileName: report.fileName,
            processingStatus: report.processingStatus,
            confidence: report.confidence,
            createdAt: report.createdAt,
            hasHealthMetrics: !!report.healthMetrics
          }));
      }

      return {
        success: true,
        data: {
          ...summary,
          reportTypes: Array.from(summary.reportTypes.entries()).map(([type, count]) => ({ type, count }))
        }
      };

    } catch (error) {
      console.error('Report summary error:', error);
      return {
        success: false,
        message: 'Failed to get report summary'
      };
    }
  }

  // Get medication insights
  async getMedicationInsights(userId, timeframe) {
    try {
      const dateRange = this.getDateRange(timeframe);
      
      const reminders = await Reminder.find({
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: dateRange.start, $lte: dateRange.end }
      });

      const insights = {
        totalMedications: reminders.length,
        activeMedications: reminders.filter(r => r.isActive).length,
        medicationCategories: new Map(),
        frequencyDistribution: new Map(),
        adherenceByTime: new Map(),
        missedDosePatterns: []
      };

      reminders.forEach(reminder => {
        // Category analysis (simplified)
        const category = this.categorizeMedicine(reminder.medicineName);
        insights.medicationCategories.set(category, 
          (insights.medicationCategories.get(category) || 0) + 1);

        // Frequency analysis
        insights.frequencyDistribution.set(reminder.frequency,
          (insights.frequencyDistribution.get(reminder.frequency) || 0) + 1);

        // Time-based adherence analysis
        reminder.times.forEach(time => {
          const hour = parseInt(time.split(':')[0]);
          const timeSlot = this.getTimeSlot(hour);
          
          if (!insights.adherenceByTime.has(timeSlot)) {
            insights.adherenceByTime.set(timeSlot, { scheduled: 0, taken: 0 });
          }
          
          const timeData = insights.adherenceByTime.get(timeSlot);
          
          reminder.adherenceLog.forEach(log => {
            const logHour = new Date(log.scheduledTime).getHours();
            if (this.getTimeSlot(logHour) === timeSlot) {
              timeData.scheduled++;
              if (log.status === 'taken') {
                timeData.taken++;
              }
            }
          });
        });
      });

      // Convert maps to arrays
      const processedInsights = {
        ...insights,
        medicationCategories: Array.from(insights.medicationCategories.entries())
          .map(([category, count]) => ({ category, count })),
        frequencyDistribution: Array.from(insights.frequencyDistribution.entries())
          .map(([frequency, count]) => ({ frequency, count })),
        adherenceByTime: Array.from(insights.adherenceByTime.entries())
          .map(([timeSlot, data]) => ({
            timeSlot,
            ...data,
            adherenceRate: data.scheduled > 0 ? Math.round((data.taken / data.scheduled) * 100) : 0
          }))
      };

      return {
        success: true,
        data: processedInsights
      };

    } catch (error) {
      console.error('Medication insights error:', error);
      return {
        success: false,
        message: 'Failed to get medication insights'
      };
    }
  }

  // Calculate overall health score
  calculateHealthScore(data) {
    let score = 0;
    let factors = 0;

    // Adherence score (40% weight)
    if (data.adherence && data.adherence.adherencePercentage !== undefined) {
      score += (data.adherence.adherencePercentage / 100) * 40;
      factors += 40;
    }

    // Health trends score (30% weight)
    if (data.trends && data.trends.trends) {
      const normalMetrics = data.trends.trends.filter(t => 
        t.latestValue && t.latestValue.isNormal
      ).length;
      const totalMetrics = data.trends.trends.length;
      
      if (totalMetrics > 0) {
        score += (normalMetrics / totalMetrics) * 30;
        factors += 30;
      }
    }

    // Report activity score (20% weight)
    if (data.reports && data.reports.totalReports !== undefined) {
      const recentActivity = Math.min(data.reports.totalReports / 5, 1); // Max 5 reports for full score
      score += recentActivity * 20;
      factors += 20;
    }

    // Consistency bonus (10% weight)
    if (data.adherence && data.adherence.streakDays !== undefined) {
      const consistencyScore = Math.min(data.adherence.streakDays / 7, 1); // Max 7 days for full score
      score += consistencyScore * 10;
      factors += 10;
    }

    return factors > 0 ? Math.round(score / factors * 100) : 0;
  }

  // Generate personalized recommendations
  generateRecommendations(data) {
    const recommendations = [];

    // Adherence recommendations
    if (data.adherence) {
      if (data.adherence.adherencePercentage < 80) {
        recommendations.push({
          type: 'adherence',
          priority: 'high',
          title: 'Improve Medication Adherence',
          description: `Your adherence rate is ${data.adherence.adherencePercentage}%. Try setting more reminders or using a pill organizer.`,
          actionable: true,
          category: 'Medication Management'
        });
      }

      if (data.adherence.onTimePercentage < 70) {
        recommendations.push({
          type: 'timing',
          priority: 'medium',
          title: 'Take Medications On Time',
          description: 'Consider adjusting your reminder times to better fit your daily routine.',
          actionable: true,
          category: 'Medication Timing'
        });
      }
    }

    // Health trends recommendations
    if (data.trends && data.trends.abnormalTrends && data.trends.abnormalTrends.length > 0) {
      const recentAbnormal = data.trends.abnormalTrends.slice(-3);
      if (recentAbnormal.length > 0) {
        recommendations.push({
          type: 'health_monitoring',
          priority: 'high',
          title: 'Monitor Abnormal Health Values',
          description: `You have ${recentAbnormal.length} recent abnormal readings. Consider consulting your healthcare provider.`,
          actionable: true,
          category: 'Health Monitoring'
        });
      }
    }

    // Report activity recommendations
    if (data.reports && data.reports.totalReports < 2) {
      recommendations.push({
        type: 'reporting',
        priority: 'low',
        title: 'Upload More Health Reports',
        description: 'Regular health report uploads help track your progress over time.',
        actionable: true,
        category: 'Health Tracking'
      });
    }

    return recommendations;
  }

  // Helper methods
  getDateRange(timeframe) {
    const end = new Date();
    const start = new Date();

    switch (timeframe) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }

    return { start, end };
  }

  calculateAdherenceStreak(dailyData, dateRange) {
    let streak = 0;
    const today = new Date();
    
    for (let d = new Date(today); d >= dateRange.start; d.setDate(d.getDate() - 1)) {
      const dayKey = d.toISOString().split('T')[0];
      const dayData = dailyData.get(dayKey);
      
      if (dayData && dayData.scheduled > 0) {
        const adherenceRate = dayData.taken / dayData.scheduled;
        if (adherenceRate >= 0.8) { // 80% adherence threshold
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  }

  analyzeTrend(values) {
    if (values.length < 2) {
      return { trend: 'insufficient_data', change: 0, changePercentage: 0 };
    }

    const first = values[0].value;
    const last = values[values.length - 1].value;
    const change = last - first;
    const changePercentage = first !== 0 ? Math.round((change / first) * 100) : 0;

    let trend = 'stable';
    if (Math.abs(changePercentage) > 10) {
      trend = changePercentage > 0 ? 'increasing' : 'decreasing';
    }

    return { trend, change, changePercentage };
  }

  calculateAbnormalSeverity(value, normalRange) {
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

  identifyImprovementAreas(trends, abnormalTrends) {
    const areas = [];
    
    // Find consistently abnormal metrics
    const abnormalMetrics = new Map();
    abnormalTrends.forEach(trend => {
      abnormalMetrics.set(trend.metricName, 
        (abnormalMetrics.get(trend.metricName) || 0) + 1);
    });

    abnormalMetrics.forEach((count, metricName) => {
      if (count >= 2) {
        areas.push({
          area: metricName,
          priority: count >= 3 ? 'high' : 'medium',
          description: `${metricName} has been abnormal ${count} times recently`
        });
      }
    });

    return areas;
  }

  categorizeMedicine(medicineName) {
    const name = medicineName.toLowerCase();
    
    if (name.includes('lisinopril') || name.includes('amlodipine')) return 'Blood Pressure';
    if (name.includes('metformin') || name.includes('insulin')) return 'Diabetes';
    if (name.includes('atorvastatin') || name.includes('lipitor')) return 'Cholesterol';
    if (name.includes('omeprazole') || name.includes('prilosec')) return 'Digestive';
    
    return 'Other';
  }

  getTimeSlot(hour) {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      supportedTimeframes: ['7d', '30d', '90d', '1y'],
      analyticsTypes: ['adherence', 'health_trends', 'reports', 'medications']
    };
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = analyticsService;