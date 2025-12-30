'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import html2canvas from 'html2canvas';
import { useJoinChallengeModal } from '@/contexts/JoinChallengeModalContext';
import { useShareFacebookModal } from '@/contexts/ShareFacebookModalContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// Wish type for highlighted wishes with user info
interface Wish {
  id: string;
  content: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
  isFromCache?: boolean; // Field để phân biệt note mới tạo từ cache
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

// Type for pagination response from API
interface WishPage {
  success: boolean;
  data: Wish[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  message?: string;
}

// Sub-component for individual wish card to optimize performance
const WishCard = ({ wish, index }: { wish: Wish; index: number }) => {
  return (
    <div className="pb-8 pr-4">
      <div
        className={`backdrop-blur-sm rounded-lg p-6 border border-white/30 relative w-[80%] ${
          index % 2 === 0 ? 'ml-[20%]' : ''
        }`}
        style={{ backgroundColor: '#FFFFFF1A' }}
      >
        {/* Quote Mark - Top Left */}
        <div className="absolute top-[-10px] md:top-[-20px] left-3">
          <Image
            src="/icons/quotemark_white.svg"
            alt="Quote mark"
            width={40}
            height={40}
            className="object-contain w-6 h-6 md:w-10 md:h-10"
          />
        </div>
        <div className="flex items-center gap-3 mb-3 pt-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-300">
            {wish.user?.avatarUrl ? (
              <Image
                src={wish.user.avatarUrl}
                alt={wish.user?.name || 'User avatar'}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <Image
                src="/thuthachnhipsong/slide_example.png"
                alt="Default avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            )}
          </div>
          <span
            className="font-medium text-sm"
            style={{
              color: wish.isFromCache
                ? '#FFD700' // Màu vàng cho note mới tạo từ cache
                : '#FFFFFF', // Màu trắng cho note từ server
            }}
          >
            {wish.user?.name || 'Người dùng ẩn danh'}
          </span>
        </div>
        <div className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
          {wish.content}
        </div>
      </div>
    </div>
  );
};

export function ShareNoteSection() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useNextAuth();
  const queryClient = useQueryClient();
  const { showModal: showJoinChallengeModal } = useJoinChallengeModal();
  const { showModal: showShareFacebookModal } = useShareFacebookModal();
  const { updateUserPoints } = useUpdateUserPoints();
  const { trackFunnelStep } = useAnalytics();
  const zoneCRef = useRef<HTMLDivElement>(null);
  const [noteText, setNoteText] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sharedNoteText, setSharedNoteText] = useState('');
  const [createdWishId, setCreatedWishId] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll states
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Track time on Zone C
  useZoneView(zoneCRef, {
    page: 'challenge',
    zone: 'zoneC',
  });

  // Fetch highlighted wishes with useInfiniteQuery
  const { 
    data: infiniteWishesData, 
    isLoading: isLoadingWishes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['highlighted-wishes-share-note-infinite'],
    queryFn: ({ pageParam = 1 }) => apiClient.getHighlightedWishes(pageParam, 15),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Backend returns structure like { success: true, data: [...], pagination: { page, totalPages, ... } }
      // but based on api.ts, it might be { success, data, pagination }
      const pagination = lastPage?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 60 * 1000,
  });

  // Flatten the wishes from pages
  const wishes = useMemo(() => {
    if (!infiniteWishesData) return [];
    
    return infiniteWishesData.pages.flatMap(page => {
      // Check if data is directly in page or in page.data
      const pageData = Array.isArray(page) ? page : (page?.data || []);
      return Array.isArray(pageData) ? pageData : [];
    });
  }, [infiniteWishesData]);

  // Logic auto scroll "như cũ" - mượt và tự động lặp lại (loop)
  useEffect(() => {
    if (!isAutoScrolling || !wishes.length) return;

    const interval = setInterval(() => {
      if (!virtuosoRef.current) return;

      // Sử dụng scrollBy với giá trị nhỏ để cực kỳ mượt mà
      // Tăng lên 0.8px mỗi 16ms để tốc độ vừa phải và mượt như bản cũ
      virtuosoRef.current.scrollBy({
        top: 0.6,
        behavior: 'auto',
      });
    }, 25);

    return () => clearInterval(interval);
  }, [isAutoScrolling, wishes.length]);

