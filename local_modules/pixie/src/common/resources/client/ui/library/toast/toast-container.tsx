import {AnimatePresence, m, Target, TargetAndTransition} from 'framer-motion';
import React from 'react';
import clsx from 'clsx';
import {IconButton} from '@ui/buttons/icon-button';
import {CloseIcon} from '@ui/icons/material/Close';
import {MixedText} from '@ui/i18n/mixed-text';
import {Button} from '@ui/buttons/button';
import {toastState, useToastStore} from './toast-store';
import {Link} from 'react-router-dom';
import {ErrorOutlineIcon} from '@ui/icons/material/ErrorOutline';
import {CheckCircleIcon} from '@ui/icons/material/CheckCircle';
import {ProgressCircle} from '@ui/progress/progress-circle';

const initial: Target = {opacity: 0, y: 50, scale: 0.3};
const animate: TargetAndTransition = {opacity: 1, y: 0, scale: 1};
const exit: TargetAndTransition = {
  opacity: 0,
  scale: 0.5,
};

export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);

  return (
    <div className="pointer-events-none relative">
      <AnimatePresence initial={false}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={clsx(
              'fixed z-toast mx-auto p-20',
              toast.position === 'bottom-center'
                ? 'bottom-0 left-0 right-0'
                : 'bottom-0 right-0',
            )}
          >
            <m.div
              initial={toast.disableEnterAnimation ? undefined : initial}
              animate={toast.disableEnterAnimation ? undefined : animate}
              exit={toast.disableExitAnimation ? undefined : exit}
              className={clsx(
                'pointer-events-auto mx-auto flex max-h-100 min-h-50 w-min min-w-288 max-w-500 items-center gap-10 rounded-lg border bg-paper bg-paper py-6 pl-16 pr-6 text-sm text-main shadow-lg',
              )}
              onPointerEnter={() => toast.timer?.pause()}
              onPointerLeave={() => toast.timer?.resume()}
              role="alert"
              aria-live={toast.type === 'danger' ? 'assertive' : 'polite'}
            >
              {toast.type === 'danger' && (
                <ErrorOutlineIcon
                  className="flex-shrink-0 text-danger"
                  size="md"
                />
              )}
              {toast.type === 'loading' && (
                <ProgressCircle
                  size="sm"
                  className="flex-shrink-0"
                  isIndeterminate
                />
              )}
              {toast.type === 'positive' && (
                <CheckCircleIcon
                  className="flex-shrink-0 text-positive"
                  size="md"
                />
              )}

              <div
                className="mr-auto w-max overflow-hidden overflow-ellipsis"
                data-testid="toast-message"
              >
                <MixedText value={toast.message} />
              </div>

              {toast.action && (
                <Button
                  variant="text"
                  color="primary"
                  size="sm"
                  className="flex-shrink-0"
                  onFocus={() => toast.timer?.pause()}
                  onBlur={() => toast.timer?.resume()}
                  onClick={() => toastState().remove(toast.id)}
                  elementType={Link}
                  to={toast.action.action}
                >
                  <MixedText value={toast.action.label} />
                </Button>
              )}
              {toast.type !== 'loading' && (
                <IconButton
                  onFocus={() => toast.timer?.pause()}
                  onBlur={() => toast.timer?.resume()}
                  type="button"
                  className="flex-shrink-0"
                  onClick={() => {
                    toastState().remove(toast.id);
                  }}
                  size="sm"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </m.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
