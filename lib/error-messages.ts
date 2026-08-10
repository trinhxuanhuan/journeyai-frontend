const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Email da duoc su dung": "Email này đã được sử dụng, vui lòng chọn email khác.",
  "Email khong ton tai": "Email không tồn tại trong hệ thống.",
  "Mat khau khong dung": "Mật khẩu không chính xác.",
  // Thêm dần khi gặp message mới
};

export function translateErrorMessage(rawMessage: string): string {
  return ERROR_MESSAGE_MAP[rawMessage] ?? rawMessage;
}