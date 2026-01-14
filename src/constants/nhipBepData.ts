/**
 * Nhịp Bếp Page Data
 * 
 * Contains all static data for the Nhịp Bếp page including:
 * - History slides data
 * - Products data
 * - Helper functions for product backgrounds
 */

export interface SlideContent {
  dates: string;
  subtitle: string;
  paragraphs: string[];
  image: string;
  learnMoreLink: string;
}

export interface Product {
  image: string;
  label: string;
  fullName: string;
  branding?: string;
  tips: string[];
  buyLink: string;
}

/**
 * History timeline slides data
 */
export const slides: SlideContent[] = [
  {
    dates: '1923 – 1959',
    subtitle: 'Khởi đầu và Chứng nhận',
    paragraphs: [
      'Tiger bắt đầu sản xuất và kinh doanh bình chân không tại Nhật Bản.',
      'Trở thành nhà máy đầu tiên trong ngành được MITI (nay là METI) chứng nhận đạt chuẩn JIS.'
    ],
    image: '/nhipbep/history_1923_1959_background.jpg',
    learnMoreLink: 'https://www.tiger-corporation.com/en/vnm/about-us/history/'
  },
  {
    dates: '1960 – 1979',
    subtitle: 'Mở rộng và Phát triển',
    paragraphs: [
      'Kỷ niệm 45 năm thành lập, ông Takenori Kikuchi được bổ nhiệm làm Chủ tịch HĐQT, ông Yoshito Kikuchi giữ vai trò Chủ tịch Điều hành.',
      'Thành lập Tiger Bussan Co., Ltd. tại Hiroshima.',
      'Hoàn thành mở rộng Trụ sở chính (Tòa nhà thứ ba).'
    ],
    image: '/nhipbep/history_1960_1970_background.jpg',
    learnMoreLink: 'https://www.tiger-corporation.com/en/vnm/about-us/history/1960-1979/'
  },
  {
    dates: '1980 – 1999',
    subtitle: 'Đổi mới và Tái cấu trúc',
    paragraphs: [
      'Ra mắt ấm đun nước điện "Wakitate" đầu tiên.',
      'Kỷ niệm 60 năm thành lập và chính thức đổi tên thành Tiger Corporation.',
      'Hoàn thành Trung tâm Bình chân không Kadoma và xây dựng nhà xưởng đúc.'
    ],
    image: '/nhipbep/history_1980_1999_background.jpg',
    learnMoreLink: 'https://www.tiger-corporation.com/en/vnm/about-us/history/1980-1999/'
  },
  {
    dates: '2000 – 2019',
    subtitle: 'Đạt chuẩn Quốc tế và Vươn tầm thương hiệu',
    paragraphs: [
      'Trụ sở chính đạt chứng nhận ISO 9001. Thành lập Công ty TNHH TIGER Việt Nam.',
      'Tiger Corporation nhận Giải thưởng Bộ trưởng Bộ Giáo dục, Văn hóa, Thể thao, Khoa học & Công nghệ Nhật Bản tại Giải thưởng Công nghệ Công nghiệp Nhật Bản lần thứ 48.'
    ],
    image: '/nhipbep/history_2000_2019_background.jpg',
    learnMoreLink: 'https://www.tiger-corporation.com/en/vnm/about-us/history/2000-2019/'
  },
  {
    dates: '2020 – Nay',
    subtitle: '100 năm thành tựu',
    paragraphs: [
      'Thành lập Công ty TNHH TIGER MARKETING Việt Nam.',
      'Tập đoàn Tiger kỷ niệm 100 năm hoạt động, khẳng định vị thế thương hiệu gia dụng hàng đầu Nhật Bản.'
    ],
    image: '/nhipbep/history_2020_nay_background.jpg',
    learnMoreLink: 'https://www.tiger-corporation.com/en/vnm/about-us/history/2020-latest/'
  }
];

/**
 * Base products data
 */
