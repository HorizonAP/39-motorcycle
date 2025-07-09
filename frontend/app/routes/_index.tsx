import { useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { getAuthToken } from '~/utils/auth';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null;
}
