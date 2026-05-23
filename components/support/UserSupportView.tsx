"use client";

import { useState } from "react";
import EmptySupportState from "./EmptySupportState";
import CreateTicketButton from "./CreateTicketButton";
import CreateTicketDialog from "./CreateTicketDialog";

export default function UserSupportView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <CreateTicketButton
          onClick={() => setIsCreateOpen(true)}
        />
      </div>

      <EmptySupportState />

      <CreateTicketDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}