import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const Logo = () => (
  <svg
    className="w-16 h-16 text-indigo-600"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      d="M32 8L8 32L32 56L56 32L32 8Z"
      stroke="currentColor"
      strokeWidth="4"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      cx="32"
      cy="32"
      r="12"
      fill="currentColor"
    />
  </svg>
);

const features = [
  {
    icon: UserGroupIcon,
    translate: "home.features.skill_sharing",
  },
  {
    icon: AcademicCapIcon,
    translate: "home.features.skill_discovery",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    translate: "home.features.chat",
  },
  {
    icon: UserCircleIcon,
    translate: "home.features.profile",
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Logo />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
          >
            {t('home.title')}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            {t('home.subtitle')}
          </motion.p>

          <div className="mt-10 flex justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {t('home.cta.start')}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 border-indigo-600"
            >
              {t('home.cta.learn_more')}
            </motion.button>
          </div>
        </div>

        <div className="mt-32">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('home.features.title')}
          </h2>
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="relative bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <feature.icon className="w-16 h-16 p-3 bg-indigo-100 text-indigo-600 rounded-full" />
                </div>
                <h3 className="mt-8 text-center text-lg font-medium text-gray-900">
                  {t(feature.translate)}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}