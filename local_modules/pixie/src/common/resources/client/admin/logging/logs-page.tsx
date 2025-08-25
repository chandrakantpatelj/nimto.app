import {Tabs} from '@ui/tabs/tabs';
import {Tab} from '@ui/tabs/tab';
import {Trans} from '@ui/i18n/trans';
import {TabList} from '@ui/tabs/tab-list';
import {Link, Outlet, useLocation} from 'react-router-dom';

const tabs = ['schedule', 'error', 'outgoing-email'];

export function LogsPage() {
  const {pathname} = useLocation();
  const activeTab = pathname.split('/').pop() as string;
  const activeIndex = tabs.includes(activeTab) ? tabs.indexOf(activeTab) : 0;
  return (
    <Tabs className="p-12 md:p-24" selectedTab={activeIndex}>
      <TabList>
        <Tab elementType={Link} to="/admin/logs/schedule" replace>
          <Trans message="Schedule" />
        </Tab>
        <Tab elementType={Link} to="/admin/logs/error" replace>
          <Trans message="Error" />
        </Tab>
        <Tab elementType={Link} to="/admin/logs/outgoing-email" replace>
          <Trans message="Email" />
        </Tab>
      </TabList>
      <Outlet />
    </Tabs>
  );
}
