import { useGetInterview, useAnswerInterview, getGetInterviewQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bot, User, CheckCircle2, Mic, MicOff, Star, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  start: () => void; stop: () => void;
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const { data: session, isLoading } = useGetInterview(sessionId);
  const answerInterview = useAnswerInterview();

  const [answer, setAnswer]           = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => { setSpeechSupported(!!getRecognitionCtor()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [session?.turns?.length]);
  useEffect(() => () => { try { recognitionRef.current?.stop(); } catch {} }, []);

  const toggleListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) { toast.error("Speech recognition not supported"); return; }
    if (isListening) { try { recognitionRef.current?.stop(); } catch {} setIsListening(false); return; }
    const rec = new Ctor();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " "; else interim += t;
      }
      setAnswer(prev => {
        const base = prev.replace(/\s*\[…[^\]]*\]\s*$/, "");
        return (base + " " + finalText + (interim ? ` [… ${interim}]` : "")).trimStart();
      });
    };
    rec.onerror = (e: any) => { toast.error("Mic error", { description: e?.error }); setIsListening(false); };
    rec.onend   = () => { setIsListening(false); setAnswer(prev => prev.replace(/\s*\[…[^\]]*\]\s*$/, "").trim()); };
    recognitionRef.current = rec;
    try { rec.start(); setIsListening(true); } catch { toast.error("Could not start microphone"); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = answer.replace(/\s*\[…[^\]]*\]\s*$/, "").trim();
    if (!cleaned) return;
    if (isListening) { try { recognitionRef.current?.stop(); } catch {} setIsListening(false); }
    answerInterview.mutate(
      { id: sessionId, data: { answer: cleaned } },
      {
        onSuccess: (updated) => { queryClient.setQueryData(getGetInterviewQueryKey(sessionId), updated); setAnswer(""); },
        onError:   () => toast.error("Failed to submit answer"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100dvh-56px)] md:h-screen container mx-auto px-4 py-6 max-w-3xl gap-4">
        <div className="h-12 w-56 rounded-xl shimmer-bg" />
        <div className="flex-1 space-y-4">
          <div className="h-24 w-3/4 rounded-2xl shimmer-bg" />
          <div className="h-16 w-1/2 rounded-2xl ml-auto shimmer-bg" />
        </div>
        <div className="h-24 w-full rounded-2xl shimmer-bg" />
      </div>
    );
  }

  if (!session) return <div className="p-8 text-center text-slate-400">Session not found.</div>;

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] md:h-screen container mx-auto px-4 py-5 max-w-3xl">

      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0 mb-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/interview">
            <Button variant="ghost" size="icon"
              className="w-9 h-9 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-bold text-sm text-slate-800">{session.role}</h1>
            <p className="text-[11px] text-slate-400 capitalize">{session.difficulty} difficulty</p>
          </div>
        </div>
        <Badge variant="outline" className={
          session.status === "active"
            ? "text-fuchsia-600 border-fuchsia-300 bg-fuchsia-50 text-[10px] animate-pulse"
            : "text-emerald-600 border-emerald-300 bg-emerald-50 text-[10px]"
        }>
          {session.status.toUpperCase()}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-5 pb-4">
        <AnimatePresence initial={false}>
          {session.turns.map((turn, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

              {/* AI question */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-50 border border-fuchsia-200
                  flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-fuchsia-600" />
                </div>
                <div className="neu-card p-4 rounded-2xl rounded-tl-none max-w-[86%] text-sm leading-relaxed text-slate-700
                  bg-fuchsia-50/60 border-fuchsia-200">
                  {turn.question}
                </div>
              </div>

              {/* User answer */}
              {turn.answer && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200
                    flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="p-4 rounded-2xl rounded-tr-none max-w-[86%] text-sm leading-relaxed text-slate-700
                    bg-cyan-50 border border-cyan-200">
                    {turn.answer}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {turn.feedback && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-center">
                  <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-xl max-w-[72%]
                    bg-emerald-50 border border-emerald-200 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><span className="font-display text-slate-700 font-semibold mr-1">Feedback:</span>{turn.feedback}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* AI thinking */}
          {answerInterview.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-fuchsia-600" />
              </div>
              <div className="neu-card bg-fuchsia-50/60 border-fuchsia-200 px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * -0.12}s` }} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {session.status === "active" && (
        <div className="shrink-0 pt-3 mt-1">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder={isListening ? "Listening… speak your answer" : "Type your answer or tap the mic…"}
              rows={3}
              className="resize-none pr-28 bg-white border-slate-200
                focus-visible:ring-fuchsia-400/40 rounded-2xl text-slate-800 placeholder:text-slate-300 text-sm"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            />
            <Button type="button" size="icon" onClick={toggleListening}
              disabled={!speechSupported || answerInterview.isPending}
              className={`absolute right-[52px] bottom-3 w-9 h-9 rounded-xl transition-all ${
                isListening
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 border border-slate-200"
              }`}>
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button type="submit" size="icon"
              disabled={answerInterview.isPending || !answer.replace(/\s*\[…[^\]]*\]\s*$/, "").trim()}
              className="absolute right-3 bottom-3 w-9 h-9 rounded-xl
                bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 hover:from-fuchsia-400 hover:to-fuchsia-500
                text-white border-0 shadow-[0_4px_12px_rgba(162,28,175,0.3)]">
              {answerInterview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          <p className="text-[10px] text-center text-slate-300 mt-2 font-display">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}

      {/* Completed panel */}
      {session.status === "completed" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="shrink-0 mt-3 p-5 neu-card border-emerald-200 bg-emerald-50/60 space-y-3 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-100 blur-2xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-800">Simulation Complete</h3>
            </div>
            {typeof session.overallScore === "number" && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-display text-amber-600 text-xl font-black">
                  {session.overallScore}
                  <span className="text-amber-400 text-sm">/10</span>
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < (session.overallScore ?? 0) ? "text-amber-500 fill-amber-500" : "text-slate-200"}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {session.summary && (
            <p className="text-sm text-slate-600 leading-relaxed relative z-10">{session.summary}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
