import { createContext, useContext } from "react"
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface TabsContextValue {
  readonly value: string
  readonly onValueChange: (nextValue: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within Tabs")
  }
  return context
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: string
  readonly onValueChange: (nextValue: string) => void
  readonly children: ReactNode
}

function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div data-slot="tabs" className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="tabs-list"
      role="tablist"
      className={cn(
        "inline-flex items-center rounded-lg border border-border/20 bg-muted/60 p-1",
        className,
      )}
      {...props}
    />
  )
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly value: string
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext()
  const isActive = activeValue === value
  const { onClick, onKeyDown, ...restProps } = props

  return (
    <button
      data-slot="tabs-trigger"
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-background text-primary shadow-sm"
          : "text-foreground/70 hover:bg-background/70 hover:text-foreground",
        className,
      )}
      onClick={(event) => {
        onValueChange(value)
        onClick?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return

        const tabList = event.currentTarget.closest('[role="tablist"]')
        if (!tabList) return
        const triggers = Array.from(
          tabList.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
        )
        if (triggers.length === 0) return
        const currentIndex = triggers.indexOf(event.currentTarget)
        if (currentIndex < 0) return

        const step = event.key === "ArrowRight" ? 1 : -1
        const nextIndex = (currentIndex + step + triggers.length) % triggers.length
        const nextTrigger = triggers[nextIndex]
        nextTrigger.focus()
        nextTrigger.click()
        event.preventDefault()
      }}
      {...restProps}
    >
      {children}
    </button>
  )
}

export { Tabs, TabsList, TabsTrigger }