  // Resume auto scroll sau idle
  useEffect(() => {
    if (!userInteracted) return;

    const timeout = setTimeout(() => {
      setIsAutoScrolling(true);
      setUserInteracted(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [userInteracted]);

  // Handle user manual interaction to pause auto-scroll
  const handleUserInteraction = useCallback(() => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setUserInteracted(true);
    }
  }, [isAutoScrolling]);

  // Create wish mutation
  const createWishMutation = useMutation({
    mutationFn: (content: string) => apiClient.createWish(content),
    onSuccess: (result, content) => {
      // Check response format: could be { data: {...} } or direct {...}
      const responseData = result?.data || result;
      const pointsAwarded = responseData?.pointsAwarded === true;

      // Lưu wish ID từ response
      const wishId = responseData?.id || result?.id || null;
      setCreatedWishId(wishId);
      // Lưu nội dung note để hiển thị trong modal
      setSharedNoteText(content);

      // Update user points immediately if pointsAwarded is true
      // This ensures header shows the correct points after bonus is awarded
      if (pointsAwarded) {
        updateUserPoints(user?.id);
        setTimeout(() => {
          showJoinChallengeModal();
        }, 500);
      }
      
      // Tạo wish object mới để thêm vào danh sách Highlighted Notes
      if (wishId && user) {
        // Ưu tiên sử dụng data từ response nếu có đầy đủ thông tin
        const responseWish = responseData || result;
        // Luôn đặt isHighlighted: true để note mới xuất hiện ngay trong danh sách highlight
        const newWish: Wish = responseWish && 
          responseWish.id && 
          responseWish.content
          ? {
              id: responseWish.id,
              content: responseWish.content,
              isHighlighted: true, // Luôn true để hiển thị trong danh sách highlight
              isFromCache: true, // Đánh dấu note này được thêm từ cache
              createdAt: responseWish.createdAt || new Date().toISOString(),
              updatedAt: responseWish.updatedAt || new Date().toISOString(),
              user: responseWish.user || {
                id: user.id,
                name: user.name || undefined,
                email: user.email || undefined,
                avatarUrl: user.image || undefined,
              },
            }
          : {
              id: wishId,
              content: content.trim(),
              isHighlighted: true,
              isFromCache: true, // Đánh dấu note này được thêm từ cache
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              user: {
                id: user.id,
                name: user.name || undefined,
                email: user.email || undefined,
                avatarUrl: user.image || undefined,
              },
            };

        // Thêm wish mới vào cuối danh sách trong cache ngay lập tức để hiển thị
        // Cho useInfiniteQuery, chúng ta thêm vào cuối trang cuối cùng
        queryClient.setQueryData(['highlighted-wishes-share-note-infinite'], (oldData: InfiniteData<WishPage> | undefined) => {
          if (!oldData) return oldData;
          
          const newPages = [...oldData.pages];
          const lastPageIndex = newPages.length - 1;
          const lastPage = newPages[lastPageIndex];
          
          if (!lastPage) return oldData;
          
          newPages[lastPageIndex] = {
            ...lastPage,
            data: [...lastPage.data, newWish],
            pagination: {
              ...lastPage.pagination,
              total: (lastPage.pagination?.total || 0) + 1
            }
          };
          
          return {
            ...oldData,
            pages: newPages,
          };
        });

        // Invalidate để đảm bảo data từ server đồng bộ, nhưng cho phép UI cập nhật ngay
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['highlighted-wishes-share-note-infinite'] });
        }, 2000);
      }

      // Track note complete (funnel step 3)
      trackFunnelStep('challenge', 'zoneC', 'note', 'complete', {
        wishId: responseData?.id || undefined,
      });

      // Hiển thị modal thành công
      setShowSuccessModal(true);
      // Reset textarea
      setNoteText('');
      setHasStartedTyping(false); // Reset để track lại lần sau
      // Invalidate các query khác
      queryClient.invalidateQueries({ queryKey: ['highlighted-wishes'] });
      queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory'] });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi lời chúc. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  // Share wish mutation
  const shareWishMutation = useMutation({
    mutationFn: ({ wishId, platform }: { wishId: string; platform?: string }) =>
      apiClient.shareWish(wishId, platform),
    onSuccess: result => {
      // Check response format: could be { data: {...} } or direct {...}
      const responseData = result?.data || result;
      const pointsAwarded = responseData?.pointsAwarded === true;

      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory'] });

      // Update user points immediately if pointsAwarded is true
      // This ensures header shows the correct points after bonus is awarded
      if (pointsAwarded) {
        updateUserPoints(user?.id);
        setTimeout(() => {
          showShareFacebookModal();
        }, 500);
      } else {
        // Fallback: invalidate userDetails query to ensure UI is in sync
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      }

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          responseData?.pointsMessage || result?.pointsMessage || 'Lời chúc đã được chia sẻ thành công.',
        variant: pointsAwarded ? 'success' : 'default',
        duration: 4000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể chia sẻ lời chúc. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });


  // Update modal background size for mobile with debounce
  useEffect(() => {
    if (!showSuccessModal) return;

    let timeoutId: NodeJS.Timeout;
    const updateModalBackground = () => {
      if (modalRef.current) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        modalRef.current.style.backgroundSize = isMobile ? 'cover' : 'contain';
        modalRef.current.style.minHeight = isMobile ? 'auto' : 'auto';
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        requestAnimationFrame(updateModalBackground);
      }, 150);
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      updateModalBackground();
    });

    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [showSuccessModal]);

