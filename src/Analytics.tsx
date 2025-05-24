// components/Analytics.tsx
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { UserAnalytics } from "./UserAnalytics"; // Optional: move this out too

export function Analytics({ profile }: { profile: any }) {
  const users = useQuery(api.users.getAllUsers);

  return (
    <div>
      <div className="space-y-6">
        {users?.map((user) => <UserAnalytics key={user._id} user={user} />)}
      </div>
    </div>
  );
}
