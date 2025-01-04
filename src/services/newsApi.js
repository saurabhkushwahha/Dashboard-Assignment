import axios from 'axios';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

export const fetchNews = async (filters) => {
  try {
    const { searchQuery, dateFrom, dateTo } = filters;
    const params = {
      apiKey: API_KEY,
      q: searchQuery || 'technology', // default search term
      from: dateFrom,
      to: dateTo,
      language: 'en',
    };

    const response = await axios.get(`${BASE_URL}/everything`, { params });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};