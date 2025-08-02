// frontend/src/pages/Wardrobe.jsx
import { motion } from "framer-motion";
import ClothesList from "../components/ClothesList";
import PageHeader from '../components/PageHeader';

export default function Wardrobe() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader 
        title="My Virtual" 
        highlight="Wardrobe"
        subtitle="Browse your collection, organized by category."
      />
      <ClothesList />
    </motion.div>
  );
}
