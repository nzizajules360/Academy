"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Bell, AlertTriangle, CheckCircle2 } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
             <div className="flex items-start gap-4">
                {variant === 'success' && <CheckCircle2 className="h-6 w-6" />}
                {variant === 'destructive' && <AlertTriangle className="h-6 w-6" />}
                {variant === 'default' && <Bell className="h-6 w-6" />}
                <div className="grid gap-1">
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </div>
             </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}