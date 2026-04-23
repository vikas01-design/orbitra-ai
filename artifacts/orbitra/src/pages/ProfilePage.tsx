import { useGetProfile, useUpdateProfile } from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { useForm } from "react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, User } from "lucide-react";
import { queryClient } from "@/main";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setTargetRole(profile.targetRole || "");
      setBio(profile.bio || "");
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
    }
  }, [profile]);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !newSkill.trim()) return;
    e.preventDefault();
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !newInterest.trim()) return;
    e.preventDefault();
    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
    }
    setNewInterest("");
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleSave = () => {
    updateProfile.mutate(
      { data: { name, targetRole, bio, skills, interests } },
      {
        onSuccess: () => {
          toast.success("Profile updated", { description: "Your agent crew has been notified of the changes." });
        },
        onError: () => {
          toast.error("Failed to update profile");
        }
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
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role</Label>
            <Input id="targetRole" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="bg-background/50 border-white/10 focus-visible:ring-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea 
            id="bio" 
            value={bio} 
            onChange={e => setBio(e.target.value)} 
            placeholder="A brief overview of your background and career goals..."
            className="h-32 resize-none bg-background/50 border-white/10 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-4">
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(skill => (
              <Badge key={skill} variant="secondary" className="px-3 py-1 gap-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">
                {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newSkill} 
              onChange={e => setNewSkill(e.target.value)} 
              onKeyDown={handleAddSkill}
              placeholder="Add a skill (e.g. React, Python) and press Enter" 
              className="bg-background/50 border-white/10 focus-visible:ring-primary"
            />
            <Button variant="outline" onClick={handleAddSkill} type="button"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Interests / Industries</Label>
          <div className="flex flex-wrap gap-2 mb-3">
            {interests.map(interest => (
              <Badge key={interest} variant="secondary" className="px-3 py-1 gap-1 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/20">
                {interest}
                <button onClick={() => handleRemoveInterest(interest)} className="ml-1 hover:text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newInterest} 
              onChange={e => setNewInterest(e.target.value)} 
              onKeyDown={handleAddInterest}
              placeholder="Add an interest (e.g. FinTech, AI, Open Source)" 
              className="bg-background/50 border-white/10 focus-visible:ring-secondary"
            />
            <Button variant="outline" onClick={handleAddInterest} type="button"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
