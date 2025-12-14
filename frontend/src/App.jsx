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
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getDeviceId = () => {
  let deviceId = localStorage.getItem("freshx_device_id");
  if (!deviceId) {
    deviceId = "user_" + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem("freshx_device_id", deviceId);
  }
  return deviceId;
};
const scannerStyles = `
  @keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  .animate-scan {
    animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`;

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
      {result.detections && result.detections.length > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            🍎 ALL DETECTIONS ({result.detections.length} items)
          </h4>
          <div className="space-y-2">
            {result.detections.map((det, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  det.is_fresh
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{det.is_fresh ? "✅" : "❌"}</span>
                  <span className="font-medium text-white">{det.label}</span>
                </div>
                <span
                  className={`font-bold ${
                    det.is_fresh ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {det.confidence.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [filterFruitType, setFilterFruitType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);

  // File Upload
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Results & Loading
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scannerMode, setScannerMode] = useState("upload");
  const [notes, setNotes] = useState("");
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResults, setBatchResults] = useState([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Realtime Camera Capture
  const [isRealtimeCapture, setIsRealtimeCapture] = useState(false);
  const [bestRealtimeResult, setBestRealtimeResult] = useState(null);
  const [bestRealtimeBlob, setBestRealtimeBlob] = useState(null);
  const [captureCount, setCaptureCount] = useState(0);
  const realtimeIntervalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchHistory();
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });
    return () => {
      stopCamera();
      // Clear realtime capture interval on unmount
      if (realtimeIntervalRef.current) {
        clearInterval(realtimeIntervalRef.current);
      }
    };
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setVideoStream(stream);
      setIsCameraActive(true);
      setScannerMode("camera");
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

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    video.pause();

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    );

    stopCamera();

    setLoading(true);
    analyzeImage(blob, "camera_snapshot.jpg", notes);
  };

  const analyzeImage = async (imageBlob, filename, userNotes = "") => {
    const formData = new FormData();
    formData.append("file", imageBlob, filename);
    formData.append("save", "true");
    formData.append("notes", userNotes);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const [response] = await Promise.all([
        fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "x-device-id": getDeviceId() },
          body: formData,
        }),
        minDelay,
      ]);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        const newHistoryItem = {
          _id: "temp-" + Date.now(),
          filename: filename,
          label: data.label,
          confidence: data.confidence,
          is_fresh: data.is_fresh,
          timestamp: new Date().toISOString(),
          model_used: data.model_used || "YOLO",
          notes: userNotes,
          detections: data.detections || [],
          detection_count: data.detection_count || 1,
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

  // Analyze image without saving to history (for temp realtime captures)
  const analyzeImageTemp = async (imageBlob) => {
    const formData = new FormData();
    formData.append("file", imageBlob, "realtime_capture.jpg");
    formData.append("save", "false"); // Don't save to DB

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "x-device-id": getDeviceId() },
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setCaptureCount((prev) => prev + 1);
        // Update best result if this one has higher confidence
        setBestRealtimeResult((prevBest) => {
          if (!prevBest || data.confidence > prevBest.confidence) {
            // Store the blob for this best result
            setBestRealtimeBlob(imageBlob);
            return data;
          }
          return prevBest;
        });
        // Show current result for live feedback
        setResult(data);
      }
    } catch (err) {
      console.error("Realtime capture error:", err);
    }
  };

  // Start realtime capture with 1s interval
  const startRealtimeCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsRealtimeCapture(true);
    setBestRealtimeResult(null);
    setCaptureCount(0);
    setResult(null);
    setError(null);

    // Capture immediately first
    captureFrame();

    // Then capture every 1 second
    realtimeIntervalRef.current = setInterval(() => {
      captureFrame();
    }, 1000);
  };

  // Capture a single frame for realtime analysis
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.8)
    );

    if (blob) {
      analyzeImageTemp(blob);
    }
  };

  // Stop realtime capture and save only the best result
  const stopRealtimeCapture = async () => {
    // Clear interval
    if (realtimeIntervalRef.current) {
      clearInterval(realtimeIntervalRef.current);
      realtimeIntervalRef.current = null;
    }

    setIsRealtimeCapture(false);

    // If we have a best result and its stored blob, save it to history
    if (bestRealtimeResult && bestRealtimeBlob) {
      stopCamera();
      setLoading(true);

      // Save the STORED best blob to history (not a new capture)
      const formData = new FormData();
      formData.append("file", bestRealtimeBlob, "best_realtime_capture.jpg");
      formData.append("save", "true");
      formData.append("notes", notes);

      try {
        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "x-device-id": getDeviceId() },
          body: formData,
        });
        const data = await response.json();

        if (response.ok) {
          setResult(data);
          const newHistoryItem = {
            _id: "temp-" + Date.now(),
            filename: "best_realtime_capture.jpg",
            label: data.label,
            confidence: data.confidence,
            is_fresh: data.is_fresh,
            timestamp: new Date().toISOString(),
            model_used: data.model_used || "YOLO",
            notes: notes,
            detections: data.detections || [],
            detection_count: data.detection_count || 1,
          };
          setHistory((prev) => [newHistoryItem, ...prev]);
        }
      } catch (err) {
        setError("Failed to save best result.");
      } finally {
        setLoading(false);
      }
    } else {
      stopCamera();
    }

    // Clear all temp data
    setBestRealtimeResult(null);
    setBestRealtimeBlob(null);
    setCaptureCount(0);
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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
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
    setNotes("");
    setBatchFiles([]);
    setBatchProgress(0);
    setBatchResults([]);
    setIsBatchMode(false);
    stopCamera();
  };

  const handlePrediction = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    setLoading(true);
    const resized = await resizeImageAndGetBlob(file, 800, 800);
    analyzeImage(resized, file.name, notes);
  };

  const handleBatchUpload = async () => {
    if (batchFiles.length === 0) return;
    
    setIsBatchMode(true);
    setLoading(true);
    setBatchProgress(0);
    setBatchResults([]);
    
    const results = [];
    
    for (let i = 0; i < batchFiles.length; i++) {
      const file = batchFiles[i];
      setBatchProgress(((i) / batchFiles.length) * 100);
      
      try {
        const resized = await resizeImageAndGetBlob(file, 800, 800);
        const formData = new FormData();
        formData.append("file", resized, file.name);
        formData.append("save", "true");
        formData.append("notes", notes);
        
        const response = await fetch(`${API_URL}/predict`, {
          method: "POST",
          headers: { "x-device-id": getDeviceId() },
          body: formData,
        });
        
        const data = await response.json();
        
        if (response.ok) {
          results.push({ filename: file.name, ...data, success: true });
          const newHistoryItem = {
            _id: "temp-" + Date.now() + i,
            filename: file.name,
            label: data.label,
            confidence: data.confidence,
            is_fresh: data.is_fresh,
            timestamp: new Date().toISOString(),
            model_used: data.model_used || "YOLO",
            notes: notes,
            detections: data.detections || [],
            detection_count: data.detection_count || 1,
          };
          setHistory((prev) => [newHistoryItem, ...prev]);
        } else {
          results.push({ filename: file.name, error: data.error, success: false });
        }
      } catch (err) {
        results.push({ filename: file.name, error: "Failed to process", success: false });
      }
      
      await new Promise((r) => setTimeout(r, 500));
    }
    
    setBatchProgress(100);
    setBatchResults(results);
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${API_URL}/history`, {
        headers: { "x-device-id": getDeviceId() },
      });
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
      // ADD HEADERS HERE
      const response = await fetch(`${API_URL}/history/${id}`, {
        method: "DELETE",
        headers: { "x-device-id": getDeviceId() }, // <--- ADD THIS
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
    try {
      const response = await fetch(`${API_URL}/history`, {
        method: "DELETE",
        headers: { "x-device-id": getDeviceId() }, 
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
    
    // Helper function to escape CSV fields
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      // If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    
    const headers = [
      "Timestamp",
      "Filename",
      "Label",
      "Is Fresh",
      "Confidence",
      "Model",
      "Notes",
    ];
    
    const rows = history.map((item) => [
      escapeCSV(new Date(item.timestamp).toLocaleString('en-GB')),
      escapeCSV(item.filename),
      escapeCSV(item.label),
      item.is_fresh ? "Yes" : "No",
      item.confidence.toFixed(2),
      escapeCSV(item.model_used),
      escapeCSV(item.notes || ""),
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "freshx_history_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (history.length === 0) return;
    
    const doc = new jsPDF();
    const freshCount = history.filter((h) => h.is_fresh).length;
    const rottenCount = history.length - freshCount;
    const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / history.length;
    
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FreshX Detection Report", 14, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary Statistics", 14, 48);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Detections: ${history.length}`, 14, 58);
    doc.text(`Fresh: ${freshCount} (${((freshCount / history.length) * 100).toFixed(1)}%)`, 14, 66);
    doc.text(`Rotten: ${rottenCount} (${((rottenCount / history.length) * 100).toFixed(1)}%)`, 14, 74);
    doc.text(`Average Confidence: ${avgConfidence.toFixed(1)}%`, 14, 82);
    doc.text(`Model: YOLOv8 (Fruit Freshness Detection)`, 14, 90);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detection History", 14, 106);
    
    autoTable(doc, {
      startY: 113,
      head: [["Date/Time", "Label", "Status", "Confidence", "Notes"]],
      body: history.map((item) => [
        new Date(item.timestamp).toLocaleString(),
        item.label,
        item.is_fresh ? "Fresh" : "Rotten",
        `${item.confidence.toFixed(1)}%`,
        (item.notes || "-").substring(0, 30),
      ]),
      headStyles: { fillColor: [16, 185, 129] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9 },
    });
    
    doc.save("freshx_report.pdf");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchHistory();
      setSelectedHistoryItem(null);
      stopCamera();
    }
    if (tab === "scanner") {
      stopCamera();
    }
  };

  const uniqueFruitTypes = [...new Set(history.map((item) => {
    const label = item.label.toLowerCase();
    return label.replace(/fresh |rotten /gi, "").trim();
  }))].filter(type => type && !type.includes("no fruit") && !type.includes("no detection"));

  const filteredHistory = history.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.label.toLowerCase().includes(searchLower) ||
      item.filename.toLowerCase().includes(searchLower) ||
      (item.notes && item.notes.toLowerCase().includes(searchLower));
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "fresh" && item.is_fresh) ||
      (filterStatus === "rotten" && !item.is_fresh);
    
    const itemFruitType = item.label.toLowerCase().replace(/fresh |rotten /gi, "").trim();
    const matchesFruitType = filterFruitType === "all" || itemFruitType === filterFruitType;
    
    const itemDate = new Date(item.timestamp);
    const matchesDateFrom = !dateFrom || itemDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || itemDate <= new Date(dateTo + "T23:59:59");
    
    return matchesSearch && matchesStatus && matchesFruitType && matchesDateFrom && matchesDateTo;
  });

  const modelIndicator = result
    ? result.model_used
    : history[0]
    ? history[0].model_used
    : "fruit";

  return (
    <div className="app-container min-h-screen bg-gray-900 text-white font-sans selection:bg-emerald-500 selection:text-white overflow-y-auto">
      <style>{scannerStyles}</style>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <header className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
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
              <div className="text-center mb-4">
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
                      // Auto-start camera when switching to camera mode
                      startCamera();
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

                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 h-64 bg-gray-900 flex items-center justify-center">
                  {scannerMode === "camera" ? (
                    isCameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          className="absolute inset-0 w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                        {/* Live stats overlay during realtime capture */}
                        {isRealtimeCapture && (
                          <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start">
                            <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                <span className="text-white font-medium">Auto-Scanning</span>
                              </div>
                              <div className="text-gray-300 mt-1">
                                Captures: {captureCount}
                              </div>
                            </div>
                            {bestRealtimeResult && (
                              <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 text-xs text-right">
                                <div className="text-gray-400">Best Confidence</div>
                                <div className={`text-lg font-bold ${bestRealtimeResult.is_fresh ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {bestRealtimeResult.confidence.toFixed(1)}%
                                </div>
                                <div className={`text-xs ${bestRealtimeResult.is_fresh ? 'text-emerald-300' : 'text-red-300'}`}>
                                  {bestRealtimeResult.label}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Camera controls with notes input */}
                        <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center gap-3">
                          {!isRealtimeCapture && (
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add notes (optional)"
                              className="w-full max-w-xs px-3 py-2 bg-black/60 backdrop-blur-md border border-gray-500 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                          )}
                          {isRealtimeCapture ? (
                            <button
                              onClick={stopRealtimeCapture}
                              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                              <X className="w-5 h-5" /> Stop & Save Best
                            </button>
                          ) : (
                            <button
                              onClick={startRealtimeCapture}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6 py-2 font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                              <Video className="w-5 h-5" /> Start Auto-Scan
                            </button>
                          )}
                        </div>
                      </>
                    ) : result ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={`data:image/jpeg;base64,${result.heatmap_b64}`}
                          alt="Best Captured Shot"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          onClick={resetSelection}
                          className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-md z-30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-2xl border border-gray-700 bg-gray-900 flex flex-col items-center justify-center text-center p-4">
                        <Loader2 className="w-12 h-12 text-emerald-500 mb-4 animate-spin" />
                        <p className="text-lg font-medium text-gray-400">
                          Starting Camera...
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {!preview ? (
                        <div
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDragOver={handleDragOver}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                            const files = Array.from(e.dataTransfer.files);
                            const validTypes = ["image/png", "image/jpg", "image/jpeg"];
                            const maxSize = 5 * 1024 * 1024; // 5MB
                            
                            const validFiles = files.filter((f) => {
                              if (!validTypes.includes(f.type)) {
                                setError(`Invalid file type: ${f.name}. Only PNG, JPG, JPEG allowed.`);
                                return false;
                              }
                              if (f.size > maxSize) {
                                setError(`File too large: ${f.name}. Max size is 5MB.`);
                                return false;
                              }
                              return true;
                            });
                            
                            if (validFiles.length === 0) return;
                            
                            setError(null);
                            if (validFiles.length > 1) {
                              setBatchFiles(validFiles);
                              setFile(null);
                              setPreview(null);
                            } else if (validFiles.length === 1) {
                              setFile(validFiles[0]);
                              setPreview(URL.createObjectURL(validFiles[0]));
                              setBatchFiles([]);
                            }
                            setResult(null);
                          }}
                          onClick={triggerFileInput}
                          className={`border-2 border-dashed rounded-2xl w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group p-4 text-center ${
                            isDragging
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-gray-600 hover:border-emerald-500 hover:bg-gray-800"
                          }`}
                        >
                          <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-8 h-8 text-emerald-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-300 group-hover:text-white">
                            Click or drag images here
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            PNG, JPG, JPEG (max 5MB)
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              const validTypes = ["image/png", "image/jpg", "image/jpeg"];
                              const maxSize = 5 * 1024 * 1024; // 5MB
                              
                              const validFiles = files.filter((f) => {
                                if (!validTypes.includes(f.type)) {
                                  setError(`Invalid file type: ${f.name}. Only PNG, JPG, JPEG allowed.`);
                                  return false;
                                }
                                if (f.size > maxSize) {
                                  setError(`File too large: ${f.name}. Max size is 5MB.`);
                                  return false;
                                }
                                return true;
                              });
                              
                              if (validFiles.length === 0) return;
                              
                              setError(null);
                              if (validFiles.length > 1) {
                                setBatchFiles(validFiles);
                                setFile(null);
                                setPreview(null);
                              } else if (validFiles.length === 1) {
                                setFile(validFiles[0]);
                                setPreview(URL.createObjectURL(validFiles[0]));
                                setBatchFiles([]);
                              }
                              setResult(null);
                            }}
                            accept=".png,.jpg,.jpeg"
                            multiple
                            className="hidden"
                          />
                        </div>
                      ) : batchFiles.length > 0 ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          <div className="text-center mb-4">
                            <span className="text-2xl font-bold text-emerald-400">{batchFiles.length}</span>
                            <span className="text-gray-400 ml-2">files selected</span>
                          </div>
                          <div className="w-full max-h-32 overflow-y-auto space-y-1 mb-4">
                            {batchFiles.slice(0, 5).map((f, i) => (
                              <div key={i} className="text-sm text-gray-300 truncate px-2 py-1 bg-gray-800 rounded">
                                📁 {f.name}
                              </div>
                            ))}
                            {batchFiles.length > 5 && (
                              <div className="text-sm text-gray-500 px-2">
                                ...and {batchFiles.length - 5} more
                              </div>
                            )}
                          </div>
                          <button
                            onClick={resetSelection}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Clear Selection
                          </button>
                        </div>
                      ) : (
                        <>
                          <img
                            src={preview}
                            alt="Upload Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          {result && result.heatmap_b64 && (
                            <img
                              src={`data:image/jpeg;base64,${result.heatmap_b64}`}
                              alt="Detection Result"
                              className="absolute inset-0 w-full h-full object-contain z-10"
                            />
                          )}
                          <button
                            onClick={resetSelection}
                            className="absolute top-3 right-3 bg-gray-900/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors backdrop-blur-md z-30"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 z-40 pointer-events-none">
                      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"></div>
                      <div className="absolute w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-scan z-50"></div>
                      <div
                        className="absolute inset-0 opacity-20 z-40"
                        style={{
                          backgroundImage:
                            "linear-gradient(0deg, transparent 24%, rgba(16, 185, 129, .3) 25%, rgba(16, 185, 129, .3) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .3) 75%, rgba(16, 185, 129, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(16, 185, 129, .3) 25%, rgba(16, 185, 129, .3) 26%, transparent 27%, transparent 74%, rgba(16, 185, 129, .3) 75%, rgba(16, 185, 129, .3) 76%, transparent 77%, transparent)",
                          backgroundSize: "50px 50px",
                        }}
                      ></div>
                      <div className="absolute bottom-4 left-0 right-0 text-center z-50">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 rounded-full text-emerald-400 font-mono text-sm border border-emerald-500/30">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          ANALYZING TARGET...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  {result && !loading ? (
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
                    <div className="mt-4">
                      {!result && scannerMode === "upload" && (
                        <>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes (e.g., Warehouse A, Batch #102)"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          />
                          {batchFiles.length > 0 ? (
                            <>
                              {isBatchMode && batchProgress > 0 && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                                    <span>Processing batch...</span>
                                    <span>{Math.round(batchProgress)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-300"
                                      style={{ width: `${batchProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              {batchResults.length > 0 && !loading && (
                                <div className="mt-4 p-4 bg-gray-800 rounded-xl border border-gray-700">
                                  <h4 className="font-bold text-white mb-3">Batch Results</h4>
                                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                    <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                                      <span className="text-2xl font-bold text-emerald-400">
                                        {batchResults.filter(r => r.success && r.is_fresh).length}
                                      </span>
                                      <p className="text-xs text-gray-400">Fresh</p>
                                    </div>
                                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                      <span className="text-2xl font-bold text-red-400">
                                        {batchResults.filter(r => r.success && !r.is_fresh).length}
                                      </span>
                                      <p className="text-xs text-gray-400">Rotten</p>
                                    </div>
                                  </div>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {batchResults.map((r, i) => (
                                      <div key={i} className={`flex justify-between text-sm p-2 rounded ${r.success ? (r.is_fresh ? 'bg-emerald-500/10' : 'bg-red-500/10') : 'bg-gray-700'}`}>
                                        <span className="truncate flex-1 text-gray-300">{r.filename}</span>
                                        <span className={r.success ? (r.is_fresh ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}>
                                          {r.success ? `${r.confidence.toFixed(0)}%` : 'Failed'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    onClick={resetSelection}
                                    className="w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
                                  >
                                    Process Another Batch
                                  </button>
                                </div>
                              )}
                              {!isBatchMode && (
                                <button
                                  onClick={handleBatchUpload}
                                  disabled={loading}
                                  className="w-full mt-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                  <Upload className="w-6 h-6" /> Analyze {batchFiles.length} Files
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={handlePrediction}
                              disabled={!file || loading}
                              className={`w-full mt-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                !file
                                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                  : "bg-white text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              <ScanSearch className="w-6 h-6" /> Detect File
                            </button>
                          )}
                        </>
                      )}
                    </div>
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
                    <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button
                    onClick={exportPDF}
                    disabled={history.length === 0}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    title="Export PDF Report"
                  >
                    <FileText className="w-4 h-4" />{" "}
                    <span className="hidden sm:inline">PDF</span>
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
              <HistoryAnalytics history={filteredHistory} />
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by label, filename, batch ID, notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="relative w-full sm:w-36">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="fresh">Fresh Only</option>
                      <option value="rotten">Rotten Only</option>
                    </select>
                  </div>
                  {uniqueFruitTypes.length > 0 && (
                    <div className="relative w-full sm:w-40">
                      <select
                        value={filterFruitType}
                        onChange={(e) => setFilterFruitType(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer capitalize"
                      >
                        <option value="all">All Fruits</option>
                        {uniqueFruitTypes.map((type) => (
                          <option key={type} value={type} className="capitalize">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-400 text-sm shrink-0">From:</span>
                    <input
                      type="date"
                      lang="en-GB"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-gray-400 text-sm shrink-0">To:</span>
                    <input
                      type="date"
                      lang="en-GB"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {(dateFrom || dateTo || filterFruitType !== "all" || filterStatus !== "all" || searchTerm) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setFilterFruitType("all");
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="text-sm text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}
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
                          ).toLocaleString('en-GB')}
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
                    {selectedHistoryItem.notes && (
                      <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 md:col-span-2">
                        <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">
                          Notes
                        </span>
                        <span className="text-lg text-emerald-400 block">
                          {selectedHistoryItem.notes}
                        </span>
                      </div>
                    )}
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
                          {item.notes && (
                            <div className="text-xs text-emerald-400 mt-1 truncate max-w-[200px]">
                              📝 {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-700 pt-3 sm:pt-0">
                        <div className="flex flex-col items-start sm:items-end">
                          <div className="font-bold text-xl text-white">
                            {item.confidence.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.timestamp).toLocaleString('en-GB')}
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
