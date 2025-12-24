import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng - Tiger',
  description: 'Điều khoản sử dụng của ứng dụng tiger-corporation-2',
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
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-green-600 pb-4">
          Điều khoản sử dụng
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Cập nhật lần cuối:</strong> {currentDate}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Giới thiệu
            </h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4 rounded">
              <p className="text-gray-700 leading-relaxed">
                Chào mừng bạn đến với <strong>tiger-corporation-2</strong> (&quot;Ứng dụng&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Bằng việc truy cập hoặc sử dụng Ứng dụng, bạn đồng ý tuân thủ các Điều khoản sử dụng này. 
                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng Ứng dụng.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Phạm vi áp dụng
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                Điều khoản này áp dụng cho tất cả người dùng truy cập và sử dụng Ứng dụng. 
                Ứng dụng có thể được truy cập thông qua các nền tảng web và các phương tiện khác do chúng tôi cung cấp.
              </p>
              <p className="text-gray-700 leading-relaxed mt-2">
                Bằng việc sử dụng Ứng dụng, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi 
                các Điều khoản sử dụng này cùng với{' '}
                <a 
                  href="/privacy-policy" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Chính sách quyền riêng tư
                </a> của chúng tôi.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Tài khoản người dùng
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                3.1 Đăng nhập
              </h3>
              <p className="text-gray-700 mb-3">
                Người dùng có thể đăng nhập bằng Facebook Login hoặc các phương thức đăng nhập khác 
                mà chúng tôi cung cấp.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                3.2 Trách nhiệm của người dùng
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Bạn chịu trách nhiệm đối với mọi hoạt động phát sinh từ tài khoản của mình</li>
                <li>Bạn có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ với người khác</li>
                <li>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hoạt động trái phép nào trên tài khoản của mình</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                3.3 Giới hạn trách nhiệm
              </h3>
              <p className="text-gray-700">
                Chúng tôi không chịu trách nhiệm cho các truy cập trái phép do người dùng không bảo mật tài khoản, 
                mất mật khẩu, hoặc các hành vi vi phạm khác từ phía người dùng.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Quyền và nghĩa vụ của người dùng
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-gray-700 mb-3">
                Người dùng cam kết:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Cung cấp thông tin chính xác:</strong> Cung cấp thông tin chính xác, đầy đủ và cập nhật khi sử dụng Ứng dụng</li>
                <li><strong>Tuân thủ pháp luật:</strong> Không sử dụng Ứng dụng cho mục đích trái pháp luật, vi phạm quyền của người khác, hoặc các hoạt động bất hợp pháp khác</li>
                <li><strong>Bảo vệ hệ thống:</strong> Không can thiệp, phá hoại hoặc làm gián đoạn hoạt động của hệ thống, máy chủ, hoặc mạng lưới kết nối với Ứng dụng</li>
                <li><strong>Tôn trọng người dùng khác:</strong> Không quấy rối, đe dọa, hoặc xâm phạm quyền riêng tư của người dùng khác</li>
                <li><strong>Không truyền tải nội dung độc hại:</strong> Không tải lên, chia sẻ hoặc truyền tải bất kỳ nội dung nào có chứa virus, mã độc, hoặc các thành phần có hại khác</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Quyền và trách nhiệm của Ứng dụng
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                5.1 Quyền của chúng tôi
              </h3>
              <p className="text-gray-700 mb-2">
                Chúng tôi có quyền:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Tạm ngừng hoặc chấm dứt cung cấp dịch vụ khi cần thiết, bao gồm nhưng không giới hạn: bảo trì hệ thống, cập nhật, hoặc các trường hợp khẩn cấp</li>
                <li>Từ chối hoặc hạn chế truy cập nếu phát hiện hành vi vi phạm điều khoản, gian lận, hoặc các hoạt động bất hợp pháp</li>
                <li>Xóa hoặc chỉnh sửa nội dung vi phạm điều khoản mà không cần thông báo trước</li>
                <li>Thay đổi, cập nhật, hoặc ngừng cung cấp bất kỳ tính năng nào của Ứng dụng</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                5.2 Cam kết của chúng tôi
              </h3>
              <p className="text-gray-700 mb-2">
                Chúng tôi cam kết:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Bảo vệ dữ liệu người dùng:</strong> Bảo vệ dữ liệu người dùng theo{' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Chính sách quyền riêng tư
                  </a> của chúng tôi
                </li>
                <li><strong>Không chia sẻ dữ liệu trái phép:</strong> Không bán, cho thuê, hoặc chia sẻ dữ liệu cá nhân của người dùng cho bên thứ ba trái phép</li>
                <li><strong>Cung cấp dịch vụ chất lượng:</strong> Nỗ lực duy trì và cải thiện chất lượng dịch vụ</li>
                <li><strong>Minh bạch:</strong> Thông báo rõ ràng về các thay đổi quan trọng đối với Ứng dụng hoặc Điều khoản sử dụng</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Sở hữu trí tuệ
            </h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Toàn bộ nội dung, mã nguồn, hình ảnh, logo, tên thương hiệu, và các tài nguyên khác thuộc quyền sở hữu của 
                <strong> tiger-corporation-2</strong> và các bên cấp phép, trừ khi có ghi chú khác.
              </p>
              <p className="text-gray-700 mb-3">
                Bạn không được phép:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Sao chép, tái tạo, hoặc phân phối bất kỳ phần nào của Ứng dụng mà không có sự cho phép bằng văn bản</li>
                <li>Sử dụng tên thương hiệu, logo, hoặc các dấu hiệu thương mại của chúng tôi mà không có sự đồng ý</li>
                <li>Đảo ngược kỹ thuật, decompile, hoặc phân tích mã nguồn của Ứng dụng</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Giới hạn trách nhiệm
            </h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-gray-700 mb-3">
                Ứng dụng được cung cấp &quot;nguyên trạng&quot; (&quot;as is&quot;) và &quot;theo khả năng có sẵn&quot; (&quot;as available&quot;).
              </p>
              <p className="text-gray-700 mb-3">
                Chúng tôi không chịu trách nhiệm cho:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Các thiệt hại phát sinh do việc sử dụng hoặc không thể sử dụng Ứng dụng</li>
                <li>Mất mát dữ liệu, lợi nhuận, hoặc các thiệt hại gián tiếp khác</li>
                <li>Gián đoạn dịch vụ do bảo trì, cập nhật, hoặc các sự cố kỹ thuật</li>
                <li>Hành vi của người dùng khác hoặc nội dung do người dùng tạo ra</li>
                <li>Các vấn đề phát sinh từ việc sử dụng Facebook Login hoặc các dịch vụ bên thứ ba khác</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Trong phạm vi tối đa được pháp luật cho phép, trách nhiệm của chúng tôi sẽ không vượt quá số tiền 
                bạn đã trả cho việc sử dụng Ứng dụng (nếu có).
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Thay đổi điều khoản
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed mb-3">
                Chúng tôi có thể cập nhật Điều khoản sử dụng này bất kỳ lúc nào để phản ánh các thay đổi trong 
                dịch vụ, pháp luật, hoặc các yêu cầu khác.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                Phiên bản mới sẽ được công bố trên website và có hiệu lực ngay sau khi được đăng tải. 
                Ngày &quot;Cập nhật lần cuối&quot; ở đầu trang sẽ được cập nhật để phản ánh các thay đổi.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Việc bạn tiếp tục sử dụng Ứng dụng sau khi Điều khoản sử dụng được cập nhật được coi là 
                bạn đã chấp nhận các thay đổi đó. Nếu bạn không đồng ý với các thay đổi, vui lòng ngừng sử dụng Ứng dụng.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Liên hệ
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Nếu bạn có câu hỏi, thắc mắc hoặc yêu cầu liên quan đến Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a 
                  href="mailto:rinsocial099@gmail.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  rinsocial099@gmail.com
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Thời gian phản hồi:</strong> Chúng tôi sẽ phản hồi trong vòng 24-48 giờ làm việc.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} tiger-corporation-2. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

