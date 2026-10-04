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
import { Platform, LegalModalType, AnalysisResponse } from './types';
import { analyzePost } from './utils/instagramExtractor';

export default function App() {
  const [url, setUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : url).trim();

    if (!targetUrl) {
      setErrorMessage('Please enter an Instagram or Threads URL to analyze.');
      setAnalysisData(null);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let result: AnalysisResponse | null = null;

      // Attempt 1: Call /api/analyze endpoint (supported in Express and Cloudflare Pages Functions)
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (response.ok) {
          result = await response.json();
        }
      } catch {
        // Network / static deployment fallback
      }

      // Attempt 2: Direct client-side extractor fallback if /api/analyze is unavailable
      if (!result) {
        result = await analyzePost(targetUrl);
      }

      if (result && result.success) {
        setAnalysisData(result);
        setErrorMessage(null);
        if (result.platform === 'instagram' || result.platform === 'threads') {
          setSelectedPlatform(result.platform);
        }
      } else {
        setAnalysisData(null);
        setErrorMessage(
          result?.error ||
            'Unable to analyze post. The post may be private, restricted, deleted, or from an unsupported domain.'
        );
      }
    } catch (err: any) {
      setAnalysisData(null);
      setErrorMessage(
        err?.message || 'An unexpected error occurred while analyzing the URL. Please verify your connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setAnalysisData(null);
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
      {/* 2. Top Navigation */}
      <Navbar
        currentPlatform={selectedPlatform}
        onSelectPlatform={setSelectedPlatform}
        onOpenLegalModal={setActiveLegalModal}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero & URL Input */}
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
          analysisData={analysisData}
          isLoading={isAnalyzing}
          onReset={handleReset}
          onOpenLegalModal={setActiveLegalModal}
        />

        {/* 5. Key Features */}
        <FeaturesSection />

        {/* 6. How It Works */}
        <HowItWorksSection onScrollToInput={scrollToInput} />

        {/* 8. Copyright Advisory */}
        <CopyrightBanner onOpenLegalModal={setActiveLegalModal} />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* 7. Footer */}
      <Footer
        onSelectPlatform={setSelectedPlatform}
        onOpenLegalModal={setActiveLegalModal}
      />

      {/* Interactive Legal Modals */}
      <LegalModal
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        onSelectModal={setActiveLegalModal}
      />
    </div>
  );
}
