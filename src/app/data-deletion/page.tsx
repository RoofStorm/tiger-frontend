import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yêu cầu xóa dữ liệu người dùng - Tiger',
  description: 'Hướng dẫn xóa dữ liệu người dùng Facebook trên ứng dụng Tiger',
  robots: 'index, follow',
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-4">
          Yêu cầu xóa dữ liệu người dùng
        </h1>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <p className="text-gray-700 leading-relaxed mb-4">
              Ứng dụng <strong className="text-gray-900">Tiger - Social Mood & Rewards</strong> sử dụng đăng nhập Facebook
              và có thể thu thập một số thông tin cơ bản để phục vụ chức năng đăng nhập và cải thiện trải nghiệm người dùng.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Dữ liệu có thể được thu thập
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Facebook User ID:</strong> Để xác định và liên kết tài khoản của bạn</li>
                <li><strong>Email:</strong> Nếu bạn cung cấp khi đăng nhập (nếu có)</li>
                <li><strong>Thông tin công khai từ Facebook:</strong> Tên, ảnh đại diện (nếu bạn cho phép)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cách yêu cầu xóa dữ liệu
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Phương thức 1: Gỡ ứng dụng khỏi Facebook
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Đăng nhập vào tài khoản Facebook của bạn</li>
                <li>Vào <strong>Cài đặt</strong> → <strong>Ứng dụng và trang web</strong></li>
                <li>Tìm ứng dụng <strong>Tiger</strong> trong danh sách</li>
                <li>Nhấp vào ứng dụng và chọn <strong>Gỡ</strong> hoặc <strong>Xóa</strong></li>
                <li>Xác nhận việc gỡ ứng dụng</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Phương thức 2: Gửi email yêu cầu xóa dữ liệu
              </h3>
              <p className="text-gray-700 mb-3">
                Nếu bạn muốn yêu cầu xóa dữ liệu trực tiếp, vui lòng gửi email đến:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-3">
                <a 
                  href="mailto:rinsocial099@gmail.com?subject=Yêu cầu xóa dữ liệu Facebook"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  rinsocial099@gmail.com
                </a>
              </p>
              <p className="text-gray-700 mb-3">
                Với tiêu đề email: <strong>&quot;Yêu cầu xóa dữ liệu Facebook&quot;</strong>
              </p>
              <p className="text-gray-700">
                Trong nội dung email, vui lòng cung cấp:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2 ml-4">
                <li>Facebook User ID của bạn (nếu có)</li>
                <li>Email đăng ký (nếu có)</li>
                <li>Xác nhận bạn muốn xóa tất cả dữ liệu liên quan đến tài khoản Facebook của bạn</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Thời gian xử lý
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                Sau khi nhận được yêu cầu xóa dữ liệu của bạn, chúng tôi sẽ xử lý và xóa tất cả dữ liệu liên quan đến tài khoản Facebook của bạn trong vòng <strong className="text-gray-900">tối đa 30 ngày</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Bạn sẽ nhận được email xác nhận sau khi quá trình xóa dữ liệu hoàn tất.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Thông tin liên hệ
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                Nếu bạn có bất kỳ câu hỏi nào về việc xóa dữ liệu, vui lòng liên hệ:
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
            </div>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Tiger - Social Mood & Rewards. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

