import apiClient from '../api/axiosConfig.js';

export async function getKnowledgeArticles() {
  const response = await apiClient.get('/diabetes-knowledge');
  return response.data || [];
}

export async function getKnowledgeDisclaimer() {
  const response = await apiClient.get('/diabetes-knowledge/disclaimer');
  return response.data?.disclaimer || response.data;
}

export async function getLocalFoodGuides() {
  const response = await apiClient.get('/local-food-guides');
  return response.data || [];
}

export async function getLocalFoodGuidanceNote() {
  const response = await apiClient.get('/local-food-guides/guidance-note');
  return response.data?.guidanceNote || response.data?.message || response.data;
}
