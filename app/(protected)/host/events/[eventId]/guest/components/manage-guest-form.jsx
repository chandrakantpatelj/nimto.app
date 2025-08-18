import React from 'react';
import { Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ManageGuestForm() {
  return (
    <>
      <div className="w-full p-4 bg-white">
        <h2 className="text-md font-medium mb-2">Add Guest</h2>

        {/* Row 1 */}
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="py-2 col-span-12 md:col-span-5">
            <Label className="text-muted-foreground">Guest Name</Label>
            <Input type="text" placeholder="e.g Jane Doe" />
          </div>
          <div className="py-2 col-span-12 md:col-span-5">
            <Label className="text-muted-foreground">Email or Phone</Label>
            <Input type="text" placeholder="e.g Jane Doe" />
          </div>
          <div className="py-2 col-span-12 md:col-span-2">
            <Button variant="primary" className="w-full">
              Add Guest
            </Button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-12 gap-4">
          <div className="py-2 col-span-12 md:col-span-6">
            <Input type="text" placeholder="Search guests..." />
          </div>
          <div className="py-2 col-span-12 md:col-span-2">
            <Button variant="primary" className="w-full">
              <Send /> Send to Selected (0)
            </Button>
          </div>
          <div className="py-2 col-span-12 md:col-span-2">
            <Button variant="secondary" mode="default" className=" w-full ">
              Send to All Unsent (1)
            </Button>
          </div>
          <div className="py-2 col-span-12 md:col-span-2">
            <Button variant="outline" mode="primary" className=" w-full ">
              <Bell /> Send Reminder (0)
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageGuestForm;
