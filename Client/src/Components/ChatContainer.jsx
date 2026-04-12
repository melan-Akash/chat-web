import React, { useEffect, useRef, useState, useContext } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { AppContext } from '../context/AppContext'
import { Image, Send, X, Loader2, Phone, Check, CheckCheck, Edit2, Trash2, Ban, Plus, Camera, FileText, MapPin, User, Receipt, Store, Zap, Smile } from 'lucide-react'
import toast from 'react-hot-toast'
import Picker from 'emoji-picker-react'

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, setSelectedUser, sendMessage, authUser, onlineUsers, markMessagesAsSeen, editMessage, deleteMessageForMe, deleteMessageForEveryone } = useContext(AppContext);
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteMenuId, setDeleteMenuId] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const scrollEnd = useRef();


  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (selectedUser && messages && messages.length > 0) {
      const unseenMessages = messages.filter(m => m.senderId === selectedUser._id && !m.isSeen);
      if (unseenMessages.length > 0) {
        markMessagesAsSeen(selectedUser._id);
      }
    }
  }, [messages, selectedUser, markMessagesAsSeen]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCallClick = () => {
    if (!selectedUser.phoneNumber) {
      toast.error(`${selectedUser.fullName} has not updated their phone number yet.`);
      return;
    }
    sendMessage({ text: `Call request to ${selectedUser.phoneNumber}`, isCallRequest: true });
    toast.success('Call request sent');
  }

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.loading("Fetching location...", { id: "location" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        sendMessage({ text: `📍 My Current Location: ${googleMapsLink}` });
        toast.success("Location sent!", { id: "location" });
        setShowAttachmentMenu(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to retrieve your location", { id: "location" });
      }
    );
  };

  const submitEdit = async (id) => {
    if (!editText.trim()) return;
    await editMessage(id, editText);
    setEditingMessageId(null);
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (isMessagesLoading) return (
    <div className='flex-1 flex flex-col items-center justify-center bg-black/20'>
      <Loader2 className="animate-spin text-white" size={40} />
      <p className="text-white mt-2">Loading messages...</p>
    </div>
  );

  return selectedUser ? (
    <div className='h-full relative backdrop-blur-lg flex flex-col border-l border-gray-700'>
      {/* Header */}
      <div className='flex items-center gap-3 px-4 border-b border-gray-700 py-3 shrink-0 bg-black/10'>
        <div className="relative">
          <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-10 h-10 rounded-full object-cover border-2 border-gray-600' />
          {onlineUsers.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e1e2e] rounded-full"></span>
          )}
        </div>
        <div className='flex-1 flex flex-col'>
          <p className='text-white font-medium'>{selectedUser.fullName}</p>
          <p className={`text-xs ${onlineUsers.includes(selectedUser._id) ? 'text-green-400' : 'text-gray-400'}`}>
            {onlineUsers.includes(selectedUser._id)
              ? 'Online'
              : selectedUser.lastSeen
                ? `Last seen: ${new Date(selectedUser.lastSeen).toLocaleString(undefined, {
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                })}`
                : 'Offline'}
          </p>
        </div>
        <button onClick={handleCallClick} className='p-2 hover:bg-white/10 rounded-full transition-colors'>
          <Phone className="text-gray-400" size={20} />
        </button>
        <button onClick={() => setSelectedUser(null)} className='p-2 hover:bg-white/10 rounded-full transition-colors'>
          <X className="text-gray-400" size={20} />
        </button>
      </div>

      {/* Chat area */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700'>
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === authUser._id;
          return (
            <div key={msg._id} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <img
                  src={isCurrentUser ? (authUser.profilePic || assets.avatar_icon) : (selectedUser.profilePic || assets.avatar_icon)}
                  alt=""
                  className='w-8 h-8 rounded-full object-cover border border-gray-700'
                />
                <div className={`flex flex-col gap-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className='max-w-[250px] border border-gray-700 rounded-2xl shadow-lg'
                    />
                  ) : (
                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-md ${isCurrentUser ? 'bg-violet-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-100 rounded-bl-none'}`}>
                      {editingMessageId === msg._id ? (
                        <div className="flex gap-2 items-center">
                          <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} className="bg-white/20 text-white px-2 py-1 rounded outline-none flex-1 min-w-[120px]" autoFocus />
                          <button onClick={() => submitEdit(msg._id)} className="bg-green-500/80 px-2 rounded text-xs py-1">Save</button>
                          <button onClick={() => setEditingMessageId(null)} className="bg-red-500/80 px-2 rounded text-xs py-1">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {msg.isCallRequest && <Phone size={16} className="text-green-400" />}
                          {msg.isDeletedForEveryone ? (
                            <div className="flex items-center gap-1 italic opacity-70">
                              <Ban size={14} />
                              <span>This message was deleted</span>
                            </div>
                          ) : (
                            <span>
                              {msg.text.includes('https://www.google.com/maps') ? (
                                <>
                                  {msg.text.split(/(https:\/\/[^\s]+)/g).map((part, index) =>
                                    part.startsWith('https://') ? (
                                      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">
                                        {part}
                                      </a>
                                    ) : (
                                      <span key={index}>{part}</span>
                                    )
                                  )}
                                </>
                              ) : (
                                msg.text
                              )}
                            </span>
                          )}
                          {msg.isEdited && <span className="text-[10px] opacity-70 ml-1 italic">(edited)</span>}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-[10px] text-gray-500 mt-1 px-1 ${isCurrentUser ? "justify-end" : "justify-start"} relative`}>
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isCurrentUser && !msg.isDeletedForEveryone && (
                      msg.isSeen ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} />
                    )}
                    {isCurrentUser && !msg.isSeen && !msg.image && !msg.isDeletedForEveryone && editingMessageId !== msg._id && (
                      <button onClick={() => { setEditingMessageId(msg._id); setEditText(msg.text); setDeleteMenuId(null); }} className="ml-1 hover:text-white transition-colors" title="Edit message">
                        <Edit2 size={12} />
                      </button>
                    )}
                    <button onClick={() => { setDeleteMenuId(deleteMenuId === msg._id ? null : msg._id); setEditingMessageId(null); }} className="ml-1 hover:text-white transition-colors" title="Delete message">
                      <Trash2 size={12} />
                    </button>
                    {deleteMenuId === msg._id && (
                      <div className={`absolute z-10 w-36 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 bottom-full mb-1 ${isCurrentUser ? 'right-0' : 'left-0'}`}>
                        <button onClick={() => { deleteMessageForMe(msg._id); setDeleteMenuId(null); }} className="w-full text-left px-3 py-2 text-[11px] text-white hover:bg-gray-700 font-medium">Delete for me</button>
                        {isCurrentUser && !msg.isDeletedForEveryone && (new Date() - new Date(msg.createdAt)) / (1000 * 60 * 60) <= 24 && (
                          <button onClick={() => { deleteMessageForEveryone(msg._id); setDeleteMenuId(null); }} className="w-full text-left px-3 py-2 text-[11px] text-red-400 hover:bg-gray-700 font-medium border-t border-gray-700">Delete for everyone</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Input area */}
      <div className='p-4 bg-black/30 backdrop-blur-md border-t border-gray-700'>
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-gray-600"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 hover:bg-gray-700"
                type="button"
              >
                <X size={12} className="text-gray-200" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className='flex items-center gap-2 relative'>

          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-4 w-[340px] bg-gray-900/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-gray-700 z-50">
              <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform group">
                  <div className="w-14 h-14 bg-gray-800 group-hover:bg-gray-700 transition-colors rounded-full flex items-center justify-center shadow-sm border border-gray-700 group-hover:border-gray-600">
                    <Camera size={26} className="text-gray-300" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Camera</span>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform group" onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}>
                  <div className="w-14 h-14 bg-gray-800 group-hover:bg-gray-700 transition-colors rounded-full flex items-center justify-center shadow-sm border border-gray-700 group-hover:border-gray-600">
                    <Image size={26} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Photos</span>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform group">
                  <div className="w-14 h-14 bg-gray-800 group-hover:bg-gray-700 transition-colors rounded-full flex items-center justify-center shadow-sm border border-gray-700 group-hover:border-gray-600">
                    <FileText size={26} className="text-indigo-400" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Document</span>
                </div>

                <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform group" onClick={handleLocationClick}>
                  <div className="w-14 h-14 bg-gray-800 group-hover:bg-gray-700 transition-colors rounded-full flex items-center justify-center shadow-sm border border-gray-700 group-hover:border-gray-600">
                    <MapPin size={26} className="text-emerald-400" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">Location</span>
                </div>

              </div>
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl">
              <Picker
                onEmojiClick={(emojiObject) => setText(prev => prev + emojiObject.emoji)}
                theme="dark"
              />
            </div>
          )}

          <div className='flex-1 flex items-center bg-gray-800/50 border border-gray-700 px-4 py-1 rounded-full focus-within:border-violet-500 transition-colors'>
            <button
              type="button"
              className={`p-2 -ml-2 text-gray-400 hover:text-white transition-colors ${showEmojiPicker ? "text-violet-400" : ""}`}
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachmentMenu(false); }}
            >
              <Smile size={20} className="transition-colors duration-300" />
            </button>
            <button
              type="button"
              className={`p-2 rounded-full hover:bg-white/5 transition-colors ${showAttachmentMenu ? "text-violet-400 rotate-45" : "text-gray-400"}`}
              onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowEmojiPicker(false); }}
            >
              <Plus size={20} className="transition-transform duration-300" />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Type a message...'
              className='flex-1 text-sm text-white py-2 bg-transparent outline-none placeholder-gray-500 ml-2'
              onClick={() => { setShowAttachmentMenu(false); setShowEmojiPicker(false); }}
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                handleImageChange(e);
                setShowAttachmentMenu(false);
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className='p-3 bg-violet-600 text-white rounded-full hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95'
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  ) : (
    <div className='flex-1 flex flex-col items-center justify-center gap-4 text-center p-10 bg-black/10 max-md:hidden h-full border-l border-gray-700'>
      <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center animate-pulse">
        <img src={assets.logo_icon} alt="" className='w-12 opacity-80' />
      </div>
      <div>
        <h2 className='text-2xl font-bold text-white mb-2'>Welcome to ChatApp</h2>
        <p className='text-gray-400 max-w-md'>Select a user from the sidebar to start chatting. Experience real-time messaging with your friends.</p>
      </div>
    </div>
  )
}

export default ChatContainer