  const scrollToTextarea = useCallback(() => {
    setTimeout(() => {
      noteTextareaRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setTimeout(() => {
        noteTextareaRef.current?.focus();
      }, 300);
    }, 100);
  }, []);

  const handleShareNote = useCallback(() => {
    if (!noteText.trim()) {
      toast({
        title: 'Vui lòng nhập nội dung',
        description: 'Hãy chia sẻ câu chuyện của bạn nhé!',
        variant: 'destructive',
      });
      // Scroll và focus vào textarea khi chưa có nội dung
      scrollToTextarea();
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Vui lòng đăng nhập',
        description: 'Bạn cần đăng nhập để chia sẻ lời chúc.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Track note submit (funnel step 2)
    trackFunnelStep('challenge', 'zoneC', 'note', 'submit');

    // Gọi API tạo wish
    createWishMutation.mutate(noteText.trim());
  }, [noteText, toast, scrollToTextarea, isAuthenticated, createWishMutation, trackFunnelStep]);

  // Function để capture modal và upload lên S3
  const captureModalAndUpload = useCallback(async (): Promise<string | null> => {
    if (!modalRef.current) {
      console.error('❌ [SHARE] Modal ref không tồn tại');
      return null;
    }

    try {
      setIsGeneratingImage(true);

      const element = modalRef.current;
      const originalStyle = {
        opacity: element.style.opacity,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
      };

      // Đảm bảo element có thể được capture
      element.style.opacity = '1';
      element.style.visibility = 'visible';
      element.style.pointerEvents = 'none';

      // Đợi một chút để đảm bảo render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Đợi tất cả images trong element load xong
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => {
                  resolve(null);
                };
                img.onerror = (error) => {
                  reject(error);
                };
              }
            })
        )
      );

      // Đợi thêm một chút để đảm bảo mọi thứ đã render hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      // Khôi phục style ban đầu
      element.style.opacity = originalStyle.opacity || '1';
      element.style.visibility = originalStyle.visibility || 'visible';
      element.style.pointerEvents = originalStyle.pointerEvents || 'auto';

      // Convert canvas thành blob
      return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
          if (!blob) {
            console.error('❌ [SHARE] Failed to create image blob');
            setIsGeneratingImage(false);
            reject(new Error('Failed to create image blob'));
            return;
          }

          // Tạo File từ blob
          const file = new File([blob], `share-note-${Date.now()}.png`, {
            type: 'image/png',
          });

