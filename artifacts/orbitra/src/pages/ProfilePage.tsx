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
        <div className="neu-card p-8 rounded-2xl space-y-6">
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
          <h1 className="text-3xl font-display font-bold flex items-center gap-3 text-slate-800">
            <User className="text-cyan-600 w-8 h-8" /> Pilot Profile
          </h1>
          <p className="text-slate-500 mt-1">Provide context for your AI agents.</p>
        </div>
        <Button onClick={handleSave} disabled={updateProfile.isPending}
          className="font-display bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0 shadow-[0_4px_16px_rgba(34,211,238,0.25)]">
          {updateProfile.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
        </Button>
      </div>

      <div className="neu-card p-6 md:p-8 rounded-2xl space-y-8">
        <div className="flex items-center gap-5">
          <img
            src={currentAvatarUrl}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-cyan-300 shadow-[0_4px_20px_rgba(34,211,238,0.2)]"
          />
          <div>
            <p className="text-2xl font-display font-bold text-slate-800">{name || "Unnamed Explorer"}</p>
            <p className="text-sm text-slate-400">{profile?.email}</p>
            {targetRole && <p className="text-xs text-cyan-600 font-medium mt-1">Targeting: {targetRole}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-700 font-semibold">Choose Avatar</Label>
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
                      ? "ring-2 ring-cyan-500 shadow-[0_0_16px_rgba(34,211,238,0.4)]"
                      : "ring-1 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  <img src={a.url} alt={a.label} className="w-full aspect-square rounded-full bg-slate-100" />
                  {selected && (
                    <span className="absolute -top-1 -right-1 bg-cyan-500 text-white rounded-full p-0.5">
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
            <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-cyan-400/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRole" className="text-slate-700 font-semibold">Target Role</Label>
            <Input id="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-cyan-400/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-slate-700 font-semibold">Professional Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A brief overview of your background and career goals..."
            className="h-32 resize-none bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-cyan-400/50"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-slate-700 font-semibold">Skills</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary"
                className="px-3 py-1 gap-1 text-sm bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-cyan-900 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleAddSkill}
              placeholder="Add a skill (e.g. React, Python) and press Enter"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-cyan-400/50" />
            <Button variant="outline" onClick={handleAddSkill} type="button"
              className="border-slate-200 text-slate-500 hover:border-cyan-300 hover:text-cyan-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-slate-700 font-semibold">Interests / Industries</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map((interest) => (
              <Badge key={interest} variant="secondary"
                className="px-3 py-1 gap-1 text-sm bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100">
                {interest}
                <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-violet-900 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={handleAddInterest}
              placeholder="Add an interest (e.g. FinTech, AI, Open Source)"
              className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-violet-400/50" />
            <Button variant="outline" onClick={handleAddInterest} type="button"
              className="border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
