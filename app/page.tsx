import LandingPage from '@/components/Home/LandingPage';

// Cache homepage for 5 minutes (ISR) for instant rendering
export const revalidate = 300;

export default async function Home() {
  return <LandingPage />;
}