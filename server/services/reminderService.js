const { Reminder, Medicine } = require('../models');

class ReminderService {
  constructor() {
    console.log('✅ Reminder service initialized');
  }

  // Create a new reminder
  async createReminder(userId, reminderData) {
    try {
      console.log(`📅 Creating reminder for user: ${userId}`);
      
      // Validate required fields
      const { medicineName, dosage, frequency, startDate, times } = reminderData;
      
      if (!medicineName || !dosage || !frequency || !startDate || !times || times.length === 0) {
        return {
          success: false,
          message: 'Missing required fields: medicineName, dosage, frequency, startDate, and times are required'
        };
      }

      // Validate frequency and times match
      const expectedTimes = this.getExpectedTimesForFrequency(frequency);
      if (frequency !== 'custom' && times.length !== expectedTimes) {
        return {
          success: false,
          message: `Frequency '${frequency}' requires exactly ${expectedTimes} time(s)`
        };
      }

      // Try to find medicine in database
      let medicineId = null;
      if (reminderData.medicineId) {
        const medicine = await Medicine.findById(reminderData.medicineId);
        if (medicine) {
          medicineId = medicine._id;
        }
      } else {
        // Search by name
        const medicine = await Medicine.findOne({
          $or: [
            { name: new RegExp(medicineName, 'i') },
            { genericName: new RegExp(medicineName, 'i') }
          ]
        });
        if (medicine) {
          medicineId = medicine._id;
        }
      }

      // Create reminder
      const reminder = new Reminder({
        userId,
        medicineId,
        medicineName,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: reminderData.endDate ? new Date(reminderData.endDate) : null,
        times: times.sort(), // Sort times for consistency
        notes: reminderData.notes || ''
      });

      await reminder.save();

      // Populate medicine data if available
      await reminder.populate('medicineId', 'name genericName manufacturer uses');

      return {
        success: true,
        data: reminder,
        message: 'Reminder created successfully'
      };
    } catch (error) {
      console.error('Create reminder error:', error);
      return {
        success: false,
        message: 'Failed to create reminder'
      };
    }
  }

  // Get user's reminders
  async getUserReminders(userId, options = {}) {
    try {
      const { 
        isActive = null, 
        limit = 20, 
        offset = 0, 
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      console.log(`📋 Fetching reminders for user: ${userId}`);

      const query = { userId };
      if (isActive !== null) {
        query.isActive = isActive;
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reminders = await Reminder.find(query)
        .populate('medicineId', 'name genericName manufacturer uses')
        .sort(sort)
        .limit(limit)
        .skip(offset);

      const total = await Reminder.countDocuments(query);

      // Calculate adherence for each reminder
      const remindersWithAdherence = reminders.map(reminder => {
        const reminderObj = reminder.toObject();
        reminderObj.adherencePercentage = reminder.getAdherencePercentage();
        return reminderObj;
      });

      return {
        success: true,
        data: {
          reminders: remindersWithAdherence,
          total,
          hasMore: (offset + limit) < total
        }
      };
    } catch (error) {
      console.error('Get reminders error:', error);
      return {
        success: false,
        message: 'Failed to fetch reminders'
      };
    }
  }

  // Update reminder
  async updateReminder(userId, reminderId, updateData) {
    try {
      console.log(`📝 Updating reminder: ${reminderId}`);

      const reminder = await Reminder.findOne({ _id: reminderId, userId });
      if (!reminder) {
        return {
          success: false,
          message: 'Reminder not found'
        };
      }

      // Update allowed fields
      const allowedFields = ['medicineName', 'dosage', 'frequency', 'startDate', 'endDate', 'times', 'isActive', 'notes'];
      const updates = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });

      // Validate frequency and times if being updated
      if (updates.frequency && updates.times) {
        const expectedTimes = this.getExpectedTimesForFrequency(updates.frequency);
        if (updates.frequency !== 'custom' && updates.times.length !== expectedTimes) {
          return {
            success: false,
            message: `Frequency '${updates.frequency}' requires exactly ${expectedTimes} time(s)`
          };
        }
        updates.times = updates.times.sort();
      }

      const updatedReminder = await Reminder.findByIdAndUpdate(
        reminderId,
        updates,
        { new: true, runValidators: true }
      ).populate('medicineId', 'name genericName manufacturer uses');

      return {
        success: true,
        data: updatedReminder,
        message: 'Reminder updated successfully'
      };
    } catch (error) {
      console.error('Update reminder error:', error);
      return {
        success: false,
        message: 'Failed to update reminder'
      };
    }
  }

