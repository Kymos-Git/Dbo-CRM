"use client";

import { Login } from "@/app/components/login/login";
import ConfigLoader from "./services/configLoader";
import ThemeToggle from "./theme/themeToggle";


export default function Page(){
    return(
        <div className="page w-screen h-screen">
         <ConfigLoader/>
         <ThemeToggle/>
        <Login/>
        
        </div>
    ) 
}