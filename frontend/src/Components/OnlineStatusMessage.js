
import React from 'react';
import { RiWifiOffLine } from 'react-icons/ri';

const OnlineStatusMessage = ({ onlineStatus }) => {
  if (onlineStatus) return null;

  return (
    <div className="bg-red-500 flex text-black text-center p-2 bg-yellow-100 justify-center gap-2 items-center">
      <RiWifiOffLine size={22} />
      Looks like you're offline, Please check your internet connection!
      <button
        className="ml-2 bg-richblack-500 rounded-md p-1 px-2 text-white"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
};

export default OnlineStatusMessage;
