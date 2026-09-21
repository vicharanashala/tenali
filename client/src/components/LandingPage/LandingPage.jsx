import React from 'react';
import LandingNavbar from './LandingNavbar';
import LandingHero from './LandingHero';
import ImageSlider from './ImageSlider';
import AppVideoDemo from './AppVideoDemo';
import FeaturesOverview from './FeaturesOverview';
import WorkflowSection from './WorkflowSection';
import CurriculumExplorer from './CurriculumExplorer';
import LandingFooter from './LandingFooter';
import './LandingPage.css';

/**
 * LandingPage Component
 * Main landing page for Tenali introducing the platform, showcasing key features,
 * sliding carousel, video/animated demo, curriculum explorer, and navigation to puzzles.
 */
export default function LandingPage({
  onExplorePuzzles = () => {},
  onSelectTopic = () => {},
  currentView = 'landing',
  onViewChange = () => {},
  theme = 'dark',
  toggleTheme = () => {},
}) {
  return (
    <div className="landing-container">
      {/* Ambient background glow orbs */}
      <div className="landing-ambient-bg" aria-hidden="true">
        <div className="landing-glow-circle-1" />
        <div className="landing-glow-circle-2" />
        <div className="landing-glow-circle-3" />
      </div>

      {/* Sticky Navigation Bar */}
      <LandingNavbar
        currentView={currentView}
        onViewChange={onViewChange}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Hero Section */}
      <LandingHero onExplorePuzzles={onExplorePuzzles} />

      {/* Sliding Image Showcase Carousel */}
      <ImageSlider onSelectTopic={onSelectTopic} />

      {/* Video & Interactive Demo Showcase */}
      <AppVideoDemo onSelectTopic={onSelectTopic} />

      {/* 6 Core Pedagogical Features */}
      <FeaturesOverview />

      {/* Four-Stage Learner Workflow */}
      <WorkflowSection onExplorePuzzles={onExplorePuzzles} />

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
