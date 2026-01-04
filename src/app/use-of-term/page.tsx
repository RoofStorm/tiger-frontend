import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng - TIGER Việt Nam',
  description: 'Điều khoản sử dụng của trang web TIGER Việt Nam',
  robots: 'index, follow',
};

export default function TermsOfUsePage() {
  const currentDate = new Date().toLocaleDateString('vi-VN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-green-600 pb-4">
          Điều khoản sử dụng
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-gray-600 mb-6">
            <strong>Cập nhật lần cuối:</strong> {currentDate}
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-r-lg">
            <p className="text-gray-800 leading-relaxed font-medium">
              Chào mừng bạn đến với trang web của TIGER Việt Nam (&quot;trang web&quot;)! Chúng tôi hy vọng bạn sẽ thích thú với trải nghiệm trực tuyến của bạn.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Công ty trách nhiệm hữu hạn (TNHH) TIGER Marketing Việt Nam (&quot;TIGER Việt Nam&quot;) cam kết duy trì niềm tin với người sử dụng về trang web của mình. Các quy định dưới đây chi phối việc sử dụng trang web này của bạn.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">1</span>
              Những hình thức sử dụng có thể được chấp nhận
            </h2>
            <div className="pl-11">
              <p className="mb-4">
                Hãy tự do khám phá trang web của chúng tôi và nếu có thể, hãy đóng góp tài liệu cho trang web, chẳng hạn như câu hỏi, thông báo và nội dung đa phương tiện (ví dụ như hình ảnh, video).
              </p>
              <p className="mb-4">
                Tuy nhiên, việc sử dụng trang web và các tài liệu được đưa lên không được bất hợp pháp hoặc phản cảm theo bất kỳ phương diện nào. Bạn cần lưu tâm để không:
              </p>
              <ul className="list-none space-y-3 mb-4">
                <li className="flex items-start">
                  <span className="font-bold mr-2">(a)</span>
                  <span>xâm phạm quyền riêng tư của người khác;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">(b)</span>
                  <span>vi phạm các quyền sở hữu trí tuệ;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">(c)</span>
                  <span>đưa ra những tuyên bố phỉ báng (kể cả đối với TIGER Việt Nam), liên quan đến nội dung khiêu dâm, có tính phân biệt chủng tộc hoặc bài ngoại, xúi bẩy căm ghét hoặc kích động bạo lực hoặc hỗn loạn;</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">(d)</span>
                  <span>tải lên các tập tin chứa virus hoặc dẫn đến các vấn đề về an ninh; hoặc bằng cách nào đó gây nguy hiểm cho tính trọn vẹn của trang web.</span>
                </li>
              </ul>
              <p className="italic text-gray-600 bg-gray-50 p-3 border-l-2 border-gray-300">
                Hãy lưu ý rằng TIGER Việt Nam có quyền loại bỏ nội dung bất kỳ mà mình tin là bất hợp pháp hoặc phản cảm ra khỏi trang web.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">2</span>
              Bảo vệ dữ liệu
            </h2>
            <div className="pl-11">
              <p>
                Thông báo về Quyền Riêng tư của chúng tôi áp dụng với dữ liệu hoặc tư liệu cá nhân bất kỳ được chia sẻ trên trang web này.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">3</span>
              Sở Hữu Trí Tuệ
            </h2>
            <div className="pl-11">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1. Nội dung do TIGER Việt Nam cung cấp</h3>
                <p className="mb-4">
                  Mọi quyền sở hữu trí tuệ, bao gồm quyền tác giả và nhãn hiệu, trong các tài liệu được TIGER Việt Nam hoặc nhân danh TIGER Việt Nam công bố trên trang web (ví dụ như văn bản và hình ảnh) thuộc sở hữu của TIGER Việt Nam hoặc những đơn vị được TIGER Việt Nam cấp phép sử dụng.
                </p>
                <p>
                  Bạn có quyền sao các trích đoạn của trang web để sử dụng riêng cho chính mình (ví dụ, sử dụng vì mục đích phi thương mại) với điều kiện là bạn giữ nguyên và tôn trọng mọi quyền sở hữu trí tuệ, bao gồm thông báo bản quyền bất kỳ xuất hiện trong nội dung đó (ví dụ © 2016 TIGER Việt Nam).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2. Nội dung do Bạn cung cấp</h3>
                <p className="mb-4">
                  Bạn tuyên bố với TIGER Việt Nam rằng bạn là tác giả của nội dung mà bạn đóng góp cho trang web này, hoặc bạn có các quyền (ví dụ, được người có quyền cho phép) và có thể đóng góp nội dung đó (ví dụ, hình ảnh, video, nhạc) cho trang web.
                </p>
                <p className="mb-4">
                  Bạn đồng ý rằng nội dung đó sẽ được xử lý như không phải thông tin mật và bạn cho TIGER Việt Nam quyền sử dụng miễn phí, vĩnh viễn trên toàn thế giới (bao gồm tiết lộ, sao chép, truyền đạt, công bố hoặc phổ biến) nội dung mà bạn cung cấp cho các mục đích liên quan đến việc kinh doanh của TIGER Việt Nam.
                </p>
                <p className="italic text-gray-600">
                  Hãy lưu ý rằng TIGER Việt Nam tự do quyết định có hay không sử dụng nội dung đó và TIGER Việt Nam có thể đã triển khai nội dung tương tự hoặc đã có nội dung đó từ các nguồn khác, khi đó mọi quyền sở hữu trí tuệ từ nội dung đó sẽ vẫn thuộc TIGER Việt Nam và những đơn vị được TIGER Việt Nam cấp phép sử dụng.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">4</span>
              Trách nhiệm pháp lý
            </h2>
            <div className="pl-11">
              <p className="mb-4">
                Mặc dù TIGER Việt Nam vận dụng mọi nỗ lực để bảo đảm tính chính xác của tư liệu trên trang web của mình và tránh thiếu sót, chúng tôi không chịu trách nhiệm về thông tin không chính xác, những thiếu sót, gián đoạn hoặc sự kiện khác có thể gây tổn hại cho bạn, bất kể là trực tiếp (như hỏng máy tính) hay gián tiếp (như giảm lợi nhuận). Bạn phải chịu mọi rủi ro khi tin hay không vào các tư liệu trên trang web này.
              </p>
              <p className="mb-4">
                Trang web này có thể chứa các đường dẫn ra ngoài TIGER Việt Nam. TIGER Việt Nam không kiểm soát các trang web của bên thứ ba, không nhất thiết xác nhận chúng và cũng không nhận trách nhiệm bất kỳ về chúng, kể cả nội dung, tính chính xác hoặc chức năng của chúng. Do đó, chúng tôi đề nghị bạn xem xét kỹ các thông báo pháp lý về các trang web của bên thứ ba như vậy, kể cả việc khiến bạn được cập nhật về những thay đổi bất kỳ của chúng.
              </p>
              <p>
                Bạn có thể điều hành một trang web của bên thứ ba và muốn liên kết đến trang web này. Khi đó, TIGER Việt Nam không phản đối liên kết đó, với điều kiện là bản sử dụng url trang chủ chính xác của trang web này (ví dụ như không liên kết sâu) và không gợi ý theo cách bất kỳ rằng bạn là công ty con của TIGER Việt Nam hay được TIGER Việt Nam xác nhận. Bạn không được dùng “framing” hoặc kỹ thuật tương tự, và phải bảo đảm đường dẫn đến trang web mở trong cửa sổ mới.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">5</span>
              Liên hệ
            </h2>
            <div className="pl-11">
              <p className="mb-4">
                Trang web này do Công ty TNHH TIGER Marketing Việt Nam vận hành.
              </p>
              <p className="mb-4">
                Nếu bạn có câu hỏi hoặc bình luận bất kỳ về trang web, xin đừng ngần ngại liên hệ với chúng tôi:
              </p>
              <ul className="list-none space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="font-bold mr-2">(i)</span>
                  <span>Gửi thư điện tử đến địa chỉ: <a href="mailto:hello@tigermarketing.vn" className="text-green-600 hover:underline">hello@tigermarketing.vn</a></span>
                </li>
                <li className="flex items-center">
                  <span className="font-bold mr-2">(ii)</span>
                  <span>Gọi điện thoại số: <a href="tel:02836221281" className="text-green-600 hover:underline">(028) 3622 1281</a></span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">(iii)</span>
                  <span>Gửi thư thường đến:</span>
                </li>
              </ul>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 ml-6">
                <p className="font-bold text-gray-900 mb-1">Phòng Chăm Sóc Khách Hàng</p>
                <p className="font-bold text-gray-900 mb-3">Công ty TNHH TIGER Marketing Việt Nam</p>
                <p className="mb-2">Phòng 1006, Tầng 10, Tòa nhà Saigon Riverside Office Center, 2A-4A Tôn Đức Thắng, Phường Sài Gòn, TP. Hồ Chí Minh, Việt Nam</p>
                <p>Điện thoại: (028) 3622 1281</p>
                <p>Email: <a href="mailto:hello@tigermarketing.vn" className="text-green-600 hover:underline">hello@tigermarketing.vn</a></p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-base">6</span>
              Thay đổi
            </h2>
            <div className="pl-11">
              <p>
                TIGER Việt Nam bảo lưu quyền thay đổi các điều khoản sử dụng này. Thỉnh thoảng hãy trở lại trang này để xem lại các điều khoản và thông tin mới bất kỳ.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} TIGER Việt Nam. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
