import { LayoutDashboard, Presentation, Star } from "lucide-react";
import { MenuItem } from "@/lib/types/menu";
import { IP_ROLE } from "@/lib/constants";

export const menuItems: MenuItem[] = [
  // {
  //   href: "/room",
  //   icon: CalendarCheck2,
  //   label: "Quản lý ngày công",
  //   requiredRole: [SERVICES_ROLE],
  //   children: [
  //     {
  //       href: "/attendance",
  //       icon: Calendar,
  //       label: "Ngày công",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/attendance/leave",
  //       icon: Calendar,
  //       label: "Nghỉ phép",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/attendance/holiday",
  //       icon: CalendarDays,
  //       label: "Ngày lễ",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/attendance/schedule",
  //       icon: Calendar,
  //       label: "Lịch làm việc",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/attendance/user-schedule",
  //       icon: Calendar,
  //       label: "Lịch nhân viên",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //   ],
  // },
  // {
  //   href: "/schedule",
  //   icon: CalendarCheck2,
  //   label: "Quản lý lịch làm việc",
  //   requiredRole: [SERVICES_ROLE],
  //   children: [
  //     {
  //       href: "/schedule/schedule-templates",
  //       icon: Calendar,
  //       label: "Mẫu lịch",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/schedule/schedule-groups",
  //       icon: Calendar,
  //       label: "Lịch nhóm",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/schedule/schedule-calendar",
  //       icon: CalendarDays,
  //       label: "Lịch làm việc",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //     {
  //       href: "/schedule/attendance",
  //       icon: CalendarDays,
  //       label: "Test UI",
  //       requiredRole: [SERVICES_ROLE],
  //     },
  //   ],
  // },
  // {
  //   href: "/employee",
  //   icon: User,
  //   label: "Nhân viên",
  //   requiredRole: [IP_ROLE],
  //   children: [
  //     {
  //       href: "/employee",
  //       icon: Users,
  //       label: "Danh sách nhân viên",
  //       requiredRole: [IP_ROLE],
  //     },
  //     {
  //       href: "/employee/schedule",
  //       icon: Calendar,
  //       label: "Lịch nhân viên",
  //       requiredRole: [IP_ROLE],
  //     },
  //   ],
  // },
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    requiredRole: [IP_ROLE],
    // children: [
    //   {
    //     href: "/configuration/attendance",
    //     icon: Users,
    //     label: "Cấu hinh ngày công",
    //     requiredRole: [IP_ROLE],
    //   },
    // ],
  },
  {
    href: "/room",
    icon: Presentation,
    label: "Meeting room",
    requiredRole: [IP_ROLE],
    // children: [
    //   {
    //     href: "/configuration/attendance",
    //     icon: Users,
    //     label: "Cấu hinh ngày công",
    //     requiredRole: [IP_ROLE],
    //   },
    // ],
  },
  {
    href: "/booking",
    icon: Star,
    label: "Booking meeting room",
    requiredRole: [IP_ROLE],
    // children: [
    //   {
    //     href: "/configuration/attendance",
    //     icon: Users,
    //     label: "Cấu hinh ngày công",
    //     requiredRole: [IP_ROLE],
    //   },
    // ],
  },
];
