import React, {Children, Fragment, ReactElement, ReactNode} from 'react';
import {AvatarProps} from '@ui/avatar/avatar';
import clsx from 'clsx';
import {Trans} from '@ui/i18n/trans';
import {Link} from 'react-router-dom';

interface AvatarGroupProps {
  children: ReactNode;
  className?: string;
}
export function AvatarGroup(props: AvatarGroupProps) {
  const children = Children.toArray(
    props.children,
  ) as ReactElement<AvatarProps>[];

  if (!children.length) return null;

  const firstLink = children[0].props.link;
  const label = children[0].props.label;

  return (
    <div className={clsx('isolate flex items-center pl-10', props.className)}>
      <Fragment>
        {children.map((avatar, index) => (
          <div
            key={index}
            style={{zIndex: 5 - index}}
            className={clsx(
              'relative -ml-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-bg-alt bg-alt',
            )}
          >
            {avatar}
          </div>
        ))}
      </Fragment>
      <div className="ml-10 whitespace-nowrap text-sm">
        {firstLink && label ? (
          <Link to={firstLink} className="hover:underline">
            {label}
          </Link>
        ) : null}
        {children.length > 1 && (
          <span>
            {' '}
            <Trans
              message="+ :count more"
              values={{count: children.length - 1}}
            />
          </span>
        )}
      </div>
    </div>
  );
}
