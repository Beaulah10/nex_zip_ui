## React Query Setup

```
import { queryClient } from "../../api-client/query-client";

await queryClient.ensureQueryData({
  queryKey: ["example"],
  queryFn: async () => ({ ok: true }),
});
```

Used to share a single React Query client across the app.

---

## Button Component (ShadCN Based)

```
import { Button } from "@repo/ui/components/button";
```

Reusable button component from shared UI library for consistent UI design.

---

**Primary Button**
```
<Button>Primary Button</Button>
```
Default button used for main actions.

---

**Secondary Button**
```
<Button variant="secondary">
  Secondary Button
</Button>
```
Used for secondary or less important actions.

---

## Description

- React Query client is shared through the app-level providers.
- Button component is built using ShadCN and Tailwind CSS.
- Always use shared components and utilities for consistency across apps.
