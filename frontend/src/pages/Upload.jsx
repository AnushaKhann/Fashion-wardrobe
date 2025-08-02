// frontend/src/pages/Upload.jsx
import { motion } from "framer-motion";
import UploadForm from "../components/UploadForm";
import PageHeader from '../components/PageHeader';

export default function Upload() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader 
        title="Upload New" 
        highlight="Clothing"
        subtitle="Add a new item to your digital closet. Our AI will help categorize it."
      />
      <UploadForm />
    </motion.div>
  );
}
