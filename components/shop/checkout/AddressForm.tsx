"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
} from "react";
import {
  UseFormRegisterReturn,
  FieldError,
  UseFormSetValue,
  Control,
  UseFormWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  locationApi,
  type ProvinceResponse,
  type WardResponse,
} from "@/lib/api/location";
import { Loader2, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Get localized name based on current language.
 * Returns nameEn if language is English, otherwise returns name (Vietnamese).
 */
function getLocalizedName(
  name: string,
  nameEn?: string,
  language?: string
): string {
  if (language === "en" && nameEn && nameEn.trim()) {
    return nameEn;
  }
  return name || nameEn || "";
}

// ============================================================================
// Types
// ============================================================================

export interface AddressFormData {
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  districtName: string;
  detailAddress: string;
}

interface AddressFormProps {
  recipientName: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  phone: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  provinceCode: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  provinceName: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  wardCode: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  wardName: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  districtName: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  detailAddress: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  setValue: UseFormSetValue<any>;
  control: Control<any>;
  watch: UseFormWatch<any>;
  labels?: {
    recipientName?: string;
    recipientNamePlaceholder?: string;
    phone?: string;
    phonePlaceholder?: string;
    province?: string;
    provincePlaceholder?: string;
    district?: string;
    districtPlaceholder?: string;
    ward?: string;
    wardPlaceholder?: string;
    detailAddress?: string;
    detailAddressPlaceholder?: string;
  };
}

// ============================================================================
// Searchable Province Select Component
// ============================================================================

interface SearchableProvinceSelectProps {
  provinces: ProvinceResponse[];
  value: string;
  onValueChange: (provinceCode: string, provinceName: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: FieldError;
  disabled?: boolean;
}

function SearchableProvinceSelect({
  provinces,
  value,
  onValueChange,
  placeholder = "Chọn tỉnh/thành phố...",
  isLoading = false,
  error,
  disabled = false,
}: SearchableProvinceSelectProps) {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<ProvinceResponse[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLanguage = i18n.language || "vi";

  // Debounce search query to reduce re-renders
  const debouncedSearch = useDebounce(searchQuery, 150);

  // Pre-compute searchable data once when provinces change
  const searchableProvinces = useMemo(() => {
    return provinces.map((province) => {
      const displayName = getLocalizedName(
        province.name,
        province.nameEn,
        currentLanguage
      );
      const displayFullName = getLocalizedName(
        province.fullName,
        province.fullNameEn,
        currentLanguage
      );
      const searchText = [
        displayName,
        displayFullName,
        province.code,
        province.name || "",
        province.nameEn || "",
        province.fullName || "",
        province.fullNameEn || "",
      ]
        .join(" ")
        .toLowerCase();

      return { province, displayName, displayFullName, searchText };
    });
  }, [provinces, currentLanguage]);

  // Filter with debounced search - use startTransition for non-urgent updates
  useEffect(() => {
    startTransition(() => {
      if (!debouncedSearch.trim()) {
        setFilteredResults(provinces.slice(0, 50));
        return;
      }

      const query = debouncedSearch.toLowerCase().trim();
      const queryWords = query.split(/\s+/);

      const matched = searchableProvinces
        .filter(({ searchText }) =>
          queryWords.every((word) => searchText.includes(word))
        )
        .slice(0, 50);

      // Simple sort: starts with query first
      matched.sort((a, b) => {
        const aStarts = a.displayName.toLowerCase().startsWith(query);
        const bStarts = b.displayName.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setFilteredResults(matched.map(({ province }) => province));
    });
  }, [debouncedSearch, searchableProvinces, provinces]);

  // Initialize filtered results
  useEffect(() => {
    if (provinces.length > 0 && filteredResults.length === 0) {
      setFilteredResults(provinces.slice(0, 50));
    }
  }, [provinces, filteredResults.length]);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.code === value),
    [provinces, value]
  );

  const handleSelect = useCallback(
    (provinceCode: string) => {
      const province = provinces.find((p) => p.code === provinceCode);
      if (province) {
        const displayName = getLocalizedName(
          province.name,
          province.nameEn,
          currentLanguage
        );
        onValueChange(province.code, displayName);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [provinces, currentLanguage, onValueChange]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Focus input after popover opens
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchQuery("");
    }
  }, []);

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled || isLoading}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none transition-all duration-300 px-0 py-3 text-left",
              error && "border-red-500 dark:border-red-500",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed"
            )}
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          >
            <span
              className={cn(
                !selectedProvince && "text-gray-400 dark:text-zinc-500"
              )}
            >
              {selectedProvince
                ? getLocalizedName(
                    selectedProvince.name,
                    selectedProvince.nameEn,
                    currentLanguage
                  )
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          {/* Search Input - separate from the list */}
          <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm tỉnh/thành phố..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4b483]/50"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Province List */}
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchQuery
                  ? "Không tìm thấy tỉnh/thành phố"
                  : "Không có dữ liệu"}
              </div>
            ) : (
              filteredResults.map((province) => {
                const displayName = getLocalizedName(
                  province.name,
                  province.nameEn,
                  currentLanguage
                );
                const isSelected = province.code === value;
                return (
                  <button
                    key={province.code}
                    type="button"
                    onClick={() => handleSelect(province.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                      isSelected && "bg-gray-50 dark:bg-zinc-800/50"
                    )}
                  >
                    <span className="truncate">{displayName}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#d4b483] flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Searchable Ward Select Component
// ============================================================================

interface SearchableWardSelectProps {
  wards: WardResponse[];
  value: string;
  onValueChange: (wardCode: string, wardName: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: FieldError;
  disabled?: boolean;
}

function SearchableWardSelect({
  wards,
  value,
  onValueChange,
  placeholder = "Chọn phường/xã...",
  isLoading = false,
  error,
  disabled = false,
}: SearchableWardSelectProps) {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<WardResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLanguage = i18n.language || "vi";

  // Debounce search query to reduce re-renders
  const debouncedSearch = useDebounce(searchQuery, 150);

  // Pre-compute searchable data once when wards change
  const searchableWards = useMemo(() => {
    return wards.map((ward) => {
      const displayName = getLocalizedName(
        ward.name,
        ward.nameEn,
        currentLanguage
      );
      const displayFullName = getLocalizedName(
        ward.fullName,
        ward.fullNameEn,
        currentLanguage
      );
      const searchText = [
        displayName,
        displayFullName,
        ward.code,
        ward.name || "",
        ward.nameEn || "",
        ward.fullName || "",
        ward.fullNameEn || "",
      ]
        .join(" ")
        .toLowerCase();

      return { ward, displayName, displayFullName, searchText };
    });
  }, [wards, currentLanguage]);

  // Filter with debounced search - use startTransition for non-urgent updates
  useEffect(() => {
    startTransition(() => {
      if (!debouncedSearch.trim()) {
        setFilteredResults(wards.slice(0, 50));
        return;
      }

      const query = debouncedSearch.toLowerCase().trim();
      const queryWords = query.split(/\s+/);

      const matched = searchableWards
        .filter(({ searchText }) =>
          queryWords.every((word) => searchText.includes(word))
        )
        .slice(0, 50);

      // Simple sort: starts with query first
      matched.sort((a, b) => {
        const aStarts = a.displayName.toLowerCase().startsWith(query);
        const bStarts = b.displayName.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setFilteredResults(matched.map(({ ward }) => ward));
    });
  }, [debouncedSearch, searchableWards, wards]);

  // Initialize/reset filtered results when wards change
  useEffect(() => {
    setFilteredResults(wards.slice(0, 50));
    setSearchQuery("");
  }, [wards]);

  const selectedWard = useMemo(
    () => wards.find((w) => w.code === value),
    [wards, value]
  );

  const handleSelect = useCallback(
    (wardCode: string) => {
      const ward = wards.find((w) => w.code === wardCode);
      if (ward) {
        const displayName = getLocalizedName(
          ward.name,
          ward.nameEn,
          currentLanguage
        );
        onValueChange(ward.code, displayName);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [wards, currentLanguage, onValueChange]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Focus input after popover opens
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setSearchQuery("");
    }
  }, []);

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled || isLoading}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none transition-all duration-300 px-0 py-3 text-left",
              error && "border-red-500 dark:border-red-500",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed"
            )}
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          >
            <span
              className={cn(
                !selectedWard && "text-gray-400 dark:text-zinc-500"
              )}
            >
              {selectedWard
                ? getLocalizedName(
                    selectedWard.name,
                    selectedWard.nameEn,
                    currentLanguage
                  )
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          sideOffset={4}
        >
          {/* Search Input - separate from the list */}
          <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm phường/xã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4b483]/50"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Ward List */}
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchQuery ? "Không tìm thấy phường/xã" : "Không có dữ liệu"}
              </div>
            ) : (
              filteredResults.map((ward) => {
                const displayName = getLocalizedName(
                  ward.name,
                  ward.nameEn,
                  currentLanguage
                );
                const isSelected = ward.code === value;
                return (
                  <button
                    key={ward.code}
                    type="button"
                    onClick={() => handleSelect(ward.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                      isSelected && "bg-gray-50 dark:bg-zinc-800/50"
                    )}
                  >
                    <span className="truncate">{displayName}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#d4b483] flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Main AddressForm Component
// ============================================================================

export function AddressForm({
  recipientName,
  phone,
  provinceCode,
  provinceName,
  wardCode,
  wardName,
  districtName,
  detailAddress,
  setValue,
  control,
  watch,
  labels = {},
}: AddressFormProps) {
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const result = await locationApi.getAllProvinces();
        if (result.data) {
          setProvinces(result.data);
        }
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Handle province selection
  const handleProvinceChange = (provinceCode: string, provinceName: string) => {
    setValue("provinceCode", provinceCode, { shouldValidate: true });
    setValue("provinceName", provinceName, { shouldValidate: true });

    // Reset ward selection when province changes
    setValue("wardCode", "", { shouldValidate: true });
    setValue("wardName", "", { shouldValidate: true });
  };

  // Handle ward selection
  const handleWardChange = (wardCode: string, wardName: string) => {
    setValue("wardCode", wardCode, { shouldValidate: true });
    setValue("wardName", wardName, { shouldValidate: true });
  };

  // Watch provinceCode and wardCode from form (single source of truth)
  const watchedProvinceCode = watch("provinceCode") || "";
  const watchedWardCode = watch("wardCode") || "";

  // Debounce province code to optimize API calls
  const debouncedProvinceCode = useDebounce(watchedProvinceCode, 300);

  // Load wards when province is selected (using debounced value)
  useEffect(() => {
    if (!debouncedProvinceCode) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      setIsLoadingWards(true);
      try {
        const result = await locationApi.getWardsByProvince(
          debouncedProvinceCode
        );
        if (result.data) {
          setWards(result.data);
        }
      } catch (error) {
        console.error("Failed to load wards:", error);
        setWards([]);
      } finally {
        setIsLoadingWards(false);
      }
    };

    loadWards();
  }, [debouncedProvinceCode]);

  const inputClassName =
    "bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none focus:ring-1 focus:ring-[#d4b483]/30 transition-all duration-300 px-0 py-3 rounded-none";

  return (
    <div className="pt-4 space-y-4">
      {/* Recipient Name */}
      <div className="relative">
        <Label
          htmlFor="recipientName"
          className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {labels.recipientName || "Tên người nhận"}
        </Label>
        <Input
          id="recipientName"
          type="text"
          {...recipientName.register}
          className={inputClassName}
          placeholder={labels.recipientNamePlaceholder || "Nhập tên người nhận"}
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        />
        {recipientName.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {recipientName.error.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div className="relative">
        <Label
          htmlFor="phone"
          className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {labels.phone || "Số điện thoại"}
        </Label>
        <Input
          id="phone"
          type="tel"
          {...phone.register}
          className={inputClassName}
          placeholder={labels.phonePlaceholder || "Nhập số điện thoại"}
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        />
        {phone.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {phone.error.message}
          </p>
        )}
      </div>

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province (Searchable Select) */}
        <div className="relative">
          <Label
            htmlFor="province"
            className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {labels.province || "Tỉnh/Thành phố"}
          </Label>
          <SearchableProvinceSelect
            provinces={provinces}
            value={watchedProvinceCode}
            onValueChange={handleProvinceChange}
            placeholder={labels.provincePlaceholder || "Chọn tỉnh/thành phố..."}
            isLoading={isLoadingProvinces}
            error={provinceCode.error}
          />
          {/* Hidden inputs for provinceCode and provinceName */}
          <input type="hidden" {...provinceCode.register} />
          <input type="hidden" {...provinceName.register} />
        </div>

        {/* District (Text Input) */}
        <div className="relative">
          <Label
            htmlFor="districtName"
            className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {labels.district || "Quận/Huyện"}
          </Label>
          <input
            id="districtName"
            type="text"
            {...districtName.register}
            className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none transition-all duration-300 px-0 py-3 text-left"
            placeholder={labels.districtPlaceholder || "Nhập quận/huyện"}
            style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
          />
          {districtName.error && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {districtName.error.message}
            </p>
          )}
        </div>

        {/* Ward (Searchable Select) */}
        <div className="relative">
          <Label
            htmlFor="ward"
            className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
            style={{ fontFamily: "var(--font-poppins), sans-serif" }}
          >
            {labels.ward || "Phường/Xã"}
          </Label>
          <SearchableWardSelect
            wards={wards}
            value={watchedWardCode}
            onValueChange={handleWardChange}
            placeholder={labels.wardPlaceholder || "Chọn phường/xã..."}
            isLoading={isLoadingWards}
            error={wardCode.error}
            disabled={!watchedProvinceCode}
          />
          {/* Hidden inputs for wardCode and wardName */}
          <input type="hidden" {...wardCode.register} />
          <input type="hidden" {...wardName.register} />
        </div>
      </div>

      {/* Detail Address */}
      <div className="relative">
        <Label
          htmlFor="detailAddress"
          className="text-xs text-gray-600 dark:text-zinc-400 mb-2 block uppercase tracking-wide"
          style={{ fontFamily: "var(--font-poppins), sans-serif" }}
        >
          {labels.detailAddress || "Địa chỉ chi tiết"}
        </Label>
        <Input
          id="detailAddress"
          type="text"
          {...detailAddress.register}
          className={inputClassName}
          placeholder={
            labels.detailAddressPlaceholder || "Nhập số nhà, tên đường..."
          }
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        />
        {detailAddress.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {detailAddress.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
