import { redirect } from 'next/navigation';

// The New Projects navigation intentionally opens the Hiranandani-only
// project directory, per the GoNest launch scope. Other developers' project
// references remain excluded from this tab until the launch scope changes.
export default function BuildersPage() {
  redirect('/homes');
}
