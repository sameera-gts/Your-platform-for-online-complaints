import {useState,useEffect} from "react"
import axiosInstance from "../../api/AxiosInstance"
import {MessageModal} from "./MessageModel"
import {AddUserForm} from "./AddUser"
import {ConfirmationModal} from "./ConformMessage"
export const  UserManagementTable=() =>{
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user,setUser]=useState('');
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/api/users');
      if (response.status!==200) {
        throw new Error('Failed to fetch users');
      }
      const data = response.data;
      setUsers(data);
    } catch (err) {
      setError(err.message);
      setMessageModalContent({
        title: 'Error',
        message: `Failed to load users: ${err.message}. Please ensure the backend is running.`
      });
      setShowMessageModal(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser =async (userId) => {
    try{
        const response=await axiosInstance.get(`/api/users/${userId}`);
        setUser(response.data);
        handleAddUserClick();
    }
    catch(error){
        throw new Error('Failed to get user');
    }
  };

  const handleDeleteUserClick = (userId) => {
    setUserToDeleteId(userId);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false);
    try {
      const response = await axiosInstance.delete(`/api/users/${userToDeleteId}`, {

      });
      if (response.status!==200) {
        throw new Error('Failed to delete user');
      }
      setUsers(users.filter(user => user._id !== userToDeleteId));
      setMessageModalContent({
        title: 'User Deleted',
        message: `User ${userToDeleteId} has been deleted.`,
      });
      setShowMessageModal(true);
    } catch (err) {
      setMessageModalContent({
        title: 'Error',
        message: `Failed to delete user: ${err.message}`
      });
      setShowMessageModal(true);
    } finally {
      setUserToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDeleteModal(false);
    setUserToDeleteId(null);
  };

  const handleAddUserClick = () => {
    setShowAddUserModal(true);
  };

  const handleCloseAddUserModal = () => {
    setShowAddUserModal(false);
    fetchUsers(); 
  };

  const handleAddUserSubmit = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  return (
    <div className="container mx-auto max-w-6xl bg-white p-2 rounded-lg shadow-sm border border-gray-200">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6 text-center">User Management</h1>

      <div className="mt-6 text-right mb-4">
        <button
          onClick={handleAddUserClick}
          className="bg-[#007FFF] hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors duration-200 shadow-lg"
        >
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-gradient-to-r bg-[#007FFF] text-white">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">Name</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Gender</th>
              <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Age</th>
              <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-200">
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600 font-medium">{user.role}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600">{user.gender || 'N/A'}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600">{user.age || 'N/A'}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    
                    <button
                      onClick={() => handleDeleteUserClick(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-md text-xs transition-colors duration-200 shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddUserModal && (
        <AddUserForm onAddUser={handleAddUserSubmit} onClose={handleCloseAddUserModal} user={user}/>
      )}

      <ConfirmationModal
        show={showConfirmDeleteModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete user with ID: ${userToDeleteId}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <MessageModal
        show={showMessageModal}
        title={messageModalContent.title}
        message={messageModalContent.message}
        onClose={() => setShowMessageModal(false)}
      />
    </div>
  );
}