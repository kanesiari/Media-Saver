/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { MediaPreviewSection } from './components/MediaPreviewSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CopyrightBanner } from './components/CopyrightBanner';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModal';
import { Platform, LegalModalType, AnalysisResponse, PageRoute } from './types';
import { SITE_URL } from './constants';
import { analyzePost } from './utils/instagramExtractor';

import { AboutPage } from './pages/AboutPage';
import { HowToUsePage } from './pages/HowToUsePage';
import { TroubleshootingPage } from './pages/TroubleshootingPage';
import { FaqPage } from './pages/FaqPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CopyrightPage } from './pages/CopyrightPage';
import { ContactPage } from './pages/ContactPage';

function getRouteFromPath(path: string): PageRoute {
  const cleanPath = path.replace(/\/+$/, '').toLowerCase();
  switch (cleanPath) {
    case '/about':
      return 'about';
    case '/how-to-use':
      return 'how-to-use';
    case '/troubleshooting':
      return 'troubleshooting';
    case '/faq':
      return 'faq';
    case '/terms':
      return 'terms';
    case '/privacy':
      return 'privacy';
    case '/copyright':
      return 'copyright';
    case '/contact':
      return 'contact';
    default:
      return 'home';
  }
}

const PAGE_TITLES: Record<PageRoute, string> = {
  home: 'MediaSave · Public Media Inspector for Instagram, Threads & TikTok',
  about: 'About MediaSave · Clean Public Media Inspector',
  'how-to-use': 'How to Use MediaSave · Guide for Instagram, Threads & TikTok',
  troubleshooting: 'Troubleshooting Guide · Resolving Media Analysis Issues',
  faq: 'Frequently Asked Questions · MediaSave Knowledge Base',
  terms: 'Terms of Service · MediaSave Legal Terms',
  privacy: 'Privacy Policy & AdSense Disclosures · MediaSave',
  copyright: 'Copyright Policy & DMCA Inquiries · MediaSave',
  contact: 'Contact & Support · MediaSave',
};

const PAGE_DESCRIPTIONS: Record<PageRoute, string> = {
  home: 'Inspect, preview, and download publicly shared media from Instagram, Threads, and TikTok. Fast, privacy-oriented, and simple to use.',
  about: 'Learn about MediaSave, an independent public media inspector engineered for high speed, privacy, and clean usability.',
  'how-to-use': 'Step-by-step user guide for inspecting and saving public Instagram, Threads, and TikTok media with MediaSave.',
  troubleshooting: 'Troubleshooting guide for resolving URL parsing errors, private content limits, and network issues.',
  faq: 'Frequently asked questions regarding MediaSave capabilities, privacy principles, and media formats.',
  terms: 'Terms of Service governing the lawful personal use and operation of the MediaSave media utility.',
  privacy: 'Privacy policy detailing our strict zero-storage architecture, cookie disclosure, and Google AdSense compliance.',
  copyright: 'Copyright policy, DMCA notice procedures, and creator rights protection guidelines for MediaSave.',
  contact: 'Contact the MediaSave site administrator for bug reports, feedback, and copyright inquiries.',
};

export default function App() {
  const [url, setUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() => {
    if (typeof window !== 'undefined') {
      return getRouteFromPath(window.location.pathname);
    }
    return 'home';
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromPath(window.location.pathname);
      setCurrentRoute(route);
      document.title = PAGE_TITLES[route] || PAGE_TITLES.home;
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update title, meta descriptions, canonical URL, and og:url on route changes
  useEffect(() => {
    const title = PAGE_TITLES[currentRoute] || PAGE_TITLES.home;
    const description = PAGE_DESCRIPTIONS[currentRoute] || PAGE_DESCRIPTIONS.home;
    document.title = title;

    if (typeof window !== 'undefined') {
      // Always generate canonical based on the confirmed operational domain SITE_URL
      // Home route includes trailing slash, other routes do not include trailing slash, search params, or hashes
      const canonicalUrl =
        currentRoute === 'home'
          ? `${SITE_URL}/`
          : `${SITE_URL}/${currentRoute}`;

      // 1. Canonical Link (reuse or create)
      let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.rel = 'canonical';
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.href = canonicalUrl;

      // 2. Open Graph URL (reuse or create)
      let ogUrlEl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
      if (!ogUrlEl) {
        ogUrlEl = document.createElement('meta');
        ogUrlEl.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrlEl);
      }
      ogUrlEl.content = canonicalUrl;

      // 3. Open Graph Title
      let ogTitleEl = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
      if (!ogTitleEl) {
        ogTitleEl = document.createElement('meta');
        ogTitleEl.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleEl);
      }
      ogTitleEl.content = title;

      // 4. Meta Description & og:description
      const metaDescEl = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (metaDescEl) {
        metaDescEl.content = description;
      }
      const ogDescEl = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
      if (ogDescEl) {
        ogDescEl.content = description;
      }
    }
  }, [currentRoute]);

  const handleNavigate = (route: PageRoute) => {
    setCurrentRoute(route);
    const newPath = route === 'home' ? '/' : `/${route}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl !== undefined ? overrideUrl : url).trim();

    if (!targetUrl) {
      setErrorMessage('Please enter an Instagram, Threads, or TikTok URL to analyze.');
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
        if (result.platform === 'instagram' || result.platform === 'threads' || result.platform === 'tiktok') {
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
    if (currentRoute !== 'home') {
      handleNavigate('home');
      setTimeout(() => {
        const el = document.getElementById('media-input-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
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
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute === 'home' && (
          <>
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
          </>
        )}

        {currentRoute === 'about' && (
          <AboutPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'how-to-use' && (
          <HowToUsePage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'troubleshooting' && (
          <TroubleshootingPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'faq' && (
          <FaqPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'terms' && (
          <TermsPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'privacy' && (
          <PrivacyPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'copyright' && (
          <CopyrightPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}

        {currentRoute === 'contact' && (
          <ContactPage onNavigateHome={() => handleNavigate('home')} onNavigate={handleNavigate} />
        )}
      </main>

      {/* 7. Footer */}
      <Footer
        onSelectPlatform={setSelectedPlatform}
        onOpenLegalModal={setActiveLegalModal}
        onNavigate={handleNavigate}
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
