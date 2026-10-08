import moment from 'moment';

/**
 * Computes all AI Memory Engine statistics, achievements, and trends from a user's interview history.
 * @param {Array} interviews - List of completed interviews for the current user
 * @returns {Object} Memory engine insights
 */
export function computeMemoryInsights(interviews = []) {
  const completed = (interviews || [])
    .filter(i => i.status === 'completed')
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); // chronological order

  const count = completed.length;

  if (count === 0) {
    return {
      totalInterviews: 0,
      streak: 0,
      mostImprovedSkill: 'N/A',
      biggestWeakness: 'N/A',
      overallGrowth: 0,
      latestAchievement: { name: 'None', desc: 'Complete your first mock session to begin!' },
      nextFocusArea: 'Take First Interview',
      achievementsList: getBaseAchievements(false, false, false, false, false, false, false, false, false),
      motivationMessage: "Welcome to InterviewIQ! Take your first interview to initialize the AI Memory Engine.",
      timelineData: []
    };
  }

  // 1. Calculate Streak
  let streak = 0;
  try {
    const dates = completed.map(i => moment(i.created_date).format('YYYY-MM-DD'));
    const uniqueDates = [...new Set(dates)].sort(); // sorted ascending
    
    if (uniqueDates.length > 0) {
      let currentStreak = 1;
      let lastDate = moment(uniqueDates[uniqueDates.length - 1]);
      const today = moment().startOf('day');
      const yesterday = moment().subtract(1, 'day').startOf('day');
      
      // Only active if last interview was today or yesterday
      if (lastDate.isSame(today, 'day') || lastDate.isSame(yesterday, 'day')) {
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const prevDate = moment(uniqueDates[i]);
          const diff = lastDate.diff(prevDate, 'days');
          if (diff === 1) {
            currentStreak++;
            lastDate = prevDate;
          } else if (diff > 1) {
            break;
          }
        }
        streak = currentStreak;
      }
    }
  } catch (e) {
    console.error("Streak calculation error:", e);
    streak = 0;
  }

  // 2. Score Categories to Analyze
  const categories = [
    { key: 'technical_score', label: 'Technical' },
    { key: 'communication_score', label: 'Communication' },
    { key: 'confidence_score', label: 'Confidence' },
    { key: 'fluency_score', label: 'Fluency' },
    { key: 'grammar_score', label: 'Grammar' },
    { key: 'hr_score', label: 'HR/Behavioral' },
    { key: 'pronunciation_score', label: 'Pronunciation' },
    { key: 'problem_solving_score', label: 'Problem Solving' },
    { key: 'leadership_score', label: 'Leadership' },
    { key: 'behavioral_score', label: 'Behavioral' },
    { key: 'eye_contact_score', label: 'Eye Gaze' },
    { key: 'vocabulary_score', label: 'Vocabulary' }
  ];

  const first = completed[0];
  const latest = completed[count - 1];

  // 3. Most Improved Skill
  let mostImprovedSkill = 'N/A';
  let maxImprovement = 0;
  
  if (count > 1) {
    categories.forEach(cat => {
      const firstVal = first[cat.key] || 0;
      const latestVal = latest[cat.key] || 0;
      const improvement = latestVal - firstVal;
      if (improvement > maxImprovement) {
        maxImprovement = improvement;
        mostImprovedSkill = cat.label;
      }
    });
  }

  // 4. Biggest Weakness & Next Focus Area (Lowest Average Score)
  let biggestWeakness = 'N/A';
  let lowestAvgScore = 100;
  
  categories.forEach(cat => {
    const sum = completed.reduce((acc, curr) => acc + (curr[cat.key] || 0), 0);
    const avg = sum / count;
    if (avg < lowestAvgScore && avg > 0) { // filter out completely un-evaluated values
      lowestAvgScore = avg;
      biggestWeakness = cat.label;
    }
  });

  if (biggestWeakness === 'N/A') {
    biggestWeakness = 'Technical';
  }

  // 5. Next Focus Area Recommendations
  let nextFocusArea = 'Database & System design';
  if (biggestWeakness === 'Communication') nextFocusArea = 'Verbal pacing & filler words';
  else if (biggestWeakness === 'Confidence') nextFocusArea = 'Mock session simulation under time bounds';
  else if (biggestWeakness === 'Fluency') nextFocusArea = 'Answering without trailing sentences';
  else if (biggestWeakness === 'HR/Behavioral' || biggestWeakness === 'Behavioral') nextFocusArea = 'Behavioral frameworks (STAR method)';
  else if (biggestWeakness === 'Pronunciation') nextFocusArea = 'Clear speaking articulation exercises';
  else if (biggestWeakness === 'Problem Solving') nextFocusArea = 'DSA complexity analysis details';
  else if (biggestWeakness === 'Leadership') nextFocusArea = 'Resolving team/technical conflicts';
  else if (biggestWeakness === 'Eye Gaze') nextFocusArea = 'Camera focus & posture alignment';
  else if (biggestWeakness === 'Vocabulary') nextFocusArea = 'Use of precise programming terminologies';

  // 6. Overall Growth
  const overallGrowth = (latest.overall_score || 0) - (first.overall_score || 0);

  // 7. Achievements unlocking
  const unlockedAchievements = {
    firstCompleted: count >= 1,
    communicationImproved: count >= 2 && (latest.communication_score || 0) > (first.communication_score || 0),
    technicalExpert: (latest.technical_score || 0) >= 85,
    confidenceBuilder: (latest.confidence_score || 0) >= 80,
    interviewStreak: streak >= 3,
    rapidLearner: count >= 2 && overallGrowth >= 10,
    projectMaster: (latest.problem_solving_score || 0) >= 85,
    behavioralChampion: (latest.behavioral_score || latest.hr_score || 0) >= 85,
    consistencyAward: count >= 5
  };

  const achievementsList = getBaseAchievements(
    unlockedAchievements.firstCompleted,
    unlockedAchievements.communicationImproved,
    unlockedAchievements.technicalExpert,
    unlockedAchievements.confidenceBuilder,
    unlockedAchievements.interviewStreak,
    unlockedAchievements.rapidLearner,
    unlockedAchievements.projectMaster,
    unlockedAchievements.behavioralChampion,
    unlockedAchievements.consistencyAward
  );

  const unlockedOnly = achievementsList.filter(a => a.unlocked);
  const latestAchievement = unlockedOnly.length > 0 
    ? unlockedOnly[unlockedOnly.length - 1] 
    : { name: 'Initiate Round', desc: 'Complete your first mock round to unlock badges.' };

  // 8. Dynamic AI Motivation Message
  let motivationMessage = "You're doing great! Complete another session to establish your performance trends.";
  if (streak >= 3) {
    motivationMessage = `Outstanding consistency! You are on a ${streak}-day mock interview streak. Keep this momentum going!`;
  } else if (overallGrowth >= 15) {
    motivationMessage = `Incredible progress! Your overall score has climbed by ${overallGrowth}% since you started. You're getting closer to your placement goals.`;
  } else if (unlockedAchievements.technicalExpert) {
    motivationMessage = "Technical Expert badge unlocked! Keep building on this baseline to ace actual system design reviews.";
  } else if (count >= 5) {
    motivationMessage = `You have completed ${count} mock sessions. Focus on improving your ${biggestWeakness.toLowerCase()} for the next round.`;
  }

  // 9. Process timeline data for Recharts
  const timelineData = completed.map((item, idx) => ({
    name: `Round ${idx + 1}`,
    date: moment(item.created_date).format('MMM DD'),
    role: item.job_role || 'General',
    overall: item.overall_score || 0,
    technical: item.technical_score || 0,
    communication: item.communication_score || 0,
    confidence: item.confidence_score || 0
  }));

  return {
    totalInterviews: count,
    streak,
    mostImprovedSkill,
    biggestWeakness,
    overallGrowth,
    latestAchievement,
    nextFocusArea,
    achievementsList,
    motivationMessage,
    timelineData
  };
}

