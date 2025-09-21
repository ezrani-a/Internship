import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/api';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    salary: '',
    category: '',
    experienceLevel: '',
    company: ''
  });
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, filters]);

  const fetchJobs = async () => {
    try {
      const response = await jobsService.getJobs();
      if (response.success) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(job =>
        job.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(job =>
        job.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(job =>
        job.experienceLevel?.toLowerCase() === filters.experienceLevel.toLowerCase()
      );
    }

    // Company filter
    if (filters.company) {
      filtered = filtered.filter(job =>
        job.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      type: '',
      salary: '',
      category: '',
      experienceLevel: '',
      company: ''
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="container">
        <div className="jobs-header">
          <h1>Find Your Next Job</h1>
          <p>Discover opportunities that match your skills and interests</p>
        </div>

        <div className="jobs-filters">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="filters-section">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="development">Software Development</option>
              <option value="design">UI/UX Design</option>
              <option value="data-science">Data Science</option>
              <option value="devops">DevOps</option>
              <option value="mobile">Mobile Development</option>
              <option value="web">Web Development</option>
              <option value="backend">Backend Development</option>
              <option value="frontend">Frontend Development</option>
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Paid Internship</option>
              <option value="unpaid-internship">Unpaid Internship</option>
            </select>

            <select
              name="experienceLevel"
              value={filters.experienceLevel}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="early-beginner">Early Beginner</option>
              <option value="junior">Junior Developer</option>
              <option value="mid-level">Mid-Level Developer</option>
              <option value="senior">Senior Developer</option>
              <option value="tech-lead">Tech Lead</option>
              <option value="expert">Expert Developer</option>
              <option value="master">Master Developer</option>
            </select>

            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="addis ababa">Addis Ababa</option>
              <option value="ethiopia">Ethiopia</option>
              <option value="africa">Africa</option>
            </select>

            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="results-info">
          <p>
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="job-company">{job.company}</span>
              </div>
              
              <div className="job-details">
                <p className="job-location">📍 {job.location}</p>
                <p className="job-type">⏰ {job.type}</p>
                <p className="job-salary">💰 {job.salary}</p>
                <p className="job-posted">📅 Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="job-description">
                <p>{job.description.substring(0, 200)}...</p>
              </div>
              
              <div className="job-skills">
                {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {job.skills && job.skills.length > 3 && (
                  <span className="skill-tag">+{job.skills.length - 3} more</span>
                )}
              </div>
              
              <div className="job-footer">
                <Link to={`/jobs/${job.id}`} className="btn btn-primary">
                  View Details
                </Link>
                {user && (
                  <Link to={`/jobs/${job.id}`} className="btn btn-success">
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="no-jobs">
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
