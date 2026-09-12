"use client"

import { Button } from "@/components/ui/button"

interface FixedSaveButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label?: string
}

export function FixedSaveButton({
  onClick,
  disabled = false,
  loading = false,
  label = "保存",
}: FixedSaveButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        size="lg"
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? "保存中..." : label}
      </Button>
    </div>
  )
}
