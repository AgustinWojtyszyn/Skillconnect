import { useState } from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { ArrowLeft, ArrowRight, X, MessageCircle, User, Home } from 'lucide-react';

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingTour({ open, onClose }: OnboardingTourProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  if (!open) return null;

  const steps = [
    { icon: Home, title: t('tour.step1.title'), desc: t('tour.step1.desc') },
    { icon: Home, title: t('tour.step2.title'), desc: t('tour.step2.desc') },
    { icon: MessageCircle, title: t('tour.step3.title'), desc: t('tour.step3.desc') },
    { icon: User, title: t('tour.step4.title'), desc: t('tour.step4.desc') },
  ];

  const Icon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-2 rounded-lg hover:bg-gray-100"
          aria-label="close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">{steps[step].title}</h3>
        <p className="text-center text-gray-600 mb-6">{steps[step].desc}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            {t('tour.skip')}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg border disabled:opacity-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> {t('tour.back')}
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2"
              >
                {t('tour.next')} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                {t('tour.finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
