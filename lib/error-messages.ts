const ERROR_MESSAGE_MAP: Record<string, string> = {
  "Email da duoc su dung": "Thư điện tử này đã được sử dụng, vui lòng chọn địa chỉ khác.",
  "Email hoac mat khau khong dung": "Thư điện tử hoặc mật khẩu không chính xác.",
  "Ma OTP khong dung": "Mã xác thực không đúng. Vui lòng kiểm tra lại thư điện tử.",
  "Ma OTP da het han": "Mã xác thực đã hết hạn.",
  "Da nhap sai OTP qua 5 lan, vui long thu lai sau 15 phut":
    "Bạn đã nhập sai mã quá nhiều lần. Vui lòng thử lại sau 15 phút.",
  "Tai khoan bi khoa tam 15 phut do dang nhap sai qua nhieu lan":
    "Tài khoản tạm khóa 15 phút do đăng nhập sai quá nhiều lần.",
  "Tai khoan da bi khoa boi quan tri vien":
    "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.",
  "Tai khoan chua xac thuc OTP":
    "Tài khoản chưa được xác thực bằng mã trong thư điện tử.",
  "Refresh token khong hop le":
    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  "Refresh token da het han, vui long dang nhap lai":
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};

export function translateErrorMessage(rawMessage: string): string {
  return ERROR_MESSAGE_MAP[rawMessage] ?? rawMessage;
}
