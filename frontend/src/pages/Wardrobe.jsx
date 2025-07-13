import { motion } from "framer-motion";
import ClothesList from "../components/ClothesList";

export default function Wardrobe() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">👚 Your Wardrobe</h2>
      <ClothesList />
    </motion.div>
  );
}
