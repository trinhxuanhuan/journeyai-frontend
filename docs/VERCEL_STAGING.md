# Triển khai staging trên Vercel

Frontend được triển khai độc lập với backend. Với portfolio cá nhân, Vercel Hobby cung cấp Git integration, preview deployment và HTTPS mà không cần mua tên miền. Không đưa bất kỳ secret backend nào vào Vercel.

## 1. Tạo project

1. Đăng nhập Vercel bằng GitHub cá nhân.
2. Chọn **Add New → Project** và import `trinhxuanhuan/journeyai-frontend`.
3. Giữ framework preset **Next.js**, root directory `.` và Node.js `22.x`.
4. Chọn một project name rõ ràng, ví dụ `viet-kham-pha`. Nếu tên đã tồn tại, dùng tên Vercel đề xuất và ghi lại production URL thực tế.

## 2. Biến môi trường

Khai báo cho Production và Preview:

| Biến | Giá trị |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://api.<IPv4-VPS-dùng-dấu-gạch-ngang>.sslip.io` |
| `NEXT_PUBLIC_SITE_URL` | Production URL Vercel thực tế, không có path |

`NEXT_PUBLIC_*` là dữ liệu công khai và được đóng gói tại build time. Không đặt JWT secret, SMTP password, Gemini key hoặc VNPay hash secret tại đây.

Nếu lần deploy đầu chưa biết chính xác production URL, deploy một lần để Vercel cấp/hiển thị domain, cập nhật `NEXT_PUBLIC_SITE_URL`, rồi redeploy production. Sau đó dùng URL đó cho `FRONTEND_BASE_URL` và CORS của backend.

## 3. GitHub repository variables

Trong GitHub repository FE, vào **Settings → Secrets and variables → Actions → Variables** và tạo:

- `STAGING_API_URL`: trùng `NEXT_PUBLIC_API_URL`.
- `STAGING_SITE_URL`: trùng `NEXT_PUBLIC_SITE_URL`.

Đây là URL công khai, không phải secret. Workflow `Publish release image` dùng hai biến này để tạo image Docker có cùng cấu hình với bản Vercel.

## 4. Gate sau deploy

```powershell
./scripts/smoke-staging.ps1 `
  -FrontendBaseUrl https://<project>.vercel.app `
  -ApiBaseUrl https://api.<IPv4-VPS-dùng-dấu-gạch-ngang>.sslip.io
```

Chỉ chấp nhận release khi script đạt 10/10, trang desktop/mobile không tràn ngang, console không có lỗi nghiêm trọng và các request API trả đúng CORS origin.

## 5. Giới hạn tuyên bố

Vercel Hobby phù hợp dự án cá nhân/portfolio. Cùng với một VPS đơn, đây là staging công khai chứ chưa phải production HA. CV nên dùng cụm “deployed public MVP release candidate” sau khi checklist staging đạt.
