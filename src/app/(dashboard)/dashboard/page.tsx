"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Users,
  Calendar,
  TrendingUp,
  Camera,
  Star,
  ArrowRight,
  Plus,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { getUserProjects } from "~/actions/projects";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string | null;
  imageUrl: string;
  imageKitId: string;
  filePath: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  totalProjects: number;
  thisMonth: number;
  thisWeek: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    thisMonth: 0,
    thisWeek: 0,
  });
  const [user, setUser] = useState<{
    name?: string;
    createdAt?: string | Date;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
        }

        // Fetch user projects
        const projectsResult = await getUserProjects();
        if (projectsResult.success && projectsResult.projects) {
          const projects = projectsResult.projects;
          setUserProjects(projects);

          // Calculate stats
          const now = new Date();
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          setUserStats({
            totalProjects: projects.length,
            thisMonth: projects.filter(
              (p) => new Date(p.createdAt) >= thisMonth,
            ).length,
            thisWeek: projects.filter((p) => new Date(p.createdAt) >= thisWeek)
              .length,
          });
        }
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Here&apos;s an overview of your AI image editing workspace
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <ImageIcon className="text-primary h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-primary text-2xl font-bold">
                  {userStats.totalProjects}
                </div>
                <p className="text-muted-foreground text-xs">
                  All your creations
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.thisMonth}
                </div>
                <p className="text-muted-foreground text-xs">Projects</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {userStats.thisWeek}
                </div>
                <p className="text-muted-foreground text-xs">New projects</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Membership
                </CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">Free</div>
                <p className="text-muted-foreground text-xs">10 credits left</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Quick Actions
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                onClick={() => router.push("/dashboard/editor")}
                className="h-auto flex-col items-start gap-2 p-6 text-left"
              >
                <Camera className="h-6 w-6" />
                <div>
                  <div className="font-semibold">New Project</div>
                  <div className="text-xs">Start a new editing session</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/library")}
                className="h-auto flex-col items-start gap-2 p-6 text-left"
              >
                <Sparkles className="h-6 w-6" />
                <div>
                  <div className="font-semibold">View Library</div>
                  <div className="text-xs">Browse your recent projects</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/gallery")}
                className="h-auto flex-col items-start gap-2 p-6 text-left"
              >
                <Users className="h-6 w-6" />
                <div>
                  <div className="font-semibold">Gallery</div>
                  <div className="text-xs">View community creations</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                Recent Projects
              </h2>
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/projects")}
                className="text-sm"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {userProjects.length === 0 ? (
              <Card className="border-2 border-dashed p-12 text-center">
                <div className="space-y-4">
                  <ImageIcon className="text-muted-foreground mx-auto h-12 w-12" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800">
                      No projects yet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Start by creating a new project to begin editing images
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/dashboard/editor")}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userProjects.slice(0, 6).map((project) => (
                  <Card
                    key={project.id}
                    className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
                    onClick={() =>
                      router.push(`/dashboard/editor?project=${project.id}`)
                    }
                  >
                    <div className="relative aspect-square bg-slate-100">
                      {/* Placeholder for image - replace with ImageKit Image component when needed */}
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <Camera className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                          <p className="text-muted-foreground text-xs">
                            {project.name ?? "Untitled"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="truncate font-semibold text-slate-800">
                        {project.name ?? "Untitled Project"}
                      </h3>
                      <p className="text-muted-foreground truncate text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
