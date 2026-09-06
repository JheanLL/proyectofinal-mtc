import { INITIAL_ESTACIONES, INITIAL_PRONOSTICOS_CLIMA } from '@/lib/db/initial-data';
import ClimaClientView from '@/components/weather/ClimaClientView';

export const dynamic = 'force-dynamic';

export default function ClimaPage() {
  return (
    <ClimaClientView 
      initialEstaciones={INITIAL_ESTACIONES} 
      initialClimas={INITIAL_PRONOSTICOS_CLIMA}
    />
  );
}
