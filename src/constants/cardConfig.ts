/**
 * Card Configuration System
 * 
 * Hệ thống config cho 4 cặp card (card1-4) với các tổ hợp emoji và whisper/reminder tương ứng
 * Whisper và Reminder được lấy từ tổ hợp emoji, không phải từ card
 */

// Định nghĩa 8 tổ hợp emoji cơ bản (single combinations)
export const EMOJI_COMBINATIONS = {
  // 1) Cuộc sống dưới áp lực - công việc siết lại: Deadline + Tức giận
  COMBINATION_1: {
    id: 1,
    name: 'Cuộc sống dưới áp lực - công việc siết lại',
    emojiIds: ['deadline', 'tucgian'],
  },
  // 2) Khi mình cần một "nhịp thở": Thư thái + Bình yên
  COMBINATION_2: {
    id: 2,
    name: 'Khi mình cần một "nhịp thở"',
    emojiIds: ['thuthai', 'binhyen'],
  },
  // 3) Điều nuốt vào trong - không nói được: Chịu đựng + Đóng băng/câm nín
  COMBINATION_3: {
    id: 3,
    name: 'Điều nuốt vào trong - không nói được',
    emojiIds: ['chiudung', 'camnin'],
  },
  // 4) Những vỡ vụn riêng mình: Tan vỡ
  COMBINATION_4: {
    id: 4,
    name: 'Những vỡ vụn riêng mình',
    emojiIds: ['tanvo'],
  },
  // 5) Sự ấm áp nhỏ nhoi trong gia đình: Bữa cơm ấm + Thảnh thơi
  COMBINATION_5: {
    id: 5,
    name: 'Sự ấm áp nhỏ nhoi trong gia đình',
    emojiIds: ['buacoman', 'thanhthoi'],
  },
  // 6) Khi vai mình mỏi – và không ai thấy: Thấm mệt
  COMBINATION_6: {
    id: 6,
    name: 'Khi vai mình mỏi – và không ai thấy',
    emojiIds: ['thammet'],
  },
  // 7) Ngọn lửa muốn bùng lên: Bùng cháy
  COMBINATION_7: {
    id: 7,
    name: 'Ngọn lửa muốn bùng lên',
    emojiIds: ['bungchay'],
  },
  // 8) Thay đổi để sống tiếp: Đổi gió
  COMBINATION_8: {
    id: 8,
    name: 'Thay đổi để sống tiếp',
    emojiIds: ['doigio'],
  },
} as const;

export type CombinationId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Tổ hợp emoji group - chứa whisper và reminder cho một nhóm tổ hợp emoji
 * Ví dụ: [1, 2, 5] có whisper và reminder riêng
 */
export interface EmojiCombinationGroup {
  combinationIds: CombinationId[]; // Ví dụ: [1, 2, 5]
  whisper: string;
  reminder: string;
}

/**
 * Card Config - chỉ chứa thông tin về card và map đến một EmojiCombinationGroup
 */
export interface CardConfig {
  cardNumber: 1 | 2 | 3 | 4;
  combinationIds: CombinationId[]; // Tổ hợp emoji mà card này hỗ trợ
  frontCardImage: string;
  contentCardImage: string;
}

/**
 * Config cho các tổ hợp emoji group
 * Mỗi group có whisper và reminder riêng
 */
