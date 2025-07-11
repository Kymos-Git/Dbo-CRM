"use client";
import { useAuth } from "@/app/context/authContext";
import { CircleUser, LogOut } from "lucide-react";
import { useState } from "react";
import "./account.css"

export default function Account() {
    const {logout}=useAuth()

  function Wrapper() {
    return (
      <div className="ac-wrapper absolute bottom-[110%] right-[50%] w-[30vw] h-[10vh] rounded-2xl md:w-[10vw]">
        <div className="ac-logout justify-center items-center flex p-2 w-full rounded-2xl cursor-pointer hover:scale-110" onClick={()=>logout()}><LogOut size={20} /><span className="ml-4">Logout</span></div>
      </div>
    );
  }

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="ac-account relative cursor-pointer md:hover:scale-110" onClick={() => setIsOpen(!isOpen)}>
        <CircleUser size={30} />
      </div>
      {isOpen && <Wrapper />}
    </div>
  );
}
