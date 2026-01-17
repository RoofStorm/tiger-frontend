'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CreatePostData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { Modal } from '@/components/ui/modal';
import { useJoinChallengeModal } from '@/contexts/JoinChallengeModalContext';
import { useShareFacebookModal } from '@/contexts/ShareFacebookModalContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';


export function LunchboxUploadSection() {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { showModal: showJoinChallengeModal } = useJoinChallengeModal();
  const { showModal: showShareFacebookModal } = useShareFacebookModal();
  const { updateUserPoints } = useUpdateUserPoints();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const zoneB1Ref = useRef<HTMLDivElement>(null);
  const { trackFunnelStep } = useAnalytics();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedCaption, setUploadedCaption] = useState<string>('');
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Track time on Zone B.1
  useZoneView(zoneB1Ref, {
    page: 'challenge',
    zone: 'zoneB1',
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check authentication
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

    // Track upload start (funnel step 1)
    trackFunnelStep('challenge', 'zoneB1', 'upload', 'start');

    // Set selected file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Chỉ preventDefault khi có files đang được drag và target không phải là textarea
    const hasFiles = e.dataTransfer.types.includes('Files');
    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === 'TEXTAREA' || target.closest('textarea');
    
    if (hasFiles && !isTextarea) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    // Chỉ preventDefault khi có files và target không phải là textarea
    const target = e.target as HTMLElement;
    const isTextarea = target.tagName === 'TEXTAREA' || target.closest('textarea');
    const file = e.dataTransfer.files?.[0];
    
    if (!file || isTextarea) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

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
    setCreatedPostId(null);
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

    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để đăng bài.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Track upload submit (funnel step 2)
    trackFunnelStep('challenge', 'zoneB1', 'upload', 'submit');

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

      const createPostResult = await apiClient.createPost(postData);

      // Check response format: could be { data: {...} } or direct {...}
      const responseData = createPostResult?.data || createPostResult;
      const pointsAwarded = responseData?.pointsAwarded === true;

      // Save post ID for sharing
      const postId = responseData?.id || createPostResult?.id || null;
      setCreatedPostId(postId);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-challenge', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Update user points immediately if pointsAwarded is true
      // This ensures header shows the correct points after bonus is awarded
      if (pointsAwarded) {
        updateUserPoints(user?.id);
        setTimeout(() => {
          showJoinChallengeModal();
        }, 500);
      } else {
        // Fallback: invalidate userDetails query to ensure UI is in sync
        queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      }

      // Save uploaded image URL and caption for modal
      setUploadedImageUrl(uploadResult.data.url);
      setUploadedCaption(caption || '');
      setImageError(false); // Reset error state when new image is uploaded
      
      // Reset form
      setCaption('');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Track upload complete (funnel step 3)
      trackFunnelStep('challenge', 'zoneB1', 'upload', 'complete', {
        postId: postId || undefined,
      });

      // Show success modal
      setShowSuccessModal(true);
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Đăng bài thất bại',
        description: 'Vui lòng thử lại sau.',
        variant: 'destructive',
        duration: 4000,
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCaptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 200) {
      setCaption(e.target.value);
    }
  }, []);

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: ({ postId, platform }: { postId: string; platform?: string }) =>
      apiClient.sharePost(postId, platform),
    onSuccess: result => {
      // Check response format: could be { data: {...} } or direct {...}
      const responseData = result?.data || result;
      const pointsAwarded = responseData?.pointsAwarded === true;

      // Invalidate posts to refresh global counts
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-challenge', user?.id],
      });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Update user points immediately if pointsAwarded is true
      // This ensures header shows the correct points after bonus is awarded
      if (pointsAwarded) {
        updateUserPoints(user?.id);
        setTimeout(() => {
          showShareFacebookModal();
        }, 3000);
      } else {
        // Fallback: invalidate userDetails query to ensure UI is in sync
        queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      }

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          responseData?.pointsMessage || result?.pointsMessage || 'Bài viết đã được chia sẻ thành công.',
        variant: pointsAwarded ? 'success' : 'default',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể chia sẻ bài viết. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleFacebookShare = () => {
    if (!createdPostId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy bài viết để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Tạo URL preview cho bài viết - Ưu tiên production URL
    // Facebook cần HTTPS và public URL để crawl meta tags
    const baseUrl = 'https://tiger-corporation-vietnam.vn'; //  production URL
    const postUrl = `${baseUrl}/posts/${createdPostId}`;

    // Tạo Facebook Share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;

    // Mở popup Facebook Share Dialog
    const popup = window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // Kiểm tra nếu popup bị block
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup bị chặn',
        description: 'Vui lòng cho phép popup để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      // Vẫn đóng modal dù popup bị block
      setShowSuccessModal(false);
      return;
    }

    // Focus vào popup
    if (popup) {
      popup.focus();
    }

    // Gọi API share với platform facebook để được cộng điểm
    shareMutation.mutate({ postId: createdPostId, platform: 'facebook' });

    // Đóng success modal sau khi mở share dialog thành công
    setShowSuccessModal(false);
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const updateBackgroundStyle = () => {
      if (backgroundRef.current) {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
        backgroundRef.current.style.backgroundSize = isDesktop ? 'cover' : '200%';
        backgroundRef.current.style.backgroundPosition = isDesktop ? 'top right' : 'center right';
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBackgroundStyle, 150);
    };

    updateBackgroundStyle();
    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Bottom Section - Upload Section */}
      <motion.div
        ref={zoneB1Ref}
        id="lunchbox-upload-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-5 rounded-lg mx-12 md:mx-24 lg:scale-y-[0.8] lg:origin-top"
        style={{ backgroundColor: '#004EA3' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-12">
          {/* Left Column - Image */}
          <div className="relative w-full h-[200px] lg:h-full">
            <Image
              src="/thuthachnhipsong/upload_section.jpg"
              alt="Upload section"
              fill
              className="object-cover object-center lg:object-cover rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right Column - Upload và Input */}
          <div 
            ref={backgroundRef}
            className="space-y-6 p-8 lg:p-8 lg:space-y-4"
            style={{ 
              backgroundImage: 'url(/thuthachnhipsong/upload_background.png)',
              backgroundSize: '200%',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
            }}
          >
          {/* Title */}
          <div className="space-y-4 mt-2 px-0 sm:px-8 md:px-0">
              <h2 className="font-prata font-bold text-white leading-tight text-center text-lg sm:text-3xl lg:text-3xl">
              Khoảnh khắc giữ nhịp <br/> bữa trưa của bạn có câu chuyện gì?
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
              <div className="text-left md:text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image
                      src="/icons/upload.svg"
                      alt="Upload"
                      width={48}
                      height={48}
                      className="object-contain"
                      sizes="(max-width: 768px) 48px, 48px"
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
            <div className="rounded-lg p-4 mb-4 overflow-hidden" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between gap-4 min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1 truncate">
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
                    src="/icons/trash.svg"
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
            <div className="rounded-lg p-4 mb-4 overflow-hidden" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between gap-4 mb-2 min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1 truncate">
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
              // Không trim - giữ nguyên giá trị người dùng nhập
              if (e.target.value.length <= 200) {
                setCaption(e.target.value);
              }
            }}
            onKeyDown={(e) => {
              // Ngăn event bubbling lên parent để tránh bị ảnh hưởng
              e.stopPropagation();
            }}
            onKeyPress={(e) => {
              // Ngăn event bubbling lên parent
              e.stopPropagation();
            }}
            onKeyUp={(e) => {
              // Ngăn event bubbling lên parent
              e.stopPropagation();
            }}
            onDragOver={(e) => {
              // Ngăn drag events từ parent ảnh hưởng đến textarea
              e.stopPropagation();
            }}
            onDrop={(e) => {
              // Ngăn drop events từ parent ảnh hưởng đến textarea
              e.stopPropagation();
            }}
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
            disabled={!selectedFile || caption.length === 0 || uploading || !isAuthenticated}
            className="w-full font-medium transition-all duration-300"
            style={{ 
              height: '48px',
              borderRadius: '8px',
              gap: '8px',
              paddingTop: '12px',
              paddingRight: '28px',
              paddingBottom: '12px',
              paddingLeft: '28px',
              borderWidth: '1px',
              backgroundColor: '#ffffff',
              color: '#00579F',
              cursor: (!selectedFile || caption.length === 0 || uploading || !isAuthenticated) ? 'not-allowed' : 'pointer'
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
              onKeyDown={(e) => {
                // Ngăn event bubbling lên parent để tránh bị ảnh hưởng
                e.stopPropagation();
              }}
              onKeyPress={(e) => {
                // Ngăn event bubbling lên parent
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                // Ngăn event bubbling lên parent
                e.stopPropagation();
              }}
              onDragOver={(e) => {
                // Ngăn drag events từ parent ảnh hưởng đến textarea
                e.stopPropagation();
              }}
              onDrop={(e) => {
                // Ngăn drop events từ parent ảnh hưởng đến textarea
                e.stopPropagation();
              }}
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
              >
                <div 
                  className="rounded-2xl shadow-xl max-w-[95%] md:max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 md:p-8">
                    {/* Tiger Logo - Centered Top */}
                    <div className="flex justify-center mb-4 md:mb-6">
                      <Image
                        src="/icons/tiger_logo.svg"
                        alt="TIGER Logo"
                        width={120}
                        height={40}
                        className="object-contain"
                        style={{ width: "auto", height: "auto" }}
                      />
                    </div>

                    {/* Thank You Message */}
                    <h2 
                      className="text-center mb-4 md:mb-8 font-prata text-sm md:text-base"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        lineHeight: '20px',
                        letterSpacing: '0.03em',
                        color: '#00579F'
                      }}
                    >
                      Cảm ơn bạn đã chia sẻ khoảnh khắc đáng nhớ này!
                    </h2>

                    {/* Main Content - Image and Caption with Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                      {/* Left - User Uploaded Image */}
                      <div className="relative w-full max-w-[180px] mx-auto md:max-w-none md:mx-0 aspect-square rounded-lg overflow-hidden">
                        {uploadedImageUrl && (
                          <>
                            {!imageError ? (
                              <Image
                                src={uploadedImageUrl}
                                alt="Uploaded image"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 180px, 200px"
                                onError={() => setImageError(true)}
                              />
                            ) : (
                              // Fallback to regular img tag if Next.js Image fails
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={uploadedImageUrl}
                                alt="Uploaded image"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Hide image if still fails
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            {/* Tramnamgiutronnhipsong overlay - Bottom Right */}
                            <div 
                              className="absolute z-10"
                              style={{ 
                                bottom: '0px',
                                right: '0px',
                                transform: 'translate(5px, 5px)',
                                backgroundColor: '#ffffff',
                                padding: '4px',
                                borderRadius: '4px'
                              }}
                            >
                              <Image
                                src="/thuthachnhipsong/tramnamgiunhipsong.png"
                                alt="Trăm năm giữ trọn nhịp sống"
                                width={180}
                                height={54}
                                className="max-w-[100px] md:max-w-[140px]"
                                sizes="(max-width: 768px) 100px, 140px"
                                quality={90}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right - Caption and Buttons */}
                      <div className="flex flex-col h-full">
                        {/* Caption Text */}
                        <div className="relative w-full p-4 md:p-6 flex-1">
                          {/* Quote Mark - Top Left */}
                          <div className="absolute -top-1 -left-1 md:-top-2 md:-left-2">
                            <Image
                              src="/icons/blueQuoteMark.svg"
                              alt="Quote mark"
                              width={30}
                              height={30}
                              className="object-contain w-3 h-3 md:w-7 md:h-7"
                            />
                          </div>
                          <p 
                            className="font-nunito text-sm md:text-base text-left md:text-center"
                            style={{
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'italic',
                              lineHeight: '20px',
                              letterSpacing: '0%',
                              color: '#00579F'
                              
                            }}
                          >
                            {uploadedCaption}
                          </p>
                        </div>

                        {/* Buttons - Bottom */}
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-auto">
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
                            className="w-full md:flex-1 font-nunito transition-all duration-300"
                            style={{ 
                              height: '36px',
                              borderRadius: '8px',
                              gap: '8px',
                              opacity: 1,
                              paddingTop: '6px',
                              paddingRight: '12px',
                              paddingBottom: '6px',
                              paddingLeft: '12px',
                              backgroundColor: '#00579F',
                              color: '#ffffff',
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'normal',
                              fontSize: '14px',
                              lineHeight: '20px',
                              letterSpacing: '0%',
                              textAlign: 'center'
                            }}
                          >
                            Để lại lời nhắn
                          </Button>
                          <Button
                            onClick={handleFacebookShare}
                            className="w-full md:flex-1 font-nunito transition-all duration-300 flex items-center justify-center gap-2"
                            style={{ 
                              height: '36px',
                              backgroundColor: '#ffffff',
                              color: '#00579F',
                              border: '1px solid #00579F',
                              borderRadius: '8px',
                              paddingTop: '6px',
                              paddingRight: '12px',
                              paddingBottom: '6px',
                              paddingLeft: '12px',
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontStyle: 'normal',
                              fontSize: '14px',
                              lineHeight: '20px',
                              letterSpacing: '0%',
                              textAlign: 'center'
                            }}
                          >
                            Chia sẻ
                            <Image
                              src="/icons/facebook.png"
                              alt="Facebook"
                              width={18}
                              height={18}
                              className="object-contain"
                            />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Footer Text */}
                    <p 
                      className="text-left md:text-center mt-4 md:mt-6 font-nunito"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '0%',
                        color: '#00579F'
                      }}
                    >
                      Hãy để lại thêm một lời nhắn cho chính mình hoặc gửi đến mọi người nhé
                    </p>
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

