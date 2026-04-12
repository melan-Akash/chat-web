import React, { useState, useContext } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const SlideBar = () => {
  const navigate = useNavigate();
  const { users, selectedUser, setSelectedUser, isUsersLoading, logout, onlineUsers } = useContext(AppContext);
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);


  const filteredUsers = showOnlyOnline
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return (
    <div className="flex items-center justify-center h-full bg-[#8185B2]/10 p-5 rounded-r-xl">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt="" className='max-w-40' />
          <div className='relative py-2 group'>
            <img src={assets.menu_icon} alt="" className='max-h-5 cursor-pointer hover:scale-110 transition-transform' />
            <div className='absolute top-full right-0 z-20 w-32 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block shadow-xl'>
              <p onClick={() => navigate('/status')} className='cursor-pointer text-sm hover:text-green-400 transition-colors pb-2'>Status</p>
              <hr className='mb-2 border-t border-gray-500' />
              <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm hover:text-violet-400 transition-colors'>Edit Profile</p>
              <hr className='my-2 border-t border-gray-500' />
              <p onClick={logout} className='cursor-pointer text-sm hover:text-red-400 transition-colors'>LogOut</p>
            </div>
          </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="" className='w-3' />
          <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search Users' />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyOnline}
              onChange={(e) => setShowOnlyOnline(e.target.checked)}
              className="accent-violet-500"
            />
            <span className="text-xs text-gray-400">Show online only</span>
          </label>
          <span className="text-xs text-gray-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">No online users</div>
        )}
        {filteredUsers.map((user) => (
          <div onClick={() => setSelectedUser(user)}
            key={user._id} className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-[#282142]/30 ${selectedUser?._id === user._id ? 'bg-[#282142] shadow-lg border border-gray-600' : ''}`}>
            <div className="relative">
              <img src={user.profilePic || assets.avatar_icon} alt={user.fullName}
                className='w-11 h-11 rounded-full object-cover border-2 border-transparent' />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e1e2e] rounded-full"></span>
              )}
            </div>
            <div className='flex flex-col leading-tight overflow-hidden'>
              <p className="font-medium truncate">{user.fullName}</p>
              <span className={`text-xs ${onlineUsers.includes(user._id) ? 'text-green-400' : 'text-gray-500'}`}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SlideBar

