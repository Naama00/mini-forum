import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { getToken } from '../../utils/storage';
import AIWorkspace from './AIWorkspace';
import { Loading } from '../common/Loading';

const API_BASE = 'http://localhost:5000';

/**
 * Container component for AIWorkspace
 * Handles data fetching, user context, and navigation
 */
export default function AIWorkspaceContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('AIWorkspaceContainer mounted:', { user, hasToken: !!getToken() });

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/categories`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle adding a new topic
  const handleAddTopic = (topicData, firstPostContent) => {
    const token = getToken();
    if (!token) {
      alert('אתה חייב להיות מחובר כדי ליצור דיון');
      return Promise.reject(new Error('No authentication token'));
    }
    
    console.log('Creating topic with data:', topicData);
    
    return fetch(`${API_BASE}/api/topics`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: topicData.title,
        content: firstPostContent,
        categoryId: topicData.categoryId,
        tags: topicData.tags || [],
        type: topicData.type || 'question'
      })
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json().then(data => ({ status: res.status, data }));
      })
      .then(({ status, data }) => {
        console.log('Response data:', data);
        if (status === 201 || status === 200 || data.success) {
          return data.data?._id || data.data?.id || data._id || data.id;
        }
        throw new Error(data.message || data.error || 'Failed to create topic');
      })
      .catch(error => {
        console.error('Error creating topic:', error);
        alert('שגיאה ביצירת דיון: ' + error.message);
        return null;
      });
  };

  // Handle adding a new article
  const handleAddArticle = (articleData) => {
    const token = getToken();
    if (!token) {
      alert('אתה חייב להיות מחובר כדי ליצור מאמר');
      return Promise.reject(new Error('No authentication token'));
    }
    
    console.log('Creating article with data:', articleData);
    
    return fetch(`${API_BASE}/api/articles`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary || '',
        image: articleData.image || '',
        tags: articleData.tags || []
      })
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json().then(data => ({ status: res.status, data }));
      })
      .then(({ status, data }) => {
        console.log('Response data:', data);
        if (status === 201 || status === 200 || data.success) {
          return data.data?._id || data.data?.id || data._id || data.id;
        }
        throw new Error(data.message || data.error || 'Failed to create article');
      })
      .catch(error => {
        console.error('Error creating article:', error);
        alert('שגיאה ביצירת מאמר: ' + error.message);
        return null;
      });
  };

  // Handle navigation
  const handleNavigate = (view, filterId) => {
    if (view === 'category') {
      navigate(`/category?categoryId=${filterId}`);
    } else if (view === 'articles') {
      navigate('/articles');
    } else if (view === 'home') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AIWorkspace
      currentUser={user || {}}
      categories={categories}
      onAddTopic={handleAddTopic}
      onAddArticle={handleAddArticle}
      onNavigate={handleNavigate}
    />
  );
}
