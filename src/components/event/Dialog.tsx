import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import EventForm from "./EventForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnventDialog = ({ open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Event</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <DialogContent>
        <EventForm onSave={() => alert("saved")} />
      </DialogContent>
    </Dialog>
  );
};

export default EnventDialog;