export const EMOJI_COMBINATION_GROUPS: EmojiCombinationGroup[] = [
  // Card 1 - Tổ hợp 1
  {
    combinationIds: [1, 2, 5],
    whisper: 'Khi mệt đến mức chỉ muốn tìm một nhịp thở, bạn nhận ra bữa cơm nhà là điều hiếm hoi còn giữ cho lòng mình dịu xuống.',
    reminder: 'Ăn trong không gian yên tĩnh có thể giúp nhịp tim giảm 5-10%, từ đó giúp cơ thể hạ căng thẳng nhanh hơn.',
  },
  // Card 1 - Tổ hợp 1b (2 emoji thuộc nhóm 1, emoji còn lại nhóm 2)
  {
    combinationIds: [1, 2],
    whisper: 'Áp lực công việc phủ kín cuộc sống của bạn. Deadline, trách nhiệm, những cơn bực dồn nén khiến đầu óc luôn trong trạng thái căng cứng. Sự mệt mỏi không còn là cảm xúc thoáng qua mà trở thành phản xạ thường trực. Bạn không cần thêm động lực, bạn cần một nhịp chậm đủ sâu để cơ thể ngừng tự vệ.',
    reminder: 'Chỉ 10–15 phút thư giãn có chủ đích mỗi ngày có thể giúp não thoát khỏi trạng thái cảnh giác liên tục, khôi phục cảm giác hiện diện và kết nối với bản thân.',
  },
  // Card 1 - Tổ hợp 2
  {
    combinationIds: [1, 3, 5],
    whisper: 'Cả ngày ôm nỗi niềm không thể giãi bày, chỉ trong bữa cơm quen, hơi ấm ấy mới khiến lòng ta khẽ buông những gì đã phải giữ.',
    reminder: 'Vài giây thả lỏng vai có thể giúp cơ thể được thư giãn, từ đó giảm căng cơ và stress.',
  },
  // Card 1 - Tổ hợp 3
  {
    combinationIds: [1, 4, 5],
    whisper: 'Giữa những áp lực khiến lòng bạn rã rời, bữa cơm ấm chính là nơi để bạn tạm dựa vào và gom mình lại sau những vỡ vụn khó nói thành lời.',
    reminder: 'Ăn cơm cùng người thân giúp cơ thể tiết nhiều oxytocin, từ đó làm bạn cảm thấy bình tĩnh và dễ chịu hơn.',
  },
  // Card 1 - Tổ hợp 3b (2 emoji thuộc nhóm 1, emoji còn lại nhóm 4)
  {
    combinationIds: [1, 4],
    whisper: 'Công việc dồn dập, nhưng thứ làm bạn chao đảo hơn là những rạn nứt chưa hàn gắn. Bên trong vỡ tan, hiện thực dở dang. Nỗi buồn lúc này không còn chỗ đặt xuống, chỉ biết phải mang theo và tiếp tục đi. Và đúng vậy, nếu đớn đau vẫn còn, tổn thương vẫn chưa lành, cứ nằm xuống và nghe lòng dậy sóng.',
    reminder: 'Không phải lúc nào cuộc sống cũng cần câu trả lời. Đôi khi, chỉ cần cho phép mình ở lại với nỗi đau, cho đến khi nó tự đổi hình dạng.',
  },
  // Card 1 - Tổ hợp 4
  {
    combinationIds: [2, 3, 5],
    whisper: 'Mọi thứ lúc này không quá nặng nề, cũng chưa thể gọi là nhẹ nhõm. Những điều chưa nói vẫn ở đó, chưa được gọi tên, nhưng được đặt yên dưới những sinh hoạt quen thuộc: Bữa ăn đúng giờ, không gian không bị xáo trộn, những khoảng lặng không cần giải thích. Không cần phải hiểu rõ mình đang cảm thấy gì. Chỉ cần nhịp sống tiếp tục trôi theo cách rất bình thường, và thế là đủ.',
    reminder: 'Các nghiên cứu về hành vi cho thấy những thói quen lặp lại trong gia đình có thể giúp giảm tải nhận thức và ổn định hệ thần kinh nhanh hơn, ngay cả khi cảm xúc chưa được giải quyết trọn vẹn.',
  },
  // Card 1 - Tổ hợp 5
  {
    combinationIds: [2, 5, 7],
    whisper: 'Bạn đang ở trong một trạng thái dễ chịu hiếm hoi: không áp lực, không vội vã. Chính sự thảnh thơi nay sẽ giúp bạn có thêm động lực to lớn và tạo ra nguồn năng lượng bền để tiếp tục sống theo cách mình muốn.',
    reminder: 'Thư giãn đều đặn giúp dopamine duy trì ổn định, tạo động lực bền hơn ~30% so với hưng phấn ngắn hạn. Năng lượng được giữ lâu thay vì bốc rồi tắt.',
  },
  // Card 1 - Tổ hợp 6
  {
    combinationIds: [3, 4, 5],
    whisper: 'Những vỡ vụn cứ mãi giấu kín phía sau nhịp sống quen thuộc. Chúng không được chạm tới, cũng không biến mất, chỉ tồn tại trong khi bữa ăn vẫn diễn ra và căn nhà vẫn giữ nguyên dáng vẻ cũ. Gia đình không vá lại những rạn nứt ấy, nhưng giữ cho mọi thứ không sụp xuống cùng một lúc.',
    reminder: 'Cảm giác thuộc về có thể làm giảm hoạt động của vùng não liên quan đến đe dọa xã hội khoảng 15-20%.',
  },
  // Card 1 - Tổ hợp 7
  {
    combinationIds: [3, 5, 6],
    whisper: 'Bạn đang ở trong gia đình của chính mình, nhưng lại không còn thật sự ở hoà nhịp cùng. Bạn hiện diện bằng trách nhiệm nhiều hơn là cảm xúc. Cái mệt này không đến từ một ngày dài hay một việc cụ thể, mà từ việc phải liên tục giữ vai, giữ hòa khí, giữ cho mọi thứ trôi đi ổn thỏa. Sự gồng đó lặp lại qua từng sinh hoạt quen thuộc khiến cảm xúc dần rút lui, đứng lệch ra ngoài kết nối từ lúc nào không hay.',
    reminder: 'Áp lực cảm xúc trong môi trường gia đình có thể tạo ra chronic emotional load, làm hệ thần kinh duy trì trạng thái căng nền ngay cả khi không có xung đột rõ ràng.',
  },
  // Card 1 - Tổ hợp 8
  {
    combinationIds: [3, 5, 7],
    whisper: 'Bên ngoài có thể rất căng thẳng, nhưng khi ngồi vào bữa cơm quen thuộc, bạn cảm nhận rõ ràng nhịp sống được chậm lại. Không cần cố gắng, không cần giữ vai trò nào khác, chỉ cần có mặt là đã đủ đầy. Chính sự thảnh thơi đó làm bạn được tiếp thêm sức để tiến xa hơn, làm nhiều hơn.',
    reminder: 'Cảm giác an toàn trong gia đình giúp hệ thần kinh giảm trạng thái căng kéo dài, từ đó phục hồi năng lượng tinh thần và khả năng duy trì động lực trong thời gian dài.',
  },
  // Card 1 - Tổ hợp 9
  {
    combinationIds: [3, 5, 8],
    whisper: 'Khi nhịp sống bên ngoài dồn dập, bạn nhớ cảm giác quen thuộc của những bữa cơm yên ả. Bạn muốn cùng gia đình hoặc cùng người thương đi đâu đó, mang theo nhịp sống chậm này ra khỏi không gian quen thuộc, để ở bên nhau lâu hơn một chút, trọn vẹn hơn một chút.',
    reminder: 'Các nghiên cứu cho thấy khi não bị đặt trong cùng một bối cảnh cảm xúc quá lâu, khả năng điều tiết suy giảm rõ rệt; chỉ cần thay đổi nhịp sinh hoạt trong 48-72 giờ cũng có thể cải thiện cảm nhận về kiểm soát và giảm cảm giác bức bối tinh thần.',
  },
  // Card 1 - Tổ hợp 10
  {
    combinationIds: [3, 6, 7],
    whisper: 'Ở giữa những mối quan hệ quen thuộc, bạn cảm thấy bạn là người mệt nhất. Gia đình vẫn ở đó, trách nhiệm vẫn đủ đầy, nhưng cảm giác cạn pin thì không giấu được nữa. Bạn cáu gắt, bạn tự đặt ranh giới xa cách, rồi tự trách chính mình vì điều đó.',
    reminder: 'Khi kiệt sức kéo dài, não giảm hoạt động ở vùng điều tiết cảm xúc (prefrontal cortex), khiến phản ứng cáu gắt với người thân dễ xảy ra hơn dù không hề có ác ý.',
  },
  // Card 1 - Tổ hợp 11
  {
    combinationIds: [3, 7, 8],
    whisper: 'Khi áp lực bên ngoài nhiều lên, bạn muốn là được gần gia đình hơn. Muốn cùng nhau đi đâu đó, để có thêm thời gian ở cạnh nhau mà không bị công việc hay những việc lặt vặt chen vào. Chỉ cần đổi không gian, cùng ăn chung một bữa trọn vẹn, cùng ngồi lại lâu hơn bình thường, cảm giác được giải toả đã tự nhiên rõ ràng hơn.',
    reminder: 'Những khoảng thời gian ở cạnh nhau trong không gian mới giúp não giảm sự phân tán chú ý và tăng cảm giác hiện diện.',
  },
  // Card 1 - Tổ hợp 12
  {
    combinationIds: [4, 5, 6],
    whisper: 'Có những rạn nứt không ai nói ra, nhưng khi ngồi vào bữa cơm quen thuộc, cảm giác mệt mỏi được phép hạ xuống. Không cần giải thích, không cần phải ổn. Chỉ cần sự hiện diện bình thường của gia đình cũng đủ để bạn tạm dừng việc phải gồng lên với cuộc đời.',
    reminder: 'Những hoạt động mang tính lặp lại và quen thuộc như bữa ăn gia đình giúp não giảm tín hiệu cảnh báo stress, cho phép cơ thể phục hồi ngay cả khi cảm xúc chưa được giải quyết trọn vẹn.',
  },
  // Card 1 - Tổ hợp 13
  {
    combinationIds: [4, 5, 7],
    whisper: 'Sau những tổn thương, bạn đã thôi không tìm đến ồn ào nữa. Chính những bữa cơm ấm với người mình yêu, với gia đình là nguồn năng lượng mạnh mẽ tiếp sức cho bạn bước tiếp trên hành trình của mình.',
    reminder: 'Cảm giác an toàn cảm xúc kích hoạt hệ thần kinh phó giao cảm, giúp tái tạo năng lượng tinh thần bền vững hơn so với các kích thích ngắn hạn.',
  },
  // Card 1 - Tổ hợp 14
  {
    combinationIds: [5, 6, 7],
    whisper: 'Dù đã thấm mệt, bạn vẫn nhận ra hơi ấm vẫn luôn hiện diện trong những khoảnh khắc sum vầy. Sự thảnh thơi ấy không mang lại cảm giác hưng phấn, nhưng đủ để bạn không rơi vào buông xuôi. Đủ để tiếp tục lo liệu, tiếp tục gánh vác, và từng bước đi lên theo nhịp của riêng mình.',
    reminder: 'Những điểm nghỉ cảm xúc nhỏ nhưng đều đặn giúp ngăn chặn tình trạng kiệt sức toàn phần, duy trì khả năng hồi phục dài hạn.',
  },
  // Card 1 - Tổ hợp 15 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 6) -> [3, 3, 6]
  {
    combinationIds: [3, 3, 6],
    whisper: 'Công việc, tình yêu và những kỳ vọng dồn về phía bạn cùng một lúc đến mức bạn bắt đầu nghi ngờ chính mình: hay là mình kém cỏi thật? Sự mệt mỏi này bào mòn niềm tin từng chút một. Nhưng có những giai đoạn mọi thứ đi ngược hướng không phải để phủ nhận giá trị của bạn, mà để đưa bạn đến một bậc thang mới. TIGER tin bạn đang ở giai đoạn chuyển mình đó.',
    reminder: 'Mệt mỏi tích lũy làm giảm khả năng nhận diện cảm xúc của não, khiến con người tiếp tục chịu đựng mà không nhận ra mình đã quá tải. Cảm giác "vẫn làm được" không đồng nghĩa với việc cơ thể còn đủ năng lượng',
  },
  // Card 1 - Tổ hợp 16
  {
    combinationIds: [1, 3, 8],
    whisper: 'Công việc siết chặt từng ngày, deadline nối tiếp deadline, bực bội cứ thế dâng lên nhưng bạn vẫn cố nuốt lại bên trong. Mọi thứ mắc kẹt ở đó quá lâu. Đến lúc này, bạn không thể tiếp tục ngồi yên. Bạn muốn rời khỏi nhịp sống cũ, đi đâu đó thật mới - không phải để trốn chạy, mà để lấy lại hơi thở và cho mình được sống theo bản năng.',
    reminder: 'Các nghiên cứu về stress mãn tính cho thấy khi áp lực công việc kéo dài trên 6-8 tuần, mức cortisol cao liên tục làm giảm khả năng điều tiết cảm xúc. Việc thay đổi môi trường ngắn hạn (2-4 ngày) cải thiện trạng thái tinh thần chỉ sau 48 giờ',
  },
  // Card 1 - Tổ hợp 17
  {
    combinationIds: [1, 5, 7],
    whisper: 'Giữa một ngày bị bủa vây bởi áp lực và những cảm xúc dễ bùng nổ, bạn đừng quên rằng mình có một điểm tựa. Đó là bàn ăn quen thuộc, nơi bạn không cần phải gồng mình hay phòng thủ. Ở đó, bạn có thể buông xuôi một cách an toàn, để hơi ấm và sự bình yên từ từ len lỏi, hàn gắn lại những mệt mỏi đã tích tụ. Hãy để mình được trở về.',
    reminder: 'Chỉ 15 phút thảnh thơi trong bữa cơm ấm có thể giảm hơn 30% phản ứng căng thẳng của cơ thể. Vì sự ấm áp và an toàn ở đó giúp kích hoạt cơ chế "nghỉ ngơi", làm dịu nhịp tim và xoa dịu cảm xúc của bạn.',
  },
  // Card 1 - Tổ hợp 18
  {
    combinationIds: [1, 4, 7],
    whisper: 'Vết thương tình chưa kịp lành thì công việc đã dí tới tấp. Vậy mà phải vừa đau lòng, phải vừa chạy đua với cuộc sống. Trong mớ hỗn độn đó, cảm giác bực đến phát điên là có thật. Cơn giận không còn âm ỉ nữa, nó nóng, gắt và khó kiểm soát. Dựa núi núi sẽ đổ, dựa người người sẽ đi, bản thân mình chính là chỗ dựa vững vàng nhất.',
    reminder: 'Khi stress kéo dài kèm tổn thương cảm xúc, não tiết cortisol và adrenaline nhiều hơn bình thường, làm khả năng kiểm soát cảm xúc. Đây là phản xạ sinh tồn của cơ thể.',
  },
  // Card 2 - Tổ hợp 1
  {
    combinationIds: [1, 2, 3],
    whisper: 'Hôm nay bạn vừa oằn mình trước áp lực, vừa tự tìm chút bình yên để thở, dù có nhiều điều vẫn đành giữ lại trong lòng.',
    reminder: 'Hít sâu 4-6 giây giúp kích hoạt phản xạ thư giãn của cơ thể và giảm rõ rệt cảm giác căng thẳng.',
  },
  // Card 2 - Tổ hợp 2
  {
    combinationIds: [1, 2, 4],
    whisper: 'Bạn chỉ đang cố giữ mình bình yên giữa ngày đầy áp lực, nhưng những vết đau trong lòng vẫn thỉnh thoảng vọng lại như nhắc rằng chúng chưa kịp lành./ Có những lúc bạn chỉ muốn trái tim mình lặng lại một chút, vì những điều chưa lành vẫn âm thầm kéo bạn về những cảm xúc cũ.',
    reminder: 'Hít thở sâu 6 lần liên tiếp có thể giúp nhịp tim ổn định hơn và làm cơ thể hạ căng thẳng trong vòng một phút.',
  },
  // Card 2 - Tổ hợp 3
  {
    combinationIds: [1, 2, 6],
    whisper: 'Ngày dài ngột ngạt, bạn chỉ ước một phút dừng chân để vai hết gánh nặng, lòng bớt chênh vênh.',
    reminder: 'Nghỉ 20 giây mỗi giờ có thể giúp giảm căng cơ vai và cải thiện sự tập trung.',
  },
  // Card 2 - Tổ hợp 4
  {
    combinationIds: [1, 3, 4],
    whisper: 'Bạn âm thầm gồng gánh mọi chuyện, giấu kín bao điều chất chứa, để rồi một mình nhặt nhạnh những mảnh vỡ trong lòng.',
    reminder: 'Việc ghi lại suy nghĩ trong 2-3 phút có thể giúp giảm căng thẳng và làm dịu vùng xử lý cảm xúc của não bộ.',
  },
  // Card 2 - Tổ hợp 4b (2 emoji đầu cùng nhóm 1, emoji cuối nhóm 3)
  {
    combinationIds: [1, 3],
    whisper: 'Áp lực không còn đến theo từng đợt để bạn kịp chuẩn bị. Bạn tiếp nhận nó mỗi ngày trong im lặng, nhiều đến mức chính cơ thể cũng thôi phản kháng. Dù vậy, TIGER mong rằng sớm mai thức dậy, bạn sẽ giữ cho mình một nhịp sống nhẹ nhàng hơn đôi chút, để ngày mới ôm lấy bạn bằng sự dịu dàng vốn có.',
    reminder: 'Khi cảm xúc bị kìm nén kéo dài, hệ thần kinh duy trì trạng thái căng thẳng, khiến não tiêu hao năng lượng nhiều hơn, dù khối lượng công việc không hề tăng thêm.',
  },
  // Card 2 - Tổ hợp 3b (2 emoji thuộc nhóm 1, emoji còn lại nhóm 6)
  {
    combinationIds: [1, 6],
    whisper: 'Công việc không chỉ lấy đi thời gian, mà bào mòn hết sức lực của bạn. Sự mệt mỏi này không ồn ào, nhưng cứ dai dẳng không nguôi. TIGER mong rằng dẫu đến thế nào, mỗi ngày trôi qua với bạn đều là món quà, bạn sẽ luôn vui và phiên bàn ưu tú ngày nào sẽ quay trở lại',
    reminder: 'Khi mệt mỏi kéo dài, não không còn phục hồi trong lúc nghỉ ngơi - nó chỉ tạm ngừng tiêu hao. Vì vậy khi bạn ngủ, có thể nó vẫn không thật sự hồi sức.',
  },
  // Card 2 - Tổ hợp 5
  {
    combinationIds: [2, 3, 4],
    whisper: 'Bạn đã im lặng chịu đựng quá lâu đến mức những vỡ vụn trong lòng cũng chẳng biết nói cùng ai.',
    reminder: 'Dành 3 phút trút bỏ cảm xúc lên trang giấy, bạn có thể giảm 20% căng thẳng, để tâm trí thôi chật vật và tìm lại sự thư thái',
  },
  // Card 2 - Tổ hợp 5b (2 emoji thuộc nhóm 2, emoji còn lại nhóm 3)
  {
    combinationIds: [2, 3],
    whisper: 'Bề ngoài có vẻ yên, nhưng bên trong còn nhiều điều chưa nói ra. Bạn chọn im lặng vì sự bình yên lúc này quá mong manh để bị khuấy động. Bạn mang theo nhiều điều thật khó nói. Chẳng ai kể hết mình đã vượt qua những gì nên TIGER vỗ tay cho những nỗ lực khi bạn đi đến ngày hôm nay',
    reminder: 'Não bộ thường ưu tiên duy trì trạng thái ổn định hiện tại, khiến con người trì hoãn việc đối diện cảm xúc chưa được xử lý.',
  },
  // Card 2 - Tổ hợp 6
  {
    combinationIds: [2, 4, 6],
    whisper: 'Bạn đang cố giữ cho mình một lớp bình yên mỏng manh, trong khi bên dưới là sự mệt mỏi và những vết nứt chưa kịp lành. Không ồn ào, không bi kịch lúc này chỉ là cảm giác đã dùng gần hết năng lượng để tồn tại cho trọn một ngày.',
    reminder: 'Khi kiệt sức kéo dài, não giảm hoạt động vùng prefrontal cortex tới 20-30%, khiến khả năng tự điều tiết cảm xúc suy yếu dù bề ngoài vẫn khá bình thản.',
  },
  // Card 2 - Tổ hợp 7
  {
    combinationIds: [3, 4, 6],
    whisper: 'Những điều đã nuốt vào trong không còn là cảm xúc mơ hồ nữa, mà là những câu nói bị giữ lại, những phản ứng bị kìm xuống và những lần tự nhủ "thôi, bỏ qua" dù trong lòng không hề ổn. Chúng không biến mất, chỉ bị ép nằm sâu bên trong cho đến khi không còn chỗ chứa. Cảm giác kiệt quệ xuất hiện rất rõ: cơ thể nặng đi, đầu óc rã ra, mọi việc quen thuộc bỗng cần nhiều sức hơn để hoàn thành.',
    reminder: 'Khi căng thẳng cảm xúc bị dồn nén vượt ngưỡng chịu đựng, hệ thần kinh có thể chuyển sang trạng thái kiệt sức, với giấc ngủ sâu giảm tới 40–50%, dù thời gian ngủ không đổi.',
  },
  // Card 2 - Tổ hợp 8
  {
    combinationIds: [3, 4, 7],
    whisper: 'Những điều bị giữ lại không chỉ làm tổn thương, mà còn tích tụ thành một cơn căng thẳng bên trong. Có lúc cảm giác như chỉ cần thêm một tác động nhỏ, mọi thứ sẽ vượt khỏi tầm kiểm soát. Không phải vì muốn bùng nổ, mà vốn nó đã rạn nứt vì đã tích tụ quá lâu những điều đáng lẽ không nên giữ một mình.',
    reminder: 'Cảm xúc chưa được giải phóng thường chuyển hóa thành căng cơ kéo dài, đặc biệt ở vùng vai và cổ.',
  },
  // Card 2 - Tổ hợp 9
  {
    combinationIds: [1, 5, 8],
    whisper: 'Thật tuyệt khi giữa áp lực chồng chất mà bạn vẫn giữ lại cho mình chút thảnh thơi của riêng mình. Và bạn không chờ đến khi bản thân bị bào mòn, bạn muốn đổi gió như một lựa chọn tỉnh táo: tìm một môi trường mới để làm mới nhịp sống, trước khi áp lực kịp lấy đi sự dễ chịu mà bạn đang có.',
    reminder: 'Khi thay đổi không gian sinh hoạt, trạng thái thư giãn của não có thể duy trì lâu gấp đôi so với việc nghỉ ngơi trong môi trường quen thuộc, nhờ giảm kích hoạt các tác nhân gây stress lặp lại.',
  },
  // Card 2 - Tổ hợp 10
  {
    combinationIds: [2, 4, 5],
    whisper: 'Bạn không cố gắng che giấu đi những mảnh vỡ, cũng không vội hàn gắn. Bạn chọn giữ cho đời sống chậm và ấm, đủ thảnh thơi để những cảm xúc rối ren được đặt xuống an toàn. Những điều không vui hiện tại, thôi xin hẹn lần sau.',
    reminder: 'Nhịp sinh hoạt chậm giúp giảm hoạt động vùng amygdala liên quan đến stress khoảng 20%. Nhờ đó, cảm xúc phức tạp được xử lý mà không gây quá tải.',
  },
  // Card 2 - Tổ hợp 11
  {
    combinationIds: [3, 6, 8],
    whisper: 'Bạn nhận ra ý nghĩ rời đi không còn là dự định. Bạn đang lên kế hoạch đi đến một nơi khác, không vai trò, không nghĩa vụ, để cơ thể được nghỉ trước khi tinh thần gãy hẳn. Để rồi chồi non sẽ lại đơm hoa. Vì sẽ chẳng có cơn mưa nào không ngừng đổ sau chuỗi ngày phong ba.',
    reminder: 'Nghiên cứu về stress mãn tính cho thấy khi mức cortisol duy trì cao trong nhiều ngày, não sẽ tự động tăng nhu cầu rút lui xã hội để giảm kích thích. Đây là phản xạ sinh tồn của hệ thần kinh, không phải sự lạnh nhạt về mặt tình cảm.',
  },
  // Card 2 - Tổ hợp 12 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 4) -> [3, 3, 4]
  {
    combinationIds: [3, 3, 4],
    whisper: 'Mọi thứ đang thực sự tệ. Nỗi buồn này không thoáng qua, mà là cảm giác bị dồn đến chân tường. Bạn vẫn làm việc đấy, vẫn cười nói trước bao người, nhưng cảm xúc đã vỡ thành từng mảnh. Dẫu thế, TIGER tin rằng, vì bạn có khả năng vượt qua nên thử thách này mới xuất hiện. Vỗ tay bạn cho những nỗ lực dù là nhỏ bé nhất <3.',
    reminder: 'Khi cảm xúc bị kìm nén kéo dài, não tăng hoạt động ở vùng xử lý đau cảm xúc, khiến cảm giác tổn thương trở nên rõ rệt hơn dù không có tác nhân mới.',
  },
  // Card 2 - Tổ hợp 13 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 8) -> [3, 3, 8]
  {
    combinationIds: [3, 3, 8],
    whisper: 'Bạn không còn muốn ở yên trong không gian cũ, nơi mọi cảm xúc phải chen chúc để tồn tại. Bạn cần đi đâu đó, không phải để trốn chạy, mà để được hít thở trọn vẹn, được trút bỏ những vai diễn mà mình đã giữ quá lâu, và chạm lại vào nguồn năng lượng đã bị bỏ quên. Và đi đâu thì đi, đừng quên TIGER nhen ^.^',
    reminder: 'Chỉ cần 2-3 ngày thay đổi môi trường, đặc biệt là không gian có yếu tố thiên nhiên (ánh sáng tự nhiên, cây xanh, mặt nước), nhịp tim lúc nghỉ và mức cortisol có thể giảm đến 30%, giúp hệ thần kinh quay lại trạng thái cân bằng nhanh',
  },
  // Card 2 - Tổ hợp 14 (2 emoji thuộc nhóm 2, emoji còn lại nhóm 5) -> [2, 2, 5]
  {
    combinationIds: [2, 2, 5],
    whisper: 'Bạn đang ở trong một nhịp sống dễ chịu hiếm hoi. Sự thảnh thơi này mang lại đầy cảm hứng sống. TIGER chúc bạn sẽ đi cùng trạng thái này thêm chút nữa. Và những điều đẹp nhất thường bắt đầu từ đây.',
    reminder: 'Giữ nhịp này bằng một việc rất nhỏ hôm nay:\n- Ngủ sớm hơn 20 phút, ăn chậm một bữa, hoặc không nhận thêm việc mới.\n- Bình yên cần được bảo vệ, không phải tiêu hao.',
  },
  // Card 2 - Tổ hợp 15
  {
    combinationIds: [2, 4, 8],
    whisper: 'Bình yên hiện tại không còn đủ rộng để ôm trọn những vỡ vụn bên trong, và bạn biết mình cần một không gian khác để hít thở trọn vẹn hơn. Một điểm đến tĩnh lặng chính là câu trả lời - nơi bạn có thể thả lỏng tâm trí, đổi mới góc nhìn, và kéo dài cảm giác thư thái để khai phóng toàn bộ tiềm năng bên trong.',
    reminder: 'Thay đổi môi trường sống tạm thời giúp giảm trạng thái cảnh giác liên tục của não sau 48-72 giờ, kể cả khi không có hoạt động nghỉ dưỡng mạnh.',
  },
  // Card 2 - Tổ hợp 16
  {
    combinationIds: [6, 7, 8],
    whisper: 'Bạn đi hết một năm bằng tất cả những gì mình có. Mệt thật nhưng ngọn lửa cống hiến chưa bao giờ ngừng tắt. TIGER chúc mừng bạn đã trải qua 365 ngày bằng tất cả nỗ lực và lòng biết ơn. Mong bạn sẽ có hành trình mới đầy hy vọng và rực rỡ.',
    reminder: 'Năm mới không cần bắt đầu bằng việc chạy nhanh hơn. Chỉ cần bước sang với một nhịp thở đầy đủ hơn. Khi năng lượng được tái tạo, mọi hành trình phía trước đều có lý do để nở hoa.',
  },
  // Card 3 - Tổ hợp 1
  {
    combinationIds: [1, 2, 8],
    whisper: 'Khi mọi thứ dồn lại đến mức tâm trí không còn chỗ để thở, bạn chỉ muốn dừng lại một chút và đổi gió để làm mới tâm trạng trước khi bước tiếp.',
    reminder: 'Đi bộ sau giờ làm giúp giảm stress và khiến tinh thần nhẹ nhàng hơn.',
  },
  // Card 3 - Tổ hợp 1b (2 emoji thuộc nhóm 1, emoji còn lại nhóm 5)
  {
    combinationIds: [1, 5],
    whisper: 'Giữa áp lực công việc siết chặt, bạn tìm thấy điểm tựa ở những điều nhỏ bé: một bữa cơm ấm, một cái ôm, một khoảnh khắc hít thở sâu. TIGER chúc bạn thấy niềm vui trong từng buổi sáng, thấy cơ hội trong mỗi thử thách và thấy hi vọng khi mọi thứ chưa thành hình.',
    reminder: 'Những sinh hoạt quen thuộc mang tính nhịp điệu (ăn uống, nghỉ ngơi đúng giờ) không chỉ nuôi cơ thể, mà còn giúp não tìm lại cảm giác an toàn.',
  },
  // Card 3 - Tổ hợp 2
  {
    combinationIds: [1, 7, 8],
    whisper: 'Những ngày căng thẳng lặp lại, bạn chỉ muốn chạy trốn, vì năng lượng dồn nén trong tim đã đến lúc cần được giải phóng.',
    reminder: 'Đi bộ 5 phút có thể giúp cơ thể giải phóng năng lượng căng thẳng và làm dịu cảm giác quá tải tức thời.',
  },
  // Card 3 - Tổ hợp 3
  {
    combinationIds: [2, 3, 8],
    whisper: 'Sự im lặng lúc này giống một khoảng lùi nhẹ khỏi những điều đã giữ quá lâu. Bạn đã phải thật mạnh mẽ mới có thể rời đi khỏi điều mình từng mong muốn, khi cuối cùng bạn cũng nhận ra mình xứng đáng với nhiều điều hơn thế.',
    reminder: 'Chỉ cần thay đổi môi trường trong 48-72 giờ đã đủ để não giảm hoạt động của các vòng lặp cảm xúc quen thuộc.',
  },
  // Card 3 - Tổ hợp 4
  {
    combinationIds: [2, 5, 6],
    whisper: 'Bạn đang ở trong một nhịp sống khá dễ chịu, mọi thứ nhìn bề ngoài vẫn trôi. Nhưng cơ thể thì không nói dối. Có một lực vô hình đang giữ bạn lại, đủ để những ý định bật lên chưa thể thành hình. Bạn muốn đi xa hơn, làm nhiều hơn, bứt phá hơn nhưng cơ thể chưa sẵn sàng đi cùng ý định ấy.',
    reminder: 'Khi mệt mỏi tích lũy kéo dài, khả năng phục hồi thể chất có thể giảm 20–30%, ngay cả khi tinh thần vẫn cảm thấy "ổn". Cơ thể cần được tái tạo trước khi năng lượng thật sự quay lại.',
  },
  // Card 3 - Tổ hợp 5
  {
    combinationIds: [2, 5, 8],
    whisper: 'Khoảng thời gian này với bạn thật sự dễ chịu. Nhịp sống vừa vặn, tâm trí thoáng đãng và đủ bình yên. Một chuyến du lịch hoặc một quyết định thay đổi môi trường mới sẽ làm cho những ngày đẹp này trở nên đáng nhớ hơn. Một nơi có núi để mở rộng tầm nhìn, có biển để thả lỏng nhịp thở, hoặc là một nơi bạn giúp bạn khám phá điều mới và phát huy được thêm những khả năng khác chính là điều bạn cần.',
    reminder: 'Các môi trường mới giúp não tăng khả năng ghi nhớ cảm xúc tích cực lên khoảng 25-30%, đồng thời kích thích tư duy linh hoạt và sáng tạo cao hơn so với khi ở không gian quen thuộc.',
  },
  // Card 3 - Tổ hợp 6
  {
    combinationIds: [2, 6, 7],
    whisper: 'Mọi thứ đang ở trạng thái "lưng chừng" đến ổn, nhưng chính sự ổn định kéo dài ấy lại khiến bạn bối rối. Quá nhiều dòng suy nghĩ chạy song song, quá nhiều cảm giác lưng chừng khiến bạn chần chừ trước những quyết định vốn dĩ đã muốn làm từ lâu. Bên trong vẫn vẫn nguồn năng lượng chờ để rực rỡ, chỉ là nó đang bị kẹt giữa thói quen an toàn và khao khát bứt ra để bùng nổ thật sự.',
    reminder: 'Khi con người ở trạng thái "ổn định kéo dài", mức kích hoạt hành động có thể giảm khoảng 15-20%, dù năng lượng nền vẫn còn. Một kích thích mới đủ mạnh - trải nghiệm, mục tiêu, hoặc thay đổi môi trường - có thể giúp động lực quay lại nhanh hơn đáng kể so với khi đã rơi vào kiệt sức.',
  },
  // Card 3 - Tổ hợp 7
  {
    combinationIds: [2, 7, 8],
    whisper: 'Bạn cảm giác mình đang được "mở khoá". Không còn lăn tăn đúng-sai, mọi thứ đã sẵn sàng và bạn chỉ cần nhấn ga, mọi trải nghiệm phía trước đều sẽ trôi chảy. Bạn được phép tận hưởng trọn vẹn cảm giác sống hết mình này. TIGER ủng hộ bạn mọi điều thật tuyệt trên con đường hứa hẹn phía trước.',
    reminder: 'Khi năng lượng đang cao, não giải phóng dopamine mạnh hơn, khiến trải nghiệm trở nên hứng khởi và đáng nhớ hơn tới 25-30% - Đây chính là thời điểm lý tưởng để "nhấn ga".',
  },
  // Card 3 - Tổ hợp 8
  {
    combinationIds: [4, 6, 7],
    whisper: 'Những mảnh vỡ bên trong cùng sự mệt mỏi kéo dài khiến khả năng chịu đựng của bạn suy giảm rõ rệt. Cơn bực bội xuất hiện không vì một tác nhân lớn, mà vì mọi thứ đã chạm giới hạn. Phản ứng mạnh lúc này không còn là lựa chọn, mà là hệ quả.',
    reminder: 'Khi kiệt sức cảm xúc, não giảm khả năng điều tiết phản ứng, làm cảm xúc bộc lộ nhanh và mạnh hơn trước kích thích nhỏ.',
  },
  // Card 3 - Tổ hợp 9
  {
    combinationIds: [4, 6, 8],
    whisper: 'Bạn đã đi qua đủ nhiều rạn nứt để hiểu rằng sự mệt mỏi này không còn là thoáng qua. Nó tích lại trong người, khiến từng ngày trôi qua đều nặng hơn ngày trước. Bạn thực sự muốn rời khỏi không gian quen thuộc, đi đến một nơi không ai biết mình là ai, để thở sâu, để cơ thể được nghỉ trước khi cảm xúc kịp sụp đổ.',
    reminder: 'Khi rời khỏi môi trường gây căng thẳng, chỉ 2-3 ngày tiếp xúc với không gian mới cũng đủ làm giảm nồng độ cortisol - hormone stress - và cải thiện khả năng tự điều chỉnh cảm xúc, ngay cả khi chưa có thay đổi lớn nào xảy ra.',
  },
  // Card 3 - Tổ hợp 10
  {
    combinationIds: [5, 6, 8],
    whisper: 'Bạn thực sự muốn đi đâu đó. Đi tìm một bầu không khí tươi mới, đủ yên để thảnh thơi, đủ tách khỏi nhịp cũ đang bào mòn. Có thể là những bữa ăn đánh thức vị giác, những con đường chưa quen để thăm thú, hoặc đơn giản chỉ là một nơi mà cơ thể được hít vào thở ra, trước khi sự mệt mỏi kịp tích tụ thêm.',
    reminder: 'Nghiên cứu cho thấy việc chủ động thay đổi không gian ngay khi xuất hiện dấu hiệu mệt mỏi giúp ngăn stress chuyển sang trạng thái kéo dài, hiệu quả hơn so với chờ đến khi kiệt sức mới nghỉ.',
  },
  // Card 3 - Tổ hợp 11
  {
    combinationIds: [5, 7, 8],
    whisper: 'Bạn đang ở trong một nhịp sống dễ chịu, cơ thể nhẹ tênh, đầu óc thoải mái, năng lượng đủ đầy để muốn làm gì đó cho mình. Ngay lúc này, bạn muốn đổi gió như một cú nhấn ga - mở rộng không gian, làm mới giác quan, và tận hưởng trọn vẹn cuộc sống tươi đẹp đang chờ đợi phía trước.',
    reminder: 'Khi con người thay đổi bối cảnh trong trạng thái cảm xúc tích cực, não tăng khả năng ghi nhớ trải nghiệm và duy trì năng lượng lâu hơn so với việc ở yên trong không gian quen thuộc.',
  },
  // Card 3 - Tổ hợp 12
  {
    combinationIds: [4, 5, 8],
    whisper: 'Sau tất cả những gì đã trải qua, điều bạn trân trọng nhất lúc này là sự thảnh thơi. Ngoài những bữa cơm quen thuộc và nhịp sinh hoạt chậm rãi, bạn muốn mang nếp sống ấy sang một không gian khác - nơi cảm giác an yên được mở rộng, không còn bị bó hẹp trong bốn bức tường quen thuộc.',
    reminder: 'Các nghiên cứu cho thấy khi con người chủ động thay đổi bối cảnh sống trong trạng thái cảm xúc ổn định, não tăng khả năng thích nghi tích cực và duy trì động lực lâu hơn so với thay đổi mang tính phản ứng.',
  },
  // Card 3 - Tổ hợp 13
  {
    combinationIds: [4, 7, 8],
    whisper: 'Có những vết xước trong gia đình không đủ lớn để gọi tên, nhưng đủ sâu để làm mình muốn bước ra ngoài một chút. Không phải bỏ đi, chỉ là cần không gian để vết thương không tiếp tục cọ xát mỗi ngày. Đổi gió, lúc này, là một cách giữ gìn mối quan hệ còn lại.',
    reminder: 'Khi cảm xúc tổn thương chưa được xử lý, việc tiếp xúc liên tục có thể làm tăng phản ứng stress tới 30%, khiến xung đột lặp lại dù không có nguyên nhân mới.',
  },
  // Card 3 - Tổ hợp 14 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 5) -> [3, 3, 5]
  {
    combinationIds: [3, 3, 5],
    whisper: 'Một bữa ăn cùng gia đình, một khoảnh khắc ngồi cạnh người thương là điều bạn muốn ngay lúc này. Giữa những tổn thương chưa kịp gọi tên, chỉ cần được đến gần và chạm vào sự thân thuộc đó, cũng đủ để xua tan mọi buồn đau ngoài kia. TIGER chúc những tình yêu và những người đồng hành ấy sẽ luôn là điểm tựa trên hành trình sống của bạn.',
    reminder: 'Những nghi thức sinh hoạt lặp lại như ăn uống đúng giờ giúp hệ thần kinh phó giao cảm hoạt động mạnh hơn, làm giảm mức cortisol.',
  },
  // Card 3 - Tổ hợp 15 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 1) -> [5, 5, 1]
  {
    combinationIds: [5, 5, 1],
    whisper: 'Giữa một ngày bị bủa vây bởi áp lực và những cảm xúc dễ bùng nổ, đừng quên rằng mình có một điểm tựa. Đó là bàn ăn quen thuộc, nơi bạn không cần phải gồng mình hay phòng thủ. Ở đó, bạn có thể buông xuôi một cách an toàn, để hơi ấm và sự bình yên ôm ấp những tổn thương ngoài kia. Hãy để mình được trở về.',
    reminder: 'Chỉ 15 phút thảnh thơi trong bữa cơm ấm có thể giảm hơn 30% phản ứng căng thẳng của cơ thể. Vì sự ấm áp và an toàn ở đó giúp kích hoạt cơ chế "nghỉ ngơi", làm dịu nhịp tim và xoa dịu cảm xúc của bạn.',
  },
  // Card 3 - Tổ hợp 16 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 2) -> [5, 5, 2]
  {
    combinationIds: [5, 5, 2],
    whisper: 'Bạn đang ở trong một nhịp sống dễ chịu hiếm hoi. Cơ thể nhẹ tênh, lòng không còn gấp gáp. Những bữa ăn ấm áp, không khí gia đình thân thuộc, và cảm giác bên cạnh người thương khiến bạn thấy mình đủ đầy theo cách rất giản dị. Chỉ cần ở yên trong khoảnh khắc này cũng đã là một dạng hạnh phúc.',
    reminder: 'Khi ăn trong trạng thái thư thái, hệ thần kinh phó giao cảm được kích hoạt, giúp cơ thể tiêu hoá tốt hơn và mức căng thẳng giảm rõ rệt chỉ sau 15-20 phút. Bình yên đôi khi bắt đầu từ một bữa ăn không vội.',
  },
  // Card 3 - Tổ hợp 17 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 3) -> [5, 5, 3]
  {
    combinationIds: [5, 5, 3],
    whisper: 'Sau tất cả những gì đã trải qua, điều bạn trân trọng nhất lúc này là sự thảnh thơi. Ngoài những bữa cơm quen thuộc và nhịp sinh hoạt chậm rãi, bạn muốn mang nếp sống ấy sang một không gian khác - nơi cảm giác an yên được mở rộng, không còn bị bó hẹp trong bốn bức tường quen thuộc.',
    reminder: 'Các nghiên cứu cho thấy khi con người chủ động thay đổi bối cảnh sống trong trạng thái cảm xúc ổn định, não tăng khả năng thích nghi tích cực và duy trì động lực lâu hơn so với thay đổi mang tính phản ứng.',
  },
  // Card 3 - Tổ hợp 18 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 4) -> [5, 5, 4]
  {
    combinationIds: [5, 5, 4],
    whisper: 'Sau những tổn thương, bạn đã thôi không tìm đến sự ồn ào nữa. Chính những bữa cơm ấm với người mình yêu, với gia đình là nguồn năng lượng mạnh mẽ tiếp sức cho bạn bước tiếp trên hành trình của mình.',
    reminder: 'Cảm giác an toàn cảm xúc kích hoạt hệ thần kinh phó giao cảm, giúp tái tạo năng lượng tinh thần bền vững hơn so với các kích thích ngắn hạn.',
  },
  // Card 3 - Tổ hợp 19 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 6) -> [5, 5, 6]
  {
    combinationIds: [5, 5, 6],
    whisper: 'Giữa những bộn bề mệt mỏi ngày cuối năm, bạn tìm thấy điểm tựa ở những điều nhỏ bé: một bữa cơm ấm, một cái ôm, một khoảnh khắc hít thở sâu. TIGER chúc bạn thấy niềm vui trong từng buổi sáng, thấy cơ hội trong mỗi thử thách và thấy hi vọng ngay cả khi mọi thứ chưa thành hình.',
    reminder: 'Những sinh hoạt quen thuộc mang tính nhịp điệu (ăn uống, nghỉ ngơi đúng giờ) không chỉ nuôi cơ thể, mà còn giúp não tìm lại cảm giác an toàn.',
  },
  // Card 4 - Tổ hợp 1
  {
    combinationIds: [1, 6, 7],
    whisper: 'Áp lực đè nén cả ngày khiến đôi vai bạn mỏi đến lịm đi, và đâu đó bên trong, cơn nóng âm ỉ ấy chỉ chực trào lên vì bạn đã phải chịu đựng quá lâu.',
    reminder: 'Hít thở sâu khoảng một phút có thể giúp nhịp tim ổn định hơn 10 - 15%, từ đó làm cơ thể dịu căng thẳng nhanh hơn.',
  },
  // Card 4 - Tổ hợp 2
  {
    combinationIds: [2, 3, 6],
    whisper: 'Sự mệt mỏi xuất hiện không theo một cao trào rõ ràng, mà lan dần trong khi mọi thứ vẫn diễn ra đều đặn. Cảm xúc này đã được giữ lại quá sâu, còn cơ thể lại tiếp tục vận hành bằng phần năng lượng còn lại. Không có khoảnh khắc nào được đánh dấu để dừng lại, chỉ có cảm giác đang đi tiếp đang ngày càng chậm hơn, nặng hơn, mà khó gọi tên lý do.',
    reminder: 'Việc kìm nén cảm xúc kéo dài có thể làm mức tiêu hao năng lượng của não tăng khoảng 20-25%, tạo ra cảm giác mệt không rõ nguyên nhân.',
  },
  // Card 4 - Tổ hợp 3
  {
    combinationIds: [2, 3, 7],
    whisper: 'Dưới bề mặt yên ổn vẫn tồn tại một nguồn năng lượng chưa được sử dụng. Nó không bộc lộ, không làm xáo trộn nhịp sống, nhưng luôn bị nén lại để ngày nào đó chực chờ phát nổ. Mọi thứ vẫn trôi đúng nhịp, chỉ là bên trong có điều gì đó chưa tìm được lối ra.',
    reminder: 'Cortisol nền có thể tăng trung bình 30% khi cảm xúc bị dồn nén trong thời gian dài.',
  },
  // Card 4 - Tổ hợp 4
  {
    combinationIds: [2, 4, 7],
    whisper: 'Trong bạn tồn tại một sự bình yên rất rõ, nhưng không hề trống rỗng. Dưới lớp bình thản ấy là những gì đã bị dồn nén quá lâu: những mỏi mệt chưa kịp xả, những mong muốn chưa kịp thành hình. Không ồn ào, không hỗn loạn - chỉ là trạng thái sẵn sàng bùng lên ngay khi giới hạn cuối cùng bị chạm vào.',
    reminder: 'Năng lượng bị kìm nén kích hoạt hệ thần kinh giao cảm, làm nhịp tim và mức hưng phấn tăng khoảng 15–20% ngay cả khi chưa có hành động cụ thể.',
  },
  // Card 4 - Tổ hợp 5
  {
    combinationIds: [1, 2, 7],
    whisper: 'Áp lực chồng chất khiến bạn chỉ muốn tìm một khoảng lặng, để những xúc cảm đang thắt nghẹn trong tim có chỗ dịu đi. Nhưng TIGER ở đây để nói rằng, TIGER tự hào bởi vì bạn đã sống sót qua những ngày tồi tệ nhất cuộc đời, những ngày mà bạn chỉ muốn chạy trốn.',
    reminder: 'Thả lỏng vai và cơ mặt 10 giây có thể giúp não giảm phản ứng căng thẳng nhanh hơn.',
  },
  // Card 4 - Tổ hợp 5b
  {
    combinationIds: [2, 6, 8],
    whisper: 'Nhịp sống vẫn êm đềm, nhưng cảm giác không rõ ràng và mỏi âm ỉ khiến bạn chậm lại trước những câu hỏi quan trọng: mình đang muốn gì, và nên đi tiếp theo hướng nào. Ý định đổi môi trường xuất hiện rất tự nhiên - không phải để trốn tránh, mà để tách khỏi những nhiễu động quen thuộc, cho đầu óc đủ khoảng trống nhìn lại chính mình và chọn ra điều thật sự cần làm.',
    reminder: 'Việc đổi môi trường trong khoảng 5-7 ngày giúp não thoát khỏi vòng lặp thói quen, từ đó tăng khả năng tự suy ngẫm và đưa ra quyết định rõ ràng hơn so với ở trong  không gian quen thuộc.',
  },
  // Card 4 - Tổ hợp 6
  {
    combinationIds: [3, 4, 8],
    whisper: 'Khi những mảnh vỡ không còn nằm gọn bên trong, ý nghĩ rời khỏi bối cảnh hiện tại xuất hiện rất rõ. Không phải để trốn tránh, mà vì ở đây đã không còn đủ chỗ cho tất cả những gì đang mang theo. Sự thay đổi lúc này không phải là mong muốn, mà là nhu cầu.',
    reminder: 'Di chuyển sang môi trường mới giúp não giảm phản ứng stress nhanh hơn khoảng 25% - 30%',
  },
  // Card 4 - Tổ hợp 7
  {
    combinationIds: [1, 3, 6],
    whisper: 'Bạn vẫn làm tốt công việc của mình, vẫn chưa chọn bỏ cuộc. Nhưng sự mệt mỏi đã lên đến đỉnh điểm. Có những ngày cảm giác trống rỗng đến mức không còn biết phải phản kháng thế nào. Nhưng TIGER mong, dù có những ngày tuyệt vọng cùng cực, bạn và cuộc đời sẽ tha thứ cho nhau.',
    reminder: 'Khi căng thẳng bị kìm nén liên tục, mức tiêu hao năng lượng của cơ thể có thể tăng thêm 25-30%, dù khối lượng công việc không đổi.',
  },
  // Card 4 - Tổ hợp 8
  {
    combinationIds: [1, 3, 7],
    whisper: 'Mọi thứ hôm dường như hoá điên với bạn. Bạn không còn muốn chịu đựng thêm và luôn có điều gì đó thôi thúc: phải làm thật khác đi để phá vỡ bóng tối đang bủa vây. Bởi ở trong bóng tối quá lâu đã cho bạn thấy bên trong mình vẫn âm thầm rực sáng.',
    reminder: 'Khi cảm xúc bị dồn nén đủ lâu, não dễ chuyển sang trạng thái "hành động nhanh", làm nhu cầu thay đổi tăng mạnh hơn 20% so với bình thường.',
  },
  // Card 4 - Tổ hợp 1b (2 emoji thuộc nhóm 1, emoji còn lại nhóm 7)
  {
    combinationIds: [1, 7],
    whisper: 'Áp lực càng lớn, bên trong bạn lại càng bùng lên một nguồn năng lượng phản kháng âm thầm. Bạn không còn muốn chịu đựng theo quán tính cũ. Có điều gì đó thôi thúc bạn phá vỡ nhịp sống hiện tại. Không phải để nổi loạn, mà vì bạn biết mình có nhiều hơn thế. TIGER chúc bạn phá kén thành công.',
    reminder: 'Stress ở mức cao có thể kích hoạt động lực hành động, nhưng chỉ khi bạn cho cơ thể đủ không gian để chuyển hóa năng lượng đó.',
  },
  // Card 4 - Tổ hợp 1c (2 emoji thuộc nhóm 1, emoji còn lại nhóm 8)
  {
    combinationIds: [1, 8],
    whisper: 'Không gian quen thuộc bắt đầu trở nên quá hẹp cho những gì bạn cố gồng gánh. Công việc siết chặt, nhịp sống lặp lại, và trong bạn xuất hiện một thôi thúc rất rõ: Phải đi!. Như một dòng nước nếu không đổi hướng sẽ dần tù đọng, bạn cần một chuyển động mới mẻ để tiếp tục dòng chảy.',
    reminder: 'Trà để lâu sẽ nhạt đi, phải thay bằng matcha latte thôi 🍀',
  },
  // Card 4 - Tổ hợp 2b (2 emoji thuộc nhóm 2, emoji còn lại nhóm 4)
  {
    combinationIds: [2, 4],
    whisper: 'Bạn đang cố giữ cho mình một mặt nước phẳng lặng, dù bên dưới là những đợt sóng dồn nén. Bình yên lúc này không phải vì mọi thứ đã ổn, mà vì bạn đã quá mệt để khuấy động thêm. Nhưng sóng không biến mất chỉ vì ta im lặng. Sự thật sẽ lộ diện khi trái tim ta sẵn sàng. TIGER mong bạn luôn đủ vững tâm để bước tiếp, theo cách của riêng mình.',
    reminder: 'Tâm lý học gọi đây là cơ chế "emotional buffering" - não giảm độ nhạy cảm xúc sau tổn thương để tránh quá tải, giúp con người tồn tại qua giai đoạn mong manh trước khi đủ an toàn để hồi phục.',
  },
  // Card 4 - Tổ hợp 3b (2 emoji thuộc nhóm 2, emoji còn lại nhóm 7)
  {
    combinationIds: [2, 7],
    whisper: 'Bình yên nhưng không đứng yên - năng lượng trong bạn đang cháy rực. Mọi thứ đã vào đúng vị trí: tâm thế vững vàng, động lực đủ đầy, và khát khao chinh phục những đỉnh cao mới đã sẵn sàng dẫn lối. TIGER chúc hành trình tiếp theo của bạn thật rực rỡ.',
    reminder: 'Khi tinh thần ổn định và năng lượng nội tại ở mức cao, não bộ bước vào trạng thái hiệu suất cao - khả năng học hỏi, ra quyết định và dấn thân tăng rõ rệt. Đây là thời điểm tốt nhất để bắt đầu điều mới, đi xa hơn, hoặc chinh phục một đỉnh cao tiếp theo.',
  },
  // Card 4 - Tổ hợp 4 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 2) -> [3, 3, 2]
  {
    combinationIds: [3, 3, 2],
    whisper: 'Bạn chọn im lặng không phải vì bạn né tránh hay không muốn cố gắng, mà vì bình yên này quá quý giá để đánh đổi. Còn nhiều điều nặng lòng, còn vương lại đâu đó, và chưa thể nói ra ngay. Bạn cho mình quyền được yên thêm một chút - để không phải tự làm đau mình nữa. Với TIGER, đây chỉ là một dấu phẩy nhỏ, để bạn tiếp tục viết tiếp câu chuyện hạnh phúc sau này.',
    reminder: 'Nghiên cứu về self-regulation cho thấy, khi con người chọn im lặng để giữ trạng thái ổn định, não bộ đang ưu tiên vùng kiểm soát cảm xúc để tránh xung đột nội tâm. Bình yên này không giả tạo - nó là cơ chế tự bảo vệ.',
  },
  // Card 4 - Tổ hợp 5 (2 emoji thuộc nhóm 3, emoji còn lại nhóm 7) -> [3, 3, 7]
  {
    combinationIds: [3, 3, 7],
    whisper: 'Bạn đang quá tải vì cố gắng cân bằng mọi thứ. Những gì từng được nuốt vào trong dần chuyển thành mỏi mệt, rồi thành bực tức như muốn nổ tung. Càng kìm nén, thôi thúc phải làm điều gì đó khác đi càng trở nên rõ ràng và dữ dội. TIGER chúc bạn luôn tin tưởng vào bản thân và mỗi bước đi tiếp theo đều gặp may mắn.',
    reminder: 'Các nghiên cứu về động lực cho thấy, khi cá nhân giữ được kiểm soát trong thời gian dài, khả năng bùng phát hành động có chủ đích sẽ mạnh mẽ hơn khi thời điểm phù hợp xuất hiện.',
  },
  // Card 4 - Tổ hợp 6 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 7) -> [5, 5, 7]
  {
    combinationIds: [5, 5, 7],
    whisper: 'Bạn đang ở trong một trạng thái dễ chịu hiếm hoi: không áp lực, không vội vã. Chính sự thảnh thơi này sẽ giúp bạn có thêm động lực to lớn và tạo ra năng lượng bền bỉ để tiếp tục sống theo cách mình muốn. TIGER ủng hộ bạn sống mạnh mẽ hơn, quyết liệt hơn, và tin rằng bất cứ điều gì bạn chọn lúc này đều sẽ cháy tới cùng.',
    reminder: 'Thư giãn đều đặn giúp dopamine duy trì ổn định, tạo động lực bền hơn ~30% so với hưng phấn ngắn hạn. Năng lượng được giữ lâu hơn thay vì chớm nở rồi tắt.',
  },
  // Card 4 - Tổ hợp 7 (2 emoji thuộc nhóm 5, emoji còn lại nhóm 8) -> [5, 5, 8]
  {
    combinationIds: [5, 5, 8],
    whisper: 'Khoảng thời gian này với bạn thật sự dễ chịu. Nhịp sống vừa vặn, tâm trí thoáng đãng và đủ bình yên. Một chuyến du lịch hoặc một quyết định thay đổi môi trường mới  sẽ làm cho những ngày đẹp này trở nên đáng nhớ hơn. Một nơi có núi để mở rộng tầm nhìn, có biển để thả lỏng nhịp thở, hoặc là một nơi bạn giúp bạn khám phá điều mới và phát huy được thêm những khả năng khác chính là điều bạn cần.',
    reminder: 'Các môi trường mới giúp não tăng khả năng ghi nhớ cảm xúc tích cực lên khoảng 25-30%, đồng thời kích thích tư duy linh hoạt và sáng tạo cao hơn so với khi ở không gian quen thuộc.',
  },
];

