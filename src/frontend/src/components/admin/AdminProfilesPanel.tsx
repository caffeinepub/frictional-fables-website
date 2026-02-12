import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useGetAllUserProfilesForAdmin } from '../../hooks/useQueries';
import UserAvatar from '../UserAvatar';
import { Loader2, Search, User, Mail, Shield, AlertCircle, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { UserProfile } from '../../backend';

export default function AdminProfilesPanel() {
  const { data: profiles, isLoading, error } = useGetAllUserProfilesForAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<[Principal, UserProfile] | null>(null);

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    if (!profiles) return [];
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter(([principal, profile]) => {
      const principalStr = principal.toString().toLowerCase();
      const name = profile.name.toLowerCase();
      const email = profile.email.toLowerCase();
      const gender = profile.gender?.toLowerCase() || '';
      
      return (
        principalStr.includes(query) ||
        name.includes(query) ||
        email.includes(query) ||
        gender.includes(query)
      );
    });
  }, [profiles, searchQuery]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error && error.message.includes('Unauthorized')
                ? 'Access denied. Only admins can view user profiles.'
                : 'Failed to load user profiles. Please try again.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Profiles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profiles ({filteredProfiles.length})
          </CardTitle>
          <CardDescription>
            View all registered user profiles and their details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Profiles</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, or principal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Profiles List */}
          <ScrollArea className="h-[500px] pr-4">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {profiles && profiles.length === 0 ? (
                  <p>No user profiles found</p>
                ) : (
                  <p>No profiles match your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProfiles.map(([principal, profile]) => (
                  <button
                    key={principal.toString()}
                    onClick={() => setSelectedProfile([principal, profile])}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedProfile?.[0].toString() === principal.toString()
                        ? 'bg-primary/5 border-primary'
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={profile.name}
                        profilePicture={profile.profilePicture}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Details
          </CardTitle>
          <CardDescription>
            {selectedProfile ? 'Detailed information about the selected user' : 'Select a profile to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProfile ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <UserAvatar
                    name={selectedProfile[1].name}
                    profilePicture={selectedProfile[1].profilePicture}
                    size="lg"
                    className="w-24 h-24 text-2xl"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProfile[1].name}</h3>
                    <p className="text-sm text-muted-foreground break-all mt-1">
                      {selectedProfile[0].toString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Profile Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm font-medium break-all">{selectedProfile[1].email}</p>
                  </div>

                  {selectedProfile[1].gender && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Gender
                      </Label>
                      <p className="text-sm font-medium">{selectedProfile[1].gender}</p>
                    </div>
                  )}

                  {selectedProfile[1].bestReads && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        Best Reads
                      </Label>
                      <p className="text-sm font-medium">{selectedProfile[1].bestReads}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      {selectedProfile[1].welcomeMessageShown ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-600" />
                      )}
                      Welcome Message Status
                    </Label>
                    <p className="text-sm font-medium">
                      {selectedProfile[1].welcomeMessageShown ? 'Shown' : 'Not shown yet'}
                    </p>
                  </div>

                  {selectedProfile[1].profilePicture && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Profile Picture</Label>
                      <div className="rounded-lg border overflow-hidden">
                        <img
                          src={selectedProfile[1].profilePicture.getDirectURL()}
                          alt={`${selectedProfile[1].name}'s profile`}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <User className="h-12 w-12 mb-4 opacity-50" />
              <p>Select a profile from the list to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
