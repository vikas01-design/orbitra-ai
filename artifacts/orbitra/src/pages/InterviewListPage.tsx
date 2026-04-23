import { useListInterviews, useStartInterview, getListInterviewsQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Video, Play, Clock, Target } from "lucide-react";
import { toast } from "sonner";

export default function InterviewListPage() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { data: interviews, isLoading } = useListInterviews();
  const startInterview = useStartInterview();
  
  const [role, setRole] = useState("");
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
        onError: () => {
          toast.error("Failed to start simulation");
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Video className="text-fuchsia-400 w-8 h-8" /> AI Interviewer
          </h1>
          <p className="text-muted-foreground mt-1">High-pressure simulation environments to prep for the real thing.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Setup Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border-fuchsia-500/20 bg-fuchsia-500/5 relative overflow-hidden sticky top-24">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />
            <h2 className="font-display font-bold text-xl mb-6 relative z-10">New Simulation</h2>
            
            <form onSubmit={handleStart} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-medium text-fuchsia-200">Target Role</label>
                <Input 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer" 
                  className="bg-background/80 border-white/10 focus-visible:ring-fuchsia-400"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-fuchsia-200">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-background/80 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy (Conversational)</SelectItem>
                    <SelectItem value="medium">Medium (Technical Deep Dive)</SelectItem>
                    <SelectItem value="hard">Hard (Stress Test)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                disabled={startInterview.isPending || !role.trim()} 
                className="w-full font-display bg-fuchsia-500 hover:bg-fuchsia-600 text-white mt-6 h-12 shadow-[0_0_20px_rgba(217,70,239,0.3)]"
              >
                {startInterview.isPending ? "Initializing..." : <><Play className="w-4 h-4 mr-2" /> Start Session</>}
              </Button>
            </form>
          </div>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-display text-xl font-bold border-b border-white/5 pb-4">Simulation Logs</h2>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : interviews?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-white/5 border-dashed rounded-2xl bg-white/5">
              <Video className="w-12 h-12 mx-auto opacity-20 mb-4" />
              <p>No interview simulations run yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {interviews?.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setLocation(`/interview/${session.id}`)}
                  className="glass-card p-5 rounded-2xl border-white/5 hover:border-fuchsia-500/40 hover:shadow-[0_0_20px_rgba(217,70,239,0.1)] transition-all cursor-pointer flex flex-col h-full group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className={
                      session.status === 'active' 
                        ? 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10 animate-pulse'
                        : 'text-muted-foreground border-white/10 bg-white/5'
                    }>
                      {session.status.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/5 capitalize text-[10px]">{session.difficulty}</Badge>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg leading-tight mb-1 group-hover:text-fuchsia-300 transition-colors">{session.role}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 text-xs text-fuchsia-400/70 font-display font-bold flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter Log <Target className="w-3 h-3 ml-1" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
