import Link from "next/link";
import { UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function DoctorNotFound() {
  return (
    <EmptyState
      icon={UserX}
      title="Doctor not found"
      description="This doctor may have been removed or the link is incorrect."
      action={
        <Button asChild variant="outline">
          <Link href="/doctors">Back to doctors</Link>
        </Button>
      }
    />
  );
}
