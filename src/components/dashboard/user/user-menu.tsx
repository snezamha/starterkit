"use client";

import { ChevronsUpDownIcon, LogOutIcon, UserPenIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { EditProfileDialog } from "@/components/dashboard/user/edit-profile-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import type { SessionUser } from "@/lib/auth/types";

type Props = {
  user: SessionUser;
};

function initials(name: string, email: string) {
  const source = name.trim() || email;

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function UserMenu({ user }: Props) {
  const t = useTranslations("common.auth");
  const locale = useLocale();
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEditProfile() {
    setOpen(false);
    setEditOpen(true);
  }

  function handleSignOut() {
    setOpen(false);
    startTransition(async () => {
      await authClient.signOut();
      router.replace(`/${locale}/auth`);
    });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name} />
              ) : null}
              <AvatarFallback className="rounded-lg text-xs">
                {initials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-60"
            align="end"
            side={isMobile ? "bottom" : "right"}
          >
            <div className="flex flex-col gap-1 px-2 py-1.5">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
            <DropdownMenuItem onClick={handleEditProfile}>
              <UserPenIcon className="size-4" />
              {t("editProfile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isPending} onClick={handleSignOut}>
              <LogOutIcon className="size-4" />
              {t("signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <EditProfileDialog
        user={user}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </SidebarMenu>
  );
}
