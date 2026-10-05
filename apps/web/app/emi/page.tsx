import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { HomeEMI } from '../HomeEMI';
export const metadata = { title: 'Home Loan EMI Calculator' };
export default function EmiPage() { return (<><Nav /><HomeEMI /><Footer /></>); }
