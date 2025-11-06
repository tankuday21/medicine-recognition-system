class SymptomCheckerService {
  constructor() {
    this.symptoms = this.initializeSymptoms();
    this.conditions = this.initializeConditions();
    this.bodyParts = this.initializeBodyParts();
    console.log('🩺 Symptom Checker Service initialized');
    console.log(`📋 Loaded ${Object.keys(this.symptoms).length} symptoms and ${Object.keys(this.conditions).length} conditions`);
  }

  // Initialize comprehensive symptom database
  initializeSymptoms() {
    return {
      // General symptoms
      fever: {
        name: 'Fever',
        category: 'general',
        bodyParts: ['general'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['infection', 'inflammation', 'immune_response'],
        criticalThreshold: 'severe'
      },
      fatigue: {
        name: 'Fatigue',
        category: 'general',
        bodyParts: ['general'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['sleep_deprivation', 'stress', 'infection', 'anemia']
      },
      chills: {
        name: 'Chills',
        category: 'general',
        bodyParts: ['general'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['fever', 'infection', 'cold_exposure']
      },
      weight_loss: {
        name: 'Unexplained Weight Loss',
        category: 'general',
        bodyParts: ['general'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['metabolic_disorder', 'cancer', 'hyperthyroidism'],
        criticalThreshold: 'moderate'
      },

      // Head and neurological
      headache: {
        name: 'Headache',
        category: 'neurological',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['tension', 'migraine', 'sinus', 'dehydration'],
        criticalThreshold: 'severe'
      },
      dizziness: {
        name: 'Dizziness',
        category: 'neurological',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['dehydration', 'low_blood_pressure', 'inner_ear']
      },
      confusion: {
        name: 'Confusion',
        category: 'neurological',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['infection', 'medication', 'dehydration'],
        criticalThreshold: 'mild'
      },
      memory_loss: {
        name: 'Memory Loss',
        category: 'neurological',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['aging', 'stress', 'dementia', 'medication']
      },

      // Respiratory
      cough: {
        name: 'Cough',
        category: 'respiratory',
        bodyParts: ['chest', 'throat'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['cold', 'flu', 'allergies', 'infection']
      },
      shortness_of_breath: {
        name: 'Shortness of Breath',
        category: 'respiratory',
        bodyParts: ['chest'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['asthma', 'heart_disease', 'anxiety', 'infection'],
        criticalThreshold: 'moderate'
      },
      chest_pain: {
        name: 'Chest Pain',
        category: 'cardiovascular',
        bodyParts: ['chest'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['heart_disease', 'muscle_strain', 'anxiety', 'acid_reflux'],
        criticalThreshold: 'moderate'
      },
      wheezing: {
        name: 'Wheezing',
        category: 'respiratory',
        bodyParts: ['chest'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['asthma', 'allergies', 'infection']
      },

      // Gastrointestinal
      nausea: {
        name: 'Nausea',
        category: 'gastrointestinal',
        bodyParts: ['abdomen'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['food_poisoning', 'medication', 'pregnancy', 'motion_sickness']
      },
      vomiting: {
        name: 'Vomiting',
        category: 'gastrointestinal',
        bodyParts: ['abdomen'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['food_poisoning', 'infection', 'medication', 'pregnancy']
      },
      diarrhea: {
        name: 'Diarrhea',
        category: 'gastrointestinal',
        bodyParts: ['abdomen'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['food_poisoning', 'infection', 'medication', 'stress']
      },
      constipation: {
        name: 'Constipation',
        category: 'gastrointestinal',
        bodyParts: ['abdomen'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['diet', 'dehydration', 'medication', 'lack_of_exercise']
      },
      abdominal_pain: {
        name: 'Abdominal Pain',
        category: 'gastrointestinal',
        bodyParts: ['abdomen'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['indigestion', 'gas', 'infection', 'appendicitis'],
        criticalThreshold: 'severe'
      },

      // Musculoskeletal
      joint_pain: {
        name: 'Joint Pain',
        category: 'musculoskeletal',
        bodyParts: ['arms', 'legs', 'back'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['arthritis', 'injury', 'overuse', 'infection']
      },
      muscle_pain: {
        name: 'Muscle Pain',
        category: 'musculoskeletal',
        bodyParts: ['arms', 'legs', 'back', 'chest'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['overuse', 'strain', 'infection', 'medication']
      },
      back_pain: {
        name: 'Back Pain',
        category: 'musculoskeletal',
        bodyParts: ['back'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['muscle_strain', 'poor_posture', 'injury', 'disc_problem']
      },
      stiffness: {
        name: 'Stiffness',
        category: 'musculoskeletal',
        bodyParts: ['arms', 'legs', 'back', 'neck'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['arthritis', 'inactivity', 'injury', 'aging']
      },

      // Skin
      rash: {
        name: 'Rash',
        category: 'dermatological',
        bodyParts: ['arms', 'legs', 'chest', 'back', 'face'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['allergies', 'infection', 'irritation', 'autoimmune']
      },
      itching: {
        name: 'Itching',
        category: 'dermatological',
        bodyParts: ['arms', 'legs', 'chest', 'back', 'face'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['allergies', 'dry_skin', 'infection', 'medication']
      },

      // Eyes, Ears, Nose, Throat
      sore_throat: {
        name: 'Sore Throat',
        category: 'respiratory',
        bodyParts: ['throat'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['viral_infection', 'bacterial_infection', 'allergies', 'dry_air']
      },
      runny_nose: {
        name: 'Runny Nose',
        category: 'respiratory',
        bodyParts: ['face'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['cold', 'allergies', 'sinus_infection']
      },
      ear_pain: {
        name: 'Ear Pain',
        category: 'ent',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['infection', 'wax_buildup', 'pressure_changes']
      },
      vision_changes: {
        name: 'Vision Changes',
        category: 'ophthalmological',
        bodyParts: ['head'],
        severity: ['mild', 'moderate', 'severe'],
        commonCauses: ['refractive_error', 'eye_strain', 'infection', 'retinal_problem'],
        criticalThreshold: 'moderate'
      }
    };
  }

  // Initialize medical conditions database
  initializeConditions() {
    return {
      common_cold: {
        name: 'Common Cold',
        probability: 0.8,
        symptoms: ['runny_nose', 'sore_throat', 'cough', 'fatigue'],
        severity: 'mild',
        selfCare: [
          'Rest and get plenty of sleep',
          'Drink lots of fluids',
          'Use a humidifier',
          'Gargle with salt water'
        ],
        seeDoctor: 'If symptoms worsen or last more than 10 days'
      },
      flu: {
        name: 'Influenza (Flu)',
        probability: 0.7,
        symptoms: ['fever', 'fatigue', 'muscle_pain', 'headache', 'cough'],
        severity: 'moderate',
        selfCare: [
          'Rest and stay hydrated',
          'Take fever reducers as needed',
          'Avoid contact with others'
        ],
        seeDoctor: 'If you have difficulty breathing, persistent fever, or are in a high-risk group'
      },
      migraine: {
        name: 'Migraine Headache',
        probability: 0.6,
        symptoms: ['headache', 'nausea', 'vision_changes'],
        severity: 'moderate',
        selfCare: [
          'Rest in a dark, quiet room',
          'Apply cold compress to head',
          'Stay hydrated',
          'Avoid triggers'
        ],
        seeDoctor: 'If headaches are severe, frequent, or accompanied by neurological symptoms'
      },
      gastroenteritis: {
        name: 'Gastroenteritis (Stomach Bug)',
        probability: 0.7,
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'],
        severity: 'moderate',
        selfCare: [
          'Stay hydrated with clear fluids',
          'Rest and avoid solid foods initially',
          'Gradually reintroduce bland foods'
        ],
        seeDoctor: 'If you have signs of dehydration, blood in stool, or severe abdominal pain'
      },
      anxiety: {
        name: 'Anxiety',
        probability: 0.5,
        symptoms: ['chest_pain', 'shortness_of_breath', 'dizziness', 'fatigue'],
        severity: 'mild',
        selfCare: [
          'Practice deep breathing exercises',
          'Try relaxation techniques',
          'Regular exercise',
          'Limit caffeine'
        ],
        seeDoctor: 'If anxiety interferes with daily activities or you have panic attacks'
      },
      heart_attack: {
        name: 'Heart Attack',
        probability: 0.1,
        symptoms: ['chest_pain', 'shortness_of_breath', 'nausea', 'fatigue'],
        severity: 'critical',
        emergency: true,
        selfCare: [],
        seeDoctor: 'EMERGENCY: Call 911 immediately'
      },
      stroke: {
        name: 'Stroke',
        probability: 0.05,
        symptoms: ['confusion', 'headache', 'vision_changes', 'dizziness'],
        severity: 'critical',
        emergency: true,
        selfCare: [],
        seeDoctor: 'EMERGENCY: Call 911 immediately'
      },
      appendicitis: {
        name: 'Appendicitis',
        probability: 0.1,
        symptoms: ['abdominal_pain', 'nausea', 'vomiting', 'fever'],
        severity: 'critical',
        emergency: true,
        selfCare: [],
        seeDoctor: 'EMERGENCY: Seek immediate medical attention'
      }
    };
  }

  // Initialize body parts for visual selection
  initializeBodyParts() {
    return {
      head: {
        name: 'Head',
        symptoms: ['headache', 'dizziness', 'confusion', 'memory_loss', 'ear_pain', 'vision_changes']
      },
      face: {
        name: 'Face',
        symptoms: ['runny_nose', 'rash', 'itching']
      },
      throat: {
        name: 'Throat',
        symptoms: ['sore_throat', 'cough']
      },
      chest: {
        name: 'Chest',
        symptoms: ['chest_pain', 'shortness_of_breath', 'cough', 'wheezing', 'muscle_pain']
      },
      abdomen: {
        name: 'Abdomen',
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'constipation', 'abdominal_pain']
      },
      back: {
        name: 'Back',
        symptoms: ['back_pain', 'muscle_pain', 'stiffness', 'rash']
      },
      arms: {
        name: 'Arms',
        symptoms: ['joint_pain', 'muscle_pain', 'stiffness', 'rash', 'itching']
      },
      legs: {
        name: 'Legs',
        symptoms: ['joint_pain', 'muscle_pain', 'stiffness', 'rash', 'itching']
      },
      general: {
        name: 'General/Whole Body',
        symptoms: ['fever', 'fatigue', 'chills', 'weight_loss']
      }
    };
  }

  // Search symptoms by name or body part
  searchSymptoms(query, bodyPart = null) {
    try {
      const results = [];
      const searchTerm = query.toLowerCase();

      Object.entries(this.symptoms).forEach(([key, symptom]) => {
        const matchesQuery = symptom.name.toLowerCase().includes(searchTerm) ||
                           key.toLowerCase().includes(searchTerm);
        
        const matchesBodyPart = !bodyPart || symptom.bodyParts.includes(bodyPart);

        if (matchesQuery && matchesBodyPart) {
          results.push({
            id: key,
            ...symptom
          });
        }
      });

      return {
        success: true,
        data: results.slice(0, 20) // Limit results
      };
    } catch (error) {
      console.error('Symptom search error:', error);
      return {
        success: false,
        message: 'Failed to search symptoms'
      };
    }
  }

  // Get symptoms by body part
  getSymptomsByBodyPart(bodyPart) {
    try {
      if (!this.bodyParts[bodyPart]) {
        return {
          success: false,
          message: 'Invalid body part'
        };
      }

      const symptomIds = this.bodyParts[bodyPart].symptoms;
      const symptoms = symptomIds.map(id => ({
        id,
        ...this.symptoms[id]
      }));

      return {
        success: true,
        data: symptoms
      };
    } catch (error) {
      console.error('Get symptoms by body part error:', error);
      return {
        success: false,
        message: 'Failed to get symptoms'
      };
    }
  }

  // Get all body parts
  getBodyParts() {
    try {
      const bodyParts = Object.entries(this.bodyParts).map(([key, part]) => ({
        id: key,
        ...part
      }));

      return {
        success: true,
        data: bodyParts
      };
    } catch (error) {
      console.error('Get body parts error:', error);
      return {
        success: false,
        message: 'Failed to get body parts'
      };
    }
  }

  // Analyze symptoms and suggest conditions
  analyzeSymptoms(selectedSymptoms) {
    try {
      console.log('🔍 Analyzing symptoms:', selectedSymptoms.map(s => s.symptomId));

      const results = [];
      let hasEmergencySymptoms = false;

      // Check each condition against selected symptoms
      Object.entries(this.conditions).forEach(([conditionId, condition]) => {
        const matchingSymptoms = condition.symptoms.filter(symptomId =>
          selectedSymptoms.some(selected => selected.symptomId === symptomId)
        );

        if (matchingSymptoms.length > 0) {
          // Calculate probability based on symptom matches and severity
          let probability = (matchingSymptoms.length / condition.symptoms.length) * condition.probability;
          
          // Adjust probability based on symptom severity
          selectedSymptoms.forEach(selected => {
            if (matchingSymptoms.includes(selected.symptomId)) {
              if (selected.severity === 'severe') {
                probability *= 1.2;
              } else if (selected.severity === 'mild') {
                probability *= 0.8;
              }
            }
          });

          // Cap probability at 1.0
          probability = Math.min(probability, 1.0);

          results.push({
            conditionId,
            condition: condition.name,
            probability: Math.round(probability * 100),
            severity: condition.severity,
            emergency: condition.emergency || false,
            matchingSymptoms: matchingSymptoms.length,
            totalSymptoms: condition.symptoms.length,
            selfCare: condition.selfCare,
            seeDoctor: condition.seeDoctor
          });

          if (condition.emergency) {
            hasEmergencySymptoms = true;
          }
        }
      });

      // Sort by probability (highest first)
      results.sort((a, b) => b.probability - a.probability);

      // Check for critical symptoms
      const criticalSymptoms = selectedSymptoms.filter(selected => {
        const symptom = this.symptoms[selected.symptomId];
        return symptom && symptom.criticalThreshold && 
               this.isSeverityAtOrAbove(selected.severity, symptom.criticalThreshold);
      });

      return {
        success: true,
        data: {
          conditions: results.slice(0, 5), // Top 5 matches
          hasEmergencySymptoms,
          criticalSymptoms: criticalSymptoms.map(s => ({
            ...s,
            name: this.symptoms[s.symptomId].name
          })),
          recommendSeekCare: hasEmergencySymptoms || criticalSymptoms.length > 0,
          analysisDate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Symptom analysis error:', error);
      return {
        success: false,
        message: 'Failed to analyze symptoms'
      };
    }
  }

  // Check if severity level meets threshold
  isSeverityAtOrAbove(severity, threshold) {
    const severityLevels = { mild: 1, moderate: 2, severe: 3 };
    return severityLevels[severity] >= severityLevels[threshold];
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      totalSymptoms: Object.keys(this.symptoms).length,
      totalConditions: Object.keys(this.conditions).length,
      bodyParts: Object.keys(this.bodyParts).length,
      categories: [...new Set(Object.values(this.symptoms).map(s => s.category))]
    };
  }
}

// Create singleton instance
const symptomCheckerService = new SymptomCheckerService();

module.exports = symptomCheckerService;