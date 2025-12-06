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
  Cpu,
  Video,
  Camera,
  Trash2,
  ArrowLeft,
  Download,
  Search,
  Filter,
  DownloadCloud,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const resizeImageAndGetBlob = (file, maxWidth, maxHeight) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          file.type || "image/jpeg",
          0.9
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

const ResultDetailCard = ({ modelUsed, result }) => {
  const allClasses = [
    { name: result.label, value: result.confidence },
    {
      name: result.is_fresh ? "Rotten (Sim.)" : "Fresh (Sim.)",
      value: 100 - result.confidence,
    },
  ];

  const dataForChart = allClasses;

  return (
    <div className="mt-6 p-6 bg-gray-800 rounded-xl border border-gray-700 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Cpu className="w-4 h-4" /> INFERENCE BREAKDOWN
        </h4>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 border border-gray-600 uppercase">
          {modelUsed} MODEL
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataForChart}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dataForChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? result.is_fresh
                          ? "#10b981"
                          : "#ef4444"
                        : "#374151"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <span className="text-2xl font-bold text-white block">
                {result.confidence.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-400 uppercase">Certainty</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <span className="text-gray-400 text-sm">Primary Detection</span>
            <span
              className={`font-bold ${
                result.is_fresh ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {result.label}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500 uppercase tracking-wider">
              <span>Confidence Distribution</span>
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${
                  result.is_fresh ? "bg-emerald-500" : "bg-red-500"
                }`}
                style={{ width: `${result.confidence}%` }}
              ></div>
              <div
                className="h-full bg-gray-600"
                style={{ width: `${100 - result.confidence}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>{result.confidence.toFixed(1)}% Match</span>
              <span>{(100 - result.confidence).toFixed(1)}% Noise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryAnalytics = ({ history }) => {
  if (history.length < 2) return null;

  const freshCount = history.filter((h) => h.is_fresh).length;
  const rottenCount = history.length - freshCount;

  const pieData = [
    { name: "Fresh", value: freshCount },
    { name: "Rotten", value: rottenCount },
  ];

  const lineData = [...history]
    .reverse()
    .slice(-10)
    .map((h, i) => ({
      name: i + 1,
      confidence: h.confidence,
      status: h.is_fresh ? "Fresh" : "Rotten",
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-emerald-400" /> QUALITY RATIO
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" /> CONFIDENCE TREND
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#374151"
              />
              <XAxis dataKey="name" hide />
              <YAxis
                domain={[0, 100]}
                hide
                label={{ value: "%", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorConf)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState("scanner");

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [installPrompt, setInstallPrompt] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [scannerMode, setScannerMode] = useState("upload");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchHistory();

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (isCameraActive && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
      videoRef.current
        .play()
        .catch((e) => console.error("Error playing video:", e));
    }
  }, [isCameraActive, videoStream]);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setInstallPrompt(null);
    });
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 300 },
      });
      setVideoStream(stream);
      setIsCameraActive(true);
      setFile(null);
      setPreview(null);
      setResult(null);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setError("Could not access camera. Please check browser permissions.");
      setIsCameraActive(false);
    }
  };

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
    stopCamera();
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${API_URL}/history`);

      if (!response.ok) {
        setHistoryError(
          `Database unavailable (Status: ${response.status}). Is backend running?`
        );
        return;
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setHistoryError("Failed to connect to history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (selectedHistoryItem && selectedHistoryItem._id === id) {
          setSelectedHistoryItem(null);
        }
      } else {
        console.error("Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const clearAllHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL history? This cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory([]);
        setSelectedHistoryItem(null);
      } else {
        console.error("Failed to clear history");
      }
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  const exportData = () => {
    if (history.length === 0) return;

    const headers = [
      "Timestamp",
      "Filename",
      "Label",
      "Is Fresh",
      "Confidence",
      "Model",
    ];
    const rows = history.map((item) => [
      item.timestamp,
      item.filename,
      item.label,
      item.is_fresh ? "Yes" : "No",
      item.confidence.toFixed(2),
      item.model_used,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "freshx_history_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchHistory();
      setSelectedHistoryItem(null);
    }
    if (tab === "scanner") {
      stopCamera();
    }
  };

  const handlePrediction = async () => {
    let rawFile = null;
    let fileName = "";

    if (scannerMode === "upload" && file) {
      rawFile = file;
      fileName = file.name;
    } else if (scannerMode === "camera" && isCameraActive) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      rawFile = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      fileName = "live_capture.jpg";

      setPreview(canvas.toDataURL("image/jpeg"));
      stopCamera();
    }

    if (!rawFile) {
      setError("Please upload an image or activate the camera first.");
      return;
    }

    setLoading(true);
    setError(null);

    const resizedBlob = await resizeImageAndGetBlob(rawFile, 400, 400);

    const formData = new FormData();
    formData.append("file", resizedBlob, fileName);

    try {
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      const fetchPromise = fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const [_, response] = await Promise.all([delayPromise, fetchPromise]);

      const data = await response.json();

      if (response.ok) {
        setResult(data);

        const newHistoryItem = {
          _id: "temp-" + Date.now(),
          filename: fileName,
          label: data.label,
          confidence: data.confidence,
          is_fresh: data.is_fresh,
          timestamp: new Date().toISOString(),
          model_used: data.model_used || "fruit",
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      } else {
        setError(data.error || "Failed to analyze image");
      }
    } catch (err) {
      setError("Could not connect to the AI server.");
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "fresh" && item.is_fresh) ||
      (filterStatus === "rotten" && !item.is_fresh);
    return matchesSearch && matchesFilter;
  });

  const modelIndicator = result
    ? result.model_used
    : history[0]
    ? history[0].model_used
    : "fruit";

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-emerald-500 selection:text-white pb-10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center transform rotate-3 shrink-0">
              <span className="font-bold text-gray-900 text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FreshX</h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            {installPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-lg animate-bounce"
              >
                <DownloadCloud className="w-4 h-4" /> Install App
              </button>
            )}

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
          </div>
        </header>

        <main className="flex flex-col items-center justify-center">
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

          {activeTab === "scanner" ? (
            <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300">
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                  Is your fruit fresh?
                </h2>
                <p className="text-gray-400 text-base md:text-lg">
                  Use the camera or upload a file to analyze quality.
                </p>
              </div>

              <div className="flex justify-end px-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-emerald-400 border border-emerald-500/30 shadow-sm">
                  <Cpu className="w-3 h-3" />
                  Model: {modelIndicator.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-teal-500 to-blue-500 opacity-50"></div>

                <div className="flex justify-center mb-6 p-1 bg-gray-900 rounded-xl relative z-20 w-full">
                  <button
                    onClick={() => {
                      setScannerMode("upload");
                      stopCamera();
                      resetSelection();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      scannerMode === "upload"
                        ? "bg-gray-700 text-white shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Upload className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">File Upload</span>
                    <span className="sm:hidden">Upload</span>
                  </button>
                  <button
                    onClick={() => {
                      setScannerMode("camera");
                      resetSelection();
                      setScannerMode("camera");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      scannerMode === "camera"
                        ? "bg-gray-700 text-white shadow-md"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Camera className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">Live Camera</span>
                    <span className="sm:hidden">Camera</span>
                  </button>
                </div>

                {scannerMode === "camera" && !isCameraActive && !result ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-2xl h-64 flex flex-col items-center justify-center text-center p-4">
                    <Video className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-lg font-medium text-gray-300">
                      Camera Inactive
                    </p>
                    <button
                      onClick={startCamera}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" /> Activate Camera
                    </button>
                  </div>
                ) : scannerMode === "camera" && isCameraActive && !result ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 h-64 bg-gray-900 flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full animate-pulse">
                        LIVE
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 h-64 bg-gray-900 flex items-center justify-center">
                      {!preview ? (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={triggerFileInput}
                          className="border-2 border-dashed border-gray-600 rounded-2xl h-64 w-full flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-gray-800 transition-all duration-300 group p-4 text-center"
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
                        <img
                          src={preview}
                          alt="Upload Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}

                      {loading && (
                        <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center z-20 transition-opacity duration-300">
                          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                          <p className="mt-4 text-gray-300">
                            Analyzing Image...
                          </p>
                        </div>
                      )}

                      {(preview || result) && (
                        <button
                          onClick={resetSelection}
                          className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-md z-30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
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
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {result.is_fresh ? (
                              <div className="p-2 bg-emerald-500 rounded-lg shrink-0">
                                <CheckCircle className="w-6 h-6 text-white" />
                              </div>
                            ) : (
                              <div className="p-2 bg-red-500 rounded-lg shrink-0">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 className="text-xl font-bold text-white">
                                {result.is_fresh
                                  ? "FRESH RESULT"
                                  : "ROTTEN RESULT"}
                              </h3>
                              <p className="text-sm text-gray-400 capitalize">
                                {result.label}
                              </p>
                            </div>
                          </div>
                          <div className="text-right w-full sm:w-auto">
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

                      <ResultDetailCard
                        modelUsed={modelIndicator}
                        result={result}
                      />

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
                      disabled={(!isCameraActive && !file) || loading}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                        !isCameraActive && !file
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
                          {scannerMode === "upload"
                            ? "Start Detection"
                            : "Capture & Detect"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
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

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={exportData}
                    disabled={history.length === 0}
                    className="bg-gray-800 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    title="Export CSV"
                  >
                    <Download className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={clearAllHistory}
                    disabled={history.length === 0}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                </div>
              </div>

              {/* Added: Charting Component for History Trends */}
              <HistoryAnalytics history={filteredHistory} />

              {/* Search & Filter Bar */}
              <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700 mb-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="relative w-full sm:w-40">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Items</option>
                    <option value="fresh">Fresh Only</option>
                    <option value="rotten">Rotten Only</option>
                  </select>
                </div>
              </div>

              {historyError && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {historyError}
                </div>
              )}

              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p>Loading history...</p>
                </div>
              ) : selectedHistoryItem ? (
                <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-3xl p-6 animate-in zoom-in-95 duration-300">
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                  </button>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center ${
                          selectedHistoryItem.is_fresh
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {selectedHistoryItem.is_fresh ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <AlertCircle className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {selectedHistoryItem.label}
                        </h3>
                        <p className="text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(
                            selectedHistoryItem.timestamp
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(selectedHistoryItem._id)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors w-full sm:w-auto flex justify-center"
                      title="Delete Record"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                        Confidence
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {selectedHistoryItem.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                        Model Used
                      </span>
                      <span className="text-2xl font-bold text-white uppercase">
                        {selectedHistoryItem.model_used}
                      </span>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 md:col-span-2">
                      <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                        Filename
                      </span>
                      <span className="text-lg text-white truncate block">
                        {selectedHistoryItem.filename}
                      </span>
                    </div>
                  </div>

                  <ResultDetailCard
                    modelUsed={selectedHistoryItem.model_used}
                    result={selectedHistoryItem}
                  />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700/50">
                  <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No history found yet.</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Run a scan to see it appear here.
                  </p>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No items match your search filters.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
                  {filteredHistory.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedHistoryItem(item)}
                      className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer group gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div
                          className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${
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
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-white text-lg truncate">
                            {item.label}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span className="flex items-center gap-1 mr-4">
                              <Cpu className="w-3 h-3 text-yellow-400" />
                              {item.model_used.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <FileText className="w-3 h-3 shrink-0" />
                              {item.filename && item.filename.length > 15
                                ? item.filename.substring(0, 15) + "..."
                                : item.filename}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-700 pt-3 sm:pt-0">
                        <div className="flex flex-col items-start sm:items-end">
                          <div className="font-bold text-xl text-white">
                            {item.confidence.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item._id);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
