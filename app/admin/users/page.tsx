'use client';

import { useState } from "react";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  Mail, 
  Calendar, 
  MoreHorizontal,
  Plus,
  Filter,
  ArrowUpDown,
  UserCheck,
  UserMinus,
  Loader2,
  Clock,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  status: 'active' | 'inactive';
  joinedDate: string;
  lastActive: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alexander Vance",
    email: "alexander.v@aurea.luxury",
    role: "ADMIN",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2 minutes ago"
  },
  {
    id: "2",
    name: "Isabella Moretti",
    email: "isabella.m@aurea.luxury",
    role: "MANAGER",
    status: "active",
    joinedDate: "2024-02-20",
    lastActive: "1 hour ago"
  },
  {
    id: "3",
    name: "Julian Thorne",
    email: "julian.t@aurea.luxury",
    role: "STAFF",
    status: "inactive",
    joinedDate: "2024-03-10",
    lastActive: "Dec 12, 2023"
  },
  {
    id: "4",
    name: "Sienna Calloway",
    email: "sienna.c@aurea.luxury",
    role: "STAFF",
    status: "active",
    joinedDate: "2024-04-05",
    lastActive: "Just now"
  },
];

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return t("admin.users.roles.admin");
      case 'MANAGER': return t("admin.users.roles.manager");
      default: return t("admin.users.roles.staff");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-3.5 w-3.5" />;
      case 'MANAGER': return <UserCheck className="h-3.5 w-3.5" />;
      default: return <UserPlus className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Staff Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-light">
            Manage your elite team of administrators and curators. Control access levels 
            to preserve store integrity.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 h-14 px-6 border-2 font-light">
                <Mail className="h-4 w-4 mr-2" />
                Audit Logs
            </Button>
            <Button className="bg-slate-900 dark:bg-[#D4AF37] text-white hover:opacity-90 px-8 h-14 rounded-2xl text-lg font-light transition-all shadow-xl shadow-slate-900/10 dark:shadow-[#D4AF37]/5">
                <Plus className="h-5 w-5 mr-2" />
                Invite Member
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
            { label: "Active Curators", value: users.filter(u => u.status === 'active').length, icon: UserCheck, color: "text-green-600 bg-green-500/10" },
            { label: "Privileged Admins", value: users.filter(u => u.role === 'ADMIN').length, icon: Shield, color: "text-[#D4AF37] bg-[#D4AF37]/10" },
            { label: "Pending Invites", value: 2, icon: Mail, color: "text-blue-600 bg-blue-500/10" },
        ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                <div>
                    <p className="text-2xl font-light text-slate-900 dark:text-slate-100">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{stat.label}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                </div>
            </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search by name, email or role..." 
                className="pl-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111] h-12 text-sm font-light focus:ring-[#D4AF37]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800">
                <Filter className="h-4 w-4 text-slate-500" />
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-slate-800">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
              </Button>
          </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role / Designation</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Status</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Curation Since</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
              {isLoading ? (
                  <tr>
                      <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#D4AF37] opacity-60" />
                      </td>
                  </tr>
              ) : filteredUsers.length === 0 ? (
                <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="group hover:bg-slate-50 transition-colors"
                >
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-light text-slate-900 dark:text-slate-100 mb-1">No Members Found</h4>
                        <p className="text-xs text-slate-500 font-light leading-relaxed">
                            {t("admin.users.noResultsDesc")}
                        </p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <motion.tr 
                    key={user.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                    className="group hover:bg-slate-50/50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-medium border border-slate-200 dark:border-[#D4AF37]/10 overflow-hidden relative">
                           {user.avatar ? <img src={user.avatar} className="object-cover h-full w-full" /> : user.name.charAt(0)}
                           <div className={cn(
                               "absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white dark:border-[#111]",
                               user.status === 'active' ? "bg-green-500" : "bg-slate-300"
                           )} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light flex items-center gap-1.5 uppercase tracking-tighter">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          user.role === 'ADMIN' ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20" : 
                          user.role === 'MANAGER' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" : 
                          "bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10"
                      )}>
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                                {user.status === 'active' ? "Active Member" : "Suspended"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-light flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {user.lastActive}
                            </p>
                        </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-light">
                        <Calendar className="h-3.5 w-3.5 text-slate-300" />
                        {user.joinedDate}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                          <Mail className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                          <UserMinus className="h-4 w-4 text-red-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
                          <MoreHorizontal className="h-4 w-4 text-slate-400" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Pagination/Status Footer */}
        <div className="p-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                AUREA INTERNAL STAFF INFRASTRUCTURE
            </span>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security: Stable</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sync Configured</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
