import PropTypes from 'prop-types';
import { CommonFooter } from '@/components/common/footer';
import { Header } from '@/app/components/layouts/demo1/components/header';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-background w-full flex flex-col">
      <Header />
      <main className="flex-1 pt-18">{children}</main>
      {/* <CommonFooter /> */}
    </div>
  );
}

PublicLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
