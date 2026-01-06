'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

// Re-define types locally to avoid module resolution issues during refactor
export interface Wish {
  id: string;
  content: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
  isFromCache?: boolean;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
}

// Type for cursor-based pagination response from API
export interface WishPage {
  success: boolean;
  data: Wish[];
  nextCursor: string | null;
  message?: string;
}

import { WishCard } from './WishCard';
import { ShareNoteSuccessModal } from './ShareNoteSuccessModal';

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

  // Fetch highlighted wishes with useInfiniteQuery (Cursor-based)
  const { 
    data: infiniteWishesData, 
    isLoading: isLoadingWishes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['highlighted-wishes-share-note-infinite'],
    queryFn: ({ pageParam }) => apiClient.getHighlightedWishes(pageParam as string | null, 15),
    initialPageParam: null,
    getNextPageParam: (lastPage: WishPage) => lastPage.nextCursor,
    staleTime: 60 * 1000,
  });

  // Flatten the wishes from pages and limit to 150 items for performance
  const wishes = useMemo(() => {
    if (!infiniteWishesData) return [];
    
    const allWishes = infiniteWishesData.pages.flatMap(page => {
      const pageData = Array.isArray(page) ? page : (page?.data || []);
      return Array.isArray(pageData) ? pageData : [];
    });

    // Keep only the last 150 items to prevent memory issues with long auto-scroll
    return allWishes.slice(-150);
  }, [infiniteWishesData]);

  // Handle user manual interaction to pause auto-scroll
  const handleUserInteraction = useCallback(() => {
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setUserInteracted(true);
    }
  }, [isAutoScrolling]);

  // Extract hooks for clarity - added isFetchingNextPage to pause auto-scroll during load
  // Added hasNextPage to support looping when reached end of data
  const { handleAtBottom } = useAutoScroll(virtuosoRef, isAutoScrolling, wishes.length, isFetchingNextPage, hasNextPage);
  useAutoScrollResume(userInteracted, setIsAutoScrolling, setUserInteracted);
  useModalBackgroundUpdate(showSuccessModal, modalRef);

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
      queryClient.invalidateQueries({ queryKey: ['highlighted-wishes-share-note-infinite'] });
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
      <div className="mt-16 rounded-[30px] border-2 border-gray-200 overflow-hidden bg-white mx-6 lg:mx-32 max-w-full md:max-w-none min-h-[200px] md:min-h-[180px]">
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
        <p className="text-gray-700 max-w-7xl mx-auto text-justify md:text-center leading-relaxed" style={{ fontSize: '16px' }}>
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
            <div className="space-y-4 flex flex-col w-[90%] lg:w-[80%]">
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
                overscan={400} // Render trước 400px để mượt hơn
                atBottomStateChange={handleAtBottom}
                rangeChanged={({ endIndex }) => {
                  const total = wishes.length;
                  if (total > 0 && total - endIndex < 8 && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
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

      <ShareNoteSuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        modalRef={modalRef}
        sharedNoteText={sharedNoteText}
        isGeneratingImage={isGeneratingImage}
        onShare={handleFacebookShare}
        isSharePending={shareWishMutation.isPending}
        hasCreatedWishId={!!createdWishId}
        onExplore={() => {
                        setShowSuccessModal(false);
                        router.push('/nhip-bep');
                      }}
      />
    </>
  );
}

// --- Custom Hooks ---

function useAutoScroll(
  virtuosoRef: React.RefObject<VirtuosoHandle | null>, 
  isAutoScrolling: boolean, 
  wishesCount: number,
  isFetchingNextPage: boolean,
  hasNextPage: boolean
) {
  const [isResettingToHead, setIsResettingToHead] = useState(false);

  useEffect(() => {
    // Pause auto-scroll while fetching more data or while resetting to head
    if (!isAutoScrolling || !wishesCount || isFetchingNextPage || isResettingToHead) return;

    const interval = setInterval(() => {
      if (virtuosoRef.current) {
        virtuosoRef.current.scrollBy({
          top: 0.7,
          behavior: 'auto',
        });
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isAutoScrolling, wishesCount, virtuosoRef, isFetchingNextPage, isResettingToHead]);

  // Handle looping logic: when reaching the end and no more pages
  const handleAtBottom = useCallback((atBottom: boolean) => {
    if (atBottom && !hasNextPage && !isFetchingNextPage && !isResettingToHead && wishesCount > 0) {
      setIsResettingToHead(true);
      
      // Pause a bit before scrolling back
      setTimeout(() => {
        if (virtuosoRef.current) {
          virtuosoRef.current.scrollToIndex({
            index: 0,
            behavior: 'smooth',
            align: 'start'
          });

          // Wait for smooth scroll to finish before resuming auto-scroll
          setTimeout(() => {
            setIsResettingToHead(false);
          }, 1500); // Approximate time for smooth scroll
        }
      }, 1000);
    }
  }, [hasNextPage, isFetchingNextPage, isResettingToHead, wishesCount, virtuosoRef]);

  return { handleAtBottom };
}

function useAutoScrollResume(
  userInteracted: boolean,
  setIsAutoScrolling: (val: boolean) => void,
  setUserInteracted: (val: boolean) => void
) {
  useEffect(() => {
    if (!userInteracted) return;

    const timeout = setTimeout(() => {
      setIsAutoScrolling(true);
      setUserInteracted(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [userInteracted, setIsAutoScrolling, setUserInteracted]);
}

function useModalBackgroundUpdate(showSuccessModal: boolean, modalRef: React.RefObject<HTMLDivElement | null>) {
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

    requestAnimationFrame(updateModalBackground);

    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [showSuccessModal, modalRef]);
}

