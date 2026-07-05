import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { Save, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, refetchProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'Prefer not to say',
    current_status: 'Fresher',
    college_name: '',
    degree: '',
    branch: '',
    graduation_year: '',
    current_company: '',
    experience_level: '0-1 years',
    skills: ''
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || 'Prefer not to say',
        current_status: profile.current_status || 'Fresher',
        college_name: profile.college_name || '',
        degree: profile.degree || '',
        branch: profile.branch || '',
        graduation_year: profile.graduation_year || '',
        current_company: profile.current_company || '',
        experience_level: profile.experience_level || '0-1 years',
        skills: profile.skills || ''
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!form.full_name) {
      toast.error("Name is a required field.");
      return;
    }

    setSaving(true);
    try {
      await iqClient.entities.UserProfile.update(profile.id, form);
      toast.success("Profile details updated successfully!");
      await refetchProfile();
    } catch (err) {
      console.error("Save profile error:", err);
      toast.error("Failed to save changes. " + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-10">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          Profile Settings <User className="text-slate-400 w-6 h-6 animate-pulse" />
        </h2>
        <p className="text-sm text-slate-400">Configure your professional details and preferred roles for custom evaluation.</p>
      </div>

      <form onSubmit={handleSave} className="glass border border-white/5 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Section: Personal */}
          <div className="col-span-1 sm:col-span-2 border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personal Information</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-name">Full Name *</Label>
            <Input id="prof-name" name="full_name" value={form.full_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-phone">Contact Number</Label>
            <Input id="prof-phone" name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-dob">Date of Birth</Label>
            <Input id="prof-dob" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-gender">Gender</Label>
            <Select id="prof-gender" name="gender" value={form.gender} onChange={handleChange}>
              <option value="Male" className="bg-[#0b0c16]">Male</option>
              <option value="Female" className="bg-[#0b0c16]">Female</option>
              <option value="Non-binary" className="bg-[#0b0c16]">Non-binary</option>
              <option value="Prefer not to say" className="bg-[#0b0c16]">Prefer not to say</option>
            </Select>
          </div>

          {/* Section: Academic */}
          <div className="col-span-1 sm:col-span-2 border-b border-white/5 pb-2 pt-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Experience & Academic</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-status">Current Status</Label>
            <Select id="prof-status" name="current_status" value={form.current_status} onChange={handleChange}>
              <option value="Student" className="bg-[#0b0c16]">Student</option>
              <option value="Passed Out" className="bg-[#0b0c16]">Passed Out</option>
              <option value="Fresher" className="bg-[#0b0c16]">Fresher</option>
              <option value="Experienced" className="bg-[#0b0c16]">Experienced</option>
              <option value="Career Switcher" className="bg-[#0b0c16]">Career Switcher</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-exp">Experience level</Label>
            <Select id="prof-exp" name="experience_level" value={form.experience_level} onChange={handleChange}>
              <option value="0-1 years" className="bg-[#0b0c16]">0-1 years</option>
              <option value="1-3 years" className="bg-[#0b0c16]">1-3 years</option>
              <option value="3-5 years" className="bg-[#0b0c16]">3-5 years</option>
              <option value="5-10 years" className="bg-[#0b0c16]">5-10 years</option>
              <option value="10+ years" className="bg-[#0b0c16]">10+ years</option>
            </Select>
          </div>



          <div className="space-y-2">
            <Label htmlFor="prof-skills">Skills (comma separated) *</Label>
            <Input id="prof-skills" name="skills" value={form.skills} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-college">College / University</Label>
            <Input id="prof-college" name="college_name" value={form.college_name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-degree">Degree & Stream</Label>
            <Input id="prof-degree" name="degree" placeholder="e.g. B.Tech Computer Science" value={form.degree} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-6">
          <div className="text-xs text-slate-500">
            Last updated profile details cache automatically matches resume variables.
          </div>

          <Button type="submit" disabled={saving} className="h-11 px-6">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
export { Profile };

