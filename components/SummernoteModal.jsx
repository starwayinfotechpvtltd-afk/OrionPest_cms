import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const SummernoteModal = ({ isOpen, content, onClose, onSave }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const waitForLibs = (retries = 25) => {
      if (window.$ && window.$.fn && window.$.fn.summernote) {
        setupEditor();
      } else if (retries > 0) {
        setTimeout(() => waitForLibs(retries - 1), 200);
      } else {
        console.error("Summernote failed to load.");
      }
    };

    const setupEditor = () => {
      const $ = window.$;
      if (!editorRef.current) return;

      if ($(editorRef.current).data("summernote")) {
        $(editorRef.current).summernote("destroy");
      }

      const showToast = (message, type) => {
        const bg =
          type === "success"
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
        const $toast = $("<div>")
          .html(message)
          .css({
            position: "fixed",
            top: "24px",
            right: "24px",
            background: bg,
            color: "white",
            padding: "14px 22px",
            borderRadius: "12px",
            zIndex: "999999",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            maxWidth: "360px",
          })
          .appendTo("body");
        setTimeout(
          () => $toast.fadeOut(400, () => $toast.remove()),
          type === "success" ? 3000 : 5000,
        );
      };

      const uploadImageToCloudinary = async (file) => {
        if (!file || !file.type.startsWith("image/"))
          return alert("Please select a valid image file");
        if (file.size > 10 * 1024 * 1024)
          return alert("Image size must be less than 10MB");

        const reader = new FileReader();
        reader.onload = async (e) => {
          const $img = $("<img>")
            .attr("src", e.target.result)
            .addClass("uploading-image")
            .attr("alt", "Uploading...")
            .css({
              "max-width": "100%",
              height: "auto",
              opacity: "0.6",
              border: "3px dashed #4a4eb3",
              padding: "4px",
            });

          $(editorRef.current).summernote("insertNode", $img[0]);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "cms_unsigned");

          try {
            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dstlumjlw/image/upload",
              {
                method: "POST",
                body: formData,
              },
            );
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error?.message || "Upload failed");
            }
            const data = await res.json();
            $img
              .attr("src", data.secure_url)
              .removeClass("uploading-image")
              .attr("data-cloudinary-id", data.public_id)
              .css({ opacity: "1", border: "none", padding: "0" });
            showToast("✓ Image uploaded successfully!", "success");
          } catch (err) {
            $img.remove();
            showToast(`✗ Upload failed: ${err.message}`, "error");
          }
        };
        reader.readAsDataURL(file);
      };

      $(editorRef.current).summernote({
        height: 380,
        minHeight: 220,
        dialogsInBody: true,
        focus: true,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "italic", "underline", "clear"]],
          ["fontname", ["fontname"]],
          ["fontsize", ["fontsize"]],
          ["color", ["forecolor", "backcolor"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture", "video"]],
          ["view", ["codeview", "help"]],
        ],
        styleTags: [
          "p",
          { title: "Heading 1", tag: "h1", className: "", value: "h1" },
          { title: "Heading 2", tag: "h2", className: "", value: "h2" },
          { title: "Heading 3", tag: "h3", className: "", value: "h3" },
          { title: "Heading 4", tag: "h4", className: "", value: "h4" },
          { title: "Heading 5", tag: "h5", className: "", value: "h5" },
          { title: "Heading 6", tag: "h6", className: "", value: "h6" },
        ],
        callbacks: {
          onImageUpload: (files) => {
            for (let i = 0; i < files.length; i++)
              uploadImageToCloudinary(files[i]);
          },
          onInit: function () {
            setTimeout(() => {
              window
                .$(".note-modal")
                .css({ "z-index": "100010", "pointer-events": "auto" });
              window
                .$(".modal-backdrop")
                .css({ "z-index": "100009", "pointer-events": "none" });
            }, 150);
          },
        },
      });

      $(editorRef.current).summernote("code", content);
    };

    waitForLibs();

    return () => {
      if (editorRef.current && window.$) {
        try {
          const $ = window.$;
          if ($(editorRef.current).data("summernote")) {
            $(editorRef.current).summernote("destroy");
          }
        } catch (e) {}
      }
    };
  }, [isOpen, content]);

  const handleSave = () => {
    if (editorRef.current && window.$) {
      try {
        const html = window.$(editorRef.current).summernote("code");
        onSave(html);
      } catch (e) {
        console.error("Save error:", e);
      }
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Backdrop with blur ── */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 99990,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* ── Modal centered ── */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 99995 }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-[90vw] md:w-[80vw] md:max-w-[80vw] min-[1040px]:w-[50vw] min-[1040px]:max-w-[50vw]"
          style={{
            maxHeight: "90vh",
            animation: "modalFadeIn 0.25s cubic-bezier(0.34,1.3,0.64,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#2F3293] to-[#4a4eb3] shrink-0 rounded-t-2xl">
            <div>
              <h3 className="text-base font-bold" style={{color: 'white'}}>
                Edit Content Block
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Images auto-upload to Cloudinary CDN
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all text-lg font-bold bg-white"
            >
              ✕
            </button>
          </div>

          {/* Editor area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 min-h-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div ref={editorRef} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-white border-t border-gray-100 shrink-0 rounded-b-2xl">
            <p className="text-xs text-gray-400 hidden sm:block">
              💡 <span className="font-semibold text-gray-500">Tip:</span>{" "}
              Images stored on Cloudinary
            </p>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-gradient-to-r from-[#2F3293] to-[#4a4eb3] rounded-xl hover:opacity-90 transition-all text-sm font-semibold shadow-md"
                style={{color: "white"}}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateX(40px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        /* ── Summernote core ── */
        .note-editor.note-frame { border: none !important; box-shadow: none !important; }

        .note-toolbar {
          background: #f8fafc !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 8px 10px !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 2px !important;
        }
        .note-btn {
          border-radius: 7px !important;
          border: 1px solid transparent !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
          transition: all 0.12s !important;
        }
        .note-btn:hover { background: #e2e8f0 !important; border-color: #cbd5e1 !important; }

        .note-editable {
          font-size: 14px !important;
          line-height: 1.7 !important;
          padding: 16px 20px !important;
          min-height: 220px !important;
          color: #1e293b !important;
        }
        .note-editable img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 6px;
          cursor: pointer !important;
        }
        .note-editable img:hover { outline: 2px solid #2F3293 !important; outline-offset: 3px !important; }
        .note-editable img.uploading-image {
          opacity: 0.5 !important;
          border: 3px dashed #4a4eb3 !important;
          animation: pulseImg 1.5s ease-in-out infinite !important;
        }
        @keyframes pulseImg { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }

        .note-statusbar { background: #f8fafc !important; border-top: 1px solid #e2e8f0 !important; }

        /* ── Summernote inner modals (link / image insert dialogs) ── */
        .note-modal { z-index: 100010 !important; pointer-events: auto !important; }
        .note-modal .modal-content {
          border-radius: 14px !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25) !important;
        }
        .note-modal .modal-header {
          background: linear-gradient(135deg, #2F3293 0%, #4a4eb3 100%) !important;
          color: white !important;
          border-radius: 14px 14px 0 0 !important;
          border: none !important;
        }
        .note-modal .modal-title { color: white !important; font-weight: 600 !important; }
        .note-modal .close,
        .note-modal .btn-close { color: white !important; opacity: 0.8 !important; }
        .note-modal .btn-primary {
          background: linear-gradient(135deg, #2F3293 0%, #4a4eb3 100%) !important;
          border: none !important; border-radius: 8px !important; font-weight: 600 !important;
        }
        .note-popover { z-index: 100012 !important; }
        .note-dropdown-menu {
          z-index: 100012 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .modal-backdrop { z-index: 100009 !important; pointer-events: none !important; }
      `}</style>
    </>,
    document.body,
  );
};

export default SummernoteModal;
