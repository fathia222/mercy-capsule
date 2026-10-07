"use client";
// ============================================================
// WHAT THIS FILE DOES
// The red "Delete" button. It asks "are you sure?" first so you
// can't delete a memory by accident.
// ============================================================

export default function ConfirmDeleteButton({ name }) {
  return (
    <button
      type="submit"
      className="delete"
      onClick={e => {
        const sure = window.confirm(`Delete ${name}'s memory for good? Their photos will be removed too.`);
        if (!sure) e.preventDefault();
      }}
    >
      Delete
    </button>
  );
}