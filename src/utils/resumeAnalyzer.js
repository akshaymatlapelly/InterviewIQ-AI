/**
 * analyzeResume.js
 * Analyzes raw resume text client-side to produce ATS-style reports.
 * All output is derived from what's ACTUALLY present in the text.
 */

// ─── Keyword Libraries ────────────────────────────────────────────────────────

const ALL_TECH_SKILLS = [
  // Languages
  'javascript','typescript','python','java','c++','c#','go','rust','kotlin','swift',
  'php','ruby','r','scala','perl','bash','shell','dart','lua',
  // Frontend
  'react','vue','angular','svelte','next.js','nuxt','html','css','sass','scss',
  'tailwind','bootstrap','jquery','redux','zustand','graphql','vite','webpack',
  // Backend
  'node.js','express','django','flask','fastapi','spring','laravel','rails',
  'nestjs','asp.net','gin','fiber',
  // Databases
  'sql','mysql','postgresql','mongodb','redis','sqlite','firebase','supabase',
  'dynamodb','cassandra','neo4j','elasticsearch','dbms','nosql',
  // Cloud / DevOps
  'aws','azure','gcp','docker','kubernetes','ci/cd','jenkins','github actions',
  'terraform','ansible','linux','nginx','apache',
  // Data / ML / AI
  'tensorflow','pytorch','scikit-learn','pandas','numpy','matplotlib','seaborn',
  'keras','openai','langchain','hugging face','tableau','power bi','spark','hadoop',
  // Tools
  'git','github','gitlab','jira','figma','postman','vs code','webpack','babel',
];

const SOFT_SKILL_KEYWORDS = [
  'leadership','communication','teamwork','collaboration','problem solving',
  'critical thinking','time management','adaptability','presentation','mentoring',
];

const SECTION_HEADERS = {
  education: /education|academic|qualification|degree|university|college|school/i,
  experience: /experience|employment|work history|professional|internship|intern/i,
  projects: /project|portfolio|work sample/i,
  skills: /skill|technology|tool|competenc/i,
  certifications: /certif|award|achievement|honor|hackathon/i,
  summary: /summary|objective|profile|about/i,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s.#/+]/g, ' ');
}

function tokenize(text) {
  return normalizeText(text).split(/\s+/).filter(Boolean);
}

function hasPattern(text, pattern) {
  return pattern.test(text);
}

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

function extractPhone(text) {
  const m = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  return m ? m[0].trim() : null;
}

function extractName(text) {
  // Usually first 2 lines contain the name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like email/phone/URL
    if (/[@http:\d]{3,}/.test(line)) continue;
    if (line.split(' ').length >= 1 && line.length < 50) return line;
  }
  return null;
}

function extractGPA(text) {
  const m = text.match(/(?:gpa|cgpa|grade)[:\s]*(\d+\.\d+)\s*(?:\/\s*(\d+\.\d+|\d))?/i);
  if (m) {
    return m[2] ? `${m[1]}/${m[2]}` : m[1];
  }
  // Also try patterns like "3.6/4.0"
  const m2 = text.match(/(\d\.\d{1,2})\s*\/\s*(\d(?:\.\d)?)/);
  return m2 ? `${m2[1]}/${m2[2]}` : null;
}

function extractYearsOfExperience(text) {
  const m = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i);
  return m ? parseInt(m[1]) : 0;
}

function extractDegree(text) {
  const degrees = [
    { pattern: /ph\.?d|doctorate/i, label: 'PhD' },
    { pattern: /m\.?tech|master of technology/i, label: 'M.Tech' },
    { pattern: /m\.?s|master of science/i, label: 'M.S.' },
    { pattern: /m\.?b\.?a/i, label: 'MBA' },
    { pattern: /m\.?c\.?a/i, label: 'MCA' },
    { pattern: /b\.?tech|bachelor of technology/i, label: 'B.Tech' },
    { pattern: /b\.?e\.?\b|bachelor of engineering/i, label: 'B.E.' },
    { pattern: /b\.?s\.?\b|bachelor of science/i, label: 'B.S.' },
    { pattern: /b\.?c\.?a/i, label: 'BCA' },
    { pattern: /b\.?sc/i, label: 'B.Sc.' },
    { pattern: /b\.?com/i, label: 'B.Com' },
    { pattern: /diploma/i, label: 'Diploma' },
    { pattern: /high school|12th|senior secondary/i, label: 'High School' },
  ];
  for (const d of degrees) {
    if (d.pattern.test(text)) return d.label;
  }
  return null;
}

function extractGraduationYear(text) {
  const m = text.match(/20[12]\d/g);
  if (!m) return null;
  // Return the latest year
  return Math.max(...m.map(Number));
}

