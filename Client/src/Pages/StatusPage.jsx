import React, { useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import assets from '../assets/assets';
import { Plus, MoreVertical, Lock, ArrowLeft, X, Crop, Type, Smile, Download, Send, PenTool, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const StatusPage = () => {
    const { authUser, myStatuses, otherStatuses, getStatuses, uploadStatus, isStatusesLoading, viewStatus } = useContext(AppContext);
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [caption, setCaption] = useState("");
    const [activeStatus, setActiveStatus] = useState(null); // The status being currently viewed
    const [isUploadingState, setIsUploadingState] = useState(false); // To handle loading state of send
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);

    React.useEffect(() => {
        getStatuses();
    }, [getStatuses]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setIsUploading(true);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4 backdrop-blur-sm'>
            <div className='w-full max-w-6xl h-[92vh] bg-[#1e1e2e]/90 backdrop-blur-xl text-gray-300 border border-gray-700 flex rounded-3xl overflow-hidden shadow-2xl'>
                {/* Left Side - Status List */}
                <div className='w-full md:w-80 lg:w-96 bg-black/20 border-r border-gray-700 flex flex-col h-full'>
                    <div className='p-4 flex items-center justify-between border-b border-gray-700/50 bg-black/10 shrink-0'>
                        <div className='flex items-center gap-3'>
                            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeft size={20} className='text-gray-300' />
                            </button>
                            <h1 className='text-xl font-bold text-white'>Status</h1>
                        </div>
                        <div className='flex gap-2 text-gray-400'>
                            <button className='p-2 hover:bg-white/10 rounded-full transition-colors'><Plus size={20} /></button>
                            <button className='p-2 hover:bg-white/10 rounded-full transition-colors'><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    <div className='overflow-y-auto flex-1 p-3 scrollbar-thin scrollbar-thumb-gray-700'>
                        {/* My Status */}
                        <div
                            className='flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group'
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                            <div className='relative'>
                                <img src={myStatuses.length > 0 ? myStatuses[0].imageUrl : (authUser?.profilePic || assets.avatar_icon)} alt="My Status" className='w-12 h-12 rounded-full object-cover border-2 border-transparent group-hover:border-violet-500 transition-colors' />
                                <div className='absolute bottom-0 right-0 bg-violet-600 rounded-full p-0.5 border-2 border-[#1e1e2e]'>
                                    <Plus size={12} className='text-white' />
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <p className='font-semibold text-white'>My status</p>
                                <p className='text-xs text-gray-400'>Click to add status update</p>
                            </div>
                        </div>

                        <p className='text-sm text-gray-500 font-medium px-3 pt-6 pb-2'>Recent</p>

                        {isStatusesLoading ? (
                            <div className="flex items-center justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        ) : (
                            otherStatuses.filter(s => !s.viewers.includes(authUser._id)).map(status => (
                                <div key={status._id} className='flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors' onClick={() => { setActiveStatus(status); viewStatus(status._id); }}>
                                    <div className='w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-green-400 to-green-600'>
                                        <div className='w-full h-full rounded-full border-2 border-[#1e1e2e] overflow-hidden'>
                                            <img src={status.userId.profilePic || assets.avatar_icon} alt="Avatar" className='w-full h-full object-cover' />
                                        </div>
                                    </div>
                                    <div className='flex flex-col'>
                                        <p className='font-medium text-white'>{status.userId.fullName}</p>
                                        <p className='text-xs text-gray-400'>
                                            {new Date(status.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        <p className='text-sm text-gray-500 font-medium px-3 pt-6 pb-2'>Viewed</p>

                        {!isStatusesLoading && otherStatuses.filter(s => s.viewers.includes(authUser._id)).map(status => (
                            <div key={status._id} className='flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors' onClick={() => setActiveStatus(status)}>
                                <div className='w-12 h-12 rounded-full p-[2px] bg-gray-600'>
                                    <div className='w-full h-full rounded-full border-2 border-[#1e1e2e] overflow-hidden'>
                                        <img src={status.userId.profilePic || assets.avatar_icon} alt="Avatar" className='w-full h-full object-cover grayscale-[50%]' />
                                    </div>
                                </div>
                                <div className='flex flex-col'>
                                    <p className='font-medium text-gray-400'>{status.userId.fullName}</p>
                                    <p className='text-xs text-gray-500'>
                                        {new Date(status.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

                {/* Right Side - Empty State / Status View */}
                <div className='hidden md:flex flex-1 flex flex-col items-center justify-center p-8 bg-black/40 relative h-full'>
                    {activeStatus ? (
                        <div className="w-full h-full flex flex-col pt-4">
                            {/* Progress bar simulation */}
                            <div className="w-full flex gap-1 mb-4 z-10">
                                <div className="h-1 bg-white rounded-full flex-1"></div>
                            </div>

                            {/* Status Header */}
                            <div className="flex items-center gap-3 mb-4 z-10 w-full px-4">
                                <img src={activeStatus.userId.profilePic || assets.avatar_icon} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                                <div className="flex flex-col">
                                    <span className="text-white font-medium">{activeStatus.userId.fullName}</span>
                                    <span className="text-xs text-gray-400">{new Date(activeStatus.createdAt).toLocaleString()}</span>
                                </div>
                                <button onClick={() => setActiveStatus(null)} className="ml-auto text-gray-300 hover:text-white p-2">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Status Media */}
                            <div className="flex-1 flex items-center justify-center relative bg-black/40 rounded-xl overflow-hidden shadow-xl border border-gray-700 w-full object-contain p-4 mt-2">
                                <img src={activeStatus.imageUrl} alt="Status Media" className="max-h-full max-w-full object-contain rounded-lg shadow-lg relative z-0" />

                                {activeStatus.caption && (
                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                                        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white text-lg max-w-[80%] text-center border border-gray-700/50 shadow-2xl">
                                            {activeStatus.caption}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply bar */}
                            <div className="w-full mt-4 flex justify-center z-10">
                                <div className="w-full max-w-xl flex items-center bg-gray-800/80 rounded-full px-4 py-3 border border-gray-700 shadow-md">
                                    <Smile size={24} className="text-gray-400" />
                                    <input type="text" placeholder="Type a reply..." className="flex-1 bg-transparent border-none outline-none px-4 text-white text-sm" />
                                    <Send size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='flex flex-col items-center justify-center gap-6 max-w-sm text-center'>
                                {/* Status ring icon */}
                                <div className='w-32 h-32 rounded-full flex items-center justify-center mb-4 text-gray-400'>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-50">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 2a10 10 0 0 1 10 10"></path>
                                    </svg>
                                </div>
                                <h2 className='text-3xl font-light text-white'>Share status updates</h2>
                                <p className='text-sm text-gray-400 mt-2 leading-relaxed'>
                                    Share photos, videos and text that disappear after 24 hours.
                                </p>
                            </div>
                            <div className='absolute bottom-8 flex items-center gap-2 text-xs text-gray-500'>
                                <Lock size={12} />
                                <span>Your status updates are end-to-end encrypted</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Fullscreen Upload Overlay */}
            {isUploading && imagePreview && (
                <div className="fixed inset-0 z-50 bg-[#0b141a]/95 backdrop-blur-md flex flex-col">
                    {/* Top Header */}
                    <div className="flex items-center justify-between p-4 bg-transparent mt-2">
                        <button onClick={() => { setIsUploading(false); setImagePreview(null); setShowEmojiPicker(false); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-gray-400 hover:text-white transition-colors p-2">
                            <X size={26} />
                        </button>
                        <div className="flex items-center gap-7 text-gray-400">
                            <Crop size={22} className="hover:text-white cursor-pointer transition-colors" />
                            <Wand2 size={22} className="hover:text-white cursor-pointer transition-colors" />
                            <PenTool size={22} className="hover:text-white cursor-pointer transition-colors" />
                            <Type size={22} className="hover:text-white cursor-pointer transition-colors" />
                            <Smile size={22} className="hover:text-white cursor-pointer transition-colors" />
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors p-2 mr-2">
                            <Download size={26} />
                        </button>
                    </div>

                    {/* Center Image */}
                    <div className="flex-1 flex items-center justify-center p-8 min-h-0">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded-md shadow-2xl" />
                    </div>

                    {/* Bottom Section */}
                    <div className="flex flex-col items-center pb-6">
                        {/* Caption Input */}
                        <div className="relative w-full max-w-2xl mb-8">
                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-4 mb-2 z-50">
                                    <EmojiPicker
                                        theme="dark"
                                        onEmojiClick={(emojiObject) => {
                                            setCaption(prev => prev + emojiObject.emoji);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="w-full bg-[#202c33] rounded-3xl flex items-center px-4 py-3 shadow-lg">
                                <input
                                    type="text"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    placeholder="Add a caption"
                                    className="flex-1 bg-transparent border-none outline-none text-white text-base ml-2 placeholder-[#8696a0]"
                                />
                                <Smile 
                                    size={24} 
                                    className="text-[#8696a0] hover:text-white cursor-pointer transition-colors ml-4" 
                                    onClick={() => setShowEmojiPicker(prev => !prev)}
                                />
                            </div>
                        </div>

                        {/* Bottom Footer Controls */}
                        <div className="w-full relative flex items-center justify-center px-6">

                            <div className="absolute left-6 flex items-center gap-2 bg-[#202c33] border border-gray-700/50 rounded-full py-2 px-4 shadow-sm cursor-pointer hover:bg-white/5 transition-colors">
                                <div className="w-5 h-5 rounded-full border-2 border-[#00a884] flex items-center justify-center bg-transparent">
                                    <span className="text-white text-[10px] scale-75">✓</span>
                                </div>
                                <span className="text-sm text-[#00a884] font-medium">Status <span className="text-white">(1 Included)</span></span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl border-[3px] border-[#00a884] overflow-hidden p-0.5">
                                    <img src={imagePreview} className="w-full h-full object-cover rounded-lg" />
                                </div>
                                <button className="w-14 h-14 rounded-xl border border-gray-600 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <Plus size={26} className="text-gray-300" />
                                </button>
                            </div>

                            <button
                                className="absolute right-6 w-14 h-14 bg-[#00a884] hover:bg-[#00c99a] rounded-full flex items-center justify-center shadow-lg transition-colors active:scale-95 disabled:opacity-50"
                                disabled={isUploadingState}
                                onClick={async () => {
                                    setIsUploadingState(true);
                                    try {
                                        await uploadStatus(imagePreview, caption);
                                        toast.success("Status sent successfully!");
                                        setIsUploading(false);
                                        setImagePreview(null);
                                        setCaption("");
                                        setShowEmojiPicker(false);
                                    } catch (error) {
                                        // Error is handled in context
                                    } finally {
                                        setIsUploadingState(false);
                                    }
                                }}
                            >
                                {isUploadingState ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <Send size={24} className="text-white ml-1" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StatusPage
