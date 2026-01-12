"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Upload, 
  FileText, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  Info, 
  History,
  FileDown,
  Play,
  ArrowRight,
  Database,
  BarChart3,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AdminErrorDisplay } from "@/components/admin/AdminErrorDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importApi } from "@/lib/api/import";
import type {
  ImportJob,
  ImportStatus,
  ImportJobListParams,
  PagedImportJobs,
} from "@/lib/types/import";
import {
  isJobFinished,
  canCancelJob,
  getStatusColor,
  formatStatus,
} from "@/lib/types/import";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Steps for the wizard
type Step = 'upload' | 'review' | 'import';

export default function ImportPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Process state
  const [uploading, setUploading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);
  const [activeJob, setActiveJob] = useState<ImportJob | null>(null);
  
  // History state
  const [jobs, setJobs] = useState<PagedImportJobs | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ImportStatus | "">("");
  const [sort, setSort] = useState("createdAt,desc");
  
  const [pollingJobs, setPollingJobs] = useState<Set<number>>(new Set());
  const [jobDetails, setJobDetails] = useState<Map<number, ImportJob>>(new Map());
  const [pageError, setPageError] = useState<{ title: string; description?: string; items?: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic & Data Management ---

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: ImportJobListParams = {
        page,
        size: 10,
        sort,
        ...(statusFilter && { status: statusFilter }),
      };

      const result = await importApi.listImportJobs(params);
      
      if (result.error) {
        console.error("Failed to fetch jobs:", result.error);
        return;
      }

      if (result.data?.data) {
        setJobs(result.data.data);
        
        // Polling logic for history jobs (background)
        const activeJobs = result.data.data.content.filter(
          (job) => !isJobFinished(job.status) && job.id !== activeJobId
        );
        activeJobs.forEach((job) => {
          if (!pollingJobs.has(job.id)) {
            startPolling(job.id);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sort, activeJobId]);

  const startPolling = useCallback((jobId: number, isActive = false) => {
    if (pollingJobs.has(jobId)) return;

    setPollingJobs((prev) => new Set(prev).add(jobId));

    const poll = async () => {
      try {
        const result = await importApi.getImportJob(jobId);
        
        if (result.data?.data) {
          const job = result.data.data;
          
          if (isActive) {
            setActiveJob(job);
          }

          setJobDetails((prev) => {
            const updated = new Map(prev);
            updated.set(jobId, job);
            return updated;
          });

          if (isJobFinished(job.status)) {
            setPollingJobs((prev) => {
              const updated = new Set(prev);
              updated.delete(jobId);
              return updated;
            });
            fetchJobs();
          }
        }
      } catch (error) {
        console.error(`Error polling job ${jobId}:`, error);
        setPollingJobs((prev) => {
          const updated = new Set(prev);
          updated.delete(jobId);
          return updated;
        });
      }
    };

    poll();
    const interval = setInterval(poll, 2000);

    return () => clearInterval(interval);
  }, [pollingJobs, fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle file selection and local preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setPageError({
           title: "Invalid File Format",
           description: "Our curation engine only accepts standard .csv files for bulk operations.",
           items: [{ message: `The file "${selectedFile.name}" is not a valid CSV.` }]
        });
        return;
      }
      
      setPageError(null);
      setFile(selectedFile);
      
      // Parse a few rows for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const rows = lines.slice(0, 6).map(line => {
          // Simple CSV parse (handles basic commas)
          return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        });
        
        if (rows.length > 0) {
          setHeaders(rows[0]);
          setPreviewData(rows.slice(1));
          setCurrentStep('review');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const [viewingJobId, setViewingJobId] = useState<number | null>(null);

  const resetUpload = () => {
    setFile(null);
    setPreviewData([]);
    setHeaders([]);
    setCurrentStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndImport = async () => {
    if (!file) return;

    setUploading(true);
    setCurrentStep('import');

    try {
      const result = await importApi.uploadProductCSV(file);
      
      if (result.error) {
        setPageError({
           title: "Curation Engine Failure",
           description: "We encountered a technical issue while initializing the import pipeline.",
           items: [{ message: result.error.message || "Unknown communication error with curation server." }]
        });
        setCurrentStep('review');
        setUploading(false);
        return;
      }

      setPageError(null);

      if (result.data?.data) {
        const jobId = result.data.data;
        setActiveJobId(jobId);
        startPolling(jobId, true);
        toast.success(t("admin.imports.uploadStarted", { jobId }));
      }
    } catch (error: any) {
      setPageError({
        title: t("admin.imports.errors.generic"),
        items: [{ message: error.message || t("admin.imports.errors.generic") }]
      });
      setCurrentStep('review');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (!confirm(t("admin.imports.confirmCancel"))) return;

    try {
      const result = await importApi.cancelImportJob(jobId);
      if (result.error) {
        setPageError({
           title: t("admin.imports.errors.cancelFailed"),
           items: [{ message: result.error.message || t("admin.imports.errors.cancelFailed") }]
        });
        return;
      }
      toast.success(t("admin.imports.actions.cancelSuccess"));
      fetchJobs();
    } catch (error: any) {
      setPageError({
        title: t("admin.imports.errors.cancelFailed"),
        items: [{ message: error.message || t("admin.imports.errors.cancelFailed") }]
      });
    }
  };

  // Helper formatting logic
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getJobDetails = (jobId: number): ImportJob | undefined => {
    return jobDetails.get(jobId) || jobs?.content.find((j) => j.id === jobId);
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            {t("admin.imports.title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-light">
            {t("admin.imports.description")}
          </p>
        </div>

        {/* Global Error Panel - Unified Error Handling */}
        <AnimatePresence>
          {pageError && (
            <div className="mb-8 w-full max-w-4xl px-4">
              <AdminErrorDisplay
                title={pageError.title}
                description={pageError.description}
                items={pageError.items}
                onClose={() => setPageError(null)}
                className="shadow-2xl shadow-red-500/10"
              />
            </div>
          )}
        </AnimatePresence>
        
        {/* Stepper UI */}
        <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10 self-start md:self-auto">
          {[
            { id: 'upload', icon: <Upload className="h-3.5 w-3.5" />, label: t("admin.imports.steps.upload") },
            { id: 'review', icon: <FileText className="h-3.5 w-3.5" />, label: t("admin.imports.steps.review") },
            { id: 'import', icon: <Database className="h-3.5 w-3.5" />, label: t("admin.imports.steps.import") }
          ].map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = 
              (currentStep === 'review' && step.id === 'upload') || 
              (currentStep === 'import' && (step.id === 'upload' || step.id === 'review'));

            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300",
                  isActive ? "bg-slate-900 text-white dark:bg-[#D4AF37]" : 
                  isCompleted ? "text-green-600 dark:text-green-500" : "text-slate-400 dark:text-slate-600"
                )}>
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.icon}
                  <span className="text-xs font-medium uppercase tracking-widest">{step.label}</span>
                </div>
                {idx < 2 && <ChevronRight className="h-3 w-3 text-slate-300 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload Selection */}
        {currentStep === 'upload' && (
          <motion.div 
            key="upload"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4"
          >
            <div 
              className="bg-white dark:bg-[#111] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center group hover:border-[#D4AF37]/50 transition-all duration-500 relative overflow-hidden"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) {
                  const fakeEvent = { target: { files: [droppedFile] } } as any;
                  handleFileChange(fakeEvent);
                }
              }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <div className="h-20 w-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
                </div>
                <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-2">
                  {t("admin.imports.uploadArea.title")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-light">
                  {t("admin.imports.uploadArea.subtitle")}
                </p>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                  ref={fileInputRef}
                />
                <Button 
                  asChild
                  className="bg-slate-900 dark:bg-[#D4AF37] text-white hover:opacity-90 px-8 py-6 rounded-xl text-lg font-light"
                >
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    {t("admin.imports.chooseFile")}
                  </label>
                </Button>
                
                <p className="mt-8 text-xs text-slate-400 uppercase tracking-widest font-medium">
                  {t("admin.imports.uploadArea.hint")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("admin.imports.actions.guideTitle")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t("admin.imports.actions.guideHint")}
                  </p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <FileDown className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("admin.imports.actions.sampleTitle")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {t("admin.imports.actions.sampleHint")}
                  </p>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:underline">
                    {t("admin.imports.actions.getTemplate")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Review Preview */}
        {currentStep === 'review' && (
          <motion.div 
            key="review"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 space-y-6"
          >
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-slate-900 dark:text-slate-100">
                      {t("admin.imports.preview.title")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                      {file?.name} • {(file!.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={resetUpload}
                    className="rounded-xl px-6 py-5 border-slate-200 dark:border-slate-800 font-light"
                  >
                    {t("admin.imports.actions.changeFile")}
                  </Button>
                  <Button 
                    onClick={handleUploadAndImport}
                    disabled={uploading}
                    className="bg-slate-900 dark:bg-[#D4AF37] text-white px-8 py-5 rounded-xl font-light"
                  >
                    {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    {t("admin.imports.preview.startImport")}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-white/5 border-none">
                      {headers.map((h, i) => (
                        <TableHead key={i} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 py-4">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, idx) => (
                      <TableRow key={idx} className="border-slate-100 dark:border-slate-900 group">
                        {row.map((cell, i) => (
                          <TableCell key={i} className="py-4 text-sm text-slate-600 dark:text-slate-300 font-light whitespace-nowrap">
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 font-light">
                  {t("admin.imports.actions.showingSample")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Active Import Progress */}
        {currentStep === 'import' && (
          <motion.div 
            key="import"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="px-4 max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-2xl shadow-[#D4AF37]/5">
              {!activeJob ? (
                <div className="space-y-6">
                  <div className="h-24 w-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="h-10 w-10 text-[#D4AF37] animate-spin" />
                  </div>
                  <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100">
                    {t("admin.imports.activeJob.initializing")}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-light max-w-sm mx-auto">
                    {t("admin.imports.activeJob.sending")}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="h-32 w-32 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        <span className="text-2xl font-light text-[#D4AF37]">
                          {activeJob.totalRecords ? Math.round(((activeJob.successCount || 0) + (activeJob.errorCount || 0)) / activeJob.totalRecords * 100) : 0}%
                        </span>
                      </div>
                      <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="60"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="text-[#D4AF37]"
                          strokeDasharray={377}
                          strokeDashoffset={377 - (377 * (activeJob.totalRecords ? ((activeJob.successCount || 0) + (activeJob.errorCount || 0)) / activeJob.totalRecords : 0))}
                          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                        />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-2">
                       {activeJob.status === 'COMPLETED' ? t("admin.imports.activeJob.complete") : 
                        activeJob.status === 'FAILED' ? t("admin.imports.activeJob.failed") :
                        t("admin.imports.activeJob.curating")}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-light max-w-sm">
                      {t("admin.imports.activeJob.processing")}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-500 mb-1">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">{activeJob.successCount || 0}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("admin.imports.activeJob.success")}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-500 mb-1">
                        <XCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">{activeJob.errorCount || 0}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("admin.imports.activeJob.errors")}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 mb-1">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm font-semibold">{activeJob.totalRecords || 0}</span>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("admin.imports.activeJob.total")}</p>
                    </div>
                  </div>

                  {activeJob.status === 'COMPLETED' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4"
                    >
                      <Button 
                        onClick={() => {
                          resetUpload();
                          setActiveJob(null);
                          setActiveJobId(null);
                        }}
                        className="bg-slate-900 dark:bg-[#D4AF37] text-white px-10 py-6 rounded-xl font-light"
                      >
                        {t("admin.imports.activeJob.finishAndClose")}
                      </Button>
                    </motion.div>
                  )}
                  
                  {activeJob.message && (
                    <div className="mt-8 text-left">
                       <AdminErrorDisplay 
                          title={t("admin.imports.errors.processingIssues.title")}
                          variant={activeJob.status === 'FAILED' ? 'error' : 'warning'}
                          description={t("admin.imports.errors.processingIssues.description")}
                          items={activeJob.message.split('\n').map(msg => ({ message: msg }))}
                          onDownloadReport={() => {
                             if (activeJob.errorLogUrl) {
                               window.open(activeJob.errorLogUrl, '_blank');
                             } else {
                                toast.info(t("admin.imports.errors.noLog"));
                             }
                          }}
                       />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Section - Always Visible */}
      <div className="px-4 mt-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10">
              <History className="h-5 w-5 text-slate-500" />
            </div>
            <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100">
              {t("admin.imports.importJobs")}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Filter Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ImportStatus | "");
                  setPage(0);
                }}
                className="bg-transparent text-xs font-medium border-none focus:ring-0 text-slate-600 dark:text-slate-400 uppercase tracking-widest cursor-pointer"
              >
                <option value="">{t("admin.imports.allStatuses")}</option>
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={fetchJobs}
                disabled={loading}
                className="rounded-xl h-10 w-10 border border-slate-200 dark:border-white/10 flex-shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4 text-slate-500", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-900">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 px-6">Source</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Efficiency</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4">Curation Period</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && !jobs ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#D4AF37] opacity-50" />
                    </TableCell>
                  </TableRow>
                ) : jobs?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-slate-400 font-light italic">
                      {t("admin.imports.noJobsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs?.content.map((job) => {
                    const details = getJobDetails(job.id);
                    const isPolling = pollingJobs.has(job.id);
                    const displayJob = details || job;

                    return (
                      <React.Fragment key={job.id}>
                        <TableRow className="border-slate-100 dark:border-slate-900 group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                 <FileText className="h-4 w-4 text-slate-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                                  {displayJob.fileUrl?.split('/').pop() || `Import #${displayJob.id}`}
                                </p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-tighter">
                                  ID: {displayJob.id} • TYPE: {displayJob.type}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-1.5">
                              <div className={cn(
                                "h-1.5 w-1.5 rounded-full animate-pulse",
                                displayJob.status === 'COMPLETED' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                displayJob.status === 'FAILED' ? "bg-red-500" :
                                "bg-amber-500"
                              )} />
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest",
                                displayJob.status === 'COMPLETED' ? "text-green-600" :
                                displayJob.status === 'FAILED' ? "text-red-600" :
                                "text-amber-600"
                              )}>
                                {formatStatus(displayJob.status)}
                              </span>
                               {isPolling && <Loader2 className="h-3 w-3 animate-spin ml-1 text-slate-400" />}
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                  {displayJob.successCount || 0}/{displayJob.totalRecords || 0}
                                </span>
                                <div className="h-1 w-24 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${displayJob.totalRecords ? (displayJob.successCount || 0) / displayJob.totalRecords * 100 : 0}%` }}
                                    className="h-full bg-green-500/60 rounded-full"
                                  />
                                </div>
                              </div>
                              {displayJob.errorCount !== undefined && displayJob.errorCount > 0 && (
                                <span className="text-[9px] text-red-500 font-medium">
                                  • {displayJob.errorCount} exceptions caught
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                               <Clock className="h-3 w-3" />
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-medium leading-none mb-1">{formatDate(displayJob.createdAt)}</span>
                                 {displayJob.completedAt && (
                                    <span className="text-[9px] font-light opacity-60 italic">Completed in {Math.round((new Date(displayJob.completedAt).getTime() - new Date(displayJob.createdAt).getTime()) / 1000)}s</span>
                                 )}
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               {canCancelJob(displayJob.status) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleCancelJob(displayJob.id)}
                                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-medium rounded-lg"
                                  >
                                    {t("admin.imports.actions.cancelJob")}
                                  </Button>
                               )}
                               {displayJob.message && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                                    title={t("admin.imports.actions.viewLog")}
                                    onClick={() => setViewingJobId(viewingJobId === displayJob.id ? null : displayJob.id)}
                                  >
                                    <AlertTriangle className={cn("h-4 w-4 transition-colors", viewingJobId === displayJob.id ? "text-red-500" : "text-slate-400")} />
                                  </Button>
                               )}
                               <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        <AnimatePresence>
                          {viewingJobId === displayJob.id && (
                            <TableRow key={`${job.id}-log`}>
                              <TableCell colSpan={5} className="p-0 border-none bg-slate-50/50 dark:bg-white/[0.02]">
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden border-b border-slate-100 dark:border-slate-900"
                                >
                                  <div className="p-6">
                                     <AdminErrorDisplay 
                                        title={t("admin.imports.errors.processingIssues.title")}
                                        variant={displayJob.status === 'FAILED' ? 'error' : 'warning'}
                                        description={t("admin.imports.errors.processingIssues.description")}
                                        items={(displayJob.message || "").split('\n').map(msg => ({ message: msg }))}
                                        onClose={() => setViewingJobId(null)}
                                        onDownloadReport={() => {
                                           if (displayJob.errorLogUrl) {
                                             window.open(displayJob.errorLogUrl, '_blank');
                                           } else {
                                              toast.info(t("admin.imports.errors.noLog"));
                                           }
                                        }}
                                     />
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {jobs && jobs.totalPages > 1 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                Level: {jobs.number + 1} / {jobs.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={jobs.first || loading}
                  className="rounded-lg h-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                </Button>
                <div className="flex items-center gap-1 px-3">
                  {Array.from({ length: Math.min(jobs.totalPages, 5) }).map((_, i) => (
                    <div key={i} className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      jobs.number === i ? "bg-[#D4AF37] w-4" : "bg-slate-200 dark:bg-slate-700" 
                    )} />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={jobs.last || loading}
                  className="rounded-lg h-9 border-slate-200 dark:border-slate-800 disabled:opacity-30"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
