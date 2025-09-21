import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/api';

const CreateJob = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: 'Debo Engineering',
    description: '',
    requirements: [],
    responsibilities: [],
    skills: [],
    benefits: [],
    location: '',
    type: 'full-time',
    salary: '',
    experienceLevel: 'beginner',
    applicationDeadline: '',
    category: 'development',
    isActive: true,
    maxApplicants: '',
    education: '',
    workExperience: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'early-beginner', label: 'Early Beginner' },
    { value: 'junior', label: 'Junior Developer' },
    { value: 'mid-level', label: 'Mid-Level Developer' },
    { value: 'senior', label: 'Senior Developer' },
    { value: 'tech-lead', label: 'Tech Lead' },
    { value: 'expert', label: 'Expert Developer' },
    { value: 'master', label: 'Master Developer' }
  ];

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'unpaid-internship', label: 'Unpaid Internship' }
  ];

  const categories = [
    { value: 'development', label: 'Software Development' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'devops', label: 'DevOps' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'web', label: 'Web Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'frontend', label: 'Frontend Development' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await jobsService.createJob(formData);
      if (response.success) {
        setMessage('Job posted successfully!');
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create job posting');
      }
    } catch (error) {
      setError('Error creating job posting');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="error-page">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="create-job-page">
      <div className="container">
        <div className="page-header">
          <h1>Create New Job Posting</h1>
          <p>Post a new job vacancy for applicants to apply</p>
        </div>

        <div className="create-job-form">
          <div className="card">
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

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Senior React Developer"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Job Type *</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      {jobTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="experienceLevel">Experience Level *</label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      required
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Remote, Addis Ababa, Ethiopia"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="salary">Salary Range</label>
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="e.g., $50,000 - $70,000 or Negotiable"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="applicationDeadline">Application Deadline</label>
                    <input
                      type="datetime-local"
                      id="applicationDeadline"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="maxApplicants">Max Applicants (Optional)</label>
                    <input
                      type="number"
                      id="maxApplicants"
                      name="maxApplicants"
                      value={formData.maxApplicants}
                      onChange={handleChange}
                      min="1"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Job Description</h3>
                <div className="form-group">
                  <label htmlFor="description">Job Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Provide a detailed description of the role, responsibilities, and what the candidate will be working on..."
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Requirements & Qualifications</h3>
                
                <div className="form-group">
                  <label htmlFor="education">Education Requirements</label>
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., Bachelor's degree in Computer Science or related field"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="workExperience">Work Experience Requirements</label>
                  <textarea
                    id="workExperience"
                    name="workExperience"
                    value={formData.workExperience}
                    onChange={handleChange}
                    rows="3"
                    placeholder="e.g., 2+ years of professional development experience"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">Additional Requirements</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements.join('\n')}
                    onChange={(e) => handleArrayChange('requirements', e.target.value)}
                    rows="4"
                    placeholder="List each requirement on a new line&#10;e.g.,&#10;Strong problem-solving skills&#10;Experience with version control&#10;Good communication skills"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Responsibilities</h3>
                <div className="form-group">
                  <label htmlFor="responsibilities">Key Responsibilities</label>
                  <textarea
                    id="responsibilities"
                    name="responsibilities"
                    value={formData.responsibilities.join('\n')}
                    onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
                    rows="4"
                    placeholder="List each responsibility on a new line&#10;e.g.,&#10;Develop and maintain web applications&#10;Collaborate with cross-functional teams&#10;Write clean, maintainable code"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Skills & Benefits</h3>
                
                <div className="form-group">
                  <label htmlFor="skills">Required Skills</label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={(e) => {
                      const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
                      setFormData(prev => ({ ...prev, skills }));
                    }}
                    placeholder="JavaScript, React, Node.js, Python, etc."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="benefits">Benefits & Perks</label>
                  <textarea
                    id="benefits"
                    name="benefits"
                    value={formData.benefits.join('\n')}
                    onChange={(e) => handleArrayChange('benefits', e.target.value)}
                    rows="3"
                    placeholder="List each benefit on a new line&#10;e.g.,&#10;Health insurance&#10;Flexible working hours&#10;Professional development opportunities"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="additionalInfo">Additional Information</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any additional information about the position, company culture, or application process..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating Job...' : 'Create Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
