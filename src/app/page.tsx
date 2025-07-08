"use client";

import { Login } from "@/app/components/login/login";
import ConfigLoader from "./services/configLoader";
import ThemeToggle from "./theme/themeToggle";

export default function Page(){
    return(
        <>
         <ConfigLoader/>
         <ThemeToggle/>
        <Login/>
        </>
    ) 
}