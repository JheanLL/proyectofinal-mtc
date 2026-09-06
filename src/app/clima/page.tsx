import { INITIAL_ESTACIONES } from '@/lib/db/initial-data';
import { fetchAllLiveWeathers } from '@/lib/weather';
import ClimaClientView from '@/components/weather/ClimaClientView';

export const dynamic = 'force-dynamic';

export default async function ClimaPage() {
  const liveClimas = await fetchAllLiveWeathers();

  return (
    <ClimaClientView 
      initialEstaciones={INITIAL_ESTACIONES} 
      initialClimas={liveClimas}
    />
  );
}
