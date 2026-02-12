"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
  forwardRef,
  InputHTMLAttributes,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  Building2,
  Briefcase,
  MapPin,
  Loader2,
  Search,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import {
  locationApi,
  type ProvinceResponse,
  type WardResponse,
} from "@/lib/api/location";
import type {
  UserAddress,
  AddressRequest,
  AddressType,
} from "@/lib/types/profile";

// ============================================================================
// Outlined Input — replaces underline-only LuxuryInput for forms
// ============================================================================

interface OutlinedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const OutlinedInput = forwardRef<HTMLInputElement, OutlinedInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label
            htmlFor={props.id}
            className="text-xs font-medium text-muted-foreground"
          >
            {label}
            {props.required && (
              <span className="text-destructive ml-0.5">*</span>
            )}
          </Label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error &&
              "border-destructive focus:ring-destructive/30 focus:border-destructive",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);
OutlinedInput.displayName = "OutlinedInput";

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: UserAddress | null;
  onSave: (data: AddressRequest) => Promise<void>;
}

const addressTypes: {
  value: AddressType;
  icon: typeof Home;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "HOME",
    icon: Home,
    label: "profile.addresses.home",
    activeClass:
      "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-500/60",
  },
  {
    value: "WORKSPACE",
    icon: Building2,
    label: "profile.addresses.workspace",
    activeClass:
      "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-500/60",
  },
  {
    value: "OFFICE",
    icon: Briefcase,
    label: "profile.addresses.office",
    activeClass:
      "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/60",
  },
  {
    value: "OTHER",
    icon: MapPin,
    label: "profile.addresses.other",
    activeClass:
      "border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-500/60",
  },
];

/**
 * Get localized name based on current language.
 * Returns nameEn if language is English, otherwise returns name (Vietnamese).
 */
function getLocalizedName(
  name: string,
  nameEn?: string,
  language?: string,
): string {
  if (language === "en" && nameEn && nameEn.trim()) {
    return nameEn;
  }
  return name || nameEn || "";
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
  disabled?: boolean;
}

