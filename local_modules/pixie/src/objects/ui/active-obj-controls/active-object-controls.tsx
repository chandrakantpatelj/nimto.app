import React from 'react';
import {TabList} from '@ui/tabs/tab-list';
import {Tabs} from '@ui/tabs/tabs';
import {TextStyleTabPanel} from './text-style-tab-panel';
import {TabPanel, TabPanels} from '@ui/tabs/tab-panels';
import {ColorTabPanel} from './color-tab-panel';
import {OpacityTabPanel} from './opacity-tab-panel';
import {OutlineTabPanel} from './outline-tab-panel';
import {useStore} from '../../../state/store';
import {ImageTabPanel} from './image-tab-panel';
import {ShadowTabPanel} from './shadow-tab-panel';
import {Trans} from '@ui/i18n/trans';
import {Tab} from '@ui/tabs/tab';

export function ActiveObjectControls() {
  const active = useStore(s => s.objects.active);

  return (
    <Tabs size="sm" className="pb-18 pt-6">
      <TabList center>
        {active.isText && (
          <Tab>
            <Trans message="Font" />
          </Tab>
        )}
        {!active.isImage && (
          <Tab>
            <Trans message="Color" />
          </Tab>
        )}
        {!active.isImage && (
          <Tab>
            <Trans message="Background" />
          </Tab>
        )}
        {active.isImage && (
          <Tab>
            <Trans message="Image" />
          </Tab>
        )}
        <Tab>
          <Trans message="Opacity" />
        </Tab>
        <Tab>
          <Trans message="Outline" />
        </Tab>
        <Tab>
          <Trans message="Shadow" />
        </Tab>
      </TabList>
      <TabPanels className="pt-16 h-50">
        {active.isText && (
          <TabPanel key="font">
            <TextStyleTabPanel />
          </TabPanel>
        )}
        {!active.isImage && (
          <TabPanel>
            <ColorTabPanel property="fill" />
          </TabPanel>
        )}
        {!active.isImage && (
          <TabPanel>
            <ColorTabPanel property="backgroundColor" />
          </TabPanel>
        )}
        {active.isImage && (
          <TabPanel>
            <ImageTabPanel />
          </TabPanel>
        )}
        <TabPanel>
          <OpacityTabPanel />
        </TabPanel>
        <TabPanel>
          <OutlineTabPanel />
        </TabPanel>
        <TabPanel>
          <ShadowTabPanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
