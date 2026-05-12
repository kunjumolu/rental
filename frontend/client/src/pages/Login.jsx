import React from "react";
import loginBg from "../assets/login.png";
import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      
      {/* LEFT SIDE */}
      <div className="relative hidden md:flex w-1/2 min-h-screen overflow-hidden">
        
        {/* Background Image */}
        <img
          src={loginBg}
          alt="Login Background"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(10,30,60,0.45)] via-[rgba(10,30,60,0.15)] to-[rgba(10,30,60,0.65)]" />

        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-12">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-[2px]">
              <div className="h-2.5 w-2.5 bg-white rounded-sm"></div>
              <div className="h-2.5 w-2.5 bg-white rounded-sm"></div>
              <div className="h-2.5 w-2.5 bg-white rounded-sm"></div>
              <div className="h-2.5 w-2.5 bg-white rounded-sm"></div>
            </div>

            <h1 className="font-['Raleway'] text-xl font-bold text-white tracking-wide">
              White Legacy
            </h1>
          </div>

          {/* Bottom Text */}
          <div className="max-w-[420px]">
            <h2 className="font-['Raleway'] text-5xl font-extrabold leading-tight text-white">
              Precision in every asset.
            </h2>

            <p className="mt-5 text-[15px] leading-7 text-white/80">
              Streamline your enterprise management with institutional-grade
              clarity and real-time operational insights.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex min-h-screen w-full md:w-1/2 items-center justify-center bg-white px-6">
        <LoginForm />
      </div>
    </div>
  );
}