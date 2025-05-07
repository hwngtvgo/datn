import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SimpleModal: React.FC<SimpleModalProps> = ({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  children,
  footer,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  
  const handleOpen = (value: boolean) => {
    if (!isControlled) {
      setOpen(value);
    }
    onOpenChange?.(value);
  };
  
  // Xử lý click bên ngoài modal để đóng
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  // Xử lý phím ESC để đóng modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  return (
    <>
      {trigger && (
        <div onClick={() => handleOpen(true)}>{trigger}</div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className={cn(
              "bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto",
              className
            )}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Đóng</span>
              </Button>
            </div>
            
            <div className="p-4">
              {children}
            </div>
            
            {footer && (
              <div className="p-4 border-t flex justify-end gap-2">
                {footer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleModal; 