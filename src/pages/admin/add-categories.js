import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const AddCategories = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (status === 'authenticated' && session) {
    const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
    const isAdminRole = session.user.role === 'ADMIN';

    if (!isAdminEmail && !isAdminRole) {
      router.push('/');
      return null;
    }
  }

  const addCategories = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/add-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}. Total categories: ${data.total.length}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Add Default Categories
            </h1>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This will add the following default categories to your database:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Football</li>
                <li>Basketball</li>
                <li>Cricket</li>
                <li>Badminton</li>
                <li>Running</li>
                <li>Baseball</li>
                <li>Soccer</li>
                <li>Volleyball</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={addCategories}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Adding Categories...' : 'Add Default Categories'}
              </button>

              <button
                onClick={() => router.push('/admin/products')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Products
              </button>
            </div>

            {message && (
              <div className="mt-4 p-4 rounded-lg bg-gray-100">
                <p className="text-sm">{message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddCategories;
