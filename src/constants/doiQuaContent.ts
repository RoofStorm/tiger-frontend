/**
 * Content constants for Đổi Quà page
 * Contains text content for TheLeTab and TermsAndConditionsTab
 */

/**
 * Special voucher IDs for monthly rank rewards
 * These IDs are used to determine special UI behavior (e.g., hide points requirement, custom descriptions)
 * 
 * ⚠️ IMPORTANT: If backend changes these IDs, this constant must be updated accordingly
 */
export const SPECIAL_VOUCHER_IDS = {
  TOP_1: 'voucher-1000k',
  TOP_2: 'voucher-500k',
} as const;

/**
 * Helper function to check if a reward ID is a special voucher
 */
export const isSpecialVoucher = (rewardId: string): boolean => {
  return Object.values(SPECIAL_VOUCHER_IDS).includes(rewardId as typeof SPECIAL_VOUCHER_IDS[keyof typeof SPECIAL_VOUCHER_IDS]);
};

/**
 * Get description text for a reward based on its ID
 */
export const getRewardDescription = (rewardId: string): string => {
  if (rewardId === SPECIAL_VOUCHER_IDS.TOP_1) {
    return 'Dành cho Top 1 Nhịp sống được lan toả nhất tháng tại Thử thách giữ nhịp';
  }
  if (rewardId === SPECIAL_VOUCHER_IDS.TOP_2) {
    return 'Dành cho Top 2 Nhịp sống được lan toả nhất tháng tại Thử thách giữ nhịp';
  }
  return 'Cho sản phẩm TIGER (giới hạn 1 lần/user)';
};

export const THE_LE_SECTIONS = [
  {
    title: '1. Tích Điểm Năng Lượng',
    description: 'Mỗi hoạt động nhỏ giúp bạn nạp thêm năng lượng:',
    bullets: [
      'Đăng nhập mỗi ngày: +10 điểm',
      'Đăng nhập lần đầu: +200 điểm',
      'Tham gia My lunchbox challenge: +100 điểm (Tối đa 1 lần/user/tuần)',
      'Tham gia viết Note giữ nhịp: +100 điểm (Tối đa 1 lần/user/tuần)',
      'Tương tác với Card sản phẩm TIGER tại Nhịp bếp: +10 điểm mỗi lần click vào card (Tối đa 8 lần/user)',
      'Chia sẻ quote/lunchboxchallenge/note giữ nhịp: +50 điểm (Tối đa 1 lần/user)',
    ],
  },
  {
    title: '2. Đổi Điểm năng lượng → Quà tặng đến từ TIGER',
    description: null,
    bullets: [
      '500 điểm năng lượng → Voucher 50k Got It',
      '700 điểm năng lượng → Voucher 100k Got It',
    ],
  },
  {
    title: '3. Phần thưởng cho Thử thách giữ nhịp được lan toả nhất tại Lunchbox Challenge',
    description: null,
    bullets: [
      'Số lượt tym cao nhất mỗi tháng sẽ nhận được voucher Got It trị giá 1,000,000 VND',
      'Số lượt tym cao thứ hai mỗi tháng sẽ nhận được voucher Got It trị giá 500,000 VND',
    ],
  },
] as const;

export const THE_LE_DISCLAIMER = '*Mỗi user có thể nhận được tối đa một giải thưởng trên mỗi hạng mục giải thưởng xuyên suốt thời gian diễn ra chương trình';

