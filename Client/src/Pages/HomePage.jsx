import React, { useEffect, useContext } from 'react'
import SlideBar from '../Components/SlideBar'
import ChatContainer from '../Components/ChatContainer'
import RightSlideBar from '../Components/RightSlideBar'
import { AppContext } from '../context/AppContext'

const HomePage = () => {
  const { selectedUser, getUsers } = useContext(AppContext);

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden
      h-[100%] grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
        <SlideBar />
        <ChatContainer />
        <RightSlideBar />
      </div>
    </div>
  )
}


export default HomePage

