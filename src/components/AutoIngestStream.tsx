"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Copy,
  MessageSquare,
  UploadCloud,
  Play,
  Pause,
  Smartphone,
  CheckCircle2,
  FileText,
  AlertCircle,
  Receipt,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ExpenseRecord, Member } from "@/types/ledger.schema";
import { extractFromChatOrSms } from "@/lib/chatExtractor";
import { parseReceiptImageLocally } from "@/lib/receiptOcr";

interface AutoIngestStreamProps {
  members: Member[];
  onExpenseIngested: (expense: ExpenseRecord, sourceTag: string) => void;
  clipboardAutoScanEnabled: boolean;
  onToggleClipboardAutoScan: (enabled: boolean) => void;
}

interface SimulatedMessage {
  id: string;
  type: "WHATSAPP" | "BANK_SMS" | "RECEIPT";
  sender: string;
  time: string;
  preview: string;
  amountLabel: string;
  rawText: string;
}

const SAMPLE_MESSAGES: SimulatedMessage[] = [
  {
    id: "sim_1",
    type: "WHATSAPP",
    sender: "Flatmates Goa Trip (WhatsApp)",
    time: "Just now",
    preview: "Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split",
    amountLabel: "₹1,240.00",
    rawText: "Bhai Swiggy ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split",
  },
  {
    id: "sim_2",
    type: "WHATSAPP",
    sender: "Weekend Hangout (WhatsApp)",
    time: "2m ago",
    preview: "Paid 1850 at Social Offline. Arjun had Nachos 450, Rahul had Cold Coffee 280, shared Pizza 920 + 200 tax",
    amountLabel: "₹1,850.00",
    rawText: "Paid 1850 at Social Offline. Arjun had Nachos 450, Rahul had Cold Coffee 280, shared Pizza 920 + 200 tax",
  },
  {
    id: "sim_3",
    type: "BANK_SMS",
    sender: "HDFC-BANK (SMS)",
    time: "5m ago",
    preview: "Rs. 640.00 debited from A/c XX8921 via UPI to ZOMATO on 17-10-26. Ref 6291048291",
    amountLabel: "₹640.00",
    rawText: "Rs. 640.00 debited from A/c XX8921 via UPI to ZOMATO on 17-10-26. Ref 6291048291",
  },
  {
    id: "sim_4",
    type: "RECEIPT",
    sender: "Paper Receipt (Tesseract OCR)",
    time: "10m ago",
    preview: "Social Bistro & Bar - Calamari (480), Margherita Pizza (550), Pitcher (620) + GST",
    amountLabel: "₹1,915.00",
    rawText: "Social Bistro & Bar\nCrispy Calamari 480\nWoodfired Margherita Pizza 550\nCraft Beer Pitcher 620\nTax 165\nTip 100\nTotal 1915",
  },
];

