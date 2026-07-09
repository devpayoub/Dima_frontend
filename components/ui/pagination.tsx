import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("flex flex-row items-center gap-1", className)} {...props} />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      className={cn(
        Button({ variant: isActive ? "outline" : "ghost", size }),
        "cursor-pointer h-9 w-9 text-xs",
        isActive && "pointer-events-none font-bold",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, text = "Previous", ...props }: React.ComponentProps<"a"> & { text?: string }) {
  return (
    <a
      aria-label="Go to previous page"
      className={cn(Button({ variant: "ghost", size: "default" }), "cursor-pointer gap-1 pl-2.5 h-9", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:block text-xs">{text}</span>
    </a>
  )
}

function PaginationNext({ className, text = "Next", ...props }: React.ComponentProps<"a"> & { text?: string }) {
  return (
    <a
      aria-label="Go to next page"
      className={cn(Button({ variant: "ghost", size: "default" }), "cursor-pointer gap-1 pr-2.5 h-9", className)}
      {...props}
    >
      <span className="hidden sm:block text-xs">{text}</span>
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

function getVisiblePages(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | "...")[] = [1]
  if (currentPage > 3) pages.push("...")
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (currentPage < totalPages - 2) pages.push("...")
  pages.push(totalPages)
  return pages
}

interface PaginationBarProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

function PaginationBar({ currentPage, totalPages, totalItems, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {totalItems} item{totalItems !== 1 && "s"} total
        </p>
      </div>
    )
  }

  const pages = getVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        {totalItems} item{totalItems !== 1 && "s"} total
      </p>
      <Pagination className="mx-0 w-auto order-1 sm:order-2">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {pages.map((page, i) =>
            page === "..." ? (
              <PaginationItem key={`dots-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={(e) => { e.preventDefault(); onPageChange(page); }}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationBar,
}
