"use client";
// Add this helper above your component
const sanitizeHtmlContent = (html) => {
  if (!html) return "";
  return (
    html
      .replace(/className=/g, "class=")
      .replace(/<Image\s/g, "<img ")
      .replace(/height=\{(\d+)\}/g, 'height="$1"')
      .replace(/width=\{(\d+)\}/g, 'width="$1"')
      // Convert text-[#color] to inline style so it always works
      .replace(/class="([^"]*?)"/g, (match, classes) => {
        return `class="${classes}"`;
      })
      .replace(/<[A-Z][^>]*\/>/g, "◆") // replace JSX icons with a diamond
      .replace(/<[A-Z][^>]*>/g, "")
      .replace(/<\/[A-Z][^>]*>/g, "")
  );
};

import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Menu,
  FileText,
  Search,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import SummernoteModal from "../../../components/SummernoteModal";
import Sidebar from "../../../components/Sidebar";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const pageName = params?.slug;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageData, setPageData] = useState([]);
  const [editedContent, setEditedContent] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState({
    blockIndex: null,
    content: "",
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [metaData, setMetaData] = useState({});
  const [pageTitle, setPageTitle] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleBack = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        )
      ) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    if (!pageName) return;
    const fetchPageContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/pages/${pageName}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setPageData(data.page.pageData || []);
        setPageTitle(data.page.title || pageName);
        const initialContent = {};
        (data.page.pageData || []).forEach((section, index) => {
          initialContent[index] = section.content || "";
        });
        setEditedContent(initialContent);
        if (data.page.metaTitle || data.page.metaDescription) {
          setMetaData({
            metaTitle: data.page.metaTitle || "",
            metaDescription: data.page.metaDescription || "",
          });
        }
      } catch (error) {
        console.error("Can't fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPageContent();
  }, [pageName]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const handleBlockDoubleClick = (blockIndex, e) => {
    e.stopPropagation();
    const content =
      editedContent[blockIndex] || pageData[blockIndex]?.content || "";
    setCurrentEdit({ blockIndex, content });
    setModalOpen(true);
  };

  const handleSaveEdit = (newContent) => {
    const { blockIndex } = currentEdit;
    if (blockIndex === null) return;
    setEditedContent((prev) => ({ ...prev, [blockIndex]: newContent }));
    setHasChanges(true);
    setModalOpen(false);
  };

  const handleMetaData = (e) => {
    const { name, value } = e.target;
    setMetaData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSavePage = async () => {
    if (!pageData || pageData.length === 0)
      return alert("No page data to save");
    if (!hasChanges) return alert("No changes to save");
    if (!pageName) return alert("Missing page name");

    setSaving(true);
    try {
      const updatedPageData = pageData.map((section, index) => ({
        block: section.block,
        content:
          editedContent[index] !== undefined
            ? editedContent[index]
            : section.content,
      }));

      const response = await fetch(`/api/pages/updatePage/${pageName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          metaTitle: metaData.metaTitle,
          metaDescription: metaData.metaDescription,
          pageData: updatedPageData,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(
          `Server returned ${response.status}: ${text.substring(0, 100)}`,
        );
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || `Failed to save: ${response.status}`);

      alert("✓ Page saved successfully!");
      setHasChanges(false);
      setPageData(data.page.pageData || []);
      const newEditedContent = {};
      (data.page.pageData || []).forEach((section, index) => {
        newEditedContent[index] = section.content;
      });
      setEditedContent(newEditedContent);
    } catch (error) {
      console.error("Save error:", error);
      alert(`✗ Failed to save page: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isBlockModified = (index) =>
    editedContent[index] !== undefined &&
    editedContent[index] !== pageData[index]?.content;

  const modifiedCount = pageData.filter((_, i) => isBlockModified(i)).length;

  const renderEditableBlock = (blockIndex) => {
    const rawContent =
      editedContent[blockIndex] || pageData[blockIndex]?.content || "";
    const content = sanitizeHtmlContent(rawContent); // ← sanitize here
    const modified = isBlockModified(blockIndex);

    return (
      <div
        onDoubleClick={(e) => handleBlockDoubleClick(blockIndex, e)}
        className={`
        group relative cursor-pointer transition-all duration-200 rounded-xl p-5 min-h-[80px]
        border-2 ${modified ? "border-amber-300 bg-amber-50/30" : "border-transparent bg-white"}
        hover:border-[#2F3293] hover:shadow-lg hover:shadow-[#2F3293]/10
      `}
        title="Double-click to edit this block"
      >
        {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-[#2F3293]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
          ✏️ Double-click to edit
        </div>
      </div> */}

        <div
          className={`transition-all duration-200 ${content ? "" : "flex items-center justify-center min-h-[60px]"}`}
        >
          {content ? (
            // ← Remove prose classes, they override Tailwind inside the content
            <div className="[&_img]:max-w-full [&_img]:h-auto overflow-hidden">
              {parse(content)}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm italic">
                Empty block — double-click to add content
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <SummernoteModal
        isOpen={modalOpen}
        content={currentEdit.content}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEdit}
      />

      <div className="flex-1 lg:ml-96 flex flex-col">
        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2F3293]/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#2F3293]" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-tight">
                    Edit Page
                  </h1>
                  {pageTitle && (
                    <p className="text-xs text-gray-400 leading-tight truncate max-w-[180px]">
                      {pageTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {modifiedCount} block{modifiedCount !== 1 ? "s" : ""} modified
                </div>
              )}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-semibold"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <button
                onClick={handleSavePage}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all text-sm font-semibold shadow-sm ${
                  hasChanges
                    ? "bg-[#2F3293] hover:bg-[#252880] text-white shadow-[#2F3293]/30 hover:shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                style={{ color: hasChanges ? "white" : "text-gray-400" }}
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Page
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 px-5 md:px-8 py-6 space-y-6 max-w-[95%] w-full mx-auto">
          {/* ── Page Info Banner ── */}
          <div className="bg-gradient-to-r from-[#2F3293] to-[#4a4eb3] rounded-2xl p-5 text-white shadow-lg shadow-[#2F3293]/20">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">
                  Currently Editing
                </p>
                <h2 className="text-2xl font-bold">{pageTitle || pageName}</h2>
                <p className="text-blue-200 text-sm mt-1.5 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
                  Double-click any content block to open the editor
                </p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div className="bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                  <p className="text-2xl font-bold">{pageData.length}</p>
                  <p className="text-blue-200 text-xs">Blocks</p>
                </div>
                {modifiedCount > 0 && (
                  <div className="bg-amber-400/20 border border-amber-300/30 backdrop-blur rounded-xl px-4 py-2.5 text-center">
                    <p className="text-2xl font-bold text-amber-200">
                      {modifiedCount}
                    </p>
                    <p className="text-amber-300 text-xs">Modified</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── SEO Meta Data ── */}
          <div className="max-w-7xl border border-gray-200 rounded p-10 mx-auto">
            <h2 className="text-center text-2xl mb-10">
              Enter your meta title and meta description
            </h2>
            <input
              type="text"
              name="metaTitle"
              placeholder="Enter the meta title"
              className="p-5 rounded-xl text-black border border-gray-300 w-full"
              onChange={(e) => handleMetaData(e)}
            />
            <br />
            <br />
            <input
              type="text"
              name="metaDescription"
              placeholder="Enter the meta description"
              className="p-5 rounded-xl text-black border border-gray-300 w-full"
              onChange={(e) => handleMetaData(e)}
            />
          </div>

          {/* ── Content Blocks ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    Content Blocks
                  </h2>
                  <p className="text-xs text-gray-500">
                    {pageData.length} block{pageData.length !== 1 ? "s" : ""}{" "}
                    loaded from database
                  </p>
                </div>
              </div>
              {hasChanges && (
                <button
                  onClick={handleSavePage}
                  disabled={saving}
                  className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#2F3293] text-white rounded-lg font-semibold hover:bg-[#252880] transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save All Changes
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-5 w-24 bg-gray-200 rounded-full" />
                      <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-4/5" />
                      <div className="h-4 bg-gray-100 rounded w-3/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pageData.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold">
                  No content blocks found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Make sure this page has data in the database
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-16">
                {pageData.map((block, index) => {
                  const modified = isBlockModified(index);
                  return (
                    <div
                      key={block._id || index}
                      className={`
                      bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200
                      ${modified ? "border-amber-300 shadow-amber-100" : "border-gray-200"}
                    `}
                    >
                      {/* Block header */}
                      <div
                        className={`
                        flex items-center justify-between px-4 py-2.5 border-b
                        ${modified ? "bg-amber-50 border-amber-200" : "bg-gray-50/70 border-gray-100"}
                      `}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                            text-xs font-mono font-semibold px-2.5 py-1 rounded-md
                            ${modified ? "bg-amber-200 text-amber-800" : "bg-indigo-100 text-indigo-700"}
                          `}
                          >
                            {block.block}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">
                            Block {index + 1} of {pageData.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {modified && (
                            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                              Modified
                            </span>
                          )}
                          <span className="text-xs text-gray-400 hidden sm:block">
                            Double-click to edit
                          </span>
                        </div>
                      </div>

                      {/* Block content */}
                      {renderEditableBlock(index)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
