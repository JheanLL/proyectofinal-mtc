import { INITIAL_ESTACIONES } from '@/lib/db/initial-data';
import ClimaClientView from '@/components/weather/ClimaClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ClimaPage() {
  return (
    <ClimaClientView initialEstaciones={INITIAL_ESTACIONES} />
  );
}
