import { useStore } from '@nanostores/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { themeStore, toggleTheme } from '~/lib/stores/theme';
import { AuthButton } from './AuthButton.client';
import { SettingsDialog } from './SettingsDialog.client';
import { openSettingsPanel, type SettingsTab } from '~/lib/stores/layout';
import { DeployButton } from './DeployButton.client';
import { ShareButton } from './ShareButton.client';
import { EditableProjectName } from './EditableProjectName.client';
import { SaveProjectButton } from './SaveProjectButton.client';
import { SaveToDrive } from '~/components/chat/SaveToDrive.client';
import { PublishToGalleryButton } from './PublishToGalleryButton.client';
import { GitHubPush } from '~/components/chat/GitHubPush.client';
import { SearchDialog } from './SearchDialog.client';
import { ModelPicker } from './ModelPicker.client';
import { languageStore, type AppLanguage, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '~/lib/stores/language';
import { useT } from '~/lib/i18n/useT';
import { classNames } from '~/utils/classNames';
import { BrandAsset } from '~/components/ui/BrandAsset';

export function Header() {
  const chat = useStore(chatStore);
  const t = useT();
  const currentLang = useStore(languageStore);

  const openProjectSettings = useCallback((tab?: SettingsTab) => {
    openSettingsPanel(tab);
  }, []);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const openDeploySettings = useCallback(() => {
    openSettingsPanel('deploy');
  }, []);

  // Close more menu on outside click
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreMenuOpen]);

  // If chat hasn't started, show the homepage header
  if (!chat.started) {
    return (
      <>
        <HomepageHeader onSearchOpen={() => setSearchOpen(true)} />
        <ClientOnly>{() => <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />}</ClientOnly>
      </>
    );
  }

  return (
    <header className="professional-header flex items-center h-[var(--header-height)] bg-bolt-elements-background-depth-1/95 border-b border-bolt-elements-borderColor/70 select-none backdrop-blur-xl">
      {/* LEFT: Logo */}
      <div className="flex items-center px-3 shrink-0">
        <a
          href="/"
          className="flex items-center rounded-xl px-2.5 py-1.5 hover:bg-bolt-elements-item-backgroundActive/80 transition-all duration-200"
          title="Home"
        >
          <BrandAsset src="/omini-logo.html" title="Omini" className="h-10 w-[190px] max-w-full omni-logo-themed" />
        </a>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-bolt-elements-borderColor/70 hidden sm:block" />

      {/* Model Picker */}
      <div>
        <ClientOnly>{() => <ModelPicker />}</ClientOnly>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-bolt-elements-borderColor/70 hidden sm:block" />

      {/* CENTER: Editable project name */}
      <div className="flex-1 hidden sm:flex items-center justify-center px-3 min-w-0">
        <ClientOnly>{() => <EditableProjectName />}</ClientOnly>
      </div>

      {/* RIGHT: Action buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 shrink-0 relative z-[50]">
        <ClientOnly>
          {() => (
            <>
              {chat.started && (
                <>
                  {/* Deploy button */}
                  <div className="hidden sm:block">
                    <DeployButton onOpenSettings={openDeploySettings} />
                  </div>

                  {/* Share button */}
                  <div className="hidden sm:block">
                    <ShareButton onOpenSettings={openDeploySettings} />
                  </div>

                  {/* Publish / Gallery */}
                  <ClientOnly>{() => <PublishToGalleryButton />}</ClientOnly>
                </>
              )}

              {/* More menu (⋮) */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive/80 transition-all duration-200"
                  title="More"
                >
                  <div className="i-ph:dots-three-vertical text-base" />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-bolt-elements-background-depth-2/95 border border-bolt-elements-borderColor/80 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl">
                    {/* Save options */}
                    {chat.started && (
                      <div className="p-1 border-b border-bolt-elements-borderColor">
                        <ClientOnly>{() => <SaveProjectButton />}</ClientOnly>
                        <ClientOnly>{() => <SaveToDrive />}</ClientOnly>
                      </div>
                    )}

                    {/* Actions */}
                    {chat.started && (
                      <div className="p-1 border-b border-bolt-elements-borderColor">
                        <ClientOnly>{() => <GitHubPush />}</ClientOnly>
                      </div>
                    )}

                    {/* Settings & Theme */}
                    <div className="p-1">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all text-left"
                      >
                        <div
                          className={
                            themeStore.get() === 'dark'
                              ? 'i-ph:sun-dim-duotone text-base text-amber-400'
                              : 'i-ph:moon-stars-duotone text-base text-indigo-400'
                          }
                        />
                        <span>{themeStore.get() === 'dark' ? t('header.lightMode') : t('header.darkMode')}</span>
                      </button>

                      {/* Language sub-menu */}
                      <div className="relative group/lang">
                        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all text-left">
                          <span className="text-base">{LANGUAGE_FLAGS[currentLang]}</span>
                          <span>{LANGUAGE_NAMES[currentLang]}</span>
                          <div className="i-ph:caret-right text-[10px] ml-auto" />
                        </button>
                        <div className="absolute left-full top-0 ml-1 w-40 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-xl shadow-2xl z-[110] overflow-hidden p-1 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all">
                          {(['pt', 'en', 'es', 'zh'] as AppLanguage[]).map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => {
                                languageStore.set(lang);
                                setMoreMenuOpen(false);
                              }}
                              className={classNames(
                                'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all text-left',
                                currentLang === lang
                                  ? 'bg-bolt-elements-item-backgroundActive text-bolt-elements-item-contentAccent'
                                  : 'text-bolt-elements-textSecondary hover:bg-bolt-elements-item-backgroundActive hover:text-bolt-elements-textPrimary',
                              )}
                            >
                              <span className="text-sm">{LANGUAGE_FLAGS[lang]}</span>
                              <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
                              {currentLang === lang && (
                                <div className="i-ph:check-bold text-[10px] ml-auto text-bolt-elements-item-contentAccent" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('open-api-settings'));
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all text-left"
                      >
                        <div className="i-ph:gear-six text-base" />
                        <span>{t('header.apiKeysSettings')}</span>
                      </button>
                      <div className="border-t border-bolt-elements-borderColor my-1" />
                      <button
                        onClick={() => {
                          openProjectSettings('general');
                          setMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all text-left"
                      >
                        <div className="i-ph:folder-open text-base" />
                        <span>{t('header.projectSettings')}</span>
                      </button>
                      <a
                        href="/gallery"
                        onClick={() => setMoreMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all text-left"
                      >
                        <div className="i-ph:storefront text-base" />
                        <span>{t('header.gallery')}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <ClientOnly>{() => <SettingsDialog />}</ClientOnly>
              <AuthButton />
            </>
          )}
        </ClientOnly>
      </div>
      <ClientOnly>{() => <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />}</ClientOnly>
    </header>
  );
}

/* ===== Homepage Header ===== */
function HomepageHeader({ onSearchOpen }: { onSearchOpen: () => void }) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const currentLang = useStore(languageStore);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    if (!resourcesOpen) return;
    const handler = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [resourcesOpen]);

  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  return (
    <header className="professional-header flex items-center h-[var(--header-height)] bg-bolt-elements-background-depth-1/95 border-b border-bolt-elements-borderColor/70 select-none backdrop-blur-xl">
      {/* LEFT: spacing only */}
      <div className="w-0 sm:w-4 shrink-0" />

      {/* CENTER: Search bar */}
      <div className="flex-1 flex items-center justify-center px-4 max-w-xl mx-auto">
        <button
          onClick={onSearchOpen}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor hover:border-bolt-elements-borderColorActive transition-all cursor-text text-left"
        >
          <div className="i-ph:magnifying-glass text-sm text-bolt-elements-textTertiary" />
          <span className="text-sm text-bolt-elements-textTertiary">{t('search.placeholder')}</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-bolt-elements-textTertiary bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* RIGHT: Navigation links */}
      <div className="flex items-center gap-1 px-4 shrink-0">
        {/* API Settings button */}
        <ClientOnly>{() => <SettingsDialog />}</ClientOnly>

        {/* Docs link */}
        <a
          href="/docs"
          className="hidden md:flex items-center px-3 py-1.5 rounded-lg text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all"
        >
          <div className="i-ph:book-open-text text-sm mr-1.5" />
          {t('header.documentation')}
        </a>

        {/* Language selector */}
        <div ref={langRef} className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all"
          >
            <span>{LANGUAGE_FLAGS[currentLang]}</span>
            <span className="hidden lg:inline">{LANGUAGE_NAMES[currentLang]}</span>
            <div
              className={`i-ph:caret-down text-[10px] transition-transform duration-150 ${langOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-xl shadow-2xl z-[100] overflow-hidden p-1">
              {(['pt', 'en', 'es', 'zh'] as AppLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    languageStore.set(lang);
                    setLangOpen(false);
                  }}
                  className={classNames(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left',
                    currentLang === lang
                      ? 'bg-bolt-elements-item-backgroundActive text-bolt-elements-item-contentAccent'
                      : 'text-bolt-elements-textSecondary hover:bg-bolt-elements-item-backgroundActive hover:text-bolt-elements-textPrimary',
                  )}
                >
                  <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                  <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
                  {currentLang === lang && (
                    <div className="i-ph:check-bold text-xs ml-auto text-bolt-elements-item-contentAccent" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={resourcesRef} className="relative hidden md:block">
          <button
            onClick={() => setResourcesOpen(!resourcesOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all"
          >
            {t('header.resources')}
            <div
              className={`i-ph:caret-down text-[10px] transition-transform duration-150 ${resourcesOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {resourcesOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded-xl shadow-2xl z-[100] overflow-hidden p-1">
              <a
                href="/gallery"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all"
              >
                <div className="i-ph:storefront text-base" />
                {t('header.gallery')}
              </a>
              <a
                href="/docs"
                onClick={() => setResourcesOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-all"
              >
                <div className="i-ph:book-open-text text-base" />
                {t('header.documentation')}
              </a>
            </div>
          )}
        </div>

        <ClientOnly>{() => <AuthButton />}</ClientOnly>
      </div>
    </header>
  );
}
