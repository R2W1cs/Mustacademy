import { useCallback, useState } from 'react';
import api from '../api/axios';

export function useCreatorCornerData(activeView) {
  const [projects, setProjects] = useState([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [myRequests, setMyRequests] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeView === 'browse') {
        const res = await api.get('/projects?page=1&limit=12');
        setProjects(res.data.projects || res.data);
        setProjectsPage(1);
        setProjectsTotalPages(res.data.totalPages || 1);
      } else if (activeView === 'manage') {
        const res = await api.get('/projects/requests');
        setMyRequests(res.data);
      } else {
        const res = await api.get('/projects/my-projects');
        setMyTeams(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch Creator Corner data', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeView]);

  return {
    projects, setProjects,
    projectsPage, setProjectsPage,
    projectsTotalPages, setProjectsTotalPages,
    myRequests, setMyRequests,
    myTeams, setMyTeams,
    isLoading, setIsLoading,
    fetchData,
  };
}