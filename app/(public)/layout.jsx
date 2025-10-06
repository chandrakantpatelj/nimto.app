import { CommonFooter } from '@/components/common/footer';
import PropTypes from 'prop-types';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {/* <CommonFooter /> */}
    </div>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
