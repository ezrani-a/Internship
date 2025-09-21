import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsService } from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [searchQuery, jobs]);

  const fetchJobs = async () => {
    try {
      const response = await jobsService.getJobs({ limit: 6 });
      if (response.success) {
        setJobs(response.data);
        setFilteredJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Dream Job Today</h1>
          <p>Discover thousands of job opportunities from top companies worldwide</p>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for jobs, companies, or locations..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <Link to="/jobs" className="btn btn-primary search-btn">
              Search Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="featured-jobs">
        <div className="container">
          <h2>Featured Jobs</h2>
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-company">{job.company}</span>
                </div>
                <div className="job-details">
                  <p className="job-location">📍 {job.location}</p>
                  <p className="job-type">{job.type}</p>
                  <p className="job-salary">💰 {job.salary}</p>
                </div>
                <div className="job-description">
                  <p>{job.description.substring(0, 150)}...</p>
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
              <p>No jobs found matching your search.</p>
            </div>
          )}
          
          <div className="text-center mt-20">
            <Link to="/jobs" className="btn btn-secondary">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>1000+</h3>
              <p>Active Jobs</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Companies</p>
            </div>
            <div className="stat-item">
              <h3>10,000+</h3>
              <p>Job Seekers</p>
            </div>
            <div className="stat-item">
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
