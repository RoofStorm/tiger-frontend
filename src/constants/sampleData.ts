// Sample data for development and testing

export const SAMPLE_WHISPERS = [
  'Hôm nay bạn đã trải qua những cảm xúc tuyệt vời. Hãy ghi nhớ khoảnh khắc này và mang nó theo trong hành trình của mình.',
  'Mỗi ngày là một cơ hội mới để khám phá bản thân. Bạn đang trên con đường đúng đắn.',
  'Cảm xúc của bạn hôm nay phản ánh sự phát triển tích cực. Hãy tiếp tục nuôi dưỡng những điều tốt đẹp.',
  'Khoảnh khắc này sẽ trở thành kỷ niệm đẹp. Hãy trân trọng và chia sẻ niềm vui với những người xung quanh.',
  'Bạn đang tạo ra những thay đổi tích cực trong cuộc sống. Hãy tin tưởng vào bản thân và tiếp tục tiến bước.',
  'Những cảm xúc tích cực hôm nay sẽ là nền tảng cho ngày mai tươi sáng hơn.',
  'Bạn đã chọn những emoji thể hiện sự hài lòng và hạnh phúc. Hãy giữ vững tinh thần này!',
  'Mỗi cảm xúc đều có giá trị. Hôm nay bạn đã chọn những điều tích cực, hãy lan tỏa chúng.',
];

export const SAMPLE_REMINDERS = [
  'Nghiên cứu cho thấy việc ghi nhận cảm xúc tích cực giúp tăng cường sức khỏe tinh thần và khả năng phục hồi.',
  'Những người thường xuyên thể hiện lòng biết ơn có xu hướng hạnh phúc hơn và có mối quan hệ tốt hơn.',
  'Việc chia sẻ cảm xúc tích cực không chỉ giúp bản thân mà còn lan tỏa năng lượng tích cực đến mọi người xung quanh.',
  'Ghi nhận những khoảnh khắc hạnh phúc giúp não bộ tạo ra những kết nối thần kinh tích cực lâu dài.',
  'Cảm xúc tích cực có thể làm tăng tuổi thọ và cải thiện chất lượng cuộc sống một cách đáng kể.',
  'Việc thể hiện cảm xúc một cách lành mạnh giúp giảm stress và tăng cường khả năng đối phó với khó khăn.',
  'Chia sẻ cảm xúc với người khác giúp tạo ra sự kết nối sâu sắc và tăng cường mối quan hệ xã hội.',
  'Ghi nhận và trân trọng những khoảnh khắc tích cực giúp tăng cường trí nhớ và khả năng học tập.',
];

export const SAMPLE_REWARDS = [
  {
    id: '1',
    name: 'Cà phê sáng',
    description: 'Một ly cà phê sáng thơm ngon để bắt đầu ngày mới',
    pointsRequired: 100,
    imageUrl: '/images/rewards/coffee.jpg',
    isActive: true,
  },
  {
    id: '2',
    name: 'Voucher ăn trưa',
    description: 'Voucher 50k tại nhà hàng đối tác',
    pointsRequired: 200,
    imageUrl: '/images/rewards/lunch.jpg',
    isActive: true,
  },
  {
    id: '3',
    name: 'Sách tâm lý học',
    description: 'Cuốn sách hay về phát triển bản thân',
    pointsRequired: 500,
    imageUrl: '/images/rewards/book.jpg',
    isActive: true,
  },
  {
    id: '4',
    name: 'Khóa học online',
    description: 'Khóa học kỹ năng mềm trực tuyến',
    pointsRequired: 1000,
    imageUrl: '/images/rewards/course.jpg',
    isActive: true,
  },
  {
    id: '5',
    name: 'Gói spa thư giãn',
    description: 'Trải nghiệm spa để thư giãn và phục hồi',
    pointsRequired: 2000,
    imageUrl: '/images/rewards/spa.jpg',
    isActive: true,
  },
];

export const SAMPLE_POSTS = [
  {
    id: '1',
    userId: 'user1',
    user: {
      id: 'user1',
      name: 'Nguyễn Văn A',
      email: 'user1@example.com',
      avatar: null,
    },
    imageUrl: '/images/posts/sunset.jpg',
    caption: 'Hoàng hôn tuyệt đẹp hôm nay! 🌅',
    likes: 15,
    shares: 3,
    isLiked: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    user: {
      id: 'user2',
      name: 'Trần Thị B',
      email: 'user2@example.com',
      avatar: null,
    },
    imageUrl: '/images/posts/coffee.jpg',
    caption: 'Cà phê sáng và một ngày mới đầy năng lượng! ☕',
    likes: 8,
    shares: 1,
    isLiked: true,
    createdAt: '2024-01-15T08:15:00Z',
    updatedAt: '2024-01-15T08:15:00Z',
  },
];

export const SAMPLE_USER = {
  id: '1',
  email: 'user@example.com',
  name: 'Nguyễn Văn A',
  avatar: null,
  points: 1250,
  role: 'user' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
};

export const SAMPLE_ADMIN_STATS = {
  totalUsers: 1250,
  totalPosts: 3450,
  totalRedeems: 89,
  totalPointsAwarded: 125000,
  recentActivity: [
    {
      type: 'user_registration',
      description: 'Người dùng mới đăng ký',
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      type: 'post_created',
      description: 'Bài viết mới được tạo',
      timestamp: '2024-01-15T10:25:00Z',
    },
    {
      type: 'redeem_approved',
      description: 'Yêu cầu đổi quà được duyệt',
      timestamp: '2024-01-15T10:20:00Z',
    },
  ],
};