export const baseProducts: Product[] = [
  {
    image: '/nhipbep/noicom.png',
    label: 'Nồi cơm điện',
    fullName: 'Nồi cơm điện TIGER',
    branding: 'Nồi cơm điện TIGER, với áp suất kép linh hoạt và lòng nồi 9 lớp giúp bữa cơm luôn dẻo ngon, tròn vị mỗi ngày.',
    tips: [
      'Cho vài giọt dầu ăn vào gạo trước khi nấu giúp hạt cơm bóng, tơi và ít dính hơn, đặc biệt khi nấu cơm để ăn trong ngày.',
      'Nấu cháo bằng nước sôi thay vì nước lạnh giúp hạt gạo nở đều, cháo nhừ nhanh hơn và hạn chế tình trạng khét đáy nồi.',
      'Nấu cơm lười nên giảm nhẹ lượng nước so với cơm trắng vì topping tiết nước khi chín, giúp cơm dẻo vừa, không bị bở.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=110341445#product_list'
  },
  {
    image: '/nhipbep/binhgiunhiet.png',
    label: 'Bình giữ nhiệt',
    fullName: 'Bình giữ nhiệt TIGER',
    branding: 'Bình giữ nhiệt TIGER với cấu trúc chân không giúp đồ uống giữ nóng lạnh ổn định, trọn vị suốt cả ngày dài.',
    tips: [
      'Tráng bình bằng nước nóng hoặc lạnh trước khi dùng giúp nhiệt độ bên trong ổn định sớm, hạn chế thất thoát nhiệt khi mới rót đồ uống.',
      'Ngâm nước chanh loãng khoảng 15 phút rồi rửa lại giúp khử mùi cà phê, trà bám lâu sau nhiều lần sử dụng.',
      'Tháo gioăng nắp phơi khô riêng sau khi rửa giúp hạn chế tích mùi ẩm, giữ bình sạch mùi khi dùng hằng ngày.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=104377220#product_list'
  },
  {
    image: '/nhipbep/amdunsieutoc.png',
    label: 'Ấm đun siêu tốc',
    fullName: 'Ấm đun siêu tốc TIGER',
    branding: 'Thiết kế miệng rộng và cơ chế tự ngắt an toàn giúp ấm đun siêu tốc TIGER dễ vệ sinh và an tâm sử dụng trong sinh hoạt hằng ngày.',
    tips: [
      'Không mở nắp ngay khi nước vừa sôi để tránh hơi nước phả ngược, an toàn hơn khi sử dụng trong bếp gia đình.',
      'Sau khi đun, nên đổ hết nước còn dư giúp hạn chế cặn trắng tích tụ dưới đáy khi dùng ấm thường xuyên.',
      'Định kỳ đun nước với chút giấm hoặc chanh rồi đổ đi giúp cặn canxi bong nhanh, việc vệ sinh nhẹ nhàng hơn.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=252707774#product_list'
  },
  {
    image: '/nhipbep/binhthuydien.png',
    label: 'Bình thủy điện',
    fullName: 'Bình thủy điện TIGER',
    branding: '4 mức nhiệt linh hoạt giúp bình thủy điện TIGER đáp ứng trọn vẹn nhu cầu nước nóng trong sinh hoạt gia đình hằng ngày.',
    tips: [
      'Dùng đúng mức nhiệt cho từng nhu cầu như 70°C pha sữa, 80°C pha trà, 90°C pha cà phê, 98°C nấu mì giúp đồ uống giữ trọn hương vị.',
      'Hẹn giờ đun nước từ tối để sáng có sẵn nước nóng dùng ngay, tiết kiệm thời gian cho sinh hoạt buổi sáng bận rộn.',
      'Giữ nước ở 70°C trong ngày giúp luôn có nước ấm uống liền, hạn chế phải đun lại nhiều lần khi sử dụng thường xuyên.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=252707787#product_list'
  },
  {
    image: '/nhipbep/chaodien.png',
    label: 'Chảo điện',
    fullName: 'Chảo điện TIGER',
    branding: 'Thanh nhiệt chữ M và bề mặt khay chống dính của chảo điện TIGER giúp bạn làm chủ nhiệt độ, cho món ăn chín đều và trọn vị ngon.',
    tips: [
      'Áp chảo thịt ở nhiệt cao rồi hạ dần giúp thịt xém mặt đẹp mà bên trong vẫn mềm, không bị khô khi nấu lâu.',
      'Chia nguyên liệu thành từng mẻ nhỏ khi nướng giúp bề mặt chín vàng đều, tránh tình trạng nguội khay khi cho quá nhiều thực phẩm cùng lúc.',
      'Cho rau củ vào sau cùng và đảo nhanh tay để giữ độ giòn và màu sắc tự nhiên, món ăn trông ngon mắt hơn khi dọn bàn.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=264796608#product_list'
  },
  {
    image: '/nhipbep/mayxay.png',
    label: 'Máy xay sinh tố',
    fullName: 'Máy xay sinh tố TIGER',
    branding: 'Lưỡi xay 6 cạnh và dải tốc độ linh hoạt của máy xay sinh tố TIGER giúp bạn kiểm soát độ mịn, cho thành phẩm sánh đều và trọn vị.',
    tips: [
      'Cho đá viên nhỏ vào xay cùng trái cây giúp sinh tố mát và mịn hơn, tránh tình trạng đá to làm hỗn hợp bị lợn cợn.',
      'Xay sốt hoặc bơ hạt theo kiểu ngắt quãng giúp hỗn hợp mịn đều, hạn chế tách dầu khi xay liên tục trong thời gian dài.',
      'Giảm tốc độ ở 5-10 giây cuối khi xay giúp sinh tố đặc hơn, ít bọt khí, thành phẩm mịn và sánh hơn khi rót ra ly.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=264796598#product_list'
  },
  {
    image: '/nhipbep/binhthuychua.png',
    label: 'Bình thủy chứa',
    fullName: 'Bình thủy chứa TIGER',
    branding: 'Cấu trúc chân không bền bỉ giúp phích nước TIGER giữ nhiệt ổn định, đáp ứng nhu cầu nước nóng sinh hoạt gia đình mỗi ngày.',
    tips: [
      'Tráng ruột phích bằng nước sôi rồi lắc nhẹ trước khi dùng giúp làm nóng thành phích, giữ nhiệt tốt hơn và hạn chế sốc nhiệt khi rót nước nóng.',
      'Kiểm tra định kỳ khả năng giữ nhiệt bằng cách sờ vào thân phích sau khi đổ nước sôi; nếu vỏ ngoài nóng bất thường, ruột phích có thể đã hỏng.',
      'Không đổ nước quá đầy, nên chừa lại khoảng 2–3 cm dưới miệng phích để khi đậy nắp, hơi nước không trào ra ngoài.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=253124252#product_list'
  },
  {
    image: '/nhipbep/hopcom.png',
    label: 'Hộp cơm',
    fullName: 'Hộp đựng cơm TIGER',
    branding: 'Hộp giữ nhiệt TIGER với cấu trúc chân không giúp bữa trưa mang theo luôn ấm nóng và tròn vị khi dùng.',
    tips: [
      'Tráng hộp bằng nước nóng trước khi cho cơm vào giúp thành hộp ổn nhiệt nhanh, cơm giữ ấm lâu hơn trong suốt buổi trưa.',
      'Để món có nước sốt ở ngăn riêng giúp cơm không bị nhão, hạt vẫn tơi và dễ ăn khi mở hộp.',
      'Thêm vài cọng hành lá tươi lên mặt cơm trước khi đóng hộp giúp hương thơm giữ lại tốt hơn, bữa trưa mở ra vẫn hấp dẫn.'
    ],
    buyLink: 'https://shopee.vn/tigervn_officialstore?shopCollection=252427252#product_list'
  }
];

/**
 * Products array (can be extended with additional products if needed)
 * Using spread operator to create a copy, not a reference alias
 */
export const products: Product[] = [...baseProducts];

/**
 * Helper function to get background image for product card based on index
 * Cycles through 4 background images (1, 2, 3, 4)
 * 
 * @param index - The product index
 * @returns Path to the background image
 */
export const getProductBackgroundImage = (index: number): string => {
  const backgroundIndex = (index % 4) + 1; // Cycle through 1, 2, 3, 4
  return `/nhipbep/card_product_background${backgroundIndex}.svg`;
};

/**
 * Helper function to get modal background image based on product index
 * Cycles through 4 modal background images (1, 2, 3, 4)
 * 
 * @param index - The product index
 * @returns Path to the modal background image
 */
export const getProductModalBackground = (index: number): string => {
  const backgroundIndex = (index % 4) + 1; // Cycle through 1, 2, 3, 4
  return `/nhipbep/card_flipped_${backgroundIndex}.svg`;
};

