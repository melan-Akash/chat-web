import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { Camera, Loader2, User, Mail, Info, ArrowLeft, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useContext(AppContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(authUser?.phoneNumber || "");
  const navigate = useNavigate();


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      bio,
      phoneNumber,
      profilePic: selectedImg || undefined
    });
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4 backdrop-blur-sm'>
      <div className='w-full max-w-4xl bg-[#1e1e2e]/80 backdrop-blur-xl text-gray-300 border border-gray-700 flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden shadow-2xl'>
        {/* Left Side - Profile Form */}
        <div className='flex-1 p-8 md:p-12'>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-3xl font-bold text-white'>Profile Settings</h1>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            {/* Avatar Upload */}
            <div className='flex flex-col items-center gap-4 mb-4'>
              <div className="relative group">
                <img
                  src={selectedImg || authUser.profilePic || assets.avatar_icon}
                  alt="Profile"
                  className='w-32 h-32 rounded-full object-cover border-4 border-violet-500/30'
                />
                <label
                  htmlFor='avatar'
                  className={`absolute bottom-0 right-0 p-2 bg-violet-600 rounded-full cursor-pointer hover:bg-violet-500 transition-all shadow-lg ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}`}
                >
                  <Camera size={20} className="text-white" />
                  <input onChange={handleImageUpload} type="file" id='avatar' accept='image/*' hidden disabled={isUpdatingProfile} />
                </label>
              </div>
              <p className="text-sm text-gray-400">
                {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
              </p>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <User size={16} />
                  Full Name
                </div>
                <input
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  type="text"
                  required
                  placeholder='Your Name'
                  className='w-full p-3 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-white'
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </div>
                <input
                  value={authUser?.email}
                  disabled
                  className='w-full p-3 bg-black/40 border border-gray-800 rounded-xl text-gray-500 cursor-not-allowed'
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Phone size={16} />
                  Phone Number
                </div>
                <input
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber}
                  type="text"
                  placeholder='Your Phone Number'
                  className='w-full p-3 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-white'
                />
              </div>

              <div className="space-y-1.5">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Info size={16} />
                  Bio
                </div>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder='Write something about yourself...'
                  required
                  className='w-full p-3 bg-black/20 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-white resize-none'
                  rows={3}
                ></textarea>
              </div>
            </div>

            <button
              type='submit'
              disabled={isUpdatingProfile}
              className='w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex justify-center items-center gap-2'
            >
              {isUpdatingProfile ? <Loader2 className="animate-spin" size={24} /> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Right Side - Account Info / Brand */}
        <div className='hidden md:flex flex-col justify-center items-center p-12 bg-black/20 border-l border-gray-700 text-center gap-6'>
          <div className="w-24 h-24 bg-violet-500/10 rounded-3xl flex items-center justify-center">
            <img className='w-16 h-16 opacity-80' src={assets.logo_icon} alt="App Logo" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Account Information</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800 gap-8">
                <span className="text-sm text-gray-400">Member Since</span>
                <span className="text-sm text-white">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800 gap-8">
                <span className="text-sm text-gray-400">Account Status</span>
                <span className="text-sm text-green-500">Active</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-[200px]">Your personal information is secure and will only be visible to people you chat with.</p>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

