import React from 'react';
import LandingHero from './LandingHero';
import ImageSlider from './ImageSlider';
import AppVideoDemo from './AppVideoDemo';
import FeaturesOverview from './FeaturesOverview';
import CurriculumExplorer from './CurriculumExplorer';
import LandingFooter from './LandingFooter';
import './LandingPage.css';

/**
 * LandingPage Component
 * Main landing page for Tenali introducing the platform, showcasing key features,
 * sliding carousel, interactive demo, curriculum explorer, and footer.
 */
export default function LandingPage({
  onExplorePuzzles = () => {},
  onSelectTopic = () => {},
}) {
  return (
    <div className="landing-container">
      {/* Ambient background glow orbs */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="landing-glow-circle-1" />
        <div className="landing-glow-circle-2" />
        <div className="landing-glow-circle-3" />
      </div>

      {/* Hero Section */}
      <LandingHero onExplorePuzzles={onExplorePuzzles} />

      {/* Sliding Image Showcase Carousel */}
      <ImageSlider onSelectTopic={onSelectTopic} />

      {/* Video & Interactive Demo Showcase */}
      <AppVideoDemo onSelectTopic={onSelectTopic} />

      {/* Normalized Platform Capabilities */}
      <FeaturesOverview />

      {/* Curriculum Topic Domain Explorer */}
      <CurriculumExplorer
        onSelectTopic={onSelectTopic}
        onExplorePuzzles={onExplorePuzzles}
      />

      {/* Comprehensive Footer */}
      <LandingFooter
        onExplorePuzzles={onExplorePuzzles}
        onSelectTopic={onSelectTopic}
      />
    </div>
  );
}
