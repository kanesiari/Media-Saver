/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { MediaPreviewSection } from './components/MediaPreviewSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CopyrightBanner } from './components/CopyrightBanner';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { Platform, ParsedUrlData, LegalModalType } from './types';
import { parseSocialUrl } from './utils/urlParser';

export default function App() {
  const [url, setUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedUrlData | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  const handleAnalyze = (overrideUrl?: string) => {
    const targetUrl = overrideUrl !== undefined ? overrideUrl : url;

    if (!targetUrl.trim()) {
      setErrorMessage('Please enter an Instagram or Threads URL to analyze.');
      setParsedData(null);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    // Brief simulation for realistic analysis feedback
    setTimeout(() => {
      const result = parseSocialUrl(targetUrl);
      setIsAnalyzing(false);

      if (result.isValid) {
        setParsedData(result);
        setErrorMessage(null);
        if (result.platform === 'instagram' || result.platform === 'threads') {
          setSelectedPlatform(result.platform);
        }
      } else {
        setParsedData(null);
        setErrorMessage(
          result.errorMessage || 'Please enter a valid public Instagram or Threads post link.'
        );
      }
    }, 350);
  };

  const handleReset = () => {
    setUrl('');
    setParsedData(null);
    setErrorMessage(null);
  };

  const scrollToInput = () => {
    const el = document.getElementById('media-input-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* 2. Top Menu / Navbar */}
      <Navbar
        currentPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        onOpenLegalModal={setActiveLegalModal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero & URL Input Section */}
        <HeroInput
          url={url}
          setUrl={setUrl}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          errorMessage={errorMessage}
        />

        {/* 4. Media Preview Area */}
        <MediaPreviewSection
          parsedData={parsedData}
          onReset={handleReset}
          onOpenLegalModal={setActiveLegalModal}
        />

        {/* 5. Key Features (3 cards) */}
        <FeaturesSection />

        {/* 6. How It Works (3 steps) */}
        <HowItWorksSection onScrollToInput={scrollToInput} />

        {/* 8. Copyright Notice Callout */}
        <CopyrightBanner onOpenLegalModal={setActiveLegalModal} />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* 7. Footer Area */}
      <Footer
        onSelectPlatform={setSelectedPlatform}
        onOpenLegalModal={setActiveLegalModal}
      />

      {/* Interactive Legal Modals (Terms of Service, Privacy Policy, Copyright Notice) */}
      <LegalModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        onSelectModal={setActiveLegalModal}
      />
    </div>
  );
}
