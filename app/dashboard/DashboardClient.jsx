"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import {
  Menu,
  ChevronDown,
  ChevronUp,
  Edit2,
  House,
  Info,
  Briefcase,
  Phone,
  MapPin,
  BookOpen,
} from "lucide-react";

const DashboardClient = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isServiceOpen, setIsServiceOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const iconMap = {
    home: House,
    about: Info,
    contact: Phone,
    branches: MapPin,
    knowledgebase: BookOpen,
  };

  const mainPages = [
    { id: 1, title: "Home", slug: "home", iconKey: "home" },
    { id: 2, title: "About Us", slug: "about", iconKey: "about" },
    { id: 4, title: "Contact", slug: "contact", iconKey: "contact" },
    { id: 20, title: "Branches", slug: "branches", iconKey: "branches" },
    {
      id: 21,
      title: "Knowledgebase",
      slug: "knowledgebase",
      iconKey: "knowledgebase",
    },
  ];

  const servicePages = [
    { id: 3, title: "Service Overview", slug: "service" },
    { id: 5, title: "Eco Friendly", slug: "eco-friendly" },
    { id: 6, title: "Pest Removal", slug: "pest-removal" },
    { id: 7, title: "Extermination", slug: "extermination" },
    { id: 8, title: "Cockroach Control", slug: "cockroach-control" },
    { id: 9, title: "Bedbug Control", slug: "bedbug-control" },
    { id: 10, title: "Termite Control", slug: "termite-control" },
    { id: 11, title: "Mosquito Control", slug: "mosquito-control" },
    { id: 12, title: "Flies Control", slug: "flies-control" },
    { id: 13, title: "Rodent Control", slug: "rodent-control" },
    { id: 14, title: "Bird Control", slug: "bird-control" },
    { id: 15, title: "Ant Control", slug: "ant-control" },
    {
      id: 16,
      title: "Residential Pest Control",
      slug: "residential-pest-control",
    },
    {
      id: 17,
      title: "Commercial Pest Control",
      slug: "commercial-pest-control",
    },
    { id: 18, title: "Herbal Pest Control", slug: "herbal-pest-control" },
    {
      id: 19,
      title: "Fumigation Pest Control",
      slug: "fumigation-pest-control",
    },
  ];

  const handleEdit = (page) => {
    router.push(`/edit/${page.slug}`);
  };
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-96">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-gray-100 p-2 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Pages</h1>
            <div className="flex items-center gap-4">
              <button className="relative hover:bg-gray-100 p-2 rounded-lg">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page List */}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Page Management
              </h1>
              <p className="text-gray-600">
                Manage and edit your website pages
              </p>
            </div>

            <div className="space-y-4">
              {/* Main Pages */}
              {mainPages.map((page) => {
                const Icon = iconMap[page.iconKey];
                return (
                  <div
                    key={page.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                          {Icon && <Icon className="w-10 h-10 text-blue-600" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {page.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            /{page.slug}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEdit(page)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-white font-medium hover:from-amber-500 hover:to-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Services Accordion */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsServiceOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Service Pages
                      </h3>
                      <p className="text-sm text-gray-500">
                        {servicePages.length} pages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      {isServiceOpen ? "Collapse" : "Expand"}
                    </span>
                    {isServiceOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isServiceOpen
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 space-y-2">
                      {servicePages.map((page, index) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-sm transition-all duration-200 border border-gray-100 group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-green-700 text-sm font-semibold">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="text-base font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                                {page.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                /{page.slug}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEdit(page)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* End Services Accordion */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
