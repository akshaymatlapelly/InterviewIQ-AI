// InterviewIQ AI - Client-Side database and AI integration layer.
// Persistent storage is handled locally via browser localStorage.

class MockEntity {
  constructor(key, defaultData = []) {
    this.key = key;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(defaultData));
    }
  }

  _getItems() {
    try {
      return JSON.parse(localStorage.getItem(this.key) || '[]');
    } catch (e) {
      return [];
    }
  }

  _saveItems(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  async list() {
    return this._getItems();
  }

  async get(id) {
    const items = this._getItems();
    const found = items.find(i => i.id === id);
    if (!found) throw new Error("Entity not found: " + id);
    return found;
  }

  async create(data) {
    const items = this._getItems();
    const currentUser = JSON.parse(localStorage.getItem('iq_current_user') || 'null');
    const newItem = {
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      created_date: new Date().toISOString(),
      created_by: currentUser ? currentUser.email : 'anonymous'
    };
    items.push(newItem);
    this._saveItems(items);
    return newItem;
  }

  async update(id, data) {
    const items = this._getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("Entity not found to update: " + id);
    items[idx] = { ...items[idx], ...data };
    this._saveItems(items);
    return items[idx];
  }

  async delete(id) {
    let items = this._getItems();
    items = items.filter(i => i.id !== id);
    this._saveItems(items);
    return true;
  }

  async filter(criteria) {
    const items = this._getItems();
    return items.filter(item => {
      for (const key in criteria) {
        const valA = item[key];
        const valB = criteria[key];
        if (typeof valA === 'string' && typeof valB === 'string') {
          if (valA.toLowerCase() !== valB.toLowerCase()) return false;
        } else {
          if (valA !== valB) return false;
        }
      }
      return true;
    });
  }

  async bulkCreate(dataList) {
    const items = this._getItems();
    const currentUser = JSON.parse(localStorage.getItem('iq_current_user') || 'null');
    const newItems = dataList.map(data => ({
      ...data,
      id: Math.random().toString(36).substring(2, 9),
      created_date: new Date().toISOString(),
      created_by: currentUser ? currentUser.email : 'anonymous'
    }));
    const merged = [...items, ...newItems];
    this._saveItems(merged);
    return newItems;
  }
}

