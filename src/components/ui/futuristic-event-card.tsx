/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Pencil,
  Trash2,
  User,
  Clock,
  ChevronDown,
  Activity,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { Booking } from "@/generated/prisma";

interface EventCardProps {
  event: Booking & {
    Creator: {
      id: string;
      fullname: string;
      Department: { name: string } | null;
    };
  } & {
    Room: { id: string; name: string };
  };
  onEdit: (event: any) => void;
  onDelete: () => void;
}

const getMinutes = (date: Date) => {
  return date.getHours() * 60 + date.getMinutes();
};

export function FuturisticEventCard({
  event,
  onEdit,
  onDelete,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const duration = getMinutes(event.endTime) - getMinutes(event.startTime);
  const startTime = format(event.startTime, "HH:mm");
  const endTime = format(event.endTime, "HH:mm");
  const dayOfMonth = format(event.startTime, "dd");
  const month = format(event.startTime, "MMM");
  const dayOfWeek = format(event.startTime, "EEE");
  const formattedDate = format(event.startTime, "EEEE, dd MMMM yyyy");

  // Tính toán tiến trình thời gian (giả lập)
  const progress = Math.min(Math.random() * 100, 100);

  // Hiệu ứng theo dõi chuột
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Tạo hiệu ứng đường thời gian
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  useEffect(() => {
    if (timelineRef.current) {
      setTimelineWidth(timelineRef.current.offsetWidth);
    }
  }, []);

  // Tạo các điểm thời gian ngẫu nhiên trên timeline
  const timePoints = [
    { position: 0, label: startTime },
    { position: timelineWidth * 0.3, label: "" },
    { position: timelineWidth * 0.7, label: "" },
    { position: timelineWidth, label: endTime },
  ];

  return (
    <motion.div
      ref={cardRef}
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
    >
      {/* Hiệu ứng ánh sáng theo chuột */}
      <div
        className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-600/20 via-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
        style={{
          transform: `translate(${mousePosition.x / 10 - 20}px, ${
            mousePosition.y / 10 - 20
          }px)`,
        }}
      />

      <div className="relative box-border border-2 border-sky-500 border-dashed overflow-x-hidden bg-gradient-to-br  dark:from-gray-900 dark:to-gray-800 from-white to-white rounded-3xl overflow-hidden shadow-lg group">
        {/* Các hình trang trí */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

        {/* Lưới trang trí */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full grid grid-cols-8 grid-rows-6">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-white/5" />
            ))}
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="relative p-6 text-gray-900 dark:text-white">
          <div className="flex items-start gap-6">
            {/* Phần ngày tháng */}
            <div className="flex flex-col items-center justify-center bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-3 min-w-[80px]">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                {month}
              </span>
              <span className="text-3xl font-bold">{dayOfMonth}</span>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                {dayOfWeek}
              </span>
            </div>

            {/* Phần tiêu đề và thông tin */}
            <div className="flex-1">
              <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {event.title}
              </h3>

              <div className="mt-3 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>
                    {startTime} - {endTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="truncate max-w-[150px]">
                    {event.Room?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{event.Creator?.fullname}</span>
                </div>
              </div>
            </div>

            {/* Phần nút tương tác */}
            <div className="flex-col gap-2 hidden sm:flex">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200/80 dark:hover:bg-white/20 text-gray-700 dark:text-white"
                onClick={() => onEdit(event)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              {new Date(event.startTime) > new Date() && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full bg-gray-100/80 dark:bg-white/10 hover:bg-red-100/80 dark:hover:bg-red-500/30 text-gray-700 dark:text-white"
                  onClick={() => onDelete()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Phần timeline */}
          <div className="mt-6 mb-2">
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Tiến trình</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                {duration} phút
              </span>
            </div>

            <div
              className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              ref={timelineRef}
            >
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />

              {/* Các điểm thời gian */}
              {timePoints.map((point, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full"
                  style={{ left: `${(point.position / timelineWidth) * 100}%` }}
                >
                  {point.label && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap">
                      {point.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nút mở rộng */}
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className=""
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="text-xs mr-1">
                {isExpanded ? "Thu gọn" : "Chi tiết"}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* Phần mở rộng */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="mt-4 pt-4 border-t border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-400">Ngày</div>
                        <div className="text-sm">{formattedDate}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-cyan-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-400">Trạng thái</div>
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {event.Creator?.Department?.name && (
                      <div className="flex items-start gap-3">
                        <HomeIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-400">Phòng ban</div>
                          <div className="text-sm">
                            {event.Creator?.Department?.name}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mt-0.5">
                        <span className="text-xs font-bold">i</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Ghi chú</div>
                        <div className="text-sm">
                          {event.description || "Chưa có ghi chú"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="text-white"
                    onClick={() => onEdit(event)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className=""
                    onClick={() => onDelete()}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Xóa
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
