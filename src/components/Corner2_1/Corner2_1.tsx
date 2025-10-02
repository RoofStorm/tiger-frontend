'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Heart, Gift } from 'lucide-react';

export function Corner2_1() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const products = [
    {
      id: 'books',
      title: 'BÁC HỒ TUYÊN NGÔN ĐỘC LẬP',
      subtitle: 'Ấn bản kỷ niệm 80 năm Quốc Khánh',
      description: 'Bác Hồ viết Tuyên ngôn độc lập - Di sản văn hóa quốc gia',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '📚',
      brand: 'Fahasa.com'
    },
    {
      id: 'phone-coffee',
      title: 'DÒNG LÒNG ĐI CHILL',
      subtitle: 'Dây đeo "Đồng Lòng Đi Chill"',
      description: '01 Dây đeo đa năng + 01 sản phẩm Phê-la',
      image: '/api/placeholder/200/250',
      color: 'from-green-500 to-green-700',
      icon: '📱',
      brand: 'Phe La'
    },
    {
      id: 'cake',
      title: 'CỜ ĐỎ SAO VÀNG BÁNH VELVET',
      subtitle: 'MENU ĐỘC LẬP - TỰ DO - HẠNH PHÚC',
      description: 'Bánh velvet với thiết kế cờ Việt Nam đặc biệt',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '🎂',
      brand: 'Vietnamese Cuisine'
    },
    {
      id: 'cosmetics',
      title: 'ACHUAYEUNUOC',
      subtitle: 'Yêu nước mỗi ngày',
      description: 'Sản phẩm chăm sóc da Việt Nam với tinh thần yêu nước',
      image: '/api/placeholder/200/250',
      color: 'from-red-500 to-red-700',
      icon: '💄',
      brand: 'EUNUOC'
    },
    {
      id: 'coffee',
      title: 'HIGHLANDS COFFEE',
      subtitle: 'Sắc Việt',
      description: 'Cà phê Việt Nam với hương vị đậm đà bản sắc dân tộc',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '☕',
      brand: 'Highlands Coffee'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Thị Nhật Lệ',
      quote: 'Tinh thần yêu nước là một truyền thống quý báu của dân tộc Việt Nam. Từ xưa đến nay, mỗi khi Tổ quốc bị xâm lăng là...',
      avatar: '/api/placeholder/60/60'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-400 to-red-600 transform rotate-12 scale-150"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen py-12">
        {/* Phần 1: Two Cards Layout - Minimal margins */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
            >
              {/* Card 1 - 1/3 width */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full flex items-center">
                  <p className="text-white text-lg leading-relaxed">
                    Lan tỏa tình yêu nước bằng những sản phẩm "made in Vietnam" sáng tạo & chất lượng
                  </p>
                </div>
              </div>

              {/* Card 2 - 2/3 width */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Toplist uy tín do Ban biên tập Kenh14 thẩm định và bình chọn, dựa trên các tiêu chí rõ ràng:
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Made in Việt Nam</h3>
                        <p className="text-white/80 leading-relaxed">
                          Sản phẩm của thương hiệu nội địa phát triển, mang dấu ấn bản địa, được ra mắt dịp 2/9 hoặc lan tỏa tinh thần tích cực, yêu nước.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Chất lượng và độ hoàn thiện</h3>
                        <p className="text-white/80 leading-relaxed">
                          Sản phẩm được hoàn thiện tốt, sẵn sàng sử dụng hoặc kinh doanh, không vi phạm bản quyền và có nguồn gốc xuất xứ rõ ràng (đặc biệt đối với F&B và sản phẩm dành cho trẻ em).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Phần 2: Call to Action + Products Showcase - Normal margins */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <p className="text-xl text-white mb-6">
                Xem các sản phẩm yêu nước & chơi game nhận quà ngay!
              </p>
              <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                KHÁM PHÁ
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Single Row Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-12"
            >
              <div className="relative h-[500px] flex items-center justify-center">
                {/* Carousel Container */}
                <div className="relative w-full max-w-7xl h-full">
                  {/* Layered Row Layout */}
                  <div className="flex items-center justify-center h-full relative">
                    
                    {/* Left Preview 2 - Outermost left, lowest z-index */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 0.6, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-80 h-96 rounded-3xl shadow-xl border-4 border-white/30 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 absolute left-0 z-10"
                      onClick={() => {
                        const prevIndex = (currentSlide - 2 + products.length) % products.length;
                        setCurrentSlide(prevIndex);
                        setIsAutoPlaying(false);
                      }}
                    >
                      <div className={`bg-gradient-to-br ${products[(currentSlide - 2 + products.length) % products.length].color} h-full flex flex-col justify-center items-center text-center p-6`}>
                        {/* Brand Logo */}
                        <div className="mb-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                            <span className="text-white font-bold text-sm">{products[(currentSlide - 2 + products.length) % products.length].brand}</span>
                          </div>
                        </div>
                        
                        {/* Product Icon */}
                        <div className="mb-6">
                          <div className="text-white text-6xl opacity-90 drop-shadow-2xl">
                            {products[(currentSlide - 2 + products.length) % products.length].icon}
                          </div>
                          <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="max-w-xs">
                          <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                            {products[(currentSlide - 2 + products.length) % products.length].title}
                          </h3>
                          <p className="text-white/90 text-sm mb-4">
                            {products[(currentSlide - 2 + products.length) % products.length].subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Left Preview 1 - Middle left, medium z-index */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 0.8, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-80 h-96 rounded-3xl shadow-xl border-4 border-white/40 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 absolute left-12 z-20"
                      onClick={() => {
                        const prevIndex = (currentSlide - 1 + products.length) % products.length;
                        setCurrentSlide(prevIndex);
                        setIsAutoPlaying(false);
                      }}
                    >
                      <div className={`bg-gradient-to-br ${products[(currentSlide - 1 + products.length) % products.length].color} h-full flex flex-col justify-center items-center text-center p-6`}>
                        {/* Brand Logo */}
                        <div className="mb-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                            <span className="text-white font-bold text-sm">{products[(currentSlide - 1 + products.length) % products.length].brand}</span>
                          </div>
                        </div>
                        
                        {/* Product Icon */}
                        <div className="mb-6">
                          <div className="text-white text-6xl opacity-90 drop-shadow-2xl">
                            {products[(currentSlide - 1 + products.length) % products.length].icon}
                          </div>
                          <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="max-w-xs">
                          <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                            {products[(currentSlide - 1 + products.length) % products.length].title}
                          </h3>
                          <p className="text-white/90 text-sm mb-4">
                            {products[(currentSlide - 1 + products.length) % products.length].subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Center Slide - Highest z-index */}
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="w-80 h-96 rounded-3xl shadow-2xl border-4 border-white/50 overflow-hidden relative absolute left-24 z-30"
                    >
                      <div className={`bg-gradient-to-br ${products[currentSlide].color} h-full flex flex-col justify-center items-center text-center p-6`}>
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-8 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
                          <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/20 rounded-full"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="relative z-10">
                          {/* Brand Logo */}
                          <div className="mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                              <span className="text-white font-bold text-sm">{products[currentSlide].brand}</span>
                            </div>
                          </div>
                          
                          {/* Product Icon */}
                          <div className="mb-6">
                            <div className="text-white text-6xl opacity-90 drop-shadow-2xl">
                              {products[currentSlide].icon}
                            </div>
                            <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                          </div>
                          
                          {/* Product Info */}
                          <div className="max-w-xs">
                            <h2 className="text-white text-xl font-bold mb-3 leading-tight">
                              {products[currentSlide].title}
                            </h2>
                            <p className="text-white/90 text-sm mb-4">
                              {products[currentSlide].subtitle}
                            </p>
                            <p className="text-white/80 text-xs leading-relaxed mb-6">
                              {products[currentSlide].description}
                            </p>
                            
                            {/* CTA Button */}
                            <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                              Khám phá ngay
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                          
                          {/* Decorative Elements */}
                          <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
                          <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Preview 1 - Middle right, medium z-index */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 0.8, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="w-80 h-96 rounded-3xl shadow-xl border-4 border-white/40 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 absolute right-12 z-20"
                      onClick={() => {
                        const nextIndex = (currentSlide + 1) % products.length;
                        setCurrentSlide(nextIndex);
                        setIsAutoPlaying(false);
                      }}
                    >
                      <div className={`bg-gradient-to-br ${products[(currentSlide + 1) % products.length].color} h-full flex flex-col justify-center items-center text-center p-6`}>
                        {/* Brand Logo */}
                        <div className="mb-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                            <span className="text-white font-bold text-sm">{products[(currentSlide + 1) % products.length].brand}</span>
                          </div>
                        </div>
                        
                        {/* Product Icon */}
                        <div className="mb-6">
                          <div className="text-white text-6xl opacity-90 drop-shadow-2xl">
                            {products[(currentSlide + 1) % products.length].icon}
                          </div>
                          <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="max-w-xs">
                          <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                            {products[(currentSlide + 1) % products.length].title}
                          </h3>
                          <p className="text-white/90 text-sm mb-4">
                            {products[(currentSlide + 1) % products.length].subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Right Preview 2 - Outermost right, lowest z-index */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 0.6, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-80 h-96 rounded-3xl shadow-xl border-4 border-white/30 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 absolute right-0 z-10"
                      onClick={() => {
                        const nextIndex = (currentSlide + 2) % products.length;
                        setCurrentSlide(nextIndex);
                        setIsAutoPlaying(false);
                      }}
                    >
                      <div className={`bg-gradient-to-br ${products[(currentSlide + 2) % products.length].color} h-full flex flex-col justify-center items-center text-center p-6`}>
                        {/* Brand Logo */}
                        <div className="mb-4">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                            <span className="text-white font-bold text-sm">{products[(currentSlide + 2) % products.length].brand}</span>
                          </div>
                        </div>
                        
                        {/* Product Icon */}
                        <div className="mb-6">
                          <div className="text-white text-6xl opacity-90 drop-shadow-2xl">
                            {products[(currentSlide + 2) % products.length].icon}
                          </div>
                          <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="max-w-xs">
                          <h3 className="text-white text-xl font-bold mb-3 leading-tight">
                            {products[(currentSlide + 2) % products.length].title}
                          </h3>
                          <p className="text-white/90 text-sm mb-4">
                            {products[(currentSlide + 2) % products.length].subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Auto-play Control */}
                  <div className="absolute top-4 right-4 z-40">
                    <button
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isAutoPlaying 
                          ? 'bg-white/90 hover:bg-white' 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${isAutoPlaying ? 'bg-red-600' : 'bg-gray-400'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">👩</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {testimonials[0].name}
                  </h3>
                  <blockquote className="text-white/90 text-lg leading-relaxed italic">
                    "{testimonials[0].quote}"
                  </blockquote>
                </div>
                
                <div className="flex-shrink-0">
                  <Button className="bg-white text-red-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <Heart className="w-4 h-4 mr-2" />
                    GỬI LỜI CHÚC NGAY
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}