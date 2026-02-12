"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  startTransition,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  Building2,
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
import { LuxuryInput } from "@/components/auth/LuxuryInput";
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

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: UserAddress | null;
  onSave: (data: AddressRequest) => Promise<void>;
}

const addressTypes: { value: AddressType; icon: typeof Home; label: string }[] =
  [
    { value: "HOME", icon: Home, label: "profile.addresses.home" },
    { value: "OFFICE", icon: Building2, label: "profile.addresses.office" },
    { value: "OTHER", icon: MapPin, label: "profile.addresses.other" },
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
              "w-full flex items-center justify-between bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none transition-all duration-300 px-0 py-3 text-left",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                !selectedProvince && "text-gray-400 dark:text-zinc-500",
                "text-sm font-light",
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
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
          <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4b483]/50"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchQuery ? "No results found" : "No data"}
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
                      "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                      isSelected && "bg-gray-50 dark:bg-zinc-800/50",
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
              "w-full flex items-center justify-between bg-transparent border-0 border-b border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:border-[#d4b483] dark:focus:border-[#d4b483] focus:outline-none transition-all duration-300 px-0 py-3 text-left",
              (disabled || isLoading) && "opacity-50 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                !selectedWard && "text-gray-400 dark:text-zinc-500",
                "text-sm font-light",
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
              <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start" sideOffset={4}>
          <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4b483]/50"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto overscroll-contain">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchQuery ? "No results found" : "No data"}
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
                      "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
                      isSelected && "bg-gray-50 dark:bg-zinc-800/50",
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
  const [addressLine1, setAddressLine1] = useState(""); // This is detailAddress
  const [addressLine2, setAddressLine2] = useState("");

  // Location state
  const [provinceCode, setProvinceCode] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");

  const [postalCode, setPostalCode] = useState("");
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
      setType(address.type);
      setLabel(address.label || "");
      setRecipientName(address.recipientName);
      setPhoneNumber(address.phoneNumber);
      setAddressLine1(address.addressLine1);
      setAddressLine2(address.addressLine2 || "");

      // Map address fields to local state
      // Assuming address.city holds provinceName
      // Assuming address.district holds districtName
      // Assuming address.ward holds wardName (or maybe we skip code if not present)
      setProvinceName(address.city || "");
      setDistrictName(address.district || "");
      setWardName(address.ward || "");

      // Try to find code if possible or leave empty if not stored
      // In a real scenario, you probably store codes too or reverse lookup
      setProvinceCode(""); // Reset initially
      setWardCode(""); // Reset initially

      setPostalCode(address.postalCode || "");
      setIsDefault(address.isDefault);

      // Attempt to reverse match province name to code if code is missing but name exists
      if (address.city && provinces.length > 0) {
        // Simple name match logic could happen here if needed
        const found = provinces.find(
          (p) => p.name === address.city || p.fullName === address.city,
        );
        if (found) setProvinceCode(found.code);
      }
    } else if (open) {
      // Reset for new address
      setType("HOME");
      setLabel("");
      setRecipientName("");
      setPhoneNumber("");
      setAddressLine1("");
      setAddressLine2("");

      setProvinceCode("");
      setProvinceName("");
      setDistrictName("");
      setWardCode("");
      setWardName("");

      setPostalCode("");
      setIsDefault(false);
    }
  }, [open, address, provinces]); // added provinces to dep to perform reverse lookup if needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave({
        type,
        label: label || undefined,
        recipientName,
        phoneNumber,
        addressLine1, // detailAddress
        addressLine2: addressLine2 || undefined,
        ward: wardName || undefined,
        district: districtName,
        city: provinceName,
        postalCode: postalCode || undefined,
        isDefault,
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
    recipientName && phoneNumber && addressLine1 && districtName && provinceName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-light tracking-wide">
            {address
              ? t("profile.addresses.editAddress", {
                  defaultValue: "Edit Address",
                })
              : t("profile.addresses.addNew", {
                  defaultValue: "Add New Address",
                })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
              {t("profile.addresses.type", { defaultValue: "Address Type" })}
            </Label>
            <div className="flex gap-2">
              {addressTypes.map(({ value, icon: Icon, label: labelKey }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border transition-all duration-200",
                    type === value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent/50",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-light">
                    {t(labelKey, { defaultValue: value })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Label (optional) */}
          {type === "OTHER" && (
            <LuxuryInput
              id="label"
              label={t("profile.addresses.label", {
                defaultValue: "Label (Optional)",
              })}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("profile.addresses.labelPlaceholder", {
                defaultValue: "e.g., Parents' House",
              })}
            />
          )}

          {/* Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LuxuryInput
              id="recipientName"
              label={t("profile.addresses.recipientName", {
                defaultValue: "Recipient Name",
              })}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
            <LuxuryInput
              id="phone"
              label={t("profile.addresses.phone", {
                defaultValue: "Phone Number",
              })}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              type="tel"
              required
            />
          </div>

          {/* Province, District, Ward */}
          <div className="space-y-4">
            {/* Province */}
            <div className="space-y-2">
              <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
                {t("profile.addresses.city", {
                  defaultValue: "City / Province",
                })}
              </Label>
              <SearchableProvinceSelect
                provinces={provinces}
                value={provinceCode}
                onValueChange={handleProvinceSelect}
                isLoading={isLoadingProvinces}
                placeholder={
                  t("checkout.cityPlaceholder") || "Select City / Province"
                }
              />
            </div>

            {/* District */}
            <LuxuryInput
              id="district"
              label={t("profile.addresses.district", {
                defaultValue: "District",
              })}
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              required
              placeholder={
                t("checkout.districtPlaceholder") || "Enter district"
              }
            />

            {/* Ward */}
            <div className="space-y-2">
              <Label className="text-xs font-light tracking-wider uppercase text-muted-foreground">
                {t("profile.addresses.ward", {
                  defaultValue: "Ward / Commune",
                })}
              </Label>
              <SearchableWardSelect
                wards={wards}
                value={wardCode}
                onValueChange={handleWardSelect}
                isLoading={isLoadingWards}
                disabled={!provinceCode}
                placeholder={
                  t("checkout.wardPlaceholder") || "Select Ward / Commune"
                }
              />
            </div>
          </div>

          {/* Detail Address */}
          <LuxuryInput
            id="addressLine1"
            label={t("profile.addresses.addressLine1", {
              defaultValue: "Street Address",
            })}
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder={t("profile.addresses.addressPlaceholder", {
              defaultValue: "Street address, P.O. box",
            })}
            required
          />

          <LuxuryInput
            id="addressLine2"
            label={t("profile.addresses.addressLine2", {
              defaultValue: "Address Line 2 (Optional)",
            })}
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder={t("profile.addresses.addressLine2Placeholder", {
              defaultValue: "Apartment, suite, unit, building, floor",
            })}
          />

          <LuxuryInput
            id="postalCode"
            label={t("profile.addresses.postalCode", {
              defaultValue: "Postal Code (Optional)",
            })}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />

          {/* Set as Default */}
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked === true)}
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-light text-foreground cursor-pointer"
            >
              {t("profile.addresses.setAsDefault", {
                defaultValue: "Set as default delivery address",
              })}
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSaving}
              className="bg-primary hover:bg-primary/90"
            >
              {isSaving
                ? t("common.saving", { defaultValue: "Saving..." })
                : address
                  ? t("common.update", { defaultValue: "Update" })
                  : t("common.add", { defaultValue: "Add Address" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
