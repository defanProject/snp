import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';

export default function StaticPages() {
  const { t } = useTranslation();
  const location = useLocation();
  const path = location.pathname.split('/').pop();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData = useMemo(() => {
    const items = t('faq.items', { returnObjects: true }) as { q: string, a: string }[];
    if (!items || !Array.isArray(items)) return [];
    return items;
  }, [t]);

  const filteredFaqs = faqData.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContent = () => {
    switch (path) {
      case 'faq':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
                {t('faq.title')}
              </h1>
              <p className="text-gray-500 font-bold">{t('faq.subtitle')}</p>
            </div>

            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchPlaceholder')}
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] focus:border-black focus:ring-0 text-gray-900 font-medium transition-all shadow-xl shadow-gray-100/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={index}
                    className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-black text-gray-900 pr-8">{faq.q}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                        {openIndex === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 text-gray-600 font-medium leading-relaxed border-t border-gray-50 bg-gray-50/30">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredFaqs.length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold">
                  {t('faq.noResults')} "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        );
      case 'terms':
        return (
          <div className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-black mb-8">{t('terms.title')}</h1>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              {(t('terms.sections', { returnObjects: true }) as any[]).map((section, i) => (
                <section key={i}>
                  <h2 className="text-xl font-black text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </section>
              ))}
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-black mb-8">{t('privacy.title')}</h1>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              {(t('privacy.sections', { returnObjects: true }) as any[]).map((section, i) => (
                <section key={i}>
                  <h2 className="text-xl font-black text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </section>
              ))}
            </div>
          </div>
        );
      case 'guide':
        return (
          <div className="space-y-12">
            <h1 className="text-4xl md:text-6xl font-black text-center">{t('guide.title')} <span className="text-gray-400">{t('guide.subtitle')}</span></h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(t('guide.steps', { returnObjects: true }) as any[]).map((item, i) => (
                <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg relative z-10">
                    {i + 1}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 relative z-10">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'cookies':
        return (
          <div className="prose prose-gray max-w-none">
            <h1 className="text-4xl font-black mb-8">{t('cookies.title')}</h1>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <p className="text-gray-600 leading-relaxed">{t('cookies.policyDesc')}</p>
              <section>
                <h2 className="text-xl font-black text-gray-900 mb-4">{t('cookies.whatAreCookies')}</h2>
                <p className="text-gray-600 leading-relaxed">{t('cookies.whatAreCookiesDesc')}</p>
              </section>
            </div>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {getContent()}
      </motion.div>
    </div>
  );
}
