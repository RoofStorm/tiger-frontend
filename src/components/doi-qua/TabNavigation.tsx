'use client';

type TabType = 'doi-qua' | 'the-le' | 'nhip-song' | 'thu-thach' | 'nhip-bep' | 'tc';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNavigate: (href: string, message: string) => void;
  onTrackClick: (page: string, data: { zone: string; component: string; metadata: Record<string, unknown> }) => void;
}

const TABS = [
  { id: 'doi-qua' as TabType, label: 'Đổi quà', href: null },
  { id: 'the-le' as TabType, label: 'Thể lệ', href: null },
  { id: 'nhip-song' as TabType, label: 'Nhịp sống', href: '/nhip-song' },
  { id: 'thu-thach' as TabType, label: 'Thử thách giữ nhịp', href: '/thu-thach-giu-nhip' },
  { id: 'nhip-bep' as TabType, label: 'Nhịp bếp', href: '/nhip-bep' },
  { id: 'tc' as TabType, label: 'T&C', href: null },
] as const;

export function TabNavigation({ activeTab, onTabChange, onNavigate, onTrackClick }: TabNavigationProps) {
  return (
    <div className="flex justify-center mb-2 px-4 py-2">
      <div 
        className="flex items-center justify-center overflow-x-auto overflow-y-visible w-full max-w-full [&::-webkit-scrollbar]:hidden pb-1"
        style={{
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none', /* IE and Edge */
          WebkitOverflowScrolling: 'touch', /* iOS smooth scrolling */
        }}
      >
        <div className="flex items-center justify-center gap-1 md:gap-0 pb-0.5">
          {TABS.map((tab, index, array) => (
            <div key={tab.id} className="flex items-center flex-shrink-0">
              <button
                onClick={() => {
                  if (tab.href) {
                    // Navigate to other page - don't track as tab click
                    onNavigate(tab.href, `Đang chuyển đến ${tab.label}...`);
                  } else {
                    // Track tab click (only for tabs that change content on same page)
                    onTrackClick('doi-qua', {
                      zone: 'overview',
                      component: 'tab',
                      metadata: { 
                        tabId: tab.id,
                        tabLabel: tab.label,
                      },
                    });
                    onTabChange(tab.id);
                  }
                }}
                className={`px-3 py-2 md:px-6 md:py-3 font-medium transition-all duration-300 rounded-full whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#284A8F] text-white'
                    : 'bg-white text-gray-800 border border-gray-800'
                }`}
                style={{
                  fontFamily: 'var(--font-nunito)',
                  fontSize: 'clamp(12px, 3vw, 16px)',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                }}
              >
                {tab.label}
              </button>
              {index < array.length - 1 && (
                <div 
                  className="h-[1px] w-4 md:w-8 mx-0.5 md:mx-1 flex-shrink-0 hidden sm:block"
                  style={{ backgroundColor: '#333435' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

