// components/Sidebar.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronDown, StickyNote } from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("pages");
  const [openSubmenu, setOpenSubmenu] = useState("pages");

  const menuItems = [
    {
      id: "pages",
      label: "Pages",
      icon: StickyNote,
      path: "/", // home dashboard
    },
  ];

  const toggleSubmenu = (id) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  const handleMenuClick = (item) => {
    setActiveMenu(item.id);
    if (item.path) {
      router.push(item.path);
      if (toggleSidebar) toggleSidebar(); // close on mobile
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-96 bg-gray-900 text-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-20 w-28 rounded" />
            <span className="text-2xl font-bold">Orion Pest</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden hover:bg-gray-800 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === item.id
                    ? "bg-blue-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
