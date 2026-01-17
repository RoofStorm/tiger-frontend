'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/hooks/use-toast';
import { getCroppedImage } from '@/lib/imageUtils';

const ASPECT_4_3 = 4 / 3; // Ngang
const ASPECT_3_4 = 3 / 4; // Dọc

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  originalFileName: string;
}

export function CropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  originalFileName,
}: CropModalProps) {
  const { toast } = useToast();
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  // Tạm thời chỉ cho phép crop dọc (3:4)
  const aspect = ASPECT_3_4; // Cố định 3:4 (dọc)
  // const [aspect, setAspect] = useState<number>(ASPECT_3_4); // Mặc định 3:4 (dọc)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) {
      return;
    }

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage(imageSrc, croppedAreaPixels);
      // Chuẩn hóa tên file: đổi extension thành .jpg vì đã convert sang JPEG
      const newFileName = originalFileName.replace(/\.\w+$/, '.jpg');
      const croppedFile = new File([croppedBlob], newFileName, {
        type: 'image/jpeg',
      });
      onCropComplete(croppedFile);
      onClose();
    } catch (error) {
      console.error('Crop failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cắt ảnh. Vui lòng thử lại.';
      toast({
        title: 'Lỗi cắt ảnh',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // setAspect(ASPECT_3_4); // Không cần vì aspect đã cố định
    setCroppedAreaPixels(null);
    onClose();
  };

  // Lưu ý: Parent component (LunchboxUploadSection) quản lý việc revoke ObjectURL
  // Không cần cleanup ở đây để tránh revoke quá sớm làm ảnh không hiển thị

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      showCloseButton={true}
      showHeader={true}
      headerTitle=""
      maxWidth="lg"
      closeOnBackdropClick={false}
    >
      <div className="space-y-4">
        {/* Aspect Ratio Selector - Tạm thời comment out, chỉ cho phép crop dọc (3:4) */}
        {/* <div className="flex gap-4 justify-center">
          <button
            onClick={() => setAspect(ASPECT_4_3)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              aspect === ASPECT_4_3
                ? 'bg-[#00579F] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            type="button"
          >
            4:3 (Ngang)
          </button>
          <button
            onClick={() => setAspect(ASPECT_3_4)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              aspect === ASPECT_3_4
                ? 'bg-[#00579F] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            type="button"
          >
            3:4 (Dọc)
          </button>
        </div> */}
        
        {/* Hiển thị thông báo tỉ lệ cố định */}
        {/* <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Tỉ lệ: 3:4 (Dọc)
          </p>
        </div> */}

        {/* Cropper Container */}
        <div className="relative w-full" style={{ height: '400px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                position: 'relative',
              },
            }}
          />
        </div>

        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Phóng to / Thu nhỏ
          </label>
          <input
            type="range"
            min={1}
            max={2}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end px-4 pb-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || !croppedAreaPixels}
            className="bg-[#00579F] text-white hover:bg-[#004080]"
          >
            {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

