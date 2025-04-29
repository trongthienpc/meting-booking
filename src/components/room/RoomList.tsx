"use client";

import { useRoom } from "@/providers/room-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { RoomForm } from "./RoomForm";
import { Room } from "@/lib/schemas/room";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function RoomList() {
  const { rooms, isLoading, removeRoom } = useRoom();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phòng họp này?")) {
      await removeRoom(id);
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản Lý Phòng Họp</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm Phòng
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
              <Badge>{room.status === "available" ? "Trống" : "Đang sử dụng"}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Sức chứa:</span> {room.capacity} người
                </p>
                <p>
                  <span className="font-semibold">Vị trí:</span> Tầng {room.floor}
                </p>
                <div>
                  <span className="font-semibold">Tiện nghi:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {room.facilities.map((facility) => (
                      <Badge key={facility.id} variant="secondary">
                        {facility.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => setEditingRoom(room)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <RoomForm onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRoom} onOpenChange={() => setEditingRoom(null)}>
        <DialogContent>
          <RoomForm room={editingRoom} onSuccess={() => setEditingRoom(null)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
