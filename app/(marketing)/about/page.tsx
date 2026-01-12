'use client';

import { Button } from '@/components/ui/button';
import { Target, Gem, Users, Heart, Award, Globe, Leaf } from 'lucide-react';
import Link from 'next/link';
import { LuxuryNavBar } from '@/components/layout/LuxuryNavBar';
import { Footer } from '@/components/shop/catalog/Footer';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Gem,
      key: 'craftsmanship',
    },
    {
      icon: Leaf,
      key: 'sustainability',
    },
    {
      icon: Globe,
      key: 'global',
    },
  ];

  const team = [
    { name: 'Alex Chen', role: 'about.team.roles.creativeDirector', initials: 'AC' },
    { name: 'Sarah Kim', role: 'about.team.roles.leadDesigner', initials: 'SK' },
    { name: 'Michael Torres', role: 'about.team.roles.headOfOperations', initials: 'MT' },
    { name: 'Emily Park', role: 'about.team.roles.customerExperience', initials: 'EP' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#161616]">
      <LuxuryNavBar />
      
      <main className="pt-24 sm:pt-28">
        {/* Hero */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-light tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
              {t('about.badge')}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-[#1A1A1A] dark:text-[#F5F5F5] mb-6">
              {t('about.title')}
            </h1>
            <p className="text-base sm:text-lg font-light text-[#666666] dark:text-[#A0A0A0] max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission */}
              <div className="p-6 sm:p-8 rounded-2xl border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white/50 dark:bg-[#1A1A1A]/50">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-light text-[#1A1A1A] dark:text-[#F5F5F5] mb-3">
                  {t('about.mission.title')}
                </h2>
                <p className="text-sm sm:text-base font-light text-[#666666] dark:text-[#A0A0A0] leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </div>

              {/* Vision */}
              <div className="p-6 sm:p-8 rounded-2xl border border-[#E8E4DD] dark:border-[#2A2A2A] bg-white/50 dark:bg-[#1A1A1A]/50">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-light text-[#1A1A1A] dark:text-[#F5F5F5] mb-3">
                  {t('about.vision.title')}
                </h2>
                <p className="text-sm sm:text-base font-light text-[#666666] dark:text-[#A0A0A0] leading-relaxed">
                  {t('about.vision.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-[#F8F5F0] dark:bg-[#0D0D0D]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] dark:text-[#F5F5F5]">
                {t('about.values.title')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center p-6">
                    <div className="w-14 h-14 mx-auto rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-lg font-light text-[#1A1A1A] dark:text-[#F5F5F5] mb-2">
                       {t(`about.values.${value.key}.title`)}
                    </h3>
                    <p className="text-sm font-light text-[#666666] dark:text-[#A0A0A0]">
                       {t(`about.values.${value.key}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <span className="inline-block px-4 py-1.5 mb-4 text-xs font-light tracking-widest uppercase text-[#D4AF37] border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/5">
                {t('about.team.badge')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] dark:text-[#F5F5F5]">
                {t('about.team.title')}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/20 flex items-center justify-center mb-4">
                    <span className="text-xl sm:text-2xl font-light text-[#D4AF37]">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#1A1A1A] dark:text-[#F5F5F5]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-light text-[#666666] dark:text-[#A0A0A0]">
                    {t(member.role)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-light text-[#1A1A1A] dark:text-[#F5F5F5] mb-6">
              {t('about.cta.title')}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/shop">
                <Button className="px-8 py-5 text-sm font-light tracking-wide bg-[#D4AF37] text-white hover:bg-[#C19B2B]">
                  {t('about.cta.explore')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
