import { redirect } from 'next/navigation';

export default function SettingsRedirectPage() {
  // Redirect to the default fees settings page
  redirect('/dashboard/admin/settings/fees');
}
