import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import WhyJusticeEye from "../components/WhyJusticeEye";
import Statistics from "../components/Statistics";
import CyberSafetyTips from "../components/CyberSafetyTips";
import FAQ from "../components/FAQ";

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Ensure this route is public in your backend
        const res = await fetch("/api/v1/incidents/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load live stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <Hero stats={stats} />
      <Features />
      <HowItWorks />
      <WhyJusticeEye />
      <Statistics />
      <CyberSafetyTips />
      <FAQ />
    </>
  );
};

export default Home;