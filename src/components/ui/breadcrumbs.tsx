'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useUser } from '@/firebase';
import { UserRole } from '@/types';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.role as UserRole | undefined;

  // Don't render breadcrumbs if we don't have a role yet or if it's the base dashboard path
  if (!role || pathname === `/dashboard/${role}`) {
    return (
        <nav aria-label="Breadcrumb" className="hidden md:flex">
         <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
                <div className="flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    <span className="font-medium text-foreground">Dashboard</span>
                </div>
            </li>
         </ol>
        </nav>
    );
  }

  const pathSegments = pathname.split('/').filter(segment => segment);
  
  // Find the index of the role in the path to start breadcrumbs from there
  const roleIndex = pathSegments.findIndex(segment => segment === role);

  const breadcrumbs = pathSegments.slice(roleIndex + 1).map((segment, index) => {
    const href = '/' + pathSegments.slice(0, roleIndex + index + 2).join('/');
    const isLast = index === pathSegments.length - (roleIndex + 1) - 1;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return { href, name, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link href={`/dashboard/${role}`} className="flex items-center gap-1.5 hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {breadcrumbs.length > 0 && (
            <li>
                <ChevronRight className="h-4 w-4" />
            </li>
        )}
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.href}>
            <li>
              <Link
                href={breadcrumb.href}
                aria-current={breadcrumb.isLast ? 'page' : undefined}
                className={
                  breadcrumb.isLast
                    ? 'font-medium text-foreground'
                    : 'hover:text-foreground'
                }
              >
                {breadcrumb.name}
              </Link>
            </li>
            {!breadcrumb.isLast && (
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