  // Delete reminder
  async deleteReminder(userId, reminderId) {
    try {
      console.log(`🗑️ Deleting reminder: ${reminderId}`);

      const reminder = await Reminder.findOneAndDelete({ _id: reminderId, userId });
      if (!reminder) {
        return {
          success: false,
          message: 'Reminder not found'
        };
      }

      return {
        success: true,
        message: 'Reminder deleted successfully'
      };
    } catch (error) {
      console.error('Delete reminder error:', error);
      return {
        success: false,
        message: 'Failed to delete reminder'
      };
    }
  }

  // Log dose taken/missed/skipped
  async logDose(userId, reminderId, logData) {
    try {
      console.log(`💊 Logging dose for reminder: ${reminderId}`);

      const { scheduledTime, status, takenTime, notes } = logData;
      
      if (!scheduledTime || !status) {
        return {
          success: false,
          message: 'scheduledTime and status are required'
        };
      }

      if (!['taken', 'missed', 'skipped'].includes(status)) {
        return {
          success: false,
          message: 'Status must be taken, missed, or skipped'
        };
      }

      const reminder = await Reminder.findOne({ _id: reminderId, userId });
      if (!reminder) {
        return {
          success: false,
          message: 'Reminder not found'
        };
      }

      // Check if log entry already exists for this scheduled time
      const existingLogIndex = reminder.adherenceLog.findIndex(
        log => log.scheduledTime.getTime() === new Date(scheduledTime).getTime()
      );

      const logEntry = {
        scheduledTime: new Date(scheduledTime),
        takenTime: takenTime ? new Date(takenTime) : (status === 'taken' ? new Date() : null),
        status,
        notes: notes || ''
      };

      if (existingLogIndex >= 0) {
        // Update existing log entry
        reminder.adherenceLog[existingLogIndex] = logEntry;
      } else {
        // Add new log entry
        reminder.adherenceLog.push(logEntry);
      }

      await reminder.save();

      return {
        success: true,
        data: {
          logEntry,
          adherencePercentage: reminder.getAdherencePercentage()
        },
        message: 'Dose logged successfully'
      };
    } catch (error) {
      console.error('Log dose error:', error);
      return {
        success: false,
        message: 'Failed to log dose'
      };
    }
  }