          // Upload image lên server
          try {
            const uploadResult = await apiClient.uploadFile(file);
            
            // Parse URL từ response - API trả về { success: true, data: { url: "..." } }
            let imageUrl: string | null = null;
            if (uploadResult?.data?.url) {
              imageUrl = uploadResult.data.url;
            } else if (uploadResult?.url) {
              imageUrl = uploadResult.url;
            } else if (uploadResult?.data && typeof uploadResult.data === 'string') {
              // Nếu data là string URL trực tiếp
              imageUrl = uploadResult.data;
            }
            
            if (!imageUrl) {
              console.error('❌ [SHARE] Không tìm thấy URL trong response:', uploadResult);
              setIsGeneratingImage(false);
              reject(new Error('Không tìm thấy URL ảnh trong response'));
              return;
            }
            
            setIsGeneratingImage(false);
            resolve(imageUrl);
          } catch (uploadError) {
            console.error('❌ [SHARE] Upload lỗi:', uploadError);
            setIsGeneratingImage(false);
            reject(uploadError);
          }
        }, 'image/png');
      });
    } catch (error) {
      console.error('❌ [SHARE] Error capturing modal:', error);
      setIsGeneratingImage(false);
      return null;
    }
  }, []);

  const handleFacebookShare = useCallback(async () => {
    if (!createdWishId) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy lời chúc để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    try {
      // Hiển thị toast đang xử lý
      toast({
        title: 'Đang xử lý...',
        description: 'Đang tạo ảnh để chia sẻ.',
        duration: 2000,
      });

      // Generate ảnh từ modal và upload lên S3
      const imageUrl = await captureModalAndUpload();
      
      if (!imageUrl) {
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo ảnh để chia sẻ. Vui lòng thử lại.',
          variant: 'destructive',
          duration: 4000,
        });
        return;
      }

      // Tạo URL preview cho wish với share page để có meta tags và image
      const baseUrl =
        process.env.NEXT_PUBLIC_PUBLIC_URL ||
        process.env.NEXTAUTH_URL ||
        'https://tiger-corporation-vietnam.vn';
      const wishUrl = `${baseUrl}/wishes/share?wishId=${encodeURIComponent(createdWishId || '')}&content=${encodeURIComponent(sharedNoteText || '')}&imageUrl=${encodeURIComponent(imageUrl)}`;
      const wishTitle = sharedNoteText || 'Lời chúc từ TIGER';

      // Tạo Facebook Share URL với quote parameter
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wishUrl)}&quote=${encodeURIComponent(wishTitle)}`;

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
      shareWishMutation.mutate({ wishId: createdWishId, platform: 'facebook' });

      // Đóng success modal sau khi mở share dialog thành công
      setShowSuccessModal(false);
    } catch (error) {
      console.error('❌ [SHARE] Error in handleFacebookShare:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể chia sẻ. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
      // Đóng modal khi có lỗi
      setShowSuccessModal(false);
    }
  }, [createdWishId, sharedNoteText, shareWishMutation, toast, captureModalAndUpload]);

  return (
    <>
      {/* Share Section */}
      <div className="mt-16 rounded-[30px] border-2 border-gray-200 overflow-hidden bg-white mx-8 md:mx-8 lg:mx-32 max-w-full md:max-w-none min-h-[200px] md:min-h-[180px]">
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {/* Left Part: Text - 20% width */}
          <div 
            onClick={scrollToTextarea}
            className="p-4 md:p-6 flex items-center justify-center bg-[#00579F] md:col-span-1 relative cursor-pointer transition-all duration-300 hover:opacity-90 hover:bg-[#1f3a6b]"
            style={{
              backgroundImage: 'url(/thuthachnhipsong/bonghoa.svg)',
              backgroundPosition: 'top left',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'auto'
            }}
          >
            <h3 className="font-prata text-white text-center relative z-10 px-6 sm:px-8 md:px-0 text-3xl sm:text-4xl">
              Viết note<br />ngay!
            </h3>
          </div>

          {/* Right Part: Content - 80% width */}
          <div className="bg-[#FFFDF5] md:col-span-4 grid grid-cols-1 md:grid-cols-2 md:min-h-[180px]">
            {/* Left: Avatar, Name, Content */}
            <div className="p-4 md:p-6 space-y-3 flex flex-col justify-center">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/thuthachnhipsong/slide_example.png"
                    alt="User avatar"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <span className="text-lg font-medium text-gray-700">
                  Hanh Nguyen
                </span>
              </div>

              {/* Note */}
              <div>
                <p className="text-gray-700 leading-relaxed text-base">
                Trong bối cảnh thị trường biến động nhanh, việc cập nhật kiến thức, tối ưu quy trình và ra quyết định dựa trên dữ liệu là yếu tố then chốt giúp tổ chức duy trì hiệu quả và phát triển bền vững lâu dài.
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex items-end justify-end pr-0 pb-0">
              <div 
                className="relative overflow-hidden w-full"
              >
                <Image
                  src="/thuthachnhipsong/buaangiadinh.png"
                  alt="Bữa ăn gia đình"
                  width={500}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Note Section */}
      <div className="mt-16 text-center px-6 sm:px-8 md:px-0">
        <h2 className="font-prata text-3xl sm:text-4xl lg:text-5xl mb-6" style={{ color: '#00579F' }}>
          Viết note giữ nhịp!
        </h2>
        <p className="text-gray-700 max-w-7xl mx-auto text-left md:text-center leading-relaxed" style={{ fontSize: '16px' }}>
          Giữ nhịp đâu chỉ dừng lại ở bữa trưa. Bạn có lời nhắc nào muốn gửi đến chính mình, hay gửi
          đến một người quan trong. Đôi khi chỉ cần vài đôi điều ngắn gọn - cũng đủ trở thành nhịp
          sống dịu dàng cho cả bạn và người khác
        </p>
      </div>

     
        {/* Highlighted Notes Section */}
        <div 
          ref={zoneCRef}
          id="highlighted-notes-section"
          className="mt-4 mb-8 mx-6 md:mx-24 min-h-fit bg-center md:bg-[top_right] rounded-3xl md:max-h-[650px] lg:max-h-[800px]  "
          style={{
            backgroundImage: 'url(/thuthachnhipsong/highlightedNote_background.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            // position: 'relative',
            // top:'15px'
          }}
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-8 min-h-[500px]">
          {/* Left: Image, TextArea, Button */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="space-y-4 flex flex-col w-[80%]">
              {/* Image - LCP element, preload with priority */}
              <div className="relative w-full overflow-visible mt-6">
                  <Image
                    src="/thuthachnhipsong/giadinhancom.png"
                    alt="Giadinhancom"
                    width={1000}
                    height={600}
                    className="w-full h-auto object-contain md:ml-[2px]"
                    style={{
                      backgroundSize: 'cover',
                      backgroundPosition: 'top',

                    }}
                    priority
                    fetchPriority="high"
                  />
              </div>

              {/* TextArea */}
              <textarea
                id="share-note-textarea"
                ref={noteTextareaRef}
                value={noteText}
                onChange={(e) => {
                  // Track note start (funnel step 1) - chỉ track một lần
                  if (!hasStartedTyping && e.target.value.length > 0) {
                    setHasStartedTyping(true);
                    trackFunnelStep('challenge', 'zoneC', 'note', 'start');
                  }
                  // Không trim - giữ nguyên giá trị người dùng nhập
                  setNoteText(e.target.value);
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
                placeholder="Câu chuyện của bạn thì sao? Chia sẻ cùng mình nhé!"
                rows={3}
                className="w-[90%] mx-auto px-4 py-3 border border-white/30 rounded-lg resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 font-nunito backdrop-blur-sm"
                style={{ 
                  backgroundColor: '#FFFFFF1A',
                  color: '#DCDCDC'
                }}
              />

              {/* Button */}
              <Button
                onClick={handleShareNote}
                disabled={createWishMutation.isPending}
                className="w-[90%] mx-auto font-medium py-3 rounded-lg transition-all duration-300 cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#ffffff', color: '#00579F' }}
              >
                {createWishMutation.isPending ? 'Đang gửi...' : 'Chia sẻ ngay!'}
              </Button>
            </div>
          </div>

          {/* Right: Highlighted Notes - Scrollable with Virtuoso */}
          <div 
            className="h-[600px] lg:h-[700px] 2xl:h-[900px] w-full pr-2"
            onWheel={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            onMouseDown={handleUserInteraction}
          >
            {isLoadingWishes ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white text-sm">Đang tải...</div>
              </div>
            ) : wishes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white text-sm text-center">
                  Chưa có lời chúc nào được highlight
                </div>
              </div>
            ) : (
              <Virtuoso
                ref={virtuosoRef}
                data={wishes}
                endReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                className="[&::-webkit-scrollbar]:hidden"
                style={{ height: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                itemContent={(index, wish) => (
                  <WishCard wish={wish} index={index} />
                )}
                components={{
                  Footer: () => isFetchingNextPage ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="text-white text-xs">Đang tải thêm...</div>
                    </div>
                  ) : null
                }}
              />
            )}
          </div>
        </div>
      </div>

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
                ref={modalRef}
                className="rounded-2xl shadow-xl max-w-2xl w-full overflow-y-auto pointer-events-auto"
                style={{
                  backgroundImage: 'url(/thuthachnhipsong/popup_share_note_background.svg)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  {/* Tiger Logo - Centered Top */}
                  <div className="flex justify-center mb-6">
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
                    className="text-center mb-8 font-prata"
                    style={{
                      fontFamily: 'Prata',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '16px',
                      lineHeight: '20px',
                      letterSpacing: '0.03em',
                      color: '#00579F'
                    }}
                  >
                    Nhịp sống của bạn đã được gửi đi!
                  </h2>

                  {/* Content Box - Wraps both text and image */}
                  <div 
                    className="mb-8 p-3 rounded-lg mx-auto" 
                    style={{ 
                      border: '1px solid',
                      borderImageSource: 'linear-gradient(180deg, #CCF5FF 0%, #B2DCFF 100%)',
                      borderImageSlice: 1,
                      maxWidth: '80%',
                      width: '100%'
                    }}
                  >
                    {/* Text Content - Blue background, white text */}
                    <div 
                      className="mb-6 p-6 rounded-lg"
                      style={{ 
                        backgroundColor: '#00579F',
                        color: '#ffffff'
                      }}
                    >
                      <p 
                        className="font-nunito leading-relaxed"
                        style={{
                          fontFamily: 'Nunito',
                          fontWeight: 500,
                          fontStyle: 'italic',
                          fontSize: '14px',
                          lineHeight: '24px',
                          letterSpacing: '-0.02em',
                          color: '#ffffff'
                        }}
                      >
                        &quot;{sharedNoteText}&quot;
                      </p>
                    </div>

                    {/* TRĂM NĂM GIỮ TRỌN nhịp sống */}
                    <div className="flex justify-center">
                      <Image
                        src="/thuthachnhipsong/tramnamgiunhipsong.png"
                        alt="Trăm năm giữ trọn nhịp sống"
                        width={240}
                        height={72}
                        className="max-w-[100px] md:max-w-[140px]"
                        sizes="(max-width: 768px) 100px, 140px"
                        quality={90}
                      />
                    </div>
                  </div>

                  {/* Info Text */}
                  <p 
                    className="text-left md:text-center mb-8 font-nunito mx-auto"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '14px',
                      letterSpacing: '-0.05em',
                      color: '#00579F',
                      maxWidth: '70%'
                    }}
                  >
                    TIGER đã giữ nhịp cho hàng triệu gia đình suốt trăm năm qua. Hãy cùng khám phá hành trình của TIGER
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-center mx-auto" style={{ maxWidth: '70%' }}>
                    <Button
                      onClick={() => {
                        setShowSuccessModal(false);
                        router.push('/nhip-bep');
                      }}
                      className="font-nunito transition-all duration-300 flex-1"
                      style={{ 
                        height: '40px',
                        borderRadius: '8px',
                        paddingTop: '8px',
                        paddingRight: '16px',
                        paddingBottom: '8px',
                        paddingLeft: '16px',
                        backgroundColor: '#00579F',
                        color: '#ffffff',
                        fontFamily: 'Nunito',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: '24px'
                      }}
                    >
                      Khám phá về TIGER
                    </Button>
                    <Button
                      onClick={handleFacebookShare}
                      disabled={shareWishMutation.isPending || !createdWishId || isGeneratingImage}
                      className="font-nunito transition-all duration-300 flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
                      style={{ 
                        backgroundColor: '#ffffff',
                        color: '#00579F',
                        border: '1px solid #00579F',
                        fontFamily: 'Nunito',
                        fontWeight: 700,
                        fontSize: '16px',
                        lineHeight: '24px',
                        height: '40px',
                        borderRadius: '8px',
                        paddingTop: '8px',
                        paddingRight: '16px',
                        paddingBottom: '8px',
                        paddingLeft: '16px'
                      }}
                    >
                      {isGeneratingImage ? 'Đang tạo ảnh...' : 'Chia sẻ'}
                      <Image
                        src="/icons/facebook.svg"
                        alt="Facebook"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

