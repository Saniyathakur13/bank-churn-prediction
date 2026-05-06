import AdvancedResults from "@/components/AdvancedResults";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import HeroSection from "@/components/HeroSection";
import FileUpload from "@/components/FileUpload";
import ProcessingStatus, {
  ProcessingState,
} from "@/components/ProcessingStatus";
import ResultsDownload from "@/components/ResultsDownload";
import PredictionHistory, { HistoryItem } from "@/components/PredictionHistory";
import { usePredictionHistory } from "@/hooks/usePredictionHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import DemoInstructions from "@/components/DemoInstructions";
import {
  parseCSVFile,
  downloadCSVFromBlob,
  downloadCSV,
  validateCSVFile,
  validateBankChurnColumns,
} from "@/lib/csvUtils";

// Direct API calls - bypassing the problematic apiService.ts import
const API_BASE_URL = "http://localhost:5000";

const apiService = {
  async predictChurn(csvData: Array<Record<string, unknown>>) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(csvData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to Flask backend. Please ensure the server is running on http://localhost:5000"
        );
      }
      throw error;
    }
  },

  async downloadResults() {
    try {
      const response = await fetch(`${API_BASE_URL}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      return response.blob();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to Flask backend.");
      }
      throw error;
    }
  },
};

interface PredictionResult {
  totalRecords: number;
  churnCount: number;
  retainCount: number;
  churnRate: number;
  data: Array<Record<string, unknown>>;
}

interface IndexProps {
  onLogout?: () => void;
}

const Index = ({ onLogout }: IndexProps) => {
  const [processingState, setProcessingState] =
    useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [currentFilename, setCurrentFilename] = useState("");
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [recordsProcessed, setRecordsProcessed] = useState(0);

  const { history, addToHistory, deleteFromHistory } = usePredictionHistory();

  const handleFileSelect = async (file: File) => {
    setCurrentFilename(file.name);
    setProcessingState("uploading");
    setProgress(0);
    setResults(null);

    try {
      // Validate file
      const fileValidation = validateCSVFile(file);
      if (!fileValidation.valid) {
        setProcessingState("error");
        setTimeout(() => {
          toast.error("Invalid file", {
            description: fileValidation.error,
          });
        }, 0);
        return;
      }

      setProgress(10);

      // Parse CSV file to JSON
      const parsedData = await parseCSVFile(file);
      setRecordsProcessed(parsedData.length);
      setProgress(30);

      // Validate required columns for ML model
      const columnValidation = validateBankChurnColumns(parsedData);
      if (!columnValidation.valid) {
        setProcessingState("error");
        setTimeout(() => {
          toast.error("Missing required columns", {
            description: `Your CSV is missing: ${columnValidation.missingColumns?.join(
              ", "
            )}`,
          });
        }, 0);
        return;
      }

      setProgress(40);
      setProcessingState("processing");

      // Call Flask backend API
      const response = await apiService.predictChurn(parsedData);
      setProgress(80);

      // Process predictions
      const predictions = response.predictions;
      const churnCount = predictions.filter(
        (record: any) => record.Prediction === "Churn"
      ).length;
      const retainCount = predictions.length - churnCount;

      const predictionResult: PredictionResult = {
        totalRecords: predictions.length,
        churnCount,
        retainCount,
        churnRate: (churnCount / predictions.length) * 100,
        data: predictions,
      };

      setProgress(100);
      setResults(predictionResult);
      setProcessingState("completed");

      // Add to history (will store only first 50 rows)
      addToHistory({
        filename: file.name,
        date: new Date().toISOString(),
        recordsProcessed: predictions.length,
        churnRate: predictionResult.churnRate,
        data: predictions,
      });

      setTimeout(() => {
        toast.success("Analysis complete!", {
          description: `Processed ${predictions.length.toLocaleString()} customer records`,
        });
      }, 0);
    } catch (error) {
      console.error("Error processing file:", error);
      setProcessingState("error");

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      setTimeout(() => {
        toast.error("Failed to process file", {
          description: errorMessage,
        });
      }, 0);
    }
  };

  const handleDownload = async () => {
    try {
      // Download from Flask backend (full data)
      const blob = await apiService.downloadResults();
      downloadCSVFromBlob(
        blob,
        currentFilename.replace(".csv", "_predictions.csv")
      );

      setTimeout(() => {
        toast.success("Full report downloaded successfully");
      }, 0);
    } catch (error) {
      console.error("Download error:", error);

      // Fallback: download from client-side data
      if (results?.data) {
        const outputFilename = currentFilename.replace(
          ".csv",
          "_predictions.csv"
        );
        downloadCSV(results.data, outputFilename);
        setTimeout(() => {
          toast.success("Downloaded from cached data");
        }, 0);
      } else {
        setTimeout(() => {
          toast.error("Download failed", {
            description: "No data available to download",
          });
        }, 0);
      }
    }
  };

  const handleHistoryDownload = (item: HistoryItem) => {
    // Download from client-side history data (preview only - first 50 rows)
    const outputFilename = item.filename.replace(
      ".csv",
      "_predictions_preview.csv"
    );
    downloadCSV(item.data, outputFilename);

    setTimeout(() => {
      // Inform user if data is truncated
      if (item.data.length < item.recordsProcessed) {
        toast.info("Preview downloaded", {
          description: `Downloaded first ${
            item.data.length
          } of ${item.recordsProcessed.toLocaleString()} records. For full results, re-upload the original file.`,
          duration: 5000,
        });
      } else {
        toast.success("Full report downloaded successfully");
      }
    }, 0);
  };

  const handleHistoryDelete = (id: string) => {
    deleteFromHistory(id);
    setTimeout(() => {
      toast.success("Prediction removed from history");
    }, 0);
  };

  const handleNewPrediction = () => {
    setProcessingState("idle");
    setProgress(0);
    setResults(null);
    setCurrentFilename("");
    setRecordsProcessed(0);
  };

  const scrollToUpload = () => {
    const uploadSection = document.getElementById("upload");
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />

      {/* Logout Button - Fixed at top right corner */}
      {onLogout && (
        <button
          onClick={handleLogoutClick}
          className="fixed top-4 right-20 z-50 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-200 flex items-center gap-2"
    style={{ position: 'fixed', top: '20px', right: '250px', zIndex: 9999 }}
        >
          🚪 Logout
        </button>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
              <span className="text-primary-foreground font-bold text-lg">
                C
              </span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              ChurnPredict
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={scrollToUpload}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 group cursor-pointer"
              title="Scroll to upload section"
            >
              <span className="inline-block transform group-hover:translate-x-1 transition-transform">
                ⚡
              </span>
              Quick Start
            </button>

            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>
        <HeroSection />

         <DemoInstructions />

        {/* Upload Section */}
        <section id="upload" className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">
                Start Your Analysis
              </h2>
              <p className="text-muted-foreground">
                Upload your customer data CSV file to get AI-powered churn
                predictions
              </p>
            </div>
            <div className="text-center mt-4">
  <p className="text-sm text-gray-500 mb-2">Don't have a CSV file?</p>
  <button
    onClick={() => {
      // Your sample CSV download logic here
    }}
    className="text-blue-600 hover:text-blue-700 text-sm underline"
  >
    📥 Download Sample CSV Template
  </button>
</div>

            {processingState === "idle" && (
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={false}
              />
            )}

            {(processingState === "uploading" ||
              processingState === "processing") && (
              <ProcessingStatus
                state={processingState}
                progress={progress}
                recordsProcessed={recordsProcessed}
              />
            )}

            {processingState === "completed" && results && (
              <div className="space-y-8">
                <ResultsDownload
                  results={results}
                  filename={currentFilename}
                  onDownload={handleDownload}
                  onNewPrediction={handleNewPrediction}
                />

                <AdvancedResults data={results.data} />
              </div>
            )}

            {processingState === "error" && (
              <div className="text-center">
                <ProcessingStatus
                  state="error"
                  progress={0}
                  message="Failed to process your file. Please check the Flask backend is running and try again."
                />
                <button
                  onClick={handleNewPrediction}
                  className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </section>

        {/* History Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <PredictionHistory
              history={history}
              onDownload={handleHistoryDownload}
              onDelete={handleHistoryDelete}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  C
                </span>
              </div>
              <span className="font-display font-semibold text-foreground">
                ChurnPredict
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChurnPredict. AI-powered customer
              retention analytics.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;