import { createContext, useContext, useState, useEffect } from 'react';
import { fetchNews } from '../services/newsApi';

const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    author: '',
    dateFrom: '',
    dateTo: '',
    type: 'all',
    searchQuery: '',
  });

  const [payoutRates, setPayoutRates] = useState(() => {
    const stored = localStorage.getItem('payoutRates');
    return stored ? JSON.parse(stored) : { news: 10, blog: 15 };
  });

  useEffect(() => {
    loadNews();
  }, [filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNews(filters);
      setNews(data);
      setError(null);
    } catch (err) {
      setError('Failed saurabh error hai to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutRate = (type, rate) => {
    const newRates = { ...payoutRates, [type]: rate };
    setPayoutRates(newRates);
    localStorage.setItem('payoutRates', JSON.stringify(newRates));
  };

  return (
    <NewsContext.Provider
      value={{
        news,
        loading,
        error,
        filters,
        setFilters,
        payoutRates,
        updatePayoutRate,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => {
  return useContext(NewsContext);
};