function extractFoundSkills(text) {
  const lower = normalizeText(text);
  return ALL_TECH_SKILLS.filter(skill => {
    // Use word-boundary check for short skill names
    const escaped = skill.replace(/[.+#]/g, '\\$&');
    const re = new RegExp(`(?:^|[\\s,/|•–-])${escaped}(?:[\\s,/|•–-]|$)`, 'i');
    return re.test(lower);
  });
}

function detectSections(text) {
  const sections = {};
  for (const [key, pattern] of Object.entries(SECTION_HEADERS)) {
    sections[key] = pattern.test(text);
  }
  return sections;
}

function hasHackathon(text) {
  return /hackathon|ideathon|buildathon|makerthon|competition|rank|place|winner/i.test(text);
}

function hasInternship(text) {
  return /intern(?:ship)?|trainee/i.test(text);
}

function hasLinkedIn(text) {
  return /linkedin\.com/i.test(text);
}

function hasGitHub(text) {
  return /github\.com/i.test(text);
}

function hasPortfolio(text) {
  return /portfolio|personal\s*site|website/i.test(text);
}

function extractProjectCount(text) {
  // Count occurrences of project headers
  const matches = text.match(/\bproject\s*\d+|\bproject:\s*[A-Z]|\d+\.\s*[A-Z][a-z]/g);
  return matches ? Math.min(matches.length, 10) : 0;
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

export function analyzeResumeText(resumeText, preferredRole = '') {
  const raw = resumeText;
  const lower = raw.toLowerCase();

  // ── Extract basic info ──────────────────────────────────────────────────────
  const candidateName = extractName(raw) || 'Candidate';
  const email = extractEmail(raw);
  const phone = extractPhone(raw);
  const gpa = extractGPA(raw);
  const degree = extractDegree(raw);
  const gradYear = extractGraduationYear(raw);
  const yearsExp = extractYearsOfExperience(raw);
  const foundSkills = extractFoundSkills(raw);
  const sections = detectSections(raw);
  const hasProjects = sections.projects || /project/i.test(raw);
  const hasCerts = sections.certifications;
  const hasHackathons = hasHackathon(raw);
  const hasIntern = hasInternship(raw);
  const hasGithub = hasGitHub(raw);
  const hasLinkedin = hasLinkedIn(raw);

  // ── ATS Score computation ───────────────────────────────────────────────────
  let score = 30; // base

  // Skills contribute heavily
  score += Math.min(foundSkills.length * 3, 25);

  // Education
  if (degree) score += 8;
  if (gpa) {
    const gpaVal = parseFloat(gpa.split('/')[0]);
    const gpaMax = parseFloat(gpa.split('/')[1] || '10');
    const pct = gpaVal / gpaMax;
    if (pct >= 0.85) score += 7;
    else if (pct >= 0.75) score += 5;
    else score += 2;
  }

  // Sections completeness
  if (sections.summary) score += 4;
  if (sections.skills) score += 4;
  if (hasProjects) score += 6;
  if (hasCerts || hasHackathons) score += 4;
  if (hasIntern) score += 5;
  if (yearsExp > 0) score += Math.min(yearsExp * 2, 8);

  // Links
  if (hasGithub) score += 3;
  if (hasLinkedin) score += 3;

  // Target role match
  if (preferredRole) {
    const roleWords = preferredRole.toLowerCase().split(/\s+/);
    const roleMatch = roleWords.some(w => lower.includes(w));
    if (roleMatch) score += 5;
  }

  score = Math.min(Math.max(score, 20), 97); // clamp

  // ── Job Suitability ─────────────────────────────────────────────────────────
  let jobSuitability = preferredRole || 'Software Developer';
  let suitabilityDesc = '';

  const isFrontend = foundSkills.some(s => ['react','html','css','vue','angular','next.js','tailwind','svelte'].includes(s));
  const isBackend = foundSkills.some(s => ['node.js','express','django','flask','spring','fastapi','laravel'].includes(s));
  const isData = foundSkills.some(s => ['python','pandas','numpy','sql','tensorflow','pytorch','scikit-learn','r'].includes(s));
  const isDevOps = foundSkills.some(s => ['docker','kubernetes','aws','azure','gcp','terraform','jenkins'].includes(s));

  if (hasIntern || yearsExp === 0) {
    suitabilityDesc = `Highly suitable for internship roles or junior ${jobSuitability.toLowerCase()} positions. For full-time roles, candidate requires more project complexity and practical industry experience.`;
  } else if (yearsExp >= 3) {
    suitabilityDesc = `Well-suited for mid-level ${jobSuitability.toLowerCase()} positions. Profile demonstrates sufficient technical depth and hands-on project exposure for competitive applications.`;
  } else {
    suitabilityDesc = `Suitable for entry-level ${jobSuitability.toLowerCase()} positions with potential for rapid growth. Focus on deepening project complexity to strengthen application competitiveness.`;
  }

  // ── Candidate Summary ───────────────────────────────────────────────────────
  const degreePart = degree ? `${degree} ${gradYear ? `(${gradYear})` : ''}` : '';
  const skillsPart = foundSkills.length > 0 ? `strong proficiency in ${foundSkills.slice(0, 5).join(', ')}` : 'a range of technical skills';
  const expPart = yearsExp > 0 ? `${yearsExp}+ years of experience` : hasIntern ? 'internship experience' : 'project-based exposure';
  const gpaPart = gpa ? ` with a GPA of ${gpa}` : '';

  const candidateSummary = `${candidateName} is a ${degreePart ? degreePart + ' candidate' : 'technical candidate'} with ${skillsPart}${gpaPart}. They bring ${expPart}${hasHackathons ? ', active participation in hackathons and competitions,' : ''} and target the ${jobSuitability} role. ${hasGithub ? 'GitHub profile is linked. ' : ''}${hasLinkedin ? 'LinkedIn profile is present.' : 'LinkedIn presence is not detected.'}`.trim();

  // ── Strengths ───────────────────────────────────────────────────────────────
  const strengths = [];
  if (foundSkills.length >= 5) strengths.push(`Proficiency in ${foundSkills.slice(0, 4).join(', ')} and related frameworks`);
  if (gpa) {
    const gpaVal = parseFloat(gpa.split('/')[0]);
    const gpaMax = parseFloat(gpa.split('/')[1] || '10');
    if (gpaVal / gpaMax >= 0.75) strengths.push(`Strong academic performance with a ${gpa} GPA`);
  }
  if (hasHackathons) strengths.push(`Active participation in hackathons and ideathons demonstrating real-world problem solving`);
  if (hasIntern) strengths.push(`Hands-on internship experience providing industry exposure`);
  if (hasProjects) strengths.push(`Project portfolio demonstrating practical application of technical skills`);
  if (hasCerts) strengths.push(`Certifications and achievements validating domain knowledge`);
  if (hasGithub) strengths.push(`Active GitHub profile showcasing open-source contributions`);
  if (sections.summary) strengths.push(`Clear and organized resume with professional summary section`);
  if (strengths.length === 0) strengths.push('Resume presents structured information in a readable format');

  // ── Weaknesses ──────────────────────────────────────────────────────────────
  const weaknesses = [];
  if (!lower.includes('javascript') && foundSkills.some(s => ['react','html','css'].includes(s))) {
    weaknesses.push(`Missing explicit 'JavaScript' keyword in the technical skills section, despite listing frontend frameworks`);
  }
  if (!hasIntern && yearsExp === 0) weaknesses.push('Lack of professional experience or internships limits competitive positioning');
  if (!hasGithub) weaknesses.push('No GitHub profile link found — limits ability to showcase practical coding work');
  if (!sections.summary) weaknesses.push('Missing professional summary or objective section at the top');
  if (!gpa) weaknesses.push('No GPA mentioned — consider adding if it is above 3.0 or 7.5/10');
  if (gradYear && gradYear > 2024) weaknesses.push(`Candidate is in early stages of their degree (graduating ${gradYear}), which may limit eligibility for full-time roles`);
  const missingBackend = isFrontend && !isBackend;
  if (missingBackend) weaknesses.push('No backend framework (e.g., Node.js, Django, Express) specified to complement frontend skills');
  if (weaknesses.length === 0) weaknesses.push('Project descriptions could be expanded with more measurable impact metrics');

  // ── Missing Skills ──────────────────────────────────────────────────────────
  const missingSkills = [];
  const allExpected = isFrontend
    ? ['typescript','javascript','jest','redux','graphql','node.js']
    : isData
    ? ['tableau','pytorch','scikit-learn','apache spark','sql','tensorflow']
    : isDevOps
    ? ['kubernetes','terraform','ansible','grafana','prometheus']
    : ['docker','ci/cd','kubernetes','typescript','testing frameworks'];

  for (const skill of allExpected) {
    if (!foundSkills.includes(skill) && missingSkills.length < 6) {
      missingSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  if (!lower.includes('rest') && !lower.includes('api')) missingSkills.push('RESTful API Development');
  if (!lower.includes('test') && !lower.includes('jest') && !lower.includes('pytest')) missingSkills.push('Unit Testing (e.g., Jest, Pytest)');
  const dedupMissing = [...new Set(missingSkills)].slice(0, 6);

  // ── Suggested Improvements ──────────────────────────────────────────────────
  const improvements = [];
  if (!lower.includes('javascript') && isFrontend) improvements.push("Explicitly add 'JavaScript' to your Programming Skills section — it is a critical ATS keyword");
  improvements.push("Expand project descriptions using the STAR method (Situation, Task, Action, Result) with specific metrics");
  if (!hasGithub) improvements.push("Add a GitHub profile link to allow recruiters to verify your technical work");
  if (isFrontend && !isBackend) improvements.push("Mention any backend or full-stack experience (Node.js, Flask, FastAPI) even if minor");
  if (!hasCerts) improvements.push("Add any online certifications (Coursera, Udemy, Google) to strengthen credibility");
  improvements.push("Quantify impact wherever possible (e.g., 'Reduced load time by 40%', 'Built dashboard serving 500 users')");
  improvements.push("Ensure consistent formatting, font sizes, and bullet alignment across all sections");
  const dedupImprovements = [...new Set(improvements)].slice(0, 6);

  // ── Technical Questions (based on found skills) ─────────────────────────────
  const technicalQuestions = [];
  if (foundSkills.includes('react')) {
    technicalQuestions.push('Can you explain the difference between functional components and class components in React?');
    technicalQuestions.push('What are React Hooks, and how does useEffect work under the hood?');
  }
  if (foundSkills.includes('javascript') || isFrontend) {
    technicalQuestions.push("Explain the concept of 'Hoisting' and the event loop in JavaScript.");
  }
  if (foundSkills.includes('python') || isData) {
    technicalQuestions.push('How does Python manage memory, and what is the GIL?');
    technicalQuestions.push('Explain the difference between a list and a generator in Python.');
  }
  if (foundSkills.includes('sql') || lower.includes('database')) {
    technicalQuestions.push('Describe the difference between SQL and NoSQL databases and when you would choose each.');
    technicalQuestions.push('What are database indexes and how do they improve query performance?');
  }
  if (foundSkills.includes('node.js') || isBackend) {
    technicalQuestions.push('How does Node.js handle asynchronous operations using the event loop?');
  }
  if (foundSkills.includes('docker') || isDevOps) {
    technicalQuestions.push('Explain the difference between a Docker container and a virtual machine.');
  }
  if (technicalQuestions.length < 4) {
    technicalQuestions.push('How do you approach debugging a complex issue in an unfamiliar codebase?');
    technicalQuestions.push('What is the difference between REST and GraphQL APIs?');
  }

  // ── HR Questions (based on background) ─────────────────────────────────────
  const hrQuestions = [
    `What motivated you to pursue a career in ${jobSuitability}?`,
    hasIntern
      ? 'Can you describe a key learning from your internship experience?'
      : 'How have your academic projects prepared you for a professional role?',
    hasHackathons
      ? 'Tell me about a hackathon you participated in and what your team built.'
      : 'How do you stay updated with the latest developments in your field?',
    gradYear && gradYear > 2025
      ? `Where do you see your technical skills evolving by the time you graduate in ${gradYear}?`
      : 'Where do you see yourself professionally in the next 2–3 years?',
    'How do you handle constructive criticism or disagreement within a team setting?',
  ];

  // ── Behavioral Questions ────────────────────────────────────────────────────
  const behavioralQuestions = [
    'Tell me about a time you had to work with a teammate who had a different technical approach. How did you resolve it?',
    hasHackathons
      ? "Describe a challenging problem you encountered during a hackathon and how your team overcame it."
      : 'Describe a situation where you had to learn a new technology quickly to meet a project deadline.',
    hasProjects
      ? 'Walk me through the most technically complex project on your resume and the trade-offs you made.'
      : 'Describe a goal you set for yourself and the steps you took to achieve it.',
    'Tell me about a time you identified an inefficiency in a process and took initiative to improve it.',
    'Give an example of a time you received difficult feedback and how you responded to it.',
  ];

  return {
    ats_score: Math.round(score),
    job_suitability: jobSuitability,
    job_suitability_desc: suitabilityDesc,
    candidate_summary: candidateSummary,
    strengths,
    weaknesses,
    missing_skills: dedupMissing,
    improvements: dedupImprovements,
    technical_questions: technicalQuestions.slice(0, 5),
    hr_questions: hrQuestions,
    behavioral_questions: behavioralQuestions,
    meta: {
      name: candidateName,
      email,
      phone,
      degree,
      gpa,
      grad_year: gradYear,
      years_exp: yearsExp,
      found_skills: foundSkills,
      has_github: hasGithub,
      has_linkedin: hasLinkedin,
    },
  };
}