// Mock User Database
const getMockUsers = () => {
  try {
    let users = [];
    if (localStorage.getItem('iq_users')) {
      users = JSON.parse(localStorage.getItem('iq_users') || '[]');
    }
    const hasAkshay = users.some(u => u.email.toLowerCase() === 'akshaymatlapelly@gmail.com');
    if (!hasAkshay) {
      users.push({
        id: 'default-user-id-akshay',
        email: 'akshaymatlapelly@gmail.com',
        password: 'password',
        full_name: 'M Akshay',
        created_date: new Date().toISOString()
      });
      localStorage.setItem('iq_users', JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return [];
  }
};

const saveMockUser = (user) => {
  const users = getMockUsers();
  users.push(user);
  localStorage.setItem('iq_users', JSON.stringify(users));
};

const initializeDefaultData = () => {
  // Initialize users
  getMockUsers();

  // Initialize profiles
  try {
    let profiles = [];
    if (localStorage.getItem('iq_profiles')) {
      profiles = JSON.parse(localStorage.getItem('iq_profiles') || '[]');
    }
    const hasAkshayProfile = profiles.some(p => p.email.toLowerCase() === 'akshaymatlapelly@gmail.com');
    if (!hasAkshayProfile) {
      profiles.push({
        id: 'default-profile-id-akshay',
        full_name: 'M Akshay',
        email: 'akshaymatlapelly@gmail.com',
        phone: '+91 9876543210',
        date_of_birth: '2000-01-01',
        gender: 'male',
        current_status: 'student',
        college_name: 'VNR VJIET',
        degree: 'B.Tech',
        branch: 'Computer Science',
        graduation_year: '2025',
        current_company: '',
        experience_level: 'entry',
        skills: 'React, Node.js, JavaScript, Python, SQL',
        onboarding_complete: true,
        daily_interviews_count: 0,
        last_interview_date: '',
        resume_url: '',
        resume_analysis: JSON.stringify({
          ats_score: 85,
          strengths: ["Strong computer science fundamentals", "Hands-on projects with React and Node.js"],
          weaknesses: ["Needs more cloud deployment experience"],
          missing_skills: ["AWS", "Docker"],
          improvements: ["Deploy projects to AWS/Vercel", "Implement CI/CD pipelines"],
          sample_questions: ["Explain the difference between Virtual DOM and Real DOM in React", "How does Node.js handle asynchronous operations?"]
        })
      });
      localStorage.setItem('iq_profiles', JSON.stringify(profiles));
    }
  } catch (e) {
    console.error("Error seeding default profiles:", e);
  }
};

initializeDefaultData();

export const iqClient = {
  // 1. Mock Database collections
  entities: {
    UserProfile: new MockEntity('iq_profiles'),
    Interview: new MockEntity('iq_interviews'),
    QuestionBank: new MockEntity('iq_question_bank')
  },

  // 2. Mock Authentication Services
  auth: {
    async me() {
      try {
        const u = localStorage.getItem('iq_current_user');
        return u ? JSON.parse(u) : null;
      } catch (e) {
        return null;
      }
    },
    
    async loginViaEmailPassword(email, password) {
      const users = getMockUsers();
      const trimmedEmail = email ? email.trim().toLowerCase() : "";
      const trimmedPassword = password ? password.trim() : "";
      const found = users.find(u => u.email.trim().toLowerCase() === trimmedEmail);
      
      if (!found || found.password.trim() !== trimmedPassword) {
        throw new Error("Invalid email ID or password. If you are a new user, please click 'Get Started' to register.");
      }
      
      const loggedUser = {
        id: found.id,
        email: found.email.trim().toLowerCase(),
        full_name: found.full_name,
        role: 'user'
      };
      
      localStorage.setItem('iq_current_user', JSON.stringify(loggedUser));
      return { user: loggedUser, access_token: 'mock-session-token' };
    },

    async register({ email, password, full_name }) {
      const users = getMockUsers();
      const trimmedEmail = email ? email.trim().toLowerCase() : "";
      const trimmedPassword = password ? password.trim() : "";
      const exists = users.some(u => u.email.trim().toLowerCase() === trimmedEmail);
      
      if (exists) {
        throw new Error("An account with this email address already exists.");
      }
      
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        email: trimmedEmail,
        password: trimmedPassword,
        full_name,
        created_date: new Date().toISOString()
      };
      
      saveMockUser(newUser);
      return { user: { id: newUser.id, email: newUser.email, full_name: newUser.full_name } };
    },

    async logout(redirectUrl) {
      localStorage.removeItem('iq_current_user');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
      return true;
    },

    loginWithProvider(provider, dest) {
      // Mock OAuth callback
      const mockOAuthUser = {
        id: 'google-oauth-user',
        email: 'candidate.google@example.com',
        full_name: 'OAuth Candidate',
        role: 'user'
      };
      localStorage.setItem('iq_current_user', JSON.stringify(mockOAuthUser));
      window.location.href = dest;
    },

    async resetPasswordRequest(email) {
      const trimmedEmail = email ? email.trim().toLowerCase() : "";
      console.log("Mock resetting password requested for:", trimmedEmail);
      
      const users = getMockUsers();
      const userExists = users.some(u => u.email.trim().toLowerCase() === trimmedEmail);
      
      if (!userExists) {
        throw new Error("No account was found with that email address.");
      }

      // Generate base64 token of email
      const token = btoa(trimmedEmail);
      const resetLink = `${window.location.origin}/reset-password?token=${token}`;

      // Send Reset Link via Email
      await iqClient.integrations.Core.SendEmail({
        to: trimmedEmail,
        subject: "Reset Your Password - InterviewIQ AI",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your InterviewIQ AI account.</p>
            <p>Please click the button below to set a new password:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #999;">If you didn't request this email, you can safely ignore it.</p>
          </div>
        `
      });

      return true;
    },

    async resetPassword({ resetToken, newPassword }) {
      console.log("Mock resetting credentials payload:", resetToken, newPassword);
      
      let email = '';
      try {
        email = atob(resetToken).trim().toLowerCase();
      } catch(e) {
        throw new Error("Invalid or expired reset token.");
      }

      const users = getMockUsers();
      const idx = users.findIndex(u => u.email.trim().toLowerCase() === email);

      if (idx === -1) {
        throw new Error("No account associated with this reset request was found.");
      }

      // Update password
      users[idx].password = newPassword ? newPassword.trim() : "";
      localStorage.setItem('iq_users', JSON.stringify(users));
      
      console.log(`Password updated successfully for: ${email}`);
      return true;
    },

    isAuthenticated() {
      return !!localStorage.getItem('iq_current_user');
    }
  },

  // 3. Mock AI Integrations
  integrations: {
    Core: {
      async UploadFile({ file }) {
        console.log("Mock uploading file:", file.name);
        return {
          url: `https://mock-file-repository.com/resumes/${file.name}`,
          name: file.name
        };
      },

      async SendEmail({ to, subject, html }) {
        console.log(`SendEmail request to: ${to}, subject: ${subject}`);
        const textContent = html
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]*>/g, '\n')
          .replace(/\n\s*\n/g, '\n')
          .trim();

        const web3Key = localStorage.getItem('iq_web3forms_key');
        // Force FormSubmit.co for owner feedback or if Web3Forms key is not configured
        if (to === 'akvibes.official143@gmail.com' || !web3Key) {
          try {
            const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                subject: subject,
                from_name: 'InterviewIQ AI',
                message: textContent
              })
            });
            const data = await res.json();
            if (data.success) {
              console.log("Email successfully dispatched via FormSubmit.");
            } else {
              console.error("FormSubmit response error:", data);
            }
          } catch (e) {
            console.error("Error connecting to FormSubmit dispatch:", e);
          }
        } else {
          try {
            const res = await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                access_key: web3Key,
                subject: subject,
                from_name: 'InterviewIQ AI',
                recipient_target: to,
                content: textContent
              })
            });
            const data = await res.json();
            if (data.success) {
              console.log("Email successfully dispatched via Web3Forms.");
            } else {
              console.error("Web3Forms response warning:", data.message);
            }
          } catch (e) {
            console.error("Error connecting to Web3Forms dispatch:", e);
          }
        }
        return true;
      },

      async InvokeLLM({ prompt }) {
        console.log("Mocking LLM processing prompt:", prompt);
        
        // Match prompt contents to generate realistic mock AI text/JSON
        
        // Question generation â€” matches both old and new prompt formats
        if (
          prompt.includes("interview questions") ||
          prompt.includes("exactly 9") ||
          prompt.includes("PERSONALISED") ||
          prompt.includes("Target role") ||
          prompt.includes("Core skills declared")
        ) {
          // Extract role and skills from prompt for personalised questions
          let role = 'Software Developer';
          let skills = [];
          try {
            const roleMatch = prompt.match(/Target role:\s*([^\n]+)/);
            if (roleMatch) role = roleMatch[1].trim();
            const skillMatch = prompt.match(/Core skills declared:\s*([^\n]+)/);
            if (skillMatch) skills = skillMatch[1].split(',').map(s => s.trim()).filter(Boolean);
          } catch(e) {}

          let lang = 'English';
          if (prompt.includes("Hindi")) lang = 'Hindi';
          else if (prompt.includes("Telugu")) lang = 'Telugu';
          else if (prompt.includes("Tamil")) lang = 'Tamil';

          if (lang === 'Hindi') {
            return {
              text: JSON.stringify({
                questions: [
                  "React à¤®à¥‡à¤‚ à¤µà¤°à¥à¤šà¥à¤…à¤² DOM à¤•à¥à¤¯à¤¾ à¤¹à¥ˆ à¤”à¤° à¤¯à¤¹ à¤¡à¤¾à¤¯à¤°à¥‡à¤•à¥à¤Ÿ DOM à¤®à¥ˆà¤¨à¤¿à¤ªà¥à¤²à¥‡à¤¶à¤¨ à¤•à¥€ à¤¤à¥à¤²à¤¨à¤¾ à¤®à¥‡à¤‚ à¤ªà¤°à¤«à¥‰à¤°à¥à¤®à¥‡à¤‚à¤¸ à¤•à¥‹ à¤•à¥ˆà¤¸à¥‡ à¤¬à¥‡à¤¹à¤¤à¤° à¤¬à¤¨à¤¾à¤¤à¤¾ à¤¹à¥ˆ?",
                  "à¤†à¤ª à¤à¤• à¤¬à¤¡à¤¼à¥‡ React à¤à¤ªà¥à¤²à¤¿à¤•à¥‡à¤¶à¤¨ à¤®à¥‡à¤‚ à¤•à¤‚à¤ªà¥‹à¤¨à¥‡à¤‚à¤Ÿ-à¤²à¥‡à¤µà¤² à¤¬à¤¨à¤¾à¤® à¤—à¥à¤²à¥‹à¤¬à¤² à¤¸à¥à¤Ÿà¥‡à¤Ÿ à¤•à¥‹ à¤•à¥ˆà¤¸à¥‡ à¤®à¥ˆà¤¨à¥‡à¤œ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚?",
                  "à¤¸à¥‰à¤«à¥à¤Ÿà¤µà¥‡à¤¯à¤° à¤ªà¥à¤°à¥‹à¤œà¥‡à¤•à¥à¤Ÿà¥à¤¸ à¤®à¥‡à¤‚ à¤°à¤¿à¤ªà¥‰à¤œà¤¿à¤Ÿà¤°à¥€ à¤•à¥‹ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¿à¤¤ à¤°à¤–à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ª à¤•à¥Œà¤¨ à¤¸à¥‡ à¤Ÿà¥‚à¤²à¥à¤¸ à¤¯à¤¾ à¤¬à¥‡à¤¸à¥à¤Ÿ à¤ªà¥à¤°à¥ˆà¤•à¥à¤Ÿà¤¿à¤¸à¥‡à¤œ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚?",
                  "à¤ªà¤°à¤¿à¤¦à¥ƒà¤¶à¥à¤¯: à¤°à¤¿à¤²à¥€à¤œ à¤¸à¥‡ à¤ à¥€à¤• à¤ªà¤¹à¤²à¥‡ à¤†à¤ªà¤•à¤¾ à¤à¤• à¤ªà¥à¤°à¤®à¥à¤– à¤«à¥€à¤šà¤° à¤•à¥à¤°à¥ˆà¤¶ à¤¹à¥‹ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤…à¤ªà¤¨à¥€ à¤¡à¤¿à¤¬à¤—à¤¿à¤‚à¤— à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¸à¤®à¤à¤¾à¤à¤‚à¥¤",
                  "à¤ªà¤°à¤¿à¤¦à¥ƒà¤¶à¥à¤¯: à¤†à¤ªà¤•à¥‹ à¤¬à¤¿à¤¨à¤¾ à¤¡à¥‰à¤•à¥à¤¯à¥‚à¤®à¥‡à¤‚à¤Ÿà¥‡à¤¶à¤¨ à¤µà¤¾à¤²à¥‡ à¤à¤• à¤ªà¥à¤°à¤¾à¤¨à¥‡ à¤®à¥‰à¤¡à¥à¤¯à¥‚à¤² à¤•à¥‹ à¤°à¥€à¤«à¥ˆà¤•à¥à¤Ÿà¤° à¤•à¤°à¤¨à¤¾ à¤¹à¥ˆà¥¤ à¤†à¤ª à¤‡à¤¸à¥‡ à¤•à¥ˆà¤¸à¥‡ à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚à¤—à¥‡?",
                  "à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤®à¥à¤à¥‡ à¤•à¤¿à¤¸à¥€ à¤à¤¸à¥‡ à¤¸à¤®à¤¯ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾ à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤œà¤¬ à¤†à¤ªà¤•à¤¾ à¤•à¤¿à¤¸à¥€ à¤Ÿà¥€à¤® à¤®à¥‡à¤‚à¤¬à¤° à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤®à¤¤à¤­à¥‡à¤¦ à¤¥à¤¾?",
                  "à¤•à¥ƒà¤ªà¤¯à¤¾ à¤…à¤ªà¤¨à¤¾ à¤ªà¤°à¤¿à¤šà¤¯ à¤¦à¥‡à¤‚ à¤”à¤° à¤‰à¤¸ à¤ªà¥à¤°à¥‹à¤œà¥‡à¤•à¥à¤Ÿ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤à¤‚ à¤œà¤¿à¤¸à¥‡ à¤†à¤ªà¤¨à¥‡ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤¹à¥ˆ à¤”à¤° à¤œà¤¿à¤¸ à¤ªà¤° à¤†à¤ªà¤•à¥‹ à¤¸à¤¬à¤¸à¥‡ à¤œà¥à¤¯à¤¾à¤¦à¤¾ à¤—à¤°à¥à¤µ à¤¹à¥ˆà¥¤",
                  "à¤†à¤ª à¤…à¤—à¤²à¥‡ à¤¦à¥‹ à¤µà¤°à¥à¤·à¥‹à¤‚ à¤®à¥‡à¤‚ à¤–à¥à¤¦ à¤•à¥‹ à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤°à¥‚à¤ª à¤¸à¥‡ à¤•à¤¹à¤¾à¤ à¤µà¤¿à¤•à¤¸à¤¿à¤¤ à¤¹à¥‹à¤¤à¥‡ à¤¦à¥‡à¤–à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?",
                  "à¤†à¤ª à¤‡à¤¸ à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤­à¥‚à¤®à¤¿à¤•à¤¾ à¤®à¥‡à¤‚ à¤•à¥à¤¯à¥‹à¤‚ à¤°à¥à¤šà¤¿ à¤°à¤–à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤”à¤° à¤†à¤ª à¤¹à¤®à¤¾à¤°à¥‡ à¤¸à¤¾à¤¥ à¤•à¥ˆà¤¸à¥‡ à¤¯à¥‹à¤—à¤¦à¤¾à¤¨ à¤¦à¥‡ à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚?"
                ]
              })
            };
          }

          if (lang === 'Telugu') {
            return {
              text: JSON.stringify({
                questions: [
                  "React à°²à±‹ à°µà°°à±à°šà±à°µà°²à± DOM à°…à°‚à°Ÿà±‡ à°à°®à°¿à°Ÿà°¿ à°®à°°à°¿à°¯à± à°‡à°¦à°¿ à°¡à±ˆà°°à±†à°•à±à°Ÿà± DOM à°¤à±‹ à°ªà±‹à°²à°¿à°¸à±à°¤à±‡ à°ªà°¨à°¿à°¤à±€à°°à±à°¨à± à°Žà°²à°¾ à°®à±†à°°à±à°—à±à°ªà°°à±à°¸à±à°¤à±à°‚à°¦à°¿?",
                  "à°ªà±†à°¦à±à°¦ React à°…à°ªà±à°²à°¿à°•à±‡à°·à°¨à±â€Œà°²à±‹ à°•à°¾à°‚à°ªà±‹à°¨à±†à°‚à°Ÿà±-à°²à±†à°µà°²à± à°®à°°à°¿à°¯à± à°—à±à°²à±‹à°¬à°²à± à°¸à±à°Ÿà±‡à°Ÿà±â€Œà°¨à± à°®à±€à°°à± à°Žà°²à°¾ à°®à±‡à°¨à±‡à°œà± à°šà±‡à°¸à±à°¤à°¾à°°à±?",
                  "à°¸à°¾à°«à±à°Ÿà±â€Œà°µà±‡à°°à± à°¡à±†à°µà°²à°ªà±â€Œà°®à±†à°‚à°Ÿà±â€Œà°²à±‹ à°µà±†à°°à±à°·à°¨à± à°•à°‚à°Ÿà±à°°à±‹à°²à± à°®à°°à°¿à°¯à± à°•à±‹à°¡à± à°°à°¿à°µà±à°¯à±‚à°² à°ªà±à°°à°¾à°§à°¾à°¨à±à°¯à°¤ à°à°®à°¿à°Ÿà°¿?",
                  "à°¸à°‚à°¦à°°à±à°­à°‚: à°®à±€ à°•à±Šà°¤à±à°¤ à°«à±€à°šà°°à± à°ªà±à°°à±Šà°¡à°•à±à°·à°¨à±â€Œà°²à±‹ à°¬à±à°°à±‡à°•à± à°…à°¯à°¿à°¨à°ªà±à°ªà±à°¡à± à°®à±€à°°à± à°¦à°¾à°¨à±à°¨à°¿ à°Žà°²à°¾ à°¡à±€à°¬à°—à± à°šà±‡à°¸à±à°¤à°¾à°°à±?",
                  "à°¸à°‚à°¦à°°à±à°­à°‚: à°¡à°¾à°•à±à°¯à±à°®à±†ãƒ³ãƒ†à°·à°¨à± à°²à±‡à°¨à°¿ à°ªà°¾à°¤ à°¸à°¿à°¸à±à°Ÿà°®à±â€Œà°¨à± à°°à±€à°«à°¾à°•à±à°Ÿà°°à± à°šà±‡à°¯à°¡à°¾à°¨à°¿à°•à°¿ à°®à±€à°°à± à° à°ªà±à°²à°¾à°¨à± à°…à°¨à±à°¸à°°à°¿à°¸à±à°¤à°¾à°°à±?",
                  "à°¸à°¹à±‹à°¦à±à°¯à±‹à°—à±à°²à°¤à±‹ à°¸à°¾à°‚à°•à±‡à°¤à°¿à°• à°µà°¿à°­à±‡à°¦à°¾à°²à± à°µà°šà±à°šà°¿à°¨à°ªà±à°ªà±à°¡à± à°µà°¾à°Ÿà°¿à°¨à°¿ à°Žà°²à°¾ à°ªà°°à°¿à°·à±à°•à°°à°¿à°‚à°šà±à°•à±à°‚à°Ÿà°¾à°°à±?",
                  "à°®à±€ à°ªà±à°°à°¾à°œà±†à°•à±à°Ÿà± à°…à°¨à±à°­à°µà°‚ à°—à±à°°à°¿à°‚à°šà°¿ à°®à°°à°¿à°¯à± à°®à±€à°°à± à°Žà°¦à±à°°à±à°•à±Šà°¨à±à°¨ à°¸à°µà°¾à°³à±à°² à°—à±à°°à°¿à°‚à°šà°¿ à°•à±à°²à±à°ªà±à°¤à°‚à°—à°¾ à°µà°¿à°µà°°à°¿à°‚à°šà°‚à°¡à°¿.",
                  "à°°à°¾à°¬à±‹à°¯à±‡ à°°à±†à°‚à°¡à±‡à°³à±à°²à°²à±‹ à°®à±€ à°¸à°¾à°‚à°•à±‡à°¤à°¿à°• à°ªà±à°°à°¯à°¾à°£à°‚ à° à°µà°¿à°§à°‚à°—à°¾ à°‰à°‚à°¡à°¾à°²à°¨à°¿ à°†à°¶à°¿à°¸à±à°¤à±à°¨à±à°¨à°¾à°°à±?",
                  "à°ˆ à°‰à°¦à±à°¯à±‹à°—à°‚ à°ªà°Ÿà±à°² à°®à±€à°•à± à°†à°¸à°•à±à°¤à°¿ à°•à°²à°—à°¡à°¾à°¨à°¿à°•à°¿ à°ªà±à°°à°§à°¾à°¨ à°•à°¾à°°à°£à°‚ à°à°®à°¿à°Ÿà°¿?"
                ]
              })
            };
          }

          if (lang === 'Tamil') {
            return {
              text: JSON.stringify({
                questions: [
                  "React à®‡à®²à¯ à®®à¯†à®¯à¯à®¨à®¿à®•à®°à¯ DOM à®Žà®©à¯à®±à®¾à®²à¯ à®Žà®©à¯à®©, à®…à®¤à¯ à®¨à¯‡à®°à®Ÿà®¿ DOM à® à®µà®¿à®Ÿ à®šà¯†à®¯à®²à¯à®¤à®¿à®±à®©à¯ˆ à®Žà®µà¯à®µà®¾à®±à¯ à®®à¯‡à®®à¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®•à®¿à®±à®¤à¯?",
                  "à®’à®°à¯ à®ªà¯†à®°à®¿à®¯ React à®ªà®¯à®©à¯à®ªà®¾à®Ÿà¯à®Ÿà®¿à®²à¯ à®•à¯‚à®±à¯-à®¨à®¿à®²à¯ˆ à®®à®±à¯à®±à¯à®®à¯ à®‰à®²à®•à®³à®¾à®µà®¿à®¯ à®¨à®¿à®²à¯ˆà®¯à¯ˆ à®Žà®µà¯à®µà®¾à®±à¯ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯?",
                  "à®®à¯†à®©à¯à®ªà¯Šà®°à¯à®³à¯ à®¤à®¿à®Ÿà¯à®Ÿà®™à¯à®•à®³à®¿à®²à¯ à®ªà®¤à®¿à®ªà¯à®ªà¯ à®•à®Ÿà¯à®Ÿà¯à®ªà¯à®ªà®¾à®Ÿà¯à®Ÿà¯à®•à¯à®•à®¾à®© à®šà®¿à®±à®¨à¯à®¤ à®¨à®Ÿà¯ˆà®®à¯à®±à¯ˆà®•à®³à¯ à®¯à®¾à®µà¯ˆ?",
                  "à®šà¯‚à®´à¯à®¨à®¿à®²à¯ˆ: à®µà¯†à®³à®¿à®¯à¯€à®Ÿà¯à®Ÿà®¿à®±à¯à®•à¯ à®šà®±à¯à®±à¯ à®®à¯à®©à¯à®ªà¯ à®‰à®™à¯à®•à®³à¯ à®…à®®à¯à®šà®®à¯ à®šà¯†à®¯à®²à®¿à®´à®¨à¯à®¤à®¾à®²à¯ à®…à®¤à¯ˆ à®Žà®µà¯à®µà®¾à®±à¯ à®šà®°à®¿à®šà¯†à®¯à¯à®µà¯€à®°à¯à®•à®³à¯?",
                  "à®šà¯‚à®´à¯à®¨à®¿à®²à¯ˆ: à®†à®µà®£à®™à¯à®•à®³à¯ à®‡à®²à¯à®²à®¾à®¤ à®’à®°à¯ à®ªà®´à¯ˆà®¯ à®¤à¯Šà®•à¯à®¤à®¿à®¯à¯ˆ à®®à¯€à®£à¯à®Ÿà¯à®®à¯ à®•à®Ÿà¯à®Ÿà®®à¯ˆà®•à¯à®• à®¨à¯€à®™à¯à®•à®³à¯ à®Žà®©à¯à®© à®šà¯†à®¯à¯à®µà¯€à®°à¯à®•à®³à¯?",
                  "à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯ à®šà®• à®Šà®´à®¿à®¯à®°à¯à®Ÿà®©à¯ à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ª à®•à®°à¯à®¤à¯à®¤à¯ à®µà¯‡à®±à¯à®ªà®¾à®Ÿà¯ à®à®±à¯à®ªà®Ÿà¯à®Ÿà®ªà¯‹à®¤à¯ à®…à®¤à¯ˆ à®Žà®µà¯à®µà®¾à®±à¯ à®¤à¯€à®°à¯à®¤à¯à®¤à¯€à®°à¯à®•à®³à¯?",
                  "à®‰à®™à¯à®•à®³à¯ˆ à®…à®±à®¿à®®à¯à®•à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à®¿à®•à¯ à®•à¯Šà®£à¯à®Ÿà¯, à®¨à¯€à®™à¯à®•à®³à¯ à®‰à®°à¯à®µà®¾à®•à¯à®•à®¿à®¯ à®®à®¿à®•à®šà¯à®šà®¿à®±à®¨à¯à®¤ à®¤à®¿à®Ÿà¯à®Ÿà®¤à¯à®¤à¯ˆ à®µà®¿à®µà®°à®¿à®•à¯à®•à®µà¯à®®à¯.",
                  "à®…à®Ÿà¯à®¤à¯à®¤ à®‡à®°à®£à¯à®Ÿà¯ à®†à®£à¯à®Ÿà¯à®•à®³à®¿à®²à¯ à®‰à®™à¯à®•à®³à¯ˆ à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ª à®°à¯€à®¤à®¿à®¯à®¾à®• à®Žà®™à¯à®•à¯ à®ªà®¾à®°à¯à®•à¯à®• à®µà®¿à®°à¯à®®à¯à®ªà¯à®•à®¿à®±à¯€à®°à¯à®•à®³à¯?",
                  "à®‡à®¨à¯à®¤ à®•à¯à®±à®¿à®ªà¯à®ªà®¿à®Ÿà¯à®Ÿ à®µà¯‡à®²à¯ˆà®•à¯à®•à¯ à®¨à¯€à®™à¯à®•à®³à¯ à®à®©à¯ à®µà®¿à®£à¯à®£à®ªà¯à®ªà®¿à®¤à¯à®¤à¯€à®°à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®‰à®™à¯à®•à®³à®¿à®©à¯ à®®à¯à®•à¯à®•à®¿à®¯ à®ªà®²à®®à¯ à®Žà®©à¯à®©?"
                ]
              })
            };
          }

          const isFrontend = skills.some(s => /react|html|css|vue|next/i.test(s)) || /front/i.test(role);
          const isData     = skills.some(s => /python|sql|pandas|ml|tensorflow/i.test(s)) || /data/i.test(role);
          const isBackend  = skills.some(s => /node|express|django|spring|api/i.test(s)) || /back/i.test(role);
          const skill1 = skills[0] || 'JavaScript';
          const skill2 = skills[1] || 'React';
          const skill3 = skills[2] || 'CSS';

          const techQs = isFrontend ? [
            `Explain the virtual DOM in React and why it improves performance over direct DOM manipulation.`,
            `How do you manage component-level vs. global state in a large ${skill2} application?`,
            `Describe how you approach cross-browser compatibility issues when using ${skill3}.`,
          ] : isData ? [
            `Explain the difference between supervised and unsupervised learning with an example from your projects.`,
            `How do you handle missing or skewed data in a ${skill1} pipeline before model training?`,
            `Walk me through how you would design a data processing pipeline for a large-scale dataset.`,
          ] : isBackend ? [
            `How do you design a RESTful API with proper error handling and authentication using ${skill1}?`,
            `Explain the differences between SQL and NoSQL databases â€” when would you pick each?`,
            `How do you handle rate limiting and security in a ${role} backend service?`,
          ] : [
            `Walk me through how you would architect a scalable system for a ${role} position.`,
            `How do you handle performance bottlenecks in ${skill1} applications?`,
            `Describe your approach to debugging a critical production issue in a ${skill1} environment.`,
          ];

          return {
            text: JSON.stringify({
              questions: [
                ...techQs,
                `Scenario: Your ${skill1} feature breaks in production right before a release. Walk me through your debugging and communication process.`,
                `Scenario: You are asked to refactor a legacy ${skill2} module with no documentation and tight deadline. How do you approach it?`,
                `Tell me about a time you had a technical disagreement with a teammate. How did you resolve it?`,
                `Describe a project you built using ${skill1} that you are most proud of. What trade-offs did you make?`,
                `What draws you specifically to the ${role} role, and how do your skills in ${skill1} prepare you for it?`,
                `Where do you see yourself growing technically in the next two years, and what skills are you actively building?`,
              ]
            })
          };
        }

        // ATS resume parse
        if (prompt.includes("ATS") || prompt.includes("parser") || prompt.includes("resume")) {
          // Dynamically read profile skills for realistic suggestions
          let preferredRole = 'Software Developer';
          let skills = '';
          try {
            const currentUser = JSON.parse(localStorage.getItem('iq_current_user') || 'null');
            const profiles = JSON.parse(localStorage.getItem('iq_profiles') || '[]');
            const profile = (currentUser ? profiles.find(p => p.email === currentUser.email) : null) || profiles[0] || {};
            preferredRole = 'Software Developer';
            if (profile.resume_analysis) {
              try {
                const ra = JSON.parse(profile.resume_analysis);
                if (ra.job_suitability) preferredRole = ra.job_suitability;
              } catch {}
            }
            skills = profile.skills || '';
          } catch(e) {}

          const skillList = skills ? skills.split(',').map(s => s.trim()) : ['React', 'HTML', 'CSS'];
          const isDataRole = preferredRole.toLowerCase().includes('data') || skills.toLowerCase().includes('python') || skills.toLowerCase().includes('sql');
          const isFrontend = preferredRole.toLowerCase().includes('front') || skills.toLowerCase().includes('react') || skills.toLowerCase().includes('html');

          return {
            text: JSON.stringify({
              ats_score: isFrontend ? 72 : isDataRole ? 75 : 68,
              job_suitability: isFrontend ? 'Frontend Developer' : isDataRole ? 'Data Analyst' : preferredRole,
              candidate_summary: `Candidate demonstrates proficiency in ${skillList.slice(0, 3).join(', ')} and targets a ${preferredRole} role. Resume shows structured project exposure with relevant technical experience, though depth in deployment and testing areas can be strengthened further for competitive ATS scoring.`,
              strengths: isFrontend ? [
                "Proficiency in modern frontend frameworks and styling (React JS, CSS Grid)",
                "Active participation in hackathons and ideathons",
                "Familiarity with AI-assisted development tools and modern developer workflows",
                "Clear and organized resume layout"
              ] : isDataRole ? [
                "Strong analytical and data querying background with SQL/Python",
                "Demonstrated experience building data pipelines and reporting dashboards",
                "Solid understanding of statistical modeling frameworks",
                "Clear project documentation with measurable impact metrics"
              ] : [
                `Strong foundation in ${skillList[0] || 'programming'} and software architecture`,
                "Clear documentation of project contributions and technical deliverables",
                "Demonstrated problem-solving in real-world application scenarios",
                "Organized resume structure with consistent formatting"
              ],
              weaknesses: isFrontend ? [
                "Missing explicit 'JavaScript' keyword in the technical skills section",
                "Project descriptions are brief and lack technical depth or specific impact metrics",
                "Lack of professional experience or internships",
                "No backend framework (e.g., Django, Express) specified to complement skills"
              ] : isDataRole ? [
                "No mention of visualization tools like Tableau or Power BI",
                "Machine learning model deployment experience not highlighted",
                "Missing cloud data platform experience (AWS Redshift, BigQuery)",
                "Internship or real-world data project exposure could be strengthened"
              ] : [
                "Sparse description of past system design and deployment pipelines",
                "CI/CD automation scripting descriptions are missing from project entries",
                "Project descriptions lack quantifiable performance metrics",
                "No mention of testing frameworks or quality assurance practices"
              ],
              missing_skills: isFrontend ? [
                "JavaScript (explicitly mentioned)",
                "TypeScript",
                "RESTful API Development",
                "State Management (e.g., Redux or Context API)",
                "Unit Testing (e.g., Jest, Pytest)"
              ] : isDataRole ? [
                "Tableau / Power BI",
                "Machine Learning (Scikit-learn)",
                "Cloud Data Platforms (BigQuery, Redshift)",
                "Apache Spark",
                "Data Pipeline Orchestration (Airflow)"
              ] : [
                "Docker Containerization",
                "CI/CD Workflow YAML Scripting",
                "Kubernetes",
                "Cloud Deployment (AWS/GCP)",
                "Integration Testing"
              ],
              improvements: isFrontend ? [
                "Explicitly add 'JavaScript' to the Programming Skills section as it is a critical keyword for ATS",
                "Expand the Projects section using the STAR (Situation, Task, Action, Result) method",
                "Include links to GitHub repositories for the listed projects to showcase code quality",
                "Specify which Python libraries or frameworks (like Flask or FastAPI) were used in projects",
                "Add more specific details to the Hackathon Highlights section regarding technical implementation"
              ] : isDataRole ? [
                "Add Tableau/Power BI visualizations section to the resume",
                "Quantify the scale of datasets processed in each project (rows, GB, time savings)",
                "Include cloud data platform certifications or coursework",
                "Describe the business impact of each analytical project using metrics",
                "Mention collaboration with cross-functional stakeholders in project summaries"
              ] : [
                "Detail past system design and deployment architecture decisions",
                "Include concrete performance benchmarking statistics in project descriptions",
                "Add a dedicated Skills section with explicit tool and framework names",
                "Describe CI/CD pipeline experience with specific tools (GitHub Actions, Jenkins)",
                "Add testing coverage percentages or QA methodologies used in past projects"
              ],
              technical_questions: isFrontend ? [
                "Can you explain the difference between functional components and class components in React?",
                "How does the 'this' keyword behave differently in JavaScript compared to Python?",
                "Explain the concept of 'Hoisting' in JavaScript.",
                "Describe the difference between SQL and NoSQL databases, and when you would choose one over the other.",
                "What are React Hooks, and can you explain how useEffect works?"
              ] : isDataRole ? [
                "Explain the difference between supervised and unsupervised machine learning.",
                "How would you handle missing values in a large dataset before model training?",
                "What is the difference between GROUP BY and HAVING in SQL?",
                "Describe a data pipeline you built and the tools you used to orchestrate it.",
                "How would you explain a complex model's predictions to a non-technical stakeholder?"
              ] : [
                "Explain the difference between REST and GraphQL API architectures.",
                "How do you approach designing a scalable microservices system?",
                "What strategies do you use to optimize database query performance?",
                "Describe your experience with containerization using Docker.",
                "How would you implement a CI/CD pipeline for a new project from scratch?"
              ],
              hr_questions: [
                `What motivated you to pursue a specialization in ${preferredRole}?`,
                "How do you manage your time when working on multiple projects simultaneously?",
                "Where do you see your technical skills evolving over the next two years?",
                "What has been your biggest professional or academic takeaway so far?",
                "How do you handle constructive criticism on your code or project deliverables?"
              ],
              behavioral_questions: [
                "Tell me about a time you had to work with a teammate who had a different technical approach than yours. How did you resolve it?",
                "Describe a challenging bug you encountered in a recent project and how you went about debugging it.",
                "Give an example of a time you had to learn a new technology quickly to meet a deadline.",
                "Tell me about a project that did not go as planned and what you would do differently.",
                "Describe a situation where you took initiative to improve a process or product feature."
              ]
            })
          };
        }

        // Evaluation
        if (prompt.includes("evaluate") || prompt.includes("transcript")) {
          return {
            text: JSON.stringify({
              overall_score: 82,
              technical_score: 80,
              communication_score: 85,
              confidence_score: 83,
              fluency_score: 79,
              grammar_score: 86,
              hr_score: 82,
              strengths: [
                { "title": "Logical Concept Breakdown", "description": "Candidate successfully structured answers using core technical definitions." },
                { "title": "Strong Vocabulary Density", "description": "Good mention of rendering limits, state scopes, and network metrics." }
              ],
              weaknesses: [
                { "title": "Shallow Edge-Case Depth", "description": "System architecture answers could expand further on retry counts, fallback layers, and container configurations." }
              ],
              improvements: [
                "Enrich scenario answers by discussing specific failover policies or offline storage sync triggers."
              ],
              resources: [
                { "title": "System Design Caching & Fallbacks", "url": "https://github.com/donnemartin/system-design-primer" },
                { "title": "STAR Behavioral Frameworks", "url": "https://www.indeed.com/career-advice/interviewing/star-method-interview" }
              ]
            })
          };
        }

        // Tips & Career Coach advice
        if (prompt.includes("advisor") || prompt.includes("career coach") || prompt.includes("negotiations")) {
          // Extract specific user question to reply dynamically
          let userQuestion = "";
          const qMatch = prompt.match(/New Question:\s*([^\n]+)/i);
          if (qMatch) {
            userQuestion = qMatch[1].trim();
          } else {
            const genericMatch = prompt.match(/Question:\s*([^\n]+)/i);
            if (genericMatch) userQuestion = genericMatch[1].trim();
          }

          if (userQuestion) {
            const qLower = userQuestion.toLowerCase();
            if (qLower.includes("gap") || qLower.includes("break")) {
              return {
                text: "Explain your gap year by focusing on personal growth, self-study, or freelance projects you undertook. Frame it positively as a period of active learning."
              };
            }
            if (qLower.includes("introduce") || qLower.includes("tell me about yourself") || qLower.includes("myself")) {
              return {
                text: "Start with a 30-second summary of your current skills and key strengths, highlight 1-2 major achievements, and explain why you want this specific job."
              };
            }
            if (qLower.includes("resume") || qLower.includes("cv") || qLower.includes("portfolio")) {
              return {
                text: "Keep your resume to one page, highlight your strongest skills at the top, and describe your project contributions using action verbs and concrete metrics."
              };
            }
            if (qLower.includes("react") || qLower.includes("hook") || qLower.includes("state")) {
              return {
                text: "For React questions, focus on virtual DOM efficiency, component state vs. global state, and explain how common hooks like useEffect manage side effects."
              };
            }
            if (qLower.includes("salary") || qLower.includes("negotiat")) {
              return {
                text: "Always research market rates for your role first, express enthusiasm for the position, and discuss salary expectations based on your technical value."
              };
            }
            // Fallback dynamic response using the question keywords
            const words = userQuestion.split(' ').filter(w => w.length > 4);
            const keyword = words[Math.floor(Math.random() * words.length)] || "your career";
            return {
              text: `To address your question about "${keyword}", I recommend focusing on practical projects, solidifying core concepts, and detailing your problem-solving process.`
            };
          }

          return {
            text: `### Expert Career Coach Guidance ðŸ§ \n\nHere are actionable steps to improve your technical prep and mock results:\n\n1. **Leverage the STAR Framework**: When discussing technical problems, state the **Situation** clearly, define the **Task** at hand, elaborate on your specific **Action**, and summarize the business **Result**.\n2. **Control Verbal Pacing**: Keep speaking speeds at around **130-150 WPM**. Focus on pausing silently instead of using verbal ticks like *'um'*, *'like'*, or *'ah'*.\n3. **Keyword Alignment**: Update your CV bullet points to focus on outcomes (e.g., *"reduced asset bundle sizes by 24% using code-splitting\"* instead of *"worked on speed improvements\"*).`
          };
        }

        // Career Roadmap
        if (prompt.includes("roadmap") || prompt.includes("timeline")) {
          // Extract role from prompt
          let targetRole = "Software Developer";
          try {
            const roleMatch = prompt.match(/job role:\s*([^\n]+)/i);
            if (roleMatch) targetRole = roleMatch[1].trim();
          } catch(e) {}

          const lowerRole = targetRole.toLowerCase();

          let timeline = [];

          if (lowerRole.includes("front")) {
            timeline = [
              {
                "category": "foundation",
                "title": "HTML, CSS & JavaScript Basics",
                "weeks": 4,
                "skills": ["HTML5 Web Semantics", "CSS Layouts with Flexbox & Grid", "Modern ES6+ JavaScript Features"],
                "resources": "MDN Web Docs, freeCodeCamp Web Design Course"
              },
              {
                "category": "core",
                "title": "React Framework & Core Hooks",
                "weeks": 6,
                "skills": ["React Component Lifecycle", "Global State via Context API", "Data Fetching with Axios"],
                "resources": "Official React Documentation, Scrimba React Course"
              },
              {
                "category": "advanced",
                "title": "Responsive Layouts & Testing",
                "weeks": 6,
                "skills": ["Tailwind CSS Styling", "Vite Build Tool Configurations", "Unit Testing Component Logic with Jest"],
                "resources": "Tailwind CSS Docs, Jest Testing Framework Guides"
              },
              {
                "category": "mastery",
                "title": "Server-Side Rendering & Deployment",
                "weeks": 4,
                "skills": ["Next.js App Router Structure", "Lighthouse Page Speed Metrics", "Vercel Hosting Platforms"],
                "resources": "Next.js Learning Guides, Google web.dev Guidelines"
              }
            ];
          } else if (lowerRole.includes("back")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Server Programming & SQL Databases",
                "weeks": 4,
                "skills": ["Node.js Express Framework Setup", "Relational Database Concepts", "Writing Basic SQL Queries"],
                "resources": "Node.js official guides, W3Schools SQL tutorials"
              },
              {
                "category": "core",
                "title": "API Design & Router Controls",
                "weeks": 6,
                "skills": ["Designing RESTful API Routes", "Database Relations & SQL Joins", "Async Code Error Handling"],
                "resources": "MDN Backend Guides, freeCodeCamp API course"
              },
              {
                "category": "advanced",
                "title": "Backend Security & Middleware",
                "weeks": 6,
                "skills": ["User Token Auth with JWT", "Secure API Input Validation", "Backend Unit Tests with Mocha"],
                "resources": "OWASP Security guidelines, Postman Learning Center"
              },
              {
                "category": "mastery",
                "title": "Scaling & Server Deployments",
                "weeks": 4,
                "skills": ["Docker Container Configuration", "Redis Caching Layers", "Cloud Instances Setup on AWS"],
                "resources": "Docker Curriculum docs, AWS Academy Tutorials"
              }
            ];
          } else if (lowerRole.includes("data scientist") || lowerRole.includes("data science")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Python Basics & SQL Queries",
                "weeks": 4,
                "skills": ["Python Scripts for Automation", "Pandas Data Cleaning Methods", "SQL Table Joining"],
                "resources": "Kaggle Learn Python, SQL courses"
              },
              {
                "category": "core",
                "title": "Statistical Methods & Regression",
                "weeks": 6,
                "skills": ["Linear & Logistic Regression Models", "Feature Selection Algorithms", "Scikit-Learn Machine Learning Models"],
                "resources": "Coursera Machine Learning by Andrew Ng"
              },
              {
                "category": "advanced",
                "title": "Deep Learning & Model Tuning",
                "weeks": 6,
                "skills": ["TensorFlow Model Configuration", "Hyperparameter Fine-Tuning", "Data Augmentation Pipelines"],
                "resources": "DeepLearning.AI courses, Fast.ai tutorials"
              },
              {
                "category": "mastery",
                "title": "ML Model Deployments & MLOps",
                "weeks": 4,
                "skills": ["Creating APIs with FastAPI", "Containerizing Models using Docker", "Monitoring Model Drift"],
                "resources": "Hugging Face spaces docs, FastAPI Guides"
              }
            ];
          } else if (lowerRole.includes("ai engineer") || lowerRole.includes("artificial intelligence")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Python Coding & Math Basics",
                "weeks": 4,
                "skills": ["Python OOP Concepts", "Basic Matrix Operations", "API Requests Handling"],
                "resources": "Kaggle Learn, Khan Academy Linear Algebra"
              },
              {
                "category": "core",
                "title": "Large Language Models & Prompts",
                "weeks": 6,
                "skills": ["OpenAI API Model Integration", "Effective Prompt Design Structures", "LangChain Framework Logic"],
                "resources": "DeepLearning.AI Prompting courses"
              },
              {
                "category": "advanced",
                "title": "Retrieval Augmented Generation (RAG)",
                "weeks": 6,
                "skills": ["Vector Database Setup (Pinecone)", "Text Embedding Calculations", "Context Retrieval Optimization"],
                "resources": "Pinecone Learning Portal, Hugging Face Docs"
              },
              {
                "category": "mastery",
                "title": "AI Product Infrastructure",
                "weeks": 4,
                "skills": ["Building AI APIs with FastAPI", "Model Quantization and Optimization", "AWS AI Deployment Platforms"],
                "resources": "AWS Machine Learning blog, FastAPI official guide"
              }
            ];
          } else if (lowerRole.includes("devops")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Linux Commands & Git Workflows",
                "weeks": 4,
                "skills": ["Linux Terminal CLI Navigation", "Git Branch Merges & Resolving Conflicts", "Bash Shell Scripting Basics"],
                "resources": "Linux Journey guides, Git Immersion tutorial"
              },
              {
                "category": "core",
                "title": "CI/CD Automations & Yaml Workflows",
                "weeks": 6,
                "skills": ["GitHub Actions Pipeline Configurations", "Writing YAML Workflow Instructions", "Automated Testing Scripts Execution"],
                "resources": "GitHub Learning Lab, Jenkins Pipeline tutorials"
              },
              {
                "category": "advanced",
                "title": "Infrastructure as Code (IaC)",
                "weeks": 6,
                "skills": ["Terraform Scripts Setup", "Ansible System Configuration Playbooks", "Cloud Security Access Control Lists"],
                "resources": "HashiCorp Learn portal, Ansible documentation"
              },
              {
                "category": "mastery",
                "title": "Containers & Cloud Monitors",
                "weeks": 4,
                "skills": ["Docker Image Configuration", "Kubernetes Pod Orchestration", "Prometheus Health Monitors Setup"],
                "resources": "KodeKloud tutorials, CNCF training guides"
              }
            ];
          } else if (lowerRole.includes("designer") || lowerRole.includes("ui/ux")) {
            timeline = [
              {
                "category": "foundation",
                "title": "User Experience Design Principles",
                "weeks": 4,
                "skills": ["Color & Typography Design Rules", "Figma Design Workspace Basics", "User Persona Research"],
                "resources": "Figma Learn Tutorials, Behance Portfolio Inspirations"
              },
              {
                "category": "core",
                "title": "Figma Wireframes & User Flows",
                "weeks": 6,
                "skills": ["Figma Auto-Layout Configurations", "Interactive Prototypes Setup", "User Interview Strategies"],
                "resources": "Coursera Google UX Certificate course"
              },
              {
                "category": "advanced",
                "title": "Complex Figma Design Systems",
                "weeks": 6,
                "skills": ["Figma Component Variables Setup", "Design Library Alignments", "Responsive Page Layout Drafts"],
                "resources": "Material Design Guidelines, Nielsen Norman UX blogs"
              },
              {
                "category": "mastery",
                "title": "Developer Handoffs & Testing",
                "weeks": 4,
                "skills": ["Design Specs Inspecting for Developers", "Usability Testing Session Coordination", "Design A/B Experiment Analyses"],
                "resources": "Smashing Magazine Design section, Figma Handoff guides"
              }
            ];
          } else if (lowerRole.includes("product manager") || lowerRole.includes("product management")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Product Lifecycle & Agile Basics",
                "weeks": 4,
                "skills": ["Agile Project Methods", "Writing Clear User Stories", "Sprint Planning Principles"],
                "resources": "Product School Guides, Atlassian Agile Coach"
              },
              {
                "category": "core",
                "title": "KPI Metrics & Product Analytics",
                "weeks": 6,
                "skills": ["Key Performance Metrics Setup", "Amplitude Analytics Dashboards", "Basic Database Queries for Metrics"],
                "resources": "Mixpanel Product Analytics Academy"
              },
              {
                "category": "advanced",
                "title": "Backlogs & Prioritization Plans",
                "weeks": 6,
                "skills": ["Jira Ticket Backlog Grooming", "Prioritizing with RICE framework", "User Feedback Analyses"],
                "resources": "Product Management newsletters by Reforge"
              },
              {
                "category": "mastery",
                "title": "Market Strategies & Pricing Models",
                "weeks": 4,
                "skills": ["Competitor Matrix Analyses", "SaaS Pricing Model Formulations", "Launching New Product Features"],
                "resources": "SaaS growth blogs, Product Management books"
              }
            ];
          } else if (lowerRole.includes("cybersecurity") || lowerRole.includes("security")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Networking Protocols & Port Systems",
                "weeks": 4,
                "skills": ["TCP/IP Network Stack Concepts", "Analyzing Ports with Wireshark", "Linux Command Line Basics"],
                "resources": "CompTIA Security+ guidelines, Wireshark docs"
              },
              {
                "category": "core",
                "title": "Security Threat Identification",
                "weeks": 6,
                "skills": ["Kali Linux Toolkits Usage", "Firewall Rule Settings", "Detecting Port Scans"],
                "resources": "TryHackMe Security modules, PortSwigger Web Security Academy"
              },
              {
                "category": "advanced",
                "title": "System Vulnerability Checks",
                "weeks": 6,
                "skills": ["Metasploit Vulnerability Exploits", "OWASP Top 10 Security Flaws Checks", "Secure Coding Implementations"],
                "resources": "Hack The Box cyberlabs, OWASP cheat sheets"
              },
              {
                "category": "mastery",
                "title": "Compliance Audits & SOC Checks",
                "weeks": 4,
                "skills": ["ISO 27001 Security Policies", "SOC2 Data Compliance Auditing", "Incident Playbook Creation"],
                "resources": "ISACA security publications, compliance guidebooks"
              }
            ];
          } else if (lowerRole.includes("cloud") || lowerRole.includes("architect")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Virtual Network & VPC Setup",
                "weeks": 4,
                "skills": ["IP CIDR Subnet Configurations", "Public vs Private Subnet Routes", "Domain Name Routing Setup"],
                "resources": "AWS Cloud Practitioner guide, CloudAcademy tutorials"
              },
              {
                "category": "core",
                "title": "Cloud Servers & File Buckets",
                "weeks": 6,
                "skills": ["Launching Virtual Machines (EC2)", "Bucket Policy Storage Rules (S3)", "Role-Based Access Management (IAM)"],
                "resources": "AWS Skill Builder courses, GCP documentation"
              },
              {
                "category": "advanced",
                "title": "Serverless Configs & Auto Scaling",
                "weeks": 6,
                "skills": ["Deploying Serverless Functions (Lambda)", "Auto-Scaling Server Capacity Setup", "API Gateway Routing Setup"],
                "resources": "Serverless Framework docs, AWS Solutions Architect blueprints"
              },
              {
                "category": "mastery",
                "title": "Disaster Recoveries & Costs Controls",
                "weeks": 4,
                "skills": ["Multi-Region Server Failovers", "Cloud Budget & Alert Rules Setup", "Security Auditing AWS Accounts"],
                "resources": "AWS Well-Architected Framework guides"
              }
            ];
          } else if (lowerRole.includes("mobile") || lowerRole.includes("android") || lowerRole.includes("ios")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Mobile Language Programming Syntax",
                "weeks": 4,
                "skills": ["Swift/Kotlin OOP Syntax basics", "Mobile Architecture Guidelines", "Git Versioning"],
                "resources": "Swift Playgrounds, Android Basics in Kotlin"
              },
              {
                "category": "core",
                "title": "App Layouts & Navigation Control",
                "weeks": 6,
                "skills": ["SwiftUI Declarative Layouts", "Activity/ViewController States Setup", "API Network Fetch Requests"],
                "resources": "Hacking with Swift tutorials, Android Developer courses"
              },
              {
                "category": "advanced",
                "title": "Local Storage & State Controls",
                "weeks": 6,
                "skills": ["Offline App Cache (CoreData/Room)", "State Management Frameworks", "Mobile App Profiling Toolkits"],
                "resources": "raywenderlich.com mobile engineering guides"
              },
              {
                "category": "mastery",
                "title": "App Store Releases & Certs Setup",
                "weeks": 4,
                "skills": ["App Store Connect Setup Steps", "Provisioning Profiles configurations", "Automating App Deployments via Fastlane"],
                "resources": "Apple Connect Developer logs, Android Console guides"
              }
            ];
          } else if (lowerRole.includes("blockchain") || lowerRole.includes("web3")) {
            timeline = [
              {
                "category": "foundation",
                "title": "Blockchain Cryptography & P2P Protocols",
                "weeks": 4,
                "skills": ["Hashing Functions & Cryptographic Keys", "Distributed Ledger Workings", "Consensus Algorithm Concepts"],
                "resources": "Bitcoin Whitepaper, Ethereum Developer guides"
              },
              {
                "category": "core",
                "title": "Smart Contract Programming",
                "weeks": 6,
                "skills": ["Solidity Programming Language syntax", "Compiling smart contracts (Remix IDE)", "Local Testnets Setup (Truffle/Hardhat)"],
                "resources": "CryptoZombies Solidity Interactive course"
              },
              {
                "category": "advanced",
                "title": "Web3 DApp Backend Setup",
                "weeks": 6,
                "skills": ["Ethers.js Smart Contract Connections", "Wallet Authentication setups (MetaMask)", "Validating Contract Operations"],
                "resources": "Ethereum.org Developer Portal learning pathways"
              },
              {
                "category": "mastery",
                "title": "Token Standards & Audits Setup",
                "weeks": 4,
                "skills": ["Deploying ERC-20 & ERC-721 Tokens", "Contract Vulnerability Audit Methods", "IPFS Storage integration"],
                "resources": "OpenZeppelin Contracts guides, Web3 Security publications"
              }
            ];
          } else {
            // General Full Stack Developer fallback
            timeline = [
              {
                "category": "foundation",
                "title": "Programming Logic & Core Frameworks",
                "weeks": 4,
                "skills": ["Basic Language Syntaxes", "Git Version Control Operations", "HTML & CSS Page Layouts"],
                "resources": "freeCodeCamp, MDN Web documentation"
              },
              {
                "category": "core",
                "title": "Full Stack Architecture & DB Operations",
                "weeks": 6,
                "skills": ["Creating RESTful API Routers", "SQL Querying & DB Operations", "Interactive Frontend UI Components"],
                "resources": "Full Stack Open courses, Official Framework manuals"
              },
              {
                "category": "advanced",
                "title": "Testing, Operations & Tooling",
                "weeks": 6,
                "skills": ["Automated Testing Pipelines Setup", "Webpack & Vite Build Configs", "Optimizing Code Bundles"],
                "resources": "web.dev performance tuning, Jest testing manuals"
              },
              {
                "category": "mastery",
                "title": "Cloud Platforms & CI/CD Pipelines",
                "weeks": 4,
                "skills": ["Docker Container configurations", "Automating Deployments (GitHub Actions)", "Cloud Deployment Operations"],
                "resources": "Docker Curriculum, AWS Learning pathways"
              }
            ];
          }

          return {
            text: JSON.stringify({
              role: targetRole,
              timeline: timeline
            })
          };
        }

        // Job matching
        if (prompt.includes("consultant") || prompt.includes("matching")) {
          let preferredRole = 'Software Developer';
          let skills = '';
          
          try {
            const currentUser = JSON.parse(localStorage.getItem('iq_current_user') || 'null');
            const profiles = JSON.parse(localStorage.getItem('iq_profiles') || '[]');
            const profile = (currentUser ? profiles.find(p => p.email === currentUser.email) : null) || profiles[0] || {};
            preferredRole = 'Software Developer';
            if (profile.resume_analysis) {
              try {
                const ra = JSON.parse(profile.resume_analysis);
                if (ra.job_suitability) preferredRole = ra.job_suitability;
              } catch {}
            }
            skills = profile.skills || '';
          } catch(e) {}
          
          const skillList = skills.split(',').map(s => s.trim().toLowerCase());
          
          let role1Title = `${preferredRole} (Entry Level)`;
          let role1Desc = `Proficient in core software development frameworks. Aligns with your specified target career trajectory.`;
          let role1Match = 72;
          let role1Missing = [];
          let role1Learn = [];
          let role1Suggestions = "";

          let role2Title = "";
          let role2Desc = "";
          let role2Match = 65;
          let role2Missing = [];
          let role2Learn = [];
          let role2Suggestions = "";

          // Customize matching lists based on keywords
          if (preferredRole.toLowerCase().includes('front') || skillList.includes('react') || skillList.includes('html') || skillList.includes('css')) {
            role1Title = "Front-End Developer (Entry Level)";
            role1Desc = "Proficient in HTML, CSS, React JS, and has experience with frontend frameworks, which are key for this role.";
            role1Match = 70;
            role1Missing = skillList.includes('javascript') || skillList.includes('js') ? [] : ["JavaScript (explicitly mentioned)"];
            role1Learn = ["JavaScript", "State Management (e.g., Redux)", "Unit Testing (e.g., Jest)"];
            role1Suggestions = "Strengthen JavaScript skills and gain experience with state management and unit testing.";

            role2Title = "Web Developer (Junior)";
            role2Desc = "Ability to build user interfaces effectively using HTML, CSS and React JS, the main technologies required for web development.";
            role2Match = 65;
            role2Missing = [];
            role2Learn = ["Responsive Web Design", "REST APIs"];
            role2Suggestions = "Solidify responsive grid systems and practice REST API integrations.";
          } else if (preferredRole.toLowerCase().includes('data') || skillList.includes('python') || skillList.includes('sql') || skillList.includes('pandas')) {
            role1Title = "Data Analyst (Junior)";
            role1Desc = "Proficient in database queries, SQL scripting, and Python data structures required for compiling analytical reports.";
            role1Match = 75;
            role1Missing = skillList.includes('tableau') || skillList.includes('powerbi') ? ["Data Visualization Tools (e.g., Tableau)"] : ["Tableau Dashboarding"];
            role1Learn = ["Pandas & NumPy frameworks", "Tableau Dashboarding", "Advanced SQL joins"];
            role1Suggestions = "Advance your analytical query skills and build sample reporting dashboards.";

            role2Title = "Python Backend Developer (Entry Level)";
            role2Desc = "Design and build server side scripts, API endpoints, and data processing models using Python backends.";
            role2Match = 68;
            role2Missing = ["Docker configuration"];
            role2Learn = ["Django / Flask API routing", "PostgreSQL database structures", "Docker Container basics"];
            role2Suggestions = "Focus on API endpoint testing and server-side script optimization.";
          } else {
            // General Software Engineering
            role1Title = `${preferredRole} (Entry Level)`;
            role1Desc = `Aligns with your primary interest. Focuses on backend configurations and clean code logic.`;
            role1Match = 72;
            role1Missing = skillList.includes('git') ? [] : ["Git Version Control"];
            role1Learn = ["Algorithms & Data Structures", "Git Command Lines", "REST API structures"];
            role1Suggestions = "Advance your knowledge of database design, query structures, and clean coding paradigms.";

            role2Title = "Software Developer (Junior)";
            role2Desc = "Contribute to software application layers, writing unit test assertions and deploying basic server pipelines.";
            role2Match = 62;
            role2Missing = ["Docker setup"];
            role2Learn = ["Docker basics", "CI/CD Actions templates", "Integration testing"];
            role2Suggestions = "Solidify containerization patterns and explore version control pipelines.";
          }

          return {
            text: JSON.stringify([
              {
                "title": role1Title,
                "description": role1Desc,
                "match_percentage": role1Match,
                "missing_skills": role1Missing,
                "learn_next": role1Learn,
                "suggestions": role1Suggestions
              },
              {
                "title": role2Title,
                "description": role2Desc,
                "match_percentage": role2Match,
                "missing_skills": role2Missing,
                "learn_next": role2Learn,
                "suggestions": role2Suggestions
              }
            ])
          };
        }

        // Default fallback response
        return {
          text: "Here is a mock coaching advice response. Focus on code structures, clear communication metrics, and practice mock rounds regularly."
        };
      }
    }
  }
};


