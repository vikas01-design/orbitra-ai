import { useGetProfile, useUpdateProfile, getGetProfileQueryKey, getGetDashboardSummaryQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, User, Check } from "lucide-react";
import { AVATARS, getAvatarUrl } from "@/lib/avatars";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [bio, setBio] = useState("");
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setTargetRole(profile.targetRole || "");
      setAvatarId(profile.avatarId || null);
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
    }
  }, [profile]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") || !newSkill.trim()) return;
    e.preventDefault();
    if (!skills.includes(newSkill.trim())) setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleRemoveSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === "keydown" && (e as React.KeyboardEvent).key !== "Enter") || !newInterest.trim()) return;
    e.preventDefault();
    if (!interests.includes(newInterest.trim())) setInterests([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const handleRemoveInterest = (i: string) => setInterests(interests.filter((x) => x !== i));

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter your name before saving.");
      return;
    }
    updateProfile.mutate(
      { data: { name: name.trim(), targetRole: targetRole.trim() || null, avatarId, skills, interests } },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() }),
            queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() }),
          ]);
          toast.success("Profile updated", { description: "Your agent crew has been notified of the changes." });
        },
        onError: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to update profile";
          toast.error(message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="glass-card p-8 rounded-2xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const currentAvatarUrl = getAvatarUrl(avatarId, name || profile?.email);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <User className="text-primary w-8 h-8" /> Pilot Profile
          </h1>
          <p className="text-muted-foreground mt-1">Provide context for your AI agents.</p>
        </div>
        <Button onClick={handleSave} disabled={updateProfile.isPending} className="font-display">
          {updateProfile.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
        </Button>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border-white/5 space-y-8">
        <div className="flex items-center gap-5">
          <img
            src={currentAvatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-primary/40 bg-background/50 shadow-[0_0_25px_rgba(34,211,238,0.25)]"
          />
          <div>
            <p className="text-2xl font-display font-bold text-white">{name || "Unnamed Explorer"}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {targetRole && <p className="text-xs text-primary mt-1">Targeting: {targetRole}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Choose Avatar</Label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {AVATARS.map((a) => {
              const selected = a.id === avatarId;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatarId(a.id)}
                  title={a.label}
                  className={`relative rounded-full p-1 transition-all ${
                    selected
                      ? "ring-2 ring-primary shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                      : "ring-1 ring-white/10 hover:ring-white/30"
                  }`}
                >
                  <img src={a.url} alt={a.label} className="w-full aspect-square rounded-full bg-background/40" />
                  {selected && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input id="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief overview of your background and career goals..."
            className="h-32 resize-none bg-background/50 border-white/10 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 gap-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleAddSkill} placeholder="Add a skill (e.g. React, Python) and press Enter" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
            <Button variant="outline" onClick={handleAddSkill} type="button"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Interests / Industries</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary" className="px-3 py-1 gap-1 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/20">
                {interest}
                <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={handleAddInterest} placeholder="Add an interest (e.g. FinTech, AI, Open Source)" className="bg-background/50 border-white/10 focus-visible:ring-secondary" />
            <Button variant="outline" onClick={handleAddInterest} type="button"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
