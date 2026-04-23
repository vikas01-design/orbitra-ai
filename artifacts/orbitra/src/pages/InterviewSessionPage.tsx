import { useGetInterview, useAnswerInterview, getGetInterviewQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bot, User, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data: session, isLoading } = useGetInterview(sessionId);
  const answerInterview = useAnswerInterview();
  
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.turns.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    answerInterview.mutate(
      { id: sessionId, data: { answer } },
      {
        onSuccess: (updatedSession) => {
          queryClient.setQueryData(getGetInterviewQueryKey(sessionId), updatedSession);
          setAnswer("");
        },
        onError: () => {
          toast.error("Failed to submit answer");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6 h-[calc(100vh-64px)] flex flex-col">
        <Skeleton className="h-10 w-48 mb-4" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-24 w-3/4 rounded-2xl" />
          <Skeleton className="h-16 w-1/2 rounded-2xl ml-auto" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (!session) {
    return <div className="container mx-auto p-8 text-center text-muted-foreground">Session not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl h-[calc(100vh-64px)] flex flex-col relative">
      <div className="flex items-center justify-between shrink-0 mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/interview">
            <Button variant="ghost" size="icon" className="hover:bg-white/5 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">{session.role}</h1>
            <p className="text-xs text-muted-foreground capitalize">{session.difficulty} Difficulty</p>
          </div>
        </div>
        <Badge variant="outline" className={
          session.status === 'active' 
            ? 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10'
            : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
        }>
          {session.status.toUpperCase()}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar pb-4">
        <AnimatePresence initial={false}>
          {session.turns.map((turn, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Agent Question */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-fuchsia-400" />
                </div>
                <div className="glass-card bg-fuchsia-500/5 border-white/5 p-4 rounded-2xl rounded-tl-none max-w-[85%] text-sm md:text-base leading-relaxed">
                  {turn.question}
                </div>
              </div>

              {/* User Answer */}
              {turn.userAnswer && (
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-cyan-900/40 border border-cyan-500/20 p-4 rounded-2xl rounded-tr-none max-w-[85%] text-sm md:text-base leading-relaxed text-cyan-50">
                    {turn.userAnswer}
                  </div>
                </div>
              )}

              {/* Agent Feedback Bubble */}
              {turn.feedback && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-4 justify-center"
                >
                  <div className="glass-card bg-background/80 border-white/10 p-3 rounded-xl max-w-[70%] text-xs text-muted-foreground flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><span className="font-display text-white">Feedback:</span> {turn.feedback}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {/* Typing Indicator for pending mutation */}
          {answerInterview.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="glass-card bg-fuchsia-500/5 border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {session.status === 'active' && (
        <div className="shrink-0 pt-4 mt-2">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="resize-none h-24 pr-16 bg-background/50 border-white/10 focus-visible:ring-fuchsia-400 rounded-2xl"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={answerInterview.isPending || !answer.trim()}
              className="absolute right-3 bottom-3 rounded-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white h-10 w-10"
            >
              <Send className="w-4 h-4 -ml-0.5 mt-0.5" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-2 font-display">Press Enter to send, Shift+Enter for new line</p>
        </div>
      )}
      
      {session.status === 'completed' && (
        <div className="shrink-0 pt-4 mt-2 text-center p-4 glass-card rounded-2xl border-white/5">
          <AlertCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="font-display font-bold text-white">Simulation Complete</h3>
          <p className="text-sm text-muted-foreground">The agent has concluded the interview.</p>
        </div>
      )}
    </div>
  );
}
