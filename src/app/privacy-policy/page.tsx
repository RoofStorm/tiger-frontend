import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách quyền riêng tư - TIGER',
  description: 'Chính sách quyền riêng tư của ứng dụng TIGER - Social Mood & Rewards',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-blue-600 pb-4">
          Chính sách quyền riêng tư
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Cập nhật lần cuối:</strong> {new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6 rounded">
            <p className="text-gray-700">
              <strong>Tóm tắt:</strong> Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. 
              Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân 
              của bạn khi sử dụng ứng dụng <strong>TIGER - Social Mood & Rewards</strong>.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Giới thiệu về ứng dụng
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>TIGER - Social Mood & Rewards</strong> là một nền tảng mạng xã hội cho phép người dùng 
              chia sẻ cảm xúc, tạo mood cards, và nhận phần thưởng. Ứng dụng hỗ trợ đăng nhập bằng Facebook 
              để cung cấp trải nghiệm đăng nhập nhanh chóng và tiện lợi.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Các loại dữ liệu thu thập
            </h2>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 rounded">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2.1 Dữ liệu từ Facebook Login
              </h3>
              <p className="text-gray-700 mb-3">
                Khi bạn đăng nhập bằng Facebook, chúng tôi có thể thu thập các thông tin sau:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Facebook User ID:</strong> Để xác định và liên kết tài khoản của bạn với ứng dụng</li>
                <li><strong>Tên hiển thị:</strong> Tên công khai từ tài khoản Facebook của bạn</li>
                <li><strong>Email:</strong> Địa chỉ email từ tài khoản Facebook (nếu bạn cho phép và cung cấp)</li>
                <li><strong>Ảnh đại diện:</strong> Ảnh profile công khai từ Facebook (nếu bạn cho phép)</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2.2 Dữ liệu sử dụng ứng dụng
              </h3>
              <p className="text-gray-700 mb-2">
                Khi sử dụng ứng dụng, chúng tôi có thể thu thập:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Thông tin về các hoạt động trong ứng dụng (tạo mood cards, tương tác với nội dung)</li>
                <li>Điểm số và lịch sử phần thưởng</li>
                <li>Thời gian và tần suất sử dụng ứng dụng</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Mục đích sử dụng dữ liệu
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Chúng tôi sử dụng dữ liệu thu thập được cho các mục đích sau:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Xác thực đăng nhập:</strong> Để xác minh danh tính và cho phép bạn đăng nhập vào ứng dụng</li>
                <li><strong>Cung cấp dịch vụ:</strong> Để cung cấp các tính năng và dịch vụ của ứng dụng TIGER</li>
                <li><strong>Quản lý tài khoản:</strong> Để tạo và quản lý tài khoản của bạn trong hệ thống</li>
                <li><strong>Hệ thống phần thưởng:</strong> Để theo dõi điểm số và xử lý các phần thưởng</li>
                <li><strong>Cải thiện dịch vụ:</strong> Để phân tích và cải thiện trải nghiệm người dùng</li>
                <li><strong>Bảo mật:</strong> Để bảo vệ tài khoản và phát hiện các hoạt động bất thường</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Cam kết bảo mật dữ liệu
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                4.1 Chia sẻ dữ liệu
              </h3>
              <p className="text-gray-700 mb-3">
                Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba 
                trái phép. Dữ liệu của bạn chỉ được sử dụng cho mục đích cung cấp dịch vụ của ứng dụng TIGER.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                4.2 Biện pháp bảo mật
              </h3>
              <p className="text-gray-700 mb-2">
                Chúng tôi áp dụng các biện pháp bảo mật phù hợp để bảo vệ dữ liệu của bạn:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Mã hóa dữ liệu trong quá trình truyền tải</li>
                <li>Bảo vệ cơ sở dữ liệu bằng các biện pháp bảo mật mạnh</li>
                <li>Kiểm tra bảo mật định kỳ</li>
                <li>Giới hạn quyền truy cập dữ liệu chỉ cho nhân viên cần thiết</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-4">
                4.3 Thời gian lưu trữ dữ liệu
              </h3>
              <p className="text-gray-700">
                Chúng tôi lưu trữ dữ liệu của bạn trong thời gian cần thiết để cung cấp dịch vụ, 
                hoặc cho đến khi bạn yêu cầu xóa dữ liệu. Khi bạn yêu cầu xóa dữ liệu, chúng tôi sẽ xóa 
                trong vòng tối đa 30 ngày.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Quyền của người dùng
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Bạn có các quyền sau đối với dữ liệu của mình:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Quyền truy cập:</strong> Bạn có quyền xem thông tin cá nhân mà chúng tôi lưu trữ về bạn</li>
                <li><strong>Quyền chỉnh sửa:</strong> Bạn có quyền cập nhật hoặc chỉnh sửa thông tin không chính xác</li>
                <li><strong>Quyền xóa:</strong> Bạn có quyền yêu cầu xóa tài khoản và tất cả dữ liệu liên quan</li>
                <li><strong>Quyền rút lại đồng ý:</strong> Bạn có thể rút lại sự đồng ý cho phép ứng dụng truy cập dữ liệu Facebook bất cứ lúc nào</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Cách yêu cầu xóa dữ liệu
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Bạn có thể yêu cầu xóa dữ liệu của mình bằng một trong các cách sau:
              </p>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phương thức 1: Gỡ ứng dụng khỏi Facebook
                </h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-2">
                  <li>Đăng nhập vào tài khoản Facebook của bạn</li>
                  <li>Vào <strong>Cài đặt</strong> → <strong>Ứng dụng và trang web</strong></li>
                  <li>Tìm ứng dụng <strong>TIGER</strong> trong danh sách</li>
                  <li>Nhấp vào ứng dụng và chọn <strong>Gỡ</strong> hoặc <strong>Xóa</strong></li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phương thức 2: Gửi email yêu cầu
                </h3>
                <p className="text-gray-700 mb-2">
                  Gửi email đến <strong>rinsocial099@gmail.com</strong> với tiêu đề 
                  <strong> &quot;Yêu cầu xóa dữ liệu Facebook&quot;</strong>
                </p>
                <p className="text-gray-700">
                  Chúng tôi sẽ xử lý yêu cầu của bạn trong vòng <strong>tối đa 30 ngày</strong>.
                </p>
                <p className="text-gray-700 mt-2">
                  Để biết thêm chi tiết, vui lòng truy cập trang{' '}
                  <a 
                    href="/data-deletion" 
                    className="text-blue-600 hover:text-blue-800 underline font-semibold"
                  >
                    Yêu cầu xóa dữ liệu người dùng
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookie và công nghệ theo dõi
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                Chúng tôi sử dụng cookie và các công nghệ tương tự để:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Duy trì phiên đăng nhập của bạn</li>
                <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                <li>Cải thiện hiệu suất và trải nghiệm sử dụng</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Trẻ em
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-gray-700">
                Ứng dụng TIGER không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập 
                thông tin từ trẻ em dưới 13 tuổi. Nếu bạn phát hiện chúng tôi đã thu thập thông tin 
                từ trẻ em dưới 13 tuổi, vui lòng liên hệ với chúng tôi ngay lập tức.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Thay đổi chính sách
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Chúng tôi có thể cập nhật chính sách quyền riêng tư này theo thời gian. Mọi thay đổi quan trọng 
              sẽ được thông báo qua ứng dụng hoặc email. Chúng tôi khuyến khích bạn xem lại chính sách này 
              định kỳ để nắm được cách chúng tôi bảo vệ thông tin của bạn.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Thông tin liên hệ
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-3">
                Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào về chính sách quyền riêng tư này, 
                vui lòng liên hệ với chúng tôi:
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
              © {new Date().getFullYear()} TIGER - Social Mood & Rewards. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