export const TERMS_AND_CONDITIONS_SECTIONS = [
  {
    title: '1. Những hình thức sử dụng có thể được chấp nhận',
    content: [
      {
        type: 'paragraph',
        text: 'Hãy tự do khám phá trang web của chúng tôi và nếu có thể, hãy đóng góp tài liệu cho trang web, chẳng hạn như câu hỏi, thông báo và nội dung đa phương tiện (ví dụ như hình ảnh, video).',
      },
      {
        type: 'paragraph',
        text: 'Tuy nhiên, việc sử dụng trang web và các tài liệu được đưa lên không được bất hợp pháp hoặc phản cảm theo bất kỳ phương diện nào. Bạn cần lưu tâm để không:',
      },
      {
        type: 'list',
        items: [
          {
            label: '(a)',
            text: 'xâm phạm quyền riêng tư của người khác;',
          },
          {
            label: '(b)',
            text: 'vi phạm các quyền sở hữu trí tuệ;',
          },
          {
            label: '(c)',
            text: 'đưa ra những tuyên bổ phỉ báng (kể cả đối với TIGER Việt Nam), liên quan đến nội dung khiêu dâm, có tính phân biệt chủng tộc hoặc bài ngoại, xúi bẩy căm ghét hoặc kích động bạo lực hoặc hỗn loạn;',
          },
          {
            label: '(d)',
            text: 'tải lên các tập tin chứa virus hoặc dẫn đến các vấn đề về an ninh; hoặc bằng cách nào đó gây nguy hiểm cho tính trọn vẹn của trang web.',
          },
        ],
      },
      {
        type: 'note',
        text: 'Hãy lưu ý rằng TIGER Việt Nam có quyền loại bỏ nội dung bất kỳ mà mình tin là bất hợp pháp hoặc phản cảm ra khỏi trang web.',
      },
    ],
  },
  {
    title: '2. Bảo vệ dữ liệu',
    content: [
      {
        type: 'paragraph',
        text: 'Thông báo về Quyền Riêng tư của chúng tôi áp dụng với dữ liệu hoặc tư liệu cá nhân bất kỳ được chia sẻ trên trang web này.',
      },
    ],
  },
  {
    title: '3. Sở Hữu Trí Tuệ',
    content: [
      {
        type: 'subtitle',
        text: '3.1. Nội dung do TIGER Việt Nam cung cấp',
      },
      {
        type: 'paragraph',
        text: 'Mọi quyền sở hữu trí tuệ, bao gồm quyền tác giả và nhãn hiệu, trong các tài liệu được TIGER Việt Nam hoặc nhân danh TIGER Việt Nam công bố trên trang web (ví dụ như văn bản và hình ảnh) thuộc sở hữu của TIGER Việt Nam hoặc những đơn vị được TIGER Việt Nam cấp phép sử dụng.',
      },
      {
        type: 'paragraph',
        text: 'Bạn có quyền sao các trích đoạn của trang web để sử dụng riêng cho chính mình (ví dụ, sử dụng vì mục đích phi thương mại) với điều kiện là bạn giữ nguyên và tôn trọng mọi quyền sở hữu trí tuệ, bao gồm thông báo bản quyền bất kỳ xuất hiện trong nội dung đó (ví dụ © 2016 TIGER Việt Nam).',
      },
      {
        type: 'subtitle',
        text: '3.2. Nội dung do Bạn cung cấp',
      },
      {
        type: 'paragraph',
        text: 'Bạn tuyên bố với TIGER Việt Nam rằng bạn là tác giả của nội dung mà bạn đóng góp cho trang web này, hoặc bạn có các quyền (ví dụ, được người có quyền cho phép) và có thể đóng góp nội dung đó (ví dụ, hình ảnh, video, nhạc) cho trang web.',
      },
      {
        type: 'paragraph',
        text: 'Bạn đồng ý rằng nội dung đó sẽ được xử lý như không phải thông tin mật và bạn cho TIGER Việt Nam quyền sử dụng miễn phí, vĩnh viễn trên toàn thế giới (bao gồm tiết lộ, sao chép, truyền đạt, công bố hoặc phổ biến) nội dung mà bạn cung cấp cho các mục đích liên quan đến việc kinh doanh của TIGER Việt Nam.',
      },
      {
        type: 'note',
        text: 'Hãy lưu ý rằng TIGER Việt Nam tự do quyết định có hay không sử dụng nội dung đó và TIGER Việt Nam có thể đã triển khai nội dung tương tự hoặc đã có nội dung đó từ các nguồn khác, khi đó mọi quyền sở hữu trí tuệ từ nội dung đó sẽ vẫn thuộc TIGER Việt Nam và những đơn vị được TIGER Việt Nam cấp phép sử dụng.',
      },
    ],
  },
  {
    title: '4. Trách nhiệm pháp lý',
    content: [
      {
        type: 'paragraph',
        text: 'Mặc dù TIGER Việt Nam vận dụng mọi nỗ lực để bảo đảm tính chính xác của tư liệu trên trang web của mình và tránh thiếu sót, chúng tôi không chịu trách nhiệm về thông tin không chính xác, những thiếu sót, gián đoạn hoặc sự kiện khác có thể gây tổn hại cho bạn, bất kể là trực tiếp (như hỏng máy tính) hay gián tiếp (như giảm lợi nhuận). Bạn phải chịu mọi rủi ro khi tin hay không vào các tư liệu trên trang web này.',
      },
      {
        type: 'paragraph',
        text: 'Trang web này có thể chứa các đường dẫn ra ngoài TIGER Việt Nam. TIGER Việt Nam không kiểm soát các trang web của bên thứ ba, không nhất thiết xác nhận chúng và cũng không nhận trách nhiệm bất kỳ về chúng, kể cả nội dung, tính chính xác hoặc chức năng của chúng. Do đó, chúng tôi đề nghị bạn xem xét kỹ các thông báo pháp lý về các trang web của bên thứ ba như vậy, kể cả việc khiến bạn được cập nhật về những thay đổi bất kỳ của chúng.',
      },
      {
        type: 'paragraph',
        text: 'Bạn có thể điều hành một trang web của bên thứ ba và muốn liên kết đến trang web này. Khi đó, TIGER Việt Nam không phản đối liên kết đó, với điều kiện là bản sử dụng url trang chủ chính xác của trang web này (ví dụ như không liên kết sâu) và không gợi ý theo cách bất kỳ rằng bạn là công ty con của TIGER Việt Nam hay được TIGER Việt Nam xác nhận. Bạn không được dùng "framing" hoặc kỹ thuật tương tự, và phải bảo đảm đường dẫn đến trang web mở trong cửa sổ mới.',
      },
    ],
  },
  {
    title: '5. Liên hệ',
    content: [
      {
        type: 'paragraph',
        text: 'Trang web này do Công ty TNHH TIGER Marketing Việt Nam vận hành. Nếu bạn có câu hỏi hoặc bình luận bất kỳ về trang web, xin đừng ngần ngại liên hệ với chúng tôi:',
      },
      {
        type: 'list',
        items: [
          {
            label: '(i)',
            text: 'Gửi thư điện tử đến địa chỉ: ',
            linkText: 'hello@tigermarketing.vn',
            link: 'mailto:hello@tigermarketing.vn',
          },
          {
            label: '(ii)',
            text: 'Gọi điện thoại số: ',
            linkText: '(028) 3622 1281',
            link: 'tel:02836221281',
          },
          {
            label: '(iii)',
            text: 'Gửi thư thường đến:',
          },
        ],
      },
      {
        type: 'contactBox',
        company: 'Công ty TNHH TIGER Marketing Việt Nam',
        department: 'Phòng Chăm Sóc Khách Hàng',
        address: 'Phòng 1006, Tầng 10, Tòa nhà Saigon Riverside Office Center, 2A-4A Tôn Đức Thắng, Phường Sài Gòn, TP. Hồ Chí Minh, Việt Nam',
        phone: '(028) 3622 1281',
        email: 'hello@tigermarketing.vn',
      },
    ],
  },
  {
    title: '6. Thay đổi',
    content: [
      {
        type: 'paragraph',
        text: 'TIGER Việt Nam bảo lưu quyền thay đổi các điều khoản sử dụng này. Thỉnh thoảng hãy trở lại trang này để xem lại các điều khoản và thông tin mới bất kỳ.',
      },
    ],
  },
] as const;

export const TERMS_AND_CONDITIONS_INTRO = {
  welcome: 'Chào mừng bạn đến với trang web của TIGER Việt Nam ("trang web")! Chúng tôi hy vọng bạn sẽ thích thú với trải nghiệm trực tuyến của bạn.',
  commitment: 'Công ty trách nhiệm hữu hạn (TNHH) TIGER Marketing Việt Nam ("TIGER Việt Nam") cam kết duy trì niềm tin với người sử dụng về trang web của mình. Các quy định dưới đây chi phối việc sử dụng trang web này của bạn.',
} as const;

