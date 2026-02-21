import { useLocalSearchParams } from 'expo-router';
import MainScreen from '../src/screens/MainScreen';
import type { RunMode } from '../src/types/course';

export default function MapScreen() {
  const { runMode } = useLocalSearchParams<{ runMode?: string }>();
  const mode: RunMode = runMode === 'oneWay' ? 'oneWay' : 'roundTrip';
  return <MainScreen runMode={mode} />;
}
