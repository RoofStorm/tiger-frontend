'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CreatePostData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';
import { Modal } from '@/components/ui/modal';

export function LunchboxUploadSection() {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedCaption, setUploadedCaption] = useState<string>('');

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ ảnh.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Validate file type
    const validTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Định dạng không hợp lệ',
        description: 'Vui lòng chọn file SVG, PNG hoặc JPG.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Set selected file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
    setShowCaptionModal(false);
    setCaption('');
  };

  const handleUploadPost = async () => {
    if (!selectedFile) {
      toast({
        title: 'Chưa chọn ảnh',
        description: 'Vui lòng chọn ảnh để đăng bài.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để đăng bài.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file directly to backend
      const uploadResult = await apiClient.uploadFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create post
      const postData: CreatePostData = {
        imageUrl: uploadResult.data.url,
        caption: caption || '',
      };

      await apiClient.createPost(postData);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-challenge', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Save uploaded image URL and caption for modal
      setUploadedImageUrl(uploadResult.data.url);
      setUploadedCaption(caption || '');
      
      // Reset form
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Đăng bài thất bại',
        description: 'Vui lòng thử lại sau.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 200) {
      setCaption(e.target.value);
    }
  };

  return (
    <>
      {/* Bottom Section - Upload Section */}
      <motion.div
        id="lunchbox-upload-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-5 rounded-lg mx-12"
        style={{ backgroundColor: '#004EA3' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px]">
            <Image
              src="/thuthachnhipsong/upload_section.png"
              alt="Upload section"
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* Right Column - Upload và Input */}
          <div 
            className="space-y-6 p-8 lg:p-12"
            style={{ 
              backgroundImage: 'url(/thuthachnhipsong/upload_background.png)',
              backgroundSize: '90%',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
            }}
          >
          {/* Title */}
          <div className="space-y-4 mt-2">
              <h2 className="font-prata font-bold text-white leading-tight text-center" style={{ fontSize: '28px' }}>
              Khoảnh khắc giữ nhịp – bữa trưa của bạn có câu chuyện gì?
            </h2>
             
          </div>

          {/* Upload Area */}
          <div
            className="rounded-lg p-8 transition-colors cursor-pointer"
            style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image
                      src="/icons/upload.png"
                      alt="Upload"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                  </div>
                </div>
                <p className="font-medium mb-2" style={{ color: '#DCDCDC', fontSize: '12px' }}>
                  Nhấn tải ảnh hoặc kéo ảnh lên
                </p>
                <p className="text-sm" style={{ color: '#DCDCDC', fontSize: '12px' }}>SVG, PNG, JPG</p>
              </div>
          </div>

          {/* File Info Display - Shown when file is selected but not uploading */}
          {selectedFile && !uploading && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-2 hover:opacity-80 transition-opacity"
                  type="button"
                >
                  <Image
                    src="/icons/trash.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              </div>
            )}

          {/* Upload Progress */}
          {uploading && selectedFile && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-2 hover:opacity-80 transition-opacity"
                  type="button"
                >
                  <Image
                    src="/icons/trash.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-white mb-1">
                  <span>
                    {(selectedFile.size / (1024 * 1024) * uploadProgress / 100).toFixed(2)} MB of{' '}
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src="/icons/upload.png"
                  alt="Uploading"
                  width={16}
                  height={16}
                />
                <p className="text-xs text-white">Uploading...</p>
              </div>
            </div>
          )}

          {/* Text Input */}
          <textarea
            ref={captionTextareaRef}
            value={caption}
            onChange={(e) => {
              if (e.target.value.length <= 200) {
                setCaption(e.target.value);
              }
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Câu chuyện của bạn...(không quá 200 ký tự)"
            rows={4}
            className="w-full px-4 py-3 border border-white/30 rounded-lg resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 font-nunito backdrop-blur-sm mb-4"
            style={{ 
              backgroundColor: '#FFFFFF1A',
              color: '#DCDCDC'
            }}
          />

          {/* Upload Post Button */}
          <Button
            onClick={handleUploadPost}
            disabled={!selectedFile || !caption.trim() || uploading || !isAuthenticated}
            className="w-full font-medium transition-all duration-300"
            style={{ 
              height: '48px',
              borderRadius: '8px',
              gap: '8px',
              opacity: (!selectedFile || !caption.trim() || uploading || !isAuthenticated) ? 0.5 : 1,
              paddingTop: '12px',
              paddingRight: '28px',
              paddingBottom: '12px',
              paddingLeft: '28px',
              borderWidth: '1px',
              backgroundColor: '#ffffff',
              color: '#00579F',
              cursor: (!selectedFile || !caption.trim() || uploading || !isAuthenticated) ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? 'Đang chia sẻ...' : 'Chia sẻ ngay!'}
          </Button>
          </div>
        </div>


        {/* Caption Modal */}
        <Modal
          isOpen={showCaptionModal && !!selectedFile}
          onClose={() => setShowCaptionModal(false)}
          showCloseButton={true}
          showHeader={true}
          headerTitle="Câu chuyện của bạn"
          maxWidth="md"
          closeOnBackdropClick={true}
        >
          <div className="space-y-4">
            <textarea
              ref={captionTextareaRef}
              value={caption}
              onChange={handleCaptionChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Câu chuyện của bạn..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400 font-noto-sans"
            />
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCaptionModal(false);
                  setCaption('');
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setShowCaptionModal(false);
                }}
                className="bg-[#00579F] text-white hover:bg-[#004080]"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setShowSuccessModal(false)}
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white"
                >
                  <div className="p-8">
                    {/* Tiger Logo - Centered Top */}
                    <div className="flex justify-center mb-6">
                      <Image
                        src="/icons/tiger_logo.png"
                        alt="Tiger Logo"
                        width={120}
                        height={40}
                        className="object-contain"
                      />
                    </div>

                    {/* Thank You Message */}
                    <h2 
                      className="text-center mb-8 font-prata"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '16px',
                        lineHeight: '20px',
                        letterSpacing: '0.03em',
                        textAlign: 'center',
                        color: '#00579F'
                      }}
                    >
                      Cảm ơn bạn đã chia sẻ khoảnh khắc đáng nhớ này!
                    </h2>

                    {/* Main Content - Image and Caption with Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Left - User Uploaded Image */}
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                        {uploadedImageUrl && (
                          <>
                            <Image
                              src={uploadedImageUrl}
                              alt="Uploaded image"
                              fill
                              className="object-cover"
                            />
                            {/* Tramnamgiutronnhipsong overlay - Bottom Right */}
                            <div 
                              className="absolute z-10"
                              style={{ 
                                bottom: '0px',
                                right: '0px',
                                transform: 'translate(10px, 10px)'
                              }}
                            >
                              <Image
                                src="/thuthachnhipsong/tramnamgiunhipsong.png"
                                alt="Trăm năm giữ trọn nhịp sống"
                                width={180}
                                height={54}
                                className="object-contain"
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right - Caption and Buttons */}
                      <div className="flex flex-col h-full">
                        {/* Caption Text */}
                        <div className="relative w-full p-6 flex-1">
                          {/* Quote Mark - Top Left */}
                          <div className="absolute -top-2 -left-2">
                            <Image
                              src="/icons/blueQuoteMark.png"
                              alt="Quote mark"
                              width={40}
                              height={40}
                              className="object-contain"
                            />
                          </div>
                          <p 
                            className="font-nunito"
                            style={{
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'italic',
                              fontSize: '16px',
                              lineHeight: '24px',
                              letterSpacing: '0%',
                              textAlign: 'center',
                              color: '#00579F'
                            }}
                          >
                            {uploadedCaption}
                          </p>
                        </div>

                        {/* Buttons - Bottom */}
                        <div className="flex gap-4 mt-auto">
                          <Button
                            onClick={() => {
                              setShowSuccessModal(false);
                              // Scroll và focus vào textarea trong ShareNoteSection
                              setTimeout(() => {
                                const textarea = document.getElementById('share-note-textarea');
                                if (textarea) {
                                  textarea.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'center' 
                                  });
                                  setTimeout(() => {
                                    textarea.focus();
                                  }, 300);
                                }
                              }, 100);
                            }}
                            className="flex-1 font-nunito transition-all duration-300"
                            style={{ 
                              height: '40px',
                              borderRadius: '8px',
                              gap: '8px',
                              opacity: 1,
                              paddingTop: '8px',
                              paddingRight: '16px',
                              paddingBottom: '8px',
                              paddingLeft: '16px',
                              backgroundColor: '#00579F',
                              color: '#ffffff',
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'normal',
                              fontSize: '16px',
                              lineHeight: '24px',
                              letterSpacing: '0%',
                              textAlign: 'center'
                            }}
                          >
                            Để lại lời nhắn
                          </Button>
                          <Button
                            onClick={() => {
                              // TODO: Handle Facebook share
                              setShowSuccessModal(false);
                            }}
                            className="flex-1 font-nunito transition-all duration-300 flex items-center justify-center gap-2"
                            style={{ 
                              backgroundColor: '#ffffff',
                              color: '#00579F',
                              border: '1px solid #00579F',
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'normal',
                              fontSize: '16px',
                              lineHeight: '24px',
                              letterSpacing: '0%',
                              textAlign: 'center'
                            }}
                          >
                            Chia sẻ
                            <Image
                              src="/icons/facebook.png"
                              alt="Facebook"
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

