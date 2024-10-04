"use client";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import NavBar from "../components/NavBar";
import ComponentEditor from "../components/ComponentEditor";


export default function Home() {

  const handleClick = () => {
  };

  return (
    <div className="flex flex-col justify-center min-h-screen">
      

      <NavBar/>

      <ComponentEditor />
    </div>
  );
}
