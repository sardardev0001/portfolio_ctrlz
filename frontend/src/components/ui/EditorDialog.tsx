"use client";
import { useEffect, useRef, useState } from "react";
import { LanguageToggle, useT } from "@/i18n/provider";
let scrollLocks = 0;
let previousOverflow = "";
export default function EditorDialog({
  children,
  onClose,
  label,
  dirty = false,
  busy = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label: string;
  dirty?: boolean;
  busy?: boolean;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [closing, setClosing] = useState(false);
  function finishClose() {
    setClosing(true);
    window.setTimeout(
      onClose,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 140,
    );
  }
  function requestClose() {
    if (busy) return;
    if (dirty) setConfirming(true);
    else finishClose();
  }
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    if (scrollLocks++ === 0) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  return (
    <dialog
      ref={ref}
      className="editor-backdrop"
      aria-label={label}
      role="dialog"
      aria-modal="true"
      data-closing={closing}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            requestClose();
        }
      }}
    >
      <button
        className="dialog-close"
        type="button"
        onClick={requestClose}
        disabled={busy}
        aria-label={t("common.close")}
      >
        ×
      </button>
      {children}
      <div className="dialog-language admin-preferences">
        <LanguageToggle />
        <button
          className="button outline"
          type="button"
          onClick={requestClose}
          disabled={busy}
        >
          {t("common.cancel")}
        </button>
      </div>
      {confirming && (
        <EditorDialog
          label={t("dialog.unsaved")}
          onClose={() => setConfirming(false)}
        >
          <section className="editor-panel">
            <h2>{t("dialog.unsaved")}</h2>
            <div className="dialog-actions">
              <button
                className="button outline"
                onClick={() => setConfirming(false)}
              >
                {t("common.cancel")}
              </button>
              <button className="button danger" onClick={finishClose}>
                {t("dialog.discard")}
              </button>
            </div>
          </section>
        </EditorDialog>
      )}
    </dialog>
  );
}