/**
 * Config cho 4 card
 * Mỗi card map đến một tổ hợp emoji group
 */
export const CARD_CONFIGS: CardConfig[] = [
  {
    cardNumber: 1,
    combinationIds: [1, 3, 5],
    frontCardImage: '/nhipsong/front_card_1.png',
    contentCardImage: '/nhipsong/card_content1.png',
  },
  {
    cardNumber: 2,
    combinationIds: [2, 3, 4],
    frontCardImage: '/nhipsong/front_card_2.png',
    contentCardImage: '/nhipsong/card_content2.png',
  },
  {
    cardNumber: 3,
    combinationIds: [3, 4, 5],
    frontCardImage: '/nhipsong/front_card_3.png',
    contentCardImage: '/nhipsong/card_content3.png',
  },
  {
    cardNumber: 4,
    combinationIds: [4, 5, 6],
    frontCardImage: '/nhipsong/front_card_4.png',
    contentCardImage: '/nhipsong/card_content4.png',
  },
];

/**
 * Tìm EmojiCombinationGroup dựa trên các tổ hợp emoji
 * @param combinationIds - Mảng các combination IDs (ví dụ: [1, 2, 5])
 * @returns EmojiCombinationGroup tương ứng hoặc null nếu không tìm thấy
 */
export function findCombinationGroup(combinationIds: CombinationId[]): EmojiCombinationGroup | null {
  const sortedIds = [...combinationIds].sort();
  
  return EMOJI_COMBINATION_GROUPS.find(group => {
    const sortedGroupIds = [...group.combinationIds].sort();
    return JSON.stringify(sortedGroupIds) === JSON.stringify(sortedIds);
  }) || null;
}

