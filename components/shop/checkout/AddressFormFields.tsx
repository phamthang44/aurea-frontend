import { FormField } from "./FormField";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface AddressFormFieldsProps {
  recipientName: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  city: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  district: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  ward: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  street: {
    register: UseFormRegisterReturn;
    error?: FieldError;
  };
  labels: {
    recipientName: string;
    recipientNamePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    district: string;
    districtPlaceholder: string;
    ward: string;
    wardPlaceholder: string;
    street: string;
    streetPlaceholder: string;
  };
}

export function AddressFormFields({
  recipientName,
  city,
  district,
  ward,
  street,
  labels,
}: AddressFormFieldsProps) {
  return (
    <div className="pt-4 space-y-4">
      <FormField
        id="recipientName"
        label={labels.recipientName}
        type="text"
        placeholder={labels.recipientNamePlaceholder}
        register={recipientName.register}
        error={recipientName.error}
      />

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          id="city"
          label={labels.city}
          type="text"
          placeholder={labels.cityPlaceholder}
          register={city.register}
          error={city.error}
        />
        <FormField
          id="district"
          label={labels.district}
          type="text"
          placeholder={labels.districtPlaceholder}
          register={district.register}
          error={district.error}
        />
        <FormField
          id="ward"
          label={labels.ward}
          type="text"
          placeholder={labels.wardPlaceholder}
          register={ward.register}
          error={ward.error}
        />
      </div>

      <FormField
        id="street"
        label={labels.street}
        type="text"
        placeholder={labels.streetPlaceholder}
        register={street.register}
        error={street.error}
      />
    </div>
  );
}