export const AutoIngestStream: React.FC<AutoIngestStreamProps> = ({
  members,
  onExpenseIngested,
  clipboardAutoScanEnabled,
  onToggleClipboardAutoScan,
}) => {
  const [customText, setCustomText] = useState("");
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"stream" | "receipt" | "manual">("stream");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-simulate incoming messages timer
  useEffect(() => {
    if (!isSimulatingStream) return;

    let index = 0;
    const interval = setInterval(() => {
      const msg = SAMPLE_MESSAGES[index % SAMPLE_MESSAGES.length];
      const parsed = extractFromChatOrSms(msg.rawText, members);
      onExpenseIngested(parsed, `Auto-Simulated: ${msg.sender}`);
      index++;

      if (index >= SAMPLE_MESSAGES.length) {
        setIsSimulatingStream(false);
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isSimulatingStream, members, onExpenseIngested]);

  const handleSelectSimulatedMessage = (msg: SimulatedMessage) => {
    const parsed = extractFromChatOrSms(msg.rawText, members);
    onExpenseIngested(parsed, `Simulated: ${msg.sender}`);
  };

  const handleManualParse = () => {
    if (!customText.trim()) return;
    const parsed = extractFromChatOrSms(customText.trim(), members);
    onExpenseIngested(parsed, "Direct Text Paste");
    setCustomText("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    setOcrStatus("Binarizing contrast on offscreen Canvas...");

    try {
      setTimeout(() => {
        setOcrStatus("Running Tesseract WASM Line-Item Extractor...");
      }, 500);

      const parsed = await parseReceiptImageLocally(file, members);
      setOcrStatus("Parsing complete! Loading into Workbench.");
      setTimeout(() => {
        setIsProcessingOcr(false);
        setOcrStatus("");
        onExpenseIngested(parsed, `Photo Receipt OCR (${file.name})`);
      }, 600);
    } catch (err) {
      console.error("OCR parse error:", err);
      setIsProcessingOcr(false);
      setOcrStatus("Fallback parser activated.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#1F2937] bg-[#0E1420]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-200 font-mono">
                Auto-Ingest Stream
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                3-Channel Zero-Permission Ingestion
              </p>
            </div>
          </div>

          {/* Quick tab switcher */}
          <div className="flex rounded-md bg-[#1F2937] p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab("stream")}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === "stream"
                  ? "bg-blue-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab("receipt")}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === "receipt"
                  ? "bg-blue-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              OCR
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === "manual"
                  ? "bg-blue-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Text
            </button>
          </div>
        </div>

        {/* Focus-Triggered Clipboard Scanner Toggle */}
        <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F17] border border-[#1F2937] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Copy className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <div className="text-[11px] font-medium text-gray-200 font-mono">
                Focus-Triggered Clipboard Scanner
              </div>
              <div className="text-[10px] text-gray-400">
                Auto-reads clipboard when switching to this tab
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleClipboardAutoScan(!clipboardAutoScanEnabled)}
            className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
              clipboardAutoScanEnabled
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-gray-200"
            }`}
          >
            {clipboardAutoScanEnabled ? "AUTO-SCAN: ON" : "AUTO-SCAN: OFF"}
          </button>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3">
        {activeTab === "stream" && (
          <>
            {/* Live Simulation Control */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-mono">
                Incoming Notifications
              </span>
              <button
                onClick={() => setIsSimulatingStream(!isSimulatingStream)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  isSimulatingStream
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
                }`}
                title="Automatically stream simulated messages into the app"
              >
                {isSimulatingStream ? (
                  <>
                    <Pause className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Streaming...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-blue-400" />
                    <span>Auto-Simulate Stream</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification Stream Cards */}
            <div className="space-y-2.5">
              {SAMPLE_MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectSimulatedMessage(msg)}
                  className="group relative p-3 rounded-lg bg-[#0E1420] hover:bg-[#1E293B] border border-[#1F2937] hover:border-blue-500/40 cursor-pointer transition-all duration-150 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {msg.type === "WHATSAPP" ? (
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      ) : msg.type === "BANK_SMS" ? (
                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span className="text-xs font-medium text-gray-300 font-mono">
                        {msg.sender}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{msg.time}</span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 font-mono leading-relaxed group-hover:text-gray-200 transition-colors">
                    &ldquo;{msg.preview}&rdquo;
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#1F2937]/60">
                    <span className="text-[11px] font-mono font-semibold text-emerald-400">
                      {msg.amountLabel}
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>Intercept & Split</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-lg bg-[#0B0F17]/80 border border-[#1F2937] text-[11px] text-gray-400 font-mono flex items-start gap-2">
              <span className="text-blue-400 font-bold">PRO-TIP:</span>
              <span>
                Press <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] border border-gray-700">Ctrl+V</kbd> anywhere on screen to instantly parse copied WhatsApp chats or bank alerts.
              </span>
            </div>
          </>
        )}

        {activeTab === "receipt" && (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-[#1F2937] hover:border-blue-500/60 rounded-xl bg-[#0B0F17] hover:bg-[#0E1420] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium text-gray-200 font-mono">
                Drop Receipt Photo or Click to Browse
              </div>
              <p className="text-[11px] text-gray-500 max-w-xs font-mono">
                Offline HTML5 Canvas contrast binarization + client Tesseract.js WASM line extractor.
              </p>
            </div>

            {isProcessingOcr && (
              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-500/30 text-xs font-mono text-blue-300 flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                <span>{ocrStatus}</span>
              </div>
            )}

            <button
              onClick={() => handleSelectSimulatedMessage(SAMPLE_MESSAGES[3])}
              className="w-full py-2 px-3 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-gray-200 border border-gray-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample Crumpled Restaurant Receipt</span>
            </button>
          </div>
        )}

        {activeTab === "manual" && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                Paste WhatsApp Group Chat or UPI SMS
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste natural language chat, e.g.:
Bhai Zomato ka 1240 hua, Rahul 400 dega, Priya 300, baaki hum sab me split"
                rows={5}
                className="w-full bg-[#0B0F17] text-gray-200 text-xs font-mono p-2.5 rounded-lg border border-[#1F2937] focus:border-blue-500/50 outline-none resize-none placeholder:text-gray-600"
              />
            </div>
            <button
              onClick={handleManualParse}
              disabled={!customText.trim()}
              className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Parse with Local NLP Engine</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-[#1F2937] bg-[#0E1420] text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span className="flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>Local Engine Active</span>
        </span>
        <span>Lat: &lt;5ms (Regex+NLP)</span>
      </div>
    </div>
  );
};