/**
 * Tìm EmojiCombinationGroup với exact match (không sort) - dùng cho các trường hợp đặc biệt
 * như [5, 5, 1] vs [1, 1, 5] để phân biệt số lượng emoji trong mỗi nhóm
 */
export function findCombinationGroupExact(combinationIds: CombinationId[]): EmojiCombinationGroup | null {
  return EMOJI_COMBINATION_GROUPS.find(group => {
    return JSON.stringify(group.combinationIds) === JSON.stringify(combinationIds);
  }) || null;
}

/**
 * Tìm card config dựa trên 3 emoji được chọn
 * Logic: 
 * - Mỗi emoji thuộc về một hoặc nhiều tổ hợp
 * - Tạo ra một mảng các tổ hợp từ 3 emoji (ví dụ: [1, 3, 5])
 * - Tìm xem có tổ hợp nào trong EMOJI_COMBINATION_GROUPS match với mảng này không
 * - Nếu có, tìm card nào hỗ trợ tổ hợp đó
 * 
 * Ví dụ: deadline + chiudung + thanhthoi
 * - deadline thuộc tổ hợp 1
 * - chiudung thuộc tổ hợp 3
 * - thanhthoi thuộc tổ hợp 5
 * => Tạo mảng [1, 3, 5]
 * => Tìm trong EMOJI_COMBINATION_GROUPS có tổ hợp [1, 3, 5] không
 * => Nếu có, tìm card hỗ trợ tổ hợp đó (Card1)
 * 
 * @param selectedEmojiIds - Mảng 3 emoji IDs được chọn
 * @returns Object chứa CardConfig và EmojiCombinationGroup, hoặc null nếu không tìm thấy
 */
