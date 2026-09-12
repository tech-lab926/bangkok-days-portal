"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState, useRef } from "react"

type Permission = {
  role: string
  resource: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function usePermissions() {
  const { data: session } = useSession()
  const role = session?.user?.role || ""
  const customRole = (session?.user as any)?.customRole as string | null | undefined
  // Effective role: customRole (when set) overrides the enum role
  const effectiveRole = customRole || role

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loaded, setLoaded] = useState(false)
  // Track which effective role the permissions were loaded for
  const loadedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (!effectiveRole) return
    // SUPER_ADMIN bypasses all checks — no need to fetch
    if (effectiveRole === "SUPER_ADMIN") {
      setLoaded(true)
      return
    }
    // If already loaded for this exact role, skip
    if (loadedForRef.current === effectiveRole && loaded) return

    fetch("/api/v1/admin/permissions/me")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setPermissions(json.data)
          loadedForRef.current = effectiveRole
          setLoaded(true)
        }
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [effectiveRole])

  const can = (resource: string, action: "canView" | "canCreate" | "canEdit" | "canDelete"): boolean => {
    // SUPER_ADMIN always has full access
    if (effectiveRole === "SUPER_ADMIN") return true
    // While loading, default to false (don't flash restricted content)
    if (!loaded) return false
    const perm = permissions.find(p => p.role === effectiveRole && p.resource === resource)
    return perm ? perm[action] : false
  }

  return { can, role, effectiveRole, loaded }
}
