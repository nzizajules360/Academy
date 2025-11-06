'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    return { href, name, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link href="/dashboard" className="flex items-center gap-1.5 hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.length > 1 && (
            <li>
                <ChevronRight className="h-4 w-4" />
            </li>
        )}
        {breadcrumbs.slice(1).map((breadcrumb, index) => (
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
