import { useListInterviews, useStartInterview, getListInterviewsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Clock, Target, Star, Loader2, Bot } from "lucide-react";
import { toast } from "sonner";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "text-emerald-700 border-emerald-300 bg-emerald-50",
  medium: "text-amber-700 border-amber-300 bg-amber-50",
  hard:   "text-rose-700 border-rose-300 bg-rose-50",
};

export default function InterviewListPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: interviews, isLoading } = useListInterviews();
  const startInterview = useStartInterview();

  const [role, setRole]           = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    startInterview.mutate(
      { data: { role, difficulty } },
      {
        onSuccess: (session) => {
          queryClient.invalidateQueries({ queryKey: getListInterviewsQueryKey() });
          toast.success("Simulation initialized");
          setLocation(`/interview/${session.id}`);
        },
        onError: () => toast.error("Failed to start simulation"),
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="neu-card p-5 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-50 to-transparent pointer-events-none" />
        <div className="w-10 h-10 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center">
          <Video className="w-5 h-5 text-fuchsia-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-slate-800">AI Interviewer</h1>
          <p className="text-slate-400 text-xs mt-0.5">High-pressure simulation environments</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* Setup Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1">
          <div className="neu-card p-6 sticky top-6 relative overflow-hidden">
            <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-fuchsia-100/60 blur-3xl rounded-full pointer-events-none" />
            <h2 className="font-display font-bold text-sm text-slate-800 mb-5 relative z-10 tracking-wider uppercase">New Simulation</h2>

            <form onSubmit={handleStart} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fuchsia-500 uppercase tracking-wider">Target Role</label>
                <Input value={role} onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="bg-white border-slate-200 focus-visible:ring-fuchsia-400/40 text-slate-800 placeholder:text-slate-300 text-sm h-11 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fuchsia-500 uppercase tracking-wider">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-700 h-11 rounded-xl text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="easy">Easy — Conversational</SelectItem>
                    <SelectItem value="medium">Medium — Technical Deep Dive</SelectItem>
                    <SelectItem value="hard">Hard — Stress Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={startInterview.isPending || !role.trim()}
                className="w-full h-12 mt-2 font-display text-xs tracking-wider rounded-xl
                  bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-400 hover:to-fuchsia-500
                  text-white border-0 shadow-[0_4px_20px_rgba(162,28,175,0.25)]">
                {startInterview.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Initializing...</>
                  : <><Play className="w-4 h-4 mr-2" /> Start Session</>}
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Sessions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="font-display text-sm font-bold text-slate-700 tracking-wider uppercase">Simulation Logs</h2>
            {interviews && interviews.length > 0 && (
              <span className="text-xs text-slate-300 font-mono">{interviews.length} session{interviews.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-2xl shimmer-bg" />)}
            </div>
          ) : interviews?.length === 0 ? (
            <div className="neu-card p-16 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-fuchsia-300" />
              </div>
              <p className="text-slate-400 text-sm">No simulations yet.</p>
              <p className="text-slate-300 text-xs mt-1">Configure a role and hit Start.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {interviews?.map((session, i) => (
                <motion.div key={session.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setLocation(`/interview/${session.id}`)}
                  className="neu-card p-5 cursor-pointer flex flex-col h-full group
                    hover:border-fuchsia-300 transition-all duration-300
                    hover:shadow-[0_4px_20px_rgba(162,28,175,0.12)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider border ${
                      session.status === "active"
                        ? "text-fuchsia-600 border-fuchsia-300 bg-fuchsia-50 animate-pulse"
                        : "text-slate-400 border-slate-200 bg-slate-50"
                    }`}>
                      {session.status}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] capitalize border ${DIFFICULTY_COLORS[session.difficulty] ?? ""}`}>
                      {session.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-display font-bold text-sm text-slate-800 group-hover:text-fuchsia-600 transition-colors mb-1 leading-snug flex-1">
                    {session.role}
                  </h3>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                    {typeof session.overallScore === "number" ? (
                      <p className="text-xs text-amber-500 font-display font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {session.overallScore}/10
                      </p>
                    ) : (
                      <p className="text-[10px] text-fuchsia-400 opacity-0 group-hover:opacity-100 font-display font-bold
                        transition-all duration-200 flex items-center gap-1">
                        Enter Log <Target className="w-3 h-3" />
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
