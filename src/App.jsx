import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CvInput from "./components/CvInput";
import JobList from "./components/JobList";
import ResultsSection from "./components/ResultsSection";
import EmptyState from "./components/EmptyState";
import { mockJobs } from "./data/mockJobs";
import { analyzeApplication } from "./services/api";
import { parseCvFile } from "./services/fileParser";

const SAMPLE_CV =
  "Bilgisayar mühendisliği öğrencisiyim. Python ile veri analizi projesi geliştirdim. Pandas ve NumPy kullandım. Veri bilimi ve makine öğrenmesine giriş dersleri aldım. Python biliyorum.";

function App() {
  const [cvText, setCvText] = useState("");
  const [postingText, setPostingText] = useState(mockJobs[2].postingText);
  const [applicationType, setApplicationType] = useState("internship");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [hasMatched, setHasMatched] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fileReadSuccess, setFileReadSuccess] = useState(false);
  const [isFallbackAnalysis, setIsFallbackAnalysis] = useState(false);

  const handleFillSample = () => {
    setCvText(SAMPLE_CV);
    setPostingText(mockJobs[2].postingText);
    setApplicationType("internship");
    setSelectedJobId(mockJobs[2].id);
    setError("");
  };

  const handleClear = () => {
    setCvText("");
    setPostingText("");
    setApplicationType("job");
    setSelectedJobId(null);
    setAnalysis(null);
    setError("");
    setHasMatched(false);
    setSelectedFileName("");
    setFileInputKey((currentValue) => currentValue + 1);
    setFileReadSuccess(false);
    setIsFallbackAnalysis(false);
  };

  const handleFileChange = async (file) => {
    if (!file) {
      setSelectedFileName("");
      setFileReadSuccess(false);
      return;
    }

    setSelectedFileName(file.name);
    setError("");
    setFileReadSuccess(false);
    setIsFileProcessing(true);

    try {
      const extractedText = await parseCvFile(file);

      setCvText(extractedText.trim());
      setFileReadSuccess(true);
    } catch (fileError) {
      console.error(fileError);
      setError(fileError.message);
    } finally {
      setIsFileProcessing(false);
    }
  };

  const handleJobSelect = (job) => {
    if (selectedJobId === job.id) {
      setSelectedJobId(null);
      return;
    }

    setSelectedJobId(job.id);
    setPostingText(job.postingText);
    setApplicationType(job.applicationType);
  };

  const handleMatch = async () => {
    if (!cvText.trim()) {
      setError("Lütfen CV metni giriniz veya PDF/DOCX dosyası yükleyiniz.");
      setAnalysis(null);
      setHasMatched(false);
      return;
    }

    if (!postingText.trim()) {
      setError("Lütfen iş veya staj ilanı metni giriniz.");
      setAnalysis(null);
      setHasMatched(false);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await analyzeApplication({
        cv_text: cvText,
        posting_text: postingText,
        application_type: applicationType,
      });

      setAnalysis(response);
      setHasMatched(true);
    } catch (matchError) {
      setError("Analiz sırasında bir sorun oluştu.");
      setAnalysis(null);
      setHasMatched(false);
      console.error(matchError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Header />

      <main className="container">
        <Hero />

        <section id="eslestirme" className="dashboard-grid">
          <div className="dashboard-column">
            <CvInput
              cvText={cvText}
              error={error}
              isLoading={isLoading}
              isFileProcessing={isFileProcessing}
              fileInputKey={fileInputKey}
              selectedFileName={selectedFileName}
              fileReadSuccess={fileReadSuccess}
              onChange={setCvText}
              onFileChange={handleFileChange}
              onClear={handleClear}
              onFillSample={handleFillSample}
              onMatch={handleMatch}
            />
          </div>

          <div className="dashboard-column">
            <JobList
              jobs={mockJobs}
              selectedJobId={selectedJobId}
              postingText={postingText}
              applicationType={applicationType}
              onSelect={handleJobSelect}
              onPostingChange={setPostingText}
              onApplicationTypeChange={setApplicationType}
            />
          </div>
        </section>

        {hasMatched ? (
          <ResultsSection analysis={analysis} isLoading={isLoading} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export default App;

