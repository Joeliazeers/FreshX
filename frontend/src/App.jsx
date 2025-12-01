import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ScanSearch,
  History,
  Clock,
  FileText,
} from "lucide-react";

const App = () => {
  const [activeTab, setActiveTab] = useState("scanner");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch history once on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setResult(null);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const resetSelection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch("http://localhost:5000/history");
      const data = await response.json();
      if (response.ok) {
        setHistory(data);
      } else {
        console.error("Error fetching history:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    // Removed auto-fetch on tab switch to prevent overwriting session history
    // if the DB is temporarily unreachable.
    // User can use the 'Refresh' button in the tab to force a fetch.
  };

  const handlePrediction = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);

        // Optimistically update history state immediately
        // This ensures the user sees the result in the history tab even if the DB fetch fails later
        const newHistoryItem = {
          filename: file.name,
          label: data.label,
          confidence: data.confidence,
          is_fresh: data.is_fresh,
          timestamp: new Date().toISOString(),
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      } else {
        setError(data.error || "Failed to analyze image");
      }
    } catch (err) {
      setError("Could not connect to the AI server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-emerald-500 selection:text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-3">
              <span className="font-bold text-gray-900 text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FreshX</h1>
          </div>

          <div className="bg-gray-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => switchTab("scanner")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "scanner"
                  ? "bg-gray-700 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ScanSearch className="w-4 h-4" />
              Scanner
            </button>
            <button
              onClick={() => switchTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-gray-700 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center">
          {activeTab === "scanner" ? (
            <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                  Is your fruit fresh?
                </h2>
                <p className="text-gray-400 text-lg">
                  Upload an image of an Apple, Banana, or Orange and let our AI
                  analyze its quality.
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-50"></div>

                {!preview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-600 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-gray-800 transition-all duration-300 group"
                  >
                    <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-300 group-hover:text-white">
                      Click or drag image here
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports JPG, PNG
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 h-64 bg-gray-900 flex items-center justify-center">
                      <img
                        src={preview}
                        alt="Upload Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        onClick={resetSelection}
                        className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  {result ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div
                        className={`p-6 rounded-2xl border ${
                          result.is_fresh
                            ? "bg-emerald-500/10 border-emerald-500/20"
                            : "bg-red-500/10 border-red-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {result.is_fresh ? (
                              <div className="p-2 bg-emerald-500 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            ) : (
                              <div className="p-2 bg-red-500 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {result.is_fresh
                                  ? "Fresh Fruit"
                                  : "Rotten Fruit"}
                              </h3>
                              <p className="text-sm text-gray-400 capitalize">
                                {result.label}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-3xl font-bold text-white">
                              {result.confidence.toFixed(1)}%
                            </span>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">
                              Confidence
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ease-out ${
                              result.is_fresh ? "bg-emerald-500" : "bg-red-500"
                            }`}
                            style={{ width: `${result.confidence}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={resetSelection}
                        className="w-full mt-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                      >
                        Analyze Another
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handlePrediction}
                      disabled={!file || loading}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                        !file
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-white text-gray-900 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <ScanSearch className="w-6 h-6" />
                          Start Detection
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Detection History
                </h2>
                <button
                  onClick={fetchHistory}
                  className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <History className="w-4 h-4" /> Refresh
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p>Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No history found yet.</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Run a scan to see it appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            item.is_fresh
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {item.is_fresh ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <AlertCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {item.label}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {item.filename && item.filename.length > 20
                                ? item.filename.substring(0, 20) + "..."
                                : item.filename}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xl text-white">
                          {item.confidence.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
