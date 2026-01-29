export const getBookUrl = (bookUrl) => {
  if (!bookUrl) return "/assets/default-book.jpg"; // Sử dụng biến ảnh mặc định đã khai báo ở đầu file

  // Nếu url đã là link tuyệt đối (http...) thì trả về luôn
  if (bookUrl.startsWith("http")) return bookUrl;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Đảm bảo giữa API_URL và bookUrl có đúng 1 dấu gạch chéo
  const cleanUrl = bookUrl.startsWith("/") ? bookUrl : `/${bookUrl}`;
  return `${API_URL}${cleanUrl}`;
};
