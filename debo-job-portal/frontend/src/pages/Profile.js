import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import ResumeUpload from '../components/ResumeUpload';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    resume: null,
    developerLevel: '',
    gadaClassification: '',
    internshipType: '',
    yearsOfExperience: 0,
    portfolio: '',
    github: '',
    linkedin: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfile(prev => ({
      ...prev,
      skills
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await profileService.uploadResume(file);
        if (response.success) {
          setProfile(prev => ({
            ...prev,
            resume: response.data.resume
          }));
          setMessage('Resume uploaded successfully!');
        }
      } catch (error) {
        setError('Error uploading resume');
      }
    }
  };

  const handleResumeUploadSuccess = (parsedData) => {
    setMessage('Resume uploaded and parsed successfully!');
    setShowResumeUpload(false);
    
    // Auto-populate form fields with parsed data
    if (parsedData.parsedFields) {
      const fields = parsedData.parsedFields;
      setProfile(prev => ({
        ...prev,
        firstName: fields.firstName || prev.firstName,
        lastName: fields.lastName || prev.lastName,
        email: fields.email || prev.email,
        phone: fields.phone || prev.phone,
        location: fields.location || prev.location,
        bio: fields.summary || prev.bio,
        skills: fields.skills || prev.skills,
        experience: fields.experience || prev.experience,
        education: fields.education || prev.education,
        yearsOfExperience: fields.yearsOfExperience || prev.yearsOfExperience
      }));
    }
  };

  const handleResumeUploadError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await profileService.updateProfile(profile);
      if (response.success) {
        setMessage('Profile updated successfully!');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-page">
        <h2>Please log in to view your profile</h2>
        <p>You need to be logged in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        <div className="profile-content">
          <div className="profile-form-section">
            <div className="card">
              <h2>Personal Information</h2>
              
              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Skills (comma-separated)</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={profile.skills.join(', ')}
                    onChange={handleSkillsChange}
                    placeholder="JavaScript, React, Node.js, Python..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="developerLevel">Developer Level</label>
                    <select
                      id="developerLevel"
                      name="developerLevel"
                      value={profile.developerLevel}
                      onChange={handleChange}
                    >
                      <option value="">Select your level</option>
                      <option value="beginner">Beginner</option>
                      <option value="early-beginner">Early Beginner</option>
                      <option value="junior">Junior Developer</option>
                      <option value="mid-level">Mid-Level Developer</option>
                      <option value="senior">Senior Developer</option>
                      <option value="tech-lead">Tech Lead</option>
                      <option value="expert">Expert Developer</option>
                      <option value="master">Master Developer</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="yearsOfExperience">Years of Experience</label>
                    <input
                      type="number"
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={profile.yearsOfExperience}
                      onChange={handleChange}
                      min="0"
                      max="20"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="internshipType">Preferred Internship Type</label>
                  <select
                    id="internshipType"
                    name="internshipType"
                    value={profile.internshipType}
                    onChange={handleChange}
                  >
                    <option value="">Select preference</option>
                    <option value="unpaid">Unpaid Internship</option>
                    <option value="paid">Paid Internship</option>
                    <option value="full-time">Full-time Employment</option>
                    <option value="any">Any Opportunity</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="github">GitHub Profile</label>
                    <input
                      type="url"
                      id="github"
                      name="github"
                      value={profile.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="linkedin">LinkedIn Profile</label>
                    <input
                      type="url"
                      id="linkedin"
                      name="linkedin"
                      value={profile.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="portfolio">Portfolio Website</label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    value={profile.portfolio}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experience">Experience</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your work experience..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="education">Education</label>
                  <textarea
                    id="education"
                    name="education"
                    value={profile.education}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Your educational background..."
                  />
                </div>

                <div className="form-group">
                  <label>Resume Upload</label>
                  <div className="resume-section">
                    {profile.resume && (
                      <div className="current-resume">
                        <p className="file-info">
                          <strong>Current resume:</strong> {profile.resume}
                        </p>
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => setShowResumeUpload(!showResumeUpload)}
                      className="btn btn-secondary"
                    >
                      {showResumeUpload ? 'Hide Upload' : 'Upload New Resume'}
                    </button>
                    
                    {showResumeUpload && (
                      <div className="resume-upload-section">
                        <ResumeUpload
                          onUploadSuccess={handleResumeUploadSuccess}
                          onUploadError={handleResumeUploadError}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>

          <div className="profile-sidebar">
            <div className="card">
              <h3>Profile Stats</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Applications</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Interviews</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Offers</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Account Information</h3>
              <div className="account-info">
                <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Account type:</strong> {user.role}</p>
                <p><strong>Status:</strong> Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