function SearchableProvinceSelect({
  provinces,
  value,
  onValueChange,
  placeholder = "Chọn tỉnh/thành phố...",
  isLoading = false,
  disabled = false,
}: SearchableProvinceSelectProps) {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<ProvinceResponse[]>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLanguage = i18n.language || "vi";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _inputRef = inputRef;

  const debouncedSearch = useDebounce(searchQuery, 150);

  const searchableProvinces = useMemo(() => {
    return provinces.map((province) => {
      const displayName = getLocalizedName(
        province.name,
        province.nameEn,
        currentLanguage,
      );
      const displayFullName = getLocalizedName(
        province.fullName,
        province.fullNameEn,
        currentLanguage,
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
          queryWords.every((word) => searchText.includes(word)),
        )
        .slice(0, 50);

      matched.sort((a, b) => {
        const aStarts = a.displayName.toLowerCase().startsWith(query);
        const bStarts = b.displayName.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setFilteredResults(matched.map(({ province }) => province));
    });
  }, [debouncedSearch, searchableProvinces, provinces]);

  useEffect(() => {
    if (provinces.length > 0 && filteredResults.length === 0) {
      setFilteredResults(provinces.slice(0, 50));
    }
  }, [provinces, filteredResults.length]);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.code === value),
    [provinces, value],
  );

  const handleSelect = useCallback(
    (provinceCode: string) => {
      const province = provinces.find((p) => p.code === provinceCode);
      if (province) {
        const displayName = getLocalizedName(
          province.name,
          province.nameEn,
          currentLanguage,
        );
        onValueChange(province.code, displayName);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [provinces, currentLanguage, onValueChange],
  );

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled || isLoading}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left",
              "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "text-sm",
                !selectedProvince && "text-muted-foreground/50",
              )}
            >
              {selectedProvince
                ? getLocalizedName(
                    selectedProvince.name,
                    selectedProvince.nameEn,
                    currentLanguage,
                  )
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg"
          align="start"
          sideOffset={4}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground/60 text-center">
                {searchQuery ? "Không tìm thấy" : "Không có dữ liệu"}
              </div>
            ) : (
              filteredResults.map((province) => {
                const displayName = getLocalizedName(
                  province.name,
                  province.nameEn,
                  currentLanguage,
                );
                const isSelected = province.code === value;
                return (
                  <button
                    key={province.code}
                    type="button"
                    onClick={() => handleSelect(province.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-muted/60 transition-colors",
                      isSelected && "bg-accent/10 text-accent font-medium",
                    )}
                  >
                    <span className="truncate">{displayName}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-accent flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
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
  disabled?: boolean;
}

function SearchableWardSelect({
  wards,
  value,
  onValueChange,
  placeholder = "Chọn phường/xã...",
  isLoading = false,
  disabled = false,
}: SearchableWardSelectProps) {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredResults, setFilteredResults] = useState<WardResponse[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentLanguage = i18n.language || "vi";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _inputRef = inputRef;

  const debouncedSearch = useDebounce(searchQuery, 150);

  const searchableWards = useMemo(() => {
    return wards.map((ward) => {
      const displayName = getLocalizedName(
        ward.name,
        ward.nameEn,
        currentLanguage,
      );
      const displayFullName = getLocalizedName(
        ward.fullName,
        ward.fullNameEn,
        currentLanguage,
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
          queryWords.every((word) => searchText.includes(word)),
        )
        .slice(0, 50);

      matched.sort((a, b) => {
        const aStarts = a.displayName.toLowerCase().startsWith(query);
        const bStarts = b.displayName.toLowerCase().startsWith(query);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setFilteredResults(matched.map(({ ward }) => ward));
    });
  }, [debouncedSearch, searchableWards, wards]);

  useEffect(() => {
    setFilteredResults(wards.slice(0, 50));
    setSearchQuery("");
  }, [wards]);

  const selectedWard = useMemo(
    () => wards.find((w) => w.code === value),
    [wards, value],
  );

  const handleSelect = useCallback(
    (wardCode: string) => {
      const ward = wards.find((w) => w.code === wardCode);
      if (ward) {
        const displayName = getLocalizedName(
          ward.name,
          ward.nameEn,
          currentLanguage,
        );
        onValueChange(ward.code, displayName);
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [wards, currentLanguage, onValueChange],
  );

  return (
    <div className="relative w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled || isLoading}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left",
              "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "text-sm",
                !selectedWard && "text-muted-foreground/50",
              )}
            >
              {selectedWard
                ? getLocalizedName(
                    selectedWard.name,
                    selectedWard.nameEn,
                    currentLanguage,
                  )
                : placeholder}
            </span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/50 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg"
          align="start"
          sideOffset={4}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground/60 text-center">
                {searchQuery ? "Không tìm thấy" : "Không có dữ liệu"}
              </div>
            ) : (
              filteredResults.map((ward) => {
                const displayName = getLocalizedName(
                  ward.name,
                  ward.nameEn,
                  currentLanguage,
                );
                const isSelected = ward.code === value;
                return (
                  <button
                    key={ward.code}
                    type="button"
                    onClick={() => handleSelect(ward.code)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-muted/60 transition-colors",
                      isSelected && "bg-accent/10 text-accent font-medium",
                    )}
                  >
                    <span className="truncate">{displayName}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-accent flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function AddressDialog({
  open,
  onOpenChange,
  address,
  onSave,
}: AddressDialogProps) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  // Data for selectors
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [wards, setWards] = useState<WardResponse[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Form state
  const [type, setType] = useState<AddressType>("HOME");
  const [label, setLabel] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // Location state
  const [provinceCode, setProvinceCode] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");

  const [isDefault, setIsDefault] = useState(false);

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

  // Handle province change: load wards
  const debouncedProvinceCode = useDebounce(provinceCode, 300);

  useEffect(() => {
    if (!debouncedProvinceCode) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      setIsLoadingWards(true);
      try {
        const result = await locationApi.getWardsByProvince(
          debouncedProvinceCode,
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

  // Reset form when dialog opens/closes or address changes
  useEffect(() => {
    if (open && address) {
      setType(address.addressType);
      setLabel(address.label || "");
      setRecipientName(address.recipientName);
      setPhoneNumber(address.phoneNumber);
      setDetailAddress(address.detailAddress);

      setProvinceCode(address.provinceCode);
      setProvinceName(address.provinceName);
      setDistrictName(address.districtName);
      setWardCode(address.wardCode);
      setWardName(address.wardName);
      setIsDefault(address.isDefault);
    } else if (open) {
      // Reset for new address
      setType("HOME");
      setLabel("");
      setRecipientName("");
      setPhoneNumber("");
      setDetailAddress("");

      setProvinceCode("");
      setProvinceName("");
      setDistrictName("");
      setWardCode("");
      setWardName("");
      setIsDefault(false);
    }
  }, [open, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        recipientName,
        phoneNumber,
        provinceCode,
        provinceName,
        districtName,
        wardCode,
        wardName,
        detailAddress,
        addressType: type,
        isDefault,
        label: label || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProvinceSelect = (code: string, name: string) => {
    setProvinceCode(code);
    setProvinceName(name);
    setWardCode("");
    setWardName("");
  };

  const handleWardSelect = (code: string, name: string) => {
    setWardCode(code);
    setWardName(name);
  };

  const isValid =
    recipientName &&
    phoneNumber &&
    detailAddress &&
    provinceCode &&
    provinceName &&
    districtName &&
    wardCode &&
    wardName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {address
              ? t("profile.addresses.editAddress", {
                  defaultValue: "Chỉnh sửa địa chỉ",
                })
              : t("profile.addresses.addNew", {
                  defaultValue: "Thêm địa chỉ mới",
                })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Address Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("profile.addresses.type", { defaultValue: "Loại địa chỉ" })}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {addressTypes.map(
                ({ value, icon: TypeIcon, label: labelKey, activeClass }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200",
                      type === value
                        ? activeClass
                        : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/70",
                    )}
                  >
                    <TypeIcon className="w-5 h-5" />
                    <span className="text-[11px] font-medium leading-tight text-center">
                      {t(labelKey, { defaultValue: value })}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Custom Label (optional) */}
          {type === "OTHER" && (
            <OutlinedInput
              id="label"
              label={t("profile.addresses.label", {
                defaultValue: "Nhãn (Tùy chọn)",
              })}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("profile.addresses.labelPlaceholder", {
                defaultValue: "v.d., Nhà bố mẹ",
              })}
            />
          )}

          {/* Recipient Info — 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OutlinedInput
              id="recipientName"
              label={t("profile.addresses.recipientName", {
                defaultValue: "Tên người nhận",
              })}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
              placeholder="Nguyễn Văn A"
            />
            <OutlinedInput
              id="phone"
              label={t("profile.addresses.phone", {
                defaultValue: "Số điện thoại",
              })}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              required
              placeholder="0901234567"
            />
          </div>

          {/* Province, District, Ward — 2-column where possible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Province */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {t("profile.addresses.city", {
                  defaultValue: "Thành phố/Tỉnh",
                })}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <SearchableProvinceSelect
                provinces={provinces}
                value={provinceCode}
                onValueChange={handleProvinceSelect}
                isLoading={isLoadingProvinces}
                placeholder={
                  t("checkout.cityPlaceholder") || "Chọn tỉnh/thành phố"
                }
              />
            </div>

            {/* District */}
            <OutlinedInput
              id="district"
              label={t("profile.addresses.district", {
                defaultValue: "Quận/Huyện",
              })}
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              required
              placeholder={
                t("checkout.districtPlaceholder") || "Nhập quận/huyện"
              }
            />
          </div>

          {/* Ward — full width */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t("profile.addresses.ward", {
                defaultValue: "Phường/Xã",
              })}
              <span className="text-destructive ml-0.5">*</span>
            </Label>
            <SearchableWardSelect
              wards={wards}
              value={wardCode}
              onValueChange={handleWardSelect}
              isLoading={isLoadingWards}
              disabled={!provinceCode}
              placeholder={t("checkout.wardPlaceholder") || "Chọn phường/xã"}
            />
          </div>

          {/* Detail Address */}
          <OutlinedInput
            id="detailAddress"
            label={t("profile.addresses.addressLine1", {
              defaultValue: "Địa chỉ chi tiết",
            })}
            value={detailAddress}
            onChange={(e) => setDetailAddress(e.target.value)}
            placeholder={t("profile.addresses.addressPlaceholder", {
              defaultValue: "Số nhà, tên đường...",
            })}
            required
          />

          {/* Set as Default */}
          <div className="flex items-center space-x-3 pt-1">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm text-foreground cursor-pointer"
            >
              {t("profile.addresses.setAsDefault", {
                defaultValue: "Đặt làm địa chỉ giao hàng mặc định",
              })}
            </Label>
          </div>

          {/* Footer Buttons */}
          <DialogFooter className="gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-lg border-border px-5"
            >
              {t("common.cancel", { defaultValue: "Hủy" })}
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSaving}
              className="rounded-lg bg-foreground text-background hover:bg-foreground/90 px-6 shadow-sm"
            >
              {isSaving
                ? t("common.saving", { defaultValue: "Đang lưu..." })
                : address
                  ? t("common.update", { defaultValue: "Cập nhật" })
                  : t("common.add", { defaultValue: "Thêm địa chỉ" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