function getBaseAchievements(first, comm, tech, conf, streak, rapid, proj, beh, consist) {
  return [
    {
      id: 'first_completed',
      name: 'First Interview',
      desc: 'Completed your first AI-evaluated mock interview round.',
      unlocked: first,
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'comm_improved',
      name: 'Speech Pioneer',
      desc: 'Improved communication metric relative to your first interview.',
      unlocked: comm,
      color: 'from-emerald-600 to-teal-500'
    },
    {
      id: 'tech_expert',
      name: 'Technical Expert',
      desc: 'Achieved a score of 85% or higher in the technical category.',
      unlocked: tech,
      color: 'from-violet-600 to-fuchsia-500'
    },
    {
      id: 'conf_builder',
      name: 'Confidence Builder',
      desc: 'Achieved a score of 80% or higher in sentence and volume delivery.',
      unlocked: conf,
      color: 'from-pink-600 to-rose-500'
    },
    {
      id: 'streak_award',
      name: 'Interview Streak',
      desc: 'Maintained consecutive mock practice sessions (3+ rounds).',
      unlocked: streak,
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'rapid_learner',
      name: 'Rapid Learner',
      desc: 'Improved overall score by 10% or more between interview sessions.',
      unlocked: rapid,
      color: 'from-indigo-600 to-blue-500'
    },
    {
      id: 'proj_master',
      name: 'Project Master',
      desc: 'Demonstrated high problem-solving capacity with scores above 85%.',
      unlocked: proj,
      color: 'from-cyan-600 to-teal-500'
    },
    {
      id: 'beh_champ',
      name: 'STAR Champion',
      desc: 'Mastered behavioral/HR scenarios with a metric above 85%.',
      unlocked: beh,
      color: 'from-purple-600 to-violet-500'
    },
    {
      id: 'consistency_award',
      name: 'Consistency Master',
      desc: 'Logged 5 or more completed mock sessions on the system.',
      unlocked: consist,
      color: 'from-rose-600 to-purple-500'
    }
  ];
}
