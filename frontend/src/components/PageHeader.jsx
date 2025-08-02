// frontend/src/components/PageHeader.jsx
import { motion } from "framer-motion";

export default function PageHeader({ title, highlight, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4"
    >
      <h2 className="text-4xl font-light text-gray-600 dark:text-gray-300">
        {title}{' '}
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          {highlight}
        </span>
      </h2>
      {subtitle && <p className="mt-2 text-md text-gray-500 dark:text-gray-400">{subtitle}</p>}
    </motion.div>
  );
}