  // Get today's reminders for a user
  async getTodaysReminders(userId) {
    try {
      console.log(`📅 Getting today's reminders for user: ${userId}`);

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const reminders = await Reminder.find({
        userId,
        isActive: true,
        startDate: { $lte: today },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: today } }
        ]
      }).populate('medicineId', 'name genericName manufacturer');

      // Generate today's schedule
      const todaysSchedule = [];
      
      reminders.forEach(reminder => {
        reminder.times.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
          
          // Check if this dose was already logged
          const logEntry = reminder.adherenceLog.find(
            log => log.scheduledTime.getTime() === scheduledDateTime.getTime()
          );

          todaysSchedule.push({
            reminderId: reminder._id,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage,
            scheduledTime: scheduledDateTime,
            status: logEntry ? logEntry.status : 'pending',
            takenTime: logEntry ? logEntry.takenTime : null,
            notes: logEntry ? logEntry.notes : '',
            medicine: reminder.medicineId
          });
        });
      });

      // Sort by scheduled time
      todaysSchedule.sort((a, b) => a.scheduledTime - b.scheduledTime);

      return {
        success: true,
        data: todaysSchedule
      };
    } catch (error) {
      console.error('Get today\'s reminders error:', error);
      return {
        success: false,
        message: 'Failed to get today\'s reminders'
      };
    }
  }

  // Get adherence statistics
  async getAdherenceStats(userId, days = 30) {
    try {
      console.log(`📊 Getting adherence stats for user: ${userId}`);

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const reminders = await Reminder.find({
        userId,
        createdAt: { $lte: endDate }
      });

      let totalScheduled = 0;
      let totalTaken = 0;
      let totalMissed = 0;
      let totalSkipped = 0;

      reminders.forEach(reminder => {
        reminder.adherenceLog.forEach(log => {
          if (log.scheduledTime >= startDate && log.scheduledTime <= endDate) {
            totalScheduled++;
            switch (log.status) {
              case 'taken':
                totalTaken++;
                break;
              case 'missed':
                totalMissed++;
                break;
              case 'skipped':
                totalSkipped++;
                break;
            }
          }
        });
      });

      const adherencePercentage = totalScheduled > 0 ? Math.round((totalTaken / totalScheduled) * 100) : 0;

      return {
        success: true,
        data: {
          period: `${days} days`,
          totalScheduled,
          totalTaken,
          totalMissed,
          totalSkipped,
          adherencePercentage,
          startDate,
          endDate
        }
      };
    } catch (error) {
      console.error('Get adherence stats error:', error);
      return {
        success: false,
        message: 'Failed to get adherence statistics'
      };
    }
  }

  // Helper method to get expected times for frequency
  getExpectedTimesForFrequency(frequency) {
    switch (frequency) {
      case 'once':
        return 1;
      case 'twice':
        return 2;
      case 'thrice':
        return 3;
      case 'four_times':
        return 4;
      case 'custom':
        return null; // Any number allowed
      default:
        return null;
    }
  }

  // Generate default times for frequency
  getDefaultTimesForFrequency(frequency) {
    switch (frequency) {
      case 'once':
        return ['08:00'];
      case 'twice':
        return ['08:00', '20:00'];
      case 'thrice':
        return ['08:00', '14:00', '20:00'];
      case 'four_times':
        return ['08:00', '12:00', '16:00', '20:00'];
      default:
        return [];
    }
  }

  // Check for scheduling conflicts
  async getSchedulingConflicts(userId) {
    try {
      console.log(`🔍 Checking scheduling conflicts for user: ${userId}`);

      const reminders = await Reminder.find({
        userId,
        isActive: true
      });

      const conflicts = [];
      const timeSlots = {};

      // Group reminders by time slots
      reminders.forEach(reminder => {
        reminder.times.forEach(time => {
          if (!timeSlots[time]) {
            timeSlots[time] = [];
          }
          timeSlots[time].push({
            reminderId: reminder._id,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage
          });
        });
      });

      // Find conflicts (multiple medications at same time)
      Object.entries(timeSlots).forEach(([time, medications]) => {
        if (medications.length > 1) {
          conflicts.push({
            time,
            medications,
            severity: 'warning', // Could be enhanced to check for drug interactions
            message: `${medications.length} medications scheduled at ${time}`
          });
        }
      });

      return {
        success: true,
        data: {
          conflicts,
          totalConflicts: conflicts.length
        }
      };
    } catch (error) {
      console.error('Get scheduling conflicts error:', error);
      return {
        success: false,
        message: 'Failed to check scheduling conflicts'
      };
    }
  }

  // Get adherence data for calendar view
  async getAdherenceData(userId, startDate, endDate) {
    try {
      console.log(`📊 Getting adherence data for user ${userId} from ${startDate} to ${endDate}`);

      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Get all reminders for the user
      const reminders = await Reminder.find({
        userId,
        isActive: true,
        startDate: { $lte: end },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: start } }
        ]
      });

      console.log(`📋 Found ${reminders.length} active reminders for adherence calculation`);

      // Calculate adherence for each day in the range
      const adherenceData = {};
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        // Only calculate for past and current dates
        if (currentDate <= new Date()) {
          const dayAdherence = await this.calculateDayAdherence(reminders, currentDate);
          if (dayAdherence.totalExpected > 0) {
            adherenceData[dateKey] = {
              status: this.getAdherenceStatus(dayAdherence.percentage),
              percentage: Math.round(dayAdherence.percentage),
              taken: dayAdherence.taken,
              expected: dayAdherence.totalExpected,
              details: dayAdherence.details
            };
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`📈 Calculated adherence for ${Object.keys(adherenceData).length} days`);

      return {
        success: true,
        data: adherenceData,
        summary: this.calculateAdherenceSummary(adherenceData)
      };

    } catch (error) {
      console.error('Get adherence data error:', error);
      return {
        success: false,
        message: 'Failed to get adherence data'
      };
    }
  }

  // Calculate adherence for a specific day
  async calculateDayAdherence(reminders, date) {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dateKey = date.toISOString().split('T')[0];
    
    let totalExpected = 0;
    let totalTaken = 0;
    const details = [];

    for (const reminder of reminders) {
      // Check if reminder is active on this day
      if (this.isReminderActiveOnDate(reminder, date)) {
        const expectedDoses = this.getExpectedDosesForDay(reminder, date);
        const takenDoses = this.getTakenDosesForDay(reminder, date);
        
        totalExpected += expectedDoses;
        totalTaken += takenDoses;
        
        details.push({
          reminderId: reminder._id,
          medicineName: reminder.medicineName,
          expected: expectedDoses,
          taken: takenDoses,
          percentage: expectedDoses > 0 ? (takenDoses / expectedDoses) * 100 : 0
        });
      }
    }

    const percentage = totalExpected > 0 ? (totalTaken / totalExpected) * 100 : 0;

    return {
      totalExpected,
      taken: totalTaken,
      percentage,
      details
    };
  }

  // Check if reminder is active on a specific date
  isReminderActiveOnDate(reminder, date) {
    const reminderStart = new Date(reminder.startDate);
    const reminderEnd = reminder.endDate ? new Date(reminder.endDate) : null;
    
    // Check if date is within reminder range
    if (date < reminderStart) return false;
    if (reminderEnd && date > reminderEnd) return false;
    
    // Check frequency-specific rules
    switch (reminder.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        // Check if it's the right day of the week
        return reminder.daysOfWeek && reminder.daysOfWeek.includes(date.getDay());
      case 'monthly':
        // Check if it's the right day of the month
        return reminder.dayOfMonth === date.getDate();
      case 'custom':
        // For custom frequency, check interval
        const daysSinceStart = Math.floor((date - reminderStart) / (1000 * 60 * 60 * 24));
        return daysSinceStart % (reminder.intervalDays || 1) === 0;
      default:
        return true;
    }
  }

  // Get expected doses for a specific day
  getExpectedDosesForDay(reminder, date) {
    if (!this.isReminderActiveOnDate(reminder, date)) return 0;
    
    // Return the number of times per day for this reminder
    return reminder.times ? reminder.times.length : 1;
  }

  // Get taken doses for a specific day
  getTakenDosesForDay(reminder, date) {
    const dateKey = date.toISOString().split('T')[0];
    
    // Count logs for this date
    const dayLogs = reminder.adherenceLogs?.filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate === dateKey && log.status === 'taken';
    }) || [];
    
    return dayLogs.length;
  }

  // Determine adherence status based on percentage
  getAdherenceStatus(percentage) {
    if (percentage >= 90) return 'complete';
    if (percentage >= 50) return 'partial';
    return 'missed';
  }

  // Calculate summary statistics for adherence data
  calculateAdherenceSummary(adherenceData) {
    const days = Object.values(adherenceData);
    if (days.length === 0) return null;

    const totalDays = days.length;
    const completeDays = days.filter(d => d.status === 'complete').length;
    const partialDays = days.filter(d => d.status === 'partial').length;
    const missedDays = days.filter(d => d.status === 'missed').length;

    const totalTaken = days.reduce((sum, d) => sum + d.taken, 0);
    const totalExpected = days.reduce((sum, d) => sum + d.expected, 0);
    const overallPercentage = totalExpected > 0 ? (totalTaken / totalExpected) * 100 : 0;

    return {
      totalDays,
      completeDays,
      partialDays,
      missedDays,
      overallPercentage: Math.round(overallPercentage),
      streak: this.calculateCurrentStreak(adherenceData)
    };
  }

  // Calculate current adherence streak
  calculateCurrentStreak(adherenceData) {
    const sortedDates = Object.keys(adherenceData).sort().reverse();
    let streak = 0;
    
    for (const date of sortedDates) {
      const data = adherenceData[date];
      if (data.status === 'complete') {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}

module.exports = new ReminderService();