import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authFetch from '../../services/api';
import AIWorkspace from './AIWorkspace';
import { Loading } from '../common/Loading';

/**
 * Container component for AIWorkspace
 * Handles data fetching, user context, and navigation
 */
export default function AIWorkspaceContainer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();


  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await authFetch.get('/categories');
      if (!response.success) {
        throw new Error(response.message || 'Failed to load categories');
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2,
  });

  const topicMutation = useMutation({
    mutationFn: async ({ title, content, categoryId, tags, type }) => {
      const response = await authFetch.post('/topics', {
        title,
        content,
        categoryId,
        tags,
        type,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to create topic');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['topics']);
      queryClient.invalidateQueries(['categories']);
    },
  });

 const articleMutation = useMutation({
  mutationFn: async ({ title, content, summary, image, tags, categoryId, imageUrl }) => {  
    const response = await authFetch.post('/articles', {
      title,
      content,
      summary,
      image,
      tags,
      categoryId,
      imageUrl,  
    });
      if (!response.success) {
        throw new Error(response.message || 'Failed to create article');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['articles']);
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    console.error('Failed to load AIWorkspace categories:', error);
  }

  // Handle adding a new topic
  const handleAddTopic = async (topicData, firstPostContent) => {
    const content = topicData.content || firstPostContent;
    try {
      const topic = await topicMutation.mutateAsync({
        title: topicData.title,
        content,
        categoryId: topicData.categoryId,
        tags: topicData.tags || [],
        type: topicData.type || 'question',
      });
      return topic?._id || topic?.id || null;
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('שגיאה ביצירת דיון: ' + err.message);
      return null;
    }
  };

  // Handle adding a new article
  const handleAddArticle = async (articleData) => {
    try {
      const article = await articleMutation.mutateAsync({
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary || '',
        image: articleData.imageUrl || '',
        tags: articleData.tags || [],
        categoryId: articleData.categoryId || '',
      });
      return article?._id || article?.id || null;
    } catch (err) {
      console.error('Error creating article:', err);
      alert('שגיאה ביצירת מאמר: ' + err.message);
      return null;
    }
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

  if (isLoading) {
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
