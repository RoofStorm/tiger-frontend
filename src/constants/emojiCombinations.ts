export interface EmojiCombination {
  id: string;
  emojis: string[];
  whisper: string;
  reminder: string;
  category: 'mindful' | 'tiger-linked' | 'trendy';
}

export const EMOJI_COMBINATIONS: EmojiCombination[] = [
  // Nhóm 1: Mindful & Touching
  {
    id: 'mindful-1',
    emojis: ['🌿', '🎶', '🍚'],
    whisper: "Trong bạn có hai nhịp đối nghịch – một nhịp chậm, muốn lắng đọng; một nhịp rộn rã, muốn bung nở. Nhưng sâu thẳm, bạn biết mâm cơm quen thuộc luôn là điểm neo vững nhất.",
    reminder: "Ăn cơm chung 5 lần/tuần giúp trẻ tăng 40% sự tự tin và giảm nguy cơ lo âu.",
    category: 'mindful'
  },
  {
    id: 'mindful-2',
    emojis: ['💔', '🧸', '🎢'],
    whisper: "Trái tim bạn chao đảo, dằn vặt như tàu lượn cảm xúc. Điều bạn khao khát không phải thoát ra, mà là một vòng tay đủ ấm để neo lại.",
    reminder: "Một cái ôm 20 giây giúp cơ thể tiết oxytocin, làm dịu huyết áp và xoa dịu cảm xúc ngay tức thì.",
    category: 'mindful'
  },
  {
    id: 'mindful-3',
    emojis: ['📉', '😶', '☔'],
    whisper: "Bạn như mắc kẹt trong một ngày mưa xám, không muốn nói, cũng chẳng đủ sức bước tiếp. Sự im lặng ấy cũng là một cách cơ thể xin được nghỉ ngơi.",
    reminder: "Viết xuống những điều khiến bạn lo lắng giúp giảm 37% hoạt động vùng não chịu trách nhiệm căng thẳng.",
    category: 'mindful'
  },
  {
    id: 'mindful-4',
    emojis: ['🧘', '🔔', '🌸'],
    whisper: "Bạn tìm tiếng chuông nhỏ trong tâm hồn, để mọi xao động ngoài kia dần lắng xuống.",
    reminder: "Ngồi yên 2 phút, tập trung hơi thở, giúp giảm 18% huyết áp chỉ sau 5 ngày.",
    category: 'mindful'
  },
  {
    id: 'mindful-5',
    emojis: ['🕰', '🚶', '🌙'],
    whisper: "Bạn muốn lặng lẽ bước dưới ánh đèn đường, nghe từng nhịp chân để nhắc mình rằng vẫn đang tiến về phía trước.",
    reminder: "Đi bộ 100 bước sau bữa ăn giúp giảm đường huyết tới 30%.",
    category: 'mindful'
  },

  // Nhóm 2: Tiger-linked
  {
    id: 'tiger-1',
    emojis: ['☕', '📖', '🌧'],
    whisper: "Một tách trà bên cửa sổ, vài trang sách và tiếng mưa – bạn mong những điều đơn sơ ấy đủ sưởi ấm một ngày dài.",
    reminder: "Trà xanh giúp tăng 26% khả năng tập trung trong 2h kế tiếp.",
    category: 'tiger-linked'
  },
  {
    id: 'tiger-2',
    emojis: ['🍱', '🚌', '🏢'],
    whisper: "Bạn mang theo hộp cơm trưa, như mang theo một mảnh nhà đi giữa thành phố bận rộn.",
    reminder: "Tự nấu ăn giúp giảm 30% nguy cơ béo phì so với ăn ngoài thường xuyên.",
    category: 'tiger-linked'
  },
  {
    id: 'tiger-3',
    emojis: ['🍶', '🎶', '🌌'],
    whisper: "Bạn tìm một buổi tối thảnh thơi, nhấp ngụm ấm áp, để nhạc nhẹ nâng đỡ tâm trạng.",
    reminder: "Một lượng rượu sake nhỏ (150ml) giúp tăng tuần hoàn máu và giảm lo âu.",
    category: 'tiger-linked'
  },
  {
    id: 'tiger-4',
    emojis: ['🍇', '🍞', '☀️'],
    whisper: "Bạn chỉ muốn một bữa sáng đơn giản – vài trái nho, lát bánh, ánh nắng chan hòa – là đủ để bắt đầu mới.",
    reminder: "Ăn sáng giàu carb chậm giúp não duy trì năng lượng ổn định suốt 4 tiếng.",
    category: 'tiger-linked'
  },
  {
    id: 'tiger-5',
    emojis: ['🍩', '☕', '💻'],
    whisper: "Bạn mong một chút ngọt ngào xen giữa deadline, để nhắc mình rằng niềm vui nhỏ vẫn có chỗ.",
    reminder: "Ăn snack nhỏ trong giờ làm giúp tăng 15% hiệu suất làm việc buổi chiều.",
    category: 'tiger-linked'
  },

  // Nhóm 3: Trendy & Playful
  {
    id: 'trendy-1',
    emojis: ['✨', '🤝', '🌍'],
    whisper: "Chẳng phải phép màu, vậy mà ta vẫn gặp nhau hôm nay.",
    reminder: "Kết nối xã hội là yếu tố giảm 50% nguy cơ tử vong sớm – mạnh hơn cả bỏ thuốc.",
    category: 'trendy'
  },
  {
    id: 'trendy-2',
    emojis: ['🙅', '🚫', '💔'],
    whisper: "Biến đi – kẻ đó không xứng với năng lượng đẹp của bạn.",
    reminder: "Người bị từ chối tình cảm có nguy cơ stress cao hơn 70%, nhưng việc dứt khoát giúp giảm vòng xoáy tiêu cực.",
    category: 'trendy'
  },
  {
    id: 'trendy-3',
    emojis: ['🌀', '🧠', '🤹'],
    whisper: "Não bạn giờ như 7749 tab Chrome mở cùng lúc.",
    reminder: "Kỹ thuật Pomodoro (25' tập trung – 5' nghỉ) giúp tăng 40% hiệu quả công việc.",
    category: 'trendy'
  },
  {
    id: 'trendy-4',
    emojis: ['💌', '📲', '😍'],
    whisper: "Thả react đỏ thôi mà trái tim bạn đã đánh trống trận.",
    reminder: "Tin nhắn từ người mình thích kích hoạt vùng não giống khi trúng thưởng.",
    category: 'trendy'
  },
  {
    id: 'trendy-5',
    emojis: ['🛋', '🎮', '🍕'],
    whisper: "Ai cần party khi có ghế sofa, pizza và game.",
    reminder: "Chơi game 30 phút/ngày có thể tăng kỹ năng giải quyết vấn đề thêm 13%.",
    category: 'trendy'
  }
];

// Helper function to find combination by emojis
export function findCombinationByEmojis(emojis: string[]): EmojiCombination | null {
  const sortedEmojis = [...emojis].sort();
  
  for (const combination of EMOJI_COMBINATIONS) {
    const sortedCombinationEmojis = [...combination.emojis].sort();
    if (JSON.stringify(sortedEmojis) === JSON.stringify(sortedCombinationEmojis)) {
      return combination;
    }
  }
  
  return null;
}

// Get all unique emojis from combinations
export function getAllEmojis(): string[] {
  const emojis = new Set<string>();
  EMOJI_COMBINATIONS.forEach(combination => {
    combination.emojis.forEach(emoji => emojis.add(emoji));
  });
  return Array.from(emojis);
}

// Get combinations by category
export function getCombinationsByCategory(category: 'mindful' | 'tiger-linked' | 'trendy'): EmojiCombination[] {
  return EMOJI_COMBINATIONS.filter(combo => combo.category === category);
}
