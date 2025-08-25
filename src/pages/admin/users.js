import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  FiSearch, 
  FiUsers, 
  FiEye, 
  FiEdit,
  FiTrash2,
  FiShield,
  FiUser,
  FiCalendar,
  FiShoppingBag
} from 'react-icons/fi';
import Layout from '../../components/Layout';
// API functions for admin user management
const getUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.role) queryParams.append('role', params.role);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const response = await fetch(`/api/admin/users?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

const getUserOrders = async (userId) => {
  const response = await fetch(`/api/orders?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user orders');
  return response.json();
};

const AdminUsers = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState(null);
  
  // FIXED: Add user statistics state
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      // Check if user is admin by email (bypass role check)
      const isAdminEmail = session.user.email === 'amirabdullah2508@gmail.com';
      const isAdminRole = session.user.role === 'ADMIN';
      
      if (!isAdminEmail && !isAdminRole) {
        router.push('/');
        return;
      }
      
      setUser(session.user);
      loadUsers();
    }
  }, [session, status, router]);

  useEffect(() => {
    let isMounted = true;
    
    if (user) { // Only filter if user is loaded
      filterUsers().then(() => {
        if (!isMounted) return;
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [debouncedSearchQuery, roleFilter, user]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading users...');
      
      const response = await getUsers({
        search: debouncedSearchQuery,
        role: roleFilter,
        page: 1,
        limit: 50
      });
      
      console.log('Users response:', response);
      const usersList = response.users || [];
      setUsers(usersList);
      setFilteredUsers(usersList);
      
      // FIXED: Update user statistics from API response
      if (response.stats) {
        setUserStats(response.stats);
        console.log('📊 User stats updated:', response.stats);
      }
      
      console.log('Users loaded:', usersList.length);
      
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = async () => {
    try {
      console.log('Filtering users with:', { debouncedSearchQuery, roleFilter });
      
      const response = await getUsers({
        search: debouncedSearchQuery,
        role: roleFilter,
        page: 1,
        limit: 50
      });
      
      const filteredList = response.users || [];
      setFilteredUsers(filteredList);
      
      // FIXED: Update stats even when filtering
      if (response.stats) {
        setUserStats(response.stats);
      }
      
      console.log('Filtered users:', filteredList.length);
      
    } catch (error) {
      console.error('Error filtering users:', error);
      setFilteredUsers([]);
    }
  };

  const openUserModal = async (userData) => {
    setSelectedUser(userData);
    setShowUserModal(true);
    
    if (userData.orders > 0) {
      setLoadingOrders(true);
      try {
        const response = await getUserOrders(userData.id);
        setUserOrders(response.orders || []);
      } catch (error) {
        console.error('Error loading user orders:', error);
        setUserOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    } else {
      setUserOrders([]);
    }
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
    setShowUserModal(false);
  };

  const handleEditUser = (userData) => {
    // For now, just show an alert. In a real app, this would open an edit modal
    alert(`Edit functionality for user: ${userData.name}\nThis would open an edit form in a real application.`);
  };

  const handleDeleteUser = async (userData) => {
    if (window.confirm(`Are you sure you want to delete user: ${userData.name}?`)) {
      try {
        // In a real app, this would call an API to delete the user
        alert(`User ${userData.name} would be deleted in a real application.`);
        // Reload users after deletion
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return FiShield;
      case 'user':
        return FiUser;
      default:
        return FiUser;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const roleOptions = ['All', 'user', 'admin'];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Manage Users - Admin" description="View and manage user accounts">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl font-bold mb-4">Manage Users</h1>
              <p className="text-blue-100 text-xl">
                View and manage user accounts and their activity
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={loadUsers}
                    className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* FIXED: Stats Cards - Now using real database counts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userStats.totalUsers}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                  <FiUsers size={24} className="text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Admin Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userStats.adminUsers}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <FiShield size={24} className="text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userStats.activeUsers}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <FiShoppingBag size={24} className="text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role === 'All' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Join Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredUsers.map((userData) => {
                      const RoleIcon = getRoleIcon(userData.role);
                      return (
                        <motion.tr
                          key={userData.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {userData.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{userData.name}</div>
                                <div className="text-sm text-gray-500">{userData.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <RoleIcon size={16} className="text-gray-600" />
                              <span className={`px-2 py-1 text-sm rounded-full ${getRoleColor(userData.role)}`}>
                                {userData.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {new Date(userData.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${
                              userData.orders > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {userData.orders}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openUserModal(userData)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditUser(userData)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <FiEdit size={16} />
                              </motion.button>
                              {userData.role !== 'admin' && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteUser(userData)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <FiTrash2 size={16} />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiUsers size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* User Details Modal */}
        <AnimatePresence>
          {showUserModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                        <p className="text-gray-600">{selectedUser.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeUserModal}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FiEye size={20} />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">User ID:</span>
                          <span className="font-medium">#{selectedUser.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Role:</span>
                          <span className={`px-2 py-1 text-sm rounded-full ${getRoleColor(selectedUser.role)}`}>
                            {selectedUser.role}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Join Date:</span>
                          <span className="font-medium">
                            {new Date(selectedUser.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Orders:</span>
                          <span className="font-medium text-green-600">{selectedUser.orders}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="text-blue-600" />
                            <span className="font-medium text-blue-900">Member Since</span>
                          </div>
                          <p className="text-blue-700 mt-1">
                            {Math.floor((new Date() - new Date(selectedUser.joinDate)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FiShoppingBag className="text-green-600" />
                            <span className="font-medium text-green-900">Order History</span>
                          </div>
                          <p className="text-green-700 mt-1">
                            {selectedUser.orders} total orders
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order History */}
                  {selectedUser.orders > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                      {loadingOrders ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-gray-600">Loading orders...</p>
                        </div>
                      ) : userOrders.length > 0 ? (
                        <div className="space-y-4">
                          {userOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Order #{order.id}</div>
                                <div className="text-sm text-gray-600">{order.date}</div>
                                <div className="text-sm text-gray-600">{order.items.length} items</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{formatPrice(order.total)}</div>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4">No orders found</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default AdminUsers;


                      
