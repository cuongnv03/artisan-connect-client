export const VIETNAMESE_PROVINCES = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bạc Liêu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];

export const ARTISAN_SPECIALTY_MAPPING = {
  'Gốm sứ': 'pottery',
  'Đồ gỗ': 'woodworking',
  'Trang sức': 'jewelry',
  'Dệt may': 'textiles',
  'Đồ kim loại': 'metalwork',
  'Thủy tinh': 'glasswork',
  'Đồ da': 'leatherwork',
  Tranh: 'painting',
  'Điêu khắc': 'sculpture',
  Gốm: 'ceramics',
  'Đan len': 'knitting',
  'Thêu tay': 'embroidery',
  'Thư pháp': 'calligraphy',
  'Nhiếp ảnh': 'photography',
  Khác: 'other',
};

export const SPECIALTY_DISPLAY_MAPPING = {
  pottery: 'Gốm sứ',
  woodworking: 'Đồ gỗ',
  jewelry: 'Trang sức',
  textiles: 'Dệt may',
  metalwork: 'Đồ kim loại',
  glasswork: 'Thủy tinh',
  leatherwork: 'Đồ da',
  painting: 'Tranh',
  sculpture: 'Điêu khắc',
  ceramics: 'Gốm',
  knitting: 'Đan len',
  embroidery: 'Thêu tay',
  calligraphy: 'Thư pháp',
  photography: 'Nhiếp ảnh',
  other: 'Khác',
};

export const ARTISAN_SPECIALTIES = Object.keys(ARTISAN_SPECIALTY_MAPPING);

// Helper functions
export const mapSpecialtyToServer = (vietnameseSpecialty: string): string => {
  return (
    ARTISAN_SPECIALTY_MAPPING[
      vietnameseSpecialty as keyof typeof ARTISAN_SPECIALTY_MAPPING
    ] || 'other'
  );
};

export const mapSpecialtyToDisplay = (serverSpecialty: string): string => {
  return (
    SPECIALTY_DISPLAY_MAPPING[
      serverSpecialty as keyof typeof SPECIALTY_DISPLAY_MAPPING
    ] || serverSpecialty
  );
};

export const POST_TYPES = [
  {
    value: 'STORY',
    label: 'Câu chuyện',
    description: 'Chia sẻ câu chuyện về nghề thủ công',
  },
  {
    value: 'TUTORIAL',
    label: 'Hướng dẫn',
    description: 'Hướng dẫn làm thủ công',
  },
  {
    value: 'PRODUCT_SHOWCASE',
    label: 'Giới thiệu sản phẩm',
    description: 'Showcase sản phẩm mới',
  },
  {
    value: 'BEHIND_THE_SCENES',
    label: 'Hậu trường',
    description: 'Quá trình làm việc',
  },
  {
    value: 'EVENT',
    label: 'Sự kiện',
    description: 'Thông tin về sự kiện, triển lãm',
  },
  { value: 'GENERAL', label: 'Chung', description: 'Bài viết chung' },
];

export const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng', icon: '💵' },
  { value: 'CREDIT_CARD', label: 'Thẻ tín dụng', icon: '💳' },
  { value: 'DEBIT_CARD', label: 'Thẻ ghi nợ', icon: '💳' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { value: 'DIGITAL_WALLET', label: 'Ví điện tử', icon: '📱' },
];

export const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Chờ xác nhận', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
  { value: 'PAID', label: 'Đã thanh toán', color: 'green' },
  { value: 'PROCESSING', label: 'Đang xử lý', color: 'blue' },
  { value: 'SHIPPED', label: 'Đã gửi hàng', color: 'blue' },
  { value: 'DELIVERED', label: 'Đã giao hàng', color: 'green' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
  { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'gray' },
];
