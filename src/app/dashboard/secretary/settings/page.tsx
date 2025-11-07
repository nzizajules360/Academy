import { FeesForm } from './fees/fees-form';
import { AcademicSettings } from './academic-settings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <FeesForm />
      <AcademicSettings />
    </div>
  );
}
