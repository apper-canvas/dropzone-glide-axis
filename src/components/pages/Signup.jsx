import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@/layouts/Root';

function Signup() {
  const { isInitialized } = useAuth();
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isInitialized && user) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get('redirect');
      navigate(redirectPath ? redirectPath : "/");
    }
  }, [isInitialized, user, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-surface-800 rounded-lg shadow-md">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="w-14 h-14 shrink-0 rounded-xl flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-2xl 2xl:text-3xl font-bold">
            D
          </div>
          <div className="flex flex-col gap-1 items-center justify-center">
            <div className="text-center text-lg xl:text-xl font-bold">
              Create Account
            </div>
            <div className="text-center text-sm text-gray-500">
              Please create an account to continue
            </div>
          </div>
        </div>
        <div id="authentication" />
      </div>
    </div>
  );
}

export default Signup;