export function findCardByEmojis(selectedEmojiIds: string[]): {
  card: CardConfig;
  combinationGroup: EmojiCombinationGroup;
} | null {
  if (selectedEmojiIds.length !== 3) {
    return null;
  }

  // Tìm các tổ hợp mà mỗi emoji thuộc về
  const combinationIdsForEachEmoji: CombinationId[][] = [];
  
  selectedEmojiIds.forEach(emojiId => {
    const combinations = getCombinationsByEmojiId(emojiId);
    if (combinations.length > 0) {
      combinationIdsForEachEmoji.push(combinations);
    }
  });

  // Nếu không tìm thấy tổ hợp cho tất cả emoji, trả về null
  if (combinationIdsForEachEmoji.length !== 3) {
    return null;
  }

  // Kiểm tra các trường hợp đặc biệt: 2 trong 3 emoji thuộc combination 1, emoji còn lại thuộc combination 2, 3, 4, 5, 6, 7, hoặc 8
  // Hoặc 2 trong 3 emoji thuộc combination 2, emoji còn lại thuộc combination 3, 4, hoặc 7
  // Đếm số emoji thuộc các combination
  let countCombo1 = 0;
  let countCombo2 = 0;
  let countCombo3 = 0;
  let countCombo4 = 0;
  let countCombo5 = 0;
  let countCombo6 = 0;
  let countCombo7 = 0;
  let countCombo8 = 0;
  
  combinationIdsForEachEmoji.forEach(combos => {
    if (combos.includes(1)) {
      countCombo1++;
    }
    if (combos.includes(2)) {
      countCombo2++;
    }
    if (combos.includes(3)) {
      countCombo3++;
    }
    if (combos.includes(4)) {
      countCombo4++;
    }
    if (combos.includes(5)) {
      countCombo5++;
    }
    if (combos.includes(6)) {
      countCombo6++;
    }
    if (combos.includes(7)) {
      countCombo7++;
    }
    if (combos.includes(8)) {
      countCombo8++;
    }
  });

  // Card 1: 2 emoji thuộc combination 2, emoji còn lại thuộc combination 1 -> [2, 1] (ưu tiên trước [1, 2])
  if (countCombo2 >= 2 && countCombo1 >= 1) {
    // Tạo config tạm với [1, 2] nhưng whisper/reminder khác
    const specialGroup: EmojiCombinationGroup = {
      combinationIds: [1, 2], // Sẽ được sort thành [1, 2]
      whisper: 'Giữa khối lượng công việc dày đặc, bạn vẫn giữ cho mình một điểm tựa tinh thần vững vàng. Deadline và trách nhiệm không hề nhẹ đi, nhưng bạn không để bản thân trượt khỏi quỹ đạo. TIGER cảm ơn bạn vì đã không bỏ cuộc, vì đã chọn đối mặt. 2026 thật rực rỡ nhé ✨',
      reminder: 'Căng thẳng không đến từ khối lượng công việc, mà từ việc cơ thể không kịp hồi phục. Những khoảng nghỉ ngắn lặp lại mỗi ngày giúp não "reset" trước khi áp lực kịp tích tụ thành kiệt sức.',
    };
    
    const card1Combinations = [
      [1, 2, 5], [1, 3, 5], [1, 4, 5], [1, 2], [1, 4], [2, 3, 5], [2, 5, 7], [3, 4, 5], [3, 5, 6],
      [3, 5, 7], [3, 5, 8], [3, 6, 7], [3, 7, 8], [4, 5, 6], [4, 5, 7], [5, 6, 7]
    ];
    
    const isCard1 = card1Combinations.some(combo => {
      const sortedCombo = [...combo].sort();
      return JSON.stringify(sortedCombo) === JSON.stringify([1, 2]);
    });

    if (isCard1) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 1: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 1 -> [3, 1] (ưu tiên trước [1, 3])
  if (countCombo3 >= 2 && countCombo1 >= 1) {
    // Tạo config tạm với [1, 3] nhưng whisper/reminder khác
    const specialGroup: EmojiCombinationGroup = {
      combinationIds: [1, 3], // Sẽ được sort thành [1, 3]
      whisper: 'Bạn đang phải gánh quá nhiều thứ mà không nói ra. Áp lực công việc cứ dồn dập, còn cảm xúc thì bị giữ chặt bên trong, không có lối thoát. Mọi thứ diễn ra đều đặn đến mức bạn không chắc mình đang chịu đựng hay chỉ đang im lặng để tồn tại. Có bao nhiêu ngày bạn đã "sống" mà không có mặt ở đó?',
      reminder: 'Việc kìm nén cảm xúc trong môi trường áp lực cao có thể làm tăng phản ứng căng thẳng sinh lý, khiến cơ thể mệt nhanh hơn dù thời gian nghỉ ngơi vẫn có',
    };
    
    const card1Combinations = [
      [1, 2, 5], [1, 3, 5], [1, 4, 5], [1, 2], [1, 4], [2, 3, 5], [2, 5, 7], [3, 4, 5], [3, 5, 6],
      [3, 5, 7], [3, 5, 8], [3, 6, 7], [3, 7, 8], [4, 5, 6], [4, 5, 7], [5, 6, 7]
    ];
    
    const isCard1 = card1Combinations.some(combo => {
      const sortedCombo = [...combo].sort();
      return JSON.stringify(sortedCombo) === JSON.stringify([1, 3]);
    });

    if (isCard1) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 1: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 2 -> [1, 2]
  if (countCombo1 >= 2 && countCombo2 >= 1) {
    const specialGroup = findCombinationGroup([1, 2]);
    if (specialGroup) {
      const card1Combinations = [
        [1, 2, 5], [1, 3, 5], [1, 4, 5], [1, 2], [1, 4], [2, 3, 5], [2, 5, 7], [3, 4, 5], [3, 5, 6],
        [3, 5, 7], [3, 5, 8], [3, 6, 7], [3, 7, 8], [4, 5, 6], [4, 5, 7], [5, 6, 7]
      ];
      
      const isCard1 = card1Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 2]);
      });

      if (isCard1) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 1: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 4 -> [1, 4]
  if (countCombo1 >= 2 && countCombo4 >= 1) {
    const specialGroup = findCombinationGroup([1, 4]);
    if (specialGroup) {
      const card1Combinations = [
        [1, 2, 5], [1, 3, 5], [1, 4, 5], [1, 2], [1, 4], [2, 3, 5], [2, 5, 7], [3, 4, 5], [3, 5, 6],
        [3, 5, 7], [3, 5, 8], [3, 6, 7], [3, 7, 8], [4, 5, 6], [4, 5, 7], [5, 6, 7]
      ];
      
      const isCard1 = card1Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 4]);
      });

      if (isCard1) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 1: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 6 -> [3, 3, 6]
  if (countCombo3 >= 2 && countCombo6 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 6]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 2: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 3 -> [1, 3]
  if (countCombo1 >= 2 && countCombo3 >= 1) {
    const specialGroup = findCombinationGroup([1, 3]);
    if (specialGroup) {
      const card2Combinations = [
        [1, 2, 3], [1, 2, 4], [1, 2, 6], [1, 3, 4], [1, 3], [1, 6], [2, 3, 4], [2, 3], [2, 4, 6],
        [3, 4, 6], [3, 4, 7], [1, 5, 8], [2, 4, 5], [3, 6, 8]
      ];
      
      const isCard2 = card2Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 3]);
      });

      if (isCard2) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 2: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 6 -> [1, 6]
  if (countCombo1 >= 2 && countCombo6 >= 1) {
    const specialGroup = findCombinationGroup([1, 6]);
    if (specialGroup) {
      const card2Combinations = [
        [1, 2, 3], [1, 2, 4], [1, 2, 6], [1, 3, 4], [1, 3], [1, 6], [2, 3, 4], [2, 3], [2, 4, 6],
        [3, 4, 6], [3, 4, 7], [1, 5, 8], [2, 4, 5], [3, 6, 8]
      ];
      
      const isCard2 = card2Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 6]);
      });

      if (isCard2) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 2: 2 emoji thuộc combination 2, emoji còn lại thuộc combination 3 -> [2, 3]
  if (countCombo2 >= 2 && countCombo3 >= 1) {
    const specialGroup = findCombinationGroup([2, 3]);
    if (specialGroup) {
      const card2Combinations = [
        [1, 2, 3], [1, 2, 4], [1, 2, 6], [1, 3, 4], [1, 3], [1, 6], [2, 3, 4], [2, 3], [2, 4, 6],
        [3, 4, 6], [3, 4, 7], [1, 5, 8], [2, 4, 5], [3, 6, 8]
      ];
      
      const isCard2 = card2Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([2, 3]);
      });

      if (isCard2) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 2: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 4 -> [3, 3, 4]
  if (countCombo3 >= 2 && countCombo4 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 4]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 2: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 8 -> [3, 3, 8]
  if (countCombo3 >= 2 && countCombo8 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 8]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 2: 2 emoji thuộc combination 2, emoji còn lại thuộc combination 5 -> [2, 2, 5]
  if (countCombo2 >= 2 && countCombo5 >= 1) {
    const specialGroup = findCombinationGroupExact([2, 2, 5]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 5 -> [3, 3, 5]
  if (countCombo3 >= 2 && countCombo5 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 5]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 1 -> [5, 5, 1]
  if (countCombo5 >= 2 && countCombo1 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 1]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 2 -> [5, 5, 2]
  if (countCombo5 >= 2 && countCombo2 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 2]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 3 -> [5, 5, 3]
  if (countCombo5 >= 2 && countCombo3 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 3]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 4 -> [5, 5, 4]
  if (countCombo5 >= 2 && countCombo4 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 4]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 6 -> [5, 5, 6]
  if (countCombo5 >= 2 && countCombo6 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 6]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 3: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 5 -> [1, 5]
  if (countCombo1 >= 2 && countCombo5 >= 1) {
    const specialGroup = findCombinationGroup([1, 5]);
    if (specialGroup) {
      const card3Combinations = [
        [1, 2, 8], [1, 7, 8], [2, 3, 8], [2, 5, 6], [2, 5, 8], [2, 6, 7],
        [2, 7, 8], [4, 6, 7], [4, 6, 8], [5, 6, 8], [5, 7, 8], [4, 5, 8], [4, 7, 8], [1, 5],
        [3, 5], [5, 1], [5, 2], [5, 3], [5, 4], [5, 6]
      ];
      
      const isCard3 = card3Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 5]);
      });

      if (isCard3) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 4: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 7 -> [1, 7]
  if (countCombo1 >= 2 && countCombo7 >= 1) {
    const specialGroup = findCombinationGroup([1, 7]);
    if (specialGroup) {
      const card4Combinations = [
        [1, 6, 7], [2, 3, 6], [2, 3, 7], [2, 4, 7], [1, 2, 7], [2, 6, 8], [3, 4, 8], [1, 3, 6], [1, 3, 7], [1, 7], [1, 8], [2, 4], [2, 7]
      ];
      
      const isCard4 = card4Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 7]);
      });

      if (isCard4) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 4: 2 emoji thuộc combination 1, emoji còn lại thuộc combination 8 -> [1, 8]
  if (countCombo1 >= 2 && countCombo8 >= 1) {
    const specialGroup = findCombinationGroup([1, 8]);
    if (specialGroup) {
      const card4Combinations = [
        [1, 6, 7], [2, 3, 6], [2, 3, 7], [2, 4, 7], [1, 2, 7], [2, 6, 8], [3, 4, 8], [1, 3, 6], [1, 3, 7], [1, 7], [1, 8], [2, 4], [2, 7]
      ];
      
      const isCard4 = card4Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([1, 8]);
      });

      if (isCard4) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 4: 2 emoji thuộc combination 2, emoji còn lại thuộc combination 4 -> [2, 4]
  if (countCombo2 >= 2 && countCombo4 >= 1) {
    const specialGroup = findCombinationGroup([2, 4]);
    if (specialGroup) {
      const card4Combinations = [
        [1, 6, 7], [2, 3, 6], [2, 3, 7], [2, 4, 7], [1, 2, 7], [2, 6, 8], [3, 4, 8], [1, 3, 6], [1, 3, 7], [1, 7], [1, 8], [2, 4], [2, 7]
      ];
      
      const isCard4 = card4Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([2, 4]);
      });

      if (isCard4) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 4: 2 emoji thuộc combination 2, emoji còn lại thuộc combination 7 -> [2, 7]
  if (countCombo2 >= 2 && countCombo7 >= 1) {
    const specialGroup = findCombinationGroup([2, 7]);
    if (specialGroup) {
      const card4Combinations = [
        [1, 6, 7], [2, 3, 6], [2, 3, 7], [2, 4, 7], [1, 2, 7], [2, 6, 8], [3, 4, 8], [1, 3, 6], [1, 3, 7], [1, 7], [1, 8], [2, 4], [2, 7]
      ];
      
      const isCard4 = card4Combinations.some(combo => {
        const sortedCombo = [...combo].sort();
        return JSON.stringify(sortedCombo) === JSON.stringify([2, 7]);
      });

      if (isCard4) {
        const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
        return {
          card,
          combinationGroup: specialGroup,
        };
      }
    }
  }

  // Card 4: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 2 -> [3, 3, 2]
  if (countCombo3 >= 2 && countCombo2 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 2]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 4: 2 emoji thuộc combination 3, emoji còn lại thuộc combination 7 -> [3, 3, 7]
  if (countCombo3 >= 2 && countCombo7 >= 1) {
    const specialGroup = findCombinationGroupExact([3, 3, 7]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 4: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 7 -> [5, 5, 7]
  if (countCombo5 >= 2 && countCombo7 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 7]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Card 4: 2 emoji thuộc combination 5, emoji còn lại thuộc combination 8 -> [5, 5, 8]
  if (countCombo5 >= 2 && countCombo8 >= 1) {
    const specialGroup = findCombinationGroupExact([5, 5, 8]);
    if (specialGroup) {
      const card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
      return {
        card,
        combinationGroup: specialGroup,
      };
    }
  }

  // Tạo tất cả các tổ hợp có thể từ 3 emoji
  // Mỗi emoji có thể thuộc nhiều tổ hợp, nên ta cần tạo tất cả các kết hợp có thể
  const possibleCombinations: CombinationId[][] = [];
  
  // Tạo tất cả các kết hợp có thể (mỗi emoji chọn một tổ hợp)
  const [combos1, combos2, combos3] = combinationIdsForEachEmoji;
  
  combos1.forEach(combo1 => {
    combos2.forEach(combo2 => {
      combos3.forEach(combo3 => {
        // Loại bỏ trùng lặp trước khi sort (ví dụ: [1, 1, 3] -> [1, 3])
        const uniqueCombination = Array.from(new Set([combo1, combo2, combo3]));
        const combination = uniqueCombination.sort((a, b) => a - b);
        // Chỉ thêm nếu chưa có trong danh sách
        const exists = possibleCombinations.some(
          existing => JSON.stringify(existing) === JSON.stringify(combination)
        );
        if (!exists) {
          possibleCombinations.push(combination as CombinationId[]);
        }
      });
    });
  });

  // Tìm tổ hợp nào trong EMOJI_COMBINATION_GROUPS match với các tổ hợp có thể
  let matchedGroup: EmojiCombinationGroup | null = null;
  
  for (const possibleCombo of possibleCombinations) {
    const group = findCombinationGroup(possibleCombo);
    if (group) {
      matchedGroup = group;
      break; // Lấy tổ hợp đầu tiên tìm thấy
    }
  }

  if (!matchedGroup) {
    return null;
  }

  // Tìm card nào hỗ trợ tổ hợp này
  // Card1 và Card2 hỗ trợ nhiều tổ hợp, Card3/4 hỗ trợ tổ hợp riêng của chúng
  const card1Combinations = [
    [1, 2, 5], [1, 3, 5], [1, 4, 5], [1, 2], [1, 4], [2, 3, 5], [2, 5, 7], [3, 4, 5], [3, 5, 6],
    [3, 5, 7], [3, 5, 8], [3, 6, 7], [3, 7, 8], [4, 5, 6], [4, 5, 7], [5, 6, 7], [1, 3, 8], [1, 5, 7], [1, 4, 7]
  ];
  
  const card2Combinations = [
    [1, 2, 3], [1, 2, 4], [1, 2, 6], [1, 3, 4], [1, 3], [1, 6], [2, 3, 4], [2, 3], [2, 4, 6],
    [3, 4, 6], [3, 4, 7], [1, 5, 8], [2, 4, 5], [3, 6, 8], [2, 4, 8], [6, 7, 8]
  ];
  
  const card3Combinations = [
    [1, 2, 8], [1, 7, 8], [2, 3, 8], [2, 5, 6], [2, 5, 8], [2, 6, 7],
    [2, 7, 8], [4, 6, 7], [4, 6, 8], [5, 6, 8], [5, 7, 8], [4, 5, 8], [4, 7, 8], [1, 5],
    [3, 5], [5, 1], [5, 2], [5, 3], [5, 4], [5, 6]
  ];
  
  const card4Combinations = [
    [1, 6, 7], [2, 3, 6], [2, 3, 7], [2, 4, 7], [1, 2, 7], [2, 6, 8], [3, 4, 8], [1, 3, 6], [1, 3, 7], [1, 7], [1, 8], [2, 4], [2, 7]
  ];
  
  const sortedMatchedIds = [...matchedGroup.combinationIds].sort();
  const isCard1 = card1Combinations.some(combo => {
    const sortedCombo = [...combo].sort();
    return JSON.stringify(sortedCombo) === JSON.stringify(sortedMatchedIds);
  });
  
  const isCard2 = card2Combinations.some(combo => {
    const sortedCombo = [...combo].sort();
    return JSON.stringify(sortedCombo) === JSON.stringify(sortedMatchedIds);
  });
  
  const isCard3 = card3Combinations.some(combo => {
    const sortedCombo = [...combo].sort();
    return JSON.stringify(sortedCombo) === JSON.stringify(sortedMatchedIds);
  });
  
  const isCard4 = card4Combinations.some(combo => {
    const sortedCombo = [...combo].sort();
    return JSON.stringify(sortedCombo) === JSON.stringify(sortedMatchedIds);
  });

  let card: CardConfig;
  if (isCard1) {
    card = CARD_CONFIGS.find(c => c.cardNumber === 1)!;
  } else if (isCard2) {
    card = CARD_CONFIGS.find(c => c.cardNumber === 2)!;
  } else if (isCard3) {
    card = CARD_CONFIGS.find(c => c.cardNumber === 3)!;
  } else if (isCard4) {
    card = CARD_CONFIGS.find(c => c.cardNumber === 4)!;
  } else {
    // Tìm card khác dựa trên combinationIds
    card = CARD_CONFIGS.find(c => {
      const sortedCardIds = [...c.combinationIds].sort();
      return JSON.stringify(sortedCardIds) === JSON.stringify(sortedMatchedIds);
    }) || CARD_CONFIGS[0]; // Fallback to Card1
  }

  return {
    card,
    combinationGroup: matchedGroup,
  };
}

/**
 * Lấy tất cả emoji IDs từ một tổ hợp
 */
export function getEmojiIdsFromCombination(combinationId: CombinationId): string[] {
  const combination = Object.values(EMOJI_COMBINATIONS).find(
    combo => combo.id === combinationId
  );
  return combination ? [...combination.emojiIds] : [];
}

/**
 * Kiểm tra xem một emoji ID có thuộc tổ hợp nào không
 */
export function getCombinationsByEmojiId(emojiId: string): CombinationId[] {
  const result: CombinationId[] = [];
  Object.values(EMOJI_COMBINATIONS).forEach(combination => {
    if ((combination.emojiIds as readonly string[]).indexOf(emojiId) !== -1) {
      result.push(combination.id as CombinationId);
    }
  });
  return result;
}

