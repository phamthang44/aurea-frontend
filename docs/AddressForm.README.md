# AddressForm Component

Component form địa chỉ tích hợp với Location API theo mô hình "Hybrid Input".

## Tính năng

- **Province (Tỉnh/Thành phố)**: Dropdown select, load từ API `/api/v1/locations/provinces`
- **District (Quận/Huyện)**: Input text, user tự nhập tay
- **Ward (Phường/Xã)**: Searchable dropdown, load từ API `/api/v1/locations/wards?provinceCode={code}` với tính năng tìm kiếm
- **Recipient Name & Phone**: Input text
- **Detail Address**: Input text cho địa chỉ chi tiết

## Cách sử dụng

### 1. Import component

```tsx
import { AddressForm, type AddressFormData } from "@/components/checkout/AddressForm";
```

### 2. Setup form với react-hook-form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema validation
const addressSchema = z.object({
  recipientName: z.string().min(1, "Tên người nhận là bắt buộc"),
  phone: z.string().regex(/^\d{10,15}$/, "Số điện thoại không hợp lệ"),
  provinceCode: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  provinceName: z.string().min(1),
  wardCode: z.string().min(1, "Vui lòng chọn phường/xã"),
  wardName: z.string().min(1),
  districtName: z.string().min(1, "Vui lòng nhập quận/huyện"),
  detailAddress: z.string().min(1, "Vui lòng nhập địa chỉ chi tiết"),
});

type AddressFormData = z.infer<typeof addressSchema>;

function MyComponent() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = (data: AddressFormData) => {
    // Data sẽ có format:
    // {
    //   recipientName: "...",
    //   phone: "...",
    //   provinceCode: "...",
    //   provinceName: "...",
    //   wardCode: "...",
    //   wardName: "...",
    //   districtName: "...",
    //   detailAddress: "..."
    // }
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AddressForm
        recipientName={{
          register: register("recipientName"),
          error: errors.recipientName,
        }}
        phone={{
          register: register("phone"),
          error: errors.phone,
        }}
        provinceCode={{
          register: register("provinceCode"),
          error: errors.provinceCode,
        }}
        provinceName={{
          register: register("provinceName"),
          error: errors.provinceName,
        }}
        wardCode={{
          register: register("wardCode"),
          error: errors.wardCode,
        }}
        wardName={{
          register: register("wardName"),
          error: errors.wardName,
        }}
        districtName={{
          register: register("districtName"),
          error: errors.districtName,
        }}
        detailAddress={{
          register: register("detailAddress"),
          error: errors.detailAddress,
        }}
        setValue={setValue}
        control={control}
        watch={watch}
        labels={{
          recipientName: "Tên người nhận",
          recipientNamePlaceholder: "Nhập tên người nhận",
          phone: "Số điện thoại",
          phonePlaceholder: "Nhập số điện thoại",
          province: "Tỉnh/Thành phố",
          provincePlaceholder: "Chọn tỉnh/thành phố",
          district: "Quận/Huyện",
          districtPlaceholder: "Nhập quận/huyện",
          ward: "Phường/Xã",
          wardPlaceholder: "Chọn phường/xã",
          detailAddress: "Địa chỉ chi tiết",
          detailAddressPlaceholder: "Nhập số nhà, tên đường...",
        }}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Logic hoạt động

1. **Khi component mount**: Tự động gọi API để load danh sách tỉnh/thành phố
2. **Khi user chọn Province**:
   - Lưu `provinceCode` và `provinceName` vào form
   - Reset giá trị `wardCode` và `wardName` về rỗng
   - Tự động gọi API để load danh sách phường/xã theo `provinceCode`
3. **Khi user nhập District**: Chỉ lưu `districtName` (không có `districtCode`)
4. **Khi user chọn Ward**: Lưu `wardCode` và `wardName` vào form
5. **Ward Select có tính năng search**: User có thể tìm kiếm phường/xã bằng cách nhập vào ô search

## Output Data Format

Khi submit form, data sẽ có format khớp với `AddressRequest` DTO của backend:

```typescript
{
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  districtName: string;  // User tự nhập
  detailAddress: string;
}
```

## Dependencies

- `react-hook-form`: Form management
- `@radix-ui/react-select`: Select component
- `lucide-react`: Icons
- `@/lib/api/location`: Location API client

## Notes

- Component tự động xử lý loading states khi gọi API
- Ward select sẽ bị disable cho đến khi user chọn province
- Khi province thay đổi, ward selection sẽ tự động reset

