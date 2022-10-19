import {
  LogoutIcon,
  MenuAlt2Icon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import React, { useState } from "react";

import Dialogue from "./Dialogue";
import Logo from "../../assets/images/Group 295.svg";
import UserIcon from "../../assets/images/Icon feather-user.svg";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();

  const [isHelpDialogueOpen, setIsHelpDialogueOpen] = useState(false);

  return (
    <>
      <Dialogue isOpen={isHelpDialogueOpen} setIsOpen={setIsHelpDialogueOpen} />
      <div className=" top-0 z-10 px-5 flex-shrink-0 flex h-16 bg-bluePrimary border-b-2 border-gray-500 shadow">
        <button
          type="button"
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bluePrimary md:hidden"
          onClick={function () {
            setSidebarOpen(true);
          }}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 flex justify-between">
          <div className="flex-1 flex">
            <img alt="" className="w-32" src={Logo} />
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button
              onClick={() => setIsHelpDialogueOpen(true)}
              className={"flex text-gray-400 py-5 text-sm focus"}
            >
              <QuestionMarkCircleIcon strokeWidth={1} className="h-5" />
              <span className={"block ml-1"}>Help</span>
            </button>
            <div className="flex  mr-8 ml-8">
              <img alt="" className="w-3" src={UserIcon} />
              <div className="ml-2 text-gray-400 text-sm">
                {localStorage.getItem("username")?.length > 0
                  ? localStorage.getItem("username")
                  : ""}
              </div>
            </div>
            <div>
              <LogoutIcon
                className="text-gray-400 w-5 cursor-pointer hover:text-gray-500 scale-100 hover:scale-110 transition-all duration-200"
                onClick={() => {
                  localStorage.removeItem("auth");
                  navigate("/");
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
