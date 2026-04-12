import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { LogOut, Image as ImageIcon, Info } from 'lucide-react'

const RightSlideBar = () => {
  const navigate = useNavigate();
  const { selectedUser, messages, logout, onlineUsers } = useContext(AppContext);

  const mediaMessages = messages.filter(msg => msg.image).map(msg => msg.image);


  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-auto flex flex-col border-l border-gray-700 ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Profile Header */}
      <div className='pt-12 pb-8 flex flex-col items-center gap-4 px-6 text-center shrink-0'>
        <div className="relative">
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt={selectedUser.fullName}
            className='w-24 h-24 rounded-full object-cover border-4 border-violet-500/20' />
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#1e1e2e] rounded-full"></span>
          )}
        </div>
        <div>
          <h1 className='text-xl font-bold text-white flex items-center justify-center gap-2'>
            {selectedUser.fullName}
          </h1>
          <p className={`text-xs mt-1 ${onlineUsers.includes(selectedUser._id) ? 'text-green-400' : 'text-gray-400'}`}>
            {onlineUsers.includes(selectedUser._id) ? 'Online' : 'Offline'}
          </p>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 w-full text-left border border-gray-700/50">
          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
            <Info size={10} /> Bio
          </div>
          <p className='text-sm text-gray-200 line-clamp-3'>{selectedUser.bio || "No bio yet."}</p>
        </div>
      </div>

      <hr className='border-gray-700 mx-6' />

      {/* Media Section */}
      <div className='p-6 flex-1 overflow-y-auto'>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ImageIcon size={16} className="text-violet-400" /> Shared Media
          </h3>
          <span className="text-xs text-gray-500">{mediaMessages.length} items</span>
        </div>

        {mediaMessages.length > 0 ? (
          <div className='grid grid-cols-3 gap-2'>
            {mediaMessages.map((url, index) => (
              <div key={index} onClick={() => window.open(url)}
                className='aspect-square cursor-pointer rounded-lg overflow-hidden border border-gray-700 hover:border-violet-500 transition-colors'>
                <img src={url} alt="" className='w-full h-full object-cover hover:scale-110 transition-transform' />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
            <ImageIcon size={32} className="opacity-20" />
            <p className="text-xs">No media shared yet</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="p-6 mt-auto">
        <button
          onClick={logout}
          className='w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium py-3 rounded-xl transition-all active:scale-[0.98]'
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default RightSlideBar

