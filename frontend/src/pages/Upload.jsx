import { motion } from "framer-motion";
import UploadForm from "../components/UploadForm";

export default function Upload() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold mb-4">⬆️ Upload New Clothing</h2>
      <UploadForm />
    </motion.div>
  );
}
