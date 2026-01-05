"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, FileText, X, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function ImportPage() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null);
  
  const [jobs, setJobs] = useState<PagedImportJobs | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ImportStatus | "">("");
  const [sort, setSort] = useState("createdAt,desc");
  
  const [pollingJobs, setPollingJobs] = useState<Set<number>>(new Set());
  const [jobDetails, setJobDetails] = useState<Map<number, ImportJob>>(new Map());

  // Fetch import jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: ImportJobListParams = {
        page,
        size: 20,
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
        
        // Start polling for active jobs
        const activeJobs = result.data.data.content.filter(
          (job) => !isJobFinished(job.status)
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
  }, [page, statusFilter, sort]);

  // Poll job status
  const startPolling = useCallback((jobId: number) => {
    if (pollingJobs.has(jobId)) return;

    setPollingJobs((prev) => new Set(prev).add(jobId));

    const poll = async () => {
      try {
        const result = await importApi.getImportJob(jobId);
        
        if (result.data?.data) {
          const job = result.data.data;
          setJobDetails((prev) => {
            const updated = new Map(prev);
            updated.set(jobId, job);
            return updated;
          });

          // Stop polling if job is finished
          if (isJobFinished(job.status)) {
            setPollingJobs((prev) => {
              const updated = new Set(prev);
              updated.delete(jobId);
              return updated;
            });
            // Refresh job list
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

    // Poll immediately, then every 2 seconds
    poll();
    const interval = setInterval(poll, 2000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      setPollingJobs((prev) => {
        const updated = new Set(prev);
        updated.delete(jobId);
        return updated;
      });
    };
  }, [pollingJobs, fetchJobs]);

  // Initial fetch and setup polling
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith(".csv")) {
        setUploadError("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const result = await importApi.uploadProductCSV(file);
      
      if (result.error) {
        setUploadError(result.error.message || "Upload failed");
        return;
      }

      if (result.data?.data) {
        const jobId = result.data.data;
        setUploadSuccess(jobId);
        setFile(null);
        
        // Reset file input
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";

        // Start polling the new job
        startPolling(jobId);
        
        // Refresh job list after a short delay
        setTimeout(() => {
          fetchJobs();
        }, 1000);
      }
    } catch (error: any) {
      setUploadError(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel job
  const handleCancelJob = async (jobId: number) => {
    if (!confirm(t("admin.imports.confirmCancel"))) {
      return;
    }

    try {
      const result = await importApi.cancelImportJob(jobId);
      
      if (result.error) {
        alert(result.error.message || "Failed to cancel job");
        return;
      }

      // Refresh job list
      fetchJobs();
    } catch (error: any) {
      alert(error.message || "Failed to cancel job");
    }
  };

  // Get job details (from cache or from list)
  const getJobDetails = (jobId: number): ImportJob | undefined => {
    return jobDetails.get(jobId) || jobs?.content.find((j) => j.id === jobId);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Parse error message to show first few errors
  const parseErrorMessage = (message?: string): string[] => {
    if (!message) return [];
    const lines = message.split("\n").filter((line) => line.trim());
    return lines.slice(0, 5); // Show first 5 errors
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-light tracking-wide text-foreground mb-2">
          {t("admin.imports.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("admin.imports.subtitle")}
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg p-6">
        <h2 className="text-xl font-light tracking-wide text-foreground mb-4">
          {t("admin.imports.uploadCsv")}
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-input"
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-secondary transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>{t("admin.imports.chooseFile")}</span>
            </label>
            <input
              id="file-input"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
                <span className="text-muted-foreground">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadError(null);
                    setUploadSuccess(null);
                    const fileInput = document.getElementById("file-input") as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 p-3 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {t("admin.imports.uploadStarted", { jobId: uploadSuccess })}
              </span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.imports.uploading")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {t("admin.imports.uploadImport")}
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground mt-4">
            <p className="font-medium mb-1">{t("admin.imports.csvFormat")}</p>
            <p>
              {t("admin.imports.requiredColumns")}
            </p>
            <p className="mt-1">
              {t("admin.imports.recommendedSize")}
            </p>
          </div>
        </div>
      </div>

      {/* Job List Section */}
      <div className="bg-white dark:bg-[#1A1A1A] border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light tracking-wide text-foreground">
              {t("admin.imports.importJobs")}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-border flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-sm text-muted-foreground">
              {t("admin.imports.status")}
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ImportStatus | "");
                setPage(0);
              }}
              className="px-3 py-1.5 border border-border rounded-md bg-background dark:bg-[#1A1A1A] text-foreground text-sm"
            >
              <option value="">{t("admin.imports.allStatuses")}</option>
              <option value="PENDING">{t("admin.imports.pending")}</option>
              <option value="PROCESSING">{t("admin.imports.processing")}</option>
              <option value="COMPLETED">{t("admin.imports.completed")}</option>
              <option value="FAILED">{t("admin.imports.failed")}</option>
              <option value="PARTIAL_SUCCESS">{t("admin.imports.partialSuccess")}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground">
              {t("admin.imports.sort")}
            </label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
              className="px-3 py-1.5 border border-border rounded-md bg-background dark:bg-[#1A1A1A] text-foreground text-sm"
            >
              <option value="createdAt,desc">{t("admin.imports.newestFirst")}</option>
              <option value="createdAt,asc">{t("admin.imports.oldestFirst")}</option>
              <option value="completedAt,desc">{t("admin.imports.recentlyCompleted")}</option>
              <option value="status,asc">{t("admin.imports.statusAZ")}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.imports.id")}</TableHead>
                <TableHead>{t("admin.imports.file")}</TableHead>
                <TableHead>{t("admin.imports.status")}</TableHead>
                <TableHead>{t("admin.imports.progress")}</TableHead>
                <TableHead>{t("admin.imports.createdAt")}</TableHead>
                <TableHead>{t("admin.imports.completedAt")}</TableHead>
                <TableHead>{t("admin.imports.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && !jobs ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : jobs?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("admin.imports.noJobsFound")}
                  </TableCell>
                </TableRow>
              ) : (
                jobs?.content.map((job) => {
                  const details = getJobDetails(job.id);
                  const isPolling = pollingJobs.has(job.id);
                  const displayJob = details || job;

                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">
                        #{displayJob.id}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {displayJob.fileUrl}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(displayJob.status)
                          )}
                        >
                          {isPolling && (
                            <Loader2 className="h-3 w-3 inline-block mr-1 animate-spin" />
                          )}
                          {formatStatus(displayJob.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {displayJob.totalRecords !== undefined ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 dark:text-green-400">
                                {displayJob.successCount || 0} success
                              </span>
                              {displayJob.errorCount !== undefined &&
                                displayJob.errorCount > 0 && (
                                  <span className="text-red-600 dark:text-red-400">
                                    {displayJob.errorCount} errors
                                  </span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total: {displayJob.totalRecords}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(displayJob.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(displayJob.completedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canCancelJob(displayJob.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelJob(displayJob.id)}
                            >
                              {t("admin.imports.cancel")}
                            </Button>
                          )}
                          {displayJob.message && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                {t("admin.imports.viewErrors")}
                              </summary>
                              <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive max-w-md">
                                {parseErrorMessage(displayJob.message).map(
                                  (error, idx) => (
                                    <div key={idx} className="mb-1">
                                      {error}
                                    </div>
                                  )
                                )}
                                {displayJob.message.split("\n").length > 5 && (
                                  <div className="mt-1 text-xs opacity-75">
                                    {t("admin.imports.andMoreErrors")}
                                  </div>
                                )}
                              </div>
                            </details>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {jobs && jobs.totalPages > 1 && (
          <div className="p-6 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t("admin.imports.showing")} {jobs.number * jobs.size + 1} {t("admin.imports.to")}{" "}
              {Math.min((jobs.number + 1) * jobs.size, jobs.totalElements)} {t("admin.imports.of")}{" "}
              {jobs.totalElements} {t("admin.imports.jobs")}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={jobs.first || loading}
              >
                {t("common.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("admin.imports.page")} {jobs.number + 1} {t("admin.imports.of")} {jobs.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={jobs.last || loading}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

