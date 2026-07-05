import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { base44 } from '../api/base44Client';
import { AIAvatar } from '../components/AIAvatar';
import { StrictModeGuard } from '../components/StrictModeGuard';
import { DifficultySelector } from '../components/DifficultySelector';
import { loadVoiceConfig } from '../components/VoiceSettings';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import { 
  Video, 
  Mic, 
  MicOff, 
  Play, 
  StopCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  AlertTriangle, 
  Volume2, 
  Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { getActiveRole, sendAutoReportEmail } from '../utils/emailService';

const findVoiceForAvatar = (voices, lang, gender) => {
  const langLower = lang.toLowerCase();
  const baseLang = langLower.split('-')[0];
  
  let langMatchedVoices = voices.filter(v => v.lang.toLowerCase() === langLower);
  if (langMatchedVoices.length === 0) {
    langMatchedVoices = voices.filter(v => v.lang.toLowerCase().startsWith(baseLang));
  }
  if (langMatchedVoices.length === 0) {
    langMatchedVoices = voices;
  }

  const femaleKeywords = ['zira', 'samantha', 'susan', 'hazel', 'heera', 'veena', 'tessa', 'moira', 'victoria', 'karen', 'melina', 'female', 'girl', 'woman', 'zira desktop'];
  const maleKeywords = ['david', 'ravi', 'alex', 'daniel', 'fred', 'oliver', 'male', 'boy', 'man', 'george', 'mark', 'rishi', 'david desktop'];

  let genderMatched = [];
  if (gender === 'female') {
    genderMatched = langMatchedVoices.filter(v => 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
  } else {
    genderMatched = langMatchedVoices.filter(v => 
      maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    );
  }

  if (genderMatched.length > 0) {
    return genderMatched[0];
  }
  if (langMatchedVoices.length > 0) {
    return langMatchedVoices[0];
  }
  return voices[0] || null;
};

export default function InterviewSession() {
  const { user, profile, refetchProfile } = useAuth();
  const navigate = useNavigate();

  // Stage: setup, live, ending, limit_error
  const [stage, setStage] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [limitError, setLimitError] = useState(false);

  // Session Preferences
  const [difficulty, setDifficulty] = useState('intermediate');
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [avatarGender, setAvatarGender] = useState('female');

  // Live state
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [transcript, setTranscript] = useState([]); // {q, a} list
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isWelcome, setIsWelcome] = useState(true); // true = welcome/intro phase

  // Speaking / Listening status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [warningsCount, setWarningsCount] = useState(0);

  // Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const transcriptRef = useRef([]);
  const streamRef = useRef(null);
  const interviewIdRef = useRef(null);

  const todayString = new Date().toISOString().split('T')[0];

  // 1. Verify Daily Limit on Load
  useEffect(() => {
    if (!profile) return;
    const dailyInterviews = profile.daily_interviews_count || 0;
    const isDateSame = profile.last_interview_date === todayString;
    const limitRemaining = isDateSame ? Math.max(0, 10 - dailyInterviews) : 10;

    if (limitRemaining <= 0) {
      setLimitError(true);
      setStage('limit_error');
    }
  }, [profile, todayString]);

  // 2. Clear timers and webcam on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 3. Questions Generation logic
  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    const activeRole = getActiveRole(profile);
    try {
      // Fetch today's questions to prevent duplication
      let todayAsked = [];
      try {
        const questionEntries = await base44.entities.QuestionBank.filter({
          asked_date: todayString,
          role: activeRole
        });
        todayAsked = (questionEntries || []).map(q => q.question_text);
      } catch (err) {
        console.warn("Failed fetching today's questions dedup:", err);
      }

      // Build resume context from saved analysis
      let resumeContext = '';
      if (profile.resume_analysis) {
        try {
          const ra = JSON.parse(profile.resume_analysis);
          resumeContext = [
            ra.candidate_summary ? `Candidate summary: ${ra.candidate_summary}` : '',
            ra.meta?.found_skills?.length ? `Detected skills from resume: ${ra.meta.found_skills.join(', ')}` : '',
            ra.strengths?.length ? `Resume strengths: ${ra.strengths.join('; ')}` : '',
            ra.missing_skills?.length ? `Gaps to probe: ${ra.missing_skills.join(', ')}` : '',
          ].filter(Boolean).join('\n');
        } catch {}
      }

      // Fetch user's previous completed interviews for adaptive questions
      let memoryContext = '';
      try {
        const list = await base44.entities.Interview.list();
        const history = (list || []).filter(i => i.status === 'completed' && i.created_by === user?.email);
        if (history.length > 0) {
          const avgTech = history.reduce((acc, c) => acc + (c.technical_score || 0), 0) / history.length;
          const avgComm = history.reduce((acc, c) => acc + (c.communication_score || 0), 0) / history.length;
          const avgConfidence = history.reduce((acc, c) => acc + (c.confidence_score || 0), 0) / history.length;
          const avgHR = history.reduce((acc, c) => acc + (c.hr_score || 0), 0) / history.length;
          
          const weakAreas = [];
          const strongAreas = [];
          
          if (avgTech < 75) weakAreas.push("technical concepts");
          else strongAreas.push("technical concepts");
          if (avgComm < 75) weakAreas.push("verbal pacing/speech speed");
          else strongAreas.push("verbal pacing/speech speed");
          if (avgConfidence < 75) weakAreas.push("confidence & fillers");
          else strongAreas.push("confidence & fillers");
          if (avgHR < 75) weakAreas.push("HR / behavioral frameworks");
          else strongAreas.push("HR / behavioral frameworks");
          
          memoryContext = `AI Long-Term Memory (Historical Performance of Candidate):
- Total past sessions completed: ${history.length}
- Historical Strengths: ${strongAreas.join(', ') || 'None yet'}
- Historical Weaknesses/Focus areas: ${weakAreas.join(', ') || 'None yet'}
- Average historical scores: Technical ${Math.round(avgTech)}%, Communication ${Math.round(avgComm)}%, Confidence ${Math.round(avgConfidence)}%, HR ${Math.round(avgHR)}%
- Personalization guidelines: Adjust the difficulty of questions dynamically. If they have mastered a domain (like React), increase depth/difficulty. If they are consistently weak in SQL/databases or HR, generate more challenging probe questions targeting those gaps.`;
        }
      } catch (err) {
        console.warn("Failed retrieving user memory context:", err);
      }

      const langName = selectedLang === 'hi-IN' ? 'Hindi' : selectedLang === 'te-IN' ? 'Telugu' : selectedLang === 'ta-IN' ? 'Tamil' : 'English';

      // Generate questions
      const prompt = `You are a Senior Technical Recruiter conducting a real interview.
      Create exactly 9 interview questions PERSONALISED to this specific candidate.
      Candidate name: ${profile.full_name || 'the candidate'}
      Target role: ${activeRole}
      Difficulty level: ${difficulty}
      Core skills declared: ${profile.skills}
      ${resumeContext ? `Resume intelligence:\n${resumeContext}` : ''}
      ${memoryContext ? `\n${memoryContext}` : ''}
      Questions already asked today — NEVER repeat these: ${JSON.stringify(todayAsked)}

      Rules:
      - Questions MUST reference the candidate's actual skills and resume details where possible
      - All generated questions MUST be written in ${langName} language.
      - 3 Technical questions probing declared and missing skills
      - 2 Scenario/situational questions relevant to their project experience
      - 2 Behavioral questions about collaboration and problem solving
      - 2 HR questions about aspirations and career goals
      - No two questions may be semantically similar
      - Do NOT include an introduction question (it will be asked separately)

      Return ONLY a JSON object with a single "questions" key containing an array of exactly 9 strings.
      { "questions": ["Question 1...", ...] }
      Output raw JSON only. No markdown, no extra text.`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const cleanText = (res.text || res || "{}")
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      const generatedList = parsed.questions || [];

      if (generatedList.length < 9) {
        throw new Error("Generated less than 9 questions.");
      }

      setQuestions(generatedList);

      // Save to QuestionBank
      try {
        const bankPayload = generatedList.map(q => ({
          question_text: q,
          role: activeRole,
          difficulty: difficulty,
          question_type: 'general',
          asked_date: todayString
        }));
        await base44.entities.QuestionBank.bulkCreate(bankPayload);
      } catch (saveErr) {
        console.error("Error logging to question bank:", saveErr);
      }

      // Proceed to live interview
      await startLiveStage();
    } catch (err) {
      console.error("Error generating questions:", err);
      toast.error("Failed to generate custom AI questions. Resetting details...");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // 4. Start live stage setup
  const startLiveStage = async () => {
    setLoading(true);
    try {
      // Request camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = selectedLang;

        rec.onstart = () => setIsListening(true);
        rec.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setUserAnswer(prev => prev + finalTranscript);
          }
        };
        rec.onerror = (e) => console.error("STT Error:", e.error);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }

      // Create Interview database entity
      const newInterview = await base44.entities.Interview.create({
        status: 'in_progress',
        questions_asked: 9,
        job_role: getActiveRole(profile),
        duration_seconds: 0
      });
      interviewIdRef.current = newInterview.id;

      // Update UserProfile daily count
      const currentCount = profile.daily_interviews_count || 0;
      await base44.entities.UserProfile.update(profile.id, {
        daily_interviews_count: currentCount + 1,
        last_interview_date: todayString
      });
      await refetchProfile();

      // Enter Live
      setIsWelcome(true);
      setStage('live');
      setTimeLeft(600);
      setDurationSeconds(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleEndInterview();
            return 0;
          }
          setDurationSeconds(d => d + 1);
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Camera permissions rejected:", err);
      toast.error("Camera and Microphone access are required to begin the interview.");
    } finally {
      setLoading(false);
    }
  };

  // Bind camera stream to video element whenever stage goes live
  useEffect(() => {
    if (stage === 'live' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [stage]);

  // 5. Speak welcome + first question when entering live stage
  useEffect(() => {
    if (stage !== 'live' || questions.length === 0) return;
    if (isWelcome) {
      const firstName = (profile?.full_name || 'there').split(' ')[0];
      const isNewUser = !profile?.last_interview_date;
      const welcomeMsg = isNewUser
        ? `Welcome ${firstName}! I'm your AI interviewer. Before we begin, please take a moment to introduce yourself — tell me about your background, skills, and what you're looking for in your next role.`
        : `Welcome back ${firstName}! Great to have you here for another practice session. Let's get started — please briefly introduce yourself and share what you've been working on recently.`;
      speakQuestion(welcomeMsg);
    } else {
      speakQuestion(questions[currentQIdx]);
    }
  }, [stage, currentQIdx, questions, isWelcome]);

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      setIsListening(true);
      recognitionRef.current?.start();
      return;
    }

    // Cancel any ongoing speaking
    window.speechSynthesis.cancel();
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setIsSpeaking(true);
    const voiceConfig = loadVoiceConfig();
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice settings matching avatar gender
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = findVoiceForAvatar(voices, selectedLang, avatarGender);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.rate = voiceConfig.rate || 1.0;
    utterance.pitch = voiceConfig.pitch || 1.0;
    utterance.lang = selectedLang;

    utterance.onend = () => {
      setIsSpeaking(false);
      setUserAnswer('');
      // Start listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to start speech recognition:", e);
        }
      } else {
        setIsListening(true);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // 6. Next Question trigger
  const handleNextQuestion = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const currentAnswer = userAnswer.trim() || '(No response recorded)';

    if (isWelcome) {
      // Save intro answer then move to Q1
      const introEntry = { q: 'Introduce yourself', a: currentAnswer };
      const updated = [introEntry];
      setTranscript(updated);
      transcriptRef.current = updated;
      setUserAnswer('');
      setIsWelcome(false);
      return;
    }

    const updatedTranscript = [...transcript, { q: questions[currentQIdx], a: currentAnswer }];
    setTranscript(updatedTranscript);
    transcriptRef.current = updatedTranscript;

    if (currentQIdx + 1 < questions.length) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      handleEndInterview();
    }
  };

  // 7. Complete and Evaluate interview
  const handleEndInterview = async () => {
    clearInterval(timerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setStage('ending');
    setLoading(true);

    const finalTranscript = transcriptRef.current;
    
    // Heuristic: Count total words spoken
    const totalWords = finalTranscript.reduce((acc, curr) => {
      const words = curr.a.split(/\s+/).filter(Boolean).length;
      return acc + words;
    }, 0);

    try {
      let scorePayload = {};
      let feedbackJsonString = "";

      if (totalWords < 20) {
        // Zero-answer guard
        toast.warning("Speech content too brief. Scoring was skipped.");
        scorePayload = {
          overall_score: 0,
          technical_score: 0,
          communication_score: 0,
          confidence_score: 0,
          fluency_score: 0,
          grammar_score: 0,
          hr_score: 0,
          pronunciation_score: 0,
          problem_solving_score: 0,
          leadership_score: 0,
          behavioral_score: 0,
          eye_contact_score: 0,
          speaking_speed: 0,
          filler_word_count: 0,
          long_pause_count: 0,
          vocabulary_score: 0
        };
        feedbackJsonString = JSON.stringify({
          strengths: [{ title: "Attempted Round", description: "You initiated the interview session, but did not verbally respond to the questions." }],
          weaknesses: [{ title: "No Speech Detected", description: "Less than 20 total words recorded. The AI could not evaluate your confidence or syntax." }],
          improvements: ["Speak loudly and clearly into your microphone.", "Ensure browser audio input permissions are allowed."],
          resources: [{ title: "Web Speech API Guide", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API" }],
          pronunciation_score: 0,
          problem_solving_score: 0,
          leadership_score: 0,
          behavioral_score: 0,
          eye_contact_score: 0,
          speaking_speed: 0,
          filler_word_count: 0,
          long_pause_count: 0,
          vocabulary_score: 0,
          strong_answers: [],
          weak_answers: [],
          mistakes: [],
          ai_suggestions: [],
          coaching_summary: "No voice transcripts found. Complete an interview with active responses to initialize coaching."
        });
      } else {
        // Retrieve past history to enable comparison
        let pastSummary = '';
        try {
          const list = await base44.entities.Interview.list();
          const history = (list || []).filter(i => i.status === 'completed' && i.created_by === user?.email && i.id !== interviewIdRef.current);
          if (history.length > 0) {
            const lastRound = history[history.length - 1];
            pastSummary = `Candidate's Last Completed Round Metrics:
- Overall Score: ${lastRound.overall_score || 0}%
- Technical Score: ${lastRound.technical_score || 0}%
- Communication Score: ${lastRound.communication_score || 0}%
- Confidence Score: ${lastRound.confidence_score || 0}%
- Fluency Score: ${lastRound.fluency_score || 0}%
- Filler Words: ${lastRound.filler_word_count || 0}
- Eye Contact Score: ${lastRound.eye_contact_score || 0}%
- Speaking Speed: ${lastRound.speaking_speed || 0} WPM

Compare the current performance with these previous metrics. In the suggestions, improvements, or coaching_summary, add statements comparing the two (e.g. "Your communication score improved from X% to Y%" or "You reduced filler words from A to B").`;
          }
        } catch (e) {
          console.warn("Failed retrieving history for evaluation compare:", e);
        }

        // Run LLM Evaluation
        const activeRole = getActiveRole(profile);
        const evaluationPrompt = `You are a Senior Technical Recruiter and Career Coach evaluating an interview session.
        Job Role: ${activeRole}
        Interview Difficulty: ${difficulty}
        
        Transcript Details (JSON format):
        ${JSON.stringify(finalTranscript)}

        ${pastSummary ? `\n${pastSummary}\n` : ''}

        Evaluate the candidate across the following areas (score out of 100):
        1. overall_score: Weighted average of the evaluation areas
        2. technical_score: Quality and accuracy of technical details provided
        3. communication_score: Word selection, structure, and direct answers
        4. confidence_score: Sentence structure completeness and volume indicators
        5. fluency_score: Lack of trailing gaps and structure pacing
        6. grammar_score: Grammatical structure and syntax rules
        7. hr_score: Cultural fit, adaptability, and scenarios suitability
        8. pronunciation_score: Clarity, sound articulation, and pacing suitability
        9. problem_solving_score: Analytical structure, code tracing accuracy
        10. leadership_score: Scenario resolution, delegation mindset, ownership
        11. behavioral_score: Standard STAR alignment (Situation, Task, Action, Result)
        12. eye_contact_score: Estimated eye focus stability (assume good 80-90 if transcript is natural, lower if fragmented)
        13. speaking_speed: Words Per Minute estimate (between 100 and 180)
        14. filler_word_count: Estimated count of filler words used (like 'um', 'like', 'ah')
        15. long_pause_count: Estimated count of trailing silent gaps
        16. vocabulary_score: Proper use of technical terminologies and industry terminology

        Also identify:
        - strong_answers: List of questions or topics candidate answered exceptionally well
        - weak_answers: List of questions where answers lacked structure or correctness
        - mistakes: List of mistakes, grammatical syntax errors, or logical gaps made
        - ai_suggestions: Career recommendations for future improvement
        - coaching_summary: A 1-2 sentence mentor style coaching summary comparing this round with general standards or previous rounds

        Scoring Rules (Anti-Hallucination & Conservative Guidelines):
        - Empty or irrelevant answers must score 0
        - Short, shallow answers score 10 - 25
        - Good answers score 60 - 75
        - Exceptional, detailed answers score 85 - 95 (NEVER score 100)
        - Cite specific questions in strengths/weaknesses.

        Return ONLY a JSON object matching this structure:
        {
          "overall_score": 75,
          "technical_score": 70,
          "communication_score": 80,
          "confidence_score": 75,
          "fluency_score": 68,
          "grammar_score": 82,
          "hr_score": 78,
          "pronunciation_score": 75,
          "problem_solving_score": 72,
          "leadership_score": 68,
          "behavioral_score": 74,
          "eye_contact_score": 85,
          "speaking_speed": 135,
          "filler_word_count": 6,
          "long_pause_count": 2,
          "vocabulary_score": 78,
          "strong_answers": ["Explained Virtual DOM with clear React renders"],
          "weak_answers": ["Did not mention indexing strategies in question 4"],
          "mistakes": ["Repeated use of 'um' when starting answers", "Vague code complexity explanations"],
          "ai_suggestions": ["Revise database indices", "Practice pacing aloud without fillers"],
          "coaching_summary": "Strong technical baseline, but focus on structuring behavioral scenarios and reducing verbal fillers.",
          "strengths": [
            { "title": "React Lifecycle Proficiency", "description": "Candidate detailed component hooks correctly in question 2." }
          ],
          "weaknesses": [
            { "title": "SQL Join Optimization", "description": "Failed to mention indexing strategies in question 4." }
          ]
        }
        Return raw JSON output. Do not include markdown code block characters (\`\`\`) or extra text.`;

        const evalRes = await base44.integrations.Core.InvokeLLM({ prompt: evaluationPrompt });
        const cleanEvalText = (evalRes.text || evalRes || "{}")
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        const evalObj = JSON.parse(cleanEvalText);
        scorePayload = {
          overall_score: evalObj.overall_score || 0,
          technical_score: evalObj.technical_score || 0,
          communication_score: evalObj.communication_score || 0,
          confidence_score: evalObj.confidence_score || 0,
          fluency_score: evalObj.fluency_score || 0,
          grammar_score: evalObj.grammar_score || 0,
          hr_score: evalObj.hr_score || 0,
          pronunciation_score: evalObj.pronunciation_score || 0,
          problem_solving_score: evalObj.problem_solving_score || 0,
          leadership_score: evalObj.leadership_score || 0,
          behavioral_score: evalObj.behavioral_score || 0,
          eye_contact_score: evalObj.eye_contact_score || 0,
          speaking_speed: evalObj.speaking_speed || 0,
          filler_word_count: evalObj.filler_word_count || 0,
          long_pause_count: evalObj.long_pause_count || 0,
          vocabulary_score: evalObj.vocabulary_score || 0
        };
        feedbackJsonString = cleanEvalText;
      }

      // Update Interview entry in database
      const updatedInterview = await base44.entities.Interview.update(interviewIdRef.current, {
        status: 'completed',
        duration_seconds: durationSeconds,
        transcript: JSON.stringify(finalTranscript),
        feedback_json: feedbackJsonString,
        difficulty: difficulty,
        skills_selected: profile.skills || '',
        resume_version_used: profile.resume_url ? profile.resume_url.split('/').pop() : 'Direct Input (No Resume)',
        questions_list: JSON.stringify(questions),
        pronunciation_score: scorePayload.pronunciation_score,
        problem_solving_score: scorePayload.problem_solving_score,
        leadership_score: scorePayload.leadership_score,
        behavioral_score: scorePayload.behavioral_score,
        eye_contact_score: scorePayload.eye_contact_score,
        speaking_speed: scorePayload.speaking_speed,
        filler_word_count: scorePayload.filler_word_count,
        long_pause_count: scorePayload.long_pause_count,
        vocabulary_score: scorePayload.vocabulary_score,
        ...scorePayload
      });

      // Automatically email the scorecard report to the user
      try {
        const feedbackObj = JSON.parse(feedbackJsonString);
        await sendAutoReportEmail(profile, updatedInterview, feedbackObj);
      } catch (emailErr) {
        console.error("Auto email reporting failed:", emailErr);
      }

      toast.success("Interview completed! Navigating to feedback report...");
      navigate(`/feedback/${interviewIdRef.current}`);
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error("Failed to complete AI evaluation. Saving draft...");
      
      // Attempt saving partial draft
      try {
        await base44.entities.Interview.update(interviewIdRef.current, {
          status: 'completed',
          duration_seconds: durationSeconds,
          transcript: JSON.stringify(finalTranscript),
          overall_score: 50,
          feedback_json: JSON.stringify({
            strengths: [{ title: "Round Completed", description: "Interview finished but evaluation model failed." }],
            weaknesses: [],
            improvements: [],
            resources: []
          })
        });
        navigate(`/feedback/${interviewIdRef.current}`);
      } catch (e) {
        navigate('/history');
      }
    } finally {
      setLoading(false);
    }
  };

  // Proctor violation handler
  const handleProctorViolation = () => {
    toast.error("Strict mode terminated: proctoring violations reached maximum limit.");
    handleEndInterview();
  };

  // Format timer text
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins}:${remSecs < 10 ? '0' : ''}${remSecs}`;
  };

  // --- RENDERS ---

  // LIMIT REACHED WARNING
  if (stage === 'limit_error') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-md mx-auto">
        <AlertTriangle className="w-16 h-16 text-rose-500 animate-bounce" />
        <h2 className="text-2xl font-display font-bold text-white">Daily Quota Exhausted</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          You have completed the maximum allowance of 10 interviews today. To maintain database efficiency and API quotas, please return tomorrow for further practice.
        </p>
        <Link to="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Live Interview Screen (Strict Proctor Guard)
  if (stage === 'live') {
    return (
      <StrictModeGuard onViolationEnd={handleProctorViolation} onWarningChange={setWarningsCount}>
        <div className="min-h-screen bg-[#07080f] text-white flex flex-col p-6 font-sans justify-center">
          
          {/* Top Status Header */}
          <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto w-full">
            {/* Left green badge */}
            <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Secure Interview Active
            </div>

            {/* Right warnings indicator */}
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              Warnings: <span className="text-rose-500 font-black">{warningsCount}/4</span>
            </div>
          </div>

          {/* Main Control Panel Bar */}
          <div className="flex items-center justify-between bg-[#0e0f1e] border border-white/5 rounded-xl px-6 py-3 w-full max-w-4xl mx-auto mb-6 shadow-md">
            {/* Timer */}
            <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Question progression & dots */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              <span>{isWelcome ? 'Introduction' : `Question ${currentQIdx + 1} of ${questions.length}`}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === (isWelcome ? -1 : currentQIdx) ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6] w-2 h-2' : 'bg-slate-700'
                    }`} 
                  />
                ))}
              </div>
            </div>

            {/* Terminate Button */}
            <button
              onClick={handleEndInterview}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold rounded px-4 py-1.5 flex items-center gap-1.5 transition-all"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              End
            </button>
          </div>

          {/* Split Two-Column visual arena */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto flex-1 items-stretch">
            
            {/* Left Column (AI visualizer & Question text card) */}
            <div className="bg-[#0e0f1e] border border-white/5 p-6 rounded-2xl flex flex-col justify-between items-center min-h-[460px] shadow-lg">
              
              {/* Avatar shell */}
              <div className="flex-1 flex items-center justify-center">
                <AIAvatar
                  isSpeaking={isSpeaking}
                  isThinking={isThinking}
                  isListening={isListening}
                  gender={avatarGender}
                  onGenderChange={setAvatarGender}
                />
              </div>

              {/* Question Text Box */}
              <div className="w-full bg-[#111222]/80 border border-white/5 p-5 rounded-xl text-left space-y-2 mt-4 min-h-[140px] flex flex-col justify-center">
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest block">
                  {isWelcome ? 'Introduction' : `Question ${currentQIdx + 1}`}
                </span>
                <p className="text-xs font-medium text-slate-300 leading-relaxed">
                  {isWelcome 
                    ? `Welcome back, ${profile?.full_name || 'candidate'}! Please start by introducing yourself, your experience level, and your main skills.` 
                    : questions[currentQIdx]}
                </p>
              </div>
            </div>

            {/* Right Column (Webcam visualizer & response interface) */}
            <div className="bg-[#0e0f1e] border border-white/5 p-6 rounded-2xl flex flex-col justify-between min-h-[460px] shadow-lg">
              
              {/* Webcam preview */}
              <div className="relative aspect-video w-full rounded-xl bg-black/60 border border-white/5 overflow-hidden shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                  style={{ display: 'block' }}
                />
                <span className="absolute bottom-3 left-3 text-[9px] bg-slate-950/80 px-2 py-1 rounded text-white font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                  Live · {profile?.full_name?.split(' ')[0] || 'You'}
                </span>
              </div>

              {/* Listening status indicator */}
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold my-2">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                <span>{isListening ? 'Listening' : 'Not listening'}</span>
              </div>

              {/* Answer display transcription card */}
              <div className="flex-1 bg-[#080914] border border-white/5 p-4 rounded-xl overflow-y-auto flex flex-col justify-between my-2 min-h-[120px]">
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    {isSpeaking 
                      ? "⌛ Wait for the question to finish..." 
                      : userAnswer || "(Speak now or type response...)"}
                  </p>
                </div>

                {/* If SpeechRecognition fails, allow text override */}
                {!isSpeaking && (
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type response here if voice is not capturing..."
                    className="w-full bg-[#0a0b16] border border-white/5 rounded-lg p-2 text-[10px] text-white placeholder-white/20 mt-3 focus:outline-none focus:ring-1 focus:ring-violet-500/50 resize-none h-12"
                  />
                )}
              </div>

              {/* Next Question Full-width button */}
              <div className="w-full mt-2">
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-lg py-3 text-xs font-bold w-full transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  {isWelcome ? 'Done, Start Interview →' : currentQIdx === questions.length - 1 ? 'Complete Evaluation →' : 'Next Question →'}
                </button>

                {/* Warning message under next button if empty answer */}
                {!userAnswer && !isSpeaking && (
                  <p className="text-[10px] text-amber-500/90 font-medium flex items-center justify-center gap-1.5 mt-2">
                    ⚠️ No answer detected — will be marked as skipped
                  </p>
                )}
              </div>

            </div>

          </div>

        </div>
      </StrictModeGuard>
    );
  }

  // Evaluation spinner
  if (stage === 'ending') {
    return (
      <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-display font-bold text-white">Evaluating Performance</h2>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
          Our AI proctors are scanning your speech, transcript grammar, technical correctness, and pacing scores. Please do not close this window.
        </p>
      </div>
    );
  }

  // Setup / Welcome Configuration screen
  const LANGUAGES = [
    { value: 'en-US', code: 'US', label: 'English', sub: 'English (US)' },
    { value: 'hi-IN', code: 'IN', label: 'Hindi',   sub: 'हिंदी' },
    { value: 'te-IN', code: 'IN', label: 'Telugu',  sub: 'తెలుగు' },
    { value: 'ta-IN', code: 'IN', label: 'Tamil',   sub: 'தமிழ்' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 pb-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Main card */}
      <div className="bg-[#111220] border border-white/8 rounded-2xl p-8 space-y-7">

        {/* Difficulty */}
        <div className="space-y-3">
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </div>

        {/* Avatar voice */}
        <div className="space-y-3 border-t border-white/5 pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Video size={13} className="text-violet-400" /> Avatar Voice
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 'female', label: 'Sophia', sub: 'Female voice' }, { v: 'male', label: 'Alex', sub: 'Male voice' }].map(opt => (
              <button
                key={opt.v}
                onClick={() => setAvatarGender(opt.v)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  avatarGender === opt.v
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-white/8 bg-[#0e0f1e] hover:border-white/20'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${avatarGender === opt.v ? 'bg-violet-400' : 'bg-slate-600'}`} />
                <div>
                  <p className="text-sm font-bold text-white">{opt.label}</p>
                  <p className="text-[11px] text-slate-400">{opt.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Language selection */}
        <div className="space-y-3 border-t border-white/5 pt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            🌐 Interview Language
          </p>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(lang => (
              <button
                key={lang.value}
                onClick={() => setSelectedLang(lang.value)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  selectedLang === lang.value
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-white/8 bg-[#0e0f1e] hover:border-white/20'
                }`}
              >
                <span className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 shrink-0">
                  {lang.code}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{lang.label}</p>
                  <p className="text-[11px] text-slate-400">{lang.sub}</p>
                </div>
                {selectedLang === lang.value && (
                  <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-5">
          You have <span className="text-white font-semibold">10 minutes</span>. Questions are fresh and won't repeat from today's sessions.
        </p>

        {/* Rules box */}
        <div className="bg-[#0e0f1e] border border-white/8 rounded-xl p-5 space-y-2.5">
          {[
            { text: <><strong className="text-white">Speak clearly</strong> — your mic captures your answers live</>, normal: true },
            { text: 'The AI interviewer will speak each question aloud', normal: true },
            { text: <>Click <strong className="text-white">"Next Question"</strong> when done answering</>, normal: true },
            { text: <><span className="text-rose-400 font-semibold">No answers = 0 score</span> — the AI evaluates honestly</>, normal: false },
            { text: 'Use Chrome for best speech recognition support', normal: true },
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
              <span className="leading-relaxed">{rule.text}</span>
            </div>
          ))}
        </div>

        {/* Start button */}
        <Button
          size="lg"
          onClick={handleGenerateQuestions}
          disabled={generatingQuestions || loading}
          className="w-full h-12 text-base font-bold"
        >
          {generatingQuestions ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating AI Questions...</>
          ) : (
            <><Play className="w-4 h-4 mr-2" />Start Mock Interview</>
          )}
        </Button>
      </div>
    </div>
  );
}
export { InterviewSession };
